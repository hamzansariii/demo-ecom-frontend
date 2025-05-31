"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

export default function ThankyouPage() {
  const params = useParams();
  const orderId = params?.orderId;

  const [order, setOrder] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/order/summary/${orderId}`
        );

        const data = response.data.order;

        const parsedCart =
          typeof data.cartDetail === "string"
            ? JSON.parse(data.cartDetail)
            : data.cartDetail;

        setOrder(data);
        setCartItems(parsedCart || []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load order details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || "Unable to fetch order summary"}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-20 text-gray-800">
      <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Thank you for your order</h1>
        <p className="text-sm text-gray-600 mb-4">
          We've received your order and will process it shortly.
        </p>

        <div className="bg-gray-100 rounded-md py-3 px-4 text-sm text-gray-700 mb-6">
          <div>
            <strong>Order ID:</strong> {order.id}
          </div>
        </div>

        <div className="text-left text-sm">
          <h2 className="font-semibold mb-3">Order Summary</h2>
          <ul className="space-y-2">
            {cartItems.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>
                  {item.productTitle} × {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="border-t pt-3 mt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        <a
          href="/"
          className="mt-6 inline-block bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  );
}
