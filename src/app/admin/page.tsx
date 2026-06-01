"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BarChart3, ShoppingCart, Package, Users, TrendingUp, Edit3, Trash2, Plus, Check, RefreshCw, Lock, ArrowRight, UserCheck, Bell, Send, CheckCircle2, XCircle, TestTube2, Download } from "lucide-react";
import Image from "next/image";
import { 
  getSupabaseProducts, 
  addSupabaseProduct, 
  updateSupabaseProduct, 
  deleteSupabaseProduct, 
  getSupabaseSettings, 
  updateSupabaseSetting,
  getSupabaseProfiles,
  updateSupabaseProfile,
  uploadProductImage
} from "@/lib/supabase";
import { sendTelegramNotification, loadNotificationsFromStorage, type TelegramNotification } from "@/lib/telegram";

// Mock products state for inventory management
const initialProducts = [
  { id: "1", name: "كاب كويتي فاخر", priceSale: 375, priceRent: 85, category: "كابات التخرج", status: "متوفر", sales: 48, image: "/products/kuwaiti-cap-1.jpg" },
  { id: "2", name: "كاب تخرج مع باقة ورد", priceSale: 375, priceRent: 85, category: "كابات التخرج", status: "متوفر", sales: 35, image: "/products/kuwaiti-cap-2.jpg" },
  { id: "3", name: "كاب تخرج مع شال أحمر", priceSale: 375, priceRent: 85, category: "كابات التخرج", status: "متوفر", sales: 22, image: "/products/kuwaiti-cap-3.jpg" },
  { id: "4", name: "كاب كويتي كلاسيك Class 2026", priceSale: 375, priceRent: 85, category: "كابات التخرج", status: "متوفر", sales: 30, image: "/products/kuwaiti-cap-4.jpg" },
  { id: "5", name: "كاب تخرج مع باقة زهور", priceSale: 375, priceRent: 85, category: "كابات التخرج", status: "متوفر", sales: 28, image: "/products/kuwaiti-cap-5.jpg" },
  { id: "6", name: "طقم تخرج جماعي - شال ذهبي", priceSale: 375, priceRent: 85, category: "كابات التخرج", status: "متوفر", sales: 42, image: "/products/kuwaiti-cap-6.jpg" },
  { id: "7", name: "كاب تخرج مع بالون ذهبي", priceSale: 375, priceRent: 85, category: "كابات التخرج", status: "متوفر", sales: 19, image: "/products/kuwaiti-cap-7.jpg" },
  { id: "8", name: "كاب تخرج احتفالي", priceSale: 375, priceRent: 85, category: "كابات التخرج", status: "متوفر", sales: 15, image: "/products/kuwaiti-cap-8.jpg" },
];

// Mock orders state for order management
const initialOrders = [
  { id: "JG-849302", customer: "أحمد عبد الله الوداني", city: "طرابلس", date: "2026-05-30", total: 95, payment: "الدفع عند الاستلام", status: "pending" },
  { id: "JG-102948", customer: "محمد طارق الفرجاني", city: "بنغازي", date: "2026-05-29", total: 145, payment: "موبي كاش", status: "processing" },
  { id: "JG-749283", customer: "سارة عبد الحميد البكوش", city: "مصراتة", date: "2026-05-28", total: 60, payment: "خدمة سداد", status: "delivered" },
  { id: "JG-582910", customer: "عمر سالم الترهوني", city: "الخمس", date: "2026-05-27", total: 120, payment: "الدفع عند الاستلام", status: "cancelled" },
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [authError, setAuthError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "inventory" | "settings" | "profiles" | "notifications">("analytics");
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings state
  const [settings, setSettings] = useState<Record<string, string>>({
    contact_phone: "+218 92 123 4567",
    contact_email: "info@jaguar.ly",
    location: "ليبيا - طرابلس، شارع النصر",
    contact_location_link: "https://maps.app.goo.gl/9Zc4k2g18uH3q9pY6",
    announcement_text: "توصيل لجميع أنحاء ليبيا 🎓",
    hero_title: "لحظة تخرجك، بأرقى المعايير",
    hero_subtitle: "اكتشف مجموعتنا الحصرية من كابات التخرج، القبعات، والشالات الفاخرة. بيع وإيجار مع خدمة توصيل لجميع أنحاء ليبيا."
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Alert and feedback states
  const [validationError, setValidationError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Pagination states
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const [productsCurrentPage, setProductsCurrentPage] = useState(1);
  const [profilesCurrentPage, setProfilesCurrentPage] = useState(1);

  // Product delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Modals state for editing orders and user profiles
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // loading state for database writes
  const [isMutating, setIsMutating] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<TelegramNotification[]>([]);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<"sent" | "failed" | null>(null);

  // Check auth session on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("jaguar_admin_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Load notifications from localStorage when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const stored = loadNotificationsFromStorage();
    setNotifications(stored);
  }, [isAuthenticated]);

  // Fetch Supabase products, settings, and profiles
  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    
    Promise.all([
      getSupabaseProducts(),
      getSupabaseSettings(),
      getSupabaseProfiles()
    ]).then(([dbProducts, dbSettings, dbProfiles]) => {
      setProducts(dbProducts);
      setSettings(dbSettings);
      setProfiles(dbProfiles);
      setIsLoading(false);
    }).catch(err => {
      console.error("Error fetching data from Supabase in admin dashboard:", err);
      setIsLoading(false);
    });
  }, [isAuthenticated]);

  // Load simulated checkout orders from localStorage
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const keys = Object.keys(localStorage);
      const simulatedOrders = keys
        .filter((key) => key.startsWith("simulated_order_"))
        .map((key) => {
          const ord = JSON.parse(localStorage.getItem(key) || "{}");
          return {
            id: ord.tracking_number || `JG-${ord.id.substring(0, 6)}`,
            customer: ord.guest_name,
            city: ord.guest_city,
            date: new Date(ord.created_at).toISOString().split("T")[0],
            total: ord.total_amount,
            payment: ord.payment_method === "cash_on_delivery" ? "الدفع عند الاستلام" : ord.payment_method === "sadad" ? "خدمة سداد" : "موبي كاش",
            status: ord.status || "pending",
          };
        });

      if (simulatedOrders.length > 0) {
        setOrders((prev) => {
          const filteredPrev = prev.filter(p => !simulatedOrders.some(s => s.id === p.id));
          return [...simulatedOrders, ...filteredPrev];
        });
      }
    } catch (e) {
      console.error("Error loading simulated orders in Admin panel:", e);
    }
  }, [isAuthenticated]);

  // Inventory forms state
  const [newProductName, setNewProductName] = useState("");
  const [newProductPriceSale, setNewProductPriceSale] = useState("");
  const [newProductPriceRent, setNewProductPriceRent] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("كابات التخرج");
  const [newProductImage, setNewProductImage] = useState("");
  const [newProductImageFile, setNewProductImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Authenticate Admin
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Customized admin password
    if (accessCode === "9999") {
      setIsAuthenticated(true);
      sessionStorage.setItem("jaguar_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("رمز التحقق غير صحيح، يرجى المحاولة مجدداً.");
    }
  };

  // Logout admin
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("jaguar_admin_auth");
  };

  // Handle order status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Handle adding new product with strict validation and safe try/catch error handling
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setActionError("");
    setSuccessMsg("");

    const trimmedName = newProductName.trim();
    if (!trimmedName) {
      setValidationError("اسم المنتج مطلوب ولا يمكن أن يكون فارغاً.");
      return;
    }

    if (!newProductPriceSale || !newProductPriceRent) {
      setValidationError("يرجى إدخال أسعار البيع والإيجار.");
      return;
    }

    const salePrice = parseFloat(newProductPriceSale);
    const rentPrice = parseFloat(newProductPriceRent);

    if (isNaN(salePrice) || salePrice < 0) {
      setValidationError("سعر البيع يجب أن يكون قيمة عددية موجبة.");
      return;
    }

    if (isNaN(rentPrice) || rentPrice < 0) {
      setValidationError("سعر الإيجار يجب أن يكون قيمة عددية موجبة.");
      return;
    }

    if (rentPrice > salePrice) {
      setValidationError("تحذير: لا يمكن لسعر الإيجار أن يتجاوز سعر البيع النهائي.");
      return;
    }

    const nextId = (products.length + 1).toString();
    const newProd = {
      id: nextId,
      name: trimmedName,
      priceSale: salePrice,
      priceRent: rentPrice,
      category: newProductCategory,
      categoryId: newProductCategory === "كابات التخرج" ? "gowns" : 
                  newProductCategory === "قبعات التخرج" ? "caps" : 
                  newProductCategory === "شالات التخرج" ? "sashes" : "pins",
      status: "متوفر",
      sales: 0,
      image: newProductImage.trim() || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop",
      code: `JG-00${nextId}`
    };

    setIsMutating(true);
    try {
      // Upload image first if a file was selected
      let finalImageUrl = newProductImage.trim() || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop";
      if (newProductImageFile) {
        setIsUploadingImage(true);
        finalImageUrl = await uploadProductImage(newProductImageFile);
        setIsUploadingImage(false);
      }

      const nextId = (products.length + 1).toString();
      const newProd = {
        id: nextId,
        name: trimmedName,
        priceSale: salePrice,
        priceRent: rentPrice,
        category: newProductCategory,
        categoryId: newProductCategory === "كابات التخرج" ? "gowns" : 
                    newProductCategory === "قبعات التخرج" ? "caps" : 
                    newProductCategory === "شالات التخرج" ? "sashes" : "pins",
        status: "متوفر",
        sales: 0,
        image: finalImageUrl,
        code: `JG-00${nextId}`
      };

      const success = await addSupabaseProduct(newProd);
      if (success) {
        setProducts([newProd, ...products]);
        setNewProductName("");
        setNewProductPriceSale("");
        setNewProductPriceRent("");
        setNewProductImage("");
        setNewProductImageFile(null);
        setShowAddForm(false);
        setSuccessMsg("تم إضافة المنتج للمخزون بنجاح!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setActionError("فشل في إضافة المنتج إلى قاعدة بيانات Supabase. يرجى التحقق من اتصال الشبكة.");
      }
    } catch (err) {
      console.error("Supabase product insert error:", err);
      setActionError("حدث خطأ غير متوقع أثناء حفظ المنتج في Supabase.");
    } finally {
      setIsMutating(false);
    }
  };

  // Toggle product availability status with try/catch wrapping
  const handleToggleProductStatus = async (productId: string) => {
    setValidationError("");
    setActionError("");
    setSuccessMsg("");
    
    const p = products.find(prod => prod.id === productId);
    if (!p) {
      setValidationError("المنتج المحدد غير موجود.");
      return;
    }
    
    const nextStatus = p.status === "متوفر" ? "محجوز" : p.status === "محجوز" ? "غير متوفر" : "متوفر";
    setIsMutating(true);
    try {
      const success = await updateSupabaseProduct(productId, { status: nextStatus });
      if (success) {
        setProducts((prev) =>
          prev.map((prod) => prod.id === productId ? { ...prod, status: nextStatus } : prod)
        );
        setSuccessMsg("تم تحديث حالة المنتج بنجاح!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setActionError("فشل في تحديث حالة المنتج في قاعدة البيانات. يرجى المحاولة لاحقاً.");
      }
    } catch (err) {
      console.error("Supabase update product status error:", err);
      setActionError("حدث خطأ أثناء الاتصال بقاعدة البيانات لتحديث حالة المنتج.");
    } finally {
      setIsMutating(false);
    }
  };

  // Trigger Delete Confirmation Modal
  const triggerDeleteProduct = (id: string) => {
    setValidationError("");
    setActionError("");
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  // Execute product deletion after admin confirms in Modal
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    setActionError("");
    setSuccessMsg("");
    setIsMutating(true);
    try {
      const success = await deleteSupabaseProduct(productToDelete);
      if (success) {
        setProducts(products.filter((p) => p.id !== productToDelete));
        setSuccessMsg("تم حذف المنتج بنجاح من المخزون.");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setActionError("فشل في حذف المنتج من قاعدة البيانات. يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      console.error("Supabase product deletion error:", err);
      setActionError("حدث خطأ غير متوقع أثناء حذف المنتج.");
    } finally {
      setIsMutating(false);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  // Save Site settings to Supabase with try/catch and input validations
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setActionError("");
    setIsSavingSettings(true);
    setSaveSuccess(false);

    // Validate phone number
    if (!settings.contact_phone || !settings.contact_phone.trim()) {
      setValidationError("رقم الهاتف للتواصل مطلوب.");
      setIsSavingSettings(false);
      return;
    }

    // Validate email if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (settings.contact_email && !emailRegex.test(settings.contact_email)) {
      setValidationError("البريد الإلكتروني المدخل غير صالح. يرجى كتابة عنوان بريد صحيح.");
      setIsSavingSettings(false);
      return;
    }

    // Validate announcement text length to prevent overflow in the storefront header
    if (settings.announcement_text && settings.announcement_text.length > 100) {
      setValidationError("نص الشريط الإعلاني طويل جداً (الحد الأقصى هو 100 حرف).");
      setIsSavingSettings(false);
      return;
    }

    // Validate hero title
    if (!settings.hero_title || !settings.hero_title.trim()) {
      setValidationError("عنوان الواجهة الرئيسية (Hero Title) مطلوب.");
      setIsSavingSettings(false);
      return;
    }

    // Validate location link if provided
    if (settings.contact_location_link && !settings.contact_location_link.trim().startsWith("http")) {
      setValidationError("رابط موقع الخريطة يجب أن يبدأ بـ http:// أو https://");
      setIsSavingSettings(false);
      return;
    }

    try {
      const promises = Object.entries(settings).map(([key, val]) => 
        updateSupabaseSetting(key, val)
      );
      const results = await Promise.all(promises);
      const allSuccess = results.every(res => res === true);

      if (allSuccess) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setActionError("بعض الإعدادات لم يتم تحديثها بشكل صحيح في قاعدة البيانات.");
      }
    } catch (err) {
      console.error("Error saving settings to Supabase:", err);
      setActionError("فشل الاتصال بقاعدة البيانات لحفظ إعدادات الموقع.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Save Product edits (all fields) to Supabase and React state
  const handleSaveProductEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setValidationError("");
    setActionError("");
    setSuccessMsg("");

    const trimmedName = editingProduct.name?.trim();
    if (!trimmedName) { setValidationError("اسم المنتج مطلوب."); return; }

    const salePrice = parseFloat(editingProduct.priceSale);
    const rentPrice = parseFloat(editingProduct.priceRent);
    if (isNaN(salePrice) || salePrice <= 0) { setValidationError("سعر البيع يجب أن يكون قيمة موجبة."); return; }
    if (isNaN(rentPrice) || rentPrice <= 0) { setValidationError("سعر الإيجار يجب أن يكون قيمة موجبة."); return; }
    if (rentPrice > salePrice) { setValidationError("سعر الإيجار لا يمكن أن يتجاوز سعر البيع."); return; }

    setIsMutating(true);
    try {
      const updates = {
        name: trimmedName,
        priceSale: salePrice,
        priceRent: rentPrice,
        category: editingProduct.category,
        categoryId: editingProduct.category === "كابات التخرج" ? "gowns" :
                    editingProduct.category === "قبعات التخرج" ? "caps" :
                    editingProduct.category === "شالات التخرج" ? "sashes" : "pins",
        status: editingProduct.status,
        image: editingProduct.image?.trim() || editingProduct.image,
        description: editingProduct.description || "",
        sales: parseInt(editingProduct.sales) || 0,
      };

      const success = await updateSupabaseProduct(editingProduct.id, updates);
      if (success) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updates } : p));
        setSuccessMsg("تم تحديث بيانات المنتج بنجاح!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setActionError("فشل تحديث المنتج في قاعدة البيانات.");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      setActionError("حدث خطأ أثناء تحديث المنتج.");
    } finally {
      setIsMutating(false);
      setEditingProduct(null);
    }
  };

  // Save Order details modifications (both in React state and locally persisted storage)
  const handleSaveOrderEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setValidationError("");
    setActionError("");
    setSuccessMsg("");

    const trimmedCustomer = editingOrder.customer.trim();
    if (!trimmedCustomer) {
      setValidationError("اسم العميل مطلوب.");
      return;
    }

    const trimmedCity = editingOrder.city.trim();
    if (!trimmedCity) {
      setValidationError("مدينة العميل مطلوبة.");
      return;
    }

    const orderTotal = parseFloat(editingOrder.total);
    if (isNaN(orderTotal) || orderTotal < 0) {
      setValidationError("القيمة الإجمالية للطلب غير صالحة.");
      return;
    }

    // 1. Update React state
    setOrders(prev => prev.map(o => o.id === editingOrder.id ? { ...editingOrder, customer: trimmedCustomer, city: trimmedCity, total: orderTotal } : o));

    // 2. Persist back to local storage simulated orders
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith("simulated_order_")) {
          const ord = JSON.parse(localStorage.getItem(key) || "{}");
          const trackingNum = ord.tracking_number || `JG-${ord.id.substring(0, 6)}`;
          if (trackingNum === editingOrder.id) {
            ord.guest_name = trimmedCustomer;
            ord.guest_city = trimmedCity;
            ord.total_amount = orderTotal;
            ord.status = editingOrder.status;
            ord.payment_method = editingOrder.payment === "موبي كاش" ? "mobicash" : editingOrder.payment === "خدمة سداد" ? "sadad" : "cash_on_delivery";
            localStorage.setItem(key, JSON.stringify(ord));
            break;
          }
        }
      }
      setSuccessMsg("تم تعديل الطلبية بنجاح وحفظها في قاعدة الذاكرة المحلية!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error persisting order edits to localStorage:", err);
      setActionError("فشل حفظ التعديلات في الذاكرة المحلية للطلبية.");
    }

    setEditingOrder(null);
  };

  // Save User Profile modifications directly to Supabase profiles table
  const handleSaveProfileEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    setValidationError("");
    setActionError("");
    setSuccessMsg("");

    const firstName = editingProfile.first_name?.trim();
    const lastName = editingProfile.last_name?.trim();
    const phone = editingProfile.phone_number?.trim();

    if (!firstName || !lastName) {
      setValidationError("الاسم الأول والاسم الأخير مطلوبان.");
      return;
    }

    if (!phone) {
      setValidationError("رقم الهاتف مطلوب.");
      return;
    }

    setIsMutating(true);
    try {
      const success = await updateSupabaseProfile(editingProfile.id, {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        address_line1: editingProfile.address_line1 || "",
        city: editingProfile.city || ""
      });

      if (success) {
        setProfiles(prev => prev.map(p => p.id === editingProfile.id ? { ...editingProfile, first_name: firstName, last_name: lastName, phone_number: phone } : p));
        setSuccessMsg("تم تحديث حساب الزبون بنجاح في قاعدة البيانات!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setActionError("فشل في تحديث الحساب في قاعدة البيانات. يرجى مراجعة الصلاحيات.");
      }
    } catch (err) {
      console.error("Error updating user profile in database:", err);
      setActionError("حدث خطأ أثناء الاتصال بقاعدة بيانات Supabase لتعديل الملف.");
    } finally {
      setIsMutating(false);
      setEditingProfile(null);
    }
  };

  // Export Orders to CSV
  const exportOrdersCSV = () => {
    const headers = ["رقم الطلب", "اسم العميل", "المدينة", "التاريخ", "الإجمالي", "طريقة الدفع", "الحالة"];
    const rows = orders.map(o => [
      o.id, o.customer, o.city, o.date, `${o.total} د.ل`, o.payment, o.status
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "jaguar_orders.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Export Products to CSV
  const exportProductsCSV = () => {
    const headers = ["الاسم", "الفئة", "سعر البيع", "سعر الإيجار", "الحالة", "المبيعات"];
    const rows = products.map(p => [
      p.name, p.category, `${p.priceSale} د.ل`, `${p.priceRent} د.ل`, p.status, p.sales || 0
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "jaguar_products.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Memoize Summary Metrics calculations for performance optimization
  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const pendingCount = useMemo(() => {
    return orders.filter(o => o.status === "pending").length;
  }, [orders]);

  const averageOrderValue = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== "cancelled");
    if (validOrders.length === 0) return 0;
    return Math.round(totalRevenue / validOrders.length);
  }, [orders, totalRevenue]);

  const activeProductsCount = useMemo(() => {
    return products.filter(p => p.status === "متوفر").length;
  }, [products]);

  // Orders Pagination (5 rows per page)
  const ORDERS_PER_PAGE = 5;
  const totalOrdersPages = useMemo(() => {
    return Math.ceil(orders.length / ORDERS_PER_PAGE) || 1;
  }, [orders]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (ordersCurrentPage - 1) * ORDERS_PER_PAGE;
    return orders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  }, [orders, ordersCurrentPage]);

  // Clamping page size changes
  useEffect(() => {
    if (ordersCurrentPage > totalOrdersPages) {
      setOrdersCurrentPage(1);
    }
  }, [orders.length, totalOrdersPages, ordersCurrentPage]);

  // Inventory Products Pagination (4 items per page)
  const PRODUCTS_PER_PAGE = 4;
  const totalProductsPages = useMemo(() => {
    return Math.ceil(products.length / PRODUCTS_PER_PAGE) || 1;
  }, [products]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (productsCurrentPage - 1) * PRODUCTS_PER_PAGE;
    return products.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [products, productsCurrentPage]);

  useEffect(() => {
    if (productsCurrentPage > totalProductsPages) {
      setProductsCurrentPage(1);
    }
  }, [products.length, totalProductsPages, productsCurrentPage]);

  // User Accounts Pagination (5 rows per page)
  const PROFILES_PER_PAGE = 5;
  const totalProfilesPages = useMemo(() => {
    return Math.ceil(profiles.length / PROFILES_PER_PAGE) || 1;
  }, [profiles]);

  const paginatedProfiles = useMemo(() => {
    const startIndex = (profilesCurrentPage - 1) * PROFILES_PER_PAGE;
    return profiles.slice(startIndex, startIndex + PROFILES_PER_PAGE);
  }, [profiles, profilesCurrentPage]);

  useEffect(() => {
    if (profilesCurrentPage > totalProfilesPages) {
      setProfilesCurrentPage(1);
    }
  }, [profiles.length, totalProfilesPages, profilesCurrentPage]);

  // Render Login Lock Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center pt-12 pb-24 text-start">
          <div className="container mx-auto px-4 max-w-md">
            <div className="glass p-8 rounded-3xl border border-border shadow-2xl space-y-6">
              
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary-light rounded-full border border-primary/20 mb-2">
                  <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                  الدخول الآمن للإدارة
                </h1>
                <p className="text-foreground/50 text-xs">
                  هذه الصفحة محمية. يرجى إدخال رمز التحقق الخاص بمتجر جاغوار.
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground/75">رمز التحقق للإدارة *</label>
                  <input
                    type="password"
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="أدخل الرمز السري للأدمن"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-bold text-center tracking-widest"
                  />
                </div>

                {authError && (
                  <p className="text-xs text-red-400 font-bold text-center mt-2">{authError}</p>
                )}

                <button
                  type="submit"
                  className="w-full btn-premium py-3.5 font-black text-sm flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  تأكيد الدخول
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </form>

            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Render Dashboard if authenticated
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-12 pb-24 text-start animate-fadeIn">
        <div className="container mx-auto px-4 lg:px-8">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-border pb-8">
            <div>
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                لوحة تحكم الإدارة الفاخرة
              </h1>
              <p className="text-foreground/60 text-sm">إدارة مبيعات، إيجارات ومخزون متجر جاغوار</p>
            </div>
            
            {/* Quick action buttons */}
            <div className="flex gap-4 items-center">
              <button onClick={() => window.location.reload()} className="p-3 bg-surface hover:bg-surface-hover rounded-xl border border-border hover:border-primary/50 text-foreground transition-all duration-300 cursor-pointer">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setActiveTab("inventory");
                  setShowAddForm(true);
                }}
                className="btn-premium py-3 px-6 text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                إضافة منتج جديد
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-3 rounded-xl border border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold transition-all duration-300 cursor-pointer"
              >
                تسجيل الخروج الآمن
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border border-border bg-surface p-1.5 rounded-2xl max-w-2xl mb-10 overflow-x-auto gap-2">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-primary text-black"
                  : "text-foreground/60 hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              الإحصائيات والتحليلات
            </button>
            
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 relative whitespace-nowrap cursor-pointer ${
                activeTab === "orders"
                  ? "bg-primary text-black"
                  : "text-foreground/60 hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              إدارة الطلبات
              {pendingCount > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "inventory"
                  ? "bg-primary text-black"
                  : "text-foreground/60 hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <Package className="w-4 h-4" />
              إدارة المنتجات
            </button>

            <button
              onClick={() => setActiveTab("profiles")}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "profiles"
                  ? "bg-primary text-black"
                  : "text-foreground/60 hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              الحسابات المسجلة
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "settings"
                  ? "bg-primary text-black"
                  : "text-foreground/60 hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              إعدادات الموقع
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 relative whitespace-nowrap cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-primary text-black"
                  : "text-foreground/60 hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <Bell className="w-4 h-4" />
              الإشعارات
              {notifications.length > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  {notifications.filter(n => n.status === 'failed').length > 0 
                    ? notifications.filter(n => n.status === 'failed').length 
                    : notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Validation & Action Notification Banners */}
          <div className="space-y-3 mb-6">
            {validationError && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl text-sm font-bold flex items-center gap-2 animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                {validationError}
              </div>
            )}
            {actionError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-bold flex items-center gap-2 animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
                {actionError}
              </div>
            )}
            {successMsg && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-sm font-bold flex items-center gap-2 animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-green-400 shrink-0"></span>
                {successMsg}
              </div>
            )}
          </div>

          {/* Tab Content Panel */}
          <div className="min-h-[500px]">
            
            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (
              <div className="space-y-10 animate-fadeIn">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="glass p-6 rounded-3xl border border-border flex items-center gap-5">
                    <div className="p-4 bg-primary/10 text-primary-light rounded-2xl shrink-0">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs text-foreground/60 font-bold block mb-1">إجمالي الإيرادات</span>
                      <span className="text-2xl font-black text-primary-light">{totalRevenue} د.ل</span>
                    </div>
                  </div>

                  <div className="glass p-6 rounded-3xl border border-border flex items-center gap-5">
                    <div className="p-4 bg-primary/10 text-primary-light rounded-2xl shrink-0">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs text-foreground/60 font-bold block mb-1">عدد الطلبات الإجمالي</span>
                      <span className="text-2xl font-black text-primary-light">{orders.length} طلبات</span>
                    </div>
                  </div>

                  <div className="glass p-6 rounded-3xl border border-border flex items-center gap-5">
                    <div className="p-4 bg-primary/10 text-primary-light rounded-2xl shrink-0">
                      <RefreshCw className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs text-foreground/60 font-bold block mb-1">متوسط قيمة الطلب (AOV)</span>
                      <span className="text-2xl font-black text-primary-light">{averageOrderValue} د.ل</span>
                    </div>
                  </div>

                  <div className="glass p-6 rounded-3xl border border-border flex items-center gap-5">
                    <div className="p-4 bg-primary/10 text-primary-light rounded-2xl shrink-0">
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs text-foreground/60 font-bold block mb-1">المستلزمات النشطة متوفرة</span>
                      <span className="text-2xl font-black text-primary-light">{activeProductsCount} منتجات</span>
                    </div>
                  </div>

                </div>

                {/* Additional Charts Mock */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Top selling products */}
                  <div className="glass p-6 rounded-3xl border border-border lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold">المنتجات الأكثر مبيعاً ونشاطاً</h3>
                    
                    <div className="space-y-4">
                      {products.slice(0, 4).map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-background">
                              <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm">{p.name}</h4>
                              <span className="text-xs text-foreground/50">{p.category}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                            <div className="text-left">
                              <span className="text-xs text-foreground/50 block">المبيعات</span>
                              <span className="font-bold text-sm text-primary-light">{p.sales} قطعة</span>
                            </div>
                            <div className="text-left min-w-[70px]">
                              <span className="text-xs text-foreground/50 block">الإيرادات</span>
                              <span className="font-black text-sm text-white">{p.sales * p.priceSale} د.ل</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Quick system alert */}
                  <div className="glass p-6 rounded-3xl border border-border space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-3">حالة الخادم وقاعدة البيانات</h3>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-4">
                        <Check className="w-4 h-4" />
                        نظام Supabase يعمل بشكل ممتاز
                      </div>
                      
                      <p className="text-sm text-foreground/60 leading-relaxed">
                        جميع مبيعات وإيجارات خريجي ليبيا مسجلة ومؤمنة بالكامل عن طريق سياسات أمان PostgreSQL RLS. لوحة تحكم الإدارة تتيح لك مراقبة وتعديل الطلبات فورياً.
                      </p>
                    </div>

                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 text-xs text-primary-light/95 leading-relaxed">
                      💡 **تنبيه:** يمكنك مراجعة طلبات عملائك من صفحة إتمام الطلبات وتحويل حالتها إلى "خارج للتوصيل" للبدء في شحنها.
                    </div>
                  </div>

                  {/* Sales Bar Chart */}
                  <div className="glass p-6 rounded-3xl border border-border">
                    <h3 className="text-lg font-bold mb-6">مبيعات المنتجات (بيانياً)</h3>
                    <div className="flex items-end gap-4 h-40">
                      {[...products].sort((a,b) => (b.sales||0)-(a.sales||0)).slice(0,6).map((p, idx) => {
                        const maxSales = Math.max(...products.map(x => x.sales || 1));
                        const heightPct = Math.max(8, Math.round(((p.sales || 0) / maxSales) * 100));
                        const colors = ["bg-primary","bg-primary/80","bg-primary/60","bg-primary/45","bg-primary/30","bg-primary/20"];
                        return (
                          <div key={p.id} className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-xs font-bold text-primary-light">{p.sales || 0}</span>
                            <div
                              className={`w-full rounded-t-lg ${colors[idx]} transition-all duration-500`}
                              style={{ height: `${heightPct}%` }}
                            />
                            <span className="text-[10px] text-foreground/50 text-center leading-tight line-clamp-2">{p.name.split(" ").slice(0,2).join(" ")}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="glass p-6 rounded-3xl border border-border animate-fadeIn space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-4 mb-4">
                  <h3 className="text-xl font-bold">جدول إدارة الطلبات</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground/60">
                      عدد الطلبات المسجلة: {orders.length}
                    </span>
                    <button
                      onClick={exportOrdersCSV}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border hover:bg-primary hover:text-black hover:border-primary transition-all text-sm font-bold"
                    >
                      <Download className="w-4 h-4" />
                      تحميل CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse">
                    <thead>
                      <tr className="border-b border-border text-foreground/60 font-bold text-sm">
                        <th className="py-4 px-4 text-start">رقم الطلب</th>
                        <th className="py-4 px-4 text-start">اسم العميل</th>
                        <th className="py-4 px-4 text-start">المدينة</th>
                        <th className="py-4 px-4 text-start">التاريخ</th>
                        <th className="py-4 px-4 text-start">الإجمالي</th>
                        <th className="py-4 px-4 text-start">الدفع</th>
                        <th className="py-4 px-4 text-start">الحالة</th>
                        <th className="py-4 px-4 text-start">تعديل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-semibold text-sm">
                      {paginatedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-surface-hover/30 transition-colors">
                          <td className="py-4 px-4 font-black text-primary-light text-start">{order.id}</td>
                          <td className="py-4 px-4 text-start">{order.customer}</td>
                          <td className="py-4 px-4 text-start">{order.city}</td>
                          <td className="py-4 px-4 text-start text-xs font-mono">{order.date}</td>
                          <td className="py-4 px-4 text-start text-primary-light font-black">{order.total} د.ل</td>
                          <td className="py-4 px-4 text-start text-xs text-foreground/70">{order.payment}</td>
                          <td className="py-4 px-4 text-start">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs border focus:outline-none focus:border-primary cursor-pointer ${
                                order.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                order.status === "processing" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                order.status === "delivered" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}
                            >
                              <option value="pending" className="bg-surface text-foreground">معلق (Pending)</option>
                              <option value="processing" className="bg-surface text-foreground">قيد التجهيز</option>
                              <option value="delivered" className="bg-surface text-foreground">تم التسليم</option>
                              <option value="cancelled" className="bg-surface text-foreground">ملغي</option>
                            </select>
                          </td>
                          <td className="py-4 px-4 text-start">
                            <button
                              onClick={() => setEditingOrder({ ...order })}
                              className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary-light border border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                              title="تعديل تفاصيل الطلبية"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Orders Table Pagination controls */}
                {totalOrdersPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border pt-6 mt-4 flex-wrap gap-4" dir="rtl">
                    <button
                      onClick={() => setOrdersCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={ordersCurrentPage === 1}
                      className="px-4 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover hover:border-primary/50 disabled:opacity-40 disabled:hover:bg-surface disabled:hover:border-border transition-all text-xs font-bold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="w-3.5 h-3.5 ltr:rotate-180" />
                      السابق
                    </button>
                    
                    <span className="text-xs font-bold text-foreground/60">
                      الصفحة {ordersCurrentPage} من {totalOrdersPages}
                    </span>

                    <button
                      onClick={() => setOrdersCurrentPage(prev => Math.min(prev + 1, totalOrdersPages))}
                      disabled={ordersCurrentPage === totalOrdersPages}
                      className="px-4 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover hover:border-primary/50 disabled:opacity-40 disabled:hover:bg-surface disabled:hover:border-border transition-all text-xs font-bold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                    >
                      التالي
                      <ArrowRight className="w-3.5 h-3.5 rotate-180 ltr:rotate-0" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === "inventory" && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Form to add a new product */}
                {showAddForm && (
                  <form onSubmit={handleAddProduct} className="glass p-6 rounded-3xl border border-primary/20 bg-primary/5 space-y-6">
                    <h3 className="text-lg font-bold border-b border-border pb-3">إدخال مستلزم تخرج جديد</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/60">اسم المنتج</label>
                        <input
                          type="text"
                          required
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          placeholder="مثال: شال ملكي مطرز"
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/60">سعر البيع النهائي (د.ل)</label>
                        <input
                          type="number"
                          required
                          value={newProductPriceSale}
                          onChange={(e) => setNewProductPriceSale(e.target.value)}
                          placeholder="مثال: 95"
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/60">سعر الإيجار للمناسبة (د.ل)</label>
                        <input
                          type="number"
                          required
                          value={newProductPriceRent}
                          onChange={(e) => setNewProductPriceRent(e.target.value)}
                          placeholder="مثال: 45"
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                        />
                      </div>
                    </div>

                    {/* Image Upload field */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">صورة المنتج</label>
                      
                      {/* File Upload Button */}
                      <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-surface cursor-pointer transition-all group">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <Plus className="w-4 h-4 text-primary-light" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground/80">
                            {newProductImageFile ? newProductImageFile.name : "اختر صورة من جهازك"}
                          </p>
                          <p className="text-[10px] text-foreground/40">JPG, PNG, WEBP — حتى 5MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setNewProductImageFile(f);
                              setNewProductImage(URL.createObjectURL(f));
                            }
                          }}
                        />
                      </label>

                      {/* Preview */}
                      {newProductImage && (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border">
                          <Image src={newProductImage} alt="معاينة" fill className="object-cover" sizes="400px" />
                          <button
                            type="button"
                            onClick={() => { setNewProductImage(""); setNewProductImageFile(null); }}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 rounded-lg text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* OR URL fallback */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] text-foreground/40 font-bold">أو أدخل رابطاً</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      <input
                        type="url"
                        value={newProductImageFile ? "" : newProductImage}
                        onChange={(e) => { setNewProductImage(e.target.value); setNewProductImageFile(null); }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-40"
                        dir="ltr"
                        disabled={!!newProductImageFile}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/60">قسم المنتجات</label>
                        <select
                          value={newProductCategory}
                          onChange={(e) => setNewProductCategory(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-bold"
                        >
                          <option value="كابات التخرج">كابات التخرج</option>
                          <option value="قبعات التخرج">قبعات التخرج</option>
                          <option value="شالات التخرج">شالات التخرج</option>
                          <option value="بروشات التخرج">بروشات التخرج</option>
                        </select>
                      </div>

                      <div className="flex items-end gap-4">
                        <button type="submit" disabled={isMutating} className="btn-premium flex-1 py-3 text-sm font-bold cursor-pointer">
                          {isMutating ? "جاري الإرسال..." : "إضافة المنتج للمخزون"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-6 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-sm font-bold transition-all duration-300 cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Inventory Table */}
                <div className="glass p-6 rounded-3xl border border-border">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">قائمة المخزون</h3>
                    {!showAddForm && (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-surface hover:bg-primary hover:text-black border border-border hover:border-primary transition-all rounded-xl text-sm font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة منتج
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paginatedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex gap-4 p-4 rounded-2xl bg-surface border border-border hover:border-primary/20 transition-all duration-300 items-center justify-between"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-background shrink-0">
                            <Image src={p.image} alt={p.name} fill sizes="64px" className="object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-base">{p.name}</h4>
                            <span className="text-xs text-foreground/50 block mb-1">{p.category}</span>
                            <div className="flex gap-4 text-xs font-semibold mt-1">
                              <span className="text-primary-light">بيع: {p.priceSale} د.ل</span>
                              <span className="text-primary-light/80">إيجار: {p.priceRent} د.ل</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleProductStatus(p.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                              p.status === "متوفر" ? "bg-green-500/10 text-green-400" :
                              p.status === "محجوز" ? "bg-amber-500/10 text-amber-400" :
                              "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {p.status}
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingProduct({ ...p })}
                              className="p-2 hover:bg-primary/10 text-foreground/40 hover:text-primary-light border border-transparent hover:border-primary/20 rounded-lg transition-colors cursor-pointer"
                              title="تعديل المنتج"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => triggerDeleteProduct(p.id)}
                              className="p-2 hover:bg-red-500/10 text-foreground/40 hover:text-red-400 border border-transparent hover:border-red-500/20 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Inventory Products Pagination controls */}
                  {totalProductsPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border pt-6 mt-6 flex-wrap gap-4" dir="rtl">
                      <button
                        onClick={() => setProductsCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={productsCurrentPage === 1}
                        className="px-4 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover hover:border-primary/50 disabled:opacity-40 disabled:hover:bg-surface disabled:hover:border-border transition-all text-xs font-bold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowRight className="w-3.5 h-3.5 ltr:rotate-180" />
                        السابق
                      </button>
                      
                      <span className="text-xs font-bold text-foreground/60">
                        الصفحة {productsCurrentPage} من {totalProductsPages}
                      </span>

                      <button
                        onClick={() => setProductsCurrentPage(prev => Math.min(prev + 1, totalProductsPages))}
                        disabled={productsCurrentPage === totalProductsPages}
                        className="px-4 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover hover:border-primary/50 disabled:opacity-40 disabled:hover:bg-surface disabled:hover:border-border transition-all text-xs font-bold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                      >
                        التالي
                        <ArrowRight className="w-3.5 h-3.5 rotate-180 ltr:rotate-0" />
                      </button>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn text-start">
                
                {/* Left: Editor Form */}
                <form onSubmit={handleSaveSettings} className="glass p-8 rounded-3xl border border-border space-y-6">
                  <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
                    <h3 className="text-xl font-bold">تعديل نصوص وأرقام الموقع</h3>
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-6 py-2.5 bg-primary text-black rounded-xl font-bold text-sm hover:bg-primary-light transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingSettings ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </button>
                  </div>

                  {saveSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      تم حفظ التغييرات وتحديثها لدى جميع المستخدمين بنجاح!
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-primary-light border-s-2 border-primary ps-2">الشريط الإعلاني والواجهة</h4>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">نص الإعلان العلوي</label>
                      <input
                        type="text"
                        value={settings.announcement_text || ""}
                        onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">صورة خلفية الواجهة الرئيسية (Hero Image)</label>
                      <input
                        type="url"
                        value={settings.hero_image || ""}
                        onChange={(e) => setSettings({ ...settings, hero_image: e.target.value })}
                        placeholder="https://images.unsplash.com/... أو رابط صورة مباشر"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                        dir="ltr"
                      />
                      <p className="text-[10px] text-foreground/40">صورة تظهر في خلفية قسم البانر في أعلى الصفحة الرئيسية. اتركها فارغة للخلفية الافتراضية.</p>
                      {settings.hero_image && (
                        <div className="relative w-full h-24 rounded-xl overflow-hidden border border-border mt-2">
                          <Image src={settings.hero_image} alt="معاينة Hero" fill className="object-cover" sizes="600px" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">عنوان الواجهة الرئيسية (Hero Title)</label>
                      <input
                        type="text"
                        value={settings.hero_title || ""}
                        onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">الوصف المساعد في الواجهة</label>
                      <textarea
                        rows={3}
                        value={settings.hero_subtitle || ""}
                        onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-bold text-primary-light border-s-2 border-primary ps-2">معلومات التواصل والتذييل</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/60">رقم الهاتف للتواصل</label>
                        <input
                          type="text"
                          value={settings.contact_phone || ""}
                          onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                          dir="ltr"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="block text-xs font-bold text-foreground/60">البريد الإلكتروني</label>
                        <input
                          type="email"
                          value={settings.contact_email || ""}
                          onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">عنوان وموقع المحل (شارع النصر)</label>
                      <input
                        type="text"
                        value={settings.location || ""}
                        onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">رابط خريطة Google Maps (للفوتر)</label>
                      <input
                        type="url"
                        value={settings.contact_location_link || ""}
                        onChange={(e) => setSettings({ ...settings, contact_location_link: e.target.value })}
                        placeholder="https://maps.app.goo.gl/..."
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Telegram Bot Settings */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-bold text-primary-light border-s-2 border-primary ps-2">🤖 إشعارات تيليجرام (للهاتف)</h4>
                    <p className="text-xs text-foreground/50 leading-relaxed">
                      عند إدخال بيانات بوت تيليجرام، ستصلك رسالة فورية لكل طلبية جديدة على هاتفك.
                    </p>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">Bot Token (من BotFather)</label>
                      <input
                        type="text"
                        value={settings.telegram_bot_token || ""}
                        onChange={(e) => setSettings({ ...settings, telegram_bot_token: e.target.value })}
                        placeholder="1234567890:ABCDEFGHijklmnopqrstuvwxyz"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">Chat ID (معرف الدردشة)</label>
                      <input
                        type="text"
                        value={settings.telegram_chat_id || ""}
                        onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })}
                        placeholder="مثال: -1001234567890 أو 123456789"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-mono"
                        dir="ltr"
                      />
                    </div>

                    {/* Test Notification Button */}
                    <button
                      type="button"
                      disabled={isSendingTest || !settings.telegram_bot_token || !settings.telegram_chat_id}
                      onClick={async () => {
                        setIsSendingTest(true);
                        setTestResult(null);
                        const ok = await sendTelegramNotification(
                          settings.telegram_bot_token || "",
                          settings.telegram_chat_id || "",
                          `🧪 *اختبار إشعارات جاغوار*\n\nإذا وصلتك هذه الرسالة فإن الربط يعمل بشكل صحيح! ✅\n\nوقت الاختبار: ${new Date().toLocaleString("ar-LY")}`
                        );
                        setTestResult(ok ? "sent" : "failed");
                        setIsSendingTest(false);
                        setTimeout(() => setTestResult(null), 5000);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary-light text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <TestTube2 className="w-4 h-4" />
                      {isSendingTest ? "جاري الإرسال..." : "إرسال إشعار تجريبي"}
                    </button>

                    {testResult && (
                      <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        testResult === "sent"
                          ? "bg-green-500/10 border border-green-500/20 text-green-400"
                          : "bg-red-500/10 border border-red-500/20 text-red-400"
                      }`}>
                        {testResult === "sent" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {testResult === "sent" ? "تم إرسال الإشعار التجريبي بنجاح! تحقق من هاتفك." : "فشل إرسال الإشعار — تحقق من صحة Bot Token و Chat ID."}
                      </div>
                    )}
                  </div>
                </form>

                {/* Right: Live Visual Preview */}
                <div className="glass p-8 rounded-3xl border border-border space-y-6 flex flex-col">
                  <h3 className="text-xl font-bold border-b border-border pb-4">👁️ معاينة حية للموقع (المظهر عند المستخدمين)</h3>
                  
                  <div className="flex-1 flex flex-col justify-between border border-border rounded-2xl bg-background overflow-hidden min-h-[380px] shadow-2xl relative text-start">
                    
                    {/* Preview Announcement Bar */}
                    <div className="bg-primary/10 text-primary-light text-center py-1 text-[10px] font-bold border-b border-primary/20">
                      {settings.announcement_text}
                    </div>

                    {/* Preview Header Logo */}
                    <div className="p-3 border-b border-border bg-surface/50 flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground/50">JAGUAR Occasions</span>
                      <div className="flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-border"></div>
                        <div className="w-5 h-5 rounded-full bg-border"></div>
                      </div>
                    </div>

                    {/* Preview Hero Content */}
                    <div className="p-6 text-center space-y-3 my-auto">
                      <h1 className="text-xl font-black text-white leading-tight">{settings.hero_title}</h1>
                      <p className="text-xs text-foreground/60 leading-relaxed max-w-sm mx-auto">{settings.hero_subtitle}</p>
                      <div className="inline-block px-4 py-1.5 bg-primary text-black rounded-lg text-[10px] font-bold shadow-md shadow-primary/20 cursor-pointer">
                        تصفح المتجر
                      </div>
                    </div>

                    {/* Preview Footer content */}
                    <div className="p-4 bg-surface border-t border-border text-[10px] text-foreground/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">تواصل معنا:</span>
                        <span>{settings.location}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>هاتف: {settings.contact_phone}</span>
                        <span>بريد: {settings.contact_email}</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* PROFILES TAB */}
            {activeTab === "profiles" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold">إدارة الحسابات المسجلة</h3>
                    <p className="text-sm text-foreground/60 mt-1">عرض وتعديل بيانات العملاء المسجلين في قاعدة البيانات</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground/60">
                    إجمالي الحسابات: {profiles.length}
                  </span>
                </div>

                {profiles.length === 0 ? (
                  <div className="glass p-12 rounded-3xl border border-border flex flex-col items-center justify-center gap-4 text-center">
                    <div className="p-6 bg-surface rounded-full">
                      <Users className="w-12 h-12 text-foreground/20" />
                    </div>
                    <h4 className="text-lg font-bold text-foreground/50">لا توجد حسابات مسجلة</h4>
                    <p className="text-sm text-foreground/40 max-w-sm">
                      ستظهر الحسابات هنا عندما يسجل العملاء في الموقع. تأكد من ربط جدول profiles في Supabase.
                    </p>
                  </div>
                ) : (
                  <div className="glass p-6 rounded-3xl border border-border space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-start border-collapse">
                        <thead>
                          <tr className="border-b border-border text-foreground/60 font-bold text-sm">
                            <th className="py-4 px-4 text-start">الاسم الكامل</th>
                            <th className="py-4 px-4 text-start">رقم الهاتف</th>
                            <th className="py-4 px-4 text-start">المدينة</th>
                            <th className="py-4 px-4 text-start">العنوان</th>
                            <th className="py-4 px-4 text-start">تاريخ التسجيل</th>
                            <th className="py-4 px-4 text-start">تعديل</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 font-semibold text-sm">
                          {paginatedProfiles.map((profile) => (
                            <tr key={profile.id} className="hover:bg-surface-hover/30 transition-colors">
                              <td className="py-4 px-4 font-bold">
                                {profile.first_name} {profile.last_name}
                              </td>
                              <td className="py-4 px-4 text-foreground/70 font-mono text-xs" dir="ltr">
                                {profile.phone_number || "—"}
                              </td>
                              <td className="py-4 px-4">{profile.city || "—"}</td>
                              <td className="py-4 px-4 text-foreground/60 text-xs max-w-[180px] truncate">
                                {profile.address_line1 || "—"}
                              </td>
                              <td className="py-4 px-4 text-xs font-mono text-foreground/50">
                                {profile.created_at ? new Date(profile.created_at).toLocaleDateString("ar-LY") : "—"}
                              </td>
                              <td className="py-4 px-4">
                                <button
                                  onClick={() => setEditingProfile({ ...profile })}
                                  className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary-light border border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                                  title="تعديل بيانات الحساب"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Profiles Pagination */}
                    {totalProfilesPages > 1 && (
                      <div className="flex items-center justify-between border-t border-border pt-6 mt-4 flex-wrap gap-4" dir="rtl">
                        <button
                          onClick={() => setProfilesCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={profilesCurrentPage === 1}
                          className="px-4 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover hover:border-primary/50 disabled:opacity-40 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowRight className="w-3.5 h-3.5 ltr:rotate-180" />
                          السابق
                        </button>
                        <span className="text-xs font-bold text-foreground/60">
                          الصفحة {profilesCurrentPage} من {totalProfilesPages}
                        </span>
                        <button
                          onClick={() => setProfilesCurrentPage(prev => Math.min(prev + 1, totalProfilesPages))}
                          disabled={profilesCurrentPage === totalProfilesPages}
                          className="px-4 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover hover:border-primary/50 disabled:opacity-40 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                        >
                          التالي
                          <ArrowRight className="w-3.5 h-3.5 rotate-180 ltr:rotate-0" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}

            {activeTab === "notifications" && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Header */}
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold">سجل إشعارات تيليجرام</h3>
                    <p className="text-sm text-foreground/60 mt-1">كل طلب جديد يُرسل إشعاراً لهاتفك عبر تيليجرام بوت</p>
                  </div>
                  <div className="flex gap-3">
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("هل تريد مسح سجل الإشعارات بالكامل؟")) {
                            localStorage.removeItem("jaguar_notifications");
                            setNotifications([]);
                          }
                        }}
                        className="px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold transition-all cursor-pointer"
                      >
                        مسح السجل
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass p-5 rounded-2xl border border-border flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary-light rounded-xl shrink-0">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-foreground/60 block mb-0.5">إجمالي الإشعارات</span>
                      <span className="text-2xl font-black text-primary-light">{notifications.length}</span>
                    </div>
                  </div>
                  <div className="glass p-5 rounded-2xl border border-border flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 text-green-400 rounded-xl shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-foreground/60 block mb-0.5">تم الإرسال</span>
                      <span className="text-2xl font-black text-green-400">{notifications.filter(n => n.status === 'sent').length}</span>
                    </div>
                  </div>
                  <div className="glass p-5 rounded-2xl border border-border flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 text-red-400 rounded-xl shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-foreground/60 block mb-0.5">فشل الإرسال</span>
                      <span className="text-2xl font-black text-red-400">{notifications.filter(n => n.status === 'failed').length}</span>
                    </div>
                  </div>
                </div>

                {/* Setup Guide if no telegram config */}
                {!settings.telegram_bot_token && (
                  <div className="glass p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 space-y-4">
                    <h4 className="text-base font-bold text-amber-400 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      كيفية تفعيل إشعارات تيليجرام على هاتفك
                    </h4>
                    <ol className="space-y-3 text-sm text-foreground/80 leading-relaxed list-decimal list-inside">
                      <li>افتح تيليجرام وابحث عن <strong className="text-primary-light">@BotFather</strong></li>
                      <li>أرسل <code className="bg-surface px-2 py-0.5 rounded text-xs font-mono">/newbot</code> واتبع التعليمات لإنشاء بوت جديد</li>
                      <li>انسخ الـ <strong>Bot Token</strong> الذي يعطيك إياه BotFather</li>
                      <li>ابدأ محادثة مع بوتك ثم اذهب إلى <code className="bg-surface px-2 py-0.5 rounded text-xs font-mono">api.telegram.org/bot&#123;TOKEN&#125;/getUpdates</code> للحصول على الـ Chat ID</li>
                      <li>أدخل الـ Token و Chat ID في <button onClick={() => setActiveTab('settings')} className="text-primary-light underline font-bold cursor-pointer">صفحة الإعدادات</button> واحفظها</li>
                    </ol>
                  </div>
                )}

                {/* Notifications List */}
                {notifications.length === 0 ? (
                  <div className="glass p-12 rounded-3xl border border-border flex flex-col items-center justify-center gap-4 text-center">
                    <div className="p-6 bg-surface rounded-full">
                      <Bell className="w-12 h-12 text-foreground/20" />
                    </div>
                    <h4 className="text-lg font-bold text-foreground/50">لا توجد إشعارات بعد</h4>
                    <p className="text-sm text-foreground/40 max-w-sm">
                      عندما يضع العميل طلباً جديداً، ستظهر الإشعارات هنا وتصل لهاتفك فوراً.
                    </p>
                  </div>
                ) : (
                  <div className="glass p-6 rounded-3xl border border-border space-y-4">
                    <h4 className="text-base font-bold border-b border-border pb-3">آخر الإشعارات المرسلة</h4>
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${
                            notif.status === 'sent'
                              ? 'bg-green-500/5 border-green-500/15'
                              : 'bg-red-500/5 border-red-500/15'
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            notif.status === 'sent' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {notif.status === 'sent' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-black text-sm text-primary-light">{notif.orderId}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                notif.status === 'sent'
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-red-500/10 text-red-400'
                              }`}>
                                {notif.status === 'sent' ? '✅ تم الإرسال' : '❌ فشل الإرسال'}
                              </span>
                            </div>
                            <p className="text-sm font-semibold mt-1">{notif.customerName} — {notif.city}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-foreground/60">
                              <span>{notif.total} د.ل</span>
                              <span>•</span>
                              <span>{notif.paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : notif.paymentMethod === 'sadad' ? 'سداد' : 'موبي كاش'}</span>
                              <span>•</span>
                              <span className="font-mono text-[11px]">{new Date(notif.timestamp).toLocaleString('ar-LY', { timeZone: 'Africa/Tripoli', hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {notif.status === 'failed' && (
                              <button
                                onClick={async () => {
                                  const ok = await sendTelegramNotification(
                                    settings.telegram_bot_token || "",
                                    settings.telegram_chat_id || "",
                                    notif.message
                                  );
                                  if (ok) {
                                    setNotifications(prev => prev.map(n =>
                                      n.id === notif.id ? { ...n, status: 'sent' } : n
                                    ));
                                    const updated = notifications.map(n => n.id === notif.id ? { ...n, status: 'sent' as const } : n);
                                    localStorage.setItem('jaguar_notifications', JSON.stringify(updated));
                                  } else {
                                    setActionError('فشل إعادة الإرسال — تحقق من إعدادات البوت.');
                                    setTimeout(() => setActionError(''), 3000);
                                  }
                                }}
                                className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary-light hover:text-primary transition-colors cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                إعادة الإرسال
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      </main>
      <Footer />

      {/* Product Delete Confirmation Modal with luxury glassmorphism */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass max-w-md w-full p-6 rounded-3xl border border-red-500/25 bg-surface shadow-2xl space-y-6 text-start" dir="rtl">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-red-400">تأكيد حذف المنتج</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من المخزون؟ هذه العملية لا يمكن التراجع عنها وستقوم بإزالة المنتج فورياً من الموقع.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProductToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-sm font-bold transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isMutating}
                className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-black transition-all cursor-pointer flex items-center gap-2"
              >
                {isMutating ? "جاري الحذف..." : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="glass max-w-xl w-full p-7 rounded-3xl border border-primary/25 bg-surface shadow-2xl space-y-5 text-start my-4" dir="rtl">
            <div>
              <h3 className="text-xl font-black text-primary-light">🛍️ تعديل بيانات المنتج</h3>
              <p className="text-xs text-foreground/50 mt-1">الكود: <span className="font-mono font-bold">{editingProduct.code || editingProduct.id}</span></p>
            </div>

            <form onSubmit={handleSaveProductEdits} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground/60">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground/60">رابط صورة المنتج (URL)</label>
                <input
                  type="url"
                  value={editingProduct.image || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                  dir="ltr"
                />
                {editingProduct.image && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border mt-2">
                    <Image src={editingProduct.image} alt="معاينة" fill className="object-cover" sizes="400px" />
                  </div>
                )}
                <p className="text-[10px] text-foreground/40">ارفع الصورة على imgbb.com أو استخدم رابطاً مباشراً من unsplash.com</p>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/60">سعر البيع (د.ل) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.priceSale || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceSale: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/60">سعر الإيجار (د.ل) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.priceRent || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceRent: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/60">القسم</label>
                  <select
                    value={editingProduct.category || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-bold"
                  >
                    <option value="كابات التخرج">كابات التخرج</option>
                    <option value="قبعات التخرج">قبعات التخرج</option>
                    <option value="شالات التخرج">شالات التخرج</option>
                    <option value="بروشات التخرج">بروشات التخرج</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/60">الحالة</label>
                  <select
                    value={editingProduct.status || "متوفر"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-bold"
                  >
                    <option value="متوفر">✅ متوفر</option>
                    <option value="محجوز">⏳ محجوز</option>
                    <option value="غير متوفر">❌ غير متوفر</option>
                  </select>
                </div>
              </div>

              {/* Sales count — controls homepage trending order */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground/60">
                  عدد المبيعات <span className="text-primary-light">(يحدد ترتيب الأكثر مبيعاً في الواجهة)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingProduct.sales ?? 0}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sales: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                />
                <p className="text-[10px] text-foreground/40">المنتجات ذات الأعلى مبيعات تظهر أولاً في قسم "الأكثر طلباً" في الصفحة الرئيسية</p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground/60">وصف المنتج</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold leading-relaxed"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-sm font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-black text-sm font-black transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  {isMutating ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass max-w-lg w-full p-7 rounded-3xl border border-primary/25 bg-surface shadow-2xl space-y-6 text-start" dir="rtl">
            <div>
              <h3 className="text-xl font-black text-primary-light">✏️ تعديل الطلبية</h3>
              <p className="text-xs text-foreground/50 mt-1">رقم الطلب: <span className="font-mono font-bold">{editingOrder.id}</span></p>
            </div>

            <form onSubmit={handleSaveOrderEdits} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/60">اسم العميل</label>
                  <input
                    type="text"
                    value={editingOrder.customer}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customer: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/60">المدينة</label>
                  <input
                    type="text"
                    value={editingOrder.city}
                    onChange={(e) => setEditingOrder({ ...editingOrder, city: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/60">المجموع الإجمالي (د.ل)</label>
                  <input
                    type="number"
                    value={editingOrder.total}
                    onChange={(e) => setEditingOrder({ ...editingOrder, total: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/60">طريقة الدفع</label>
                  <select
                    value={editingOrder.payment}
                    onChange={(e) => setEditingOrder({ ...editingOrder, payment: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-bold"
                  >
                    <option value="الدفع عند الاستلام">الدفع عند الاستلام</option>
                    <option value="خدمة سداد">خدمة سداد</option>
                    <option value="موبي كاش">موبي كاش</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground/60">حالة الطلب</label>
                <select
                  value={editingOrder.status}
                  onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border font-bold focus:outline-none focus:border-primary ${
                    editingOrder.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                    editingOrder.status === "processing" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                    editingOrder.status === "delivered" ? "bg-green-500/10 text-green-400 border-green-500/30" :
                    "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  <option value="pending" className="bg-surface text-foreground">⏳ معلق</option>
                  <option value="processing" className="bg-surface text-foreground">🔄 قيد التجهيز</option>
                  <option value="delivered" className="bg-surface text-foreground">✅ تم التسليم</option>
                  <option value="cancelled" className="bg-surface text-foreground">❌ ملغي</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-sm font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-black text-sm font-black transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass max-w-lg w-full p-7 rounded-3xl border border-primary/25 bg-surface shadow-2xl space-y-6 text-start" dir="rtl">
            <div>
              <h3 className="text-xl font-black text-primary-light">👤 تعديل بيانات الحساب</h3>
              <p className="text-xs text-foreground/50 mt-1">معرف الحساب: <span className="font-mono">{editingProfile.id}</span></p>
            </div>

            <form onSubmit={handleSaveProfileEdits} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/60">الاسم الأول</label>
                  <input
                    type="text"
                    value={editingProfile.first_name || ""}
                    onChange={(e) => setEditingProfile({ ...editingProfile, first_name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/60">اسم العائلة</label>
                  <input
                    type="text"
                    value={editingProfile.last_name || ""}
                    onChange={(e) => setEditingProfile({ ...editingProfile, last_name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/60">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={editingProfile.phone_number || ""}
                    onChange={(e) => setEditingProfile({ ...editingProfile, phone_number: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/60">المدينة</label>
                  <input
                    type="text"
                    value={editingProfile.city || ""}
                    onChange={(e) => setEditingProfile({ ...editingProfile, city: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground/60">العنوان التفصيلي</label>
                <input
                  type="text"
                  value={editingProfile.address_line1 || ""}
                  onChange={(e) => setEditingProfile({ ...editingProfile, address_line1: e.target.value })}
                  placeholder="الحي، الشارع، علامة مميزة..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-semibold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-sm font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-black text-sm font-black transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  {isMutating ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
