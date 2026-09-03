'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Tag } from 'lucide-react';
import { useCart } from '../providers/CartProvider';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
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

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    setCouponMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setInputCoupon('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 bg-forest-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold">Giỏ Hàng Của Bạn ({totalItems})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-gray-300 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body: Items list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-forest-50 flex items-center justify-center text-3xl mb-4">
                  🌱
                </div>
                <h3 className="text-base font-bold text-gray-900">Giỏ hàng đang trống</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Hãy khám phá các loại hạt giống hoa và rau sạch tươi tốt cho khu vườn nhà bạn nhé!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest-800 text-white text-xs font-bold hover:bg-forest-900 transition"
                >
                  Khám phá sản phẩm
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map(({ product, quantity }) => {
                  const price = product.sale_price || product.price;
                  const itemTotal = price * quantity;
                  const img = product.images?.[0] || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80';

                  return (
                    <div key={product.id} className="py-3.5 flex gap-3.5 items-center">
                      <img
                        src={img}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-forest-50 shrink-0 border"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/san-pham/${product.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-xs font-bold text-gray-900 hover:text-forest-700 truncate block"
                        >
                          {product.name}
                        </Link>
                        <div className="text-xs font-semibold text-forest-700 mt-0.5">
                          {formatPrice(price)}
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 text-xs transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-gray-800">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 text-xs transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-[11px] font-bold text-gray-700 ml-auto">
                            {formatPrice(itemTotal)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 transition"
                        title="Xóa món này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drawer Footer: Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-forest-50/70 border-t border-forest-100 space-y-3">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Mã giảm giá (ví dụ: NHAVUON10, FREESHIP)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-forest-600 bg-white"
                  />
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-lg transition shrink-0"
                >
                  Áp dụng
                </button>
              </form>

              {couponMsg && (
                <div className={`text-[11px] font-medium ${couponMsg.error ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {couponMsg.text}
                </div>
              )}

              {couponCode && (
                <div className="flex items-center justify-between text-xs bg-emerald-100/70 text-emerald-800 p-2 rounded-lg">
                  <span>Mã <strong>{couponCode}</strong>: -{formatPrice(discount)}</span>
                  <button onClick={removeCoupon} className="text-emerald-900 font-bold hover:underline text-[11px]">
                    Gỡ bỏ
                  </button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
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
                    <span>Giảm giá:</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-forest-950 pt-2 border-t border-gray-300">
                  <span>Tổng thanh toán:</span>
                  <span className="text-base text-forest-700">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/gio-hang"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full text-center py-2.5 px-3 rounded-xl border border-forest-600 text-forest-800 text-xs font-bold hover:bg-forest-100 transition"
                >
                  Xem giỏ hàng
                </Link>
                <Link
                  href="/thanh-toan"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-md transition"
                >
                  <span>Thanh toán</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
