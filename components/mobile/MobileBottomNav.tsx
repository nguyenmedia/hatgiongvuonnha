'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sprout, ShoppingBag, Search, Phone, Package, Heart } from 'lucide-react';
import { useCart } from '../providers/CartProvider';
import { useSettings } from '../providers/SettingsProvider';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { settings } = useSettings();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const rawPhone = settings.hotline.replace(/\s/g, '');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl py-1.5 px-2">
      <div className="grid grid-cols-5 items-center justify-items-center text-[10px] font-bold">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            pathname === '/'
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>Trang chủ</span>
        </Link>

        {/* 2. Catalog */}
        <Link
          href="/san-pham"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            pathname === '/san-pham'
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sprout className={`w-5 h-5 ${pathname === '/san-pham' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>Sản phẩm</span>
        </Link>

        {/* 3. Cart Drawer Toggle (Center Highlight) */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-slate-500 hover:text-emerald-700 relative transition"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-2" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow animate-bounce">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          <span>Giỏ hàng</span>
        </button>

        {/* 4. Order Tracking */}
        <Link
          href="/tra-cuu-don-hang"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            pathname === '/tra-cuu-don-hang'
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className={`w-5 h-5 ${pathname === '/tra-cuu-don-hang' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>Tra cứu</span>
        </Link>

        {/* 5. Call Hotline */}
        <a
          href={`tel:${rawPhone}`}
          className="flex flex-col items-center gap-0.5 py-1 px-2 text-emerald-600 hover:text-emerald-700 transition"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center animate-pulse">
            <Phone className="w-3 h-3" />
          </div>
          <span className="text-emerald-700 font-extrabold">Gọi ngay</span>
        </a>
      </div>
    </div>
  );
}
