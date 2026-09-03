'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, Phone, Mail, Clock, Facebook, 
  Send, MessageCircle, CheckCircle2, ChevronRight 
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
    <div className="bg-forest-50/30 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-forest-900">Liên hệ & Cửa hàng</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-serif">Thông Tin Liên Hệ 🌱</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Đội ngũ Hạt Giống Nhà Vườn luôn sẵn sàng tư vấn kỹ thuật gieo trồng và hỗ trợ bạn 24/7.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Địa chỉ cửa hàng & vườn ươm:</h3>
                    <p className="text-gray-600 mt-0.5">{settings.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Hotline tư vấn đặt hàng:</h3>
                    <a href={`tel:${settings.hotline.replace(/\s/g, '')}`} className="text-forest-700 font-bold hover:underline block mt-0.5">
                      {settings.hotline}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-forest-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Tư vấn Zalo 24/7:</h3>
                    <a
                      href={`https://zalo.me/${settings.zalo.replace(/\s/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold hover:underline block mt-0.5"
                    >
                      {settings.zalo} (Nhấn để chat Zalo)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-forest-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Facebook className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Trang Facebook Fanpage:</h3>
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold hover:underline block mt-0.5"
                    >
                      {settings.facebook_name}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Thời gian làm việc:</h3>
                    <p className="text-gray-600 mt-0.5">{settings.working_hours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-forest-950 font-serif pb-3 border-b">
              Gửi Tin Nhắn Cho Chúng Tôi
            </h2>

            {isSent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-emerald-950 text-base">Đã gửi tin nhắn thành công!</h3>
                <p className="text-xs text-emerald-800">
                  Cảm ơn bạn. Chúng tôi sẽ gọi lại hoặc nhắn tin qua Zalo trong thời gian sớm nhất.
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="mt-4 px-5 py-2 rounded-xl bg-forest-800 text-white text-xs font-bold"
                >
                  Gửi lời nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Trần Thị Mai"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs p-3 border rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Số điện thoại / Zalo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ví dụ: 0934 811 307"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs p-3 border rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Nội dung cần tư vấn hoặc đặt hàng sỉ <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Mô tả giống hoa bạn quan tâm, diện tích trồng hoặc câu hỏi kỹ thuật..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs p-3 border rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>GỬI LỜI NHẮN NGAY</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
