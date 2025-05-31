"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartContext } from "@/contexts/cartContext";
import { X } from "lucide-react";

export default function CartPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, setCart } = useCartContext();
  const router = useRouter();

  const items = cart?.items || [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const toggleCart = () => setIsOpen((prev) => !prev);
  const goToCheckout = () => router.push("/checkout");

  const removeItem = (indexToRemove) => {
    const updatedItems = items.filter((_, index) => index !== indexToRemove);
    setCart({ ...cart, items: updatedItems });
  };

  return (
    <>
      {/* Floating cart button */}
      <button
        onClick={toggleCart}
        className="fixed top-5 right-5 z-50 flex items-center px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        Cart ({totalItems})
      </button>

      {/* Cart panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 w-80 max-h-[70vh] bg-white shadow-xl rounded-lg p-4 z-50 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Your Cart</h3>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Cart is empty.</p>
          ) : (
            <ul className="space-y-3 overflow-y-auto max-h-52 pr-1">
              {items.map((item, index) => (
                <li key={index} className="relative border-b pb-2 text-sm pr-6">
                  <div className="font-medium text-gray-900">
                    {item.productTitle}
                  </div>
                  <div className="text-gray-600">
                    {item.variant} × {item.quantity} = ₹
                    {item.price * item.quantity}
                  </div>

                  {/* Remove item button */}
                  <button
                    onClick={() => removeItem(index)}
                    className="absolute top-0 right-0 text-gray-400 hover:text-red-500 transition"
                    title="Remove item"
                  >
                    <X size={16} />
                    {/* Or replace with: <span className="text-sm">❌</span> */}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <>
              <div className="mt-4 flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>

              <button
                onClick={goToCheckout}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium"
              >
                Checkout
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
