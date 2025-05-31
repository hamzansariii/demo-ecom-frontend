"use client";

import { useCartContext } from "@/contexts/cartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, setCart } = useCartContext();
  const items = cart?.items || [];
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "expiry") {
      let cleaned = value.replace(/[^0-9]/g, "");
      if (cleaned.length > 2) {
        cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
      }
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else if (name === "cvv") {
      const numeric = value.replace(/\D/g, "").slice(0, 3);
      setFormData((prev) => ({ ...prev, [name]: numeric }));
    } else if (name === "cardNumber") {
      const numeric = value.replace(/\D/g, "").slice(0, 16);
      setFormData((prev) => ({ ...prev, [name]: numeric }));
    } else if (name === "phone") {
      const numeric = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numeric }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const errs = {};
    const cardNum = formData.cardNumber.replace(/\s/g, "");

    if (!formData.fullName.trim()) errs.fullName = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Invalid email format";
    if (!/^\d{10}$/.test(formData.phone))
      errs.phone = "Phone must be 10 digits";
    if (!formData.address.trim()) errs.address = "Address is required";
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.state.trim()) errs.state = "State is required";
    if (!/^\d{5,6}$/.test(formData.zip)) errs.zip = "Invalid ZIP Code";

    if (!/^[1-3]$/.test(cardNum) && !/^\d{16}$/.test(cardNum))
      errs.cardNumber = "Card number must be 16 digits";

    if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      errs.expiry = "Expiry must be in MM/YY format";
    } else {
      const [mm, yy] = formData.expiry.split("/").map(Number);
      const expDate = new Date(`20${yy}`, mm);
      if (expDate < new Date()) errs.expiry = "Card is expired";
    }

    if (!/^\d{3}$/.test(formData.cvv)) errs.cvv = "CVV must be 3 digits";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/place-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: formData,
            cartItems: items,
            totalAmount: total,
          }),
        }
      );

      const result = await res.json();

      if (res.status === 201) {
        setCart({ items: [] });
        router.push(`/thankyou/${result.orderId}`);
      } else if (res.status === 402) {
        setMessage("Transaction declined by bank.");
      } else if (res.status === 502) {
        setMessage("Payment gateway error. Please try again.");
      } else {
        throw new Error(result.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Order error:", err.message);
      setMessage("Order failed. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Checkout</h2>

          {message && (
            <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800 border border-yellow-300 text-sm text-center font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
            </div>

            <InputField
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />
            <TextareaField
              label="Shipping Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
              />
              <InputField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
              />
              <InputField
                label="ZIP Code"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                error={errors.zip}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Payment Info
              </h3>
              <InputField
                name="cardNumber"
                placeholder="Card Number"
                value={formData.cardNumber}
                onChange={handleChange}
                error={errors.cardNumber}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  name="expiry"
                  placeholder="MM/YY"
                  value={formData.expiry}
                  onChange={handleChange}
                  error={errors.expiry}
                />
                <InputField
                  name="cvv"
                  placeholder="CVV"
                  value={formData.cvv}
                  onChange={handleChange}
                  error={errors.cvv}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`mt-6 bg-blue-600 text-white py-2 px-4 rounded-md font-medium transition ${
                isSubmitting
                  ? "cursor-not-allowed opacity-70"
                  : "hover:bg-blue-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm h-fit border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Order Summary
          </h3>
          {items.length > 0 ? (
            <>
              <ul className="space-y-4 mb-4 text-sm text-gray-700">
                {items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{item.productTitle}</div>
                      <div className="text-xs text-gray-500">
                        {item.variant} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-semibold">
                      ₹{item.price * item.quantity}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-4">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Your cart is empty.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, type = "text", error, ...props }) {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        className="input-field"
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function TextareaField({ label, name, error, ...props }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        className="input-field"
        rows={3}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
