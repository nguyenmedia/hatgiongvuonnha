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

  // Keyboard support: Close mega menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCategoryMenuOpen(false);
        setIsSearching(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Safe timer for hover transitions to prevent flickering
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterMenu = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsCategoryMenuOpen(true);
  };

  const handleMouseLeaveMenu = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsCategoryMenuOpen(false);
    }, 150);
  };

  return (
    <header className="site-header w-full">
      {/* 1. TOP TIER (TẦNG 1: LOGO, SEARCH, WISHLIST, CART, ACCOUNT) */}
      <div className="header-top-bar flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between gap-4 sm:gap-8">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-800 hover:text-emerald-700 rounded-xl hover:bg-slate-100 focus:outline-none transition"
              aria-label="Mở menu danh mục"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Trang chủ Hạt Giống Nhà Vườn">
              <img
                src="/logo.png"
                alt="Logo Hạt Giống Nhà Vườn"
                className="h-10 sm:h-12 w-auto max-w-[120px] sm:max-w-[150px] object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <div className="hidden sm:flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#063B20] font-serif leading-none">
                  HẠT GIỐNG <span className="text-[#16A765] font-sans font-bold">NHÀ VƯỜN</span>
                </span>
                <span className="text-[10px] text-[#718078] tracking-wide font-medium mt-0.5">
                  Organic &amp; Garden Seeds
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative" role="search">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#718078] absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm kiếm hạt giống hoa, rau củ, củ quả F1..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setIsSearching(true)}
                  className="search-input-organic w-full pl-11 pr-24 py-2.5 text-xs sm:text-sm font-medium placeholder:text-[#718078]"
                  aria-label="Tìm kiếm sản phẩm hạt giống"
                />
                <button
                  type="submit"
                  className="search-btn-organic absolute right-1.5 top-1.5 bottom-1.5 px-5 text-xs flex items-center gap-1.5"
                  aria-label="Tìm kiếm"
                >
                  <span>Tìm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Live Search Suggestion Box */}
            {isSearching && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-[#E3ECE6] overflow-hidden z-50 animate-in fade-in">
                <div className="p-3 bg-[#F2FAF5] text-xs font-bold text-[#063B20] border-b border-[#E3ECE6] flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#F5B82E]" />
                    Gợi ý hạt giống ({searchResults.length})
                  </span>
                  <span className="text-[#718078] font-normal text-[11px]">Nhấn Enter để tìm</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/san-pham/${item.slug}`}
                      onClick={() => setIsSearching(false)}
                      className="flex items-center gap-3 p-3 hover:bg-[#F2FAF5] transition group"
                    >
                      <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#08763B] truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-[#08763B]">
                            {formatPrice(item.sale_price || item.price)}
                          </span>
                          {item.sale_price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {formatPrice(item.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#08763B] group-hover:translate-x-1 transition" />
                    </Link>
                  ))}
                </div>
                <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-[#08763B] hover:text-[#063B20] transition"
                  >
                    Xem tất cả kết quả cho "{searchQuery}" →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Wishlist, Cart & Account */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Wishlist */}
            <Link
              href="/yeu-thich"
              className="p-2.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition relative group"
              title="Danh sách yêu thích"
              aria-label="Danh sách yêu thích"
            >
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalWishlist > 0 && (
                <span className="absolute top-1 right-1 bg-[#F0445E] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 bg-[#07552D] hover:bg-[#08763B] text-white rounded-xl shadow-xs hover:shadow transition active:scale-95 group"
              aria-label="Giỏ hàng"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#F5B82E] text-[#063B20] text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-emerald-200 leading-none">Giỏ hàng</span>
                <span className="text-xs font-bold text-white mt-0.5">
                  {totalItems > 0 ? `${totalItems} món` : 'Trống'}
                </span>
              </div>
            </button>

            {/* Account */}
            <Link
              href="/tai-khoan"
              className="hidden sm:flex items-center justify-center w-9 h-9 text-slate-700 hover:text-[#08763B] bg-slate-50 hover:bg-[#F2FAF5] rounded-xl transition border border-[#E3ECE6]"
              title="Tài khoản cá nhân"
              aria-label="Tài khoản cá nhân"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Row (Directly below Header on Mobile) */}
      <div className="md:hidden px-4 py-2.5 bg-[#f6faf7] border-b border-[#E3ECE6]">
        <form onSubmit={handleSearchSubmit} className="relative" role="search">
          <input
            type="text"
            placeholder="Tìm kiếm hạt giống hoa, rau củ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-organic w-full pl-9 pr-16 py-2 text-xs font-medium"
            aria-label="Tìm kiếm sản phẩm"
          />
          <Search className="w-3.5 h-3.5 text-[#718078] absolute left-3 top-2.5" />
          <button
            type="submit"
            className="search-btn-organic absolute right-1 top-1 bottom-1 px-3 text-[11px]"
            aria-label="Tìm"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* 2. MAIN NAVIGATION (TẦNG 2: NAVIGATION & MEGA MENU) */}
      <nav className="hidden lg:block main-nav-container border-b border-[#E3ECE6] bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Left: Mega Menu Trigger for "Danh mục hạt giống" */}
          <div 
            className="relative" 
            ref={categoryMenuRef}
            onMouseEnter={handleMouseEnterMenu}
            onMouseLeave={handleMouseLeaveMenu}
          >
            <button
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="btn-category-cta flex items-center gap-2"
              aria-expanded={isCategoryMenuOpen}
              aria-haspopup="true"
              aria-label="Danh mục hạt giống"
            >
              <LayoutGrid className="w-4 h-4 text-[#F5B82E]" />
              <span>Danh mục hạt giống</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180 text-white' : 'text-emerald-200'}`} />
            </button>

            {/* 3. MEGA MENU DROPDOWN PANEL */}
            {isCategoryMenuOpen && (
              <div className="mega-menu-wrapper">
                <div 
                  className="mega-menu-panel grid grid-cols-12 gap-5"
                  role="menu"
                  aria-label="Danh mục hạt giống chi tiết"
                >
                  {/* Left Column: Vertical Category Navigation */}
                  <div className="col-span-7 space-y-1 pr-3 border-r border-[#E3ECE6]">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#08763B] bg-[#F2FAF5] rounded-lg mb-2 flex items-center justify-between">
                      <span>Các nhóm hạt giống</span>
                      <span className="text-[10px] text-[#16A765] font-semibold">Tỷ lệ nảy mầm &gt; 85%</span>
                    </div>

                    <div className="space-y-0.5 max-h-[360px] overflow-y-auto pr-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/danh-muc/${cat.slug}`}
                          onClick={() => setIsCategoryMenuOpen(false)}
                          className="category-vertical-item group"
                          role="menuitem"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="cat-icon-box">
                              {cat.icon || '🌱'}
                            </span>
                            <div className="min-w-0">
                              <h4 className="cat-title truncate">
                                {cat.name}
                              </h4>
                              <p className="cat-desc truncate">
                                {cat.description || `Hạt giống ${cat.name} F1 năng suất cao`}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="cat-chevron" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Featured Category / Hot Product Card */}
                  <div className="col-span-5 flex flex-col justify-between">
                    <div className="mega-featured-card h-full min-h-[200px]">
                      <div>
                        <div className="mega-featured-badge">
                          <span>🌻 HOT NHẤT MÙA NÀY</span>
                        </div>
                        <h4 className="text-base font-bold font-serif mt-2.5 leading-snug text-white">
                          Hạt Giống Hoa Hướng Dương F1
                        </h4>
                        <p className="text-xs text-emerald-100/90 mt-1.5 font-normal leading-relaxed">
                          Bông to, nở sau 50 ngày, dễ trồng ban công và sân vườn.
                        </p>
                      </div>

                      <div className="mt-4">
                        <Link
                          href="/san-pham/hat-giong-hoa-huong-duong-lun-f1"
                          onClick={() => setIsCategoryMenuOpen(false)}
                          className="mega-featured-cta"
                        >
                          <span>Xem ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Bottom Quick Links */}
                    <div className="pt-3 mt-3 border-t border-[#E3ECE6] space-y-1">
                      <Link
                        href="/san-pham"
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold text-[#08763B] hover:bg-[#F2FAF5] transition"
                      >
                        <span>Xem tất cả hạt giống</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href="/blog"
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-[#08763B] hover:bg-[#F2FAF5] transition"
                      >
                        <span>Cẩm nang gieo trồng</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Main Navigation Links */}
          <ul className="flex items-center gap-1 font-semibold text-slate-700">
            <li>
              <Link
                href="/"
                className={`nav-link-item ${pathname === '/' ? 'active' : ''}`}
              >
                <span>Trang chủ</span>
              </Link>
            </li>

            <li>
              <Link
                href="/danh-muc/hat-giong-hoa"
                className={`nav-link-item ${pathname === '/danh-muc/hat-giong-hoa' ? 'active' : ''}`}
              >
                <span>Hạt Giống Hoa</span>
              </Link>
            </li>

            <li>
              <Link
                href="/danh-muc/hat-giong-rau-cu"
                className={`nav-link-item ${pathname === '/danh-muc/hat-giong-rau-cu' ? 'active' : ''}`}
              >
                <span>Hạt Giống Rau Củ</span>
              </Link>
            </li>

            <li>
              <Link
                href="/danh-muc/hat-giong-cay-canh"
                className={`nav-link-item ${pathname === '/danh-muc/hat-giong-cay-canh' ? 'active' : ''}`}
              >
                <span>Hạt Giống Cây Cảnh</span>
              </Link>
            </li>

            <li>
              <Link
                href="/danh-muc/hat-giong-cay-an-qua"
                className={`nav-link-item ${pathname === '/danh-muc/hat-giong-cay-an-qua' ? 'active' : ''}`}
              >
                <span>Hạt Giống Cây Ăn Quả</span>
              </Link>
            </li>

            <li>
              <Link
                href="/san-pham?sale=true"
                className="nav-link-item text-[#F0445E] hover:text-[#d32f48] hover:bg-rose-50"
              >
                <Flame className="w-3.5 h-3.5 text-[#F0445E]" />
                <span>Khuyến mãi</span>
                <span className="bg-[#F0445E] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  HOT
                </span>
              </Link>
            </li>

            <li>
              <Link
                href="/blog"
                className={`nav-link-item ${pathname === '/blog' ? 'active' : ''}`}
              >
                <span>Cẩm nang</span>
              </Link>
            </li>

            <li>
              <Link
                href="/lien-he"
                className={`nav-link-item ${pathname === '/lien-he' ? 'active' : ''}`}
              >
                <span>Liên hệ</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* 4. MOBILE ACCORDION / OFF-CANVAS DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            
            {/* Drawer Header */}
            <div>
              <div className="p-4 bg-[#07552D] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="Logo" className="h-8 w-auto bg-white rounded-lg p-0.5" />
                  <div>
                    <div className="font-serif font-bold text-sm">HẠT GIỐNG NHÀ VƯỜN</div>
                    <div className="text-[10px] text-emerald-200">Organic &amp; Garden Seeds</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-white hover:bg-white/10 rounded-lg"
                  aria-label="Đóng menu"
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
                    className="flex items-center justify-between p-2.5 rounded-xl font-semibold text-xs text-slate-800 hover:bg-[#F2FAF5]"
                  >
                    <span>Trang chủ</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                  <Link
                    href="/san-pham"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl font-semibold text-xs text-slate-800 hover:bg-[#F2FAF5]"
                  >
                    <span>Tất cả sản phẩm hạt giống</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                  <Link
                    href="/san-pham?sale=true"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl font-bold text-xs text-[#F0445E] hover:bg-rose-50"
                  >
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-[#F0445E]" />
                      Ưu đãi Khuyến mãi
                    </span>
                    <span className="bg-[#F0445E] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">HOT</span>
                  </Link>
                </div>

                {/* Categories */}
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400 px-2 mb-2">
                    Danh mục hạt giống
                  </div>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/danh-muc/${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-[#F2FAF5]"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{cat.icon || '🌱'}</span>
                          <span>{cat.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Additional Pages */}
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400 px-2 mb-2">
                    Thông tin &amp; Hỗ trợ
                  </div>
                  <div className="space-y-1 text-xs font-medium text-slate-700">
                    <Link
                      href="/blog"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F2FAF5]"
                    >
                      <Sprout className="w-4 h-4 text-[#08763B]" />
                      <span>Cẩm nang gieo trồng</span>
                    </Link>
                    <Link
                      href="/tra-cuu-don-hang"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F2FAF5]"
                    >
                      <Truck className="w-4 h-4 text-[#08763B]" />
                      <span>Tra cứu đơn hàng</span>
                    </Link>
                    <Link
                      href="/lien-he"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F2FAF5]"
                    >
                      <Phone className="w-4 h-4 text-[#08763B]" />
                      <span>Liên hệ nhà vườn</span>
                    </Link>
                  </div>
                </div>

              </div>
            </div>

            {/* Mobile Footer Contact */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 space-y-2">
              <a 
                href={`tel:${settings.hotline.replace(/\s/g, '')}`} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#07552D] text-white font-bold"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#F5B82E]" />
                  <span>Hotline: {settings.hotline}</span>
                </div>
                <span className="text-[10px] bg-[#063B20] px-2 py-0.5 rounded text-amber-300">GỌI</span>
              </a>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}

