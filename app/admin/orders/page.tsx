'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Eye, Check, X, Phone, 
  MapPin, ShoppingCart, Clock 
} from 'lucide-react';
import { formatPrice, formatDate, getOrderStatusLabel } from '@/lib/utils';
import { Order, OrderStatus } from '@/types/database.types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useToast } from '@/components/providers/ToastProvider';
import { useRealtime } from '@/components/providers/RealtimeProvider';

const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    order_code: 'HG982145',
    customer_name: 'Nguyễn Văn An',
    phone: '0905 123 456',
    address: '58 Lý Chính Thắng, TP. Quảng Ngãi',
    note: 'Giao trong giờ hành chính giúp em nhé',
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
    note: '',
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
    note: 'Đóng gói hạt giống cẩn thận giúp shop',
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

export default function AdminOrdersPage() {
  const { success, error, info } = useToast();
  const { lastUpdated } = useRealtime();
  const [orders, setOrders] = useState<Order[]>(INITIAL_MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadOrders() {
      // 1. Read LocalStorage placed orders
      let localOrders: Order[] = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('all_placed_orders') || '[]');
      } catch (e) {}

      // 2. Fetch Supabase orders if configured
      let supabaseOrders: Order[] = [];
      if (isSupabaseConfigured) {
        try {
          const { data, error: err } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });

          if (data && data.length > 0) {
            supabaseOrders = data.map((ord: any) => ({
              ...ord,
              items: ord.order_items && ord.order_items.length > 0 ? ord.order_items : ord.items || [],
            }));
          }
        } catch (e) {
          console.error('Error fetching admin orders:', e);
        }
      }

      // 3. Merge: Supabase Orders -> Local Placed Orders -> Mock Orders (avoiding duplicates)
      const fetchedMap = new Map();
      supabaseOrders.forEach((o) => {
        const key = o.order_code || o.id;
        fetchedMap.set(key, o);
      });

      localOrders.forEach((o) => {
        const key = o.order_code || o.id;
        if (!fetchedMap.has(key)) {
          fetchedMap.set(key, o);
        }
      });

      INITIAL_MOCK_ORDERS.forEach((o) => {
        const key = o.order_code || o.id;
        if (!fetchedMap.has(key)) {
          fetchedMap.set(key, o);
        }
      });

      const mergedOrders = Array.from(fetchedMap.values()).sort(
        (a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      setOrders(mergedOrders);
    }
    loadOrders();
  }, [lastUpdated]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (isSupabaseConfigured) {
      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
    }

    // Update LocalStorage placed orders
    try {
      const localOrders: Order[] = JSON.parse(localStorage.getItem('all_placed_orders') || '[]');
      const updatedLocal = localOrders.map((o) => (o.id === orderId || o.order_code === orderId ? { ...o, status: newStatus } : o));
      localStorage.setItem('all_placed_orders', JSON.stringify(updatedLocal));
    } catch (e) {}

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    success(`Đã cập nhật trạng thái đơn sang: ${getOrderStatusLabel(newStatus).label}`);
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_code.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search);
    const matchStatus = selectedStatus === 'all' || o.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
          Quản Lý Đơn Hàng 🛒
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi trạng thái đơn hàng, thông tin giao nhận và khách hàng
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên hoặc số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold border rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-forest-600"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Mã Đơn</th>
                <th className="py-3.5 px-6">Khách Hàng & SĐT</th>
                <th className="py-3.5 px-6">Địa Chỉ</th>
                <th className="py-3.5 px-6">Tổng Tiền</th>
                <th className="py-3.5 px-6">Phương Thức</th>
                <th className="py-3.5 px-6">Trạng Thái (Realtime)</th>
                <th className="py-3.5 px-6">Ngày Đặt</th>
                <th className="py-3.5 px-6 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-6 font-bold text-slate-900 font-mono">
                    #{ord.order_code}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="font-bold text-slate-900">{ord.customer_name}</div>
                    <div className="text-[11px] text-slate-500">{ord.phone}</div>
                  </td>
                  <td className="py-3.5 px-6 max-w-xs truncate text-slate-600">
                    {ord.address}
                  </td>
                  <td className="py-3.5 px-6 font-extrabold text-forest-800">
                    {formatPrice(ord.total)}
                  </td>
                  <td className="py-3.5 px-6">
                    {ord.payment_method === 'cod' ? 'COD' : 'Chuyển khoản QR'}
                  </td>
                  <td className="py-3.5 px-6">
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                      className={`text-xs font-bold rounded-xl px-2.5 py-1 border focus:outline-none cursor-pointer ${getOrderStatusLabel(ord.status).bg} ${getOrderStatusLabel(ord.status).color}`}
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="shipping">Đang giao hàng</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">{formatDate(ord.created_at)}</td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => setActiveOrder(ord)}
                      className="px-3 py-1.5 rounded-lg bg-forest-50 hover:bg-forest-100 text-forest-800 font-bold transition flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Chi Tiết Đơn Hàng #{activeOrder.order_code}
                </h3>
                <span className="text-xs text-slate-400">{formatDate(activeOrder.created_at)}</span>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="p-4 rounded-2xl bg-slate-50 space-y-1.5 text-xs">
              <div>Người nhận: <strong>{activeOrder.customer_name}</strong></div>
              <div>Số điện thoại: <strong className="text-forest-700">{activeOrder.phone}</strong></div>
              <div>Địa chỉ: {activeOrder.address}</div>
              {activeOrder.note && <div>Ghi chú: <em>"{activeOrder.note}"</em></div>}
            </div>

            {/* Items */}
            {activeOrder.items && activeOrder.items.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800">Danh sách sản phẩm:</span>
                <div className="divide-y divide-slate-100 border rounded-2xl p-3 bg-slate-50/50">
                  {activeOrder.items.map((it, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{it.quantity}x</span>{' '}
                        <span>{it.product_name}</span>
                      </div>
                      <span className="font-bold text-forest-800">{formatPrice(it.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial summary */}
            <div className="space-y-1 text-xs text-slate-600 pt-2 border-t">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatPrice(activeOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí giao hàng:</span>
                <span>{formatPrice(activeOrder.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t">
                <span>Tổng thanh toán:</span>
                <span className="text-forest-800">{formatPrice(activeOrder.total)}</span>
              </div>
            </div>

            {/* Status changer in modal */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700">Đổi trạng thái:</span>
              <select
                value={activeOrder.status}
                onChange={(e) => handleStatusChange(activeOrder.id, e.target.value as OrderStatus)}
                className="text-xs font-bold rounded-xl px-3 py-1.5 border bg-white"
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
