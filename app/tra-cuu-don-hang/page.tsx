'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Package, Clock, CheckCircle2, Truck, 
  AlertCircle, ChevronRight, QrCode, Phone, MapPin, 
  Sparkles, ArrowRight, ShieldCheck, Copy, Check
} from 'lucide-react';
import { formatPrice, formatDate, getOrderStatusLabel } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Order } from '@/types/database.types';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { useRealtime } from '@/components/providers/RealtimeProvider';

const MOCK_TRACKING_ORDERS: Order[] = [
  {
    id: 'ord-1',
    order_code: 'HG982145',
    customer_name: 'Nguyễn Văn An',
    phone: '0905 123 456',
    address: '58 Lý Chính Thắng, TP. Quảng Ngãi',
    subtotal: 75000,
    shipping_fee: 30000,
    discount: 0,
    total: 105000,
    payment_method: 'cod',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      { product_id: 'p1', product_name: 'Hạt Giống Hoa Hướng Dương Lùn F1', price: 25000, quantity: 3, total: 75000 }
    ]
  },
  {
    id: 'ord-2',
    order_code: 'HG773912',
    customer_name: 'Lê Thị Mai',
    phone: '0934 811 307',
    address: '124 Phan Chu Trinh, Đà Nẵng',
    subtotal: 180000,
    shipping_fee: 0,
    discount: 20000,
    total: 160000,
    payment_method: 'bank_transfer',
    status: 'confirmed',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      { product_id: 'p2', product_name: 'Hạt Giống Hoa Dạ Yến Thảo Rủ Mix Màu', price: 30000, quantity: 6, total: 180000 }
    ]
  },
  {
    id: 'ord-3',
    order_code: 'HG654210',
    customer_name: 'Trần Hữu Nam',
    phone: '0912 345 678',
    address: 'Quận 1, TP. Hồ Chí Minh',
    subtotal: 350000,
    shipping_fee: 0,
    discount: 35000,
    total: 315000,
    payment_method: 'cod',
    status: 'shipping',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      { product_id: 'p8', product_name: 'Bộ Dụng Cụ Làm Vườn Mini 3 Món Cán Gỗ', price: 49000, quantity: 1, total: 49000 },
      { product_id: 'pa', product_name: 'Đất Sạch Hữu Cơ Tribat 10 Dm3', price: 35000, quantity: 2, total: 70000 }
    ]
  }
];

import { useSettings } from '@/components/providers/SettingsProvider';

export default function OrderTrackingPage() {
  const { settings } = useSettings();
  const { lastUpdated } = useRealtime();
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSearchQuery = async (searchVal: string) => {
    if (!searchVal.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setOrder(null);

    const cleanCode = searchVal.trim().toUpperCase().replace('#', '');
    const cleanPhone = searchVal.trim().replace(/\s/g, '');

    let foundOrder: Order | null = null;

    // 1. Search via Server API route (bypasses RLS to get latest real Supabase status)
    try {
      const apiRes = await fetch('/api/admin/orders');
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.success && apiData.orders && apiData.orders.length > 0) {
          const matched = apiData.orders.find((o: any) => {
            const matchCode = o.order_code && o.order_code.toUpperCase().replace('#', '') === cleanCode;
            const matchPhone = o.phone && o.phone.replace(/\s/g, '') === cleanPhone;
            return matchCode || matchPhone;
          });
          if (matched) {
            foundOrder = matched;
          }
        }
      }
    } catch (e) {}

    // 2. Search Supabase database directly if configured
    if (!foundOrder && isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .or(`order_code.eq.${cleanCode},phone.eq.${cleanPhone}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          foundOrder = {
            ...data,
            items: data.order_items && data.order_items.length > 0 ? data.order_items : data.items || [],
          };
        }
      } catch (err) {
        console.error('Supabase order tracking error:', err);
      }
    }

    // 2. Search LocalStorage placed orders
    if (!foundOrder) {
      try {
        const localOrders: Order[] = JSON.parse(localStorage.getItem('all_placed_orders') || '[]');
        const matched = localOrders.find((o) => {
          const matchCode = o.order_code && o.order_code.toUpperCase().replace('#', '') === cleanCode;
          const matchPhone = o.phone && o.phone.replace(/\s/g, '') === cleanPhone;
          return matchCode || matchPhone;
        });
        if (matched) {
          foundOrder = matched;
        }
      } catch (e) {}
    }

    // 3. Search Mock tracking orders
    if (!foundOrder) {
      const matchedMock = MOCK_TRACKING_ORDERS.find((o) => {
        const matchCode = o.order_code && o.order_code.toUpperCase().replace('#', '') === cleanCode;
        const matchPhone = o.phone && o.phone.replace(/\s/g, '') === cleanPhone;
        return matchCode || matchPhone;
      });
      if (matchedMock) {
        foundOrder = matchedMock;
      }
    }

    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      setErrorMsg('Không tìm thấy đơn hàng nào với Mã đơn hoặc Số điện thoại này. Vui lòng kiểm tra lại!');
    }

    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchQuery(query);
  };

  const copyBankInfo = () => {
    if (!order) return;
    const bankName = settings.bank_name || 'MB Bank';
    const accNum = settings.account_number || '7986868686';
    const accHolder = settings.account_holder || 'NGUYỄN CÔNG NGUYÊN';
    const infoText = `${bankName}\nSTK: ${accNum}\nCTK: ${accHolder}\nNội dung: ${order.order_code}`;
    navigator.clipboard.writeText(infoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper for tracking steps timeline
  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    const statusOrder: Record<string, number> = {
      pending: 1,
      confirmed: 2,
      shipping: 3,
      completed: 4,
      cancelled: 0,
    };

    const currentStep = statusOrder[currentStatus] || 1;
    if (currentStatus === 'cancelled') return 'cancelled';
    if (currentStep > stepIndex) return 'completed';
    if (currentStep === stepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-slate-50/50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-forest-900">Tra cứu đơn hàng</span>
        </nav>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
          
          {/* Header text */}
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-forest-700 uppercase tracking-widest bg-forest-50 px-4 py-1.5 rounded-full border border-forest-200 inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-forest-600" />
              <span>Hệ Thống Theo Dõi Đơn Hàng Live</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif mt-3">
              Tra Cứu Đơn Hàng Hạt Giống 🚚
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Nhập Mã đơn hàng (ví dụ: <button onClick={() => { setQuery('HG982145'); handleSearchQuery('HG982145'); }} className="text-forest-700 font-bold underline hover:text-emerald-600">#HG982145</button>) hoặc Số điện thoại đặt hàng để kiểm tra vị trí gói hàng
            </p>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="Nhập mã đơn HG... hoặc SĐT..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-xs sm:text-sm border rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-inner font-medium"
                />
                <Search className="w-5 h-5 text-emerald-600 absolute left-3.5 top-3.5" />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-forest-800 hover:from-emerald-700 hover:to-forest-900 text-white text-xs sm:text-sm font-extrabold rounded-2xl transition shadow-lg shrink-0 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? 'Đang tìm...' : 'Tra cứu ngay'}
              </button>
            </div>

            {/* Quick Demo Search Chips */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
              <span>Mẫu tra cứu thử:</span>
              <button
                type="button"
                onClick={() => { setQuery('HG982145'); handleSearchQuery('HG982145'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-mono font-bold text-slate-700 transition"
              >
                #HG982145
              </button>
              <button
                type="button"
                onClick={() => { setQuery('0934811307'); handleSearchQuery('0934811307'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-mono font-bold text-slate-700 transition"
              >
                0934 811 307
              </button>
            </div>
          </form>

          {/* Error Warning Alert */}
          {errorMsg && (
            <div className="max-w-lg mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Detailed Result Card */}
          {order && (
            <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-8 animate-in fade-in">
              
              {/* Top Header Result */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chi Tiết Đơn Hàng</div>
                  <div className="text-2xl font-extrabold text-forest-950 font-mono mt-0.5">#{order.order_code}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-forest-600" />
                    <span>Thời gian đặt: {formatDate(order.created_at)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1 font-bold">Trạng thái vận chuyển</div>
                  <span className={`text-xs font-extrabold px-4 py-1.5 rounded-full border ${getOrderStatusLabel(order.status).bg} ${getOrderStatusLabel(order.status).color} shadow-xs inline-block`}>
                    {getOrderStatusLabel(order.status).label}
                  </span>
                </div>
              </div>

              {/* TIMELINE PROGRESS BAR */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-6">
                  Tiến Độ Đơn Hàng REALTIME
                </h4>

                <div className="grid grid-cols-4 gap-2 relative">
                  
                  {/* Step 1: Placed */}
                  <div className="text-center relative z-10">
                    <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-sm transition ${
                      getStepStatus(1, order.status) === 'completed' || getStepStatus(1, order.status) === 'current'
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      1
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-2">Đã Đặt Hàng</div>
                    <div className="text-[10px] text-slate-400">Đơn hàng mới</div>
                  </div>

                  {/* Step 2: Confirmed */}
                  <div className="text-center relative z-10">
                    <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-sm transition ${
                      getStepStatus(2, order.status) === 'completed' || getStepStatus(2, order.status) === 'current'
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      2
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-2">Đã Xác Nhận</div>
                    <div className="text-[10px] text-slate-400">Đóng gói hạt giống</div>
                  </div>

                  {/* Step 3: Shipping */}
                  <div className="text-center relative z-10">
                    <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-sm transition ${
                      getStepStatus(3, order.status) === 'completed' || getStepStatus(3, order.status) === 'current'
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      3
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-2">Đang Giao Hàng</div>
                    <div className="text-[10px] text-slate-400">Shipper vận chuyển</div>
                  </div>

                  {/* Step 4: Completed */}
                  <div className="text-center relative z-10">
                    <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-sm transition ${
                      getStepStatus(4, order.status) === 'completed' || getStepStatus(4, order.status) === 'current'
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      4
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-2">Hoàn Thành</div>
                    <div className="text-[10px] text-slate-400">Đã giao tận nơi</div>
                  </div>

                </div>
              </div>

              {/* Customer Information & Payment Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5 pb-2 border-b">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Thông Tin Người Nhận</span>
                  </div>
                  <div className="text-slate-700">Họ tên: <strong className="text-slate-900 font-bold">{order.customer_name}</strong></div>
                  <div className="text-slate-700">Số điện thoại: <strong className="text-slate-900 font-bold">{order.phone}</strong></div>
                  <div className="text-slate-700 leading-relaxed">Địa chỉ: {order.address}</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5 pb-2 border-b">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Thanh Toán &amp; Phí Ship</span>
                  </div>
                  <div className="text-slate-700">
                    Hình thức: <strong className="text-emerald-700">{order.payment_method === 'cod' ? 'Thanh toán COD khi nhận' : 'Chuyển khoản VietQR'}</strong>
                  </div>
                  <div className="text-slate-700">Phí giao hàng: {formatPrice(order.shipping_fee)}</div>
                  <div className="text-forest-800 font-extrabold text-base pt-1">
                    Tổng giá trị: {formatPrice(order.total)}
                  </div>
                </div>

              </div>

              {/* VIETQR PAYMENT BOX (IF BANK TRANSFER & PENDING) */}
              {order.payment_method === 'bank_transfer' && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-forest-950 to-forest-900 text-white border border-emerald-800 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="bg-white p-3 rounded-2xl border-2 border-amber-400 shrink-0">
                      <img
                        src={`https://img.vietqr.io/image/MB-0934811307-compact2.png?amount=${order.total}&addInfo=${order.order_code}&accountName=HAT%20GIONG%20NHA%20VUON`}
                        alt="VietQR Chuyển Khoản"
                        className="w-36 h-36 object-contain"
                      />
                    </div>

                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                        <QrCode className="w-3.5 h-3.5 text-amber-300" />
                        <span>QUÉT MÃ VIETQR TỰ ĐỘNG ĐIỀN NỘI DUNG</span>
                      </div>
                      <h4 className="text-sm font-bold text-white font-serif">Thông Tin Chuyển Khoản Ngân Hàng</h4>
                      <div className="text-xs text-emerald-200 space-y-1">
                        <div>Ngân hàng: <strong>{settings.bank_name || 'MB Bank'}</strong></div>
                        <div>Số tài khoản: <strong className="text-amber-300">{settings.account_number || '7986868686'}</strong></div>
                        <div>Chủ tài khoản: <strong>{settings.account_holder || 'NGUYỄN CÔNG NGUYÊN'}</strong></div>
                        <div>Nội dung CK: <strong className="text-amber-300 font-mono bg-forest-900 px-2 py-0.5 rounded border border-emerald-700">{order.order_code}</strong></div>
                      </div>

                      <button
                        onClick={copyBankInfo}
                        className="mt-2 text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition inline-flex items-center gap-1.5"
                      >
                        {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Đã Sao Chép!' : 'Sao Chép Thông Tin CK'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Items List */}
              {order.items && order.items.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Sản Phẩm Trong Đơn Hàng ({order.items.length})
                  </div>
                  <div className="divide-y divide-slate-100 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-xs border border-emerald-200">
                            {it.quantity}x
                          </span>
                          <span className="font-bold text-slate-900">{it.product_name}</span>
                        </div>
                        <span className="font-extrabold text-forest-800">{formatPrice(it.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
