'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, Sparkles, Phone, Package, 
  ArrowRight, Home, ShieldCheck, Heart 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'HG' + Math.floor(100000 + Math.random() * 900000);
  const [lastOrder, setLastOrder] = useState<any>(null);

  useEffect(() => {
    // Fire festive confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2d6a4f', '#52b788', '#d97706', '#f43f5e', '#3b82f6'],
      });
    } catch (e) {
      // ignore
    }

    try {
      const stored = sessionStorage.getItem('last_order');
      if (stored) {
        setLastOrder(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="bg-forest-50/40 min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-100 shadow-xl text-center relative overflow-hidden">
          {/* Top Decorative Sparkle */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-600 to-forest-800 text-white flex items-center justify-center shadow-lg mb-6 transform -rotate-3 hover:rotate-0 transition">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            Xác Nhận Đơn Hàng
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-950 font-serif mt-3 mb-2">
            🎉 ĐẶT HÀNG THÀNH CÔNG!
          </h1>

          <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            Cảm ơn quý khách đã tin tưởng và mua hàng tại:<br />
            <strong className="text-forest-800 font-bold text-base font-serif">🌱 HẠT GIỐNG NHÀ VƯỜN</strong><br />
            Chúng tôi sẽ liên hệ với quý khách sớm nhất để xác nhận và đóng gói giao hàng.
          </p>

          {/* Order Details Card */}
          <div className="mt-8 p-6 rounded-2xl bg-forest-50/60 border border-forest-100 text-left text-xs space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-forest-200">
              <span className="text-gray-500">Mã đơn hàng:</span>
              <span className="font-extrabold text-sm text-forest-900 bg-white px-2.5 py-1 rounded-lg border border-forest-300">
                #{code}
              </span>
            </div>

            {lastOrder && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Người nhận:</span>
                  <span className="font-bold text-gray-800">{lastOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số điện thoại:</span>
                  <span className="font-bold text-gray-800">{lastOrder.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Địa chỉ:</span>
                  <span className="font-bold text-gray-800 text-right max-w-xs">{lastOrder.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phương thức:</span>
                  <span className="font-bold text-gray-800">
                    {lastOrder.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản Ngân hàng (VietQR)'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-forest-200 text-sm font-extrabold text-forest-950">
                  <span>Tổng thanh toán:</span>
                  <span className="text-forest-700">{formatPrice(lastOrder.total)}</span>
                </div>
              </>
            )}
          </div>

          {/* Next Steps Guide */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-3">
            <Phone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Nhân viên CSKH sẽ gọi điện từ số <strong>{DEFAULT_SETTINGS.hotline}</strong> trong ít phút tới để xác nhận thông tin đơn hàng và gửi hạt giống đi sớm nhất.
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow-md"
            >
              <Home className="w-4 h-4" />
              <span>Về trang chủ</span>
            </Link>

            <Link
              href="/san-pham"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-gray-50 text-forest-800 border border-forest-600 text-xs font-bold transition"
            >
              <span>Xem thêm hạt giống khác</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Đang tải thông tin đơn hàng...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
