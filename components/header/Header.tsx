'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, ShoppingBag, Heart, Phone, Menu, X, 
  ChevronDown, Sparkles, User, ArrowRight, ShieldCheck, Truck, Clock, ChevronRight
} from 'lucide-react';
import { useCart } from '../providers/CartProvider';
import { useWishlist } from '../providers/WishlistProvider';
import { useSettings } from '../providers/SettingsProvider';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types/database.types';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { settings } = useSettings();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Scroll event for sticky glass navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
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
    ).slice(0, 5);

    setSearchResults(filtered);
  }, [searchQuery]);

  // Click outside search results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearching(false);
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
      {/* Top Banner Bar */}
      <div className="bg-forest-900 text-white text-xs py-1.5 px-3 sm:px-4 border-b border-forest-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 text-emerald-300 font-medium truncate max-w-[60%] sm:max-w-none">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300" />
            <span className="truncate">Gieo hạt hôm nay – Nở hoa ngày mai</span>
          </div>
          <div className="flex items-center gap-4 text-gray-300 shrink-0">
            <a 
              href={`tel:${settings.hotline.replace(/\s/g, '')}`} 
              className="flex items-center gap-1 text-white hover:text-emerald-300 transition font-extrabold"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span><span className="hidden sm:inline">Hotline/Zalo: </span>{settings.hotline}</span>
            </a>
            <span className="hidden sm:inline text-forest-700">|</span>
            <Link href="/tra-cuu-don-hang" className="hover:text-white transition hidden sm:inline">
              Tra cứu đơn hàng
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className={`transition-all duration-300 ${isScrolled ? 'sticky top-0 shadow-md glass-nav' : 'bg-white border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            
            {/* Left: Mobile Menu Button & Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-forest-900 hover:text-forest-700 rounded-xl hover:bg-forest-50 focus:outline-none"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link href="/" className="flex items-center gap-2 group">
                <img
                  src="/logo.png"
                  alt="Logo Hạt Giống Nhà Vườn"
                  className="h-9 sm:h-12 w-auto max-w-[120px] sm:max-w-[160px] object-contain group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm sm:text-xl tracking-tight text-forest-950 font-serif leading-none">
                    HẠT GIỐNG <span className="text-forest-600 font-sans font-bold">NHÀ VƯỜN</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-forest-700 tracking-wider uppercase font-extrabold mt-0.5 hidden xs:block sm:block">
                    Ươm mầm hôm nay – Rực rỡ ngày mai
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4 relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  placeholder="Tìm hạt giống hoa hướng dương, dạ yến thảo, rau củ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setIsSearching(true)}
                  className="w-full pl-11 pr-24 py-2.5 rounded-full border border-forest-200 bg-forest-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm transition"
                />
                <Search className="w-4 h-4 text-forest-600 absolute left-4 top-3.5" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 px-4 py-1.5 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-full transition"
                >
                  Tìm kiếm
                </button>
              </form>

              {/* Live Search Suggestion Box */}
              {isSearching && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 bg-forest-50 text-xs font-semibold text-forest-800 border-b flex justify-between items-center">
                    <span>Gợi ý sản phẩm ({searchResults.length})</span>
                    <span className="text-gray-500 font-normal">Nhấn Enter để xem tất cả</span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/san-pham/${item.slug}`}
                        onClick={() => setIsSearching(false)}
                        className="flex items-center gap-3 p-3 hover:bg-forest-50/60 transition group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80'}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-gray-900 group-hover:text-forest-700 truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-forest-700">
                              {formatPrice(item.sale_price || item.price)}
                            </span>
                            {item.sale_price && (
                              <span className="text-[10px] text-gray-400 line-through">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-forest-600 font-medium group-hover:translate-x-1 transition">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Wishlist */}
              <Link
                href="/yeu-thich"
                className="p-2 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition relative"
                title="Sản phẩm yêu thích"
              >
                <Heart className="w-5 h-5" />
                {totalWishlist > 0 && (
                  <span className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow">
                    {totalWishlist}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl sm:rounded-full transition shadow-sm group"
                aria-label="Giỏ hàng"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-amber-500 text-forest-950 text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold hidden sm:inline">Giỏ hàng</span>
              </button>

              {/* Account Link */}
              <Link
                href="/tai-khoan"
                className="hidden sm:flex items-center justify-center w-9 h-9 text-forest-800 bg-forest-100 hover:bg-forest-200 rounded-full transition"
                title="Tài khoản cá nhân"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mobile Quick Search Bar (Shopee/Tiki Mobile Style) */}
          <div className="md:hidden pb-3 pt-0">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Tìm hạt giống hoa, rau củ, quả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-20 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <button
                type="submit"
                className="absolute right-1 top-1 px-3 py-1 bg-forest-800 hover:bg-forest-900 text-white text-[11px] font-bold rounded-lg transition"
              >
                Tìm kiếm
              </button>
            </form>
          </div>
        </div>

        {/* Categories Navigation Bar (Desktop) */}
        <nav className="hidden lg:block border-t border-forest-100 bg-forest-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center justify-between text-sm font-medium text-forest-900 py-2.5">
              <li>
                <Link href="/" className="hover:text-forest-600 transition flex items-center gap-1 py-1 font-semibold">
                  <span>Trang chủ</span>
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/hat-giong-hoa" className="hover:text-forest-600 transition flex items-center gap-1.5 py-1">
                  <span>🌸 Hạt giống hoa</span>
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/hat-giong-rau-cu" className="hover:text-forest-600 transition flex items-center gap-1.5 py-1">
                  <span>🥬 Hạt giống rau</span>
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/hat-giong-cay-canh" className="hover:text-forest-600 transition flex items-center gap-1.5 py-1">
                  <span>🌵 Cây cảnh & Bonsai</span>
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/hat-giong-cay-an-qua" className="hover:text-forest-600 transition flex items-center gap-1.5 py-1">
                  <span>🍅 Cây ăn quả</span>
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/dung-cu-lam-vuon" className="hover:text-forest-600 transition flex items-center gap-1.5 py-1">
                  <span>🪴 Dụng cụ làm vườn</span>
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/dat-trong-vat-tu" className="hover:text-forest-600 transition flex items-center gap-1.5 py-1">
                  <span>🌱 Đất trồng & Vật tư</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-forest-600 transition flex items-center gap-1 py-1 font-medium text-forest-700">
                  <span>Cẩm nang làm vườn</span>
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-forest-600 transition flex items-center gap-1 py-1 font-medium text-forest-700">
                  <span>Liên hệ</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-5/6 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col overflow-y-auto">
            {/* Header Drawer Banner */}
            <div className="p-5 bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 text-white flex items-center justify-between border-b border-forest-800 relative">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Logo Hạt Giống Nhà Vườn"
                  className="h-10 w-auto max-w-[120px] object-contain drop-shadow"
                />
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm font-serif leading-none tracking-tight text-white">
                    HẠT GIỐNG <span className="text-emerald-400 font-sans font-bold">NHÀ VƯỜN</span>
                  </span>
                  <span className="text-[9px] text-emerald-300 font-medium mt-1">
                    Ươm mầm hôm nay – Rực rỡ ngày mai
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-300 hover:text-white rounded-xl bg-forest-800/60 hover:bg-forest-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo tên hạt giống, hoa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>

            {/* Mobile Nav Links */}
            <div className="p-4 flex-1 space-y-6">
              <div>
                <div className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
                  <span>Danh Mục Sản Phẩm</span>
                  <span className="text-[10px] text-slate-400 font-normal">Tất cả {INITIAL_CATEGORIES.length} mục</span>
                </div>
                <ul className="space-y-1">
                  {INITIAL_CATEGORIES.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/danh-muc/${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl text-xs text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 font-bold transition border border-transparent hover:border-emerald-100"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center text-sm shadow-2xs">
                            {cat.icon}
                          </span>
                          <span>{cat.name}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider mb-2 px-1">
                  Hệ Thống & Hỗ Trợ
                </div>
                <ul className="space-y-1 text-xs">
                  <li>
                    <Link
                      href="/tra-cuu-don-hang"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-bold transition"
                    >
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Tra cứu vận trình đơn hàng</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-bold transition"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Cẩm nang gieo trồng hạt giống</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/lien-he"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-bold transition"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>Liên hệ & Cửa hàng</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Mobile Footer Contact */}
            <div className="p-4 bg-gradient-to-b from-slate-50 to-emerald-50/50 border-t border-slate-200/80 text-xs text-slate-600 space-y-2">
              <div className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider">Hỗ Trợ Khách Hàng 24/7</div>
              
              <a 
                href={`tel:${settings.hotline.replace(/\s/g, '')}`} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-600 text-white font-extrabold shadow"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Hotline: {settings.hotline}</span>
                </div>
                <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded-md">GỌI NGAY</span>
              </a>

              <div className="text-[11px] text-slate-500 pt-1">
                📍 {settings.address}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
