'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Filter, SlidersHorizontal, Search, ArrowUpDown, 
  Sparkles, Check, ChevronRight, X 
} from 'lucide-react';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/lib/constants';
import { isProductInCategory } from '@/lib/utils';
import { ProductCard } from '@/components/product/ProductCard';
import { Product, Category } from '@/types/database.types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

function ProductListContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCat = searchParams.get('cat') || 'all';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [priceRange, setPriceRange] = useState<'all' | 'under30' | '30to50' | 'above50'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

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
          console.error('Error fetching catalog data:', err);
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

  // Filter and Sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.origin?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((p) => {
        const cat = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
        return cat ? isProductInCategory(p.category_id, cat) : true;
      });
    }

    // Price range filter
    if (priceRange === 'under30') {
      list = list.filter((p) => (p.sale_price || p.price) < 30000);
    } else if (priceRange === '30to50') {
      list = list.filter((p) => {
        const effPrice = p.sale_price || p.price;
        return effPrice >= 30000 && effPrice <= 50000;
      });
    } else if (priceRange === 'above50') {
      list = list.filter((p) => (p.sale_price || p.price) > 50000);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    }

    return list;
  }, [search, selectedCategory, priceRange, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('popular');
  };

  return (
    <div className="bg-forest-50/30 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-forest-900">Tất cả sản phẩm</span>
        </nav>

        {/* Page Header */}
        <div className="bg-gradient-to-r from-forest-900 to-forest-800 text-white p-6 sm:p-8 rounded-3xl mb-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
              🌱 Kho Hạt Giống Thuần Chuẩn F1
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif mt-2">
              Danh Mục Sản Phẩm Nhà Vườn
            </h1>
            <p className="text-xs sm:text-sm text-forest-100/90 mt-2">
              Tất cả các sản phẩm hạt giống hoa, rau sạch, cây ăn trái và vật tư nông nghiệp chính hãng đã được kiểm định chất lượng nảy mầm.
            </p>
          </div>
        </div>

        {/* Layout: Sidebar Filter + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2 font-bold text-forest-900 text-sm">
                <Filter className="w-4 h-4 text-forest-600" />
                <span>Bộ Lọc Sản Phẩm</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-[11px] text-forest-600 hover:underline font-semibold"
              >
                Đặt lại
              </button>
            </div>

            {/* Search filter input */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Tìm kiếm theo tên</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ví dụ: hướng dương, cà chua..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-forest-600 bg-gray-50/50"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Categories filter */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Danh mục</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-forest-800 text-white font-bold'
                      : 'text-gray-600 hover:bg-forest-50'
                  }`}
                >
                  <span>Tất cả danh mục</span>
                  <span>({products.length})</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category_id === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                        selectedCategory === cat.slug
                          ? 'bg-forest-800 text-white font-bold'
                          : 'text-gray-600 hover:bg-forest-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <span>({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Khoảng giá</label>
              <div className="space-y-1 text-xs">
                {[
                  { id: 'all', label: 'Tất cả mức giá' },
                  { id: 'under30', label: 'Dưới 30.000 ₫' },
                  { id: '30to50', label: '30.000 ₫ - 50.000 ₫' },
                  { id: 'above50', label: 'Trên 50.000 ₫' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPriceRange(p.id as any)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                      priceRange === p.id
                        ? 'bg-forest-100 text-forest-900 font-bold border border-forest-300'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{p.label}</span>
                    {priceRange === p.id && <Check className="w-3.5 h-3.5 text-forest-700" />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3 space-y-6">
            {/* Top Toolbar: Filter summary & Sort dropdown */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-gray-600 font-medium">
                Tìm thấy <strong className="text-forest-800 font-bold">{filteredProducts.length}</strong> sản phẩm phù hợp
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Lọc ({filteredProducts.length})</span>
                </button>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 hidden sm:inline">Sắp xếp theo:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs font-semibold text-gray-800 border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-forest-600"
                  >
                    <option value="popular">Bán chạy nhất</option>
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="text-4xl mb-3">🌱</div>
                <h3 className="text-base font-bold text-gray-900">Không tìm thấy sản phẩm nào</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục và khoảng giá khác xem sao nhé!
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 px-6 py-2 rounded-full bg-forest-800 text-white text-xs font-bold hover:bg-forest-900 transition"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl ml-auto p-5 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="font-bold text-base text-gray-900">Bộ Lọc</span>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <span className="text-xs font-bold text-gray-900 block mb-2">Danh mục</span>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategory('all'); setShowMobileFilters(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs ${selectedCategory === 'all' ? 'bg-forest-800 text-white font-bold' : 'text-gray-700'}`}
                >
                  Tất cả danh mục
                </button>
                {INITIAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.slug); setShowMobileFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs ${selectedCategory === cat.slug ? 'bg-forest-800 text-white font-bold' : 'text-gray-700'}`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <span className="text-xs font-bold text-gray-900 block mb-2">Mức giá</span>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'Tất cả mức giá' },
                  { id: 'under30', label: 'Dưới 30.000 ₫' },
                  { id: '30to50', label: '30.000 ₫ - 50.000 ₫' },
                  { id: 'above50', label: 'Trên 50.000 ₫' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPriceRange(p.id as any); setShowMobileFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs ${priceRange === p.id ? 'bg-forest-100 text-forest-900 font-bold' : 'text-gray-700'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductListPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-gray-500">Đang tải danh sách sản phẩm...</div>}>
      <ProductListContent />
    </Suspense>
  );
}
