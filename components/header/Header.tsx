'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, ShoppingBag, Heart, Phone, Menu, X,
  ChevronDown, Sparkles, User, ArrowRight, Truck, ChevronRight,
  LayoutGrid, Flame, Sprout, MapPin, BookOpen, Gift,
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

  if (pathname?.startsWith('/admin')) return null;

  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlist } = useWishlist();
  const { lastUpdated } = useRealtime();

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadCategories() {
      let local: Category[] = [];
      try {
        const s = localStorage.getItem('custom_categories');
        if (s) local = JSON.parse(s);
      } catch (_) {}
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase.from('categories').select('*').eq('status', true).order('sort_order', { ascending: true });
          if (data && data.length > 0) { setCategories(data); return; }
        } catch (_) {}
      }
      setCategories(local.length > 0 ? local.filter((c) => c.status !== false) : INITIAL_CATEGORIES);
    }
    loadCategories();
  }, [lastUpdated]);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(
      INITIAL_PRODUCTS.filter(
        (p) => p.name.toLowerCase().includes(q) || p.short_description?.toLowerCase().includes(q) || p.origin?.toLowerCase().includes(q)
      ).slice(0, 6)
    );
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setIsSearchFocused(false);
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) setIsCategoryMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsCategoryMenuOpen(false); setIsSearchFocused(false); setIsMobileMenuOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) { setIsSearchFocused(false); router.push(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`); }
  };

  const openMenu = () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); setIsCategoryMenuOpen(true); };
  const closeMenuDelayed = () => { hoverTimer.current = setTimeout(() => setIsCategoryMenuOpen(false), 180); };

  const showDrop = isSearchFocused && searchResults.length > 0;

  const navLinks = [
    { href: '/', label: 'Trang chủ', icon: null },
    { href: '/danh-muc/hat-giong-hoa', label: 'Hạt Giống Hoa', icon: '🌸' },
    { href: '/danh-muc/hat-giong-rau-cu', label: 'Rau Củ Quả', icon: '🥦' },
    { href: '/danh-muc/hat-giong-cay-canh', label: 'Cây Cảnh', icon: '🌿' },
    { href: '/danh-muc/hat-giong-cay-an-qua', label: 'Cây Ăn Quả', icon: '🍅' },
    { href: '/blog', label: 'Cẩm Nang', icon: null },
    { href: '/lien-he', label: 'Liên Hệ', icon: null },
  ];

  return (
    <>
      <header
        className={`w-full z-40 bg-white transition-shadow duration-300 ${
          isScrolled ? 'sticky top-0 shadow-[0_2px_20px_rgba(6,59,32,0.1)]' : 'relative'
        }`}
      >

        {/* ══════════════════════════════════════════════════════════
            HÀNG 1 — LOGO · SEARCH · WISHLIST · CART · ACCOUNT
            Height: 72px desktop / 60px mobile
        ══════════════════════════════════════════════════════════ */}
        <div className="border-b border-[#EBF2EC]">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-[68px] sm:h-[76px] gap-4 lg:gap-6">

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden flex-shrink-0 p-2 rounded-xl text-slate-600 hover:bg-[#F2FAF5] hover:text-[#08763B] transition-colors"
                aria-label="Mở menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* ── Brand Logo ── */}
              <Link
                href="/"
                className="flex items-center gap-3 flex-shrink-0 group"
                aria-label="Trang chủ Hạt Giống Nhà Vườn"
              >
                <div className="relative w-11 h-11 sm:w-[52px] sm:h-[52px] rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-tr from-emerald-50 to-amber-50 border border-[#D6EDDB] shadow-sm">
                  <img
                    src="/logo.png"
                    alt="Hạt Giống Nhà Vườn"
                    className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="hidden sm:flex flex-col leading-none gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] sm:text-[17px] font-extrabold tracking-tight text-[#063B20] font-serif whitespace-nowrap">
                      HẠT GIỐNG <span className="text-[#16A765]">NHÀ VƯỜN</span>
                    </span>
                    <span className="hidden md:inline-flex items-center bg-gradient-to-r from-amber-400 to-amber-500 text-[#063B20] text-[8px] font-black uppercase px-2 py-0.5 rounded-full leading-none tracking-wide shadow-sm">
                      F1 PRO
                    </span>
                  </div>
                  <span className="text-[10px] text-[#718078] font-medium tracking-wide">
                    ƯƠM MẦM HÔM NAY – RỰC RỠ NGÀY MAI 🌱
                  </span>
                </div>
              </Link>

              {/* ── Search Bar ── */}
              <div className="flex-1 max-w-[640px] relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} role="search">
                  <div
                    className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
                      isSearchFocused
                        ? 'border-[#16A765] bg-white shadow-[0_0_0_4px_rgba(22,167,101,0.1)]'
                        : 'border-[#D6EDDB] bg-[#F6FAF7] hover:border-[#A8CDB0] hover:bg-white'
                    }`}
                  >
                    <Search className="w-4 h-4 text-[#A0AFA5] absolute left-4 pointer-events-none flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Tìm hạt giống hoa, dạ yến thảo, rau củ, chậu, đất trồng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      className="w-full bg-transparent pl-11 pr-[90px] py-2.5 text-[13.5px] font-medium text-[#17231C] placeholder:text-[#B0BEB5] focus:outline-none rounded-2xl"
                      aria-label="Tìm kiếm sản phẩm"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 h-[34px] px-5 bg-[#07552D] hover:bg-[#08763B] active:bg-[#063B20] text-white text-[13px] font-bold rounded-xl transition-colors shadow-sm"
                      aria-label="Tìm kiếm"
                    >
                      Tìm <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* Live search dropdown */}
                {showDrop && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white rounded-2xl border border-[#E3ECE6] shadow-[0_12px_40px_rgba(6,59,32,0.13)] overflow-hidden z-50">
                    <div className="px-4 py-2.5 bg-[#F6FAF7] border-b border-[#EBF2EC] flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#374C3E] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#F5B82E]" />
                        {searchResults.length} gợi ý cho &ldquo;{searchQuery}&rdquo;
                      </span>
                      <span className="text-[11px] text-[#A0AFA5]">↵ xem tất cả</span>
                    </div>
                    <div className="divide-y divide-[#F3F7F3] max-h-[280px] overflow-y-auto">
                      {searchResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/san-pham/${item.slug}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#F6FAF7] transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-[#E3ECE6] bg-[#F6FAF7]">
                            <img
                              src={item.images?.[0] || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&q=80'}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#17231C] group-hover:text-[#08763B] truncate transition-colors">
                              {item.name}
                            </p>
                            <p className="text-[12px] font-bold text-[#08763B] mt-0.5">
                              {formatPrice(item.sale_price || item.price)}
                              {item.sale_price && (
                                <span className="text-[#B0BEB5] font-normal line-through ml-2 text-[11px]">
                                  {formatPrice(item.price)}
                                </span>
                              )}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#C0CFC4] group-hover:text-[#08763B] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={() => handleSearchSubmit()}
                      className="w-full px-4 py-2.5 bg-[#F6FAF7] border-t border-[#EBF2EC] text-[12px] font-semibold text-[#08763B] hover:text-[#063B20] hover:bg-[#EDF5EE] transition-colors text-center"
                    >
                      Xem toàn bộ kết quả →
                    </button>
                  </div>
                )}
              </div>

              {/* ── Right: Wishlist + Cart + Account ── */}
              <div className="flex items-center gap-2 flex-shrink-0">

                {/* Wishlist */}
                <Link
                  href="/yeu-thich"
                  aria-label={`Yêu thích${totalWishlist > 0 ? ` (${totalWishlist})` : ''}`}
                  className="relative p-2.5 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-colors group"
                >
                  <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {totalWishlist > 0 && (
                    <span className="absolute top-1 right-1 min-w-[17px] h-[17px] bg-rose-500 text-white text-[9.5px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                      {totalWishlist}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  aria-label="Giỏ hàng"
                  className="relative flex items-center gap-2.5 pl-3 pr-4 h-[44px] bg-[#07552D] hover:bg-[#08763B] active:bg-[#063B20] text-white rounded-xl transition-colors shadow-md hover:shadow-lg group"
                >
                  <div className="relative flex-shrink-0">
                    <ShoppingBag className="w-[19px] h-[19px] text-[#F5B82E]" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[#F5B82E] text-[#063B20] text-[9.5px] font-extrabold rounded-full flex items-center justify-center px-0.5 shadow-sm leading-none">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col text-left leading-none">
                    <span className="text-[9.5px] font-semibold text-emerald-300 uppercase tracking-[0.1em]">GIỎ HÀNG</span>
                    <span className="text-[13px] font-bold text-white mt-0.5">
                      {totalItems > 0 ? `${totalItems} món` : 'Trống'}
                    </span>
                  </div>
                </button>

                {/* Account */}
                <Link
                  href="/tai-khoan"
                  aria-label="Tài khoản"
                  className="hidden sm:flex flex-col items-center justify-center w-10 h-10 rounded-xl border border-[#D6EDDB] text-slate-500 hover:text-[#08763B] hover:bg-[#F2FAF5] hover:border-[#A8CDB0] transition-colors"
                >
                  <User className="w-[17px] h-[17px]" />
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            HÀNG 2 — NAVIGATION BAR
            Height: 48px | Sticky underneath Hàng 1
        ══════════════════════════════════════════════════════════ */}
        <nav
          className="hidden lg:block bg-white border-b border-[#EBF2EC]"
          aria-label="Điều hướng chính"
        >
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-[50px] gap-1">

              {/* ── Mega Category Button ── */}
              <div
                ref={categoryMenuRef}
                className="relative flex-shrink-0"
                onMouseEnter={openMenu}
                onMouseLeave={closeMenuDelayed}
              >
                <button
                  onClick={() => setIsCategoryMenuOpen((v) => !v)}
                  aria-expanded={isCategoryMenuOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 h-[36px] px-4 rounded-xl text-[13.5px] font-bold transition-all duration-150 ${
                    isCategoryMenuOpen
                      ? 'bg-[#063B20] text-white shadow-lg'
                      : 'bg-[#07552D] hover:bg-[#08763B] text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-[#F5B82E] flex-shrink-0" />
                  <span className="whitespace-nowrap">Danh mục hạt giống</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-emerald-300 flex-shrink-0 transition-transform duration-200 ${
                      isCategoryMenuOpen ? 'rotate-180 text-[#F5B82E]' : ''
                    }`}
                  />
                </button>

                {/* ── MEGA MENU ── */}
                {isCategoryMenuOpen && (
                  <div
                    className="absolute left-0 top-[calc(100%+4px)] z-50"
                    onMouseEnter={openMenu}
                    onMouseLeave={closeMenuDelayed}
                    role="menu"
                    aria-label="Danh sách danh mục"
                  >
                    {/* Gap bridge */}
                    <div className="absolute -top-1.5 left-0 right-0 h-2" />
                    <div
                      className="w-[820px] bg-white rounded-2xl border border-[#E3ECE6] shadow-[0_20px_60px_rgba(6,59,32,0.14),0_0_0_1px_rgba(6,59,32,0.04)] overflow-hidden"
                      style={{ animation: 'megaIn 180ms cubic-bezier(0.16,1,0.3,1) both' }}
                    >
                      <div className="grid grid-cols-[1fr_280px]">

                        {/* Left: 2-column category grid */}
                        <div className="p-5">
                          <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#A0AFA5] mb-3 px-1">
                            Danh mục sản phẩm
                          </p>
                          <div className="grid grid-cols-2 gap-0.5 max-h-[340px] overflow-y-auto pr-1">
                            {categories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/danh-muc/${cat.slug}`}
                                onClick={() => setIsCategoryMenuOpen(false)}
                                role="menuitem"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F2FAF5] group transition-colors"
                              >
                                <span className="w-9 h-9 rounded-xl bg-[#EEF7F1] group-hover:bg-[#D6EDDB] text-[18px] flex items-center justify-center flex-shrink-0 transition-colors">
                                  {cat.icon || '🌱'}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-[13px] font-semibold text-[#17231C] group-hover:text-[#08763B] leading-snug transition-colors truncate">
                                    {cat.name}
                                  </p>
                                  <p className="text-[11px] text-[#A0AFA5] truncate mt-0.5">
                                    {cat.description || 'Hạt giống F1 chất lượng cao'}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>

                          {/* Quick links footer */}
                          <div className="flex items-center gap-5 mt-4 pt-3.5 border-t border-[#EBF2EC] px-1">
                            <Link
                              href="/san-pham"
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#08763B] hover:text-[#063B20] transition-colors"
                            >
                              <Sprout className="w-3.5 h-3.5" />
                              Xem tất cả sản phẩm
                            </Link>
                            <span className="text-[#D4EAD9]">|</span>
                            <Link
                              href="/san-pham?sale=true"
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className="flex items-center gap-1.5 text-[12px] font-semibold text-rose-500 hover:text-rose-700 transition-colors"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              Sản phẩm khuyến mãi
                            </Link>
                            <span className="text-[#D4EAD9]">|</span>
                            <Link
                              href="/blog"
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#08763B] hover:text-[#063B20] transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Cẩm nang gieo trồng
                            </Link>
                          </div>
                        </div>

                        {/* Right: Featured highlight card */}
                        <div className="relative flex flex-col justify-between p-5 bg-gradient-to-b from-[#053318] via-[#063B20] to-[#07552D] overflow-hidden">
                          {/* Decorative circle */}
                          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-emerald-500/10 pointer-events-none" />

                          <div className="relative z-10">
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#F5B82E] border border-[#F5B82E]/40 bg-[#F5B82E]/10 rounded-full px-3 py-1 mb-3">
                              🌻 HOT NHẤT MÙA NÀY
                            </span>
                            <h3 className="text-[16px] font-extrabold text-white font-serif leading-snug">
                              Hạt Giống Hoa Hướng Dương Lùn F1
                            </h3>
                            <p className="text-[12px] text-emerald-200/90 mt-2 leading-relaxed">
                              Bông to rực rỡ, nở sau 50 ngày. Rất dễ trồng tại ban công hoặc sân vườn nhỏ.
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-[13px] font-extrabold text-[#F5B82E]">Tỷ lệ nảy mầm &gt; 90%</span>
                            </div>
                          </div>
                          <div className="relative z-10 mt-5 space-y-2">
                            <Link
                              href="/san-pham/hat-giong-hoa-huong-duong-lun-f1"
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#F5B82E] hover:bg-[#F0A91A] active:bg-[#D9930E] text-[#063B20] text-[13px] font-bold transition-colors shadow-sm"
                            >
                              Xem ngay <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href="/san-pham?sale=true"
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[12px] font-semibold text-emerald-200 hover:text-white hover:bg-white/10 transition-colors border border-white/15"
                            >
                              <Flame className="w-3.5 h-3.5 text-orange-400" />
                              Xem khuyến mãi hôm nay
                            </Link>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Separator ── */}
              <div className="w-px h-5 bg-[#D6EDDB] mx-2 flex-shrink-0" />

              {/* ── Main Nav Links ── */}
              <ul className="flex items-center flex-1 gap-0.5" role="list">
                {navLinks.map(({ href, label, icon }) => {
                  const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`relative flex items-center gap-1.5 px-3 h-[38px] text-[13.5px] font-semibold rounded-xl transition-colors whitespace-nowrap ${
                          active
                            ? 'text-[#08763B] bg-[#EDF5EE]'
                            : 'text-[#374C3E] hover:text-[#08763B] hover:bg-[#F2FAF5]'
                        }`}
                      >
                        {icon && <span className="text-[13px]">{icon}</span>}
                        {label}
                        {active && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-[#16A765] rounded-full" />
                        )}
                      </Link>
                    </li>
                  );
                })}

                {/* Promotion — special */}
                <li>
                  <Link
                    href="/san-pham?sale=true"
                    className="flex items-center gap-1.5 px-3 h-[38px] text-[13.5px] font-bold text-[#F0445E] hover:bg-rose-50 rounded-xl transition-colors whitespace-nowrap"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Khuyến mãi
                    <span className="inline-flex items-center h-[16px] px-1.5 bg-[#F0445E] text-white text-[9px] font-black uppercase rounded-full leading-none tracking-wide">
                      HOT
                    </span>
                  </Link>
                </li>
              </ul>

              {/* ── Right: Hotline ── */}
              <div className="hidden xl:flex items-center gap-2 flex-shrink-0 ml-auto pl-4 border-l border-[#D6EDDB]">
                <div className="w-7 h-7 rounded-lg bg-[#F2FAF5] border border-[#D6EDDB] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#08763B]" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[9.5px] text-[#A0AFA5] font-medium uppercase tracking-wide">Hotline 24/7</span>
                  <a
                    href={`tel:${settings.hotline.replace(/\s/g, '')}`}
                    className="text-[13.5px] font-extrabold text-[#063B20] hover:text-[#08763B] transition-colors whitespace-nowrap"
                  >
                    {settings.hotline}
                  </a>
                </div>
              </div>

            </div>
          </div>
        </nav>

        {/* Mobile search row */}
        <div className="lg:hidden px-4 py-2.5 bg-[#F6FAF7] border-t border-[#EBF2EC]">
          <form onSubmit={handleSearchSubmit} className="relative" role="search">
            <Search className="w-3.5 h-3.5 text-[#A0AFA5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm hạt giống hoa, rau củ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-16 py-2 text-[13px] rounded-xl border border-[#D6EDDB] bg-white focus:outline-none focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)] transition-all"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-[30px] px-3 bg-[#07552D] text-white text-[12px] font-semibold rounded-lg"
            >
              Tìm
            </button>
          </form>
        </div>

      </header>

      {/* ══════════════════════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════════════════════ */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-[min(84vw,340px)] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu điều hướng"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-[#063B20] to-[#07552D] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <p className="text-[13.5px] font-extrabold text-white font-serif tracking-tight">HẠT GIỐNG NHÀ VƯỜN</p>
              <p className="text-[10px] text-emerald-300 mt-0.5">ƯƠM MẦM HÔM NAY – RỰC RỠ NGÀY MAI 🌱</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-xl text-white hover:bg-white/10 transition-colors"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Top links */}
          <div className="p-3 space-y-0.5">
            {[
              { href: '/', label: 'Trang chủ' },
              { href: '/san-pham', label: 'Tất cả sản phẩm' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ${
                  pathname === href ? 'bg-[#F2FAF5] text-[#08763B]' : 'text-[#17231C] hover:bg-[#F2FAF5]'
                }`}
              >
                <span>{label}</span>
                <ChevronRight className="w-4 h-4 text-[#C0CFC4]" />
              </Link>
            ))}
            <Link
              href="/san-pham?sale=true"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-bold text-[#F0445E] hover:bg-rose-50 transition-colors"
            >
              <span className="flex items-center gap-2"><Flame className="w-4 h-4" />Khuyến mãi HOT</span>
              <span className="text-[10px] bg-[#F0445E] text-white px-2 py-0.5 rounded-full font-bold">HOT</span>
            </Link>
          </div>

          {/* Category group */}
          <div className="border-t border-[#EBF2EC] px-3 py-3">
            <p className="px-3 mb-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#A0AFA5]">Danh mục hạt giống</p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-[#374C3E] hover:bg-[#F2FAF5] hover:text-[#08763B] transition-colors group"
              >
                <span className="text-[16px]">{cat.icon || '🌱'}</span>
                <span className="flex-1 truncate">{cat.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#C0CFC4] group-hover:text-[#16A765] transition-colors" />
              </Link>
            ))}
          </div>

          {/* Support group */}
          <div className="border-t border-[#EBF2EC] px-3 py-3">
            <p className="px-3 mb-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#A0AFA5]">Hỗ trợ &amp; Thông tin</p>
            <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-[#374C3E] hover:bg-[#F2FAF5] transition-colors">
              <Sprout className="w-4 h-4 text-[#16A765]" /><span>Cẩm nang gieo trồng</span>
            </Link>
            <Link href="/tra-cuu-don-hang" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-[#374C3E] hover:bg-[#F2FAF5] transition-colors">
              <Truck className="w-4 h-4 text-[#16A765]" /><span>Tra cứu đơn hàng</span>
            </Link>
            <Link href="/lien-he" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-[#374C3E] hover:bg-[#F2FAF5] transition-colors">
              <Phone className="w-4 h-4 text-[#16A765]" /><span>Liên hệ nhà vườn</span>
            </Link>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex-shrink-0 p-4 bg-[#F6FAF7] border-t border-[#E3ECE6] space-y-2">
          <a
            href={`tel:${settings.hotline.replace(/\s/g, '')}`}
            className="flex items-center justify-between w-full px-4 py-3 bg-[#07552D] hover:bg-[#08763B] text-white rounded-xl transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#F5B82E]" />
              <span className="text-[13.5px] font-bold">Hotline: {settings.hotline}</span>
            </div>
            <span className="text-[10px] font-bold bg-[#063B20] text-[#F5B82E] px-2.5 py-1 rounded-lg">GỌI NGAY</span>
          </a>
          {settings.address && (
            <div className="flex items-start gap-2 px-1 pt-0.5 text-[12px] text-[#718078]">
              <MapPin className="w-3.5 h-3.5 text-[#16A765] flex-shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        @keyframes megaIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
