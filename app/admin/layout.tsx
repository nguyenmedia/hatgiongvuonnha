'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingCart, FolderTree, 
  Image as ImageIcon, Sliders, Settings, Tag, 
  FileText, ExternalLink, Menu, X, Bell, User, Search,
  ChevronRight, Sparkles, ShieldCheck, HelpCircle, Lock, LogOut, Key
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', label: 'Tổng quan Dashboard', icon: LayoutDashboard, badge: 'Live' },
  { href: '/admin/products', label: 'Quản lý Sản phẩm', icon: Package, badge: '8 SP' },
  { href: '/admin/orders', label: 'Quản lý Đơn hàng', icon: ShoppingCart, badge: 'HOT' },
  { href: '/admin/categories', label: 'Quản lý Danh mục', icon: FolderTree },
  { href: '/admin/media', label: 'Kho Ảnh Supabase', icon: ImageIcon },
  { href: '/admin/banners', label: 'Quản lý Banner', icon: Sliders },
  { href: '/admin/coupons', label: 'Mã Giảm Giá', icon: Tag },
  { href: '/admin/blog', label: 'Bài Viết Blog', icon: FileText },
  { href: '/admin/settings', label: 'Cài Đặt Website', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('admin_authenticated');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {}
    setIsCheckingAuth(false);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (usernameInput.trim() === 'nguyenmedia' && passwordInput === 'nguyenmedia123') {
      try {
        localStorage.setItem('admin_authenticated', 'true');
      } catch (e) {}
      setIsAuthenticated(true);
    } else {
      setAuthError('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('admin_authenticated');
    } catch (e) {}
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  const activeNavItem = ADMIN_NAV.find((item) => item.href === pathname) || ADMIN_NAV[0];

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">Đang kiểm tra quyền truy cập hệ thống...</p>
        </div>
      </div>
    );
  }

  // Render Login Form if NOT Authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#042414] via-emerald-950 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-emerald-500/30 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-900/10 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-inner">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-extrabold font-serif text-slate-900">
              Đăng Nhập Quản Trị Shop 🔒
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Cổng bảo mật nội bộ Hạt Giống Nhà Vườn
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center animate-in fade-in">
                ⚠️ {authError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Tên đăng nhập (*)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Nhập nguyenmedia"
                  className="w-full pl-10 pr-4 py-3 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Mật khẩu (*)</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Nhập nguyenmedia123"
                  className="w-full pl-10 pr-4 py-3 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-forest-900 hover:from-emerald-900 hover:to-forest-950 text-white text-xs font-extrabold transition shadow-lg flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-amber-300" />
              <span>ĐĂNG NHẬP QUẢN TRỊ</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-200">
            <Link href="/" className="text-xs text-emerald-700 hover:underline font-bold">
              ← Trở về Trang chủ Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800 font-sans">
      
      {/* 1. DESKTOP SIDEBAR - PRO BOTANICAL DARK NAVIGATION */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#042414] text-white border-r border-emerald-950 shrink-0 sticky top-0 h-screen shadow-2xl z-30">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-emerald-900/60 flex items-center justify-between bg-emerald-950/40">
          <Link href="/admin" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Hạt Giống Nhà Vườn Admin Logo"
              className="w-10 h-10 rounded-full object-contain bg-white p-0.5 shadow-lg group-hover:scale-105 transition"
            />
            <div>
              <div className="font-extrabold text-sm tracking-wide font-serif text-white flex items-center gap-1.5">
                <span>HẠT GIỐNG VƯỜN</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-sans font-bold border border-emerald-500/30">PRO</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-sans font-medium tracking-wider">
                Hệ Thống Quản Trị Shop
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="px-4 pt-4 pb-2 text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">
          MENU QUẢN TRỊ
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-forest-700 text-white font-bold shadow-lg shadow-emerald-950/80 border border-emerald-400/30'
                    : 'text-gray-300 hover:bg-emerald-950/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition ${isActive ? 'text-white' : 'text-emerald-400 group-hover:text-emerald-300'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom System Status */}
        <div className="p-4 border-t border-emerald-900/60 bg-emerald-950/40 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-forest-900/90 text-emerald-300 hover:bg-forest-900 transition text-xs font-bold border border-emerald-700/50 shadow-md group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
              <span>Xem Website Shop</span>
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
          </Link>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{activeNavItem.label}</span>
              </h1>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>Admin</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-emerald-700 font-semibold">{activeNavItem.label}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest-50 text-forest-700 text-xs font-bold hover:bg-forest-100 border border-forest-200 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở Cửa Hàng Live</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 border border-rose-200 transition"
              title="Đăng xuất khỏi hệ thống quản trị"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>

            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-md">
                AD
              </div>
              <div className="hidden md:block pr-2 text-left">
                <div className="text-xs font-bold text-slate-900">nguyenmedia</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Admin Master</div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsSidebarOpen(false)} />
            <div className="relative w-72 bg-[#042414] text-white h-full shadow-2xl p-5 flex flex-col z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-900/60 mb-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span className="text-xl">🌱</span>
                  <span>Hạt Giống Nhà Vườn</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-1.5 flex-1">
                {ADMIN_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold ${
                        isActive ? 'bg-gradient-to-r from-emerald-600 to-forest-700 text-white font-bold' : 'text-gray-300 hover:bg-emerald-950'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Admin Page Contents */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>

    </div>
  );
}
