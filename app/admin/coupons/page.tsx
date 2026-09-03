'use client';

import React, { useState } from 'react';
import { Tag, Plus, Trash2, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/providers/ToastProvider';

export default function AdminCouponsPage() {
  const { success, info } = useToast();
  const [coupons, setCoupons] = useState([
    { id: 'cp1', code: 'NHAVUON10', type: 'percentage', value: 10, minOrder: 150000, status: true },
    { id: 'cp2', code: 'FREESHIP', type: 'fixed', value: 30000, minOrder: 300000, status: true },
    { id: 'cp3', code: 'CHAOHOMNAY', type: 'fixed', value: 20000, minOrder: 100000, status: true },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(100000);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setCoupons((prev) => [
      ...prev,
      {
        id: 'cp-' + Date.now(),
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        minOrder: Number(minOrder),
        status: true,
      }
    ]);

    success(`Đã tạo mã giảm giá "${code}" thành công!`);
    setShowModal(false);
    setCode('');
  };

  const handleDelete = (id: string, cCode: string) => {
    if (confirm(`Bạn có chắc muốn xóa mã ${cCode}?`)) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      info('Đã xóa mã giảm giá');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
            Quản Lý Mã Giảm Giá 🎟️
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập mã khuyến mãi chiết khấu % hoặc miễn phí vận chuyển cho khách
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Mã Ưu Đãi Mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900 font-mono tracking-wide">{c.code}</div>
                  <div className="text-[11px] text-slate-400">
                    {c.type === 'percentage' ? `Giảm ${c.value}% giá trị đơn` : `Giảm ${formatPrice(c.value)}`}
                  </div>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                Đang áp dụng
              </span>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
              Đơn hàng tối thiểu: <strong>{formatPrice(c.minOrder)}</strong>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => handleDelete(c.id, c.code)}
                className="text-rose-600 hover:text-rose-800 text-xs font-semibold p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-sm font-bold text-slate-900">Tạo Mã Giảm Giá Mới</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã code (Viết hoa)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: FLOWER20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loại chiết khấu</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giá trị giảm</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Đơn hàng tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl bg-slate-50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-forest-800 text-white font-bold"
                >
                  Tạo mã
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
