import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash, Eye, Image as ImageIcon, Printer, X, 
  Check, AlertCircle, RefreshCw, Barcode, Tags, Sparkles
} from 'lucide-react';
import { uploadProductImage, addProduct, updateProduct, deleteProduct } from '@/lib/supabase';

interface ProductManagerProps {
  products: any[];
  onRefresh: () => void;
}

export default function ProductManager({ products, onRefresh }: ProductManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'كاب',
    size: '',
    colors: '',
    notes: '',
    quantity: 1,
    status: 'available',
    price_sale: 0,
    price_rent: 0,
    item_mode: 'both',
    // Sash-specific
    is_edged: false,
    layer_type: 'ثنائي',
    fabric_type: 'مخمل',
    color_sash: '',
    color_print: '',
    color_embroidery: '',
    image: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const categoriesList = [
    'كاب', 'قبعة', 'شال', 'اكسسوارات التخرج', 'بروش', 'طباعة شال', 'تطريز شال'
  ];

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        category: editingProduct.category || 'كاب',
        size: editingProduct.size || '',
        colors: editingProduct.colors || '',
        notes: editingProduct.notes || '',
        quantity: editingProduct.quantity || 1,
        status: editingProduct.status || 'available',
        price_sale: editingProduct.price_sale || 0,
        price_rent: editingProduct.price_rent || 0,
        item_mode: editingProduct.item_mode || 'both',
        is_edged: !!editingProduct.is_edged,
        layer_type: editingProduct.layer_type || 'ثنائي',
        fabric_type: editingProduct.fabric_type || 'مخمل',
        color_sash: editingProduct.color_sash || '',
        color_print: editingProduct.color_print || '',
        color_embroidery: editingProduct.color_embroidery || '',
        image: editingProduct.image || '',
      });
      setImagePreview(editingProduct.image || '');
    } else {
      setFormData({
        name: '',
        category: 'كاب',
        size: '',
        colors: '',
        notes: '',
        quantity: 1,
        status: 'available',
        price_sale: 0,
        price_rent: 0,
        item_mode: 'both',
        is_edged: false,
        layer_type: 'ثنائي',
        fabric_type: 'مخمل',
        color_sash: '',
        color_print: '',
        color_embroidery: '',
        image: '',
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [editingProduct, isModalOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let finalImageUrl = formData.image;

      // Upload image if file exists
      if (imageFile) {
        setIsUploading(true);
        try {
          finalImageUrl = await uploadProductImage(imageFile);
        } catch (uploadErr: any) {
          console.error("Image upload error:", uploadErr);
          setErrorMsg("حدث خطأ أثناء رفع الصورة، سيتم حفظ المنتج بدون صورة.");
        } finally {
          setIsUploading(false);
        }
      }

      const productPayload = {
        ...formData,
        image: finalImageUrl,
        // Auto-generation handled by supabase helper if code/barcode empty
        code: editingProduct ? editingProduct.code : `JG-${Math.floor(100000 + Math.random() * 900000)}`,
        barcode: editingProduct ? editingProduct.barcode : `BAR-${Math.floor(10000000 + Math.random() * 90000000)}`
      };

      if (editingProduct) {
        const success = await updateProduct(editingProduct.id, productPayload);
        if (!success) throw new Error("فشل تحديث المنتج في قاعدة البيانات");
        setSuccessMsg("تم تحديث المنتج بنجاح!");
      } else {
        const res = await addProduct(productPayload);
        if (!res.success) throw new Error(res.error || "فشل إضافة المنتج");
        setSuccessMsg("تم إضافة المنتج الجديد بنجاح!");
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setEditingProduct(null);
        onRefresh();
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) {
      const success = await deleteProduct(id);
      if (success) {
        onRefresh();
      } else {
        alert("حدث خطأ أثناء حذف المنتج.");
      }
    }
  };

  const printBarcode = (product: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>طباعة ملصق الباركود - ${product.name}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; }
            .badge-card { border: 1px solid #ccc; padding: 15px; display: inline-block; border-radius: 8px; width: 200px; }
            .store-name { font-size: 12px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
            .product-name { font-size: 14px; margin-bottom: 10px; }
            .barcode-text { font-family: monospace; font-size: 16px; letter-spacing: 2px; font-weight: bold; background: #eee; padding: 5px; display: block; margin: 10px 0; }
            .price { font-size: 13px; font-weight: bold; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="badge-card">
            <div class="store-name">جاغوار للمناسبات</div>
            <div class="product-name">${product.name}</div>
            <div class="barcode-text">*${product.barcode}*</div>
            <div class="price">الكود: ${product.code}</div>
            <div class="price" style="margin-top: 5px;">السعر: ${product.price_sale} د.ل</div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const isSashCategory = (cat: string) => {
    return cat === 'شال' || cat === 'طباعة شال' || cat === 'تتريز شال' || cat === 'تطريز شال';
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tags size={20} className="text-amber-500" />
            إدارة مستودع المنتجات
          </h2>
          <p className="text-xs text-gray-400 mt-1">عرض وتعديل وإضافة منتجات متجر جاغوار.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="btn-premium py-2 px-4 rounded-lg flex items-center gap-1.5 text-xs"
        >
          <Plus size={14} />
          إضافة منتج جديد
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute right-3 top-2.5 text-gray-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="ابحث باسم المنتج، الكود، الباركود، أو التصنيف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none rounded-lg py-2 pr-10 pl-4 text-xs text-white transition-all"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none rounded-lg py-2 px-4 text-xs text-white transition-all md:w-48"
        >
          <option value="all">جميع التصنيفات</option>
          {categoriesList.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-500 text-xs">
            <AlertCircle size={32} className="mx-auto mb-2 text-zinc-700" />
            لم يتم العثور على أي منتجات تطابق البحث.
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <div key={prod.id} className="glass rounded-xl overflow-hidden border border-zinc-800 flex flex-col justify-between hover:border-amber-500/30 transition-all group">
              {/* Image Preview Container */}
              <div className="aspect-video w-full bg-zinc-950 relative overflow-hidden flex items-center justify-center">
                {prod.image ? (
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <ImageIcon size={36} className="text-zinc-800" />
                )}
                
                {/* Floating Tags */}
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    prod.status === 'available' ? 'badge-available' :
                    prod.status === 'reserved' ? 'badge-reserved' :
                    prod.status === 'rented' ? 'badge-rented' : 'badge-unavailable'
                  }`}>
                    {prod.status === 'available' && 'متوفر'}
                    {prod.status === 'reserved' && 'محجوز'}
                    {prod.status === 'rented' && 'مؤجر'}
                    {prod.status === 'unavailable' && 'غير متوفر'}
                  </span>
                  <span className="bg-black/70 text-[9px] text-gray-300 px-2 py-0.5 rounded-full border border-zinc-800 font-bold">
                    {prod.category}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 space-y-2">
                <h3 className="font-bold text-white text-sm line-clamp-1">{prod.name}</h3>
                
                {/* Code & Barcode */}
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span>كود: {prod.code}</span>
                  <span className="flex items-center gap-1">
                    <Barcode size={10} />
                    {prod.barcode}
                  </span>
                </div>

                {/* Specific features for Sash */}
                {isSashCategory(prod.category) && (
                  <div className="bg-zinc-900/40 p-2 rounded border border-zinc-900 text-[10px] text-amber-500/80 font-bold space-y-1">
                    <div>شال {prod.layer_type} - {prod.is_edged ? 'بحواف' : 'بدون حواف'}</div>
                    <div className="text-gray-400 font-medium">قماش: {prod.fabric_type || 'غير محدد'}</div>
                  </div>
                )}

                {/* Stock Quantity */}
                <div className="text-xs text-gray-400 flex justify-between items-center pt-2 border-t border-zinc-900">
                  <span>الكمية: {prod.quantity} قطعة</span>
                  <div className="flex flex-col items-end">
                    {prod.price_sale > 0 && <span className="font-bold text-emerald-400">{prod.price_sale} د.ل <span className="text-[9px] text-gray-500">(بيع)</span></span>}
                    {prod.price_rent > 0 && <span className="font-bold text-amber-500">{prod.price_rent} د.ل <span className="text-[9px] text-gray-500">(إيجار)</span></span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-zinc-950/40 border-t border-zinc-900 flex justify-between gap-1.5">
                <button 
                  onClick={() => { setEditingProduct(prod); setIsModalOpen(true); }}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-zinc-800 hover:border-amber-500/30 rounded py-1.5 text-xs flex items-center justify-center gap-1 transition-all"
                >
                  <Edit size={12} />
                  تعديل
                </button>
                <button 
                  onClick={() => printBarcode(prod)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white border border-zinc-800 rounded p-1.5 transition-all"
                  title="طباعة باركود"
                >
                  <Printer size={12} />
                </button>
                {prod.image && (
                  <button 
                    onClick={() => setZoomImage(prod.image)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white border border-zinc-800 rounded p-1.5 transition-all"
                    title="تكبير الصورة"
                  >
                    <Eye size={12} />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(prod.id)}
                  className="bg-zinc-900 hover:bg-rose-950/40 text-rose-500 border border-zinc-800 hover:border-rose-500/20 rounded p-1.5 transition-all"
                  title="حذف"
                >
                  <Trash size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-premium rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">
                {editingProduct ? 'تعديل تفاصيل المنتج' : 'إضافة منتج جديد للمستودع'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-xs flex items-center gap-2">
                  <Check size={16} />
                  {successMsg}
                </div>
              )}

              {/* General Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">اسم المنتج *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    placeholder="مثال: شال تخرج ملكي مطرز"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">تصنيف المنتج *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">المقاس</label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    placeholder="مثال: L أو 54"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">الألوان</label>
                  <input
                    type="text"
                    name="colors"
                    value={formData.colors}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    placeholder="مثال: أسود، أزرق مع تطريز ذهبي"
                  />
                </div>
              </div>

              {/* Specific fields for Sash */}
              {isSashCategory(formData.category) && (
                <div className="p-4 bg-zinc-900/50 rounded-lg border border-amber-500/10 space-y-4">
                  <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Sparkles size={12} />
                    مواصفات وخصائص الشال المطلوبة
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="is_edged"
                        name="is_edged"
                        checked={formData.is_edged}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-amber-500 focus:ring-amber-500"
                      />
                      <label htmlFor="is_edged" className="text-xs text-gray-300 font-bold cursor-pointer">شال بحواف مطرزة</label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-bold">نوع الطبقات</label>
                      <select
                        name="layer_type"
                        value={formData.layer_type}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2 text-xs text-white"
                      >
                        <option value="ثنائي">ثنائي</option>
                        <option value="ثلاثي">ثلاثي</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-bold">نوع القماش</label>
                      <input
                        type="text"
                        name="fabric_type"
                        value={formData.fabric_type}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2 text-xs text-white"
                        placeholder="مثال: ستان، كريب، مخمل"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-bold">لون الشال الأساسي</label>
                      <input
                        type="text"
                        name="color_sash"
                        value={formData.color_sash}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2 text-xs text-white"
                        placeholder="أسود، كحلي..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-bold">لون الطباعة</label>
                      <input
                        type="text"
                        name="color_print"
                        value={formData.color_print}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2 text-xs text-white"
                        placeholder="ذهبي لامع، فضي..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-bold">لون التطريز</label>
                      <input
                        type="text"
                        name="color_embroidery"
                        value={formData.color_embroidery}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2 text-xs text-white"
                        placeholder="فضي، ذهبي..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">الكمية المتوفرة</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">حالة التوفر</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="available">متوفر للعمليات</option>
                    <option value="reserved">محجوز مسبقاً</option>
                    <option value="rented">مؤجر حالياً</option>
                    <option value="unavailable">غير متوفر / تالف</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">طريقة الاستخدام (المود)</label>
                  <select
                    name="item_mode"
                    value={formData.item_mode}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="both">شراء وإيجار معاً</option>
                    <option value="sale">بيع فقط</option>
                    <option value="rent">إيجار فقط</option>
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(formData.item_mode === 'sale' || formData.item_mode === 'both') && (
                  <div className="space-y-1">
                    <label className="text-xs text-emerald-400 font-bold">سعر البيع المباشر (د.ل)</label>
                    <input
                      type="number"
                      name="price_sale"
                      min="0"
                      value={formData.price_sale}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                )}

                {(formData.item_mode === 'rent' || formData.item_mode === 'both') && (
                  <div className="space-y-1">
                    <label className="text-xs text-amber-500 font-bold">سعر الإيجار للمناسبة (د.ل)</label>
                    <input
                      type="number"
                      name="price_rent"
                      min="0"
                      value={formData.price_rent}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold block">تحميل صورة المنتج من الجهاز</label>
                
                {imagePreview ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="h-full object-contain" />
                    <button 
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all"
                      title="إزالة الصورة"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-zinc-800 hover:border-amber-500/50 rounded-lg p-8 text-center cursor-pointer transition-all relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon size={32} className="mx-auto text-zinc-700 mb-2" />
                    <span className="text-xs text-gray-500 block">اضغط هنا لاختيار صورة من جهازك</span>
                    <span className="text-[10px] text-gray-600 block mt-1">تنسيق JPG, PNG, WEBP فقط</span>
                  </div>
                )}
              </div>

              {/* Description & Notes */}
              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold">ملاحظات إضافية</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  placeholder="سجل أي تفاصيل أخرى تخص المنتج..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 py-2.5 px-5 rounded-lg text-xs font-semibold border border-zinc-800 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-premium py-2.5 px-6 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ وإضافة المنتج'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[60] cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X size={28} />
          </button>
          <img src={zoomImage} alt="Zoomed view" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
