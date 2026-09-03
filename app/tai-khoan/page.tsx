'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, Heart, LogOut, ChevronRight, MapPin, Phone, Mail, Clock, CheckCircle2, Search, Sprout, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order } from '@/types/database.types';

export default function AccountPage() {
  const router = useRouter();
  const { totalWishlist } = useWishlist();
  const [user, setUser] = useState<{ email?: string; name?: string; phone?: string; provider?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    // 1. Fetch User profile
    if (isSupabaseConfigured) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUser({
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0],
            phone: user.user_metadata?.phone || '0934811307',
            provider: user.app_metadata?.provider || 'email',
          });
        }
      });
    }

    // Fallback or session storage
    try {
      const savedUser = sessionStorage.getItem('mock_user') || localStorage.getItem('customer_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {}

    // 2. Fetch Customer Orders
    async function loadOrders() {
      let localOrders: Order[] = [];
      try {
        const saved = localStorage.getItem('all_placed_orders');
        if (saved) {
          localOrders = JSON.parse(saved);
        }
      } catch (e) {}

      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (data && data.length > 0) {
            const map = new Map(data.map((o) => [o.id, o]));
            const combined = [
              ...data,
              ...localOrders.filter((o) => !map.has(o.id))
            ];
            setOrders(combined);
            setIsLoadingOrders(false);
            return;
          }
        } catch (e) {}
      }

      setOrders(localOrders);
      setIsLoadingOrders(false);
    }

    loadOrders();
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    sessionStorage.removeItem('mock_user');
    localStorage.removeItem('customer_user');
    setUser(null);
    router.push('/');
  };

  return (
    <div className="bg-[#f7faf8] min-h-screen py-8 text-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-forest-950">Tài khoản thành viên</span>
        </nav>

        <div className="space-y-8">
          
          {/* User Profile Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-800 to-forest-900 text-white flex items-center justify-center text-2xl font-bold shadow-md relative overflow-hidden">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-xl font-extrabold text-slate-900 font-serif">
                      {user?.name || 'Khách Hàng Thành Viên'}
                    </h1>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      🌱 Thành viên Thân Thiết
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{user?.email || 'Chưa đăng nhập'}</p>
                </div>
              </div>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/tai-khoan/dang-nhap"
                    className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-sm transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/tai-khoan/dang-ky"
                    className="px-5 py-2.5 rounded-xl border border-forest-600 text-forest-800 hover:bg-forest-50 text-xs font-bold transition"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions Grid (NO ADMIN CARD) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/tra-cuu-don-hang"
                className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-50 transition space-y-2 group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <Package className="w-6 h-6 text-emerald-700 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {orders.length} Đơn hàng
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">Tra Cứu Hành Trình Đơn Hàng</h3>
                <p className="text-xs text-slate-500">Kiểm tra chi tiết trạng thái vận chuyển hạt giống</p>
              </Link>

              <Link
                href="/yeu-thich"
                className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 hover:bg-rose-50 transition space-y-2 group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <Heart className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-rose-700 bg-white px-2.5 py-0.5 rounded-full border border-rose-200">
                    {totalWishlist} Giống cây
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">Sản Phẩm Yêu Thích</h3>
                <p className="text-xs text-slate-500">Danh sách các loại hoa & cây trồng đang theo dõi</p>
              </Link>
            </div>
          </div>

          {/* Orders History List Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <span>Đơn Hàng Đã Đặt Của Bạn</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Danh sách đơn hàng bạn đã mua tại Hạt Giống Nhà Vườn</p>
              </div>

              <Link
                href="/tra-cuu-don-hang"
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>Tra cứu mã khác</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoadingOrders ? (
              <div className="py-12 text-center">
                <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-500 font-bold">Đang tải lịch sử đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-3xl">🌱</div>
                <h3 className="text-sm font-bold text-slate-900">Bạn chưa có đơn hàng nào</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hãy khám phá danh mục hạt giống hoa & rau củ quả thuần F1 để bắt đầu gieo trồng ngay hôm nay!
                </p>
                <Link
                  href="/san-pham"
                  className="mt-2 inline-block px-5 py-2.5 rounded-xl bg-forest-800 text-white text-xs font-bold shadow transition"
                >
                  Mua sắm hạt giống ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          {ord.order_code}
                        </span>
                        <span className="text-slate-400">({formatDate(ord.created_at)})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          ⏳ Chờ xác nhận / Đang xử lý
                        </span>
                        <span className="font-extrabold text-emerald-800 text-sm">
                          {formatPrice(ord.total_amount)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 pt-1 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        Người nhận: <strong>{ord.customer_name}</strong> ({ord.customer_phone})
                      </div>
                      
                      <Link
                        href={`/tra-cuu-don-hang?code=${ord.order_code}`}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition shadow-2xs flex items-center gap-1"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Xem Vận Trình →</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
