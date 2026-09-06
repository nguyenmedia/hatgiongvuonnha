'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, ShoppingBag, Heart, Phone, Menu, X,
  ChevronDown, Sparkles, User, ArrowRight, Truck, ChevronRight,
  LayoutGrid, Flame, Sprout, MapPin,
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

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      let localSaved: Category[] = [];
      try {
        const stored = localStorage.getItem('custom_categories');
        if (stored) localSaved = JSON.parse(stored);
      } catch (_) {}

      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase
            .from('categories')
            .select('*')
            .eq('status', true)
            .order('sort_order', { ascending: true });
          if (data && data.length > 0) { setCategories(data); return; }
        } catch (_) {}
      }

      if (localSaved.length > 0) {
        setCategories(localSaved.filter((c) => c.status !== false));
      } else {
        setCategories(INITIAL_CATEGORIES);
      }
    }
    loadCategories();
  }, [lastUpdated]);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Live search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const hits = INITIAL_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.origin?.toLowerCase().includes(q)
    ).slice(0, 6);
    setSearchResults(hits);
  }, [searchQuery]);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCategoryMenuOpen(false);
        setIsSearchFocused(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const openMegaMenu = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsCategoryMenuOpen(true);
  };

  const closeMegaMenuDelayed = () => {
    hoverTimer.current = setTimeout(() => setIsCategoryMenuOpen(false), 200);
  };

  const showSearchDrop = isSearchFocused && searchResults.length > 0;

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/danh-muc/hat-giong-hoa', label: 'Hạt Giống Hoa' },
    { href: '/danh-muc/hat-giong-rau-cu', label: 'Rau Củ Quả' },
    { href: '/danh-muc/hat-giong-cay-canh', label: 'Cây Cảnh' },
    { href: '/danh-muc/hat-giong-cay-an-qua', label: 'Cây Ăn Quả' },
    { href: '/blog', label: 'Cẩm Nang' },
    { href: '/lien-he', label: 'Liên Hệ' },
  ];

  return (
    <>
      {/* ════════════════════════════════════════════════════════════
          SINGLE-ROW HEADER
          Layout: Logo | [Danh mục] | NavLinks | Search | Actions
      ════════════════════════════════════════════════════════════ */}
      <header
        className={`w-full z-40 bg-white border-b border-[#E3ECE6] transition-shadow duration-300 ${
          isScrolled ? 'sticky top-0 shadow-[0_2px_16px_rgba(6,59,32,0.09)]' : 'relative'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 xl:px-6">
          <div className="flex items-center h-[64px] gap-3">

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden flex-shrink-0 p-2 rounded-xl text-slate-600 hover:bg-[#F2FAF5] hover:text-[#08763B] transition-colors"
              aria-label="Mở menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* ── Logo (full brand identity) ── */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group" aria-label="Trang chủ">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gradient-to-tr from-emerald-50 to-amber-50 border border-[#D4EAD9] flex items-center justify-center flex-shrink-0 shadow-sm">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-extrabold tracking-tight text-[#063B20] font-serif whitespace-nowrap">
                    HẠT GIỐNG <span className="text-[#16A765]">NHÀ VƯỜN</span>
                  </span>
                  <span className="hidden lg:inline-flex items-center bg-gradient-to-r from-amber-400 to-amber-500 text-[#063B20] text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-full leading-none">
                    F1 PRO
                  </span>
                </div>
                <span className="text-[9.5px] text-[#718078] font-medium mt-0.5 tracking-wide whitespace-nowrap">
                  ƯƠM MẦM HÔM NAY – RỰC RỠ NGÀY MAI 🌱
                </span>
              </div>
            </Link>

            {/* ── Divider ── */}
            <div className="hidden lg:block w-px h-6 bg-[#E3ECE6] flex-shrink-0" />

            {/* ── Mega Menu Trigger ── */}
            <div
              className="hidden lg:block relative flex-shrink-0"
              ref={categoryMenuRef}
              onMouseEnter={openMegaMenu}
              onMouseLeave={closeMegaMenuDelayed}
            >
              <button
                onClick={() => setIsCategoryMenuOpen((v) => !v)}
                aria-expanded={isCategoryMenuOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 px-3.5 h-[38px] rounded-xl text-[13px] font-bold transition-all duration-150 ${
                  isCategoryMenuOpen
                    ? 'bg-[#08763B] text-white shadow-md'
                    : 'bg-[#07552D] hover:bg-[#08763B] text-white shadow-sm'
                }`}
              >
                <LayoutGrid className="w-[14px] h-[14px] text-[#F5B82E] flex-shrink-0" />
                <span className="whitespace-nowrap">Danh mục</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 text-emerald-300 flex-shrink-0 ${
                    isCategoryMenuOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* ── MEGA MENU PANEL ── */}
              {isCategoryMenuOpen && (
                <div
                  className="absolute left-0 top-[calc(100%+8px)] z-50"
                  onMouseEnter={openMegaMenu}
                  onMouseLeave={closeMegaMenuDelayed}
                  role="menu"
                >
                  <div className="absolute -top-2 left-0 right-0 h-2" />
                  <div
                    className="w-[780px] bg-white rounded-2xl border border-[#E3ECE6] shadow-[0_16px_48px_rgba(6,59,32,0.13)] overflow-hidden"
                    style={{ animation: 'megaSlideIn 180ms cubic-bezier(0.16,1,0.3,1) both' }}
                  >
                    <div className="grid grid-cols-[1fr_270px]">
                      {/* Left: category list */}
                      <div className="p-5 border-r border-[#EEF4EF]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#A0AFA5] mb-3 px-1">
                          Khám phá các nhóm hạt giống
                        </p>
                        <div className="grid grid-cols-2 gap-0.5">
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/danh-muc/${cat.slug}`}
                              onClick={() => setIsCategoryMenuOpen(false)}
                              role="menuitem"
                              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#F2FAF5] group transition-colors"
                            >
                              <span className="w-8 h-8 rounded-lg bg-[#F0F7F2] group-hover:bg-[#D6EDDB] text-[16px] flex items-center justify-center flex-shrink-0 transition-colors">
                                {cat.icon || '🌱'}
                              </span>
                              <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-[#17231C] group-hover:text-[#08763B] truncate transition-colors">
                                  {cat.name}
                                </p>
                                <p className="text-[11px] text-[#A0AFA5] truncate">
                                  {cat.description || 'Hạt giống F1 chuẩn'}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#EEF4EF] flex items-center gap-4">
                          <Link
                            href="/san-pham"
                            onClick={() => setIsCategoryMenuOpen(false)}
                            className="flex items-center gap-1 text-[12px] font-semibold text-[#08763B] hover:text-[#063B20] transition-colors"
                          >
                            🌿 Xem tất cả <ArrowRight className="w-3 h-3" />
                          </Link>
                          <span className="text-[#D4EAD9]">·</span>
                          <Link
                            href="/blog"
                            onClick={() => setIsCategoryMenuOpen(false)}
                            className="flex items-center gap-1 text-[12px] font-semibold text-[#08763B] hover:text-[#063B20] transition-colors"
                          >
                            📖 Cẩm nang <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* Right: featured card */}
                      <div className="p-5 bg-gradient-to-b from-[#063B20] to-[#08763B] flex flex-col justify-between">
                        <div>
                          <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-[#F5B82E] border border-[#F5B82E]/40 bg-[#F5B82E]/10 rounded-full px-3 py-1">
                            🌻 HOT NHẤT MÙA NÀY
                          </span>
                          <h3 className="text-[15px] font-extrabold text-white font-serif mt-3 leading-snug">
                            Hạt Giống Hoa Hướng Dương Lùn F1
                          </h3>
                          <p className="text-[11.5px] text-emerald-200/90 mt-2 leading-relaxed">
                            Bông to, nở sau 50 ngày, dễ trồng ban công.
                          </p>
                        </div>
                        <div className="mt-5 space-y-2">
                          <Link
                            href="/san-pham/hat-giong-hoa-huong-duong-lun-f1"
                            onClick={() => setIsCategoryMenuOpen(false)}
                            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#F5B82E] hover:bg-[#F0A91A] text-[#063B20] text-[12.5px] font-bold transition-colors"
                          >
                            Xem ngay <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href="/san-pham?sale=true"
                            onClick={() => setIsCategoryMenuOpen(false)}
                            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl text-[11.5px] font-semibold text-emerald-200 hover:text-white hover:bg-white/10 transition-colors border border-white/20"
                          >
                            <Flame className="w-3 h-3 text-orange-400" />
                            Xem khuyến mãi hôm nay
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Nav links (desktop, compact) ── */}
            <nav className="hidden lg:flex items-center" aria-label="Navigation chính">
              <ul className="flex items-center" role="list">
                {navLinks.map(({ href, label }) => {
                  const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`relative px-2.5 h-[38px] inline-flex items-center text-[13px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                          active
                            ? 'text-[#08763B] bg-[#F2FAF5]'
                            : 'text-[#374C3E] hover:text-[#08763B] hover:bg-[#F2FAF5]'
                        }`}
                      >
                        {label}
                        {active && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-[#16A765] rounded-full" />
                        )}
                      </Link>
                    </li>
                  );
                })}
                {/* Promotion */}
                <li>
                  <Link
                    href="/san-pham?sale=true"
                    className="flex items-center gap-1 px-2.5 h-[38px] rounded-lg text-[13px] font-bold text-[#F0445E] hover:bg-rose-50 transition-colors whitespace-nowrap"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    KM
                    <span className="text-[9px] font-extrabold uppercase bg-[#F0445E] text-white px-1 py-0.5 rounded-full leading-none ml-0.5">
                      HOT
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>

            {/* ── Spacer: push search + actions to right ── */}
            <div className="flex-1" />

            {/* ── Search Bar (wide with full placeholder) ── */}
            <div className="hidden lg:block relative flex-1 max-w-[520px] flex-shrink-0" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} role="search">
                <div
                  className={`relative flex items-center rounded-2xl border transition-all duration-200 ${
                    isSearchFocused
                      ? 'border-[#16A765] shadow-[0_0_0_3px_rgba(22,167,101,0.12)] bg-white'
                      : 'border-[#D4EAD9] bg-[#F6FAF7] hover:border-[#A8CDB0]'
                  }`}
                >
                  <Search className="w-4 h-4 text-[#A0AFA5] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Tìm hạt giống hoa, dạ yến thảo, rau củ, chậu, đất trồng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full bg-transparent pl-10 pr-[82px] py-2.5 text-[13px] font-medium text-[#17231C] placeholder:text-[#B0BEB5] focus:outline-none rounded-2xl"
                    aria-label="Tìm kiếm"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-[32px] px-4 bg-[#07552D] hover:bg-[#08763B] text-white text-[13px] font-semibold rounded-xl transition-colors whitespace-nowrap flex items-center gap-1"
                  >
                    Tìm <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Live Search Dropdown */}
              {showSearchDrop && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-[380px] bg-white rounded-2xl border border-[#E3ECE6] shadow-[0_8px_32px_rgba(6,59,32,0.12)] overflow-hidden z-50">
                  <div className="px-4 py-2.5 bg-[#F6FAF7] border-b border-[#E3ECE6] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#374C3E] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#F5B82E]" />
                      {searchResults.length} gợi ý
                    </span>
                    <span className="text-[11px] text-[#718078]">↵ tìm tất cả</span>
                  </div>
                  <div className="divide-y divide-[#F0F5F1] max-h-64 overflow-y-auto">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/san-pham/${item.slug}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F6FAF7] transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-[#E3ECE6] bg-[#F6FAF7]">
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&q=80'}
                            alt={item.name}
                            className="w-full h-full object-cover"
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
                        <ChevronRight className="w-3.5 h-3.5 text-[#C0CFC4] group-hover:text-[#08763B] transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                  <div className="px-4 py-2 bg-[#F6FAF7] border-t border-[#E3ECE6]">
                    <button
                      onClick={() => handleSearchSubmit()}
                      className="w-full text-center text-xs font-semibold text-[#08763B] hover:text-[#063B20] transition-colors"
                    >
                      Xem tất cả kết quả cho &ldquo;{searchQuery}&rdquo; →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right actions ── */}
            <div className="flex items-center gap-1.5 flex-shrink-0">

              {/* Wishlist */}
              <Link
                href="/yeu-thich"
                aria-label="Yêu thích"
                className="relative p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <Heart className="w-[18px] h-[18px]" />
                {totalWishlist > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {totalWishlist}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Giỏ hàng"
                className="relative flex items-center gap-2.5 px-3 sm:px-4 h-[40px] bg-[#07552D] hover:bg-[#08763B] text-white rounded-xl transition-colors shadow-sm group"
              >
                <div className="relative flex-shrink-0">
                  <ShoppingBag className="w-[18px] h-[18px] text-[#F5B82E]" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] bg-[#F5B82E] text-[#063B20] text-[9.5px] font-extrabold rounded-full flex items-center justify-center px-0.5 shadow-sm">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-[9.5px] font-semibold text-emerald-300 uppercase tracking-widest">GIỎ HÀNG</span>
                  <span className="text-[13px] font-bold text-white mt-0.5 whitespace-nowrap">
                    {totalItems > 0 ? `${totalItems} món` : 'Trống'}
                  </span>
                </div>
              </button>

              {/* Account */}
              <Link
                href="/tai-khoan"
                aria-label="Tài khoản"
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl border border-[#D4EAD9] text-slate-500 hover:text-[#08763B] hover:bg-[#F2FAF5] hover:border-[#A8CDB0] transition-colors"
              >
                <User className="w-[16px] h-[16px]" />
              </Link>
            </div>

          </div>
        </div>

        {/* ── Mobile Search Row ── */}
        <div className="lg:hidden px-4 py-2.5 bg-[#F6FAF7] border-t border-[#E3ECE6]">
          <form onSubmit={handleSearchSubmit} className="relative" role="search">
            <Search className="w-3.5 h-3.5 text-[#A0AFA5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm hạt giống hoa, rau củ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-16 py-2 text-[13px] rounded-xl border border-[#D4EAD9] bg-white focus:outline-none focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)] transition-all"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-[28px] px-3 bg-[#07552D] text-white text-[12px] font-semibold rounded-lg"
            >
              Tìm
            </button>
          </form>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          MOBILE DRAWER
      ════════════════════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-[min(84vw,340px)] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu điều hướng"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-[#07552D] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <p className="text-[13px] font-extrabold text-white font-serif">HẠT GIỐNG NHÀ VƯỜN</p>
              <p className="text-[10px] text-emerald-300 mt-0.5">Organic &amp; Garden Seeds</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-3 px-3 space-y-0.5">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${pathname === '/' ? 'bg-[#F2FAF5] text-[#08763B]' : 'text-[#17231C] hover:bg-[#F2FAF5]'}`}>
              <span>Trang chủ</span><ChevronRight className="w-4 h-4 text-[#C0CFC4]" />
            </Link>
            <Link href="/san-pham" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#17231C] hover:bg-[#F2FAF5] transition-colors">
              <span>Tất cả sản phẩm</span><ChevronRight className="w-4 h-4 text-[#C0CFC4]" />
            </Link>
            <Link href="/san-pham?sale=true" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-[#F0445E] hover:bg-rose-50 transition-colors">
              <span className="flex items-center gap-2"><Flame className="w-4 h-4" />Khuyến mãi HOT</span>
              <span className="text-[10px] bg-[#F0445E] text-white px-2 py-0.5 rounded-full font-bold">HOT</span>
            </Link>
          </div>

          <div className="px-3 pb-3 border-t border-[#EEF4EF] pt-3">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#A0AFA5]">Danh mục hạt giống</p>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/danh-muc/${cat.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#374C3E] hover:bg-[#F2FAF5] hover:text-[#08763B] transition-colors group">
                <span className="text-[16px]">{cat.icon || '🌱'}</span>
                <span className="flex-1 truncate">{cat.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#C0CFC4]" />
              </Link>
            ))}
          </div>

          <div className="px-3 pb-4 border-t border-[#EEF4EF] pt-3 space-y-0.5">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#A0AFA5]">Hỗ trợ &amp; Thông tin</p>
            <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#374C3E] hover:bg-[#F2FAF5] transition-colors">
              <Sprout className="w-4 h-4 text-[#16A765]" />Cẩm nang gieo trồng
            </Link>
            <Link href="/tra-cuu-don-hang" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#374C3E] hover:bg-[#F2FAF5] transition-colors">
              <Truck className="w-4 h-4 text-[#16A765]" />Tra cứu đơn hàng
            </Link>
            <Link href="/lien-he" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#374C3E] hover:bg-[#F2FAF5] transition-colors">
              <Phone className="w-4 h-4 text-[#16A765]" />Liên hệ nhà vườn
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-[#E8F0EA] bg-[#F6FAF7] space-y-2">
          <a
            href={`tel:${settings.hotline.replace(/\s/g, '')}`}
            className="flex items-center justify-between w-full px-4 py-2.5 bg-[#07552D] hover:bg-[#08763B] text-white rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#F5B82E]" />
              <span className="text-sm font-bold">Hotline: {settings.hotline}</span>
            </div>
            <span className="text-[10px] bg-[#063B20] text-[#F5B82E] font-bold px-2 py-0.5 rounded-lg">GỌI</span>
          </a>
          {settings.address && (
            <div className="flex items-start gap-2 px-1 text-xs text-[#718078]">
              <MapPin className="w-3.5 h-3.5 text-[#16A765] flex-shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        @keyframes megaSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
