'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, ShoppingBag, Heart, Phone, Menu, X, 
  ChevronDown, Sparkles, User, ArrowRight, ShieldCheck, Truck, Clock, ChevronRight,
  LayoutGrid, Flame, Sprout, Tag, Layers, Star, Award, Compass, HelpCircle, MapPin
} from 'lucide-react';
import { useCart } from '../providers/CartProvider';
import { useWishlist } from '../providers/WishlistProvider';
import { useSettings } from '../providers/SettingsProvider';
import { useRealtime } from '../providers/RealtimeProvider';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { Product, Category } from '@/types/database.types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { settings } = useSettings();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlist } = useWishlist();
  const { lastUpdated } = useRealtime();

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Load categories from Supabase / localStorage on mount & realtime updates
  useEffect(() => {
    async function loadNavCategories() {
      let localSaved: Category[] = [];
      try {
        const stored = localStorage.getItem('custom_categories');
        if (stored) localSaved = JSON.parse(stored);
      } catch (e) {}

      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase
            .from('categories')
            .select('*')
            .eq('status', true)
            .order('sort_order', { ascending: true });
          if (data && data.length > 0) {
            setCategories(data);
            return;
          }
        } catch (err) {
          console.error('Error fetching nav categories:', err);
        }
      }

      if (localSaved.length > 0) {
        const active = localSaved.filter((c) => c.status !== false);
        setCategories(active);
      } else {
        setCategories(INITIAL_CATEGORIES);
      }
    }
    loadNavCategories();
  }, [lastUpdated]);

  // Scroll event for sticky glass navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const filtered = INITIAL_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.short_description?.toLowerCase().includes(query) ||
        p.origin?.toLowerCase().includes(query)
    ).slice(0, 6);

    setSearchResults(filtered);
  }, [searchQuery]);

  // Click outside search results & category menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearching(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(false);
      router.push(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="w-full z-40 relative">
      {/* 1. TOP ANNOUNCEMENT BAR (LUXURY GOLD & EMERALD) */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 text-white text-xs py-2 px-3 sm:px-4 border-b border-forest-800/60">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] sm:text-xs">
          
          {/* Left Feature Pill */}
          <div className="flex items-center gap-2 text-emerald-300 font-medium truncate max-w-[62%] sm:max-w-none">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="truncate">
              Gieo hạt hôm nay – Nở hoa ngày mai <strong className="text-amber-300 hidden sm:inline">(Cam kết mầm &gt; 85% • Chuẩn F1)</strong>
            </span>
          </div>

          {/* Right Quick Contacts & Links */}
          <div className="flex items-center gap-4 text-emerald-100 shrink-0 text-[11px]">
            <a 
              href={`tel:${settings.hotline.replace(/\s/g, '')}`} 
              className="flex items-center gap-1.5 text-white hover:text-amber-300 transition font-extrabold group"
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 text-forest-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span><span className="hidden sm:inline">Hotline 24/7: </span>{settings.hotline}</span>
            </a>
            <span className="hidden sm:inline text-forest-700">|</span>
            <Link href="/tra-cuu-don-hang" className="hover:text-amber-300 transition hidden sm:flex items-center gap-1 font-semibold">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tra cứu đơn hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (NAVBAR WITH MODERN BLUR) */}
      <div className={`transition-all duration-300 ${isScrolled ? 'sticky top-0 shadow-lg glass-nav' : 'bg-white border-b border-emerald-950/5'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
            
            {/* Left: Mobile Menu Button & Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-forest-900 hover:text-forest-700 rounded-2xl hover:bg-forest-50 focus:outline-none transition active:scale-95"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative overflow-hidden rounded-2xl p-1 bg-gradient-to-tr from-emerald-100 to-amber-50 border border-emerald-200/60 shadow-2xs group-hover:shadow-md transition-shadow">
                  <img
                    src="/logo.png"
                    alt="Logo Hạt Giống Nhà Vườn"
                    className="h-10 sm:h-12 w-auto max-w-[110px] sm:max-w-[150px] object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base sm:text-2xl tracking-tight text-forest-950 font-serif leading-none">
                      HẠT GIỐNG <span className="text-forest-600 font-sans font-bold">NHÀ VƯỜN</span>
                    </span>
                    <span className="hidden sm:inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-forest-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                      F1 PRO
                    </span>
                  </div>
                  <span className="text-[8px] sm:text-[10px] text-forest-700 tracking-wider uppercase font-bold mt-0.5 hidden xs:block sm:block">
                    Ươm mầm hôm nay – Rực rỡ ngày mai 🌱
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Desktop Search Bar (Smart Live Suggestion) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-2 relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="w-full relative group">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Tìm hạt giống hoa, dạ yến thảo, rau củ, chậu, đất trồng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setIsSearching(true)}
                    className="w-full pl-11 pr-28 py-3 rounded-2xl border border-emerald-900/15 bg-forest-50/50 group-hover:bg-forest-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-xs sm:text-sm transition-all shadow-inner font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <Search className="w-4 h-4 text-forest-700 absolute left-4 pointer-events-none" />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-900 hover:to-forest-950 text-white text-xs font-extrabold rounded-xl transition shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Tìm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Live Search Suggestion Box */}
              {isSearching && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-emerald-900/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3.5 bg-gradient-to-r from-forest-50 to-emerald-50 text-xs font-extrabold text-forest-900 border-b border-emerald-900/10 flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Gợi ý hạt giống hàng đầu ({searchResults.length})
                    </span>
                    <span className="text-slate-500 font-normal text-[11px]">Nhấn Enter để xem tất cả</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/san-pham/${item.slug}`}
                        onClick={() => setIsSearching(false)}
                        className="flex items-center gap-3.5 p-3 hover:bg-forest-50/70 transition group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 group-hover:scale-105 transition-transform">
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-forest-700 truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-extrabold text-forest-800">
                              {formatPrice(item.sale_price || item.price)}
                            </span>
                            {item.sale_price && (
                              <span className="text-[10px] text-slate-400 line-through">
                                {formatPrice(item.price)}
                              </span>
                            )}
                            {item.germination_rate && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                Mầm {item.germination_rate}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-forest-600 font-bold group-hover:translate-x-1 transition">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs font-extrabold text-forest-800 hover:text-forest-950 transition"
                    >
                      Xem toàn bộ kết quả cho "{searchQuery}" →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Action Buttons (Wishlist, Cart, Account) */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Wishlist Button */}
              <Link
                href="/yeu-thich"
                className="p-2.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition relative group"
                title="Sản phẩm yêu thích"
              >
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalWishlist > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-md animate-pulse">
                    {totalWishlist}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-900 hover:to-forest-950 text-white rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 group"
                aria-label="Giỏ hàng"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform text-amber-300" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-forest-950 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-md animate-bounce">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-emerald-200 leading-none">Giỏ hàng</span>
                  <span className="text-xs font-extrabold text-white mt-0.5">
                    {totalItems > 0 ? `${totalItems} món` : 'Trống'}
                  </span>
                </div>
              </button>

              {/* User Account */}
              <Link
                href="/tai-khoan"
                className="hidden sm:flex items-center justify-center w-10 h-10 text-forest-800 bg-forest-100/70 hover:bg-forest-200/80 rounded-2xl transition border border-forest-200/60 shadow-2xs"
                title="Tài khoản cá nhân"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar Row */}
          <div className="md:hidden pb-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Tìm hạt giống hoa, rau củ quả F1..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2.5 text-xs border border-emerald-900/10 rounded-2xl bg-forest-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-inner font-medium"
              />
              <Search className="w-4 h-4 text-forest-700 absolute left-3.5 top-3" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-forest-800 text-white text-[11px] font-extrabold rounded-xl"
              >
                Tìm
              </button>
            </form>
          </div>
        </div>

        {/* 3. DESKTOP MEGA MENU NAVIGATION BAR */}
        <nav className="hidden lg:block border-t border-slate-100 bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12 text-xs sm:text-sm font-bold text-slate-800">
              
              {/* Left: Mega Category Dropdown Menu */}
              <div className="relative" ref={categoryMenuRef}>
                <button
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  onMouseEnter={() => setIsCategoryMenuOpen(true)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 shadow-2xs ${
                    isCategoryMenuOpen 
                      ? 'bg-gradient-to-r from-forest-900 to-forest-950 text-white shadow-md' 
                      : 'bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-900 hover:to-forest-950 text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-amber-300" />
                  <span>DANH MỤC HẠT GIỐNG</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCategoryMenuOpen ? 'rotate-180 text-amber-300' : 'text-emerald-200'}`} />
                </button>

                {/* Mega Dropdown Panel (Multi-Column Layout) */}
                {isCategoryMenuOpen && (
                  <div 
                    onMouseLeave={() => setIsCategoryMenuOpen(false)}
                    className="absolute left-0 top-full mt-2 w-[680px] bg-white rounded-3xl shadow-2xl border border-emerald-950/10 p-5 z-50 animate-in fade-in slide-in-from-top-3 grid grid-cols-12 gap-5"
                  >
                    {/* Left Column: Categories List */}
                    <div className="col-span-7 space-y-1 pr-2 border-r border-slate-100 max-h-[380px] overflow-y-auto">
                      <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-forest-800 bg-forest-50 rounded-xl mb-2 flex items-center justify-between">
                        <span>Chủng loại ({categories.length})</span>
                        <span className="text-[10px] text-emerald-700 font-extrabold">Chuẩn F1 100%</span>
                      </div>

                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/danh-muc/${cat.slug}`}
                          onClick={() => setIsCategoryMenuOpen(false)}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-forest-50/90 group transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-emerald-100 text-slate-700 group-hover:text-forest-900 flex items-center justify-center text-base transition shrink-0 border border-slate-100">
                              {cat.icon || '🌱'}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-forest-800 truncate">
                                {cat.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 group-hover:text-slate-500 truncate">
                                {cat.description || `Hạt giống ${cat.name} năng suất cao`}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-forest-700 group-hover:translate-x-1 transition" />
                        </Link>
                      ))}
                    </div>

                    {/* Right Column: Featured Banner & Fast Links */}
                    <div className="col-span-5 flex flex-col justify-between">
                      <div className="rounded-2xl bg-gradient-to-br from-forest-900 via-forest-950 to-emerald-950 text-white p-4 relative overflow-hidden shadow-md">
                        <div className="relative z-10">
                          <span className="text-[10px] font-black uppercase text-amber-300 bg-forest-900/80 px-2.5 py-0.5 rounded-full border border-amber-400/30 inline-block mb-1.5">
                            🔥 Hot Nhất Mùa Này
                          </span>
                          <h4 className="text-sm font-extrabold font-serif leading-tight">
                            Hạt Giống Hoa Hướng Dương Lùn F1
                          </h4>
                          <p className="text-[10px] text-emerald-200 mt-1">
                            Bông to, nở sau 50 ngày, dễ trồng ban công.
                          </p>
                          <Link
                            href="/san-pham/hat-giong-hoa-huong-duong-lun-f1"
                            onClick={() => setIsCategoryMenuOpen(false)}
                            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-forest-600 hover:from-emerald-600 hover:to-forest-700 text-white rounded-xl shadow transition"
                          >
                            <span>Xem ngay</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-1">
                        <Link
                          href="/san-pham"
                          onClick={() => setIsCategoryMenuOpen(false)}
                          className="flex items-center justify-between p-2 rounded-xl text-xs font-extrabold text-forest-800 hover:bg-forest-50 transition"
                        >
                          <span>🌱 Xem tất cả hạt giống</span>
                          <span>→</span>
                        </Link>
                        <Link
                          href="/blog"
                          onClick={() => setIsCategoryMenuOpen(false)}
                          className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-600 hover:text-forest-800 hover:bg-forest-50 transition"
                        >
                          <span>📖 Cẩm nang gieo trồng</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Horizontal Quick Links */}
              <ul className="flex items-center gap-1.5 font-bold text-slate-700">
                <li>
                  <Link
                    href="/"
                    className={`px-3.5 py-2 rounded-xl transition text-xs font-extrabold flex items-center gap-1.5 ${
                      pathname === '/' 
                        ? 'bg-forest-100/70 text-forest-900 font-black' 
                        : 'hover:text-forest-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>Trang chủ</span>
                  </Link>
                </li>

                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/danh-muc/${cat.slug}`}
                      className={`px-3 py-2 rounded-xl transition text-xs font-bold flex items-center gap-1.5 ${
                        pathname === `/danh-muc/${cat.slug}`
                          ? 'bg-forest-100/70 text-forest-900 font-black'
                          : 'hover:text-forest-800 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-sm">{cat.icon || '🌱'}</span>
                      <span>{cat.name}</span>
                    </Link>
                  </li>
                ))}

                <li>
                  <Link
                    href="/san-pham?sale=true"
                    className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-black transition text-xs flex items-center gap-1.5 shadow-2xs"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                    <span>Khuyến mãi</span>
                    <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase">
                      HOT
                    </span>
                  </Link>
                </li>

                <li>
                  <Link
                    href="/blog"
                    className={`px-3 py-2 rounded-xl transition text-xs font-bold flex items-center gap-1 ${
                      pathname === '/blog'
                        ? 'bg-forest-100/70 text-forest-900 font-black'
                        : 'hover:text-forest-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>Cẩm nang</span>
                  </Link>
                </li>

                <li>
                  <Link
                    href="/lien-he"
                    className={`px-3 py-2 rounded-xl transition text-xs font-bold flex items-center gap-1 ${
                      pathname === '/lien-he'
                        ? 'bg-forest-100/70 text-forest-900 font-black'
                        : 'hover:text-forest-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>Liên hệ</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>

      {/* 4. MOBILE DRAWER SLIDEOUT MENU (APP-LIKE EXPERIENCE) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-forest-950/60 backdrop-blur-sm animate-in fade-in duration-200 flex">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
            
            {/* Drawer Header */}
            <div>
              <div className="p-4 bg-gradient-to-r from-forest-900 to-forest-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="Logo" className="h-9 w-auto bg-white rounded-xl p-0.5" />
                  <div>
                    <div className="font-serif font-extrabold text-sm">HẠT GIỐNG NHÀ VƯỜN</div>
                    <div className="text-[9px] text-emerald-300">Chuẩn F1 • Tỷ lệ nảy mầm &gt; 85%</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-white hover:bg-white/10 rounded-xl"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-4">
                
                {/* Main Links */}
                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl font-bold text-xs text-slate-800 hover:bg-forest-50"
                  >
                    <span>🏡 Trang chủ</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                  <Link
                    href="/san-pham"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl font-bold text-xs text-slate-800 hover:bg-forest-50"
                  >
                    <span>🌱 Tất cả sản phẩm hạt giống</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                  <Link
                    href="/san-pham?sale=true"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl font-black text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-500" />
                      Ưu đãi Flash Sale Giảm Giá
                    </span>
                    <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">HOT</span>
                  </Link>
                </div>

                {/* Categories Accordion/List */}
                <div>
                  <div className="text-[11px] font-black uppercase text-slate-400 px-2 mb-2">
                    Danh mục nổi bật
                  </div>
                  <div className="space-y-1 pl-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/danh-muc/${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-forest-50"
                      >
                        <div className="flex items-center gap-2">
                          <span>{cat.icon || '🌱'}</span>
                          <span>{cat.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Information Links */}
                <div>
                  <div className="text-[11px] font-black uppercase text-slate-400 px-2 mb-2">
                    Hỗ trợ & Hướng dẫn
                  </div>
                  <div className="space-y-1 pl-1 text-xs font-semibold text-slate-700">
                    <Link
                      href="/tra-cuu-don-hang"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-forest-50"
                    >
                      <Truck className="w-4 h-4 text-forest-700" />
                      <span>Tra cứu trạng thái đơn hàng</span>
                    </Link>
                    <Link
                      href="/blog"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-forest-50"
                    >
                      <Sprout className="w-4 h-4 text-forest-700" />
                      <span>Cẩm nang kỹ thuật ươm mầm</span>
                    </Link>
                    <Link
                      href="/lien-he"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-forest-50"
                    >
                      <Phone className="w-4 h-4 text-forest-700" />
                      <span>Liên hệ & Địa chỉ vườn ươm</span>
                    </Link>
                  </div>
                </div>

              </div>
            </div>

            {/* Mobile Footer Contact */}
            <div className="p-4 bg-gradient-to-b from-slate-50 to-emerald-50/50 border-t border-slate-200/80 text-xs text-slate-600 space-y-2">
              <div className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider">Hỗ Trợ Khách Hàng 24/7</div>
              
              <a 
                href={`tel:${settings.hotline.replace(/\s/g, '')}`} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-forest-800 text-white font-extrabold shadow"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Hotline: {settings.hotline}</span>
                </div>
                <span className="text-[10px] bg-forest-900 px-2 py-0.5 rounded-md text-amber-300 font-black">GỌI NGAY</span>
              </a>

              <div className="text-[11px] text-slate-500 pt-1 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
