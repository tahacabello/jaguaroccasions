import { createClient } from '@supabase/supabase-js';

// These should be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxsixllbppablltuvtkj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Cf8BqtzedCI5qHgtt0gWRA_TihclIWq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
});

// Helper to generate UUIDs
export function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// =====================================================================
// 📸 Image Uploader (Supabase Storage with Base64 Fallback)
// =====================================================================
export async function uploadProductImage(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `jaguar_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    // Try uploading to 'jaguar-media' bucket
    const { data, error } = await supabase.storage
      .from('jaguar-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      // Try 'product-images' bucket
      const { data: data2, error: error2 } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error2) throw error2;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      return publicUrl;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('jaguar-media')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.warn("Storage upload failed, reading as Base64:", err);
    // Fallback: Read file as Base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as Base64"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}

// =====================================================================
// ⚙️ Settings Functions
// =====================================================================
export async function getSettings(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    
    const settingsMap: Record<string, string> = {
      store_name: "جاغوار للمناسبات",
      admin_pin: "9922",
      theme_primary: "#d4af37",
      theme_dark_mode: "true",
      print_header: "جاغوار للمناسبات - طرابلس",
      print_footer: "شكراً لتعاملكم معنا"
    };

    if (data) {
      data.forEach(item => {
        settingsMap[item.key] = item.value;
      });
    }
    return settingsMap;
  } catch (err) {
    console.warn("Failed to fetch settings, using defaults:", err);
    return {
      store_name: "جاغوار للمناسبات",
      admin_pin: "9922",
      theme_primary: "#d4af37",
      theme_dark_mode: "true",
      print_header: "جاغوار للمناسبات - طرابلس",
      print_footer: "شكراً لتعاملكم معنا"
    };
  }
}

export async function updateSetting(key: string, value: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to update setting ${key}:`, err);
    return false;
  }
}

// =====================================================================
// 📦 Products Functions
// =====================================================================
export async function getProducts(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

export async function addProduct(product: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const id = generateUUID();
    const payload = {
      id,
      name: product.name,
      image: product.image || null,
      code: product.code || `JG-${Math.floor(100000 + Math.random() * 900000)}`,
      barcode: product.barcode || `BAR-${Math.floor(10000000 + Math.random() * 90000000)}`,
      category: product.category,
      size: product.size || null,
      colors: product.colors || null,
      notes: product.notes || null,
      quantity: Number(product.quantity || 1),
      status: product.status || 'available',
      price_sale: Number(product.price_sale || 0),
      price_rent: Number(product.price_rent || 0),
      item_mode: product.item_mode || 'both',
      is_edged: !!product.is_edged,
      layer_type: product.layer_type || null,
      fabric_type: product.fabric_type || null,
      color_sash: product.color_sash || null,
      color_print: product.color_print || null,
      color_embroidery: product.color_embroidery || null
    };

    const { data, error } = await supabase.from('products').insert([payload]).select().single();
    if (error) throw error;

    await logActivity('add', 'products', id, { name: product.name, code: payload.code });
    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to add product:", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function updateProduct(id: string, updates: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;
    await logActivity('edit', 'products', id, updates);
    return true;
  } catch (err) {
    console.error(`Failed to update product ${id}:`, err);
    return false;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    await logActivity('delete', 'products', id, { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete product ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 👥 Customers Functions
// =====================================================================
export async function getCustomers(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch customers:", err);
    return [];
  }
}

export async function addCustomer(customer: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const id = generateUUID();
    const payload = {
      id,
      name: customer.name,
      whatsapp: customer.whatsapp || null,
      phone: customer.phone || null,
      address: customer.address || null,
      id_type: customer.id_type || null,
      id_name: customer.id_name || null
    };

    const { data, error } = await supabase.from('customers').insert([payload]).select().single();
    if (error) throw error;

    await logActivity('add', 'customers', id, { name: customer.name });
    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to add customer:", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function updateCustomer(id: string, updates: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('customers').update(updates).eq('id', id);
    if (error) throw error;
    await logActivity('edit', 'customers', id, updates);
    return true;
  } catch (err) {
    console.error(`Failed to update customer ${id}:`, err);
    return false;
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
    await logActivity('delete', 'customers', id, { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete customer ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 📅 Reservations Functions
// =====================================================================
export async function getReservations(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        customers:customer_id(*),
        items:reservation_items(
          *,
          products:product_id(*)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch reservations:", err);
    return [];
  }
}

export async function addReservation(reservation: any, items: any[]): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const resId = generateUUID();
    const reservationNumber = reservation.reservation_number || `RES-${Date.now().toString().slice(-6)}`;
    
    // 1. Insert reservation
    const resPayload = {
      id: resId,
      reservation_number: reservationNumber,
      customer_id: reservation.customer_id,
      start_date: reservation.start_date,
      pickup_date: reservation.pickup_date,
      return_date: reservation.return_date,
      total_amount: Number(reservation.total_amount || 0),
      deposit: Number(reservation.deposit || 0),
      remaining: Number(reservation.remaining || 0),
      payment_status: reservation.payment_status || 'unpaid',
      status: reservation.status || 'active',
      notes: reservation.notes || null,
      delivery_method: reservation.delivery_method || 'store_pickup'
    };

    const { error: resErr } = await supabase.from('reservations').insert([resPayload]);
    if (resErr) throw resErr;

    // 2. Insert items
    const itemsPayload = items.map(item => ({
      reservation_id: resId,
      product_id: item.product_id,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0)
    }));

    const { error: itemsErr } = await supabase.from('reservation_items').insert(itemsPayload);
    if (itemsErr) throw itemsErr;

    // 3. Register deposit payment if > 0
    if (Number(reservation.deposit) > 0) {
      await addPayment({
        amount: Number(reservation.deposit),
        date: reservation.start_date,
        movement_type: 'deposit',
        linked_operation_type: 'reservation',
        linked_operation_id: resId,
        notes: `عربون الحجز رقم ${reservationNumber}`,
        payment_status: 'completed'
      });
    }

    // 4. Update product statuses to 'reserved'
    for (const item of items) {
      await updateProduct(item.product_id, { status: 'reserved' });
    }

    await logActivity('add', 'reservations', resId, { reservation_number: reservationNumber });
    return { success: true, data: { id: resId, reservation_number: reservationNumber } };
  } catch (err: any) {
    console.error("Failed to add reservation:", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function updateReservation(id: string, updates: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('reservations').update(updates).eq('id', id);
    if (error) throw error;
    await logActivity('edit', 'reservations', id, updates);
    return true;
  } catch (err) {
    console.error(`Failed to update reservation ${id}:`, err);
    return false;
  }
}

export async function deleteReservation(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) throw error;
    await logActivity('delete', 'reservations', id, { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete reservation ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 🔑 Rentals Functions
// =====================================================================
export async function getRentals(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        customers:customer_id(*),
        items:rental_items(
          *,
          products:product_id(*)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch rentals:", err);
    return [];
  }
}

export async function addRental(rental: any, items: any[]): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const rentId = generateUUID();
    const operationNumber = rental.operation_number || `RNT-${Date.now().toString().slice(-6)}`;

    // 1. Insert rental
    const rentPayload = {
      id: rentId,
      operation_number: operationNumber,
      customer_id: rental.customer_id,
      start_date: rental.start_date,
      end_date: rental.end_date,
      actual_delivery_date: rental.actual_delivery_date || null,
      expected_return_date: rental.expected_return_date,
      actual_return_date: rental.actual_return_date || null,
      rental_value: Number(rental.rental_value || 0),
      deposit: Number(rental.deposit || 0),
      remaining: Number(rental.remaining || 0),
      status: rental.status || 'rented',
      return_status: rental.return_status || 'not_returned',
      notes: rental.notes || null,
      delay_fine: Number(rental.delay_fine || 0)
    };

    const { error: rentErr } = await supabase.from('rentals').insert([rentPayload]);
    if (rentErr) throw rentErr;

    // 2. Insert items
    const itemsPayload = items.map(item => ({
      rental_id: rentId,
      product_id: item.product_id,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0)
    }));

    const { error: itemsErr } = await supabase.from('rental_items').insert(itemsPayload);
    if (itemsErr) throw itemsErr;

    // 3. Register deposit payment if > 0
    if (Number(rental.deposit) > 0) {
      await addPayment({
        amount: Number(rental.deposit),
        date: rental.start_date,
        movement_type: 'deposit',
        linked_operation_type: 'rental',
        linked_operation_id: rentId,
        notes: `عربون إيجار رقم ${operationNumber}`,
        payment_status: 'completed'
      });
    }

    // 4. Update products status to 'rented'
    for (const item of items) {
      await updateProduct(item.product_id, { status: 'rented' });
    }

    await logActivity('add', 'rentals', rentId, { operation_number: operationNumber });
    return { success: true, data: { id: rentId, operation_number: operationNumber } };
  } catch (err: any) {
    console.error("Failed to add rental:", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function updateRental(id: string, updates: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('rentals').update(updates).eq('id', id);
    if (error) throw error;
    await logActivity('edit', 'rentals', id, updates);
    return true;
  } catch (err) {
    console.error(`Failed to update rental ${id}:`, err);
    return false;
  }
}

export async function deleteRental(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('rentals').delete().eq('id', id);
    if (error) throw error;
    await logActivity('delete', 'rentals', id, { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete rental ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 💰 Sales Functions
// =====================================================================
export async function getOrders(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers:customer_id(*),
        items:order_items(
          *,
          products:product_id(*)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch orders (sales):", err);
    return [];
  }
}

export async function addOrder(order: any, items: any[]): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const orderId = generateUUID();
    const orderNumber = order.order_number || `SLS-${Date.now().toString().slice(-6)}`;

    // 1. Insert order record
    const orderPayload = {
      id: orderId,
      order_number: orderNumber,
      customer_id: order.customer_id,
      total_amount: Number(order.total_amount || 0),
      payment_status: order.payment_status || 'paid',
      status: order.status || 'completed',
      notes: order.notes || null
    };

    const { error: orderErr } = await supabase.from('orders').insert([orderPayload]);
    if (orderErr) throw orderErr;

    // 2. Insert items
    const itemsPayload = items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0)
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload);
    if (itemsErr) throw itemsErr;

    // 3. Register payment
    await addPayment({
      amount: Number(order.total_amount),
      date: new Date().toISOString().split('T')[0],
      movement_type: order.payment_status === 'paid' ? 'cash' : 'partial',
      linked_operation_type: 'order',
      linked_operation_id: orderId,
      notes: `فاتورة بيع رقم ${orderNumber}`,
      payment_status: 'completed'
    });

    // 4. Update products status to 'sold' (and decrement stock quantity)
    for (const item of items) {
      // Get current stock
      const { data: prodData } = await supabase.from('products').select('quantity').eq('id', item.product_id).single();
      const currentQty = prodData?.quantity || 1;
      const newQty = Math.max(0, currentQty - Number(item.quantity));
      
      await updateProduct(item.product_id, { 
        status: newQty === 0 ? 'sold' : 'available',
        quantity: newQty
      });
    }

    await logActivity('add', 'orders', orderId, { order_number: orderNumber });
    return { success: true, data: { id: orderId, order_number: orderNumber } };
  } catch (err: any) {
    console.error("Failed to add order (sale):", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    await logActivity('delete', 'orders', id, { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete order ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 💸 Payments Functions
// =====================================================================
export async function getPayments(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch payments:", err);
    return [];
  }
}

export async function addPayment(payment: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const id = generateUUID();
    const payload = {
      id,
      amount: Number(payment.amount),
      date: payment.date || new Date().toISOString().split('T')[0],
      movement_type: payment.movement_type, // cash, transfer, partial, deposit, final_payment, refund
      linked_operation_type: payment.linked_operation_type || null,
      linked_operation_id: payment.linked_operation_id || null,
      notes: payment.notes || null,
      payment_status: payment.payment_status || 'completed'
    };

    const { data, error } = await supabase.from('payments').insert([payload]).select().single();
    if (error) throw error;

    await logActivity('add', 'payments', id, { amount: payment.amount, type: payment.movement_type });
    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to add payment:", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function deletePayment(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
    await logActivity('delete', 'payments', id, { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete payment ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 🚚 Deliveries Functions
// =====================================================================
export async function getDeliveries(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('deliveries').select('*').order('delivery_date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch deliveries:", err);
    return [];
  }
}

export async function addDelivery(delivery: any): Promise<boolean> {
  try {
    const id = generateUUID();
    const payload = {
      id,
      linked_operation_type: delivery.linked_operation_type,
      linked_operation_id: delivery.linked_operation_id,
      delivery_date: delivery.delivery_date || new Date().toISOString().split('T')[0],
      notes: delivery.notes || null,
      status: delivery.status || 'delivered'
    };

    const { error } = await supabase.from('deliveries').insert([payload]);
    if (error) throw error;

    // Log activity
    await logActivity('add', 'deliveries', id, { linked_type: delivery.linked_operation_type, operation_id: delivery.linked_operation_id });
    return true;
  } catch (err) {
    console.error("Failed to record delivery:", err);
    return false;
  }
}

// =====================================================================
// 🔄 Returns Functions
// =====================================================================
export async function getReturns(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('returns').select('*').order('return_date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch returns:", err);
    return [];
  }
}

export async function addReturn(returnRecord: any): Promise<boolean> {
  try {
    const id = generateUUID();
    const payload = {
      id,
      linked_operation_type: returnRecord.linked_operation_type,
      linked_operation_id: returnRecord.linked_operation_id,
      return_date: returnRecord.return_date || new Date().toISOString().split('T')[0],
      notes: returnRecord.notes || null,
      status: returnRecord.status || 'returned'
    };

    const { error } = await supabase.from('returns').insert([payload]);
    if (error) throw error;

    // Log activity
    await logActivity('add', 'returns', id, { linked_type: returnRecord.linked_operation_type, operation_id: returnRecord.linked_operation_id });
    return true;
  } catch (err) {
    console.error("Failed to record return:", err);
    return false;
  }
}

// =====================================================================
// 🔔 Notifications Functions
// =====================================================================
export async function getNotifications(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to mark notification ${id} as read:`, err);
    return false;
  }
}

export async function addNotification(notification: any): Promise<boolean> {
  try {
    const payload = {
      id: generateUUID(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      is_read: false,
      linked_operation_type: notification.linked_operation_type || null,
      linked_operation_id: notification.linked_operation_id || null
    };
    const { error } = await supabase.from('notifications').insert([payload]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to add notification:", err);
    return false;
  }
}

// =====================================================================
// 📜 Activity Log Functions
// =====================================================================
export async function getActivityLogs(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch activity logs:", err);
    return [];
  }
}

export async function logActivity(actionType: 'add' | 'edit' | 'delete', tableName: string, recordId: string, details: any): Promise<boolean> {
  try {
    const payload = {
      id: generateUUID(),
      action_by: 'المالك',
      action_type: actionType,
      table_name: tableName,
      record_id: recordId,
      details: details ? JSON.parse(JSON.stringify(details)) : null
    };

    const { error } = await supabase.from('activity_logs').insert([payload]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("Failed to write activity log:", err);
    return false;
  }
}
