'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Trash2, Plus, Minus, ArrowRight, ShoppingBag, 
  Tag, ShieldCheck, Truck, Sparkles, ChevronRight, CheckCircle2, RotateCcw, Home
} from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const {
    cart,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    shippingFee,
    discount,
    couponCode,
    applyCoupon,
    removeCoupon,
    finalTotal,
    totalItems,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    setCouponMsg({ text: res.message, error: !res.success });
    if (res.success) setInputCoupon('');
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
          <span className="font-extrabold text-forest-900">Giỏ hàng của bạn</span>
        </nav>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-950 font-serif flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-forest-700" />
            <span>Giỏ Hàng Của Bạn ({totalItems} món)</span>
          </h1>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:underline font-bold flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ giỏ hàng</span>
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-emerald-950/8 shadow-2xs max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-forest-50 flex items-center justify-center text-4xl mb-4 shadow-inner">
              🌱
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Giỏ hàng đang trống</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Khu vườn của bạn đang chờ đón những mầm hoa rực rỡ và luống rau xanh sạch chuẩn F1. Hãy dạo quanh cửa hàng chọn giống nhé!
            </p>
            <div className="mt-8">
              <Link
                href="/san-pham"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-900 text-white text-xs font-extrabold hover:from-forest-900 hover:to-forest-950 transition shadow-md active:scale-95"
              >
                <span>Khám phá hạt giống ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Cart Items List */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/8 shadow-2xs space-y-6">
              <div className="divide-y divide-slate-100">
                {cart.map(({ product, quantity }) => {
                  const price = product.sale_price || product.price;
                  const itemTotal = price * quantity;
                  const img = product.images?.[0] || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80';

                  return (
                    <div key={product.id} className="py-5 flex flex-col sm:flex-row gap-4 items-center group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-forest-50 shrink-0 border border-slate-200">
                        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>

                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <Link
                          href={`/san-pham/${product.slug}`}
                          className="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-forest-700 transition line-clamp-2 leading-snug"
                        >
                          {product.name}
                        </Link>
                        <div className="text-xs text-forest-800 font-extrabold mt-1">
                          {formatPrice(price)}
                        </div>
                        {product.germination_rate && (
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">🌱 Tỷ lệ mầm: {product.germination_rate}</div>
                        )}
                      </div>

                      {/* Quantity counter */}
                      <div className="flex items-center border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-inner">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-3 py-2 text-slate-600 hover:bg-slate-200 text-xs transition active:scale-95"
                          aria-label="Giảm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-black text-slate-900 min-w-[28px] text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-3 py-2 text-slate-600 hover:bg-slate-200 text-xs transition active:scale-95"
                          aria-label="Tăng"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-sm font-black text-forest-800 min-w-[100px] text-right font-sans">
                        {formatPrice(itemTotal)}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Xóa sản phẩm"
                        aria-label="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/san-pham"
                  className="text-xs font-extrabold text-forest-700 hover:text-forest-900 flex items-center gap-1.5 transition"
                >
                  <span>← Tiếp tục chọn thêm hạt giống khác</span>
                </Link>
              </div>
            </div>

            {/* Right: Summary Box */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-950/8 shadow-2xs space-y-5">
                <h2 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 uppercase tracking-wider text-xs">
                  Tóm Tắt Đơn Hàng
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính tiền hàng:</span>
                    <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển:</span>
                    <span className="font-bold text-slate-900">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">MIỄN PHÍ SHIP</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl">
                      <span>Giảm giá khuyến mãi ({couponCode}):</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="font-black text-slate-900 text-sm">Tổng thanh toán:</span>
                    <span className="font-black text-xl text-forest-800 font-sans">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Coupon Box */}
                <form onSubmit={handleApplyCoupon} className="pt-2 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Mã voucher giảm giá..."
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 font-bold uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-extrabold transition shrink-0"
                    >
                      Áp dụng
                    </button>
                  </div>

                  {couponMsg && (
                    <div className={`text-[11px] font-bold ${couponMsg.error ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {couponMsg.text}
                    </div>
                  )}

                  {couponCode && (
                    <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200">
                      <span>Mã <strong>{couponCode}</strong>: -{formatPrice(discount)}</span>
                      <button onClick={removeCoupon} className="text-emerald-900 font-bold hover:underline text-[11px]">
                        Gỡ mã
                      </button>
                    </div>
                  )}
                </form>

                {/* Checkout CTA */}
                <Link
                  href="/thanh-toan"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-900 hover:to-forest-950 text-white font-extrabold text-xs sm:text-sm text-center shadow-lg transition flex items-center justify-center gap-2 tracking-wide active:scale-95"
                >
                  <span>TIẾN HÀNH ĐẶT HÀNG</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust Features Badge */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-forest-50 to-emerald-50 border border-emerald-100 space-y-3 text-xs text-forest-950">
                <div className="flex items-center gap-2.5 font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Cam kết hạt giống thuần F1 nảy mầm cao</span>
                </div>
                <div className="flex items-center gap-2.5 font-bold">
                  <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Miễn phí giao hàng cho đơn từ 300.000 ₫</span>
                </div>
                <div className="flex items-center gap-2.5 font-bold">
                  <RotateCcw className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Đổi trả 1-1 miễn phí nếu hạt hỏng hoặc không mầm</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
