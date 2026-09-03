'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Edit2, Trash2, Eye, Filter, 
  Check, X, Sparkles, Sprout 
} from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { Product, Category } from '@/types/database.types';
import { useToast } from '@/components/providers/ToastProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function AdminProductsPage() {
  const { success, info, error } = useToast();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  useEffect(() => {
    async function loadData() {
      let deletedIds: string[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem('deleted_product_ids') || '[]');
      } catch (e) {}

      let supabaseProds: Product[] = [];
      let supabaseCats: Category[] = [];

      if (isSupabaseConfigured) {
        try {
          const [prodRes, catRes] = await Promise.all([
            supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase.from('categories').select('*').order('sort_order', { ascending: true })
          ]);

          if (catRes.data && catRes.data.length > 0) supabaseCats = catRes.data;
          if (prodRes.data && prodRes.data.length > 0) supabaseProds = prodRes.data;
        } catch (err) {
          console.error('Error fetching admin products:', err);
        }
      }

      if (supabaseCats.length > 0) setCategories(supabaseCats);

      const fetchedMap = new Map(supabaseProds.map((p) => [p.id, p]));
      const combined = [
        ...supabaseProds,
        ...INITIAL_PRODUCTS.filter((p) => !fetchedMap.has(p.id))
      ].filter((p) => !deletedIds.includes(p.id));

      setProducts(combined);
    }
    loadData();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'all' || p.category_id === selectedCat;
    return matchSearch && matchCat;
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) {
      if (isSupabaseConfigured) {
        try {
          await supabase.from('products').delete().eq('id', id);
        } catch (e) {
          console.error('Delete Supabase product error:', e);
        }
      }

      // Save to localStorage deleted IDs list so deleted products never reappear on reload
      try {
        const deleted: string[] = JSON.parse(localStorage.getItem('deleted_product_ids') || '[]');
        if (!deleted.includes(id)) {
          localStorage.setItem('deleted_product_ids', JSON.stringify([...deleted, id]));
        }
      } catch (e) {}

      setProducts((prev) => prev.filter((p) => p.id !== id));
      success(`Đã xóa sản phẩm "${name}" thành công!`);
    }
  };

  const toggleStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: !p.status } : p))
    );
    info('Đã cập nhật trạng thái hiển thị của sản phẩm');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
            Quản Lý Sản Phẩm Hạt Giống 🌱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Danh sách tất cả các loại hạt giống hoa, rau củ quả, cây cảnh và vật tư
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm theo tên hạt giống..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="text-xs font-semibold border rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-forest-600"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Ảnh & Tên Hạt Giống</th>
                <th className="py-3.5 px-6">Giá Bán</th>
                <th className="py-3.5 px-6">Kho</th>
                <th className="py-3.5 px-6">Tỷ Lệ Mầm</th>
                <th className="py-3.5 px-6">Xuất Xứ</th>
                <th className="py-3.5 px-6">Trạng Thái</th>
                <th className="py-3.5 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image_url || prod.images?.[0] || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80'}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover border bg-forest-50 shrink-0"
                      />
                      <div>
                        <Link
                          href={`/san-pham/${prod.slug}`}
                          target="_blank"
                          className="font-bold text-slate-900 hover:text-forest-700 transition line-clamp-1"
                        >
                          {prod.name}
                        </Link>
                        <div className="text-[11px] text-slate-400">Slug: {prod.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="font-extrabold text-forest-800">
                      {formatPrice(prod.sale_price || prod.price)}
                    </div>
                    {prod.sale_price && (
                      <div className="text-[10px] text-slate-400 line-through">
                        {formatPrice(prod.price)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    <span className="font-bold">{prod.stock}</span> gói
                  </td>
                  <td className="py-3 px-6">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold text-[11px] border border-emerald-200">
                      {prod.germination_rate || '> 85%'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-slate-600">{prod.origin || 'Việt Nam'}</td>
                  <td className="py-3 px-6">
                    <button
                      onClick={() => toggleStatus(prod.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                        prod.status
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {prod.status ? '● Đang bán' : '○ Tạm ẩn'}
                    </button>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/san-pham/${prod.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-500 hover:text-forest-800 hover:bg-slate-100 rounded-lg transition"
                        title="Xem trước trên website"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${prod.id}/edit`}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
