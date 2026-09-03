'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Trash2, Plus, Minus, ArrowRight, ShoppingBag, 
  Tag, ShieldCheck, Truck, Sparkles, ChevronRight 
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
    <div className="bg-forest-50/30 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-forest-900">Giỏ hàng của bạn</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-950 font-serif mb-6 flex items-center gap-3">
          <span>Giỏ Hàng ({totalItems} sản phẩm)</span>
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-24 h-24 mx-auto rounded-full bg-forest-50 flex items-center justify-center text-4xl mb-4">
              🌱
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-serif">Giỏ hàng của bạn đang trống</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              Khu vườn của bạn đang chờ đón những mầm hoa rực rỡ và luống rau xanh sạch. Hãy dạo quanh cửa hàng nhé!
            </p>
            <div className="mt-8">
              <Link
                href="/san-pham"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-forest-800 text-white text-xs font-bold hover:bg-forest-900 transition shadow-md"
              >
                <span>Khám phá sản phẩm ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-xs font-bold text-gray-700 uppercase">Chi tiết sản phẩm</span>
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map(({ product, quantity }) => {
                  const price = product.sale_price || product.price;
                  const itemTotal = price * quantity;
                  const img = product.images?.[0] || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80';

                  return (
                    <div key={product.id} className="py-4 flex flex-col sm:flex-row gap-4 items-center">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-forest-50 shrink-0 border">
                        <img src={img} alt={product.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <Link
                          href={`/san-pham/${product.slug}`}
                          className="text-sm font-bold text-gray-900 hover:text-forest-700 transition line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        <div className="text-xs text-forest-700 font-bold mt-1">
                          {formatPrice(price)}
                        </div>
                        {product.origin && (
                          <div className="text-[11px] text-gray-400 mt-0.5">Xuất xứ: {product.origin}</div>
                        )}
                      </div>

                      {/* Quantity counter */}
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-200 text-xs transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-800">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-200 text-xs transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-sm font-extrabold text-forest-900 min-w-[90px] text-right">
                        {formatPrice(itemTotal)}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 transition"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <Link
                  href="/san-pham"
                  className="text-xs font-bold text-forest-700 hover:text-forest-900"
                >
                  ← Tiếp tục mua thêm hạt giống
                </Link>
              </div>
            </div>

            {/* Right: Summary Box */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b">
                Tổng Đơn Hàng
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Mã ưu đãi / Khuyến mãi</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Mã: NHAVUON10, FREESHIP..."
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
                    />
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold rounded-xl transition shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>
                {couponMsg && (
                  <div className={`text-[11px] font-medium ${couponMsg.error ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {couponMsg.text}
                  </div>
                )}
                {couponCode && (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200">
                    <span>Mã <strong>{couponCode}</strong>: -{formatPrice(discount)}</span>
                    <button onClick={removeCoupon} className="text-emerald-900 font-bold hover:underline text-[11px]">
                      Gỡ
                    </button>
                  </div>
                )}
              </form>

              {/* Price Details */}
              <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t">
                <div className="flex justify-between">
                  <span>Tiền hàng:</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-gray-900">
                    {shippingFee === 0 ? <span className="text-emerald-600">Miễn phí</span> : formatPrice(shippingFee)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Giảm giá mã ưu đãi:</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-forest-950 pt-3 border-t border-gray-200">
                  <span>Tổng thanh toán:</span>
                  <span className="text-lg text-forest-800">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/thanh-toan"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-700 hover:from-forest-900 hover:to-forest-800 text-white font-bold text-sm shadow-lg transition"
              >
                <span>TIẾN HÀNH ĐẶT HÀNG</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
