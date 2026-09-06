'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, Phone, Mail, Clock, Facebook, 
  Send, MessageCircle, CheckCircle2, ChevronRight, Home, Sparkles, ShieldCheck
} from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { useSettings } from '@/components/providers/SettingsProvider';

export default function ContactPage() {
  const { success } = useToast();
  const { settings } = useSettings();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setIsSent(true);
    success('Cảm ơn bạn! Đội ngũ Hạt Giống Nhà Vườn đã nhận được tin nhắn và sẽ phản hồi sớm nhất.');
    setName('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="bg-[#f8faf7] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-extrabold text-forest-900">Liên hệ &amp; Địa chỉ vườn ươm</span>
        </nav>

        {/* Page Banner */}
        <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-emerald-950 text-white p-8 sm:p-12 rounded-3xl mb-10 shadow-xl relative overflow-hidden border border-forest-800">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-black mb-3 border border-emerald-500/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hỗ Trợ Kỹ Thuật Gieo Trồng &amp; Đặt Hàng 24/7</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-serif mt-2 text-white">
              Liên Hệ Hạt Giống Nhà Vườn 🌱
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-2.5 leading-relaxed">
              Bạn cần tư vấn chủng loại giống hoa ban công, mùa vụ gieo trồng hay báo giá sỉ đại lý? Đội ngũ kỹ sư của chúng tôi luôn sẵn sàng hỗ trợ bạn.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/8 shadow-2xs space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-serif">Thông Tin Cửa Hàng</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Địa chỉ vườn ươm &amp; kho xuất hàng đi toàn quốc
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-forest-50/70 border border-emerald-950/5">
                  <div className="w-10 h-10 rounded-xl bg-forest-800 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900">Địa chỉ vườn ươm:</h3>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{settings.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-forest-50/70 border border-emerald-950/5">
                  <div className="w-10 h-10 rounded-xl bg-forest-800 text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900">Hotline tư vấn kỹ thuật:</h3>
                    <a href={`tel:${settings.hotline.replace(/\s/g, '')}`} className="text-forest-800 font-black hover:underline block mt-0.5 text-sm">
                      {settings.hotline}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <div className="w-10 h-10 rounded-xl bg-[#0068FF] text-white flex items-center justify-center shrink-0 shadow-xs font-black">
                    Z
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900">Tư vấn Zalo 24/7:</h3>
                    <a
                      href={`https://zalo.me/${settings.zalo.replace(/\s/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-700 font-black hover:underline block mt-0.5 text-sm"
                    >
                      {settings.zalo} (Nhấn mở Zalo)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Facebook className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900">Facebook Fanpage:</h3>
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 font-bold hover:underline block mt-0.5"
                    >
                      {settings.facebook_name}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900">Thời gian mở cửa:</h3>
                    <p className="text-slate-600 mt-0.5">{settings.working_hours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/8 shadow-2xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-serif pb-2 border-b border-slate-100">
                Gửi Lời Nhắn Trực Tuyến
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Để lại thông tin và yêu cầu của bạn, chúng tôi sẽ gọi lại tư vấn chỉ sau 15 phút!
              </p>
            </div>

            {isSent ? (
              <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-emerald-950 text-base">Đã gửi tin nhắn thành công!</h3>
                <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                  Cảm ơn bạn đã liên hệ. Kỹ sư nông nghiệp của Hạt Giống Nhà Vườn sẽ liên hệ với bạn trong thời gian sớm nhất.
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="mt-4 px-6 py-2.5 rounded-2xl bg-forest-800 text-white text-xs font-extrabold hover:bg-forest-900 transition shadow"
                >
                  Gửi thêm câu hỏi khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-800 block mb-1.5">
                      Họ và tên quý khách <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Thị Hoa"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-800 block mb-1.5">
                      Số điện thoại / Zalo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ví dụ: 0934 811 307"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1.5">
                    Nội dung cần tư vấn gieo trồng hoặc đặt hàng sỉ <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Mô tả loại hạt giống bạn quan tâm, diện tích ban công/sân vườn hoặc câu hỏi kỹ thuật..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-900 hover:to-forest-950 text-white text-xs font-black tracking-wide transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>GỬI YÊU CẦU TƯ VẤN NGAY</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

