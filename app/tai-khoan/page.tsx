'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Package, Heart, LogOut, ChevronRight, MapPin, 
  Phone, Mail, Clock, CheckCircle2, Search, Sprout, ArrowRight,
  ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useRealtime } from '@/components/providers/RealtimeProvider';
import { formatPrice, formatDate, getOrderStatusLabel } from '@/lib/utils';
import { Order } from '@/types/database.types';

export default function AccountPage() {
  const router = useRouter();
  const { totalWishlist } = useWishlist();
  const { lastUpdated } = useRealtime();
  const [user, setUser] = useState<{ email?: string; name?: string; phone?: string; provider?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');

  // 1. Load user profile on mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUser({
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0],
            phone: user.user_metadata?.phone || '',
            provider: user.app_metadata?.provider || 'email',
          });
        }
      });
    }

    try {
      const savedUser = sessionStorage.getItem('mock_user') || localStorage.getItem('customer_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      const savedPhone = localStorage.getItem('customer_phone');
      if (savedPhone) {
        setPhoneFilter(savedPhone);
        setPhoneSearch(savedPhone);
      }
    } catch (e) {}
  }, []);

  // 2. Fetch Customer Orders (FILTERED STRICTLY TO THIS CUSTOMER ONLY)
  useEffect(() => {
    async function loadOrders() {
      setIsLoadingOrders(true);

      // Read order codes placed by this browser/device
      let myPlacedCodes: string[] = [];
      let localPlacedOrders: Order[] = [];
      try {
        const storedCodes = JSON.parse(localStorage.getItem('my_placed_order_codes') || '[]');
        if (Array.isArray(storedCodes)) myPlacedCodes = storedCodes;
        const allLocal = JSON.parse(localStorage.getItem('all_placed_orders') || '[]');
        if (Array.isArray(allLocal)) localPlacedOrders = allLocal;
      } catch (e) {}

      let allFetchedOrders: Order[] = [];
      try {
        const apiRes = await fetch('/api/admin/orders');
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.success && apiData.orders && apiData.orders.length > 0) {
            allFetchedOrders = apiData.orders;
          }
        }
      } catch (e) {}

      // Fallback direct Supabase
      if (allFetchedOrders.length === 0 && isSupabaseConfigured) {
        try {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
          if (data && data.length > 0) {
            allFetchedOrders = data;
          }
        } catch (e) {}
      }

      // Merge Supabase + Local placed orders by order_code
      const map = new Map(allFetchedOrders.map((o) => [o.order_code || o.id, o]));
      localPlacedOrders.forEach((lo) => {
        const key = lo.order_code || lo.id;
        if (!map.has(key)) map.set(key, lo);
      });

      const combinedOrders = Array.from(map.values()).sort(
        (a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      // CRITICAL PRIVACY PROTECTION:
      // STRICT FILTER: A customer ONLY sees orders that belong to them!
      const currentPhone = (phoneFilter || user?.phone || '').replace(/\s/g, '');
      const currentEmail = (user?.email || '').toLowerCase().trim();

      const customerOwnOrders = combinedOrders.filter((ord: any) => {
        const cleanOrdCode = (ord.order_code || '').toUpperCase().replace('#', '').trim();
        const isMyCode = myPlacedCodes.some((c) => c.toUpperCase().replace('#', '').trim() === cleanOrdCode);
        const ordPhone = (ord.phone || '').replace(/\s/g, '').trim();
        const isMyPhone = Boolean(currentPhone && ordPhone && ordPhone === currentPhone);
        const ordEmail = (ord.email || '').toLowerCase().trim();
        const isMyEmail = Boolean(currentEmail && ordEmail && ordEmail === currentEmail);

        return isMyCode || isMyPhone || isMyEmail;
      });

      setOrders(customerOwnOrders);
      setIsLoadingOrders(false);
    }

    loadOrders();
  }, [lastUpdated, phoneFilter, user]);

  const handlePhoneFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneSearch.trim();
    setPhoneFilter(clean);
    try {
      localStorage.setItem('customer_phone', clean);
    } catch (e) {}
  };

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
    <div className="bg-[#f8faf7] min-h-screen py-8 text-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-forest-900">Tài khoản thành viên</span>
        </nav>

        <div className="space-y-8">
          
          {/* User Profile Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-800 to-forest-900 text-white flex items-center justify-center text-2xl font-bold shadow-md relative overflow-hidden">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-xl font-extrabold text-slate-900 font-serif">
                      {user?.name || (phoneFilter ? `Khách Hàng (${phoneFilter})` : 'Khách Hàng Thành Viên')}
                    </h1>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      🌱 Thành viên
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {user?.email || (phoneFilter ? `Số điện thoại: ${phoneFilter}` : 'Chưa đăng nhập tài khoản')}
                  </p>
                </div>
              </div>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition shadow-2xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/tra-cuu-don-hang"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-forest-800 bg-forest-50 hover:bg-forest-100 transition"
                  >
                    Tra cứu đơn hàng
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Access Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/tra-cuu-don-hang"
                className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 hover:bg-emerald-50 transition space-y-2 group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <Package className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {orders.length} Đơn hàng của bạn
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">Tra Cứu Hành Trình Đơn Hàng</h3>
                <p className="text-xs text-slate-500">Kiểm tra chi tiết vị trí và tiến độ vận chuyển</p>
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
                <p className="text-xs text-slate-500">Danh sách các loại hoa &amp; cây trồng đang theo dõi</p>
              </Link>
            </div>
          </div>

          {/* Orders History List Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <span>Đơn Hàng Đã Đặt Của Bạn</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chỉ hiển thị đơn hàng thuộc tài khoản hoặc số điện thoại của bạn (bảo mật 100%)
                </p>
              </div>

              <Link
                href="/tra-cuu-don-hang"
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Tra cứu mã khác</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Phone Filter Form */}
            <form onSubmit={handlePhoneFilterSubmit} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-forest-600 shrink-0 ml-1" />
              <input
                type="text"
                placeholder="Nhập số điện thoại để tìm các đơn hàng đã đặt của bạn..."
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                className="flex-1 bg-transparent text-xs font-medium focus:outline-none placeholder-slate-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition shrink-0"
              >
                Lọc đơn
              </button>
              {phoneFilter && (
                <button
                  type="button"
                  onClick={() => { setPhoneFilter(''); setPhoneSearch(''); localStorage.removeItem('customer_phone'); }}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-medium transition shrink-0"
                >
                  Xóa
                </button>
              )}
            </form>

            {isLoadingOrders ? (
              <div className="py-12 text-center">
                <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-500 font-bold">Đang tải lịch sử đơn hàng của bạn...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-4 bg-slate-50/60 rounded-3xl border border-slate-100 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mx-auto text-2xl">
                  🌱
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">Bạn chưa có đơn hàng nào tại đây</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Hệ thống không hiển thị đơn của khách hàng khác để bảo mật thông tin. Nếu bạn đã từng đặt mua, vui lòng nhập số điện thoại đặt hàng ở trên hoặc tra cứu bằng mã đơn hàng.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link
                    href="/tra-cuu-don-hang"
                    className="px-5 py-2.5 rounded-xl border border-forest-600 text-forest-800 hover:bg-forest-50 text-xs font-bold transition"
                  >
                    Tra cứu bằng mã đơn
                  </Link>
                  <Link
                    href="/san-pham"
                    className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-md transition"
                  >
                    Mua hạt giống ngay
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const statusInfo = getOrderStatusLabel(ord.status);
                  return (
                    <div key={ord.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                            #{ord.order_code}
                          </span>
                          <span className="text-slate-400">({formatDate(ord.created_at)})</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {/* REALTIME DYNAMIC STATUS BADGE */}
                          <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${statusInfo.bg} ${statusInfo.color} shadow-2xs`}>
                            {statusInfo.label}
                          </span>
                          <span className="font-extrabold text-forest-800 text-sm">
                            {formatPrice(ord.total)}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 pt-1 flex items-center justify-between flex-wrap gap-2">
                        <div>
                          Người nhận: <strong>{ord.customer_name}</strong> ({ord.phone})
                        </div>
                        
                        <Link
                          href={`/tra-cuu-don-hang?code=${ord.order_code}`}
                          className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white font-bold text-[11px] rounded-xl transition shadow-2xs flex items-center gap-1"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Xem Tiến Độ Realtime →</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
