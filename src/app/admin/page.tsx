"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  BarChart3, ShoppingCart, Package, Users, TrendingUp, Search, Eye, Edit3, Trash2, Plus, Check, RefreshCw, Lock, ArrowRight, LayoutGrid, X, Upload, MessageCircle, Settings, Image as ImageIcon, Star, EyeOff
} from "lucide-react";
import Image from "next/image";
import { 
  supabase,
  getSupabaseProducts, 
  addSupabaseProduct, 
  updateSupabaseProduct, 
  deleteSupabaseProduct, 
  getSupabaseSettings, 
  updateSupabaseSetting,
  getSupabaseCategories,
  addSupabaseCategory,
  updateSupabaseCategory,
  deleteSupabaseCategory,
  getSupabaseSubcategories,
  addSupabaseSubcategory,
  updateSupabaseSubcategory,
  deleteSupabaseSubcategory,
  getSupabaseOrders,
  updateSupabaseOrderDetails,
  deleteSupabaseOrder,
  getSupabaseCustomerProfiles,
  uploadProductImage,
  resolveAssetPath
} from "@/lib/supabase";

const statusTranslations: Record<string, string> = {
  new_order: "طلب جديد",
  waiting_confirmation: "بانتظار التأكيد",
  confirmed: "تم التأكيد",
  preparing: "قيد التجهيز",
  ready: "جاهز للتسليم",
  reserved: "محجوز",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  new_order: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  waiting_confirmation: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  preparing: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  ready: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  reserved: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

// Client-side high-efficiency image compression helper returning Blob
const compressImageFile = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(blob || file);
          }, "image/jpeg", 0.7);
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "inventory" | "settings" | "categories" | "customers">("analytics");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings state
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal Editing States
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form Adding States
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [showAddProdModal, setShowAddProdModal] = useState(false);

  // Dynamic input states for categories
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catSortOrder, setCatSortOrder] = useState(0);
  const [catIsActive, setCatIsActive] = useState(true);
  const [uploadingCatImg, setUploadingCatImg] = useState(false);

  // Dynamic input states for subcategories
  const [subName, setSubName] = useState("");
  const [subCatId, setSubCatId] = useState("");
  const [subSortOrder, setSubSortOrder] = useState(0);
  const [subIsActive, setSubIsActive] = useState(true);

  // Dynamic input states for products
  const [prodName, setProdName] = useState("");
  const [prodPriceSale, setProdPriceSale] = useState(0);
  const [prodPriceRent, setProdPriceRent] = useState(0);
  const [prodDescription, setProdDescription] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodSubcategoryId, setProdSubcategoryId] = useState("");
  const [prodCode, setProdCode] = useState("");
  const [prodStock, setProdStock] = useState(10);
  const [prodStatus, setProdStatus] = useState("available");
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsHidden, setProdIsHidden] = useState(false);
  const [prodImage, setProdImage] = useState(""); // cover photo
  const [prodImages, setProdImages] = useState<string[]>([]); // gallery URLs
  const [prodSortOrder, setProdSortOrder] = useState(0);
  const [uploadingProdImg, setUploadingProdImg] = useState(false);
  const [uploadingGalleryImg, setUploadingGalleryImg] = useState(false);

  // Check auth session on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("jaguar_admin_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all Supabase data
  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      const [dbProducts, dbSettings, dbCategories, dbSubcategories, dbOrders, dbCustomers] = await Promise.all([
        getSupabaseProducts(),
        getSupabaseSettings(),
        getSupabaseCategories(),
        getSupabaseSubcategories(),
        getSupabaseOrders(),
        getSupabaseCustomerProfiles()
      ]);
      
      setProducts(dbProducts);
      setSettings(dbSettings);
      setCategoriesList(dbCategories);
      setSubcategoriesList(dbSubcategories);
      setOrders(dbOrders);
      setCustomers(dbCustomers);
    } catch (err) {
      console.error("Error refreshing database tables in admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
    }
  }, [isAuthenticated]);

  // Handle Admin Sign In (Passcode `9999` only)
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      // Reverted to simple passcode '9999' check as requested by the user
      if (password === "9999") {
        sessionStorage.setItem("jaguar_admin_auth", "true");
        setIsAuthenticated(true);
      } else {
        setAuthError("رمز المرور غير صحيح! يرجى إدخال الرمز الصحيح للدخول.");
      }
    } catch (err: any) {
      console.error("Admin sign in failed:", err);
      setAuthError("خطأ أثناء تسجيل الدخول. يرجى المحاولة مجدداً.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out admin
  const handleAdminSignOut = async () => {
    sessionStorage.removeItem("jaguar_admin_auth");
    setIsAuthenticated(false);
    setPassword("");
  };

  // Upload image handlers (Canvas compression + Supabase storage bucket)
  const handleImageUpload = async (file: File, context: "cat" | "prod-cover" | "prod-gallery") => {
    try {
      if (context === "cat") setUploadingCatImg(true);
      if (context === "prod-cover") setUploadingProdImg(true);
      if (context === "prod-gallery") setUploadingGalleryImg(true);

      const compressedBlob = await compressImageFile(file);
      const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" });
      
      const publicUrl = await uploadProductImage(compressedFile, context);
      
      if (context === "cat") setCatImage(publicUrl);
      if (context === "prod-cover") setProdImage(publicUrl);
      if (context === "prod-gallery") setProdImages(prev => [...prev, publicUrl]);

    } catch (e) {
      console.error("Upload error:", e);
      alert("فشل رفع الصورة السحابية");
    } finally {
      setUploadingCatImg(false);
      setUploadingProdImg(false);
      setUploadingGalleryImg(false);
    }
  };

  // Dynamic form submissions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSaveSuccess(false);

    try {
      const promises = Object.entries(settings).map(([key, value]) => 
        updateSupabaseSetting(key, value)
      );
      await Promise.all(promises);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Order Details / Status Updater
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const success = await updateSupabaseOrderDetails(editingOrder.id, {
      guest_name: editingOrder.guest_name,
      guest_phone: editingOrder.guest_phone,
      guest_backup_phone: editingOrder.guest_backup_phone,
      guest_city: editingOrder.guest_city,
      guest_street: editingOrder.guest_street,
      guest_address_detail: editingOrder.guest_address_detail,
      customer_notes: editingOrder.customer_notes,
      status: editingOrder.status,
      total_amount: editingOrder.total_amount
    });

    if (success) {
      setEditingOrder(null);
      refreshAllData();
    } else {
      alert("فشل تحديث بيانات الطلب");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك بحذف هذا الطلب بشكل نهائي ودائم؟")) return;
    const success = await deleteSupabaseOrder(orderId);
    if (success) {
      refreshAllData();
    } else {
      alert("فشل حذف الطلب");
    }
  };

  // Categories CRUD
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    const success = await addSupabaseCategory({
      name: catName,
      desc: catDesc,
      image: catImage,
      sort_order: catSortOrder,
      is_active: catIsActive
    });

    if (success) {
      setShowAddCatModal(false);
      setCatName("");
      setCatDesc("");
      setCatImage("");
      setCatSortOrder(0);
      refreshAllData();
    } else {
      alert("فشل إضافة القسم");
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const success = await updateSupabaseCategory(editingCategory.id, {
      name: editingCategory.name,
      desc: editingCategory.desc,
      image: catImage || editingCategory.image, // use newly uploaded or existing
      sort_order: editingCategory.sort_order,
      is_active: editingCategory.is_active
    });

    if (success) {
      setEditingCategory(null);
      setCatImage("");
      refreshAllData();
    } else {
      alert("فشل تعديل القسم");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("تحذير: سيؤدي حذف القسم لحذف جميع الأقسام الفرعية التابعة له! هل تود الاستمرار؟")) return;
    const success = await deleteSupabaseCategory(id);
    if (success) {
      refreshAllData();
    } else {
      alert("فشل حذف القسم");
    }
  };

  // Subcategories CRUD
  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subCatId) return;

    const success = await addSupabaseSubcategory({
      name: subName,
      category_id: subCatId,
      sort_order: subSortOrder,
      is_active: subIsActive
    });

    if (success) {
      setShowAddSubModal(false);
      setSubName("");
      setSubCatId("");
      setSubSortOrder(0);
      refreshAllData();
    } else {
      alert("فشل إضافة القسم الفرعي");
    }
  };

  const handleEditSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubcategory) return;

    const success = await updateSupabaseSubcategory(editingSubcategory.id, {
      name: editingSubcategory.name,
      category_id: editingSubcategory.category_id,
      sort_order: editingSubcategory.sort_order,
      is_active: editingSubcategory.is_active
    });

    if (success) {
      setEditingSubcategory(null);
      refreshAllData();
    } else {
      alert("فشل تعديل القسم الفرعي");
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم الفرعي؟")) return;
    const success = await deleteSupabaseSubcategory(id);
    if (success) {
      refreshAllData();
    } else {
      alert("فشل حذف القسم الفرعي");
    }
  };

  // Products CRUD
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodCategoryId) return;

    const res = await addSupabaseProduct({
      name: prodName,
      priceSale: prodPriceSale,
      priceRent: prodPriceRent,
      description: prodDescription,
      categoryId: prodCategoryId,
      subcategoryId: prodSubcategoryId || null,
      code: prodCode,
      stockQuantity: prodStock,
      status: prodStatus,
      isFeatured: prodIsFeatured,
      isHidden: prodIsHidden,
      image: prodImage,
      images: prodImages,
      sortOrder: prodSortOrder
    });

    if (res.success) {
      setShowAddProdModal(false);
      setProdName("");
      setProdPriceSale(0);
      setProdPriceRent(0);
      setProdDescription("");
      setProdCategoryId("");
      setProdSubcategoryId("");
      setProdCode("");
      setProdStock(10);
      setProdStatus("available");
      setProdIsFeatured(false);
      setProdIsHidden(false);
      setProdImage("");
      setProdImages([]);
      setProdSortOrder(0);
      refreshAllData();
    } else {
      alert(`فشل إضافة المنتج: ${res.error}`);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const res = await updateSupabaseProduct(editingProduct.id, {
      name: editingProduct.name,
      priceSale: editingProduct.priceSale,
      priceRent: editingProduct.priceRent,
      description: editingProduct.description,
      categoryId: editingProduct.categoryId,
      subcategoryId: editingProduct.subcategoryId || null,
      code: editingProduct.code,
      stockQuantity: editingProduct.stockQuantity,
      status: editingProduct.status,
      isFeatured: editingProduct.isFeatured,
      isHidden: editingProduct.isHidden,
      image: prodImage || editingProduct.image,
      images: prodImages.length > 0 ? prodImages : editingProduct.images,
      sortOrder: editingProduct.sortOrder
    });

    if (res.success) {
      setEditingProduct(null);
      setProdImage("");
      setProdImages([]);
      refreshAllData();
    } else {
      alert("فشل تعديل المنتج");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("هل تود حذف هذا المنتج نهائياً من قاعدة البيانات؟")) return;
    const success = await deleteSupabaseProduct(id);
    if (success) {
      refreshAllData();
    } else {
      alert("فشل حذف المنتج");
    }
  };

  // Helper to prefill product edit form states
  const openEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProdImage(prod.image);
    setProdImages(prod.images || []);
  };

  // Helper to prefill category edit form states
  const openEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCatImage(cat.image);
  };

  // Analytics Helpers
  const totalSales = orders.filter(o => o.status !== "cancelled").reduce((acc, curr) => acc + Number(curr.total_amount), 0);
  const activeProducts = products.filter(p => !p.isHidden).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 text-right">
        <div className="w-full max-w-md glass p-8 rounded-2xl border border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-transparent to-primary"></div>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black">لوحة تحكم المسؤول</h1>
            <p className="text-sm text-foreground/60 mt-1">سجل دخولك ببيانات الإدارة للتحكم في محتويات الموقع</p>
          </div>

          {authError && (
            <div className="p-4 mb-4 text-xs font-bold text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl">
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground/80 mb-2">رمز المرور الخاص بالإدارة</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-center tracking-widest font-black"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="btn-premium w-full mt-4 py-3 font-bold flex justify-center items-center gap-2"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  دخول للوحة التحكم
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-12 pb-24 text-right">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          
          {/* Admin Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6 mb-10">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                لوحة تحكم المسؤول (جاغوار)
              </h1>
              <p className="text-xs text-foreground/60 mt-1">إدارة الأقسام، المنتجات، المعارض، الفواتير، الحسابات والطلبيات بالكامل</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={refreshAllData}
                className="p-3 bg-surface hover:bg-surface-hover rounded-xl border border-border flex items-center justify-center text-foreground transition-all"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleAdminSignOut}
                className="px-5 py-3 rounded-xl border border-red-500/20 bg-red-950/5 hover:bg-red-500/10 text-red-400 font-bold text-xs transition-all"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-2 border-b border-border/40 pb-4 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-5 py-3 rounded-xl font-bold text-xs shrink-0 transition-all ${
                activeTab === "analytics" ? "bg-primary text-black" : "bg-surface hover:bg-surface-hover text-foreground/75"
              }`}
            >
              <BarChart3 className="w-4 h-4 inline-block ml-2" />
              الإحصائيات العامة
            </button>
            
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-3 rounded-xl font-bold text-xs shrink-0 transition-all ${
                activeTab === "orders" ? "bg-primary text-black" : "bg-surface hover:bg-surface-hover text-foreground/75"
              }`}
            >
              <ShoppingCart className="w-4 h-4 inline-block ml-2" />
              إدارة الطلبات
              <span className="mr-2 bg-black/10 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                {orders.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-5 py-3 rounded-xl font-bold text-xs shrink-0 transition-all ${
                activeTab === "categories" ? "bg-primary text-black" : "bg-surface hover:bg-surface-hover text-foreground/75"
              }`}
            >
              <LayoutGrid className="w-4 h-4 inline-block ml-2" />
              الأقسام والفروع
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-5 py-3 rounded-xl font-bold text-xs shrink-0 transition-all ${
                activeTab === "inventory" ? "bg-primary text-black" : "bg-surface hover:bg-surface-hover text-foreground/75"
              }`}
            >
              <Package className="w-4 h-4 inline-block ml-2" />
              إدارة المنتجات المعروضة
            </button>

            <button
              onClick={() => setActiveTab("customers")}
              className={`px-5 py-3 rounded-xl font-bold text-xs shrink-0 transition-all ${
                activeTab === "customers" ? "bg-primary text-black" : "bg-surface hover:bg-surface-hover text-foreground/75"
              }`}
            >
              <Users className="w-4 h-4 inline-block ml-2" />
              الزبائن المشتركون
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`px-5 py-3 rounded-xl font-bold text-xs shrink-0 transition-all ${
                activeTab === "settings" ? "bg-primary text-black" : "bg-surface hover:bg-surface-hover text-foreground/75"
              }`}
            >
              <Settings className="w-4 h-4 inline-block ml-2" />
              إعدادات الموقع
            </button>
          </div>

          {isLoading ? (
            <div className="py-24 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-foreground/60 font-semibold">جاري جلب وتحديث جداول قاعدة البيانات السحابية...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Tab: Analytics */}
              {activeTab === "analytics" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass p-6 rounded-2xl border border-border flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs text-foreground/50 font-bold">إجمالي الحجوزات والمبيعات</span>
                        <h3 className="text-2xl font-black text-primary-light">{totalSales} د.ل</h3>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-xl text-primary-light">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-border flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs text-foreground/50 font-bold">الطلبيات المسجلة</span>
                        <h3 className="text-2xl font-black">{orders.length} طلب</h3>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-border flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs text-foreground/50 font-bold">المنتجات النشطة في المتجر</span>
                        <h3 className="text-2xl font-black">{activeProducts} منتج</h3>
                      </div>
                      <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                        <Package className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-border flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs text-foreground/50 font-bold">الزبائن المشتركون</span>
                        <h3 className="text-2xl font-black">{customers.length} عضو</h3>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Orders */}
              {activeTab === "orders" && (
                <div className="glass rounded-3xl border border-border overflow-hidden">
                  <div className="p-6 border-b border-border/60">
                    <h2 className="text-lg font-bold">جدول إدارة وحفظ وتتبع الطلبيات</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-surface/50 border-b border-border/40 text-xs font-bold text-foreground/60">
                          <th className="p-4">رقم التتبع</th>
                          <th className="p-4">الزبون</th>
                          <th className="p-4">المدينة</th>
                          <th className="p-4">العنوان والشارع</th>
                          <th className="p-4">المجموع</th>
                          <th className="p-4">حالة الطلب</th>
                          <th className="p-4">التحكم</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-sm text-foreground/40 font-bold">
                              لا يوجد طلبيات مسجلة في قاعدة البيانات حالياً.
                            </td>
                          </tr>
                        ) : (
                          orders.map((ord) => (
                            <tr key={ord.id} className="border-b border-border/30 hover:bg-surface/20 transition-all font-semibold text-sm">
                              <td className="p-4 font-black text-primary-light">{ord.tracking_number}</td>
                              <td className="p-4">{ord.guest_name}</td>
                              <td className="p-4">{ord.guest_city}</td>
                              <td className="p-4 truncate max-w-[200px]">{ord.guest_street}</td>
                              <td className="p-4 text-primary-light font-black">{ord.total_amount} د.ل</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${statusColors[ord.status] || "bg-foreground/5 text-foreground border-border"}`}>
                                  {statusTranslations[ord.status] || ord.status}
                                </span>
                              </td>
                              <td className="p-4 flex gap-2">
                                <button
                                  onClick={() => setEditingOrder(ord)}
                                  className="p-2 bg-primary/10 hover:bg-primary/20 text-primary-light rounded-lg transition-colors"
                                  title="تعديل تفاصيل الطلب بالكامل"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(ord.id)}
                                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                  title="حذف الطلب بشكل نهائي"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: Categories */}
              {activeTab === "categories" && (
                <div className="space-y-6">
                  {/* Category Section Header Editor */}
                  <div className="glass rounded-3xl border border-border p-6 space-y-4">
                    <h3 className="text-lg font-bold">تعديل عنوان ووصف قسم الأقسام المميزة بالرئيسية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">العنوان الرئيسي للقسم (مثال: الأقسام المميزة)</label>
                        <input
                          type="text"
                          value={settings.categories_title || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettings(prev => ({ ...prev, categories_title: val }));
                            updateSupabaseSetting("categories_title", val);
                          }}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">الوصف الفرعي للقسم (مثال: اكتشف مجموعاتنا المصنفة بعناية)</label>
                        <input
                          type="text"
                          value={settings.categories_subtitle || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettings(prev => ({ ...prev, categories_subtitle: val }));
                            updateSupabaseSetting("categories_subtitle", val);
                          }}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left panel: Categories List */}
                  <div className="glass rounded-3xl border border-border p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold">الأقسام الرئيسية الـ 4 الحالية</h3>
                      <button
                        onClick={() => setShowAddCatModal(true)}
                        className="px-4 py-2 bg-primary text-black hover:bg-primary-light rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة قسم رئيسي
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {categoriesList.map((cat) => (
                        <div key={cat.id} className="p-4 rounded-xl bg-surface/40 border border-border flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface shrink-0 border border-border">
                              <Image
                                src={resolveAssetPath(cat.image || "/placeholder.jpg")}
                                alt={cat.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm flex items-center gap-2">
                                {cat.name}
                                {!cat.is_active && <EyeOff className="w-3.5 h-3.5 text-foreground/40" />}
                              </h4>
                              <p className="text-xs text-foreground/50 max-w-[200px] truncate">{cat.desc}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditCategory(cat)}
                              className="p-2 bg-primary/10 hover:bg-primary/20 text-primary-light rounded-lg transition-colors"
                              title="تعديل القسم"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                              title="حذف القسم"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right panel: Subcategories List */}
                  <div className="glass rounded-3xl border border-border p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold">الأقسام الفرعية (Subcategories)</h3>
                      <button
                        onClick={() => setShowAddSubModal(true)}
                        className="px-4 py-2 bg-primary text-black hover:bg-primary-light rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة فرع جديد
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1">
                      {subcategoriesList.length === 0 ? (
                        <p className="text-xs text-foreground/40 font-bold text-center py-6">لا يوجد أقسام فرعية مضافة بعد.</p>
                      ) : (
                        subcategoriesList.map((sub) => {
                          const parentCat = categoriesList.find(c => c.id === sub.category_id);
                          return (
                            <div key={sub.id} className="p-4 rounded-xl bg-surface/40 border border-border flex items-center justify-between gap-4">
                              <div>
                                <h4 className="font-bold text-sm flex items-center gap-2">
                                  {sub.name}
                                  {!sub.is_active && <EyeOff className="w-3.5 h-3.5 text-foreground/40" />}
                                </h4>
                                <span className="text-[10px] bg-primary/10 text-primary-light px-2 py-0.5 rounded font-black mt-1 inline-block">
                                  يتبع: {parentCat?.name || "قسم محذوف"}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingSubcategory(sub)}
                                  className="p-2 bg-primary/10 hover:bg-primary/20 text-primary-light rounded-lg transition-colors"
                                  title="تعديل القسم الفرعي"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubcategory(sub.id)}
                                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                  title="حذف الفرع"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Tab: Inventory (Products) */}
              {activeTab === "inventory" && (
                <div className="space-y-6">
                  {/* Products Section Header Editor */}
                  <div className="glass rounded-3xl border border-border p-6 space-y-4">
                    <h3 className="text-lg font-bold">تعديل عنوان ووصف قسم الأكثر طلباً بالرئيسية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">العنوان الرئيسي للقسم (مثال: الأكثر طلباً)</label>
                        <input
                          type="text"
                          value={settings.trending_title || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettings(prev => ({ ...prev, trending_title: val }));
                            updateSupabaseSetting("trending_title", val);
                          }}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">الوصف الفرعي للقسم (مثال: تصاميم حصرية تميز إطلالتك)</label>
                        <input
                          type="text"
                          value={settings.trending_subtitle || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettings(prev => ({ ...prev, trending_subtitle: val }));
                            updateSupabaseSetting("trending_subtitle", val);
                          }}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">معرض وجرد المنتجات المتوفرة</h2>
                    <button
                      onClick={() => setShowAddProdModal(true)}
                      className="px-5 py-3 bg-primary text-black hover:bg-primary-light rounded-xl font-black text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4.5 h-4.5" />
                      إضافة منتج جديد
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((prod) => {
                      const cat = categoriesList.find(c => c.id === prod.categoryId);
                      return (
                        <div key={prod.id} className="glass rounded-2xl border border-border overflow-hidden flex flex-col group hover:border-primary/20">
                          {/* Image Cover */}
                          <div className="relative h-[240px] w-full bg-surface">
                            <Image
                              src={resolveAssetPath(prod.image || "/placeholder.jpg")}
                              alt={prod.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {prod.isFeatured && (
                              <span className="absolute top-4 right-4 bg-primary text-black px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-lg">
                                <Star className="w-3 h-3 fill-black" />
                                مميز
                              </span>
                            )}
                            {prod.isHidden && (
                              <span className="absolute top-4 left-4 bg-red-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-lg">
                                <EyeOff className="w-3 h-3" />
                                مخفي
                              </span>
                            )}
                          </div>

                          {/* Product details */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <span className="text-[10px] bg-primary/10 text-primary-light px-2 py-0.5 rounded font-black">
                                {cat?.name || "غير مصنف"}
                              </span>
                              <h3 className="font-bold text-base truncate">{prod.name}</h3>
                              <p className="text-xs text-foreground/50 line-clamp-2 h-8">{prod.description}</p>
                            </div>

                            <div className="flex justify-between items-center border-t border-border/40 pt-4">
                              <div className="text-right">
                                <span className="text-[10px] text-foreground/40 block font-bold">سعر البيع / الإيجار</span>
                                <span className="text-primary-light font-black text-sm">{prod.priceSale} د.ل</span>
                                <span className="text-foreground/40 mx-1">/</span>
                                <span className="text-foreground/60 font-semibold text-xs">{prod.priceRent} د.ل</span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditProduct(prod)}
                                  className="p-2 bg-primary/10 hover:bg-primary/20 text-primary-light rounded-lg transition-colors"
                                  title="تعديل المنتج ومعرض صوره"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                  title="حذف المنتج نهائياً"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab: Customers */}
              {activeTab === "customers" && (
                <div className="glass rounded-3xl border border-border overflow-hidden">
                  <div className="p-6 border-b border-border/60">
                    <h2 className="text-lg font-bold">قائمة الأعضاء والزبائن المسجلين</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-surface/50 border-b border-border/40 text-xs font-bold text-foreground/60">
                          <th className="p-4">اسم الزبون</th>
                          <th className="p-4">رقم الهاتف</th>
                          <th className="p-4">الهاتف الاحتياطي</th>
                          <th className="p-4">المدينة</th>
                          <th className="p-4">الشارع والحي الافتراضي</th>
                          <th className="p-4">دور العضوية</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((cust) => (
                          <tr key={cust.id} className="border-b border-border/30 hover:bg-surface/20 transition-all font-semibold text-sm">
                            <td className="p-4 font-black">{cust.name}</td>
                            <td className="p-4 text-left" dir="ltr">{cust.phone}</td>
                            <td className="p-4 text-left" dir="ltr">{cust.backup_phone || "-"}</td>
                            <td className="p-4">{cust.city}</td>
                            <td className="p-4">{cust.street}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${cust.is_admin ? "bg-primary text-black" : "bg-foreground/10 text-foreground/70"}`}>
                                {cust.is_admin ? "مسؤول (أدمن)" : "زبون مشترك"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: Settings */}
              {activeTab === "settings" && (
                <form onSubmit={handleSaveSettings} className="glass p-8 rounded-3xl border border-border space-y-6">
                  <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
                    <h2 className="text-lg font-bold">تعديل نصوص وتفاصيل محتوى الموقع</h2>
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-6 py-2.5 bg-primary text-black hover:bg-primary-light rounded-xl font-black text-xs transition-all"
                    >
                      {isSavingSettings ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                  </div>

                  {saveSuccess && (
                    <div className="p-4 text-xs font-bold text-green-400 bg-green-950/20 border border-green-500/20 rounded-xl">
                      🎉 تم حفظ جميع تعديلات نصوص الموقع وتحديثها في قاعدة البيانات السحابية بنجاح!
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">اسم المتجر</label>
                      <input
                        type="text"
                        value={settings.store_name || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, store_name: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">شريط الإعلانات العلوي</label>
                      <input
                        type="text"
                        value={settings.announcement_text || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, announcement_text: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">عنوان الهيرو الرئيسي</label>
                      <input
                        type="text"
                        value={settings.hero_title || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">عنوان الهيرو الفرعي</label>
                      <input
                        type="text"
                        value={settings.hero_subtitle || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">عنوان قسم الأقسام المميزة</label>
                      <input
                        type="text"
                        value={settings.categories_title || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, categories_title: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">وصف قسم الأقسام المميزة</label>
                      <input
                        type="text"
                        value={settings.categories_subtitle || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, categories_subtitle: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">عنوان قسم الأكثر طلباً</label>
                      <input
                        type="text"
                        value={settings.trending_title || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, trending_title: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">وصف قسم الأكثر طلباً</label>
                      <input
                        type="text"
                        value={settings.trending_subtitle || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, trending_subtitle: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">رقم الواتساب لاستقبال الفواتير</label>
                      <input
                        type="text"
                        value={settings.whatsapp_number || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                        placeholder="+218XXXXXXXXX"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left font-semibold"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">رقم هاتف الاتصال</label>
                      <input
                        type="text"
                        value={settings.contact_phone || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left font-semibold"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">رابط انستغرام</label>
                      <input
                        type="text"
                        value={settings.instagram_link || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, instagram_link: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">رابط تيك توك</label>
                      <input
                        type="text"
                        value={settings.tiktok_link || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, tiktok_link: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">شعار قسم الهيرو الصغير (Kicker Badge)</label>
                      <input
                        type="text"
                        value={settings.hero_badge || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, hero_badge: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 border-t border-border/40 pt-6 mt-4">
                      <h3 className="text-sm font-black text-primary-light mb-4">قسم مميزات المتجر الأربعة (Trust Badges)</h3>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">الميزة الأولى - العنوان الرئيسي (مثال: ضمان الجودة)</label>
                      <input
                        type="text"
                        value={settings.trust_badge_1_title || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, trust_badge_1_title: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">الميزة الأولى - الوصف الفرعي</label>
                      <input
                        type="text"
                        value={settings.trust_badge_1_desc || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, trust_badge_1_desc: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">الميزة الثانية - العنوان الرئيسي (مثال: توصيل آمن)</label>
                      <input
                        type="text"
                        value={settings.trust_badge_2_title || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, trust_badge_2_title: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">الميزة الثانية - الوصف الفرعي</label>
                      <input
                        type="text"
                        value={settings.trust_badge_2_desc || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, trust_badge_2_desc: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">الميزة الثالثة - العنوان الرئيسي (مثال: دعم 24/7)</label>
                      <input
                        type="text"
                        value={settings.trust_badge_3_title || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, trust_badge_3_title: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">الميزة الثالثة - الوصف الفرعي</label>
                      <input
                        type="text"
                        value={settings.trust_badge_3_desc || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, trust_badge_3_desc: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">الميزة الرابعة - العنوان الرئيسي (مثال: تصاميم حصرية)</label>
                      <input
                        type="text"
                        value={settings.trust_badge_4_title || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, trust_badge_4_title: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/80">الميزة الرابعة - الوصف الفرعي</label>
                      <input
                        type="text"
                        value={settings.trust_badge_4_desc || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, trust_badge_4_desc: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-foreground/80">مقر وعنوان المتجر الرئيسي</label>
                    <input
                      type="text"
                      value={settings.location || ""}
                      onChange={(e) => setSettings(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-foreground/80">من نحن (النص التعريفي بالفوتر)</label>
                    <textarea
                      value={settings.about_text || ""}
                      onChange={(e) => setSettings(prev => ({ ...prev, about_text: e.target.value }))}
                      rows={3}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-foreground/80">حقوق الفوتر السفلي للموقع</label>
                    <input
                      type="text"
                      value={settings.footer_text || ""}
                      onChange={(e) => setSettings(prev => ({ ...prev, footer_text: e.target.value }))}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Redundant lower button as requested */}
                  <div className="flex justify-end pt-4 border-t border-border/40">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-8 py-3 bg-primary text-black hover:bg-primary-light rounded-xl font-black text-xs transition-all"
                    >
                      {isSavingSettings ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                  </div>

                </form>
              )}

            </div>
          )}

          {/* ============================================== */}
          {/* ================ MODAL WINDOWS =============== */}
          {/* ============================================== */}

          {/* 1. EDIT ORDER MODAL */}
          {editingOrder && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-background border border-border w-full max-w-2xl rounded-3xl p-8 relative space-y-6 text-right">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="absolute top-6 left-6 p-2 hover:bg-surface rounded-lg border border-border"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-bold border-b border-border pb-3">✏️ تعديل تفاصيل الفاتورة والطلب</h3>

                <form onSubmit={handleUpdateOrder} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">اسم المستلم</label>
                      <input
                        type="text"
                        required
                        value={editingOrder.guest_name}
                        onChange={(e) => setEditingOrder({ ...editingOrder, guest_name: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">حالة الطلب</label>
                      <select
                        value={editingOrder.status}
                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm font-bold"
                      >
                        {Object.entries(statusTranslations).map(([key, name]) => (
                          <option key={key} value={key}>{name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">رقم الهاتف الأساسي</label>
                      <input
                        type="tel"
                        required
                        value={editingOrder.guest_phone}
                        onChange={(e) => setEditingOrder({ ...editingOrder, guest_phone: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-left font-semibold"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">رقم الهاتف الاحتياطي</label>
                      <input
                        type="tel"
                        value={editingOrder.guest_backup_phone || ""}
                        onChange={(e) => setEditingOrder({ ...editingOrder, guest_backup_phone: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-left font-semibold"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">المدينة</label>
                      <input
                        type="text"
                        required
                        value={editingOrder.guest_city}
                        onChange={(e) => setEditingOrder({ ...editingOrder, guest_city: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">الشارع</label>
                      <input
                        type="text"
                        required
                        value={editingOrder.guest_street}
                        onChange={(e) => setEditingOrder({ ...editingOrder, guest_street: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">تفاصيل إضافية للعنوان</label>
                    <input
                      type="text"
                      value={editingOrder.guest_address_detail || ""}
                      onChange={(e) => setEditingOrder({ ...editingOrder, guest_address_detail: e.target.value })}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">ملاحظات الزبون ومقاس التطريز</label>
                    <textarea
                      value={editingOrder.customer_notes || ""}
                      onChange={(e) => setEditingOrder({ ...editingOrder, customer_notes: e.target.value })}
                      rows={2}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">قيمة إجمالي الفاتورة (د.ل)</label>
                    <input
                      type="number"
                      required
                      value={editingOrder.total_amount}
                      onChange={(e) => setEditingOrder({ ...editingOrder, total_amount: Number(e.target.value) })}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-primary-light font-black"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-premium w-full mt-4 py-3 font-bold text-sm"
                  >
                    حفظ التعديلات
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 2. ADD MAIN CATEGORY MODAL */}
          {showAddCatModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-background border border-border w-full max-w-md rounded-3xl p-8 relative space-y-6 text-right">
                <button
                  onClick={() => setShowAddCatModal(false)}
                  className="absolute top-6 left-6 p-2 hover:bg-surface rounded-lg border border-border"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-bold border-b border-border pb-3">➕ إضافة قسم رئيسي جديد</h3>

                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">اسم القسم *</label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="مثال: كيبان تخرج"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">وصف القسم</label>
                    <textarea
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      placeholder="وصف مختصر للقسم يظهر للزبون..."
                      rows={2}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-foreground/60">صورة غلاف القسم *</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 border border-dashed border-border rounded-xl p-3 bg-surface hover:bg-surface-hover cursor-pointer transition-colors text-center text-xs font-bold text-foreground/65 flex justify-center items-center gap-1.5">
                        <Upload className="w-4 h-4" />
                        {uploadingCatImg ? "جاري رفع الصورة..." : "اختر صورة سحابية"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "cat")}
                        />
                      </label>
                    </div>
                    {catImage && (
                      <div className="relative w-full h-[120px] rounded-xl overflow-hidden border border-border group">
                        <Image src={catImage} alt="Preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setCatImage("")}
                          className="absolute top-2 left-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg shadow-black/40 flex items-center justify-center"
                          title="إزالة الصورة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">ترتيب العرض</label>
                      <input
                        type="number"
                        value={catSortOrder}
                        onChange={(e) => setCatSortOrder(Number(e.target.value))}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="catActive"
                        checked={catIsActive}
                        onChange={(e) => setCatIsActive(e.target.checked)}
                        className="accent-primary"
                      />
                      <label htmlFor="catActive" className="text-xs font-bold">قسم نشط</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-premium w-full mt-4 py-3 font-bold text-sm"
                  >
                    إضافة القسم بنجاح
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 3. EDIT MAIN CATEGORY MODAL */}
          {editingCategory && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-background border border-border w-full max-w-md rounded-3xl p-8 relative space-y-6 text-right">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="absolute top-6 left-6 p-2 hover:bg-surface rounded-lg border border-border"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-bold border-b border-border pb-3">✏️ تعديل القسم الرئيسي</h3>

                <form onSubmit={handleEditCategory} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">اسم القسم *</label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">وصف القسم</label>
                    <textarea
                      value={editingCategory.desc}
                      onChange={(e) => setEditingCategory({ ...editingCategory, desc: e.target.value })}
                      rows={2}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-foreground/60">صورة القسم السحابية</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 border border-dashed border-border rounded-xl p-3 bg-surface hover:bg-surface-hover cursor-pointer transition-colors text-center text-xs font-bold text-foreground/65 flex justify-center items-center gap-1.5">
                        <Upload className="w-4 h-4" />
                        {uploadingCatImg ? "جاري رفع الصورة..." : "تغيير الصورة"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "cat")}
                        />
                      </label>
                    </div>
                    {(catImage || editingCategory.image) && (
                      <div className="relative w-full h-[120px] rounded-xl overflow-hidden border border-border group">
                        <Image src={catImage || editingCategory.image} alt="Preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setCatImage("");
                            setEditingCategory({ ...editingCategory, image: "" });
                          }}
                          className="absolute top-2 left-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg shadow-black/40 flex items-center justify-center"
                          title="إزالة الصورة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">ترتيب العرض</label>
                      <input
                        type="number"
                        value={editingCategory.sort_order}
                        onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: Number(e.target.value) })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="catEditActive"
                        checked={editingCategory.is_active}
                        onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
                        className="accent-primary"
                      />
                      <label htmlFor="catEditActive" className="text-xs font-bold">قسم نشط</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-premium w-full mt-4 py-3 font-bold text-sm"
                  >
                    حفظ التعديلات
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 4. ADD SUBCATEGORY MODAL */}
          {showAddSubModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-background border border-border w-full max-w-md rounded-3xl p-8 relative space-y-6 text-right">
                <button
                  onClick={() => setShowAddSubModal(false)}
                  className="absolute top-6 left-6 p-2 hover:bg-surface rounded-lg border border-border"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-bold border-b border-border pb-3">➕ إضافة فرع جديد</h3>

                <form onSubmit={handleAddSubcategory} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">القسم الرئيسي التابع له *</label>
                    <select
                      required
                      value={subCatId}
                      onChange={(e) => setSubCatId(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold"
                    >
                      <option value="">-- اختر القسم الرئيسي --</option>
                      {categoriesList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">اسم الفرع الجديد *</label>
                    <input
                      type="text"
                      required
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      placeholder="مثال: شيلان مطرزة بالذهبي"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">ترتيب العرض</label>
                      <input
                        type="number"
                        value={subSortOrder}
                        onChange={(e) => setSubSortOrder(Number(e.target.value))}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="subActive"
                        checked={subIsActive}
                        onChange={(e) => setSubIsActive(e.target.checked)}
                        className="accent-primary"
                      />
                      <label htmlFor="subActive" className="text-xs font-bold">فرع نشط</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-premium w-full mt-4 py-3 font-bold text-sm"
                  >
                    حفظ التعديلات
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 5. EDIT SUBCATEGORY MODAL */}
          {editingSubcategory && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-background border border-border w-full max-w-md rounded-3xl p-8 relative space-y-6 text-right">
                <button
                  onClick={() => setEditingSubcategory(null)}
                  className="absolute top-6 left-6 p-2 hover:bg-surface rounded-lg border border-border"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-bold border-b border-border pb-3">✏️ تعديل الفرع الحالي</h3>

                <form onSubmit={handleEditSubcategory} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">القسم الرئيسي التابع له *</label>
                    <select
                      required
                      value={editingSubcategory.category_id}
                      onChange={(e) => setEditingSubcategory({ ...editingSubcategory, category_id: e.target.value })}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold"
                    >
                      {categoriesList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">اسم الفرع *</label>
                    <input
                      type="text"
                      required
                      value={editingSubcategory.name}
                      onChange={(e) => setEditingSubcategory({ ...editingSubcategory, name: e.target.value })}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">ترتيب العرض</label>
                      <input
                        type="number"
                        value={editingSubcategory.sort_order}
                        onChange={(e) => setEditingSubcategory({ ...editingSubcategory, sort_order: Number(e.target.value) })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="subEditActive"
                        checked={editingSubcategory.is_active}
                        onChange={(e) => setEditingSubcategory({ ...editingSubcategory, is_active: e.target.checked })}
                        className="accent-primary"
                      />
                      <label htmlFor="subEditActive" className="text-xs font-bold">فرع نشط</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-premium w-full mt-4 py-3 font-bold text-sm"
                  >
                    حفظ التعديلات
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 6. ADD PRODUCT MODAL */}
          {showAddProdModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-background border border-border w-full max-w-3xl rounded-3xl p-8 relative space-y-6 text-right">
                <button
                  onClick={() => setShowAddProdModal(false)}
                  className="absolute top-6 left-6 p-2 hover:bg-surface rounded-lg border border-border"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-bold border-b border-border pb-3">➕ إضافة منتج جديد</h3>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">اسم المنتج *</label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="مثال: كيب كويتي مخمل"
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">كود التعريف للمنتج</label>
                      <input
                        type="text"
                        value={prodCode}
                        onChange={(e) => setProdCode(e.target.value)}
                        placeholder="اتركه فارغاً للتوليد التلقائي"
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">سعر البيع (د.ل) *</label>
                      <input
                        type="number"
                        required
                        value={prodPriceSale}
                        onChange={(e) => setProdPriceSale(Number(e.target.value))}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">سعر الإيجار (د.ل) *</label>
                      <input
                        type="number"
                        required
                        value={prodPriceRent}
                        onChange={(e) => setProdPriceRent(Number(e.target.value))}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">الكمية في المخزن (Stock) *</label>
                      <input
                        type="number"
                        required
                        value={prodStock}
                        onChange={(e) => setProdStock(Number(e.target.value))}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">القسم الرئيسي *</label>
                      <select
                        required
                        value={prodCategoryId}
                        onChange={(e) => setProdCategoryId(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold"
                      >
                        <option value="">-- اختر القسم الرئيسي --</option>
                        {categoriesList.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">القسم الفرعي التابع له</label>
                      <select
                        value={prodSubcategoryId}
                        onChange={(e) => setProdSubcategoryId(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold"
                      >
                        <option value="">-- اختر قسم فرعي (اختياري) --</option>
                        {subcategoriesList.filter(s => s.category_id === prodCategoryId).map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">وصف المنتج وتفاصيله</label>
                    <textarea
                      value={prodDescription}
                      onChange={(e) => setProdDescription(e.target.value)}
                      rows={2}
                      placeholder="تفاصيل حول المقاسات، نوع القماش، التطريز المتوفر..."
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  {/* Supabase Storage Image uploaders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-surface/20 border border-border/60">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-primary-light">صورة الغلاف الأساسية (Cover) *</label>
                      <label className="border border-dashed border-border rounded-xl p-3 bg-surface hover:bg-surface-hover cursor-pointer transition-colors text-center text-xs font-bold flex justify-center items-center gap-1.5">
                        <Upload className="w-4 h-4" />
                        {uploadingProdImg ? "جاري الرفع..." : "اختر غلاف للمنتج"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "prod-cover")}
                        />
                      </label>
                      {prodImage && (
                        <div className="relative w-full h-[100px] rounded-lg overflow-hidden border border-border group">
                          <Image src={prodImage} alt="Cover Preview" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => setProdImage("")}
                            className="absolute top-2 left-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg shadow-black/40 flex items-center justify-center"
                            title="إزالة الصورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-primary-light">معرض الصور الإضافية (Gallery)</label>
                      <label className="border border-dashed border-border rounded-xl p-3 bg-surface hover:bg-surface-hover cursor-pointer transition-colors text-center text-xs font-bold flex justify-center items-center gap-1.5">
                        <Upload className="w-4 h-4" />
                        {uploadingGalleryImg ? "جاري الرفع..." : "إضافة صور للمعرض"}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              Array.from(e.target.files).forEach(file => {
                                handleImageUpload(file, "prod-gallery");
                              });
                            }
                          }}
                        />
                      </label>

                      {/* Gallery layout list */}
                      <div className="flex gap-2 flex-wrap">
                        {prodImages.map((url, idx) => (
                          <div key={idx} className="relative w-12 h-12 rounded border border-border overflow-hidden group">
                            <Image src={url} alt="Gallery item" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => setProdImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">ترتيب المنتج</label>
                      <input
                        type="number"
                        value={prodSortOrder}
                        onChange={(e) => setProdSortOrder(Number(e.target.value))}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="prodFeatured"
                        checked={prodIsFeatured}
                        onChange={(e) => setProdIsFeatured(e.target.checked)}
                        className="accent-primary"
                      />
                      <label htmlFor="prodFeatured" className="text-xs font-bold">منتج مميز</label>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="prodHidden"
                        checked={prodIsHidden}
                        onChange={(e) => setProdIsHidden(e.target.checked)}
                        className="accent-primary"
                      />
                      <label htmlFor="prodHidden" className="text-xs font-bold">إخفاء المنتج</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-premium w-full mt-4 py-3.5 font-bold text-sm"
                  >
                    حفظ وإضافة المنتج الجديد
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 7. EDIT PRODUCT MODAL */}
          {editingProduct && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-background border border-border w-full max-w-3xl rounded-3xl p-8 relative space-y-6 text-right">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="absolute top-6 left-6 p-2 hover:bg-surface rounded-lg border border-border"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-bold border-b border-border pb-3">✏️ تعديل بيانات ومعرض المنتج</h3>

                <form onSubmit={handleEditProduct} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">اسم المنتج *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">كود التعريف</label>
                      <input
                        type="text"
                        value={editingProduct.code}
                        onChange={(e) => setEditingProduct({ ...editingProduct, code: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">سعر البيع (د.ل) *</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.priceSale}
                        onChange={(e) => setEditingProduct({ ...editingProduct, priceSale: Number(e.target.value) })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">سعر الإيجار (د.ل) *</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.priceRent}
                        onChange={(e) => setEditingProduct({ ...editingProduct, priceRent: Number(e.target.value) })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">الكمية (Stock) *</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.stockQuantity}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">القسم الرئيسي *</label>
                      <select
                        required
                        value={editingProduct.categoryId}
                        onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold"
                      >
                        {categoriesList.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">القسم الفرعي</label>
                      <select
                        value={editingProduct.subcategoryId || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, subcategoryId: e.target.value || null })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold"
                      >
                        <option value="">-- اختر قسم فرعي --</option>
                        {subcategoriesList.filter(s => s.category_id === editingProduct.categoryId).map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">وصف المنتج</label>
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      rows={2}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  {/* Supabase Storage image updater */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-surface/20 border border-border/60">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-primary-light">صورة الغلاف الأساسية</label>
                      <label className="border border-dashed border-border rounded-xl p-3 bg-surface hover:bg-surface-hover cursor-pointer transition-colors text-center text-xs font-bold flex justify-center items-center gap-1.5">
                        <Upload className="w-4 h-4" />
                        {uploadingProdImg ? "جاري الرفع..." : "تغيير الغلاف"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "prod-cover")}
                        />
                      </label>
                      {(prodImage || editingProduct.image) && (
                        <div className="relative w-full h-[100px] rounded-lg overflow-hidden border border-border group">
                          <Image src={prodImage || editingProduct.image} alt="Cover Preview" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setProdImage("");
                              setEditingProduct({ ...editingProduct, image: "" });
                            }}
                            className="absolute top-2 left-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg shadow-black/40 flex items-center justify-center"
                            title="إزالة الصورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-primary-light">معرض الصور الإضافية (Gallery)</label>
                      <label className="border border-dashed border-border rounded-xl p-3 bg-surface hover:bg-surface-hover cursor-pointer transition-colors text-center text-xs font-bold flex justify-center items-center gap-1.5">
                        <Upload className="w-4 h-4" />
                        {uploadingGalleryImg ? "جاري الرفع..." : "إضافة صور للغاليري"}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              Array.from(e.target.files).forEach(file => {
                                handleImageUpload(file, "prod-gallery");
                              });
                            }
                          }}
                        />
                      </label>

                      <div className="flex gap-2 flex-wrap">
                        {prodImages.map((url, idx) => (
                          <div key={idx} className="relative w-12 h-12 rounded border border-border overflow-hidden group">
                            <Image src={url} alt="Gallery item" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = prodImages.filter((_, i) => i !== idx);
                                setProdImages(filtered);
                              }}
                              className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/60">ترتيب المنتج</label>
                      <input
                        type="number"
                        value={editingProduct.sortOrder}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sortOrder: Number(e.target.value) })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="prodEditFeatured"
                        checked={editingProduct.isFeatured}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                        className="accent-primary"
                      />
                      <label htmlFor="prodEditFeatured" className="text-xs font-bold">منتج مميز</label>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="prodEditHidden"
                        checked={editingProduct.isHidden}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isHidden: e.target.checked })}
                        className="accent-primary"
                      />
                      <label htmlFor="prodEditHidden" className="text-xs font-bold">إخفاء المنتج</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-premium w-full mt-4 py-3.5 font-bold text-sm"
                  >
                    حفظ التعديلات
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
