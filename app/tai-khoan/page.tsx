'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Package, Heart, LogOut, ChevronRight, MapPin,
  Phone, Mail, Clock, Search, Sprout, ArrowRight,
  ShieldCheck, RefreshCw, Edit3, Bell, Gift, Star,
  Truck, CheckCircle2, XCircle, AlertCircle, Loader2,
  Home, CreditCard, Settings, Leaf, Sparkles,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useRealtime } from '@/components/providers/RealtimeProvider';
import { formatPrice, formatDate, getOrderStatusLabel } from '@/lib/utils';
import { Order } from '@/types/database.types';

type Tab = 'dashboard' | 'orders' | 'profile' | 'wishlist';

interface UserProfile {
  email?: string;
  name?: string;
  phone?: string;
  provider?: string;
  address?: string;
  avatar?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { totalWishlist } = useWishlist();
  const { lastUpdated } = useRealtime();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');

  // Profile edit state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // 1. Load user
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getUser().then(({ data: { user: su } }) => {
        if (su) {
          const profile: UserProfile = {
            email: su.email,
            name: su.user_metadata?.full_name || su.email?.split('@')[0],
            phone: su.user_metadata?.phone || '',
            provider: su.app_metadata?.provider || 'email',
          };
          setUser(profile);
          setEditName(profile.name || '');
          setEditPhone(profile.phone || '');
        }
      });
    }
    try {
      const saved = sessionStorage.getItem('mock_user') || localStorage.getItem('customer_user');
      if (saved) {
        const u: UserProfile = JSON.parse(saved);
        setUser(u);
        setEditName(u.name || '');
        setEditPhone(u.phone || '');
        setEditAddress(u.address || '');
      }
      const savedPhone = localStorage.getItem('customer_phone');
      if (savedPhone) { setPhoneFilter(savedPhone); setPhoneSearch(savedPhone); }
    } catch (_) {}
  }, []);

  // 2. Load orders
  useEffect(() => {
    async function loadOrders() {
      setIsLoadingOrders(true);
      let myPlacedCodes: string[] = [];
      let localPlacedOrders: Order[] = [];
      try {
        const codes = JSON.parse(localStorage.getItem('my_placed_order_codes') || '[]');
        if (Array.isArray(codes)) myPlacedCodes = codes;
        const all = JSON.parse(localStorage.getItem('all_placed_orders') || '[]');
        if (Array.isArray(all)) localPlacedOrders = all;
      } catch (_) {}

      let fetched: Order[] = [];
      try {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
          const d = await res.json();
          if (d.success && d.orders?.length > 0) fetched = d.orders;
        }
      } catch (_) {}

      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          if (data && data.length > 0) fetched = data as Order[];
        } catch (_) {}
      }

      const map = new Map(fetched.map((o) => [o.order_code || o.id, o]));
      localPlacedOrders.forEach((lo) => {
        const k = lo.order_code || lo.id;
        if (!map.has(k)) map.set(k, lo);
      });

      const combined = Array.from(map.values()).sort(
        (a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      const currentPhone = (phoneFilter || user?.phone || '').replace(/\s/g, '');
      const currentEmail = (user?.email || '').toLowerCase().trim();

      const mine = combined.filter((ord: any) => {
        const code = (ord.order_code || '').toUpperCase().replace('#', '').trim();
        const isMyCode = myPlacedCodes.some((c) => c.toUpperCase().replace('#', '').trim() === code);
        const ordPhone = (ord.phone || '').replace(/\s/g, '');
        const isMyPhone = Boolean(currentPhone && ordPhone && ordPhone === currentPhone);
        const ordEmail = (ord.email || '').toLowerCase().trim();
        const isMyEmail = Boolean(currentEmail && ordEmail && ordEmail === currentEmail);
        return isMyCode || isMyPhone || isMyEmail;
      });

      setOrders(mine);
      setIsLoadingOrders(false);
    }
    loadOrders();
  }, [lastUpdated, phoneFilter, user]);

  const handleLogout = async () => {
    if (isSupabaseConfigured) { try { await supabase.auth.signOut(); } catch (_) {} }
    sessionStorage.removeItem('mock_user');
    localStorage.removeItem('customer_user');
    setUser(null);
    router.push('/');
  };

  const handlePhoneFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneSearch.trim();
    setPhoneFilter(clean);
    try { localStorage.setItem('customer_phone', clean); } catch (_) {}
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const updated: UserProfile = { ...user, name: editName, phone: editPhone, address: editAddress };
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.updateUser({ data: { full_name: editName, phone: editPhone } });
      } catch (_) {}
    }
    try {
      sessionStorage.setItem('mock_user', JSON.stringify(updated));
      localStorage.setItem('customer_user', JSON.stringify(updated));
    } catch (_) {}
    setUser(updated);
    setIsSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    shipping: orders.filter((o) => o.status === 'shipping' || o.status === 'confirmed').length,
    completed: orders.filter((o) => o.status === 'completed').length,
  };

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Tổng quan', icon: <Home className="w-4 h-4" /> },
    { key: 'orders', label: 'Đơn hàng', icon: <Package className="w-4 h-4" /> },
    { key: 'wishlist', label: 'Yêu thích', icon: <Heart className="w-4 h-4" /> },
    { key: 'profile', label: 'Hồ sơ', icon: <User className="w-4 h-4" /> },
  ];

  // Redirect to login if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F9F2] via-white to-[#FDF8EE] flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#07552D] to-[#16A765] shadow-xl flex items-center justify-center">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-[#063B20] font-serif">Khu Vực Thành Viên</h1>
            <p className="text-[13px] text-[#718078] mt-2">Đăng nhập để quản lý đơn hàng, điểm thưởng và ưu đãi của bạn.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/tai-khoan/dang-nhap" className="w-full py-3 bg-[#07552D] hover:bg-[#08763B] text-white font-bold rounded-2xl text-[14px] transition-colors shadow-md text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Đăng Nhập Tài Khoản
            </Link>
            <Link href="/tai-khoan/dang-ky" className="w-full py-3 border-2 border-[#D6EDDB] hover:border-[#A8CDB0] text-[#07552D] font-bold rounded-2xl text-[14px] transition-colors text-center flex items-center justify-center gap-2 hover:bg-[#F2FAF5]">
              <Sparkles className="w-4 h-4" /> Đăng Ký Miễn Phí
            </Link>
            <Link href="/tra-cuu-don-hang" className="text-[13px] text-[#718078] hover:text-[#07552D] font-medium transition-colors flex items-center justify-center gap-1.5">
              <Search className="w-3.5 h-3.5" /> Tra cứu đơn hàng không cần đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8F5]">

      {/* ── Hero Header Banner ── */}
      <div className="bg-gradient-to-r from-[#053318] via-[#07552D] to-[#08763B] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Avatar + info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center text-[26px] font-extrabold text-white shadow-lg">
                  {avatarLetter}
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#F5B82E] rounded-full border-2 border-[#07552D] flex items-center justify-center">
                  <Star className="w-2.5 h-2.5 text-[#063B20]" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[19px] font-extrabold font-serif">{user.name || 'Thành Viên'}</h1>
                  <span className="bg-[#F5B82E] text-[#063B20] text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                    🌱 Thành viên
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[12px] text-emerald-200/90 flex-wrap">
                  {user.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>}
                  {user.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone}</span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[12.5px] font-semibold transition-colors border border-white/20"
              >
                <Edit3 className="w-3.5 h-3.5" />Chỉnh sửa
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[12.5px] font-semibold transition-colors border border-rose-400/30"
              >
                <LogOut className="w-3.5 h-3.5" />Đăng xuất
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Tổng đơn', value: orderStats.total, icon: Package, color: 'text-white' },
              { label: 'Chờ xử lý', value: orderStats.pending, icon: Clock, color: 'text-amber-300' },
              { label: 'Đang giao', value: orderStats.shipping, icon: Truck, color: 'text-blue-300' },
              { label: 'Hoàn thành', value: orderStats.completed, icon: CheckCircle2, color: 'text-emerald-300' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3 text-center">
                <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                <div className="text-[20px] font-extrabold text-white">{value}</div>
                <div className="text-[10.5px] text-emerald-200/80 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="bg-white border-b border-[#E3ECE6] sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-4 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  activeTab === key
                    ? 'border-[#07552D] text-[#07552D]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {icon}
                {label}
                {key === 'orders' && orders.length > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${activeTab === 'orders' ? 'bg-[#07552D] text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {orders.length}
                  </span>
                )}
                {key === 'wishlist' && totalWishlist > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${activeTab === 'wishlist' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'}`}>
                    {totalWishlist}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ──── DASHBOARD TAB ──── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick action cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('orders')}
                className="bg-white rounded-2xl p-5 border border-[#E3ECE6] hover:border-[#A8CDB0] hover:shadow-md transition-all group text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#EDF5EE] group-hover:bg-[#D6EDDB] flex items-center justify-center transition-colors">
                    <Package className="w-5 h-5 text-[#07552D]" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C0CFC4] group-hover:text-[#07552D] group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
                <div className="mt-3">
                  <p className="text-[11px] text-[#A0AFA5] font-medium uppercase tracking-wide">Đơn hàng của bạn</p>
                  <p className="text-[22px] font-extrabold text-[#17231C]">{orderStats.total}</p>
                  <p className="text-[12px] text-[#718078] mt-0.5">{orderStats.pending} chờ xử lý · {orderStats.shipping} đang giao</p>
                </div>
              </button>

              <Link
                href="/yeu-thich"
                className="bg-white rounded-2xl p-5 border border-[#E3ECE6] hover:border-rose-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
                    <Heart className="w-5 h-5 text-rose-500" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C0CFC4] group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
                <div className="mt-3">
                  <p className="text-[11px] text-[#A0AFA5] font-medium uppercase tracking-wide">Yêu thích</p>
                  <p className="text-[22px] font-extrabold text-[#17231C]">{totalWishlist}</p>
                  <p className="text-[12px] text-[#718078] mt-0.5">Sản phẩm đang theo dõi</p>
                </div>
              </Link>

              <Link
                href="/tra-cuu-don-hang"
                className="bg-white rounded-2xl p-5 border border-[#E3ECE6] hover:border-amber-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                    <Search className="w-5 h-5 text-amber-600" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C0CFC4] group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
                <div className="mt-3">
                  <p className="text-[11px] text-[#A0AFA5] font-medium uppercase tracking-wide">Tra cứu đơn hàng</p>
                  <p className="text-[22px] font-extrabold text-[#17231C]">→</p>
                  <p className="text-[12px] text-[#718078] mt-0.5">Nhập mã để xem tiến độ</p>
                </div>
              </Link>
            </div>

            {/* Recent orders */}
            {orders.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E3ECE6] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBF2EC]">
                  <h2 className="text-[14px] font-extrabold text-[#17231C] flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#07552D]" />Đơn hàng gần đây
                  </h2>
                  <button onClick={() => setActiveTab('orders')} className="text-[12px] font-semibold text-[#08763B] hover:underline flex items-center gap-1">
                    Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-[#F0F5F1]">
                  {orders.slice(0, 3).map((ord) => {
                    const st = getOrderStatusLabel(ord.status);
                    return (
                      <div key={ord.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#F6FAF7] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#EDF5EE] flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-[#07552D]" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[#17231C] font-mono">#{ord.order_code}</p>
                            <p className="text-[11.5px] text-[#A0AFA5]">{formatDate(ord.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                          <span className="text-[13px] font-extrabold text-[#07552D]">{formatPrice(ord.total)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA shop */}
            <div className="bg-gradient-to-r from-[#053318] to-[#08763B] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-[#F5B82E]" />
                </div>
                <div>
                  <p className="text-[15px] font-extrabold font-serif">Khám phá hạt giống mới nhất</p>
                  <p className="text-[12px] text-emerald-200 mt-0.5">Hàng trăm loại hoa, rau củ, cây cảnh F1 chuẩn</p>
                </div>
              </div>
              <Link
                href="/san-pham"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F5B82E] hover:bg-[#F0A91A] text-[#063B20] font-bold text-[13px] rounded-xl transition-colors flex-shrink-0"
              >
                Mua ngay <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ──── ORDERS TAB ──── */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-[16px] font-extrabold text-[#17231C] font-serif flex items-center gap-2">
                <Package className="w-5 h-5 text-[#07552D]" />
                Đơn Hàng Của Bạn
              </h2>
              {/* Phone filter */}
              <form onSubmit={handlePhoneFilter} className="flex items-center gap-2">
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#A0AFA5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Lọc theo số điện thoại..."
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 text-[12.5px] border-2 border-[#E3ECE6] rounded-xl bg-white focus:border-[#16A765] outline-none w-[200px] sm:w-[220px]"
                  />
                </div>
                <button type="submit" className="px-3 py-2 bg-[#07552D] text-white text-[12px] font-bold rounded-xl hover:bg-[#08763B] transition-colors">Lọc</button>
                {phoneFilter && (
                  <button type="button" onClick={() => { setPhoneFilter(''); setPhoneSearch(''); localStorage.removeItem('customer_phone'); }} className="px-3 py-2 bg-slate-100 text-slate-600 text-[12px] font-medium rounded-xl hover:bg-slate-200 transition-colors">Xóa</button>
                )}
              </form>
            </div>

            {isLoadingOrders ? (
              <div className="bg-white rounded-2xl border border-[#E3ECE6] py-16 text-center">
                <Loader2 className="w-8 h-8 text-[#07552D] animate-spin mx-auto mb-3" />
                <p className="text-[13px] text-[#718078] font-medium">Đang tải đơn hàng của bạn...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E3ECE6] py-16 text-center px-6">
                <div className="w-16 h-16 bg-[#EDF5EE] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🌱</div>
                <h3 className="text-[15px] font-bold text-[#17231C] font-serif">Chưa có đơn hàng nào</h3>
                <p className="text-[12.5px] text-[#718078] mt-2 max-w-sm mx-auto leading-relaxed">
                  Nhập số điện thoại đặt hàng ở trên hoặc tra cứu bằng mã đơn để xem lịch sử mua hàng.
                </p>
                <div className="flex items-center justify-center gap-3 mt-5">
                  <Link href="/tra-cuu-don-hang" className="px-5 py-2.5 rounded-xl border-2 border-[#D6EDDB] text-[#07552D] font-bold text-[12.5px] hover:bg-[#F2FAF5] transition-colors">
                    Tra cứu mã đơn
                  </Link>
                  <Link href="/san-pham" className="px-5 py-2.5 rounded-xl bg-[#07552D] hover:bg-[#08763B] text-white font-bold text-[12.5px] transition-colors shadow-md">
                    Mua hạt giống ngay
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => {
                  const st = getOrderStatusLabel(ord.status);
                  const statusIcon = ord.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> :
                    ord.status === 'cancelled' ? <XCircle className="w-4 h-4" /> :
                    ord.status === 'shipping' ? <Truck className="w-4 h-4" /> :
                    <Clock className="w-4 h-4" />;
                  return (
                    <div key={ord.id} className="bg-white rounded-2xl border border-[#E3ECE6] hover:border-[#A8CDB0] hover:shadow-sm transition-all overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-3.5 bg-[#F6FAF7] border-b border-[#EBF2EC]">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-[13px] text-[#17231C] bg-white px-2.5 py-1 rounded-lg border border-[#E3ECE6]">
                            #{ord.order_code}
                          </span>
                          <span className="text-[11.5px] text-[#A0AFA5] flex items-center gap-1">
                            <Clock className="w-3 h-3" />{formatDate(ord.created_at)}
                          </span>
                        </div>
                        <span className={`flex items-center gap-1.5 text-[11.5px] font-bold px-3 py-1 rounded-full ${st.bg} ${st.color}`}>
                          {statusIcon}{st.label}
                        </span>
                      </div>
                      {/* Body */}
                      <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
                        <div className="text-[12.5px] text-[#718078] space-y-0.5">
                          <p><span className="font-semibold text-[#374C3E]">Người nhận:</span> {ord.customer_name} · {ord.phone}</p>
                          {ord.address && <p className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#A0AFA5]" />{ord.address}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[16px] font-extrabold text-[#07552D]">{formatPrice(ord.total)}</span>
                          <Link
                            href={`/tra-cuu-don-hang?code=${ord.order_code}`}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#07552D] hover:bg-[#08763B] text-white text-[12px] font-bold rounded-xl transition-colors shadow-sm"
                          >
                            <Search className="w-3.5 h-3.5" />Xem tiến độ
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ──── WISHLIST TAB ──── */}
        {activeTab === 'wishlist' && (
          <div className="space-y-5">
            <h2 className="text-[16px] font-extrabold text-[#17231C] font-serif flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />Sản Phẩm Yêu Thích
            </h2>
            <div className="bg-white rounded-2xl border border-[#E3ECE6] py-16 text-center px-6">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">❤️</div>
              <h3 className="text-[15px] font-bold text-[#17231C] font-serif">
                {totalWishlist > 0 ? `${totalWishlist} sản phẩm yêu thích` : 'Chưa có sản phẩm nào'}
              </h3>
              <p className="text-[12.5px] text-[#718078] mt-2">
                {totalWishlist > 0 ? 'Xem danh sách đầy đủ và mua ngay.' : 'Lưu những loại hạt giống bạn thích để mua sau.'}
              </p>
              <Link href="/yeu-thich" className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[13px] rounded-xl transition-colors shadow-md">
                <Heart className="w-4 h-4" />
                {totalWishlist > 0 ? 'Xem danh sách yêu thích' : 'Khám phá sản phẩm'}
              </Link>
            </div>
          </div>
        )}

        {/* ──── PROFILE TAB ──── */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            <h2 className="text-[16px] font-extrabold text-[#17231C] font-serif flex items-center gap-2">
              <User className="w-5 h-5 text-[#07552D]" />Thông Tin Cá Nhân
            </h2>

            <div className="bg-white rounded-2xl border border-[#E3ECE6] overflow-hidden">
              {/* Profile avatar header */}
              <div className="bg-gradient-to-r from-[#07552D] to-[#0A8A45] px-6 py-8 flex flex-col items-center text-center text-white">
                <div className="w-20 h-20 rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center text-[32px] font-extrabold mb-3 shadow-lg">
                  {avatarLetter}
                </div>
                <p className="text-[16px] font-extrabold font-serif">{user.name}</p>
                <p className="text-[12px] text-emerald-200 mt-0.5">{user.email}</p>
                <span className="mt-2 bg-[#F5B82E] text-[#063B20] text-[9.5px] font-black px-3 py-1 rounded-full uppercase tracking-wide">
                  🌱 Thành viên Nhà Vườn
                </span>
              </div>

              {/* Edit form */}
              <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#374C3E] block">Họ và tên</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#A0AFA5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nguyễn Văn An"
                        className="w-full pl-10 pr-4 py-2.5 text-[13.5px] border-2 border-[#E3ECE6] rounded-xl bg-[#F6FAF7] focus:bg-white focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)] outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#374C3E] block">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#A0AFA5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="0934811307"
                        className="w-full pl-10 pr-4 py-2.5 text-[13.5px] border-2 border-[#E3ECE6] rounded-xl bg-[#F6FAF7] focus:bg-white focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#374C3E] block">Email (không thể thay đổi)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A0AFA5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 text-[13.5px] border-2 border-[#E3ECE6] rounded-xl bg-slate-50 text-[#A0AFA5] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#374C3E] block">Địa chỉ giao hàng mặc định</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#A0AFA5] absolute left-3.5 top-3.5 pointer-events-none" />
                    <textarea
                      rows={2}
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                      className="w-full pl-10 pr-4 py-2.5 text-[13.5px] border-2 border-[#E3ECE6] rounded-xl bg-[#F6FAF7] focus:bg-white focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)] outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {profileSaved && (
                    <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />Đã lưu thành công!
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-[#07552D] hover:bg-[#08763B] disabled:opacity-60 text-white text-[13.5px] font-bold rounded-xl transition-colors shadow-md"
                  >
                    {isSavingProfile ? <><RefreshCw className="w-4 h-4 animate-spin" />Đang lưu...</> : <><Edit3 className="w-4 h-4" />Lưu thay đổi</>}
                  </button>
                </div>
              </form>
            </div>

            {/* Logout card */}
            <div className="bg-white rounded-2xl border border-[#E3ECE6] p-5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-bold text-[#17231C]">Đăng xuất tài khoản</p>
                <p className="text-[12px] text-[#718078] mt-0.5">Bạn có thể đăng nhập lại bất kỳ lúc nào.</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-[13px] font-bold transition-colors border border-rose-200"
              >
                <LogOut className="w-4 h-4" />Đăng xuất
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
