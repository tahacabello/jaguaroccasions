"use client";

import { useCart } from "@/context/CartContext";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />

      {/* Drawer Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative z-10 w-full max-w-md h-full bg-surface border-r border-border shadow-2xl flex flex-col"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-black">سلة المشتريات</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-full text-foreground/80 hover:text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 bg-surface-hover rounded-full border border-border flex items-center justify-center mb-6">
                <ShoppingBag className="w-8 h-8 text-foreground/40" />
              </div>
              <h3 className="text-lg font-bold mb-2">السلة فارغة</h3>
              <p className="text-foreground/60 text-sm mb-8 max-w-[250px]">
                لم تقم بإضافة أي مستلزمات تخرج بعد. ابدأ بالتسوق الآن!
              </p>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = "/products";
                }}
                className="btn-premium"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.mode}`}
                  className="flex gap-4 p-4 rounded-2xl glass border border-border hover:border-primary/20 transition-colors"
                >
                  {/* Item Image */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-hover border border-border shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-foreground hover:text-primary transition-colors text-sm line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id, item.mode)}
                          className="text-foreground/40 hover:text-red-400 p-1 rounded transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="inline-block text-xs px-2 py-0.5 mt-1 rounded bg-primary/10 text-primary-light font-medium">
                        {item.mode === "rent" ? "إيجار" : "شراء"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border border-border rounded-lg bg-surface overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.mode, item.quantity - 1)}
                          className="p-1.5 hover:bg-surface-hover text-foreground/60 hover:text-foreground transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.mode, item.quantity + 1)}
                          className="p-1.5 hover:bg-surface-hover text-foreground/60 hover:text-foreground transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="font-black text-primary-light text-sm">
                        {item.price * item.quantity} د.ل
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-border bg-surface-hover space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold text-foreground/75">المجموع الفرعي:</span>
              <span className="font-black text-2xl text-primary-light">{cartTotal} د.ل</span>
            </div>
            <p className="text-xs text-foreground/60 text-center">
              الأسعار تشمل الضرائب. التوصيل يتم احتسابه في صفحة الدفع.
            </p>
            <div className="flex gap-4">
              <Link
                href="/checkout"
                onClick={onClose}
                className="flex-1 btn-premium py-3.5 text-center text-sm font-bold"
              >
                إتمام الطلب والدفع
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
