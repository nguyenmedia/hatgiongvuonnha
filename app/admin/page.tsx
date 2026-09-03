'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, ShoppingBag, Package, Users, 
  ArrowUpRight, Clock, Plus, ArrowRight, ShieldCheck, 
  ExternalLink, CheckCircle2, AlertTriangle, Sparkles, RefreshCw
} from 'lucide-react';
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS } from '@/lib/constants';
import { formatPrice, formatDate, getOrderStatusLabel } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Order } from '@/types/database.types';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([
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
    }
  ]);

  const [stats, setStats] = useState({
    totalRevenue: 580000,
    totalOrders: 3,
    totalProducts: INITIAL_PRODUCTS.length,
    totalCustomers: 128,
  });

  useEffect(() => {
    async function loadDashboardOrders() {
      let localOrders: Order[] = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('all_placed_orders') || '[]');
      } catch (e) {}

      let supabaseOrders: Order[] = [];
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (data && data.length > 0) {
            supabaseOrders = data;
          }
        } catch (e) {}

        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .then(({ count }) => {
            if (count !== null && count > 0) {
              setStats((prev) => ({
                ...prev,
                totalProducts: count,
              }));
            }
          });
      }

      const fetchedMap = new Map();
      supabaseOrders.forEach((o) => fetchedMap.set(o.order_code || o.id, o));
      localOrders.forEach((o) => {
        const key = o.order_code || o.id;
        if (!fetchedMap.has(key)) fetchedMap.set(key, o);
      });

      const merged = Array.from(fetchedMap.values()).sort(
        (a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      if (merged.length > 0) {
        setOrders(merged.slice(0, 6));
        const sum = merged.reduce((acc: number, o: any) => acc + Number(o.total || 0), 0);
        setStats((prev) => ({
          ...prev,
          totalOrders: merged.length,
          totalRevenue: sum,
        }));
      }
    }

    loadDashboardOrders();
  }, []);

  const lowStockProducts = INITIAL_PRODUCTS.filter((p) => p.stock < 50);

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>HỆ THỐNG ĐỒNG BỘ REALTIME SUPABASE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
            Chào mừng trở lại, Quản Trị Viên! 🌱
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
            Theo dõi tổng quan doanh thu, đơn hàng và danh mục hạt giống kinh doanh hôm nay.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/products/new"
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </Link>
          <Link
            href="/admin/orders"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Xem Đơn Hàng</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-4 font-serif">
            {formatPrice(stats.totalRevenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+15.4% so với tháng trước</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Đơn Hàng</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-4 font-serif">
            {stats.totalOrders} Đơn
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Cập nhật 5 phút trước</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sản Phẩm Đang Bán</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-4 font-serif">
            {stats.totalProducts} Sản phẩm
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>8 sản phẩm nổi bật</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khách Hàng Hàng Tháng</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-4 font-serif">
            {stats.totalCustomers} Khách
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+8 khách hàng mới</span>
          </div>
        </div>

      </div>

      {/* Orders Table & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">Đơn Hàng Mới Nhất 🛒</h3>
              <p className="text-xs text-slate-400">Danh sách các đơn vừa được khách hàng đặt</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-2">Mã Đơn</th>
                  <th className="py-3 px-2">Khách Hàng</th>
                  <th className="py-3 px-2">Tổng Tiền</th>
                  <th className="py-3 px-2">Trạng Thái</th>
                  <th className="py-3 px-2 text-right">Ngày Đặt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {orders.map((order) => {
                  const statusInfo = getOrderStatusLabel(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-2 font-bold text-forest-800">#{order.order_code}</td>
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-slate-900">{order.customer_name}</div>
                        <div className="text-[11px] text-slate-400">{order.phone}</div>
                      </td>
                      <td className="py-3.5 px-2 font-extrabold text-slate-900">{formatPrice(order.total)}</td>
                      <td className="py-3.5 px-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right text-slate-400 text-[11px]">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Low Stock Warnings & Quick Links */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Cảnh Báo Tồn Kho Ít (&lt; 50 gói)</span>
            </div>

            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                  <div className="flex items-center gap-3">
                    <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-xl object-cover border" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</div>
                      <div className="text-[11px] text-amber-700 font-semibold">Còn {p.stock} gói</div>
                    </div>
                  </div>
                  <Link
                    href={`/admin/products/new`}
                    className="text-[10px] font-bold px-2.5 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                  >
                    Nhập thêm
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-forest-900 to-forest-950 p-6 rounded-3xl text-white shadow-md">
            <h4 className="font-serif font-bold text-base text-white">Tích Hợp Supabase Storage 🌱</h4>
            <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
              Toàn bộ dữ liệu sản phẩm, đơn hàng và kho ảnh được lưu trữ tập trung trên Supabase PostgreSQL.
            </p>
            <div className="mt-4 pt-3 border-t border-forest-800 flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-bold">Status: Online Realtime</span>
              <Link href="/admin/media" className="text-xs text-amber-300 font-bold hover:underline">
                Kho Ảnh →
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
