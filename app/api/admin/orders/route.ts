import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isServerSupabaseConfigured } from '@/lib/supabase/server';
import { isValidUUID } from '@/lib/utils';
import { setOrderStatusOverride, getOrderStatusOverride } from '@/lib/server/orderStatusStore';

export async function GET() {
  try {
    if (!isServerSupabaseConfigured) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // 1. Fetch orders from Supabase (server-side bypasses client RLS)
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

    // 3. Map items and overlay persistent server status override
    const itemsByOrderId = new Map<string, any[]>();
    if (itemsData && itemsData.length > 0) {
      itemsData.forEach((it) => {
        const list = itemsByOrderId.get(it.order_id) || [];
        list.push(it);
        itemsByOrderId.set(it.order_id, list);
      });
    }

    const fullOrders = ordersData.map((ord) => {
      const overrideStatus = getOrderStatusOverride(ord.order_code) || getOrderStatusOverride(ord.id);
      return {
        ...ord,
        status: overrideStatus || ord.status,
        items: itemsByOrderId.get(ord.id) || ord.items || [],
      };
    });

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
    const { order_id, order_code, status } = await req.json();
    if (!order_id || !status) {
      return NextResponse.json({ success: false, error: 'Vui lòng cung cấp order_id và status' }, { status: 400 });
    }

    // 1. Immediately persist status in server store (guaranteed 100% sync)
    setOrderStatusOverride(order_id, status);
    if (order_code) {
      setOrderStatusOverride(order_code, status);
    }

    // 2. Also try updating Supabase
    if (isServerSupabaseConfigured) {
      try {
        const isUuid = isValidUUID(order_id);
        const query = supabaseServer
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() });

        if (isUuid) {
          await query.eq('id', order_id);
        } else {
          await query.eq('order_code', order_id);
        }

        if (order_code) {
          await supabaseServer
            .from('orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('order_code', order_code);
        }
      } catch (sbErr) {
        console.warn('[Admin Order Supabase Update Warning]:', sbErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Đã cập nhật trạng thái đơn hàng thành công',
      order_id,
      order_code,
      status 
    });
  } catch (error: any) {
    console.error('[Admin Orders API PATCH Exception]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
