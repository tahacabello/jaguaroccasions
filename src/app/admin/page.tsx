"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  BarChart3, ShoppingCart, Package, Users, TrendingUp, Search, Eye, Edit3, Trash2, Plus, Check, RefreshCw, Lock, ArrowRight, LayoutGrid, X, Upload, MessageCircle, Settings, Image as ImageIcon, Star, EyeOff, UserPlus, FileText
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
  addSupabaseOrder,
  adminCreateCustomerAccount,
  adminResetCustomerPassword,
  updateSupabaseOrderStatus,
  updateSupabaseOrderDetails,
  deleteSupabaseOrder,
  getSupabaseCustomerProfiles,
  adminUpdateCustomerProfile,
  adminDeleteCustomer,
  uploadProductImage,
  resolveAssetPath,
  swapCategoryOrderInDb,
  swapSubcategoryOrderInDb,
  swapProductOrderInDb,
  getSupabaseFeaturedCards,
  addSupabaseFeaturedCard,
  updateSupabaseFeaturedCard,
  deleteSupabaseFeaturedCard,
  swapFeaturedCardOrderInDb,
  getSupabaseHomepageSections,
  addSupabaseHomepageSection,
  updateSupabaseHomepageSection,
  deleteSupabaseHomepageSection,
  swapHomepageSectionOrderInDb,
  addSupabaseHomepageSectionItem,
  updateSupabaseHomepageSectionItem,
  deleteSupabaseHomepageSectionItem,
  swapHomepageSectionItemOrderInDb,
  seedDefaultHomepageSections,
  getSupabaseAllChangeRequests,
  getSupabasePendingChangeRequestsCount,
  adminApproveChangeRequest,
  adminRejectChangeRequest
} from "@/lib/supabase";

const cityNames: Record<string, string> = {
  tripoli: "طرابلس",
  benghazi: "بنغازي",
  misrata: "مصراتة",
  khoms: "الخمس",
  zawiya: "الزاوية",
  sebha: "سبها",
  garian: "غريان",
  tobruk: "طبرق",
  zleten: "زليتن",
  msallata: "مسلاتة",
  other: "مدينة أخرى",
};

// Helper to format Date cleanly in Arabic (e.g. السبت 2 نوفمبر 2025)
const formatArabicDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "غير محدد";
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "وليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  
  const dayName = days[dateObj.getDay()];
  const dayNum = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${dayName} ${dayNum} ${monthName} ${year}`;
};

const statusTranslations: Record<string, string> = {
  new: "طلب جديد",
  waiting_confirmation: "بانتظار التأكيد",
  confirmed: "تم التأكيد",
  preparing: "قيد التجهيز",
  ready: "جاهز للتسليم",
  reserved: "محجوز",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
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
  
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "inventory" | "settings" | "categories" | "customers" | "homepage_builder" | "change_requests">("analytics");

  // Customer Creation & Password Reset & Manual Order States
  const [isCreateCustOpen, setIsCreateCustOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createFullName, setCreateFullName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createBackupPhone, setCreateBackupPhone] = useState("");
  const [createCity, setCreateCity] = useState("tripoli");
  const [createStreet, setCreateStreet] = useState("");
  const [createAddressDetails, setCreateAddressDetails] = useState("");
  const [createGoogleMapsLink, setCreateGoogleMapsLink] = useState("");
  const [isCreatingCust, setIsCreatingCust] = useState(false);
  
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [resetPasscodeVal, setResetPasscodeVal] = useState("9922");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Manual Order Creation Form States
  const [manualCustType, setManualCustType] = useState<"existing" | "new">("existing");
  const [manualSelectedCustId, setManualSelectedCustId] = useState("");
  
  // New customer creation details if toggled
  const [manualNewUsername, setManualNewUsername] = useState("");
  const [manualNewPassword, setManualNewPassword] = useState("");
  const [manualNewFullName, setManualNewFullName] = useState("");
  const [manualNewPhone, setManualNewPhone] = useState("");
  const [manualNewBackupPhone, setManualNewBackupPhone] = useState("");
  const [manualNewCity, setManualNewCity] = useState("tripoli");
  const [manualNewStreet, setManualNewStreet] = useState("");
  const [manualNewAddressDetail, setManualNewAddressDetail] = useState("");
  const [manualNewGoogleMaps, setManualNewGoogleMaps] = useState("");

  // Existing customer shipping details
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualBackupPhone, setManualBackupPhone] = useState("");
  const [manualCity, setManualCity] = useState("tripoli");
  const [manualStreet, setManualStreet] = useState("");
  const [manualAddressDetail, setManualAddressDetail] = useState("");
  const [manualGoogleMaps, setManualGoogleMaps] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [manualPayment, setManualPayment] = useState<"cash_on_delivery" | "sadad" | "mobicash">("cash_on_delivery");

  // Rental schedule
  const [manualIsPreliminary, setManualIsPreliminary] = useState(false);
  const [manualEventDate, setManualEventDate] = useState("");
  const [manualReturnOption, setManualReturnOption] = useState<"same_day" | "next_day">("next_day");
  const [manualPickupDate, setManualPickupDate] = useState("");
  const [manualReturnDate, setManualReturnDate] = useState("");

  // Selected products & quantities
  const [manualOrderItems, setManualOrderItems] = useState<{ id: string; quantity: number; mode: "sale" | "rent" }[]>([]);
  const [isSubmittingManualOrder, setIsSubmittingManualOrder] = useState(false);

  // Selector controls inside manual order form
  const [selectorProductId, setSelectorProductId] = useState("");
  const [selectorQuantity, setSelectorQuantity] = useState(1);
  const [selectorMode, setSelectorMode] = useState<"sale" | "rent">("rent");
 
  // Order change request management states
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [isProcessingReview, setIsProcessingReview] = useState(false);

  // Homepage Sections Builder States
  const [homepageSectionsList, setHomepageSectionsList] = useState<any[]>([]);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingSectionItem, setEditingSectionItem] = useState<any | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [isSeedingSections, setIsSeedingSections] = useState(false);

  // Section Input States
  const [secTitle, setSecTitle] = useState("");
  const [secSubtitle, setSecSubtitle] = useState("");
  const [secType, setSecType] = useState<"categories" | "subcategories" | "products" | "mixed">("mixed");
  const [secIsVisible, setSecIsVisible] = useState(true);

  // Section Item Input States
  const [itemLinkedType, setItemLinkedType] = useState<"category" | "subcategory" | "product">("category");
  const [itemLinkedId, setItemLinkedId] = useState("");
  const [itemDisplayTitle, setItemDisplayTitle] = useState("");
  const [itemDisplaySubtitle, setItemDisplaySubtitle] = useState("");
  const [itemDisplayImage, setItemDisplayImage] = useState("");
  const [uploadingItemImg, setUploadingItemImg] = useState(false);
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
  const [settingsSubTab, setSettingsSubTab] = useState<"site_texts" | "contact_links" | "rental_policy" | "order_payment">("site_texts");

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
  const [catIsFeatured, setCatIsFeatured] = useState(false);
  const [uploadingCatImg, setUploadingCatImg] = useState(false);

  // Dynamic input states for subcategories
  const [subName, setSubName] = useState("");
  const [subCatId, setSubCatId] = useState("");
  const [subImage, setSubImage] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [subSortOrder, setSubSortOrder] = useState(0);
  const [subIsActive, setSubIsActive] = useState(true);
  const [subIsFeatured, setSubIsFeatured] = useState(false);

  // Dynamic input states for products
  const [prodName, setProdName] = useState("");
  const [prodPriceSale, setProdPriceSale] = useState<number | string>("");
  const [prodPriceRent, setProdPriceRent] = useState<number | string>("");
  const [prodSaleAvailable, setProdSaleAvailable] = useState(true);
  const [prodRentAvailable, setProdRentAvailable] = useState(true);
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

  // New Featured Cards State Declarations
  const [featuredCardsList, setFeaturedCardsList] = useState<any[]>([]);
  const [showAddFeaturedModal, setShowAddFeaturedModal] = useState(false);
  const [editingFeaturedCard, setEditingFeaturedCard] = useState<any | null>(null);
  
  const [fCardTitle, setFCardTitle] = useState("");
  const [fCardSubtitle, setFCardSubtitle] = useState("");
  const [fCardImage, setFCardImage] = useState("");
  const [fCardLinkedType, setFCardLinkedType] = useState<"category" | "subcategory">("category");
  const [fCardLinkedId, setFCardLinkedId] = useState("");
  const [fCardIsVisible, setFCardIsVisible] = useState(true);

  // Customer Management States
  const [selectedCust, setSelectedCust] = useState<any | null>(null);
  const [isCustDetailsOpen, setIsCustDetailsOpen] = useState(false);
  const [isCustEditOpen, setIsCustEditOpen] = useState(false);
  const [isCustDeleteOpen, setIsCustDeleteOpen] = useState(false);
  
  const [custFirstName, setCustFirstName] = useState("");
  const [custLastName, setCustLastName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custBackupPhone, setCustBackupPhone] = useState("");
  const [custCity, setCustCity] = useState("tripoli");
  const [custStreet, setCustStreet] = useState("");
  const [custAdditionalAddress, setCustAdditionalAddress] = useState("");

  const [isSavingCust, setIsSavingCust] = useState(false);
  const [isDeletingCust, setIsDeletingCust] = useState(false);
  const [custSaveSuccess, setCustSaveSuccess] = useState(false);

  const handleOpenEditCustomer = (cust: any) => {
    setSelectedCust(cust);
    setCustFirstName(cust.first_name || "");
    setCustLastName(cust.last_name || "");
    setCustPhone(cust.phone_number || "");
    setCustBackupPhone(cust.backup_phone || "");
    const cityKey = Object.keys(cityNames).find(key => cityNames[key] === cust.city) || "tripoli";
    setCustCity(cityKey);
    setCustStreet(cust.street || "");
    setCustAdditionalAddress(cust.additional_address || "");
    setIsCustEditOpen(true);
  };

  const handleEditCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;
    setIsSavingCust(true);
    setCustSaveSuccess(false);

    const success = await adminUpdateCustomerProfile(selectedCust.id, {
      first_name: custFirstName,
      last_name: custLastName,
      phone_number: custPhone,
      backup_phone: custBackupPhone,
      city: cityNames[custCity] || custCity,
      street: custStreet,
      additional_address: custAdditionalAddress
    });

    setIsSavingCust(false);
    if (success) {
      setCustSaveSuccess(true);
      refreshAllData();
      setTimeout(() => {
        setCustSaveSuccess(false);
        setIsCustEditOpen(false);
      }, 1500);
    } else {
      alert("فشل تحديث بيانات العميل. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleDeleteCustomerSubmit = async () => {
    if (!selectedCust) return;
    setIsDeletingCust(true);
    
    const success = await adminDeleteCustomer(selectedCust.id);
    
    setIsDeletingCust(false);
    setIsCustDeleteOpen(false);
    if (success) {
      alert("تم حذف حساب العميل من النظام بالكامل بنجاح!");
      refreshAllData();
    } else {
      alert("فشل حذف الحساب. يرجى المحاولة مرة أخرى.");
    }
  };

  // 1. Auto-fill manual order customer shipping details when customer id changes
  useEffect(() => {
    if (manualSelectedCustId) {
      const cust = customers.find(c => c.id === manualSelectedCustId);
      if (cust) {
        setManualName(`${cust.first_name || ""} ${cust.last_name || ""}`.trim() || cust.name || "");
        setManualPhone(cust.phone_number || "");
        setManualBackupPhone(cust.backup_phone || "");
        const cityKey = Object.keys(cityNames).find(key => cityNames[key] === cust.city) || "tripoli";
        setManualCity(cityKey);
        setManualStreet(cust.street || "");
        setManualAddressDetail(cust.additional_address || "");
        setManualGoogleMaps(cust.google_maps_link || "");
      }
    }
  }, [manualSelectedCustId, customers]);

  // 2. Auto-calculate manual order rental dates
  useEffect(() => {
    if (!manualEventDate) {
      setManualPickupDate("");
      setManualReturnDate("");
      return;
    }

    const evDate = new Date(manualEventDate);
    if (isNaN(evDate.getTime())) return;

    // Pickup calculation: 1 day before event
    let pickDate = new Date(evDate);
    pickDate.setDate(evDate.getDate() - 1);
    if (pickDate.getDay() === 5) { // Friday is 5
      pickDate.setDate(pickDate.getDate() - 1); // Move to Thursday
    }

    // Return calculation
    let retDate = new Date(evDate);
    if (manualReturnOption === "next_day") {
      retDate.setDate(evDate.getDate() + 1);
    }
    if (retDate.getDay() === 5) { // Friday is 5
      retDate.setDate(retDate.getDate() + 1); // Move to Saturday
    }

    const getYYYYMMDD = (d: Date) => {
      return d.toISOString().split('T')[0];
    };

    setManualPickupDate(getYYYYMMDD(pickDate));
    setManualReturnDate(getYYYYMMDD(retDate));
  }, [manualEventDate, manualReturnOption]);

  // 3. Admin create customer handler
  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCust(true);

    const cleanUsername = createUsername.trim().toLowerCase();
    if (!cleanUsername || !createPassword) {
      alert("اسم المستخدم وكلمة المرور مطلوبان.");
      setIsCreatingCust(false);
      return;
    }

    try {
      const targetEmail = createEmail ? createEmail.trim() : `${cleanUsername}@jaguar.local`;

      const result = await adminCreateCustomerAccount({
        username: cleanUsername,
        password: createPassword,
        full_name: createFullName || "زبون جديد",
        email: targetEmail,
        phone: createPhone,
        backup_phone: createBackupPhone,
        city: cityNames[createCity] || createCity,
        street: createStreet,
        address_details: createAddressDetails,
        google_maps_link: createGoogleMapsLink
      }, "9922");

      if (result.success) {
        alert("تم إنشاء حساب الزبون بنجاح!");
        setIsCreateCustOpen(false);
        setCreateUsername("");
        setCreatePassword("");
        setCreateFullName("");
        setCreateEmail("");
        setCreatePhone("");
        setCreateBackupPhone("");
        setCreateStreet("");
        setCreateAddressDetails("");
        setCreateGoogleMapsLink("");
        refreshAllData();
      } else {
        alert("فشل إنشاء الحساب: " + result.error);
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء إنشاء الحساب: " + err.message);
    } finally {
      setIsCreatingCust(false);
    }
  };

  // 4. Admin reset password handler
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;
    setIsResettingPassword(true);

    try {
      const result = await adminResetCustomerPassword(selectedCust.id, newPasswordVal, resetPasscodeVal);

      if (result.success) {
        alert("تم تحديث كلمة مرور الزبون بنجاح!");
        setIsResetPasswordOpen(false);
        setNewPasswordVal("");
      } else {
        alert("فشل تحديث كلمة المرور: " + result.error);
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء تغيير كلمة المرور: " + err.message);
    } finally {
      setIsResettingPassword(false);
    }
  };

  // 5. Admin manual order creation submit
  const handleManualOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualOrderItems.length === 0) {
      alert("الرجاء اختيار منتج واحد على الأقل للطلب اليدوي.");
      return;
    }
    setIsSubmittingManualOrder(true);

    try {
      let targetCustomerId = null;

      // Handle inline new customer creation if toggled
      if (manualCustType === "new") {
        const cleanUsername = manualNewUsername.trim().toLowerCase();
        if (!cleanUsername || !manualNewPassword) {
          alert("الرجاء إدخال اسم مستخدم وكلمة مرور للزبون الجديد.");
          setIsSubmittingManualOrder(false);
          return;
        }

        const mockEmail = `${cleanUsername}@jaguar.local`;
        const result = await adminCreateCustomerAccount({
          username: cleanUsername,
          password: manualNewPassword,
          full_name: manualNewFullName || "زبون جديد",
          email: mockEmail,
          phone: manualNewPhone,
          backup_phone: manualNewBackupPhone,
          city: cityNames[manualNewCity] || manualNewCity,
          street: manualNewStreet,
          address_details: manualNewAddressDetail,
          google_maps_link: manualNewGoogleMaps
        }, "9922");

        if (!result.success) {
          throw new Error("فشل إنشاء الحساب الجديد: " + result.error);
        }
        targetCustomerId = result.data.id;
      } else {
        targetCustomerId = manualSelectedCustId || null;
      }

      // Map selected items and sum up total
      let calculatedTotal = 0;
      const orderItems = manualOrderItems.map(item => {
        const prod = products.find(p => p.id === item.id);
        const price = item.mode === "rent" ? (prod?.priceRent || 0) : (prod?.priceSale || 0);
        calculatedTotal += price * item.quantity;
        return {
          product_id: item.id,
          product_name: prod?.name || "منتج يدوي",
          product_image: prod?.image || "",
          quantity: item.quantity,
          price_at_purchase: price,
          item_mode: item.mode
        };
      });

      const trackingNumber = `JG-MANUAL-${Math.floor(100000 + Math.random() * 900000)}`;

      const payload = {
        customer_id: targetCustomerId,
        guest_name: manualCustType === "new" ? (manualNewFullName || "زبون جديد") : manualName,
        guest_phone: manualCustType === "new" ? manualNewPhone : manualPhone,
        guest_backup_phone: manualCustType === "new" ? manualNewBackupPhone : manualBackupPhone,
        guest_city: manualCustType === "new" ? (cityNames[manualNewCity] || manualNewCity) : (cityNames[manualCity] || manualCity),
        guest_street: manualCustType === "new" ? manualNewStreet : manualStreet,
        guest_address_detail: manualCustType === "new" ? manualNewAddressDetail : manualAddressDetail,
        customer_notes: manualNotes,
        status: "confirmed",
        payment_method: manualPayment,
        total_amount: calculatedTotal,
        tracking_number: trackingNumber,
        event_date: manualIsPreliminary ? null : (manualEventDate || null),
        pickup_date: manualIsPreliminary ? null : (manualPickupDate || null),
        return_date: manualIsPreliminary ? null : (manualReturnDate || null),
        is_preliminary: manualIsPreliminary,
        google_maps_link: manualCustType === "new" ? manualNewGoogleMaps : manualGoogleMaps
      };

      const result = await addSupabaseOrder(payload, orderItems);
      if (!result.success) {
        throw new Error(result.error || "فشل تسجيل الفاتورة اليدوية.");
      }

      alert(`تم إضافة الطلب اليدوي بنجاح! رقم الفاتورة: ${trackingNumber}`);

      // WhatsApp account credentials message
      if (manualCustType === "new") {
        const usernameVal = manualNewUsername.trim().toLowerCase();
        const passwordVal = manualNewPassword;
        const loginLink = `${window.location.origin}/auth/login`;
        
        let messageText = `مرحباً ${manualNewFullName || "زبوننا الكريم"}، تم إنشاء حساب خاص بك لمتابعة طلبياتك في متجر Jaguar Occasions.\n\n`;
        messageText += `اسم المستخدم: ${usernameVal}\n`;
        messageText += `كلمة المرور: ${passwordVal}\n`;
        messageText += `رابط تسجيل الدخول: ${loginLink}\n\n`;
        messageText += `رقم طلبك: ${trackingNumber}\n`;
        messageText += `إجمالي الفاتورة: ${calculatedTotal} د.ل\n\n`;
        messageText += `يمكنك تسجيل الدخول في أي وقت لمتابعة طلبك وتعديل تفاصيل حجزك. شكراً لثقتك بنا!`;

        const phoneClean = (manualNewPhone || "").replace(/\s+/g, "").replace(/^0/, "+218");
        const link = `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodeURIComponent(messageText)}`;
        window.open(link, "_blank");
      } else if (targetCustomerId) {
        // Send WhatsApp for existing customer
        const cust = customers.find(c => c.id === targetCustomerId);
        if (cust) {
          const usernameVal = cust.username || "غير محدد";
          const loginLink = `${window.location.origin}/auth/login`;
          
          let messageText = `مرحباً ${cust.name || "زبوننا الكريم"}، تم تسجيل طلبية يدوية جديدة لك في حسابك لدى Jaguar Occasions.\n\n`;
          messageText += `اسم المستخدم الخاص بك: ${usernameVal}\n`;
          messageText += `رابط تسجيل الدخول للمتابعة: ${loginLink}\n\n`;
          messageText += `رقم الطلب الجديد: ${trackingNumber}\n`;
          messageText += `إجمالي الفاتورة: ${calculatedTotal} د.ل\n\n`;
          messageText += `يمكنك الدخول لحسابك لمتابعة تفاصيل الطلب وتأكيد مواعيد الاستلام والارجاع.`;

          const phoneClean = (cust.phone_number || "").replace(/\s+/g, "").replace(/^0/, "+218");
          const link = `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodeURIComponent(messageText)}`;
          window.open(link, "_blank");
        }
      }

      // Clear states
      setManualSelectedCustId("");
      setManualOrderItems([]);
      setManualNotes("");
      setManualEventDate("");
      setManualNewUsername("");
      setManualNewPassword("");
      setManualNewFullName("");
      setManualNewPhone("");
      setManualNewBackupPhone("");
      setManualNewStreet("");
      setManualNewAddressDetail("");
      setManualNewGoogleMaps("");
      setManualGoogleMaps("");
      setIsManualOrderOpen(false);

      refreshAllData();
    } catch (err: any) {
      alert("خطأ أثناء حفظ الطلب اليدوي: " + err.message);
    } finally {
      setIsSubmittingManualOrder(false);
    }
  };

  // Helper to open WhatsApp to send login info & order details
  const handleSendWhatsAppAccountDetails = (cust: any, order?: any) => {
    const usernameVal = cust.username || "غير محدد";
    const loginLink = `${window.location.origin}/auth/login`;
    const orderNum = order ? order.tracking_number : "لا يوجد طلبية حالياً";
    const orderSum = order ? `إجمالي الفاتورة: ${order.total_amount} د.ل` : "";

    const messageText = `مرحباً، تم إنشاء حساب خاص بك لمتابعة طلبك في متجر Jaguar Occasions.
اسم المستخدم: ${usernameVal}
رابط تسجيل الدخول: ${loginLink}
رقم الطلب: ${orderNum}
${orderSum}
يمكنك تسجيل الدخول باستخدام اسم المستخدم أو رقم الهاتف أو البريد الإلكتروني لمتابعة حالة الطلب وتحديث بياناتك عند الحاجة.`;

    const phoneClean = (cust.phone_number || "").replace(/\s+/g, "").replace(/^0/, "+218");
    const link = `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodeURIComponent(messageText)}`;
    window.open(link, "_blank");
  };

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
      const [
        dbProducts,
        dbSettings,
        dbCategories,
        dbSubcategories,
        dbOrders,
        dbCustomers,
        dbFeaturedCards,
        dbSections,
        dbChangeRequests,
        dbPendingCount
      ] = await Promise.all([
        getSupabaseProducts(),
        getSupabaseSettings(),
        getSupabaseCategories(),
        getSupabaseSubcategories(),
        getSupabaseOrders(),
        getSupabaseCustomerProfiles(),
        getSupabaseFeaturedCards(),
        getSupabaseHomepageSections(),
        getSupabaseAllChangeRequests(),
        getSupabasePendingChangeRequestsCount()
      ]);
      
      setProducts(dbProducts);
      setSettings(dbSettings);
      setCategoriesList(dbCategories);
      setSubcategoriesList(dbSubcategories);
      setOrders(dbOrders);
      setCustomers(dbCustomers);
      setFeaturedCardsList(dbFeaturedCards);
      setHomepageSectionsList(dbSections);
      setChangeRequests(dbChangeRequests || []);
      setPendingRequestsCount(dbPendingCount || 0);
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

  // Homepage sections builder handler functions
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secTitle) return;
    setIsSavingSection(true);
    const order = homepageSectionsList.length;
    const res = await addSupabaseHomepageSection({
      title: secTitle,
      subtitle: secSubtitle,
      section_type: secType,
      sort_order: order,
      is_visible: secIsVisible
    });
    if (res.success) {
      setSecTitle("");
      setSecSubtitle("");
      setSecType("mixed");
      setSecIsVisible(true);
      setShowAddSectionModal(false);
      await refreshAllData();
    } else {
      alert("فشل إضافة القسم: " + res.error);
    }
    setIsSavingSection(false);
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم بالكامل بجميع محتوياته؟")) return;
    const success = await deleteSupabaseHomepageSection(id);
    if (success) {
      await refreshAllData();
    } else {
      alert("فشل حذف القسم.");
    }
  };

  const handleToggleSectionVisibility = async (section: any) => {
    const success = await updateSupabaseHomepageSection(section.id, { is_visible: !section.is_visible });
    if (success) {
      await refreshAllData();
    } else {
      alert("فشل تعديل الظهور.");
    }
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= homepageSectionsList.length) return;
    const sec1 = homepageSectionsList[index];
    const sec2 = homepageSectionsList[targetIndex];
    const success = await swapHomepageSectionOrderInDb(sec1.id, sec1.sort_order, sec2.id, sec2.sort_order);
    if (success) {
      await refreshAllData();
    }
  };

  const handleAddItemToSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSectionId || !itemLinkedId) return;
    const section = homepageSectionsList.find(s => s.id === activeSectionId);
    if (!section) return;
    setIsSavingSection(true);
    const order = (section.homepage_section_items || []).length;
    const res = await addSupabaseHomepageSectionItem({
      section_id: activeSectionId,
      linked_type: itemLinkedType,
      linked_id: itemLinkedId,
      sort_order: order,
      is_visible: true
    });
    if (res.success) {
      setItemLinkedId("");
      setShowAddItemModal(false);
      await refreshAllData();
    } else {
      alert("فشل إضافة العنصر: " + res.error);
    }
    setIsSavingSection(false);
  };

  const handleDeleteItemFromSection = async (itemId: string) => {
    if (!confirm("هل أنت متأكد من إزالة هذا العنصر من القسم؟")) return;
    const success = await deleteSupabaseHomepageSectionItem(itemId);
    if (success) {
      await refreshAllData();
    } else {
      alert("فشل إزالة العنصر.");
    }
  };

  const handleToggleItemVisibility = async (item: any) => {
    const success = await updateSupabaseHomepageSectionItem(item.id, { is_visible: !item.is_visible });
    if (success) {
      await refreshAllData();
    } else {
      alert("فشل تعديل ظهور العنصر.");
    }
  };

  const handleMoveSectionItem = async (section: any, itemIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? itemIdx - 1 : itemIdx + 1;
    const items = section.homepage_section_items || [];
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const item1 = items[itemIdx];
    const item2 = items[targetIdx];
    const success = await swapHomepageSectionItemOrderInDb(item1.id, item1.sort_order, item2.id, item2.sort_order);
    if (success) {
      await refreshAllData();
    }
  };

  const handleSaveItemOverrides = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSectionItem) return;
    setIsSavingSection(true);
    const success = await updateSupabaseHomepageSectionItem(editingSectionItem.id, {
      display_title: itemDisplayTitle || null,
      display_subtitle: itemDisplaySubtitle || null,
      display_image_url: itemDisplayImage || null
    });
    if (success) {
      setEditingSectionItem(null);
      await refreshAllData();
    } else {
      alert("فشل تعديل العنصر.");
    }
    setIsSavingSection(false);
  };

  const handleManualSeedSections = async () => {
    if (!confirm("هل تريد توليد الأقسام الافتراضية التلقائية بالصفحة الرئيسية؟ (سيتم إضافة قسم للأقسام وقسم للمنتجات)")) return;
    setIsSeedingSections(true);
    const success = await seedDefaultHomepageSections();
    if (success) {
      await refreshAllData();
      alert("تم إنشاء الأقسام الافتراضية بنجاح!");
    } else {
      alert("حدث خطأ أثناء إنشاء الأقسام الافتراضية.");
    }
    setIsSeedingSections(false);
  };

  // Handle Admin Sign In (Passcode `9999` only)
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      // Reverted to simple passcode '9922' check as requested by the user
      if (password === "9922") {
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
  const handleImageUpload = async (file: File, context: "cat" | "sub" | "prod-cover" | "prod-gallery" | "featured-card") => {
    try {
      if (context === "cat" || context === "sub" || context === "featured-card") setUploadingCatImg(true);
      if (context === "prod-cover") setUploadingProdImg(true);
      if (context === "prod-gallery") setUploadingGalleryImg(true);

      const compressedBlob = await compressImageFile(file);
      const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" });
      
      const publicUrl = await uploadProductImage(compressedFile, context);
      
      if (context === "cat") setCatImage(publicUrl);
      if (context === "sub") setSubImage(publicUrl);
      if (context === "featured-card") setFCardImage(publicUrl);
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
      await refreshAllData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // =====================================================================
  // 📂 معالجات الترتيب الفوري للأدمن (Admin Dynamic Sorting Handlers)
  // =====================================================================
  
  // 1. تبديل ترتيب الأقسام الرئيسية
  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= categoriesList.length) return;
    
    const cat1 = categoriesList[index];
    const cat2 = categoriesList[targetIdx];
    
    const success = await swapCategoryOrderInDb(cat1.id, cat1.sort_order || 0, cat2.id, cat2.sort_order || 0);
    if (success) {
      refreshAllData();
    } else {
      alert("فشل تبديل ترتيب الأقسام. يرجى التأكد من تنفيذ سكربت الترقية في Supabase SQL Editor.");
    }
  };

  // 2. تبديل ترتيب الأقسام الفرعية
  const handleMoveSubcategory = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= subcategoriesList.length) return;
    
    const sub1 = subcategoriesList[index];
    const sub2 = subcategoriesList[targetIdx];
    
    const success = await swapSubcategoryOrderInDb(sub1.id, sub1.sort_order || 0, sub2.id, sub2.sort_order || 0);
    if (success) {
      refreshAllData();
    } else {
      alert("فشل تبديل ترتيب الأقسام الفرعية. يرجى التأكد من تنفيذ سكربت الترقية في Supabase SQL Editor.");
    }
  };

  // =====================================================================
  // 📂 منطق تصفية وجرد المنتجات التفاعلي بالأقسام
  // =====================================================================
  const [prodFilterType, setProdFilterType] = useState<"all" | "category" | "subcategory">("all");
  const [prodFilterId, setProdFilterId] = useState("");

  const filteredProducts = products.filter(prod => {
    if (prodFilterType === "category") {
      return prod.categoryId === prodFilterId;
    }
    if (prodFilterType === "subcategory") {
      return prod.subcategoryId === prodFilterId;
    }
    return true;
  });

  const handleMoveProduct = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= filteredProducts.length) return;
    
    const prod1 = filteredProducts[index];
    const prod2 = filteredProducts[targetIdx];
    
    const success = await swapProductOrderInDb(prod1.id, prod1.sortOrder || 0, prod2.id, prod2.sortOrder || 0);
    if (success) {
      refreshAllData();
    } else {
      alert("فشل تبديل ترتيب المنتجات");
    }
  };

  // =====================================================================
  // 📂 الأقسام المميزة بالرئيسية (Featured Cards CRUD Handlers)
  // =====================================================================
  const handleAddFeaturedCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fCardLinkedId) {
      alert("يرجى اختيار القسم أو الفرع للمميزة");
      return;
    }

    const maxOrder = featuredCardsList.length > 0 ? Math.max(...featuredCardsList.map(i => i.sort_order || 0)) : 0;
    const newOrder = maxOrder + 1;

    const success = await addSupabaseFeaturedCard({
      display_title: fCardTitle || null,
      display_subtitle: fCardSubtitle || null,
      display_image_url: fCardImage || null,
      linked_type: fCardLinkedType,
      linked_id: fCardLinkedId,
      is_visible: fCardIsVisible,
      sort_order: newOrder
    });

    if (success) {
      setShowAddFeaturedModal(false);
      setFCardTitle("");
      setFCardSubtitle("");
      setFCardImage("");
      setFCardLinkedId("");
      setFCardLinkedType("category");
      setFCardIsVisible(true);
      refreshAllData();
    } else {
      alert("فشل إضافة القسم للمميزة");
    }
  };

  const handleEditFeaturedCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeaturedCard) return;

    const success = await updateSupabaseFeaturedCard(editingFeaturedCard.id, {
      display_title: editingFeaturedCard.display_title || null,
      display_subtitle: editingFeaturedCard.display_subtitle || null,
      display_image_url: catImage || editingFeaturedCard.display_image_url || null, // reuse catImage buffer
      linked_type: editingFeaturedCard.linked_type,
      linked_id: editingFeaturedCard.linked_id,
      is_visible: editingFeaturedCard.is_visible,
      sort_order: editingFeaturedCard.sort_order
    });

    if (success) {
      setEditingFeaturedCard(null);
      setCatImage("");
      refreshAllData();
    } else {
      alert("فشل تعديل بطاقة المميزة");
    }
  };

  const handleDeleteFeaturedCard = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه البطاقة المميزة من الصفحة الرئيسية؟")) return;
    const success = await deleteSupabaseFeaturedCard(id);
    if (success) {
      refreshAllData();
    } else {
      alert("فشل حذف البطاقة المميزة");
    }
  };

  const handleMoveFeaturedCard = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= featuredCardsList.length) return;

    const card1 = featuredCardsList[index];
    const card2 = featuredCardsList[targetIdx];

    const success = await swapFeaturedCardOrderInDb(
      card1.id, card1.sort_order || 0,
      card2.id, card2.sort_order || 0
    );

    if (success) {
      refreshAllData();
    } else {
      alert("فشل تبديل ترتيب البطاقات المميزة بالرئيسية");
    }
  };

  const handleToggleFeaturedCardVisibility = async (card: any) => {
    const success = await updateSupabaseFeaturedCard(card.id, {
      is_visible: !card.is_visible
    });
    if (success) {
      refreshAllData();
    } else {
      alert("فشل تحديث حالة ظهور البطاقة المميزة");
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
      total_amount: editingOrder.total_amount,
      event_date: editingOrder.event_date || null,
      pickup_date: editingOrder.pickup_date || null,
      return_date: editingOrder.return_date || null,
      is_preliminary: editingOrder.is_preliminary || false
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

  // Change Request Handlers
  const handleReviewRequest = (request: any, action: "approve" | "reject") => {
    setSelectedRequestForReview(request);
    setReviewAction(action);
    setAdminNoteInput("");
    setAdminPasscode("");
    setPasscodeModalOpen(true);
  };

  const handleSubmitPasscodeReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForReview || !reviewAction) return;
    
    if (adminPasscode !== "9922") {
      alert("رمز مرور المسؤول غير صحيح! يرجى إدخال الرمز الصحيح للموافقة أو الرفض.");
      return;
    }

    setIsProcessingReview(true);
    try {
      let res;
      if (reviewAction === "approve") {
        res = await adminApproveChangeRequest(
          selectedRequestForReview.id,
          adminNoteInput,
          adminPasscode
        );
      } else {
        res = await adminRejectChangeRequest(
          selectedRequestForReview.id,
          adminNoteInput,
          adminPasscode
        );
      }

      if (res.success) {
        alert(reviewAction === "approve" ? "تم قبول واعتماد التعديل وتحديث الفاتورة بنجاح!" : "تم رفض التعديل وحفظ السبب بنجاح.");
        setPasscodeModalOpen(false);
        setSelectedRequestForReview(null);
        setReviewAction(null);
        await refreshAllData();
      } else {
        alert("فشل تنفيذ الإجراء: " + res.error);
      }
    } catch (err: any) {
      alert("خطأ غير متوقع: " + err?.message);
    } finally {
      setIsProcessingReview(false);
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
      is_active: catIsActive,
      is_featured: catIsFeatured
    });

    if (success) {
      setShowAddCatModal(false);
      setCatName("");
      setCatDesc("");
      setCatImage("");
      setCatSortOrder(0);
      setCatIsFeatured(false);
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
      is_active: editingCategory.is_active,
      is_featured: editingCategory.is_featured
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
      image: subImage,
      desc: subDesc,
      is_featured: subIsFeatured,
      sort_order: subSortOrder,
      is_active: subIsActive
    });

    if (success) {
      setShowAddSubModal(false);
      setSubName("");
      setSubCatId("");
      setSubImage("");
      setSubDesc("");
      setSubIsFeatured(false);
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
      image: catImage || editingSubcategory.image, // use newly uploaded or existing
      desc: editingSubcategory.desc,
      is_featured: editingSubcategory.is_featured,
      sort_order: editingSubcategory.sort_order,
      is_active: editingSubcategory.is_active
    });

    if (success) {
      setEditingSubcategory(null);
      setCatImage("");
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
    if (!prodName.trim()) {
      alert("اسم المنتج مطلوب");
      return;
    }
    if (!prodCategoryId) {
      alert("القسم الرئيسي مطلوب");
      return;
    }
    if (prodStock < 0) {
      alert("كمية المخزن غير صالحة");
      return;
    }

    // Validation for pricing only if toggles are active
    if (prodSaleAvailable && (prodPriceSale === "" || Number(prodPriceSale) < 0)) {
      alert("يرجى إدخال سعر بيع صالح عند تفعيل خيار البيع");
      return;
    }
    if (prodRentAvailable && (prodPriceRent === "" || Number(prodPriceRent) < 0)) {
      alert("يرجى إدخال سعر إيجار صالح عند تفعيل خيار الإيجار");
      return;
    }

    // Availability validation: at least one mode must be active unless product status is unavailable or hidden
    const isUnavailableOrHidden = 
      prodStatus === "unavailable" || 
      prodStatus === "hidden" || 
      prodStatus === "غير متوفر" || 
      prodStatus === "مخفي";

    if (!prodSaleAvailable && !prodRentAvailable && !isUnavailableOrHidden) {
      alert("يجب تفعيل خيار البيع أو الإيجار أو كلاهما للمنتجات المتوفرة.");
      return;
    }

    // Resolve item_mode value based on toggles
    let resolvedItemMode = "both";
    if (prodSaleAvailable && prodRentAvailable) resolvedItemMode = "both";
    else if (prodSaleAvailable) resolvedItemMode = "sale";
    else if (prodRentAvailable) resolvedItemMode = "rent";

    const res = await addSupabaseProduct({
      name: prodName.trim(),
      priceSale: prodSaleAvailable ? prodPriceSale : "",
      priceRent: prodRentAvailable ? prodPriceRent : "",
      description: prodDescription.trim(),
      categoryId: prodCategoryId,
      subcategoryId: prodSubcategoryId || null,
      code: prodCode.trim(),
      stockQuantity: prodStock,
      status: prodStatus,
      isFeatured: prodIsFeatured,
      isHidden: prodIsHidden,
      image: prodImage,
      images: prodImages,
      sortOrder: prodSortOrder,
      itemMode: resolvedItemMode
    });

    if (res.success) {
      setShowAddProdModal(false);
      setProdName("");
      setProdPriceSale("");
      setProdPriceRent("");
      setProdSaleAvailable(true);
      setProdRentAvailable(true);
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

    if (!editingProduct.name.trim()) {
      alert("اسم المنتج مطلوب");
      return;
    }
    if (!editingProduct.categoryId) {
      alert("القسم الرئيسي مطلوب");
      return;
    }
    if (editingProduct.stockQuantity < 0) {
      alert("كمية المخزن غير صالحة");
      return;
    }

    // Pricing validation
    if (editingProduct.saleAvailable && (editingProduct.priceSale === "" || Number(editingProduct.priceSale) < 0)) {
      alert("يرجى إدخال سعر بيع صالح عند تفعيل خيار البيع");
      return;
    }
    if (editingProduct.rentAvailable && (editingProduct.priceRent === "" || Number(editingProduct.priceRent) < 0)) {
      alert("يرجى إدخال سعر إيجار صالح عند تفعيل خيار الإيجار");
      return;
    }

    const isUnavailableOrHidden = 
      editingProduct.status === "unavailable" || 
      editingProduct.status === "hidden" || 
      editingProduct.status === "غير متوفر" || 
      editingProduct.status === "مخفي";

    if (!editingProduct.saleAvailable && !editingProduct.rentAvailable && !isUnavailableOrHidden) {
      alert("يجب تفعيل خيار البيع أو الإيجار أو كلاهما للمنتجات المتوفرة.");
      return;
    }

    let resolvedItemMode = "both";
    if (editingProduct.saleAvailable && editingProduct.rentAvailable) resolvedItemMode = "both";
    else if (editingProduct.saleAvailable) resolvedItemMode = "sale";
    else if (editingProduct.rentAvailable) resolvedItemMode = "rent";

    const res = await updateSupabaseProduct(editingProduct.id, {
      name: editingProduct.name.trim(),
      priceSale: editingProduct.saleAvailable ? editingProduct.priceSale : "",
      priceRent: editingProduct.rentAvailable ? editingProduct.priceRent : "",
      description: editingProduct.description.trim(),
      categoryId: editingProduct.categoryId,
      subcategoryId: editingProduct.subcategoryId || null,
      code: editingProduct.code.trim(),
      stockQuantity: editingProduct.stockQuantity,
      status: editingProduct.status,
      isFeatured: editingProduct.isFeatured,
      isHidden: editingProduct.isHidden,
      image: prodImage || editingProduct.image,
      images: prodImages,
      sortOrder: editingProduct.sortOrder,
      itemMode: resolvedItemMode
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
    const saleAvail = prod.itemMode === "sale" || prod.itemMode === "both";
    const rentAvail = prod.itemMode === "rent" || prod.itemMode === "both";
    setEditingProduct({
      ...prod,
      status: prod.statusKey || "available",
      priceSale: prod.priceSale === null || prod.priceSale === undefined || prod.priceSale === 0 ? "" : String(prod.priceSale),
      priceRent: prod.priceRent === null || prod.priceRent === undefined || prod.priceRent === 0 ? "" : String(prod.priceRent),
      saleAvailable: saleAvail,
      rentAvailable: rentAvail
    });
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
            <div className="flex flex-col md:flex-row md:items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                  لوحة تحكم المسؤول (جاغوار)
                </h1>
                <p className="text-xs text-foreground/60 mt-1">إدارة الأقسام، المنتجات، المعارض، الفواتير، الحسابات والطلبيات بالكامل</p>
              </div>
              
              {/* Security Active Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-black self-start md:self-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                <span>🔒 لوحة التحكم نشطة ومفتوحة حالياً</span>
              </div>
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
                className="px-5 py-3 rounded-xl border border-red-500/20 bg-red-950/5 hover:bg-red-500/10 text-red-400 font-bold text-xs transition-all flex items-center gap-2 hover:scale-105"
              >
                <Lock className="w-3.5 h-3.5" />
                تسجيل الخروج وقفل اللوحة
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

            <button
              onClick={() => setActiveTab("homepage_builder")}
              className={`px-5 py-3 rounded-xl font-bold text-xs shrink-0 transition-all ${
                activeTab === "homepage_builder" ? "bg-primary text-black" : "bg-surface hover:bg-surface-hover text-foreground/75"
              }`}
            >
              <LayoutGrid className="w-4 h-4 inline-block ml-2" />
              بناء الصفحة الرئيسية
            </button>

            <button
              onClick={() => setActiveTab("change_requests")}
              className={`px-5 py-3 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center gap-1.5 relative ${
                activeTab === "change_requests" ? "bg-primary text-black" : "bg-surface hover:bg-surface-hover text-foreground/75"
              }`}
            >
              <RefreshCw className="w-4 h-4 inline-block ml-2" />
              طلبات تعديل بانتظار الموافقة
              {pendingRequestsCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
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
                  <div className="p-6 border-b border-border/60 flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-lg font-bold">جدول إدارة وحفظ وتتبع الطلبيات</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setManualSelectedCustId("");
                        setManualOrderItems([]);
                        setManualNotes("");
                        setManualEventDate("");
                        setIsManualOrderOpen(true);
                      }}
                      className="px-4 py-2 bg-primary hover:bg-primary/95 text-black font-black text-xs rounded-xl hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة طلب يدوي جديد</span>
                    </button>
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
                              <td className="p-4 font-black text-primary-light">
                                <div className="flex flex-col items-start gap-1">
                                  <span>{ord.tracking_number}</span>
                                  {changeRequests.some(r => r.order_id === ord.id && r.status === "pending") && (
                                    <span 
                                      onClick={() => setActiveTab("change_requests")}
                                      className="px-1.5 py-0.5 text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded animate-pulse shrink-0 font-bold cursor-pointer hover:bg-amber-500/35 hover:scale-105 transition-all"
                                      title="اضغط هنا للانتقال لطلبات التعديل والموافقة عليها"
                                    >
                                      ⚠️ طلب تعديل معلق
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 flex flex-col items-start gap-0.5 mt-2">
                                <span>{ord.guest_name}</span>
                                <span className={`text-[9px] font-black ${ord.customer_id ? "text-primary-light" : "text-foreground/40"}`}>
                                  {ord.customer_id ? "زبون مسجل" : "حساب محذوف / زائر"}
                                </span>
                              </td>
                              <td className="p-4">{ord.guest_city}</td>
                              <td className="p-4 truncate max-w-[200px]">{ord.guest_street}</td>
                              <td className="p-4 text-primary-light font-black">{ord.total_amount} د.ل</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${statusColors[ord.status] || "bg-foreground/5 text-foreground border-border"}`}>
                                  {statusTranslations[ord.status] || ord.status}
                                </span>
                              </td>
                              <td className="p-4 flex flex-wrap gap-1.5 items-center">
                                {/* Confirm Button */}
                                {(ord.status === "new" || ord.status === "waiting_confirmation" || ord.status === "new_order") && (
                                  <button
                                    onClick={async () => {
                                      const success = await updateSupabaseOrderStatus(ord.id, "confirmed");
                                      if (success) refreshAllData();
                                    }}
                                    className="px-2 py-1 bg-green-500 hover:bg-green-600 text-black text-[10px] font-black rounded transition-colors"
                                  >
                                    تأكيد الطلب
                                  </button>
                                )}

                                {/* Preparing Button */}
                                {ord.status === "confirmed" && (
                                  <button
                                    onClick={async () => {
                                      const success = await updateSupabaseOrderStatus(ord.id, "preparing");
                                      if (success) refreshAllData();
                                    }}
                                    className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-[10px] font-black rounded transition-colors"
                                  >
                                    قيد التجهيز
                                  </button>
                                )}

                                {/* Ready Button */}
                                {ord.status === "preparing" && (
                                  <button
                                    onClick={async () => {
                                      const success = await updateSupabaseOrderStatus(ord.id, "ready");
                                      if (success) refreshAllData();
                                    }}
                                    className="px-2 py-1 bg-teal-500 hover:bg-teal-600 text-black text-[10px] font-black rounded transition-colors"
                                  >
                                    جاهز للتسليم
                                  </button>
                                )}

                                {/* Completed Button */}
                                {(ord.status === "ready" || ord.status === "reserved") && (
                                  <button
                                    onClick={async () => {
                                      const success = await updateSupabaseOrderStatus(ord.id, "completed");
                                      if (success) refreshAllData();
                                    }}
                                    className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black rounded transition-colors"
                                  >
                                    مكتمل
                                  </button>
                                )}

                                {/* Cancel Button */}
                                {ord.status !== "completed" && ord.status !== "cancelled" && (
                                  <button
                                    onClick={async () => {
                                      if (confirm("هل تود إلغاء هذا الطلب؟")) {
                                        const success = await updateSupabaseOrderStatus(ord.id, "cancelled");
                                        if (success) refreshAllData();
                                      }
                                    }}
                                    className="px-2 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 text-[10px] font-black rounded transition-colors border border-red-500/20"
                                  >
                                    إلغاء الطلب
                                  </button>
                                )}

                                <div className="w-px h-4 bg-border/40 mx-1"></div>

                                <button
                                  onClick={() => setEditingOrder(ord)}
                                  className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary-light rounded-lg transition-colors"
                                  title="تعديل تفاصيل الطلب بالكامل"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(ord.id)}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left panel: Categories List */}
                    <div className="glass rounded-3xl border border-border p-6 space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">الأقسام الرئيسية الحالية</h3>
                        <button
                          onClick={() => setShowAddCatModal(true)}
                          className="px-4 py-2 bg-primary text-black hover:bg-primary-light rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة قسم رئيسي
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {categoriesList.map((cat, idx) => (
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

                            <div className="flex items-center gap-1">
                              {/* Simple visual Up/Down arrow sorting buttons */}
                              <button
                                onClick={() => handleMoveCategory(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-foreground/60 hover:text-primary disabled:opacity-30 transition-colors font-black text-xs"
                                title="تحريك لأعلى"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => handleMoveCategory(idx, 'down')}
                                disabled={idx === categoriesList.length - 1}
                                className="p-1.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-foreground/60 hover:text-primary disabled:opacity-30 transition-colors font-black text-xs"
                                title="تحريك لأسفل"
                              >
                                ▼
                              </button>

                              <button
                                onClick={() => openEditCategory(cat)}
                                className="p-2 bg-primary/10 hover:bg-primary/20 text-primary-light rounded-lg transition-colors ml-1"
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
                          onClick={() => {
                            // Reset state for new subcategory
                            setSubName("");
                            setSubCatId("");
                            setSubImage("");
                            setSubDesc("");
                            setSubIsFeatured(false);
                            setSubSortOrder(0);
                            setShowAddSubModal(true);
                          }}
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
                          subcategoriesList.map((sub, idx) => {
                            const parentCat = categoriesList.find(c => c.id === sub.category_id);
                            return (
                              <div key={sub.id} className="p-4 rounded-xl bg-surface/40 border border-border flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-surface shrink-0 border border-border">
                                    <Image
                                      src={resolveAssetPath(sub.image || "/placeholder.jpg")}
                                      alt={sub.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm flex items-center gap-2">
                                      {sub.name}
                                      {!sub.is_active && <EyeOff className="w-3.5 h-3.5 text-foreground/40" />}
                                    </h4>
                                    <span className="text-[10px] bg-primary/10 text-primary-light px-2 py-0.5 rounded font-black mt-1 inline-block">
                                      يتبع: {parentCat?.name || "قسم محذوف"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  {/* Simple visual Up/Down arrow sorting buttons */}
                                  <button
                                    onClick={() => handleMoveSubcategory(idx, 'up')}
                                    disabled={idx === 0}
                                    className="p-1.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-foreground/60 hover:text-primary disabled:opacity-30 transition-colors font-black text-xs"
                                    title="تحريك لأعلى"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() => handleMoveSubcategory(idx, 'down')}
                                    disabled={idx === subcategoriesList.length - 1}
                                    className="p-1.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-foreground/60 hover:text-primary disabled:opacity-30 transition-colors font-black text-xs"
                                    title="تحريك لأسفل"
                                  >
                                    ▼
                                  </button>

                                  <button
                                    onClick={() => {
                                      setEditingSubcategory(sub);
                                      // pre-fill general uploaded image helper
                                      setCatImage("");
                                    }}
                                    className="p-2 bg-primary/10 hover:bg-primary/20 text-primary-light rounded-lg transition-colors ml-1"
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

                  {/* Controllable Category/Subcategory products filter */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/40 pb-4 gap-4">
                    <div>
                      <h2 className="text-xl font-bold">معرض وجرد المنتجات المتوفرة</h2>
                      <p className="text-xs text-foreground/60 mt-1">تصفية المنتجات حسب الأقسام أو الفرعيات وإعادة ترتيبها بصرياً داخل القسم المحدد</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <select 
                        value={prodFilterType === "all" ? "all" : `${prodFilterType}:${prodFilterId}`}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "all") {
                            setProdFilterType("all");
                            setProdFilterId("");
                          } else {
                            const [type, id] = val.split(":");
                            setProdFilterType(type as any);
                            setProdFilterId(id);
                          }
                        }}
                        className="bg-surface border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary font-bold w-full sm:w-auto"
                      >
                        <option value="all">🔍 عرض جميع المنتجات</option>
                        <optgroup label="الأقسام الرئيسية">
                          {categoriesList.map(c => (
                            <option key={c.id} value={`category:${c.id}`}>{c.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="الأقسام الفرعية">
                          {subcategoriesList.map(s => {
                            const parent = categoriesList.find(c => c.id === s.category_id);
                            return (
                              <option key={s.id} value={`subcategory:${s.id}`}>{s.name} (يتبع: {parent?.name || "رئيسي"})</option>
                            );
                          })}
                        </optgroup>
                      </select>

                      <button
                        onClick={() => setShowAddProdModal(true)}
                        className="px-5 py-3 bg-primary text-black hover:bg-primary-light rounded-xl font-black text-xs flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
                      >
                        <Plus className="w-4.5 h-4.5" />
                        إضافة منتج جديد
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((prod, idx) => {
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

                              {/* Quick Subcategory Assignment */}
                              <div className="space-y-1 mt-2">
                                <label className="block text-[10px] text-foreground/45 font-bold">القسم الفرعي السريع:</label>
                                <select
                                  value={prod.subcategoryId || ""}
                                  onChange={async (e) => {
                                    const val = e.target.value || null;
                                    const res = await updateSupabaseProduct(prod.id, { subcategoryId: val });
                                    if (res.success) {
                                      await refreshAllData();
                                    } else {
                                      alert("فشل تحديث القسم الفرعي السريع: " + res.error);
                                    }
                                  }}
                                  className="w-full bg-surface border border-border rounded-lg px-2 py-1 text-[11px] text-foreground/80 focus:outline-none focus:border-primary font-bold"
                                >
                                  <option value="">-- بدون قسم فرعي (رئيسي فقط) --</option>
                                  {subcategoriesList
                                    .filter((sub: any) => sub.category_id === prod.categoryId)
                                    .map((sub: any) => (
                                      <option key={sub.id} value={sub.id}>
                                        {sub.name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-border/40 pt-4">
                              <div className="text-right">
                                <span className="text-[10px] text-foreground/40 block font-bold">سعر البيع / الإيجار</span>
                                <span className="text-primary-light font-black text-sm">{prod.priceSale} د.ل</span>
                                <span className="text-foreground/40 mx-1">/</span>
                                <span className="text-foreground/60 font-semibold text-xs">{prod.priceRent} د.ل</span>
                              </div>

                              <div className="flex gap-1.5 items-center">
                                {/* Simple visual Up/Down arrow sorting buttons */}
                                <button
                                  onClick={() => handleMoveProduct(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-foreground/60 hover:text-primary disabled:opacity-30 transition-colors font-black text-xs"
                                  title="تحريك لأعلى"
                                >
                                  ▲
                                </button>
                                <button
                                  onClick={() => handleMoveProduct(idx, 'down')}
                                  disabled={idx === products.length - 1}
                                  className="p-1.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-foreground/60 hover:text-primary disabled:opacity-30 transition-colors font-black text-xs"
                                  title="تحريك لأسفل"
                                >
                                  ▼
                                </button>

                                <button
                                  onClick={() => openEditProduct(prod)}
                                  className="p-2 bg-primary/10 hover:bg-primary/20 text-primary-light rounded-lg transition-colors ml-1"
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
                  <div className="p-6 border-b border-border/60 flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-lg font-bold">قائمة الأعضاء والزبائن المسجلين</h2>
                    <button
                      type="button"
                      onClick={() => setIsCreateCustOpen(true)}
                      className="px-4 py-2 bg-primary hover:bg-primary/95 text-black font-black text-xs rounded-xl hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إنشاء حساب زبون جديد</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-surface/50 border-b border-border/40 text-xs font-bold text-foreground/60">
                          <th className="p-4">اسم الزبون</th>
                          <th className="p-4">البريد الإلكتروني</th>
                          <th className="p-4">رقم الهاتف</th>
                          <th className="p-4">الهاتف الاحتياطي</th>
                          <th className="p-4">المدينة</th>
                          <th className="p-4">الشارع والحي</th>
                          <th className="p-4">دور العضوية</th>
                          <th className="p-4">التحكم</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((cust) => (
                          <tr key={cust.id} className="border-b border-border/30 hover:bg-surface/20 transition-all font-semibold text-sm">
                            <td className="p-4 font-black">{`${cust.first_name || ""} ${cust.last_name || ""}`.trim() || "زبون جديد"}</td>
                            <td className="p-4 text-left font-medium text-foreground/70" dir="ltr">{cust.email || "-"}</td>
                            <td className="p-4 text-left" dir="ltr">{cust.phone_number || "-"}</td>
                            <td className="p-4 text-left" dir="ltr">{cust.backup_phone || "-"}</td>
                            <td className="p-4">{cust.city || "-"}</td>
                            <td className="p-4 truncate max-w-[150px]">{cust.street || "-"}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${cust.is_admin ? "bg-primary text-black" : "bg-foreground/10 text-foreground/70"}`}>
                                {cust.is_admin ? "مسؤول (أدمن)" : "زبون مشترك"}
                              </span>
                            </td>
                            <td className="p-4 flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => {
                                  setSelectedCust(cust);
                                  setIsCustDetailsOpen(true);
                                }}
                                className="px-2 py-1 bg-surface hover:bg-surface-hover text-foreground border border-border hover:border-primary/40 text-[10px] font-black rounded transition-all flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3 text-primary" />
                                عرض التفاصيل
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCust(cust);
                                  setNewPasswordVal("");
                                  setIsResetPasswordOpen(true);
                                }}
                                className="px-2 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 text-[10px] font-black rounded transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Lock className="w-3 h-3" />
                                تغيير كلمة المرور
                              </button>
                              <button
                                onClick={() => handleSendWhatsAppAccountDetails(cust, orders.find(o => o.customer_id === cust.id))}
                                className="px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-[10px] font-black rounded transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <MessageCircle className="w-3 h-3" />
                                إرسال الحساب (واتساب)
                              </button>
                              <button
                                onClick={() => handleOpenEditCustomer(cust)}
                                className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary-light border border-primary/20 text-[10px] font-black rounded transition-all flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                تعديل المستخدم
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCust(cust);
                                  setIsCustDeleteOpen(true);
                                }}
                                className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-black rounded transition-all flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                حذف الحساب
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <form onSubmit={handleSaveSettings} className="glass p-8 rounded-3xl border border-border space-y-6">
                  
                  {/* Tab Title & Floating Save Button */}
                  <div className="flex justify-between items-center border-b border-border pb-4 mb-4 flex-wrap gap-4">
                    <div>
                      <h2 className="text-lg font-bold">تعديل نصوص وتفاصيل محتوى الموقع</h2>
                      <p className="text-xs text-foreground/50 mt-1">التحكم في كافة نصوص المتجر، قنوات التواصل، وسياسات التأجير</p>
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-6 py-2.5 bg-primary text-black hover:bg-primary-light rounded-xl font-black text-xs transition-all hover:scale-105"
                    >
                      {isSavingSettings ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                  </div>

                  {saveSuccess && (
                    <div className="p-4 text-xs font-bold text-green-400 bg-green-950/20 border border-green-500/20 rounded-xl">
                      🎉 تم حفظ جميع تعديلات نصوص الموقع وتحديثها في قاعدة البيانات السحابية بنجاح!
                    </div>
                  )}

                  {/* Sub-Tabs Nav */}
                  <div className="flex gap-2 border-b border-border/40 pb-4 overflow-x-auto snap-x hide-scrollbar">
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab("site_texts")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 snap-start ${
                        settingsSubTab === "site_texts" ? "bg-primary text-black" : "bg-surface hover:bg-surface-hover text-foreground/75"
                      }`}
                    >
                      نصوص الموقع
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab("contact_links")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 snap-start ${
                        settingsSubTab === "contact_links" ? "bg-primary text-black" : "bg-surface hover:bg-surface-hover text-foreground/75"
                      }`}
                    >
                      بيانات التواصل والشبكات
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab("rental_policy")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 snap-start ${
                        settingsSubTab === "rental_policy" ? "bg-primary text-black" : "bg-surface hover:bg-surface-hover text-foreground/75"
                      }`}
                    >
                      سياسة الإيجار
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab("order_payment")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 snap-start ${
                        settingsSubTab === "order_payment" ? "bg-primary text-black" : "bg-surface hover:bg-surface-hover text-foreground/75"
                      }`}
                    >
                      إعدادات الطلبات والدفع
                    </button>
                  </div>

                  {/* SUBTAB CONTENT 1: SITE TEXTS */}
                  {settingsSubTab === "site_texts" && (
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

                      <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">من نحن (النص التعريفي بالفوتر)</label>
                        <textarea
                          value={settings.about_text || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, about_text: e.target.value }))}
                          rows={3}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">حقوق الفوتر السفلي للموقع</label>
                        <input
                          type="text"
                          value={settings.footer_text || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, footer_text: e.target.value }))}
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
                  )}

                  {/* SUBTAB CONTENT 2: CONTACT & SOCIALS */}
                  {settingsSubTab === "contact_links" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">عنوان المتجر النصي (Address)</label>
                        <input
                          type="text"
                          value={settings.location || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="مثال: طرابلس، ليبيا"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">رابط خريطة جوجل (Google Maps Link)</label>
                        <input
                          type="text"
                          value={settings.google_maps_link || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, google_maps_link: e.target.value }))}
                          placeholder="https://maps.google.com/..."
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">رقم الهاتف للاتصال</label>
                        <input
                          type="text"
                          value={settings.contact_phone || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                          placeholder="091XXXXXXX"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left font-semibold"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">البريد الإلكتروني (Email)</label>
                        <input
                          type="email"
                          value={settings.contact_email || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                          placeholder="info@yourstore.com"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">رقم الواتساب (WhatsApp Number)</label>
                        <input
                          type="text"
                          value={settings.whatsapp_number || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                          placeholder="+218921234567"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left font-semibold"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">رابط محادثة الواتساب المباشر (WhatsApp Link)</label>
                        <input
                          type="text"
                          value={settings.whatsapp_link || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_link: e.target.value }))}
                          placeholder="https://wa.me/..."
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left"
                          dir="ltr"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">ساعات ومواعيد التواصل والعمل (Working Hours)</label>
                        <input
                          type="text"
                          value={settings.working_hours || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, working_hours: e.target.value }))}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2 border-t border-border/40 pt-4 mt-4">
                        <h4 className="text-xs font-black text-primary-light/80 mb-2">روابط منصات التواصل الاجتماعي (Social Links)</h4>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">رابط انستقرام (Instagram Link)</label>
                        <input
                          type="text"
                          value={settings.instagram_link || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, instagram_link: e.target.value }))}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">رابط تيك توك (TikTok Link)</label>
                        <input
                          type="text"
                          value={settings.tiktok_link || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, tiktok_link: e.target.value }))}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">رابط فيسبوك (Facebook Link)</label>
                        <input
                          type="text"
                          value={settings.facebook_link || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, facebook_link: e.target.value }))}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">رابط تويتر / X (Twitter Link)</label>
                        <input
                          type="text"
                          value={settings.twitter_link || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, twitter_link: e.target.value }))}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-left"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">رابط سناب شات (Snapchat Link)</label>
                        <input
                          type="text"
                          value={settings.snapchat_link || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, snapchat_link: e.target.value }))}
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
                    </div>
                  )}

                  {/* SUBTAB CONTENT 3: RENTAL POLICY */}
                  {settingsSubTab === "rental_policy" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/80">نص سياسة الإيجار بالتفصيل</label>
                        <textarea
                          value={settings.rental_policy || ""}
                          onChange={(e) => setSettings(prev => ({ ...prev, rental_policy: e.target.value }))}
                          rows={12}
                          placeholder="اكتب سياسة الإيجار والشروط هنا..."
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* SUBTAB CONTENT 4: ORDER & PAYMENT */}
                  {settingsSubTab === "order_payment" && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs md:text-sm leading-relaxed text-primary-light">
                        💡 **معلومات تنظيمية للطلبات والدفع:** الدفع الإلكتروني المباشر (سداد / موبي كاش) معطل حالياً وسيتوفر قريباً. الدفع المفعل في نظام الفوترة الآن هو الدفع عند الاستلام كاش.
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-foreground/80">تعليمات الدفع المخصصة (تظهر عند الدفع)</label>
                          <input
                            type="text"
                            value={settings.payment_instructions || "الدفع نقداً كاش أو بالتحويل عند الاستلام"}
                            onChange={(e) => setSettings(prev => ({ ...prev, payment_instructions: e.target.value }))}
                            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-foreground/80">الحد الأدنى لقيمة الطلب (د.ل)</label>
                          <input
                            type="text"
                            value={settings.min_order_amount || "0"}
                            onChange={(e) => setSettings(prev => ({ ...prev, min_order_amount: e.target.value }))}
                            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Floating/Bottom Action Bar */}
                  <div className="flex justify-between items-center pt-6 border-t border-border/40 mt-6 flex-wrap gap-4">
                    <span className="text-xs text-foreground/50">
                      * اضغط على حفظ لتطبيق التغييرات وتحديث المتجر بالكامل فورياً.
                    </span>
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-8 py-3 bg-primary text-black hover:bg-primary-light rounded-xl font-black text-xs transition-all hover:scale-105"
                    >
                      {isSavingSettings ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                  </div>

                </form>
              )}

              {/* Tab: Homepage Builder */}
              {activeTab === "homepage_builder" && (
                <div className="space-y-8 text-right">
                  <div className="glass p-8 rounded-3xl border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h2 className="text-xl font-bold">مُهندس الصفحة الرئيسية الديناميكي (Homepage Builder)</h2>
                      <p className="text-xs text-foreground/60 mt-1">تحكم كامل في الأقسام، العناصر، الصور والترتيب المعروض في واجهة المتجر</p>
                    </div>

                    <div className="flex gap-3">
                      {homepageSectionsList.length === 0 && (
                        <button
                          onClick={handleManualSeedSections}
                          disabled={isSeedingSections}
                          className="px-5 py-3 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary-light rounded-xl font-black text-xs transition-all"
                        >
                          {isSeedingSections ? "جاري التوليد..." : "🔄 توليد الأقسام الافتراضية"}
                        </button>
                      )}
                      <button
                        onClick={() => setShowAddSectionModal(true)}
                        className="px-5 py-3 bg-primary text-black hover:bg-primary-light rounded-xl font-black text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة قسم رئيسي جديد
                      </button>
                    </div>
                  </div>

                  {homepageSectionsList.length === 0 ? (
                    <div className="text-center py-20 glass rounded-3xl border border-border">
                      <p className="text-foreground/60 text-lg mb-6">لا توجد أي أقسام معروضة في الصفحة الرئيسية حالياً.</p>
                      <button onClick={() => setShowAddSectionModal(true)} className="btn-premium">➕ إضافة أول قسم الآن</button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {homepageSectionsList.map((sec, secIdx) => {
                        const items = sec.homepage_section_items || [];
                        return (
                          <div key={sec.id} className="glass p-6 rounded-2xl border border-border space-y-6 relative hover:border-primary/10 transition-colors">
                            {/* Section Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/40">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-black">{sec.title}</h3>
                                  <span className="text-[10px] bg-primary/10 text-primary-light px-2 py-0.5 rounded font-black">
                                    {sec.section_type === "categories" ? "مجموعة أقسام رئيسية" :
                                     sec.section_type === "subcategories" ? "مجموعة أقسام فرعية" :
                                     sec.section_type === "products" ? "مجموعة منتجات" : "مجموعة مختلطة"}
                                  </span>
                                  {!sec.is_visible && (
                                    <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-black">مخفي</span>
                                  )}
                                </div>
                                {sec.subtitle && <p className="text-xs text-foreground/50">{sec.subtitle}</p>}
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Up/Down order arrows for sections */}
                                <button
                                  onClick={() => handleMoveSection(secIdx, 'up')}
                                  disabled={secIdx === 0}
                                  className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-foreground/60 hover:text-primary disabled:opacity-30 transition-colors text-xs font-bold"
                                  title="تحريك للأعلى"
                                >
                                  ▲
                                </button>
                                <button
                                  onClick={() => handleMoveSection(secIdx, 'down')}
                                  disabled={secIdx === homepageSectionsList.length - 1}
                                  className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-foreground/60 hover:text-primary disabled:opacity-30 transition-colors text-xs font-bold"
                                  title="تحريك للأسفل"
                                >
                                  ▼
                                </button>

                                <button
                                  onClick={() => handleToggleSectionVisibility(sec)}
                                  className="p-2.5 bg-surface hover:bg-surface-hover border border-border rounded-xl text-foreground/80 hover:text-primary transition-colors"
                                  title={sec.is_visible ? "إخفاء القسم" : "إظهار القسم"}
                                >
                                  {sec.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-red-400" />}
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveSectionId(sec.id);
                                    setItemLinkedType(
                                      sec.section_type === "categories" ? "category" :
                                      sec.section_type === "subcategories" ? "subcategory" :
                                      sec.section_type === "products" ? "product" : "category"
                                    );
                                    setShowAddItemModal(true);
                                  }}
                                  className="px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary-light border border-primary/20 rounded-xl font-bold text-xs"
                                >
                                  ➕ إضافة عنصر
                                </button>

                                <button
                                  onClick={() => handleDeleteSection(sec.id)}
                                  className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                                  title="حذف القسم بالكامل"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Section Items Grid */}
                            {items.length === 0 ? (
                              <div className="text-center py-8 bg-surface/30 border border-dashed border-border rounded-xl">
                                <p className="text-xs text-foreground/40 font-bold">لا توجد أي عناصر مضافة داخل هذا القسم بعد.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {items.map((item: any, itemIdx: number) => {
                                  // Resolve falling back values
                                  let originalName = "عنصر غير معروف";
                                  let imagePlaceholder = "/placeholder.jpg";

                                  if (item.linked_type === "category") {
                                    const cat = categoriesList.find(c => c.id === item.linked_id);
                                    originalName = cat?.name || "قسم رئيسي غير موجود";
                                    imagePlaceholder = cat?.image || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop";
                                  } else if (item.linked_type === "subcategory") {
                                    const sub = subcategoriesList.find(s => s.id === item.linked_id);
                                    originalName = sub?.name || "قسم فرعي غير موجود";
                                    imagePlaceholder = sub?.image || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop";
                                  } else if (item.linked_type === "product") {
                                    const prod = products.find(p => p.id === item.linked_id);
                                    originalName = prod?.name || "منتج غير موجود";
                                    imagePlaceholder = prod?.image || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop";
                                  }

                                  const title = item.display_title || originalName;
                                  const image = item.display_image_url || imagePlaceholder;

                                  return (
                                    <div key={item.id} className="bg-surface/50 border border-border/70 rounded-xl overflow-hidden flex flex-col group relative">
                                      <div className="relative h-40 w-full bg-surface">
                                        <Image
                                          src={resolveAssetPath(image)}
                                          alt={title}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 640px) 100vw, 20vw"
                                        />
                                        <span className="absolute top-2 right-2 bg-black/60 text-white backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-black">
                                          {item.linked_type === "category" ? "قسم رئيسي" :
                                           item.linked_type === "subcategory" ? "قسم فرعي" : "منتج"}
                                        </span>
                                      </div>

                                      <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
                                        <div>
                                          <h4 className="font-bold text-xs truncate" title={title}>{title}</h4>
                                          {item.display_title && (
                                            <p className="text-[10px] text-foreground/40 font-semibold truncate mt-0.5">الاسم الأصلي: {originalName}</p>
                                          )}
                                        </div>

                                        <div className="flex justify-between items-center border-t border-border/20 pt-2.5">
                                          {/* Item sorting buttons */}
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => handleMoveSectionItem(sec, itemIdx, 'up')}
                                              disabled={itemIdx === 0}
                                              className="p-1 bg-surface border border-border rounded text-[10px] disabled:opacity-30"
                                            >
                                              ▲
                                            </button>
                                            <button
                                              onClick={() => handleMoveSectionItem(sec, itemIdx, 'down')}
                                              disabled={itemIdx === items.length - 1}
                                              className="p-1 bg-surface border border-border rounded text-[10px] disabled:opacity-30"
                                            >
                                              ▼
                                            </button>
                                          </div>

                                          <div className="flex gap-1.5">
                                            <button
                                              onClick={() => {
                                                setEditingSectionItem(item);
                                                setItemDisplayTitle(item.display_title || "");
                                                setItemDisplaySubtitle(item.display_subtitle || "");
                                                setItemDisplayImage(item.display_image_url || "");
                                              }}
                                              className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary-light rounded transition-colors"
                                              title="تعديل المظهر المخصص"
                                            >
                                              <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteItemFromSection(item.id)}
                                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                              title="إزالة من القسم"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Change Requests Review Panel */}
              {activeTab === "change_requests" && (
                <div className="space-y-8 text-right">
                  <div className="glass p-8 rounded-3xl border border-border">
                    <h2 className="text-xl font-bold">طلبات تعديل البيانات المحجوزة بانتظار الموافقة</h2>
                    <p className="text-xs text-foreground/60 mt-1">
                      هنا تظهر طلبات تعديل التواريخ، أرقام الهواتف أو العناوين التي يقدمها الزبائن. يمكنك مقارنة البيانات الحالية بالجديدة والموافقة عليها.
                    </p>
                  </div>

                  {changeRequests.filter(r => r.status === "pending").length === 0 ? (
                    <div className="text-center py-20 glass rounded-3xl border border-border">
                      <div className="w-16 h-16 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
                        <RefreshCw className="w-8 h-8" />
                      </div>
                      <p className="text-foreground/60 text-base font-bold">لا توجد طلبات تعديل معلقة بانتظار الموافقة حالياً.</p>
                      <p className="text-xs text-foreground/45 mt-1">ستظهر الطلبات الجديدة هنا فور تقديمها من قبل الزبائن.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {changeRequests
                        .filter(r => r.status === "pending")
                        .map((req) => {
                          const ord = req.order;
                          const changes = req.requested_changes;
                          
                          if (!ord) return null;

                          return (
                            <div key={req.id} className="glass p-6 rounded-2xl border border-amber-500/20 hover:border-amber-500/30 transition-all space-y-6">
                              
                              {/* Request Header */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/40">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black animate-pulse">طلب تعديل معلق</span>
                                    <span className="font-black text-sm text-foreground">الرقم المرجعي للطلب: <span className="text-primary-light font-black">{ord.tracking_number}</span></span>
                                  </div>
                                  <p className="text-xs text-foreground/50 mt-1 flex items-center gap-1.5 font-semibold">
                                    👤 العميل: {ord.guest_name} · رقم العميل: {req.user_id.substring(0, 8)}...
                                    · تاريخ الطلب: {new Date(req.created_at).toLocaleString("ar-LY")}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleReviewRequest(req, "approve")}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black text-xs font-black rounded-xl transition-all cursor-pointer hover:scale-105"
                                  >
                                    قبول التعديل
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReviewRequest(req, "reject")}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-black text-xs font-black rounded-xl transition-all cursor-pointer hover:scale-105"
                                  >
                                    رفض التعديل
                                  </button>
                                </div>
                              </div>

                              {/* Comparison Layout */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                                
                                {/* Current Order State */}
                                <div className="p-4 rounded-xl bg-surface/30 border border-border/50 space-y-3">
                                  <h4 className="font-bold text-foreground/50 border-b border-border/30 pb-1.5 flex items-center gap-1">
                                    <span>🔴</span>
                                    <span>البيانات الحالية للطلب</span>
                                  </h4>
                                  <div className="space-y-1.5 font-semibold text-foreground/80">
                                    <p>🛡️ نوع الحجز: {ord.is_preliminary ? <span className="text-amber-400 font-bold">⚠️ حجز مبدئي (التواريخ غير محددة)</span> : <span className="text-green-400 font-bold">حجز مؤكد التاريخ</span>}</p>
                                    {!ord.is_preliminary && (
                                      <>
                                        <p>📅 تاريخ المناسبة: <span className="text-foreground/90 font-bold">{formatArabicDate(ord.event_date)}</span></p>
                                        <p>🚚 تاريخ الاستلام: <span className="text-foreground/60">{formatArabicDate(ord.pickup_date)}</span></p>
                                        <p>🔄 تاريخ الإرجاع: <span className="text-foreground/60">{formatArabicDate(ord.return_date)}</span></p>
                                      </>
                                    )}
                                    <p>📞 رقم الهاتف الأساسي: <span className="text-foreground/80 font-bold">{ord.guest_phone || "غير متوفر"}</span></p>
                                    {ord.guest_backup_phone && <p>📞 الهاتف الاحتياطي: {ord.guest_backup_phone}</p>}
                                    <p>📍 العنوان الحالي: {ord.guest_city} · {ord.guest_street} {ord.guest_address_detail ? `· ${ord.guest_address_detail}` : ""}</p>
                                    <p className="text-primary-light">💬 ملاحظات مقاس التطريز: {ord.customer_notes || "لا يوجد"}</p>
                                  </div>
                                </div>

                                {/* Requested Changes State */}
                                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                                  <h4 className="font-bold text-amber-400 border-b border-amber-500/20 pb-1.5 flex items-center gap-1">
                                    <span>🟡</span>
                                    <span>التعديلات الجديدة المطلوبة</span>
                                  </h4>
                                  <div className="space-y-1.5 font-bold text-foreground">
                                    
                                    {/* Preliminary vs Dated */}
                                    {changes.is_preliminary_reservation !== undefined && changes.is_preliminary_reservation !== ord.is_preliminary ? (
                                      <p className="text-amber-400">🛡️ تعديل نوع الحجز: {changes.is_preliminary_reservation ? "تحويل إلى حجز مبدئي" : "تحويل إلى حجز مؤكد التاريخ"}</p>
                                    ) : null}

                                    {/* Event Date */}
                                    {changes.is_preliminary_reservation ? (
                                      <p className="text-amber-400">⚠️ سيتم تأجيل تحديد موعد المناسبة لوقت لاحق.</p>
                                    ) : (
                                      <>
                                        {changes.event_date && (
                                          <p className={changes.event_date !== ord.event_date ? "text-amber-400" : ""}>
                                            📅 تاريخ المناسبة: {formatArabicDate(changes.event_date)}
                                            {changes.event_date !== ord.event_date && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded mr-1 font-bold">معدل</span>}
                                          </p>
                                        )}
                                        {changes.pickup_date && (
                                          <p className={changes.pickup_date !== ord.pickup_date ? "text-amber-400" : ""}>
                                            🚚 تاريخ الاستلام: {formatArabicDate(changes.pickup_date)}
                                            {changes.pickup_date !== ord.pickup_date && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded mr-1 font-bold">معدل</span>}
                                          </p>
                                        )}
                                        {changes.return_date && (
                                          <p className={changes.return_date !== ord.return_date ? "text-amber-400" : ""}>
                                            🔄 تاريخ الإرجاع: {formatArabicDate(changes.return_date)}
                                            {changes.return_date !== ord.return_date && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded mr-1 font-bold">معدل</span>}
                                          </p>
                                        )}
                                      </>
                                    )}

                                    {/* Phone Changes */}
                                    {changes.customer_phone && (
                                      <p className={changes.customer_phone !== ord.guest_phone ? "text-amber-400" : ""}>
                                        📞 رقم الهاتف الأساسي: {changes.customer_phone}
                                        {changes.customer_phone !== ord.guest_phone && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded mr-1 font-bold">معدل</span>}
                                      </p>
                                    )}
                                    {changes.customer_backup_phone !== undefined && (
                                      <p className={changes.customer_backup_phone !== ord.guest_backup_phone ? "text-amber-400" : ""}>
                                        📞 الهاتف الاحتياطي: {changes.customer_backup_phone || "ملغي/فارغ"}
                                        {changes.customer_backup_phone !== ord.guest_backup_phone && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded mr-1 font-bold">معدل</span>}
                                      </p>
                                    )}

                                    {/* Address Changes */}
                                    {(changes.customer_city || changes.customer_street || changes.customer_address_details) && (
                                      <p className="text-amber-400">
                                        📍 العنوان الجديد: {changes.customer_city || ord.guest_city} · {changes.customer_street || ord.guest_street} {changes.customer_address_details !== undefined ? `· ${changes.customer_address_details}` : (ord.guest_address_detail ? `· ${ord.guest_address_detail}` : "")}
                                        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded mr-1 font-bold">معدل العنوان</span>
                                      </p>
                                    )}

                                    {/* Customer Notes */}
                                    {changes.customer_notes !== undefined && (
                                      <p className={changes.customer_notes !== ord.customer_notes ? "text-primary-light" : ""}>
                                        💬 ملاحظات مقاس التطريز: {changes.customer_notes || "ملغية/فارغة"}
                                        {changes.customer_notes !== ord.customer_notes && <span className="text-[10px] bg-primary/10 text-primary-light px-1.5 py-0.5 rounded mr-1 font-bold">معدل</span>}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Customer request note */}
                              {req.customer_note && (
                                <div className="p-4 rounded-xl bg-black/35 border border-border/80 text-xs">
                                  <p className="text-foreground/50 font-bold mb-1">💬 رسالة وتوضيح الزبون للطلب:</p>
                                  <p className="text-amber-400 font-bold italic">"{req.customer_note}"</p>
                                </div>
                              )}

                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ============================================== */}
          {/* ================ MODAL WINDOWS =============== */}
          {/* ============================================== */}

          {/* ============================================== */}
          {/* ============ HOMEPAGE BUILDER MODALS ========== */}
          {/* ============================================== */}

          {/* A. ADD SECTION MODAL */}
          {showAddSectionModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-background border border-border w-full max-w-md rounded-3xl p-8 relative space-y-6 text-right">
                <button
                  onClick={() => setShowAddSectionModal(false)}
                  className="absolute top-6 left-6 p-2 hover:bg-surface rounded-lg border border-border"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-bold border-b border-border pb-3">➕ إضافة قسم رئيسي جديد بالصفحة</h3>

                <form onSubmit={handleCreateSection} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">عنوان القسم *</label>
                    <input
                      type="text"
                      required
                      value={secTitle}
                      onChange={(e) => setSecTitle(e.target.value)}
                      placeholder="مثال: الأكثر طلباً أو جديد متجرنا"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">الوصف الفرعي للقسم</label>
                    <input
                      type="text"
                      value={secSubtitle}
                      onChange={(e) => setSecSubtitle(e.target.value)}
                      placeholder="وصف تجميلي يظهر تحت العنوان"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">نوع ومحتوى القسم *</label>
                    <select
                      value={secType}
                      onChange={(e) => setSecType(e.target.value as any)}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm font-bold"
                    >
                      <option value="categories">أقسام رئيسية فقط (Categories Grid)</option>
                      <option value="subcategories">أقسام فرعية فقط (Subcategories Grid)</option>
                      <option value="products">منتجات تخرج للبيع/الإيجار (Products Grid)</option>
                      <option value="mixed">مختلط (رئيسي / فرعي / منتجات)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSection}
                    className="btn-premium w-full mt-4 py-3 font-bold text-sm"
                  >
                    {isSavingSection ? "جاري الحفظ..." : "إضافة القسم"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* B. ADD ITEM TO SECTION MODAL */}
          {showAddItemModal && activeSectionId && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-background border border-border w-full max-w-md rounded-3xl p-8 relative space-y-6 text-right">
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="absolute top-6 left-6 p-2 hover:bg-surface rounded-lg border border-border"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-bold border-b border-border pb-3">➕ إضافة عنصر للقسم</h3>

                <form onSubmit={handleAddItemToSection} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">نوع العنصر المراد ربطه</label>
                    <select
                      value={itemLinkedType}
                      onChange={(e) => {
                        setItemLinkedType(e.target.value as any);
                        setItemLinkedId("");
                      }}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm font-bold"
                    >
                      <option value="category">قسم رئيسي (Category)</option>
                      <option value="subcategory">قسم فرعي (Subcategory)</option>
                      <option value="product">منتج معروض (Product)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">اختر العنصر للربط والربط التلقائي</label>
                    <select
                      required
                      value={itemLinkedId}
                      onChange={(e) => setItemLinkedId(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm"
                    >
                      <option value="">-- اختر من القائمة --</option>
                      {itemLinkedType === "category" &&
                        categoriesList.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))
                      }
                      {itemLinkedType === "subcategory" &&
                        subcategoriesList.map(s => {
                          const p = categoriesList.find(c => c.id === s.category_id);
                          return (
                            <option key={s.id} value={s.id}>{s.name} (الأب: {p?.name || "عام"})</option>
                          );
                        })
                      }
                      {itemLinkedType === "product" &&
                        products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} [{p.code}]</option>
                        ))
                      }
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSection || !itemLinkedId}
                    className="btn-premium w-full mt-4 py-3 font-bold text-sm"
                  >
                    {isSavingSection ? "جاري الحفظ..." : "إضافة العنصر للقسم"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* C. EDIT ITEM OVERRIDES MODAL */}
          {editingSectionItem && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-background border border-border w-full max-w-md rounded-3xl p-8 relative space-y-6 text-right">
                <button
                  onClick={() => setEditingSectionItem(null)}
                  className="absolute top-6 left-6 p-2 hover:bg-surface rounded-lg border border-border"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-bold border-b border-border pb-3">⚙️ تعديل وتخصيص بطاقة العرض بالرئيسية</h3>

                <form onSubmit={handleSaveItemOverrides} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">العنوان البديل المخصص (اتركه فارغاً للافتراضي)</label>
                    <input
                      type="text"
                      value={itemDisplayTitle}
                      onChange={(e) => setItemDisplayTitle(e.target.value)}
                      placeholder="عنوان بديل مخصص للمظهر فقط"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">الوصف البديل المخصص (اتركه فارغاً للافتراضي)</label>
                    <input
                      type="text"
                      value={itemDisplaySubtitle}
                      onChange={(e) => setItemDisplaySubtitle(e.target.value)}
                      placeholder="وصف فرعي بديل مخصص"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-foreground/60">الصورة المخصصة (اتركها فارغة للافتراضية)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={itemDisplayImage}
                        onChange={(e) => setItemDisplayImage(e.target.value)}
                        placeholder="رابط الصورة أو ارفع واحدة"
                        className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-xs text-left"
                        dir="ltr"
                      />
                      <label className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                        <Upload className="w-4 h-4 text-primary" />
                        <span>{uploadingItemImg ? "جاري الرفع..." : "رفع ملف"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadingItemImg(true);
                              try {
                                const url = await uploadProductImage(file, "sec_item_" + editingSectionItem.id);
                                setItemDisplayImage(url);
                              } catch (err) {
                                alert("فشل رفع الملف.");
                              } finally {
                                setUploadingItemImg(false);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSection || uploadingItemImg}
                    className="btn-premium w-full mt-4 py-3 font-bold text-sm"
                  >
                    {isSavingSection ? "جاري الحفظ..." : "حفظ التخصيص والعودة"}
                  </button>
                </form>
              </div>
            </div>
          )}

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

                  {/* Rental Scheduling Controls for Admin */}
                  <div className="space-y-4 p-4 rounded-2xl bg-surface border border-border">
                    <h4 className="text-xs font-black text-primary-light border-b border-border/40 pb-2 flex items-center gap-1.5">
                      <span>🗓️</span>
                      <span>جدولة وتواريخ الإيجار (خاص بالإدارة)</span>
                    </h4>
                    
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editingOrder.is_preliminary || false}
                        onChange={(e) => setEditingOrder({
                          ...editingOrder,
                          is_preliminary: e.target.checked,
                          event_date: e.target.checked ? null : editingOrder.event_date,
                          pickup_date: e.target.checked ? null : editingOrder.pickup_date,
                          return_date: e.target.checked ? null : editingOrder.return_date
                        })}
                        className="w-4.5 h-4.5 rounded border-border text-primary focus:ring-primary accent-primary"
                      />
                      <span className="text-xs font-bold">حجز مبدئي (تاريخ المناسبة والتسليم غير محدد حالياً)</span>
                    </label>

                    {!editingOrder.is_preliminary && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-foreground/50">تاريخ المناسبة</label>
                          <input
                            type="date"
                            value={editingOrder.event_date || ""}
                            onChange={(e) => setEditingOrder({ ...editingOrder, event_date: e.target.value })}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-foreground/50">تاريخ الاستلام</label>
                          <input
                            type="date"
                            value={editingOrder.pickup_date || ""}
                            onChange={(e) => setEditingOrder({ ...editingOrder, pickup_date: e.target.value })}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-foreground/50">تاريخ الإرجاع</label>
                          <input
                            type="date"
                            value={editingOrder.return_date || ""}
                            onChange={(e) => setEditingOrder({ ...editingOrder, return_date: e.target.value })}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-center"
                          />
                        </div>
                      </div>
                    )}
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

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-1">
                      <label className="block text-xs font-bold text-foreground/60">الترتيب</label>
                      <input
                        type="number"
                        value={catSortOrder}
                        onChange={(e) => setCatSortOrder(Number(e.target.value))}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-center"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-6 col-span-1">
                      <input
                        type="checkbox"
                        id="catActive"
                        checked={catIsActive}
                        onChange={(e) => setCatIsActive(e.target.checked)}
                        className="accent-primary"
                      />
                      <label htmlFor="catActive" className="text-xs font-bold">نشط</label>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-6 col-span-1">
                      <input
                        type="checkbox"
                        id="catFeatured"
                        checked={catIsFeatured}
                        onChange={(e) => setCatIsFeatured(e.target.checked)}
                        className="accent-primary"
                      />
                      <label htmlFor="catFeatured" className="text-xs font-bold text-primary-light">★ مميز</label>
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

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-1">
                      <label className="block text-xs font-bold text-foreground/60">الترتيب</label>
                      <input
                        type="number"
                        value={editingCategory.sort_order}
                        onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: Number(e.target.value) })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-center"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-6 col-span-1">
                      <input
                        type="checkbox"
                        id="catEditActive"
                        checked={editingCategory.is_active}
                        onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
                        className="accent-primary"
                      />
                      <label htmlFor="catEditActive" className="text-xs font-bold">نشط</label>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-6 col-span-1">
                      <input
                        type="checkbox"
                        id="catEditFeatured"
                        checked={editingCategory.is_featured || false}
                        onChange={(e) => setEditingCategory({ ...editingCategory, is_featured: e.target.checked })}
                        className="accent-primary"
                      />
                      <label htmlFor="catEditFeatured" className="text-xs font-bold text-primary-light">★ مميز</label>
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
              <div className="bg-background border border-border w-full max-w-md rounded-3xl p-8 relative space-y-6 text-right max-h-[90vh] overflow-y-auto">
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

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">وصف القسم الفرعي</label>
                    <textarea
                      value={subDesc}
                      onChange={(e) => setSubDesc(e.target.value)}
                      placeholder="وصف مختصر يظهر للزبون..."
                      rows={2}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-foreground/60">صورة القسم الفرعي</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 border border-dashed border-border rounded-xl p-3 bg-surface hover:bg-surface-hover cursor-pointer transition-colors text-center text-xs font-bold text-foreground/65 flex justify-center items-center gap-1.5">
                        <Upload className="w-4 h-4" />
                        {uploadingCatImg ? "جاري الرفع..." : "اختر صورة سحابية"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "sub")}
                        />
                      </label>
                    </div>
                    {subImage && (
                      <div className="relative w-full h-[120px] rounded-xl overflow-hidden border border-border group">
                        <Image src={subImage} alt="Preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setSubImage("")}
                          className="absolute top-2 left-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg shadow-black/40 flex items-center justify-center"
                          title="إزالة الصورة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-1">
                      <label className="block text-xs font-bold text-foreground/60">الترتيب</label>
                      <input
                        type="number"
                        value={subSortOrder}
                        onChange={(e) => setSubSortOrder(Number(e.target.value))}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-center"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-6 col-span-1">
                      <input
                        type="checkbox"
                        id="subActive"
                        checked={subIsActive}
                        onChange={(e) => setSubIsActive(e.target.checked)}
                        className="accent-primary"
                      />
                      <label htmlFor="subActive" className="text-xs font-bold">نشط</label>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-6 col-span-1">
                      <input
                        type="checkbox"
                        id="subIsFeatured"
                        checked={subIsFeatured}
                        onChange={(e) => setSubIsFeatured(e.target.checked)}
                        className="accent-primary"
                      />
                      <label htmlFor="subIsFeatured" className="text-xs font-bold text-primary-light">★ مميز</label>
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
              <div className="bg-background border border-border w-full max-w-md rounded-3xl p-8 relative space-y-6 text-right max-h-[90vh] overflow-y-auto">
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

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/60">وصف القسم الفرعي</label>
                    <textarea
                      value={editingSubcategory.desc || ""}
                      onChange={(e) => setEditingSubcategory({ ...editingSubcategory, desc: e.target.value })}
                      placeholder="وصف مختصر يظهر للزبون..."
                      rows={2}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-foreground/60">صورة القسم الفرعي السحابية</label>
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
                    {(catImage || editingSubcategory.image) && (
                      <div className="relative w-full h-[120px] rounded-xl overflow-hidden border border-border group">
                        <Image src={catImage || editingSubcategory.image} alt="Preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setCatImage("");
                            setEditingSubcategory({ ...editingSubcategory, image: "" });
                          }}
                          className="absolute top-2 left-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg shadow-black/40 flex items-center justify-center"
                          title="إزالة الصورة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-1">
                      <label className="block text-xs font-bold text-foreground/60">الترتيب</label>
                      <input
                        type="number"
                        value={editingSubcategory.sort_order}
                        onChange={(e) => setEditingSubcategory({ ...editingSubcategory, sort_order: Number(e.target.value) })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-center"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-6 col-span-1">
                      <input
                        type="checkbox"
                        id="subEditActive"
                        checked={editingSubcategory.is_active}
                        onChange={(e) => setEditingSubcategory({ ...editingSubcategory, is_active: e.target.checked })}
                        className="accent-primary"
                      />
                      <label htmlFor="subEditActive" className="text-xs font-bold">نشط</label>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-6 col-span-1">
                      <input
                        type="checkbox"
                        id="subEditFeatured"
                        checked={editingSubcategory.is_featured || false}
                        onChange={(e) => setEditingSubcategory({ ...editingSubcategory, is_featured: e.target.checked })}
                        className="accent-primary"
                      />
                      <label htmlFor="subEditFeatured" className="text-xs font-bold text-primary-light">★ مميز</label>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-surface/20 border border-border/60">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">خيارات البيع</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          id="prodSaleAvailable"
                          checked={prodSaleAvailable}
                          onChange={(e) => {
                            setProdSaleAvailable(e.target.checked);
                            if (!e.target.checked) setProdPriceSale("");
                          }}
                          className="accent-primary w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="prodSaleAvailable" className="text-xs font-bold cursor-pointer">متوفر للبيع</label>
                      </div>
                      {prodSaleAvailable && (
                        <div className="space-y-1 mt-2">
                          <label className="block text-[10px] font-bold text-foreground/60">سعر البيع (د.ل) *</label>
                          <input
                            type="text"
                            required
                            value={prodPriceSale}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^0\d+/.test(val)) {
                                setProdPriceSale(val.replace(/^0+/, ''));
                              } else {
                                setProdPriceSale(val);
                              }
                            }}
                            className="w-full bg-surface border border-border rounded-xl px-3 py-1.5 text-sm font-bold text-primary-light"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">خيارات الإيجار</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          id="prodRentAvailable"
                          checked={prodRentAvailable}
                          onChange={(e) => {
                            setProdRentAvailable(e.target.checked);
                            if (!e.target.checked) setProdPriceRent("");
                          }}
                          className="accent-primary w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="prodRentAvailable" className="text-xs font-bold cursor-pointer">متوفر للإيجار</label>
                      </div>
                      {prodRentAvailable && (
                        <div className="space-y-1 mt-2">
                          <label className="block text-[10px] font-bold text-foreground/60">سعر الإيجار (د.ل) *</label>
                          <input
                            type="text"
                            required
                            value={prodPriceRent}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^0\d+/.test(val)) {
                                setProdPriceRent(val.replace(/^0+/, ''));
                              } else {
                                setProdPriceRent(val);
                              }
                            }}
                            className="w-full bg-surface border border-border rounded-xl px-3 py-1.5 text-sm font-bold text-primary-light"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">حالة المنتج العامة *</label>
                      <select
                        required
                        value={prodStatus}
                        onChange={(e) => setProdStatus(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold mt-1 cursor-pointer"
                      >
                        <option value="available">متوفر (Available)</option>
                        <option value="unavailable">غير متوفر (Unavailable)</option>
                        <option value="reserved">محجوز (Reserved)</option>
                        <option value="sold">مباع (Sold)</option>
                        <option value="hidden">مخفي (Hidden)</option>
                      </select>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-surface/20 border border-border/60">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">خيارات البيع</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          id="editSaleAvailable"
                          checked={editingProduct.saleAvailable}
                          onChange={(e) => {
                            setEditingProduct({
                              ...editingProduct,
                              saleAvailable: e.target.checked,
                              priceSale: e.target.checked ? editingProduct.priceSale : ""
                            });
                          }}
                          className="accent-primary w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="editSaleAvailable" className="text-xs font-bold cursor-pointer">متوفر للبيع</label>
                      </div>
                      {editingProduct.saleAvailable && (
                        <div className="space-y-1 mt-2">
                          <label className="block text-[10px] font-bold text-foreground/60">سعر البيع (د.ل) *</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.priceSale}
                            onChange={(e) => {
                              const val = e.target.value;
                              let cleaned = val;
                              if (/^0\d+/.test(val)) {
                                cleaned = val.replace(/^0+/, '');
                              }
                              setEditingProduct({ ...editingProduct, priceSale: cleaned });
                            }}
                            className="w-full bg-surface border border-border rounded-xl px-3 py-1.5 text-sm font-bold text-primary-light"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">خيارات الإيجار</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          id="editRentAvailable"
                          checked={editingProduct.rentAvailable}
                          onChange={(e) => {
                            setEditingProduct({
                              ...editingProduct,
                              rentAvailable: e.target.checked,
                              priceRent: e.target.checked ? editingProduct.priceRent : ""
                            });
                          }}
                          className="accent-primary w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="editRentAvailable" className="text-xs font-bold cursor-pointer">متوفر للإيجار</label>
                      </div>
                      {editingProduct.rentAvailable && (
                        <div className="space-y-1 mt-2">
                          <label className="block text-[10px] font-bold text-foreground/60">سعر الإيجار (د.ل) *</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.priceRent}
                            onChange={(e) => {
                              const val = e.target.value;
                              let cleaned = val;
                              if (/^0\d+/.test(val)) {
                                cleaned = val.replace(/^0+/, '');
                              }
                              setEditingProduct({ ...editingProduct, priceRent: cleaned });
                            }}
                            className="w-full bg-surface border border-border rounded-xl px-3 py-1.5 text-sm font-bold text-primary-light"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">حالة المنتج العامة *</label>
                      <select
                        required
                        value={editingProduct.status}
                        onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-bold mt-1 cursor-pointer"
                      >
                        <option value="available">متوفر (Available)</option>
                        <option value="unavailable">غير متوفر (Unavailable)</option>
                        <option value="reserved">محجوز (Reserved)</option>
                        <option value="sold">مباع (Sold)</option>
                        <option value="hidden">مخفي (Hidden)</option>
                      </select>
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

          {/* Customer Details Modal */}
          {isCustDetailsOpen && selectedCust && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-surface border border-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface-hover">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">تفاصيل حساب العميل المشترك</h3>
                  <button onClick={() => setIsCustDetailsOpen(false)} className="p-2 hover:bg-surface rounded-full transition-all text-foreground/50 hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-right">
                  {/* Basic Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-hover border border-border/40 rounded-2xl">
                      <p className="text-[10px] text-foreground/50 font-bold mb-1">الاسم الكامل:</p>
                      <p className="font-bold text-sm">{`${selectedCust.first_name || ""} ${selectedCust.last_name || ""}`.trim() || "زبون جديد"}</p>
                    </div>
                    <div className="p-4 bg-surface-hover border border-border/40 rounded-2xl">
                      <p className="text-[10px] text-foreground/50 font-bold mb-1">البريد الإلكتروني:</p>
                      <p className="font-bold text-sm text-left" dir="ltr">{selectedCust.email || "-"}</p>
                    </div>
                    <div className="p-4 bg-surface-hover border border-border/40 rounded-2xl">
                      <p className="text-[10px] text-foreground/50 font-bold mb-1">رقم الهاتف الأساسي:</p>
                      <p className="font-bold text-sm text-left" dir="ltr">{selectedCust.phone_number || "-"}</p>
                    </div>
                    <div className="p-4 bg-surface-hover border border-border/40 rounded-2xl">
                      <p className="text-[10px] text-foreground/50 font-bold mb-1">رقم الهاتف الاحتياطي:</p>
                      <p className="font-bold text-sm text-left" dir="ltr">{selectedCust.backup_phone || "-"}</p>
                    </div>
                    <div className="p-4 bg-surface-hover border border-border/40 rounded-2xl">
                      <p className="text-[10px] text-foreground/50 font-bold mb-1">المدينة:</p>
                      <p className="font-bold text-sm">{selectedCust.city || "-"}</p>
                    </div>
                    <div className="p-4 bg-surface-hover border border-border/40 rounded-2xl">
                      <p className="text-[10px] text-foreground/50 font-bold mb-1">الشارع والحي:</p>
                      <p className="font-bold text-sm">{selectedCust.street || "-"}</p>
                    </div>
                    <div className="p-4 bg-surface-hover border border-border/40 rounded-2xl md:col-span-2">
                      <p className="text-[10px] text-foreground/50 font-bold mb-1">تفاصيل إضافية للعنوان:</p>
                      <p className="font-bold text-sm">{selectedCust.additional_address || "-"}</p>
                    </div>
                    <div className="p-3 bg-surface-hover/50 border border-border/30 rounded-xl">
                      <p className="text-[9px] text-foreground/40 font-bold">معرف العميل (User ID):</p>
                      <p className="text-[11px] font-mono text-foreground/70 text-left" dir="ltr">{selectedCust.id}</p>
                    </div>
                    <div className="p-3 bg-surface-hover/50 border border-border/30 rounded-xl">
                      <p className="text-[9px] text-foreground/40 font-bold">تاريخ الانضمام:</p>
                      <p className="text-xs font-bold text-foreground/70">{selectedCust.created_at ? new Date(selectedCust.created_at).toLocaleDateString("ar-LY", { year: "numeric", month: "long", day: "numeric" }) : "-"}</p>
                    </div>
                  </div>

                  {/* Customer Orders History */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary-light font-black text-xs">
                        {orders.filter(o => o.customer_id === selectedCust.id).length} طلبات
                      </span>
                      <h4 className="text-base font-bold text-foreground">سجل وطلبيات العميل السابقة</h4>
                    </div>

                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {orders.filter(o => o.customer_id === selectedCust.id).length === 0 ? (
                        <p className="text-xs text-foreground/45 text-center py-6 font-bold bg-surface-hover rounded-xl border border-border/30">
                          لم يقم هذا العميل بإتمام أي طلبات شراء بعد.
                        </p>
                      ) : (
                        orders.filter(o => o.customer_id === selectedCust.id).map(ord => (
                          <div key={ord.id} className="p-3 bg-surface-hover border border-border/40 rounded-xl flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black ${statusColors[ord.status] || "bg-foreground/5 text-foreground border-border"}`}>
                                {statusTranslations[ord.status] || ord.status}
                              </span>
                              <span className="font-black text-primary-light">{ord.total_amount} د.ل</span>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-foreground">{ord.tracking_number}</p>
                              <p className="text-[10px] text-foreground/50 mt-0.5">
                                {new Date(ord.created_at).toLocaleDateString("ar-LY")}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface-hover border-t border-border flex justify-end">
                  <button onClick={() => setIsCustDetailsOpen(false)} className="px-6 py-2 bg-surface hover:bg-surface-hover border border-border hover:border-foreground/20 rounded-xl text-xs font-black transition-all">
                    إغلاق النافذة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Customer Modal */}
          {isCustEditOpen && selectedCust && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-surface border border-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface-hover">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">تعديل بيانات حساب العميل</h3>
                  <button onClick={() => setIsCustEditOpen(false)} className="p-2 hover:bg-surface rounded-full transition-all text-foreground/50 hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEditCustomerSubmit} className="p-6 space-y-4 text-right">
                  {custSaveSuccess && (
                    <div className="p-4 text-xs font-bold text-green-400 bg-green-950/20 border border-green-500/20 rounded-xl">
                      🎉 تم تحديث الملف الشخصي للزبون سحابياً بنجاح!
                    </div>
                  )}

                  {/* Name (First / Last) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/80">الاسم الأول *</label>
                      <input
                        type="text"
                        required
                        value={custFirstName}
                        onChange={(e) => setCustFirstName(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/80">الاسم الأخير *</label>
                      <input
                        type="text"
                        required
                        value={custLastName}
                        onChange={(e) => setCustLastName(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold"
                      />
                    </div>
                  </div>

                  {/* Phone & Backup Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/80">الهاتف الأساسي *</label>
                      <input
                        type="tel"
                        required
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold text-left"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/80">الهاتف الاحتياطي</label>
                      <input
                        type="tel"
                        value={custBackupPhone}
                        onChange={(e) => setCustBackupPhone(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* City & Street */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/80">المدينة الافتراضية *</label>
                      <select
                        value={custCity}
                        onChange={(e) => setCustCity(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-bold"
                      >
                        {Object.entries(cityNames).map(([key, name]) => (
                          <option key={key} value={key}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/80">الشارع والحي *</label>
                      <input
                        type="text"
                        required
                        value={custStreet}
                        onChange={(e) => setCustStreet(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold"
                      />
                    </div>
                  </div>

                  {/* Additional address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/80">تفاصيل إضافية للعنوان</label>
                    <input
                      type="text"
                      value={custAdditionalAddress}
                      onChange={(e) => setCustAdditionalAddress(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border justify-end">
                    <button
                      type="button"
                      onClick={() => setIsCustEditOpen(false)}
                      className="px-6 py-3 bg-surface hover:bg-surface-hover border border-border hover:border-foreground/20 rounded-xl text-xs font-black transition-all"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingCust}
                      className="btn-premium px-8 py-3 text-xs font-black flex items-center gap-1.5"
                    >
                      {isSavingCust ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "حفظ البيانات"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Customer Account Modal */}
          {isCustDeleteOpen && selectedCust && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-surface border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface-hover">
                  <h3 className="text-xl font-bold text-red-400">⚠️ تأكيد حذف حساب العميل</h3>
                  <button onClick={() => setIsCustDeleteOpen(false)} className="p-2 hover:bg-surface rounded-full transition-all text-foreground/50 hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-right">
                  <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl text-xs leading-relaxed text-red-400 font-bold">
                    ⚠️ **تحذير شديد اللهجة:** 
                    “هل أنت متأكد من حذف حساب هذا المستخدم بالكامل؟ لا يمكن التراجع عن هذه العملية. ستبقى الطلبات السابقة محفوظة لأغراض السجل.”
                  </div>
                  
                  <div className="text-xs text-foreground/70 space-y-1">
                    <p>**الاسم**: {`${selectedCust.first_name || ""} ${selectedCust.last_name || ""}`.trim()}</p>
                    <p>**البريد الإلكتروني**: {selectedCust.email || "-"}</p>
                    <p>**معرف المستخدم**: <span className="font-mono">{selectedCust.id}</span></p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border justify-end">
                    <button
                      type="button"
                      disabled={isDeletingCust}
                      onClick={() => setIsCustDeleteOpen(false)}
                      className="px-6 py-3 bg-surface hover:bg-surface-hover border border-border hover:border-foreground/20 rounded-xl text-xs font-black transition-all"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingCust}
                      onClick={handleDeleteCustomerSubmit}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                    >
                      {isDeletingCust ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "نعم، احذف الحساب بالكامل"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Change Request Passcode Verification Dialog Modal */}
          {passcodeModalOpen && selectedRequestForReview && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4" dir="rtl">
              <div className="glass rounded-3xl border border-primary/20 w-full max-w-md p-6 md:p-8 text-right space-y-6 relative">
                
                <button
                  onClick={() => setPasscodeModalOpen(false)}
                  className="absolute top-6 left-6 w-8 h-8 rounded-full border border-border/80 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-surface transition-all text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>

                <div className="text-center space-y-2">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border ${
                    reviewAction === "approve" 
                      ? "bg-green-500/10 text-green-400 border-green-500/25" 
                      : "bg-red-500/10 text-red-400 border-red-500/25"
                  }`}>
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black">
                    {reviewAction === "approve" ? "اعتماد وقبول طلب التعديل" : "رفض وإلغاء طلب التعديل"}
                  </h3>
                  <p className="text-xs text-foreground/55 max-w-xs mx-auto">
                    {reviewAction === "approve" 
                      ? "سيتم تطبيق التعديلات الموثوقة فقط وتحديث تفاصيل الفاتورة وتوقيت الإيجار فورياً."
                      : "لن يتم تغيير أي بيانات في الطلبية وسيتم حفظ قرار الرفض وسبب الرفض للزبون."}
                  </p>
                </div>

                <form onSubmit={handleSubmitPasscodeReview} className="space-y-4">
                  {/* Admin feedback note */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">
                      {reviewAction === "approve" ? "ملاحظة أو تعليق الإدارة للزبون (اختياري)" : "سبب وتوضيح الرفض للزبون *"}
                    </label>
                    <input
                      type="text"
                      required={reviewAction === "reject"}
                      placeholder={reviewAction === "approve" ? "مثال: تم قبول وتعديل الموعد بنجاح" : "مثال: هذا الموعد محجوز بالكامل أو يرجى اختيار تاريخ آخر"}
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                    />
                  </div>

                  {/* Passcode input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">رمز مرور المسؤول لتأكيد العملية *</label>
                    <input
                      type="password"
                      required
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="إدخال رمز المرور الإداري المكون من 4 أرقام"
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground text-center tracking-widest font-black"
                      dir="ltr"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingReview}
                    className={`w-full py-3.5 rounded-xl font-black text-sm transition-all hover:scale-[1.02] cursor-pointer flex justify-center items-center gap-1.5 ${
                      reviewAction === "approve"
                        ? "bg-green-500 text-black hover:bg-green-600"
                        : "bg-red-500 text-black hover:bg-red-600"
                    }`}
                  >
                    {isProcessingReview ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Check className="w-4.5 h-4.5" />
                        تأكيد وإتمام العملية الآن
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
          
          {/* ======================================= */}
          {/* Modal: Create Customer Account */}
          {/* ======================================= */}
          {isCreateCustOpen && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[999] flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
              <div className="glass rounded-3xl border border-primary/20 w-full max-w-2xl my-8 p-6 md:p-8 text-right space-y-6 relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setIsCreateCustOpen(false)}
                  className="absolute top-6 left-6 w-8 h-8 rounded-full border border-border/80 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-surface transition-all text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>

                <div className="space-y-2 border-b border-border/60 pb-4">
                  <h3 className="text-xl font-black text-primary flex items-center gap-2">
                    <UserPlus className="w-6 h-6" />
                    <span>إنشاء حساب زبون جديد</span>
                  </h3>
                  <p className="text-xs text-foreground/75">قم بملء البيانات التالية لتسجيل الزبون تلقائياً في Supabase Auth وقاعدة البيانات.</p>
                </div>

                <form onSubmit={handleCreateCustomerSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">اسم المستخدم (بالأحرف الإنجليزية والأرقام فقط) *</label>
                      <input
                        type="text"
                        required
                        pattern="^[a-zA-Z0-9_]+$"
                        value={createUsername}
                        onChange={(e) => setCreateUsername(e.target.value)}
                        placeholder="مثال: ali_99"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">كلمة المرور للحساب *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        placeholder="كلمة مرور الحساب"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">الاسم الكامل للزبون</label>
                      <input
                        type="text"
                        value={createFullName}
                        onChange={(e) => setCreateFullName(e.target.value)}
                        placeholder="الاسم الكامل"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">البريد الإلكتروني (اختياري)</label>
                      <input
                        type="email"
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.target.value)}
                        placeholder="ali@example.com"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">رقم الهاتف الأساسي</label>
                      <input
                        type="tel"
                        value={createPhone}
                        onChange={(e) => setCreatePhone(e.target.value)}
                        placeholder="091XXXXXXX"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">رقم الهاتف الاحتياطي</label>
                      <input
                        type="tel"
                        value={createBackupPhone}
                        onChange={(e) => setCreateBackupPhone(e.target.value)}
                        placeholder="092XXXXXXX"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">المدينة</label>
                      <select
                        value={createCity}
                        onChange={(e) => setCreateCity(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                      >
                        {Object.keys(cityNames).map((key) => (
                          <option key={key} value={key}>{cityNames[key]}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">الشارع والحي</label>
                      <input
                        type="text"
                        value={createStreet}
                        onChange={(e) => setCreateStreet(e.target.value)}
                        placeholder="مثال: شارع النصر"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">تفاصيل إضافية للعنوان</label>
                    <textarea
                      value={createAddressDetails}
                      onChange={(e) => setCreateAddressDetails(e.target.value)}
                      placeholder="بجوار مدرسة النور أو مسجد التوبة"
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground h-20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">رابط الموقع على Google Maps — اختياري</label>
                    <input
                      type="url"
                      value={createGoogleMapsLink}
                      onChange={(e) => setCreateGoogleMapsLink(e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground text-left"
                      dir="ltr"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingCust}
                    className="w-full py-3.5 bg-primary text-black hover:bg-primary/90 font-black text-sm rounded-xl transition-all hover:scale-[1.02] cursor-pointer flex justify-center items-center gap-1.5"
                  >
                    {isCreatingCust ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>إنشاء الحساب وتفعيل العضوية</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* Modal: Admin Password Reset */}
          {/* ======================================= */}
          {isResetPasswordOpen && selectedCust && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[999] flex items-center justify-center p-4" dir="rtl">
              <div className="glass rounded-3xl border border-primary/20 w-full max-w-md p-6 md:p-8 text-right space-y-6 relative">
                <button
                  onClick={() => setIsResetPasswordOpen(false)}
                  className="absolute top-6 left-6 w-8 h-8 rounded-full border border-border/80 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-surface transition-all text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>

                <div className="space-y-2 border-b border-border/60 pb-3">
                  <h3 className="text-lg font-black text-yellow-500 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    <span>تغيير كلمة المرور للزبون</span>
                  </h3>
                  <p className="text-xs text-foreground/75">
                    تعديل كلمة مرور الحساب للزبون: <strong className="text-primary">{selectedCust.name || selectedCust.username}</strong>
                  </p>
                </div>

                <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">كلمة المرور الجديدة (6 خانات على الأقل) *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPasswordVal}
                      onChange={(e) => setNewPasswordVal(e.target.value)}
                      placeholder="أدخل كلمة المرور الجديدة"
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">رمز تأكيد المسؤول لـ Supabase Auth API *</label>
                    <input
                      type="password"
                      required
                      value={resetPasscodeVal}
                      onChange={(e) => setResetPasscodeVal(e.target.value)}
                      placeholder="9922"
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground text-center tracking-widest font-black"
                      dir="ltr"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="w-full py-3.5 bg-yellow-500 text-black hover:bg-yellow-600 font-black text-sm rounded-xl transition-all hover:scale-[1.02] cursor-pointer flex justify-center items-center gap-1.5"
                  >
                    {isResettingPassword ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Check className="w-4.5 h-4.5" />
                        <span>تحديث كلمة المرور آمنياً</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* Modal: Admin Manual Order Creation */}
          {/* ======================================= */}
          {isManualOrderOpen && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[999] flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
              <div className="glass rounded-3xl border border-primary/20 w-full max-w-3xl my-8 p-6 md:p-8 text-right space-y-6 relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setIsManualOrderOpen(false)}
                  className="absolute top-6 left-6 w-8 h-8 rounded-full border border-border/80 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-surface transition-all text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>

                <div className="space-y-2 border-b border-border/60 pb-4">
                  <h3 className="text-xl font-black text-primary flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    <span>إضافة طلب يدوي جديد</span>
                  </h3>
                  <p className="text-xs text-foreground/75">قم بإنشاء طلبية يدوية وربطها بحساب زبون مسجل أو إنشاء حساب زبون جديد وتوصيله بالطلبية فوراً.</p>
                </div>

                <form onSubmit={handleManualOrderSubmit} className="space-y-6">
                  
                  {/* Customer Type Choice */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-foreground/80">ربط الطلبية بحساب زبون</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setManualCustType("existing")}
                        className={`py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          manualCustType === "existing"
                            ? "bg-primary text-black border-primary"
                            : "bg-surface border-border text-foreground/70"
                        }`}
                      >
                        حساب زبون مسجل مسبقاً
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualCustType("new")}
                        className={`py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          manualCustType === "new"
                            ? "bg-primary text-black border-primary"
                            : "bg-surface border-border text-foreground/70"
                        }`}
                      >
                        إنشاء حساب زبون جديد فوراً
                      </button>
                    </div>
                  </div>

                  {/* Customer Block Fields */}
                  {manualCustType === "existing" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface/30 p-4 rounded-2xl border border-border/60">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-bold text-foreground/80">اختر حساب الزبون المسجل *</label>
                        <select
                          value={manualSelectedCustId}
                          onChange={(e) => setManualSelectedCustId(e.target.value)}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        >
                          <option value="">-- يرجى اختيار زبون مسجل --</option>
                          {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.username} ({c.phone_number || "بدون هاتف"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">اسم المستلم</label>
                        <input
                          type="text"
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          placeholder="اسم المستلم"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">رقم الهاتف للطلب</label>
                        <input
                          type="tel"
                          value={manualPhone}
                          onChange={(e) => setManualPhone(e.target.value)}
                          placeholder="رقم الهاتف"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">الهاتف الاحتياطي للطلب</label>
                        <input
                          type="tel"
                          value={manualBackupPhone}
                          onChange={(e) => setManualBackupPhone(e.target.value)}
                          placeholder="رقم احتياطي"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">المدينة للطلب</label>
                        <select
                          value={manualCity}
                          onChange={(e) => setManualCity(e.target.value)}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        >
                          {Object.keys(cityNames).map((key) => (
                            <option key={key} value={key}>{cityNames[key]}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">الشارع والحي للطلب</label>
                        <input
                          type="text"
                          value={manualStreet}
                          onChange={(e) => setManualStreet(e.target.value)}
                          placeholder="الشارع"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">تفاصيل العنوان</label>
                        <input
                          type="text"
                          value={manualAddressDetail}
                          onChange={(e) => setManualAddressDetail(e.target.value)}
                          placeholder="مثال: بالقرب من.."
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-bold text-foreground/80">رابط الموقع على Google Maps — اختياري</label>
                        <input
                          type="url"
                          value={manualGoogleMaps}
                          onChange={(e) => setManualGoogleMaps(e.target.value)}
                          placeholder="https://maps.app.goo.gl/..."
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/20">
                      <div className="md:col-span-2 border-b border-border/40 pb-2">
                        <h4 className="text-xs font-black text-primary">بيانات حساب الزبون الجديد لتسجيله تلقائياً في Supabase</h4>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">اسم المستخدم (إنجليزي وأرقام فقط) *</label>
                        <input
                          type="text"
                          required
                          pattern="^[a-zA-Z0-9_]+$"
                          value={manualNewUsername}
                          onChange={(e) => setManualNewUsername(e.target.value)}
                          placeholder="مثال: sameh_8"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">كلمة المرور للزبون *</label>
                        <input
                          type="text"
                          required
                          minLength={6}
                          value={manualNewPassword}
                          onChange={(e) => setManualNewPassword(e.target.value)}
                          placeholder="كلمة مرور الحساب"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">الاسم الكامل للزبون *</label>
                        <input
                          type="text"
                          required
                          value={manualNewFullName}
                          onChange={(e) => setManualNewFullName(e.target.value)}
                          placeholder="الاسم الثلاثي"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">رقم الهاتف للزبون الجديد *</label>
                        <input
                          type="tel"
                          required
                          value={manualNewPhone}
                          onChange={(e) => setManualNewPhone(e.target.value)}
                          placeholder="091XXXXXXX"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">الهاتف الاحتياطي</label>
                        <input
                          type="tel"
                          value={manualNewBackupPhone}
                          onChange={(e) => setManualNewBackupPhone(e.target.value)}
                          placeholder="رقم هاتف احتياطي"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">المدينة</label>
                        <select
                          value={manualNewCity}
                          onChange={(e) => setManualNewCity(e.target.value)}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        >
                          {Object.keys(cityNames).map((key) => (
                            <option key={key} value={key}>{cityNames[key]}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">الشارع والحي</label>
                        <input
                          type="text"
                          value={manualNewStreet}
                          onChange={(e) => setManualNewStreet(e.target.value)}
                          placeholder="اسم الشارع"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">تفاصيل إضافية للعنوان</label>
                        <input
                          type="text"
                          value={manualNewAddressDetail}
                          onChange={(e) => setManualNewAddressDetail(e.target.value)}
                          placeholder="توجيهات العنوان"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-bold text-foreground/80">رابط الموقع على Google Maps — اختياري</label>
                        <input
                          type="url"
                          value={manualNewGoogleMaps}
                          onChange={(e) => setManualNewGoogleMaps(e.target.value)}
                          placeholder="https://maps.app.goo.gl/..."
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  )}

                  {/* Date selection section */}
                  <div className="space-y-4 bg-surface/20 p-4 rounded-2xl border border-border/60">
                    <h4 className="text-xs font-black text-primary border-b border-border/30 pb-1.5">مواعيد المناسبة وحجز الفستان</h4>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="manualIsPreliminary"
                        checked={manualIsPreliminary}
                        onChange={(e) => setManualIsPreliminary(e.target.checked)}
                        className="w-4 h-4 text-primary bg-surface border-border rounded accent-primary cursor-pointer"
                      />
                      <label htmlFor="manualIsPreliminary" className="text-xs font-bold text-foreground cursor-pointer">
                        حجز مبدئي — لم يتم تحديد موعد المناسبة بعد
                      </label>
                    </div>

                    {!manualIsPreliminary && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-foreground/80">تاريخ المناسبة / التخرج *</label>
                          <input
                            type="date"
                            required={!manualIsPreliminary}
                            value={manualEventDate}
                            onChange={(e) => setManualEventDate(e.target.value)}
                            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground text-center"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-foreground/80">خيار الإرجاع</label>
                          <select
                            value={manualReturnOption}
                            onChange={(e) => setManualReturnOption(e.target.value as any)}
                            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                          >
                            <option value="same_day">يوم المناسبة (إرجاع في نفس اليوم)</option>
                            <option value="next_day">اليوم التالي للمناسبة (إرجاع اليوم التالي)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-foreground/60">تاريخ الاستلام المحسوب تلقائياً (تجنب الجمعة)</label>
                          <input
                            type="date"
                            readOnly
                            value={manualPickupDate}
                            className="w-full bg-surface/50 border border-border/40 rounded-xl px-4 py-2.5 text-sm text-foreground/70 text-center cursor-not-allowed"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-foreground/60">تاريخ الإرجاع المحسوب تلقائياً (تجنب الجمعة)</label>
                          <input
                            type="date"
                            readOnly
                            value={manualReturnDate}
                            className="w-full bg-surface/50 border border-border/40 rounded-xl px-4 py-2.5 text-sm text-foreground/70 text-center cursor-not-allowed"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add Product Items picker */}
                  <div className="space-y-3 bg-surface/20 p-4 rounded-2xl border border-border/60">
                    <h4 className="text-xs font-black text-primary border-b border-border/30 pb-1.5">اختر المنتجات المطلوبة</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-bold text-foreground/80">المنتج</label>
                        <select
                          value={selectorProductId}
                          onChange={(e) => setSelectorProductId(e.target.value)}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        >
                          <option value="">-- اختر المنتج --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (بيع: {p.priceSale} د.ل | إيجار: {p.priceRent} د.ل)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">الكمية</label>
                        <input
                          type="number"
                          min={1}
                          value={selectorQuantity}
                          onChange={(e) => setSelectorQuantity(parseInt(e.target.value) || 1)}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground text-center"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground/80">نوع الطلب</label>
                        <select
                          value={selectorMode}
                          onChange={(e) => setSelectorMode(e.target.value as any)}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                        >
                          <option value="rent">إيجار</option>
                          <option value="sale">شراء (بيع)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!selectorProductId) return;
                        const exists = manualOrderItems.find(item => item.id === selectorProductId && item.mode === selectorMode);
                        if (exists) {
                          exists.quantity += selectorQuantity;
                          setManualOrderItems([...manualOrderItems]);
                        } else {
                          setManualOrderItems([...manualOrderItems, { id: selectorProductId, quantity: selectorQuantity, mode: selectorMode }]);
                        }
                        setSelectorProductId("");
                        setSelectorQuantity(1);
                      }}
                      className="px-4 py-2 bg-foreground text-background font-bold text-xs rounded-lg hover:scale-105 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة المنتج لقائمة الفاتورة
                    </button>

                    {/* Added Products Table */}
                    {manualOrderItems.length > 0 && (
                      <div className="mt-4 border border-border/40 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-right border-collapse">
                          <thead>
                            <tr className="bg-surface/50 border-b border-border/40 font-bold text-foreground/60">
                              <th className="p-3">اسم المنتج</th>
                              <th className="p-3">النوع</th>
                              <th className="p-3">السعر الفردي</th>
                              <th className="p-3">الكمية</th>
                              <th className="p-3">المجموع</th>
                              <th className="p-3 text-center">التحكم</th>
                            </tr>
                          </thead>
                          <tbody>
                            {manualOrderItems.map((item, idx) => {
                              const prod = products.find(p => p.id === item.id);
                              const price = item.mode === "rent" ? (prod?.priceRent || 0) : (prod?.priceSale || 0);
                              const subtotal = price * item.quantity;
                              return (
                                <tr key={idx} className="border-b border-border/20 bg-surface/10">
                                  <td className="p-3 font-bold">{prod?.name || "منتج غير معروف"}</td>
                                  <td className="p-3">{item.mode === "rent" ? "إيجار" : "بيع (شراء)"}</td>
                                  <td className="p-3 font-mono">{price} د.ل</td>
                                  <td className="p-3 font-mono">{item.quantity}</td>
                                  <td className="p-3 font-mono font-bold text-primary">{subtotal} د.ل</td>
                                  <td className="p-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const copy = [...manualOrderItems];
                                        copy.splice(idx, 1);
                                        setManualOrderItems(copy);
                                      }}
                                      className="px-2 py-1 bg-red-600/10 hover:bg-red-600/25 text-red-500 rounded font-black cursor-pointer"
                                    >
                                      حذف
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="bg-surface/60 p-4 flex justify-between items-center border-t border-border/30 font-black text-sm">
                          <span>إجمالي الفاتورة المطلوب سداده:</span>
                          <span className="text-primary font-mono text-base">
                            {manualOrderItems.reduce((acc, item) => {
                              const prod = products.find(p => p.id === item.id);
                              const price = item.mode === "rent" ? (prod?.priceRent || 0) : (prod?.priceSale || 0);
                              return acc + (price * item.quantity);
                            }, 0)} د.ل
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* General order fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">طريقة الدفع للطلب اليدوي</label>
                      <select
                        value={manualPayment}
                        onChange={(e) => setManualPayment(e.target.value as any)}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                      >
                        <option value="cash_on_delivery">الدفع عند الاستلام (كاش)</option>
                        <option value="sadad">سداد (Sadad)</option>
                        <option value="mobicash">موبي كاش (MobiCash)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">ملاحظات إضافية للطلبية اليدوية</label>
                      <input
                        type="text"
                        value={manualNotes}
                        onChange={(e) => setManualNotes(e.target.value)}
                        placeholder="مثال: يرجى تنظيف الفستان بعناية"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingManualOrder}
                    className="w-full py-4 bg-primary text-black hover:bg-primary/90 font-black text-sm rounded-xl transition-all hover:scale-[1.02] cursor-pointer flex justify-center items-center gap-1.5"
                  >
                    {isSubmittingManualOrder ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>تسجيل وحفظ الفاتورة اليدوية وإرسال تفاصيل الحساب</span>
                      </>
                    )}
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
