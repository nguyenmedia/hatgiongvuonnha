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
      {/* ─── STICKY HEADER WRAPPER ─────────────────────────────────── */}
      <header
        className={`w-full z-40 transition-shadow duration-300 ${
          isScrolled ? 'sticky top-0 shadow-[0_2px_20px_rgba(6,59,32,0.10)]' : 'relative'
        } bg-white`}
      >
        {/* ══════════════════════════════════════════════════════════
            TIER 1 — LOGO · SEARCH · ACTIONS
        ══════════════════════════════════════════════════════════ */}
        <div className="border-b border-[#E8F0EA]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-[72px] sm:h-20">

              {/* ── Mobile hamburger ── */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden flex-shrink-0 p-2 rounded-xl text-slate-700 hover:bg-[#F2FAF5] hover:text-[#08763B] transition-colors"
                aria-label="Mở menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* ── Brand Logo ── */}
              <Link href="/" className="flex items-center gap-3 flex-shrink-0 group" aria-label="Trang chủ">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-[#F2FAF5] border border-[#D4EAD9] flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="Hạt Giống Nhà Vườn"
                    className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="font-extrabold text-[17px] tracking-tight text-[#063B20] font-serif">
                    HẠT GIỐNG <span className="text-[#16A765]">NHÀ VƯỜN</span>
                  </span>
                  <span className="text-[10.5px] font-medium text-[#718078] tracking-wide mt-0.5">
                    Organic &amp; Garden Seeds
                  </span>
                </div>
              </Link>

              {/* ── Search Bar ── */}
              <div className="flex-1 max-w-[560px] mx-auto relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} role="search">
                  <div
                    className={`relative flex items-center rounded-2xl border transition-all duration-200 ${
                      isSearchFocused
                        ? 'border-[#16A765] shadow-[0_0_0_3px_rgba(22,167,101,0.12)] bg-white'
                        : 'border-[#D4EAD9] bg-[#F6FAF7] hover:border-[#A8CDB0]'
                    }`}
                  >
                    <Search className="w-4 h-4 text-[#718078] absolute left-4 pointer-events-none flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Tìm hạt giống hoa, rau củ, cây cảnh F1..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      className="w-full bg-transparent pl-11 pr-[88px] py-2.5 text-sm font-medium text-[#17231C] placeholder:text-[#A0AFA5] focus:outline-none rounded-2xl"
                      aria-label="Tìm kiếm sản phẩm"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-[34px] px-5 bg-[#07552D] hover:bg-[#08763B] text-white text-[13px] font-bold rounded-[12px] transition-colors flex items-center gap-1.5"
                      aria-label="Tìm kiếm"
                    >
                      Tìm <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* ── Live Search Dropdown ── */}
                {showSearchDrop && (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white rounded-2xl border border-[#E3ECE6] shadow-[0_8px_32px_rgba(6,59,32,0.12)] overflow-hidden z-50">
                    <div className="px-4 py-2.5 bg-[#F6FAF7] border-b border-[#E3ECE6] flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#17231C] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#F5B82E]" />
                        Gợi ý ({searchResults.length} kết quả)
                      </span>
                      <span className="text-[11px] text-[#718078]">↵ để tìm tất cả</span>
                    </div>
                    <div className="divide-y divide-[#F0F5F1] max-h-72 overflow-y-auto">
                      {searchResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/san-pham/${item.slug}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F6FAF7] transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#E3ECE6] bg-[#F6FAF7]">
                            <img
                              src={item.images?.[0] || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&q=80'}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#17231C] group-hover:text-[#08763B] truncate transition-colors">
                              {item.name}
                            </p>
                            <p className="text-xs font-bold text-[#08763B] mt-0.5">
                              {formatPrice(item.sale_price || item.price)}
                              {item.sale_price && (
                                <span className="text-[#A0AFA5] font-normal line-through ml-2">
                                  {formatPrice(item.price)}
                                </span>
                              )}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#C0CFC4] group-hover:text-[#08763B] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 bg-[#F6FAF7] border-t border-[#E3ECE6]">
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
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Wishlist */}
                <Link
                  href="/yeu-thich"
                  aria-label={`Yêu thích${totalWishlist > 0 ? ` (${totalWishlist})` : ''}`}
                  className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors group"
                >
                  <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {totalWishlist > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {totalWishlist}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  aria-label={`Giỏ hàng${totalItems > 0 ? ` (${totalItems} sản phẩm)` : ''}`}
                  className="relative flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#07552D] hover:bg-[#08763B] text-white rounded-xl transition-colors shadow-sm group"
                >
                  <div className="relative">
                    <ShoppingBag className="w-[18px] h-[18px] text-[#F5B82E]" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[#F5B82E] text-[#063B20] text-[10px] font-extrabold rounded-full flex items-center justify-center px-0.5 shadow-sm">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col text-left leading-none">
                    <span className="text-[9.5px] font-medium text-emerald-300 uppercase tracking-widest">Giỏ hàng</span>
                    <span className="text-[13px] font-bold text-white mt-0.5">
                      {totalItems > 0 ? `${totalItems} món` : 'Trống'}
                    </span>
                  </div>
                </button>

                {/* Account */}
                <Link
                  href="/tai-khoan"
                  aria-label="Tài khoản"
                  className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl border border-[#D4EAD9] text-slate-600 hover:text-[#08763B] hover:bg-[#F2FAF5] hover:border-[#A8CDB0] transition-colors"
                >
                  <User className="w-[17px] h-[17px]" />
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* Mobile search row */}
        <div className="md:hidden px-4 py-2.5 bg-[#F6FAF7] border-b border-[#E8F0EA]">
          <form onSubmit={handleSearchSubmit} className="relative" role="search">
            <Search className="w-3.5 h-3.5 text-[#718078] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm hạt giống hoa, rau củ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-16 py-2 text-sm rounded-xl border border-[#D4EAD9] bg-white focus:outline-none focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)] transition-all"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-[30px] px-3 bg-[#07552D] text-white text-xs font-semibold rounded-lg"
            >
              Tìm
            </button>
          </form>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TIER 2 — MAIN NAVIGATION BAR
        ══════════════════════════════════════════════════════════ */}
        <nav className="hidden lg:block border-b border-[#E8F0EA] bg-white" aria-label="Navigation chính">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-[52px] gap-1">

              {/* ── Mega Menu Trigger ── */}
              <div
                className="relative flex-shrink-0"
                ref={categoryMenuRef}
                onMouseEnter={openMegaMenu}
                onMouseLeave={closeMegaMenuDelayed}
              >
                <button
                  onClick={() => setIsCategoryMenuOpen((v) => !v)}
                  aria-expanded={isCategoryMenuOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 px-4 h-[36px] rounded-xl text-[13.5px] font-bold transition-all duration-150 ${
                    isCategoryMenuOpen
                      ? 'bg-[#08763B] text-white shadow-md'
                      : 'bg-[#07552D] hover:bg-[#08763B] text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <LayoutGrid className="w-[15px] h-[15px] text-[#F5B82E]" />
                  <span>Danh mục hạt giống</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 text-emerald-300 ${
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
                    {/* Invisible bridge to prevent gap-hover flicker */}
                    <div className="absolute -top-2 left-0 right-0 h-2" />
                    <div
                      className="w-[800px] bg-white rounded-2xl border border-[#E3ECE6] shadow-[0_16px_48px_rgba(6,59,32,0.13),0_0_0_1px_rgba(6,59,32,0.04)] overflow-hidden"
                      style={{ animation: 'megaSlideIn 180ms cubic-bezier(0.16,1,0.3,1) both' }}
                    >
                      <div className="grid grid-cols-[1fr_290px]">

                        {/* Left: category list */}
                        <div className="p-5 border-r border-[#EEF4EF]">
                          <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#718078] mb-3 px-1">
                            Khám phá các nhóm hạt giống
                          </p>
                          <div className="grid grid-cols-2 gap-1">
                            {categories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/danh-muc/${cat.slug}`}
                                onClick={() => setIsCategoryMenuOpen(false)}
                                role="menuitem"
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F2FAF5] group transition-colors"
                              >
                                <span className="w-9 h-9 rounded-xl bg-[#F0F7F2] group-hover:bg-[#D6EDDB] text-[18px] flex items-center justify-center flex-shrink-0 transition-colors">
                                  {cat.icon || '🌱'}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-[13.5px] font-semibold text-[#17231C] group-hover:text-[#08763B] truncate transition-colors leading-snug">
                                    {cat.name}
                                  </p>
                                  <p className="text-[11px] text-[#718078] truncate leading-snug mt-0.5">
                                    {cat.description || `Hạt giống F1 chuẩn`}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                          {/* Bottom shortcut row */}
                          <div className="mt-4 pt-4 border-t border-[#EEF4EF] flex items-center gap-2">
                            <Link
                              href="/san-pham"
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-[#08763B] hover:text-[#063B20] transition-colors"
                            >
                              <span>🌿 Xem tất cả sản phẩm</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                            <span className="text-[#D4EAD9]">·</span>
                            <Link
                              href="/blog"
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-[#08763B] hover:text-[#063B20] transition-colors"
                            >
                              <span>📖 Cẩm nang gieo trồng</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>

                        {/* Right: featured banner */}
                        <div className="p-5 bg-gradient-to-b from-[#063B20] to-[#08763B] flex flex-col justify-between">
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase tracking-wider text-[#F5B82E] border border-[#F5B82E]/40 bg-[#F5B82E]/10 rounded-full px-3 py-1">
                              🌻 HOT NHẤT MÙA NÀY
                            </span>
                            <h3 className="text-[17px] font-extrabold text-white font-serif mt-3 leading-snug">
                              Hạt Giống Hoa Hướng Dương Lùn F1
                            </h3>
                            <p className="text-[12.5px] text-emerald-200/90 mt-2 leading-relaxed">
                              Bông to rực rỡ, nở sau 50 ngày, rất dễ trồng tại ban công hoặc sân vườn nhỏ.
                            </p>
                          </div>
                          <div className="mt-6 space-y-2">
                            <Link
                              href="/san-pham/hat-giong-hoa-huong-duong-lun-f1"
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#F5B82E] hover:bg-[#F0A91A] text-[#063B20] text-[13px] font-bold transition-colors"
                            >
                              Xem ngay <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href="/san-pham?sale=true"
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[12px] font-semibold text-emerald-200 hover:text-white hover:bg-white/10 transition-colors border border-white/20"
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
              <div className="w-px h-5 bg-[#E3ECE6] mx-2 flex-shrink-0" />

              {/* ── Nav Links ── */}
              <ul className="flex items-center gap-0.5" role="list">
                {navLinks.map(({ href, label }) => {
                  const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`relative px-3.5 h-[36px] flex items-center text-[13.5px] font-semibold rounded-xl transition-colors ${
                          active
                            ? 'text-[#08763B] bg-[#F2FAF5]'
                            : 'text-[#374C3E] hover:text-[#08763B] hover:bg-[#F2FAF5]'
                        }`}
                      >
                        {label}
                        {active && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#16A765] rounded-full" />
                        )}
                      </Link>
                    </li>
                  );
                })}

                {/* Promotion — special styling */}
                <li>
                  <Link
                    href="/san-pham?sale=true"
                    className="flex items-center gap-1.5 px-3.5 h-[36px] rounded-xl text-[13.5px] font-bold text-[#F0445E] hover:bg-rose-50 transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Khuyến mãi
                    <span className="text-[9.5px] font-extrabold uppercase bg-[#F0445E] text-white px-1.5 py-0.5 rounded-full leading-none">
                      HOT
                    </span>
                  </Link>
                </li>
              </ul>

              {/* ── Spacer + Hotline ── */}
              <div className="ml-auto flex items-center gap-2 text-xs text-[#718078]">
                <Phone className="w-3.5 h-3.5 text-[#16A765]" />
                <a
                  href={`tel:${settings.hotline.replace(/\s/g, '')}`}
                  className="font-semibold text-[#063B20] hover:text-[#08763B] transition-colors whitespace-nowrap"
                >
                  {settings.hotline}
                </a>
              </div>

            </div>
          </div>
        </nav>
      </header>

      {/* ══════════════════════════════════════════════════════════
          MOBILE DRAWER (off-canvas)
      ══════════════════════════════════════════════════════════ */}
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
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 bg-[#07552D] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <p className="text-[13.5px] font-extrabold text-white font-serif">HẠT GIỐNG NHÀ VƯỜN</p>
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main nav links */}
          <div className="py-3 px-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold mb-0.5 transition-colors ${
                pathname === '/' ? 'bg-[#F2FAF5] text-[#08763B]' : 'text-[#17231C] hover:bg-[#F2FAF5]'
              }`}
            >
              <span>Trang chủ</span>
              <ChevronRight className="w-4 h-4 text-[#C0CFC4]" />
            </Link>
            <Link
              href="/san-pham"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#17231C] hover:bg-[#F2FAF5] transition-colors"
            >
              <span>Tất cả sản phẩm</span>
              <ChevronRight className="w-4 h-4 text-[#C0CFC4]" />
            </Link>
            <Link
              href="/san-pham?sale=true"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-[#F0445E] hover:bg-rose-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Khuyến mãi HOT
              </span>
              <span className="text-[10px] bg-[#F0445E] text-white px-2 py-0.5 rounded-full font-bold">HOT</span>
            </Link>
          </div>

          {/* Category group */}
          <div className="px-3 pb-3">
            <p className="px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#A0AFA5]">
              Danh mục hạt giống
            </p>
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/danh-muc/${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#374C3E] hover:bg-[#F2FAF5] hover:text-[#08763B] transition-colors group"
                >
                  <span className="text-[17px]">{cat.icon || '🌱'}</span>
                  <span className="flex-1 truncate">{cat.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#C0CFC4] group-hover:text-[#16A765] transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Info group */}
          <div className="px-3 pb-4 border-t border-[#EEF4EF] pt-3">
            <p className="px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#A0AFA5]">
              Hỗ trợ &amp; Hướng dẫn
            </p>
            <div className="space-y-0.5">
              <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#374C3E] hover:bg-[#F2FAF5] transition-colors">
                <Sprout className="w-4 h-4 text-[#16A765]" />
                Cẩm nang gieo trồng
              </Link>
              <Link href="/tra-cuu-don-hang" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#374C3E] hover:bg-[#F2FAF5] transition-colors">
                <Truck className="w-4 h-4 text-[#16A765]" />
                Tra cứu đơn hàng
              </Link>
              <Link href="/lien-he" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#374C3E] hover:bg-[#F2FAF5] transition-colors">
                <Phone className="w-4 h-4 text-[#16A765]" />
                Liên hệ nhà vườn
              </Link>
            </div>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex-shrink-0 p-4 border-t border-[#E8F0EA] bg-[#F6FAF7] space-y-2">
          <a
            href={`tel:${settings.hotline.replace(/\s/g, '')}`}
            className="flex items-center justify-between w-full px-4 py-3 bg-[#07552D] hover:bg-[#08763B] text-white rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#F5B82E]" />
              <span className="text-sm font-bold">Hotline: {settings.hotline}</span>
            </div>
            <span className="text-[10px] bg-[#063B20] text-[#F5B82E] font-bold px-2 py-1 rounded-lg">
              GỌI NGAY
            </span>
          </a>
          {settings.address && (
            <div className="flex items-start gap-2 px-1 text-xs text-[#718078]">
              <MapPin className="w-3.5 h-3.5 text-[#16A765] flex-shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
          )}
        </div>
      </aside>

      {/* CSS for mega menu animation */}
      <style>{`
        @keyframes megaSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
