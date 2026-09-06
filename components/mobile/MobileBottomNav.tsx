'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sprout, ShoppingBag, Package, Phone, Heart } from 'lucide-react';
import { useCart } from '../providers/CartProvider';
import { useWishlist } from '../providers/WishlistProvider';
import { useSettings } from '../providers/SettingsProvider';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlist } = useWishlist();
  const { settings } = useSettings();

  if (pathname?.startsWith('/admin')) return null;

  const rawPhone = settings.hotline.replace(/\s/g, '');

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <>
      {/* Safe-area spacer */}
      <div className="lg:hidden h-16" />

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        aria-label="Điều hướng chính mobile"
      >
        {/* Pill shadow bar */}
        <div className="bg-white border-t border-[#E3ECE6] shadow-[0_-4px_24px_rgba(6,59,32,0.08)]">
          <div className="grid grid-cols-5 h-[58px]">

            {/* 1. Home */}
            <Link
              href="/"
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                isActive('/') ? 'text-[#07552D]' : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Trang chủ"
            >
              {isActive('/') && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-[#07552D] rounded-b-full" />
              )}
              <Home
                className={`w-[22px] h-[22px] transition-all ${
                  isActive('/') ? 'stroke-[2.5]' : 'stroke-[1.8]'
                }`}
              />
              <span className={`text-[10px] font-semibold leading-none ${isActive('/') ? 'font-extrabold' : ''}`}>
                Trang chủ
              </span>
            </Link>

            {/* 2. Products */}
            <Link
              href="/san-pham"
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                isActive('/san-pham') || isActive('/danh-muc') ? 'text-[#07552D]' : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Sản phẩm"
            >
              {(isActive('/san-pham') || isActive('/danh-muc')) && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-[#07552D] rounded-b-full" />
              )}
              <Sprout
                className={`w-[22px] h-[22px] transition-all ${
                  isActive('/san-pham') || isActive('/danh-muc') ? 'stroke-[2.5]' : 'stroke-[1.8]'
                }`}
              />
              <span className={`text-[10px] font-semibold leading-none ${isActive('/san-pham') || isActive('/danh-muc') ? 'font-extrabold' : ''}`}>
                Sản phẩm
              </span>
            </Link>

            {/* 3. Cart — Center CTA */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Giỏ hàng${totalItems > 0 ? ` (${totalItems} sản phẩm)` : ''}`}
              className="flex flex-col items-center justify-center gap-0.5 relative"
            >
              {/* Floating pill */}
              <div className="relative -mt-5 w-[52px] h-[52px] rounded-2xl bg-[#07552D] shadow-[0_4px_16px_rgba(7,85,45,0.35)] flex items-center justify-center border-[3px] border-white">
                <ShoppingBag className="w-6 h-6 text-[#F5B82E] stroke-[2]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#F5B82E] text-[#063B20] text-[9.5px] font-extrabold rounded-full flex items-center justify-center px-0.5 leading-none border-2 border-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold text-slate-400 leading-none mt-0.5">
                {totalItems > 0 ? `${totalItems} món` : 'Giỏ hàng'}
              </span>
            </button>

            {/* 4. Wishlist */}
            <Link
              href="/yeu-thich"
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                isActive('/yeu-thich') ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Yêu thích"
            >
              {isActive('/yeu-thich') && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-rose-500 rounded-b-full" />
              )}
              <div className="relative">
                <Heart
                  className={`w-[22px] h-[22px] transition-all ${
                    isActive('/yeu-thich') ? 'stroke-[2.5] fill-rose-500' : 'stroke-[1.8]'
                  }`}
                />
                {totalWishlist > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] bg-rose-500 text-white text-[8.5px] font-extrabold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {totalWishlist}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold leading-none ${isActive('/yeu-thich') ? 'font-extrabold text-rose-500' : ''}`}>
                Yêu thích
              </span>
            </Link>

            {/* 5. Call Hotline */}
            <a
              href={`tel:${rawPhone}`}
              className="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-[#07552D] transition-colors"
              aria-label={`Gọi hotline ${settings.hotline}`}
            >
              <div className="relative w-[22px] h-[22px]">
                <div className="absolute inset-0 bg-[#07552D]/20 rounded-full animate-ping" />
                <div className="relative w-full h-full rounded-full bg-[#07552D] flex items-center justify-center">
                  <Phone className="w-3 h-3 text-white stroke-[2.5]" />
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#07552D] leading-none">Gọi ngay</span>
            </a>

          </div>
        </div>
      </nav>
    </>
  );
}
