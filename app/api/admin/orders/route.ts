import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isServerSupabaseConfigured } from '@/lib/supabase/server';

export async function GET() {
  try {
    if (!isServerSupabaseConfigured) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // 1. Fetch orders from Supabase (server-side bypasses RLS)
    const { data: ordersData, error: ordersErr } = await supabaseServer
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersErr) {
      console.error('[Admin Orders API GET Error]:', ordersErr);
      return NextResponse.json({ success: false, error: ordersErr.message }, { status: 500 });
    }

    if (!ordersData || ordersData.length === 0) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // 2. Fetch order items for these orders
    const orderIds = ordersData.map((o) => o.id);
    const { data: itemsData, error: itemsErr } = await supabaseServer
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsErr) {
      console.warn('[Admin Order Items API Fetch Warning]:', itemsErr.message);
    }

    // 3. Map order items into each order object
    const itemsByOrderId = new Map<string, any[]>();
    if (itemsData && itemsData.length > 0) {
      itemsData.forEach((it) => {
        const list = itemsByOrderId.get(it.order_id) || [];
        list.push(it);
        itemsByOrderId.set(it.order_id, list);
      });
    }

    const fullOrders = ordersData.map((ord) => ({
      ...ord,
      items: itemsByOrderId.get(ord.id) || ord.items || [],
    }));

    return NextResponse.json({
      success: true,
      orders: fullOrders,
    });
  } catch (error: any) {
    console.error('[Admin Orders API Exception]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { order_id, status } = await req.json();
    if (!order_id || !status) {
      return NextResponse.json({ success: false, error: 'Vui lòng cung cấp order_id và status' }, { status: 400 });
    }

    if (isServerSupabaseConfigured) {
      const { error: updateErr } = await supabaseServer
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', order_id);

      if (updateErr) {
        console.error('[Admin Order Status Update Error]:', updateErr);
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng' });
  } catch (error: any) {
    console.error('[Admin Orders API PATCH Exception]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
