'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Truck, CreditCard, Banknote, 
  Sparkles, CheckCircle2, ChevronRight, AlertCircle, QrCode 
} from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { formatPrice, isValidUUID } from '@/lib/utils';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, shippingFee, discount, couponCode, finalTotal, clearCart } = useCart();
  const { error: toastError, success: toastSuccess } = useToast();

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    province: 'Quảng Ngãi',
    district: '',
    address: '',
    note: '',
    payment_method: 'cod' as 'cod' | 'bank_transfer',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="bg-forest-50/30 min-h-screen py-16">
        <div className="max-w-md mx-auto px-4 text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-4xl mb-3">🌱</div>
          <h2 className="text-lg font-bold text-gray-900 font-serif">Giỏ hàng của bạn đang trống</h2>
          <p className="text-xs text-gray-500 mt-2">Vui lòng thêm hạt giống vào giỏ hàng trước khi thanh toán.</p>
          <Link
            href="/san-pham"
            className="mt-6 inline-block px-6 py-2.5 rounded-full bg-forest-800 text-white text-xs font-bold"
          >
            Mua hạt giống ngay
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toastError('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        subtotal,
        shipping_fee: shippingFee,
        discount,
        total: finalTotal,
        items: cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.images?.[0] || null,
          price: item.product.sale_price || item.product.price,
          quantity: item.quantity,
          total: (item.product.sale_price || item.product.price) * item.quantity,
        })),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        const orderCode = resData.order_code || resData.order?.order_code;
        const orderId = resData.order?.id || crypto.randomUUID();

        const fullOrderObj = {
          id: orderId,
          order_code: orderCode,
          customer_name: formData.customer_name,
          phone: formData.phone,
          email: formData.email || null,
          province: formData.province || null,
          district: formData.district || null,
          address: formData.address,
          note: formData.note || null,
          subtotal,
          shipping_fee: shippingFee,
          discount,
          total: finalTotal,
          payment_method: formData.payment_method,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: cart.map((item) => ({
            product_id: item.product.id,
            product_name: item.product.name,
            product_image: item.product.image_url || item.product.images?.[0] || null,
            price: item.product.sale_price || item.product.price,
            quantity: item.quantity,
            total: (item.product.sale_price || item.product.price) * item.quantity,
          })),
        };

        // 1. Save to LocalStorage for Admin & Order Tracking sync
        try {
          const existing = JSON.parse(localStorage.getItem('all_placed_orders') || '[]');
          localStorage.setItem('all_placed_orders', JSON.stringify([fullOrderObj, ...existing]));
        } catch (e) {
          console.error('LocalStorage order save error:', e);
        }

        // 2. Direct client backup upsert to Supabase (orders + order_items)
        if (isSupabaseConfigured) {
          try {
            const { error: ordErr } = await supabase.from('orders').upsert({
              id: orderId,
              order_code: orderCode,
              customer_name: formData.customer_name,
              phone: formData.phone,
              email: formData.email || null,
              province: formData.province || null,
              district: formData.district || null,
              address: formData.address,
              note: formData.note || null,
              subtotal,
              shipping_fee: shippingFee,
              discount,
              total: finalTotal,
              payment_method: formData.payment_method,
              status: 'pending',
            });

            if (!ordErr) {
              const orderItemsPayload = cart.map((item) => {
                const rawPid = item.product.id;
                return {
                  order_id: orderId,
                  product_id: (rawPid && isValidUUID(rawPid)) ? rawPid : null,
                  product_name: item.product.name,
                  product_image: item.product.image_url || item.product.images?.[0] || null,
                  price: item.product.sale_price || item.product.price,
                  quantity: item.quantity,
                  total: (item.product.sale_price || item.product.price) * item.quantity,
                };
              });

              await supabase.from('order_items').insert(orderItemsPayload);
            } else {
              console.warn('[Client Supabase Order Insert Warning]:', ordErr.message);
            }
          } catch (syncErr) {
            console.error('Client-side order sync error:', syncErr);
          }
        }

        toastSuccess('Đặt hàng thành công!');
        clearCart();
        
        // Save to my_placed_order_codes so Account page only displays this customer's own orders
        try {
          const myCodes: string[] = JSON.parse(localStorage.getItem('my_placed_order_codes') || '[]');
          if (!myCodes.includes(orderCode)) {
            myCodes.push(orderCode);
            localStorage.setItem('my_placed_order_codes', JSON.stringify(myCodes));
          }
          localStorage.setItem('customer_phone', formData.phone);
          localStorage.setItem('customer_name', formData.customer_name);
        } catch (e) {}

        // Store temporary order info for success page
        sessionStorage.setItem('last_order', JSON.stringify({
          order_code: orderCode,
          customer_name: formData.customer_name,
          phone: formData.phone,
          address: formData.address,
          total: finalTotal,
          payment_method: formData.payment_method,
        }));
        router.push(`/dat-hang-thanh-cong?code=${orderCode}`);
      } else {
        toastError(resData.error || 'Có lỗi xảy ra khi tạo đơn hàng.');
      }
    } catch (err: any) {
      console.error(err);
      toastError('Không thể kết nối đến máy chủ. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // VietQR URL builder for bank transfer
  const vietQrUrl = `https://img.vietqr.io/image/MB-0934811307-compact2.png?amount=${finalTotal}&addInfo=HG%20DH&accountName=HAT%20GIONG%20NHA%20VUON`;

  return (
    <div className="bg-[#f8faf7] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition flex items-center gap-1">
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/gio-hang" className="hover:text-forest-700 transition">Giỏ hàng</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-extrabold text-forest-900">Thanh toán đơn hàng</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-950 font-serif mb-8 flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-forest-700" />
          <span>Thông Tin Giao Hàng &amp; Thanh Toán 📦</span>
        </h1>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Shipping Details & Payment Option */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Customer Info Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/8 shadow-2xs space-y-4">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest-800 text-white flex items-center justify-center text-xs font-black shadow-xs">1</span>
                <span>Thông Tin Người Nhận Hàng</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1.5">
                    Họ và tên quý khách <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1.5">
                    Số điện thoại nhận hàng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Ví dụ: 0905 123 456"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Địa chỉ Email (để nhận xác nhận đơn nếu có)
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Tỉnh / Thành phố <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="province"
                    required
                    placeholder="Tỉnh/Thành phố"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full text-xs p-3 border rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    name="district"
                    placeholder="Quận/Huyện"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full text-xs p-3 border rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Địa chỉ chi tiết (Số nhà, tên đường, thôn/xã) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Ví dụ: 58 Lý Chính Thắng..."
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full text-xs p-3 border rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Ghi chú cho shipper (ví dụ: giao giờ hành chính, gọi trước khi giao)
                </label>
                <textarea
                  name="note"
                  rows={2}
                  placeholder="Ghi chú đơn hàng..."
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full text-xs p-3 border rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>

            {/* Payment Method Option */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-forest-950 uppercase tracking-wider pb-3 border-b flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest-800 text-white flex items-center justify-center text-xs">2</span>
                <span>Phương Thức Thanh Toán</span>
              </h2>

              <div className="space-y-3">
                {/* Option 1: COD */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition cursor-pointer ${
                    formData.payment_method === 'cod'
                      ? 'border-forest-700 bg-forest-50/60'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={formData.payment_method === 'cod'}
                    onChange={() => setFormData((prev) => ({ ...prev, payment_method: 'cod' }))}
                    className="mt-0.5 text-forest-800 focus:ring-forest-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-forest-700" />
                      <span className="text-xs font-bold text-gray-900">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Bạn chỉ cần thanh toán tiền mặt cho nhân viên giao hàng sau khi nhận và kiểm tra gói hạt giống.
                    </p>
                  </div>
                </label>

                {/* Option 2: Bank Transfer QR */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition cursor-pointer ${
                    formData.payment_method === 'bank_transfer'
                      ? 'border-forest-700 bg-forest-50/60'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="bank_transfer"
                    checked={formData.payment_method === 'bank_transfer'}
                    onChange={() => setFormData((prev) => ({ ...prev, payment_method: 'bank_transfer' }))}
                    className="mt-0.5 text-forest-800 focus:ring-forest-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-forest-700" />
                      <span className="text-xs font-bold text-gray-900">
                        Chuyển khoản Ngân hàng (Quét mã VietQR tự động)
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Quét mã QR tự động điền số tiền và nội dung qua ứng dụng ngân hàng của bạn.
                    </p>

                    {formData.payment_method === 'bank_transfer' && (
                      <div className="mt-4 p-4 rounded-xl bg-white border border-forest-200 text-xs space-y-3">
                        <div className="flex items-center justify-between text-forest-900 font-bold">
                          <span>Ngân hàng Quân Đội (MB Bank)</span>
                          <span className="text-emerald-700">0934 811 307</span>
                        </div>
                        <div className="text-[11px] text-gray-600">
                          Chủ tài khoản: <strong>HAT GIONG NHA VUON</strong>
                        </div>
                        <div className="text-center py-2 bg-gray-50 rounded-lg">
                          <img
                            src={vietQrUrl}
                            alt="VietQR MB Bank"
                            className="w-44 h-44 mx-auto object-contain rounded-lg border shadow-sm"
                          />
                          <p className="text-[10px] text-gray-400 mt-1.5">
                            Quét mã QR bằng App Ngân hàng bất kỳ
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-forest-950 uppercase tracking-wider pb-3 border-b">
                Đơn Hàng Của Bạn ({cart.length} món)
              </h2>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
                {cart.map(({ product, quantity }) => {
                  const price = product.sale_price || product.price;
                  return (
                    <div key={product.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-forest-100 text-forest-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {quantity}x
                        </span>
                        <span className="text-xs font-semibold text-gray-800 truncate">
                          {product.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-forest-800 shrink-0">
                        {formatPrice(price * quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-gray-600 pt-3 border-t">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-gray-900">
                    {shippingFee === 0 ? <span className="text-emerald-600 font-bold">Miễn phí</span> : formatPrice(shippingFee)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Mã ưu đãi ({couponCode}):</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-forest-950 pt-3 border-t border-gray-200">
                  <span>Tổng thanh toán:</span>
                  <span className="text-lg text-forest-800">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-forest-700 hover:from-emerald-700 hover:to-forest-800 text-white font-extrabold text-sm shadow-xl shadow-forest-900/20 transform hover:-translate-y-0.5 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý đơn hàng...</span>
                  </div>
                ) : (
                  <>
                    <span>🔥 ĐẶT HÀNG NGAY</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-gray-400 space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Bảo mật dữ liệu khách hàng 100%</span>
                </div>
                <div>Đơn hàng sẽ được nhân viên gọi xác nhận trong vòng 15-30 phút.</div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
