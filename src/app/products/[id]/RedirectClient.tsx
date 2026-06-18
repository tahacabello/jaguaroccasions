"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectClient({ id }: { id: string }) {
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/product?id=${id}`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
