/**
 * Telegram Bot Notification Helper
 * Sends push notifications to admin's Telegram chat when orders arrive.
 */

export interface TelegramNotification {
  id: string;
  orderId: string;
  customerName: string;
  city: string;
  total: number;
  paymentMethod: string;
  status: "sent" | "failed";
  timestamp: string;
  message: string;
}

/**
 * Send a Telegram message via Bot API.
 * Returns true if message was delivered successfully, false otherwise.
 */
export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> {
  if (!botToken || !chatId) {
    console.warn("Telegram: bot token or chat ID is missing — skipping notification.");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Telegram API error:", response.status, errBody);
      return false;
    }

    const result = await response.json();
    return result?.ok === true;
  } catch (err) {
    console.error("Telegram notification network error:", err);
    return false;
  }
}

/**
 * Build a rich Arabic Telegram order notification message.
 */
export function buildOrderMessage(order: {
  trackingNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  total: number;
  shippingFee: number;
  paymentMethod: string;
  items: { name: string; quantity: number; price: number; mode: string }[];
}): string {
  const paymentLabel =
    order.paymentMethod === "cash_on_delivery"
      ? "💵 الدفع عند الاستلام"
      : order.paymentMethod === "sadad"
      ? "🏦 خدمة سداد"
      : "📱 موبي كاش";

  const itemsList = order.items
    .map(
      (item) =>
        `  • ${item.name} (${item.mode === "rent" ? "إيجار" : "شراء"}) × ${item.quantity} — ${item.price * item.quantity} د.ل`
    )
    .join("\n");

  const now = new Date().toLocaleString("ar-LY", {
    timeZone: "Africa/Tripoli",
    hour12: true,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `🎓 *طلب جديد من جاغوار للمناسبات!*

📦 *رقم الطلب:* \`${order.trackingNumber}\`
👤 *العميل:* ${order.customerName}
📞 *الهاتف:* \`${order.phone}\`
📍 *المدينة:* ${order.city}
🏠 *العنوان:* ${order.address}

🛍️ *المنتجات:*
${itemsList}

💰 *الإجمالي:* ${order.total} د.ل (شامل توصيل ${order.shippingFee} د.ل)
${paymentLabel}

🕐 *وقت الطلب:* ${now}

_يرجى التواصل مع العميل في أقرب وقت لتأكيد الطلبية_ ✅`;
}

/**
 * Save a notification record to localStorage for admin dashboard display.
 */
export function saveNotificationToStorage(notification: TelegramNotification): void {
  try {
    const existing = loadNotificationsFromStorage();
    const updated = [notification, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem("jaguar_notifications", JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save notification to localStorage:", err);
  }
}

/**
 * Load notifications history from localStorage.
 */
export function loadNotificationsFromStorage(): TelegramNotification[] {
  try {
    const raw = localStorage.getItem("jaguar_notifications");
    if (!raw) return [];
    return JSON.parse(raw) as TelegramNotification[];
  } catch {
    return [];
  }
}
