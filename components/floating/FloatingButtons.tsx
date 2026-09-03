'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, ArrowUp, Facebook } from 'lucide-react';
import { useSettings } from '../providers/SettingsProvider';

export function FloatingButtons() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const [showScrollTop, setShowScrollTop] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rawPhone = settings.hotline.replace(/\s/g, '');
  const rawZalo = settings.zalo.replace(/\s/g, '');

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="pointer-events-auto w-11 h-11 bg-white hover:bg-emerald-50 text-emerald-800 rounded-full shadow-lg border border-slate-200 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Lên đầu trang"
          title="Lên đầu trang"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Facebook Messenger Floating Button */}
      <a
        href={settings.facebook_url}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto group flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white p-2.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        title="Chat Facebook"
      >
        <span className="hidden group-hover:inline-block text-xs font-bold pl-2.5 pr-1 whitespace-nowrap animate-in fade-in slide-in-from-right-2">
          Chat Facebook
        </span>
        <div className="w-6 h-6 flex items-center justify-center">
          <Facebook className="w-5 h-5 fill-white" />
        </div>
      </a>

      {/* Zalo Floating Button */}
      <a
        href={`https://zalo.me/${rawZalo}`}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto group flex items-center gap-2 bg-[#0068FF] hover:bg-[#005bd4] text-white p-2.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative"
        title={`Chat Zalo: ${settings.zalo}`}
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-300"></span>
        </span>
        <span className="hidden group-hover:inline-block text-xs font-bold pl-2.5 pr-1 whitespace-nowrap animate-in fade-in slide-in-from-right-2">
          Zalo: {settings.zalo}
        </span>
        <div className="w-6 h-6 rounded-full bg-white text-[#0068FF] flex items-center justify-center font-extrabold text-xs leading-none shadow-2xs">
          Z
        </div>
      </a>

      {/* Phone Call Hotline Floating Button */}
      <a
        href={`tel:${rawPhone}`}
        className="pointer-events-auto group flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 relative"
        title={`Gọi Hotline: ${settings.hotline}`}
      >
        <span className="hidden group-hover:inline-block text-xs font-extrabold pl-2.5 pr-1 whitespace-nowrap animate-in fade-in slide-in-from-right-2">
          Hotline: {settings.hotline}
        </span>
        <div className="w-6 h-6 flex items-center justify-center">
          <Phone className="w-5 h-5 animate-pulse" />
        </div>
      </a>
    </div>
  );
}
