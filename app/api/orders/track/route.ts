import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isServerSupabaseConfigured } from '@/lib/supabase/server';
import { getOrderStatusOverride } from '@/lib/server/orderStatusStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ success: false, error: 'Thiếu mã đơn hàng hoặc số điện thoại' }, { status: 400 });
    }

    const cleanCode = q.toUpperCase().replace('#', '').trim();
    const cleanPhone = q.replace(/\s/g, '').trim();

    if (!isServerSupabaseConfigured) {
      return NextResponse.json({ success: false, error: 'Chưa cấu hình cơ sở dữ liệu' }, { status: 500 });
    }

    // Query Supabase by order_code or phone
    const { data, error } = await supabaseServer
      .from('orders')
      .select('*, order_items(*)')
      .or(`order_code.eq.${cleanCode},phone.eq.${cleanPhone}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Track Order API Error]:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    // Overlay server status override
    const overrideStatus = getOrderStatusOverride(data.order_code) || getOrderStatusOverride(data.id);

    const fullOrder = {
      ...data,
      status: overrideStatus || data.status,
      items: data.order_items && data.order_items.length > 0 ? data.order_items : data.items || [],
    };

    return NextResponse.json({
      success: true,
      order: fullOrder,
    });
  } catch (err: any) {
    console.error('[Track Order API Exception]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
