"use client";

import { useCartContext } from "@/contexts/cartContext";
import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../../components/ProductCard";
import CartPopup from "../../components/CartPopup";

export default function Home() {
  const { cart } = useCartContext();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/products`
        );
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Cart Button */}
      <CartPopup />

      {/* Hero Section */}
      <header className="w-full max-w-7xl mx-auto px-4 pt-10 pb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Explore Our Latest Tech
        </h1>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          Shop our curated collection of gadgets, hand-picked for quality and
          innovation.
        </p>
      </header>

      {/* Product Listing */}
      <main className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full max-w-7xl mx-auto px-4 pb-20">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </main>
    </div>
  );
}
