import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isServerSupabaseConfigured } from '@/lib/supabase/server';
import { sendTelegramOrderNotification } from '@/lib/telegram';
import { generateOrderCode, isValidUUID } from '@/lib/utils';
import { Order, OrderItem } from '@/types/database.types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      phone,
      email,
      province,
      district,
      address,
      note,
      payment_method,
      subtotal,
      shipping_fee,
      discount,
      total,
      items,
    } = body;

    // Validation
    if (!customer_name || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ họ tên, số điện thoại, địa chỉ và sản phẩm.' },
        { status: 400 }
      );
    }

    const order_code = generateOrderCode();

    const orderData: Order = {
      id: crypto.randomUUID(),
      order_code,
      customer_name: customer_name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      province: province || null,
      district: district || null,
      address: address.trim(),
      note: note ? note.trim() : null,
      subtotal: Number(subtotal) || 0,
      shipping_fee: Number(shipping_fee) || 0,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
      payment_method: payment_method || 'cod',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const orderItems: OrderItem[] = items.map((item: any) => {
      const rawPid = item.product_id || item.product?.id || null;
      return {
        product_id: (rawPid && isValidUUID(rawPid)) ? rawPid : null,
        product_name: item.product_name || item.product?.name || 'Hạt giống',
        product_image: item.product_image || item.product?.image_url || item.product?.images?.[0] || null,
        price: Number(item.price || item.product?.sale_price || item.product?.price || 0),
        quantity: Number(item.quantity) || 1,
        total: Number(item.total || (item.price || item.product?.sale_price || item.product?.price || 0) * (item.quantity || 1)),
      };
    });

    // 1. Try to persist into Supabase PostgreSQL
    let supabaseSuccess = false;
    if (isServerSupabaseConfigured) {
      try {
        const { error: orderErr } = await supabaseServer
          .from('orders')
          .insert({
            id: orderData.id,
            order_code: orderData.order_code,
            customer_name: orderData.customer_name,
            phone: orderData.phone,
            email: orderData.email,
            province: orderData.province,
            district: orderData.district,
            address: orderData.address,
            note: orderData.note,
            subtotal: orderData.subtotal,
            shipping_fee: orderData.shipping_fee,
            discount: orderData.discount,
            total: orderData.total,
            payment_method: orderData.payment_method,
            status: orderData.status,
          });

        if (orderErr) {
          console.error('[Supabase Order Insert Error]:', orderErr);
        } else {
          supabaseSuccess = true;

          // Insert order items
          const itemsPayload = orderItems.map((it) => ({
            order_id: orderData.id,
            product_id: it.product_id,
            product_name: it.product_name,
            product_image: it.product_image,
            price: it.price,
            quantity: it.quantity,
            total: it.total,
          }));

          const { error: itemsErr } = await supabaseServer
            .from('order_items')
            .insert(itemsPayload);

          if (itemsErr) {
            console.error('[Supabase Items Insert Error]:', itemsErr);
          }
        }
      } catch (dbErr) {
        console.error('[Supabase Database Exception]:', dbErr);
      }
    } else {
      console.log('[Supabase] Running in local demo fallback mode.');
    }

    // 2. Trigger Telegram Bot notification asynchronously (Server-side)
    try {
      await sendTelegramOrderNotification(orderData, orderItems);
    } catch (teleErr) {
      console.warn('[Telegram Notification Error]:', teleErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Đặt hàng thành công!',
      order: orderData,
      order_code: orderData.order_code,
      supabase_synced: supabaseSuccess,
    });
  } catch (error: any) {
    console.error('[Order API Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Có lỗi xảy ra khi tạo đơn hàng' },
      { status: 500 }
    );
  }
}
