'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Phone, Mail, MapPin, Clock, Facebook, 
  ShieldCheck, RotateCcw, Truck, Award, Sparkles, Heart 
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '@/lib/constants';
import { useSettings } from '../providers/SettingsProvider';

export function Footer() {
  const pathname = usePathname();
  const { settings } = useSettings();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-forest-950 text-forest-100 relative overflow-hidden border-t-4 border-forest-600">
      {/* Top Value Propositions */}
      <div className="border-b border-forest-900/80 py-10 bg-forest-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-forest-900/30 border border-forest-800/40">
              <div className="w-12 h-12 rounded-xl bg-forest-800 text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Hạt Giống Chuẩn F1</h4>
                <p className="text-xs text-forest-300 mt-0.5">Tỷ lệ nảy mầm cao trên 85%</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-forest-900/30 border border-forest-800/40">
              <div className="w-12 h-12 rounded-xl bg-forest-800 text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Giao Hàng Toàn Quốc</h4>
                <p className="text-xs text-forest-300 mt-0.5">Đóng gói cẩn thận, an toàn</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-forest-900/30 border border-forest-800/40">
              <div className="w-12 h-12 rounded-xl bg-forest-800 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Hướng Dẫn Tận Tình</h4>
                <p className="text-xs text-forest-300 mt-0.5">Đồng hành suốt quá trình trồng</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-forest-900/30 border border-forest-800/40">
              <div className="w-12 h-12 rounded-xl bg-forest-800 text-emerald-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Đổi Trả Uy Tín</h4>
                <p className="text-xs text-forest-300 mt-0.5">Bồi thường nếu hạt lỗi/hỏng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Hạt Giống Nhà Vườn Logo"
                className="w-12 h-12 rounded-full object-contain bg-white p-0.5 border border-forest-700 shadow-md"
              />
              <span className="font-extrabold text-xl tracking-tight text-white font-serif">
                HẠT GIỐNG <span className="text-emerald-400 font-sans">NHÀ VƯỜN</span>
              </span>
            </div>
            <p className="text-xs text-forest-300 leading-relaxed">
              Thương hiệu chuyên cung cấp sỉ và lẻ hạt giống hoa cao cấp, hạt giống rau sạch, cây ăn trái và vật tư nông nghiệp hữu cơ chất lượng hàng đầu.
            </p>
            <div className="pt-2 flex flex-col gap-2.5 text-xs text-forest-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${settings.hotline.replace(/\s/g, '')}`} className="hover:text-white transition">
                  Hotline / Zalo: {settings.hotline}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.working_hours}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-forest-800 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Danh Mục Nổi Bật</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-forest-300">
              {INITIAL_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/danh-muc/${cat.slug}`}
                    className="hover:text-emerald-400 hover:translate-x-1 inline-block transition transform"
                  >
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Support & Policies */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-forest-800 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hỗ Trợ Khách Hàng</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-forest-300">
              <li><Link href="/tra-cuu-don-hang" className="hover:text-emerald-400 transition">🔍 Tra cứu hành trình đơn hàng</Link></li>
              <li><Link href="/gioi-thieu" className="hover:text-emerald-400 transition">🌱 Giới thiệu về Hạt Giống Nhà Vườn</Link></li>
              <li><Link href="/tin-tuc" className="hover:text-emerald-400 transition">📖 Cẩm nang gieo trồng hạt giống</Link></li>
              <li><Link href="/lien-he" className="hover:text-emerald-400 transition">📞 Liên hệ & Bản đồ cửa hàng</Link></li>
            </ul>
          </div>

          {/* Column 4: Facebook Fanpage & Connect */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-forest-800 pb-2">
              Kết Nối Mạng Xã Hội
            </h3>
            <p className="text-xs text-forest-300">
              Theo dõi Fanpage để cập nhật các giống hoa mới và mẹo làm vườn hay nhất mỗi ngày:
            </p>
            <a
              href={settings.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600 hover:text-white transition group"
            >
              <div className="flex items-center gap-2.5">
                <Facebook className="w-5 h-5 text-blue-400 group-hover:text-white" />
                <span className="text-xs font-semibold">{settings.facebook_name}</span>
              </div>
              <span className="text-xs underline group-hover:no-underline">XEM FACEBOOK →</span>
            </a>

            <div className="p-3.5 rounded-xl bg-forest-900/60 border border-forest-800">
              <div className="text-xs font-bold text-emerald-300 mb-1">Tư vấn Zalo 24/7:</div>
              <div className="text-sm font-extrabold text-white tracking-wide">{settings.zalo}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-forest-900 bg-forest-950 py-5 text-center text-xs text-forest-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} 🌱 HẠT GIỐNG NHÀ VƯỜN - Tất cả các quyền được bảo lưu.</p>
          <div className="flex items-center gap-4 text-[11px] text-forest-400">
            <span>58 Lý Chính Thắng, TP. Quảng Ngãi</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Phát triển với <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> và công nghệ Supabase
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
