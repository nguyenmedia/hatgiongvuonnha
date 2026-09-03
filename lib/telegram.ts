import { Order, OrderItem } from '@/types/database.types';
import { formatPrice } from './utils';

export async function sendTelegramOrderNotification(order: Order, items: OrderItem[]): Promise<{ success: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || token === 'your-telegram-bot-token-here' || chatId === 'your-telegram-chat-id-here') {
    console.warn('[Telegram] Telegram Bot credentials not configured in environment variables. Notification skipped.');
    return { success: false, error: 'Telegram credentials missing' };
  }

  try {
    let itemsText = '';
    for (const item of items) {
      itemsText += `🌱 ${item.product_name}\n   Số lượng: ${item.quantity} | Giá: ${formatPrice(item.total)}\n`;
    }

    const message = `🔔 <b>ĐƠN HÀNG MỚI TỪ HẠT GIỐNG NHÀ VƯỜN</b>
━━━━━━━━━━━━━━━━━━━━━
🆔 <b>Mã đơn hàng:</b> #${order.order_code}
👤 <b>Khách hàng:</b> ${order.customer_name}
📞 <b>Số điện thoại:</b> ${order.phone}
📍 <b>Địa chỉ:</b> ${order.address}${order.district ? ', ' + order.district : ''}${order.province ? ', ' + order.province : ''}
━━━━━━━━━━━━━━━━━━━━━
🛒 <b>SẢN PHẨM:</b>
${itemsText}━━━━━━━━━━━━━━━━━━━━━
🚚 <b>Phí vận chuyển:</b> ${formatPrice(order.shipping_fee)}
${order.discount > 0 ? `🎟️ <b>Giảm giá:</b> -${formatPrice(order.discount)}\n` : ''}💰 <b>TỔNG THANH TOÁN:</b> <b>${formatPrice(order.total)}</b>
💳 <b>Phương thức:</b> ${order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản Ngân hàng QR'}
━━━━━━━━━━━━━━━━━━━━━
📝 <b>Ghi chú:</b> ${order.note ? order.note : 'Không có'}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('[Telegram API Error]:', result);
      return { success: false, error: result.description };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Telegram Error]:', error);
    return { success: false, error: error?.message || 'Failed to send Telegram message' };
  }
}
