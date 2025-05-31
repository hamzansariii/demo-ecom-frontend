"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartContext } from "@/contexts/cartContext";

export default function ProductCard({
  productTitle,
  productFeaturedImageSrc,
  productDesciption,
  variants = [],
  id,
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { cart, setCart } = useCartContext();
  const router = useRouter();

  const handleCheckout = () => {
    if (!selectedVariant) {
      alert("Please select a variant.");
      return;
    }

    const newItem = {
      productId: id,
      productTitle,
      variant: selectedVariant.variantOption,
      price: selectedVariant.variantPrice,
      quantity,
    };

    const updatedCart = [...(cart?.items || []), newItem];
    setCart({ ...cart, items: updatedCart });
    router.push("/checkout");
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-full max-w-sm flex flex-col items-center hover:shadow-lg transition duration-300 ease-in-out">
      <Image
        src={productFeaturedImageSrc}
        alt={productTitle}
        width={300}
        height={300}
        className="rounded-lg object-contain cursor-pointer"
        onClick={() => router.push(`/product/${id}`)}
      />

      <h2 className="mt-4 text-lg font-semibold text-center">{productTitle}</h2>
      <p className="text-sm text-gray-600 text-center">{productDesciption}</p>

      {selectedVariant && (
        <p className="mt-2 text-blue-600 font-bold text-xl">
          ₹{selectedVariant.variantPrice}
        </p>
      )}

      {variants.length > 0 && (
        <div className="mt-4 w-full">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Select Variant:
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`flex justify-between items-center px-3 py-2 rounded-md border text-sm font-medium transition cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-800 border-gray-300 hover:border-gray-500"
                  }`}
                >
                  <span>{variant.variantOption}</span>
                  <span className="text-xs">₹{variant.variantPrice}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="mt-4 flex items-center space-x-3">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 cursor-pointer"
        >
          −
        </button>
        <span className="font-semibold text-lg">{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 cursor-pointer"
        >
          +
        </button>
      </div>

      <button
        className="mt-6 w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold cursor-pointer"
        onClick={handleCheckout}
      >
        Buy Now
      </button>
    </div>
  );
}
