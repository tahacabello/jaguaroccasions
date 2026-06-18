"use client";

import { Suspense } from "react";
import ProductDetailClient from "./ProductDetailClient";

export default function ProductPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProductDetailClient />
    </Suspense>
  );
}
