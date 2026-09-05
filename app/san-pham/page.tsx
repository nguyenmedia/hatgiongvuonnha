'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Filter, SlidersHorizontal, Search, ArrowUpDown, 
  Sparkles, Check, ChevronRight, X, Home, Flame 
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
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    } else {
      list.sort((a, b) => ((b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0)));
    }

    return list;
  }, [search, selectedCategory, priceRange, sortBy, products, categories]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('popular');
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
          <span className="font-bold text-forest-900">Tất cả sản phẩm hạt giống</span>
        </nav>

        {/* Luxury Hero Banner */}
        <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-emerald-950 text-white p-6 sm:p-10 rounded-3xl mb-8 shadow-xl relative overflow-hidden border border-forest-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
            <img
              src="/images/hero_vegetable_garden.jpg"
              alt="Botanical Garden"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Kho Hạt Giống Thuần F1 Kháng Sâu Bệnh</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-white">
              Cửa Hàng Hạt Giống &amp; Vật Tư Làm Vườn
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
              Tuyển chọn hơn 500+ loại hạt giống hoa, rau củ quả sạch và giá thể dinh dưỡng cao cấp. Đầy đủ tem nhãn và hướng dẫn gieo trồng chi tiết.
            </p>
          </div>
        </div>

        {/* Layout: Sidebar Filter + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-emerald-950/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-forest-900 text-sm">
                <Filter className="w-4 h-4 text-forest-600" />
                <span>Bộ Lọc Sản Phẩm</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-[11px] text-forest-700 hover:underline font-bold"
              >
                Đặt lại
              </button>
            </div>

            {/* Search filter input */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Tìm kiếm theo tên</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ví dụ: hướng dương, cà chua..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Categories filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Danh mục hạt giống</label>
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-forest-800 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-forest-50'
                  }`}
                >
                  <span>Tất cả danh mục</span>
                  <span className="text-[10px] opacity-80">({products.length})</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => isProductInCategory(p.category_id, cat)).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                        selectedCategory === cat.slug
                          ? 'bg-forest-800 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-forest-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span>{cat.icon || '🌱'}</span>
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <span className="text-[10px] opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Khoảng giá</label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'all', label: 'Tất cả mức giá' },
                  { id: 'under30', label: 'Dưới 30.000 ₫' },
                  { id: '30to50', label: '30.000 ₫ - 50.000 ₫' },
                  { id: 'above50', label: 'Trên 50.000 ₫' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPriceRange(p.id as any)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between font-medium ${
                      priceRange === p.id
                        ? 'bg-emerald-50 text-forest-800 font-bold border border-emerald-300'
                        : 'text-slate-600 hover:bg-slate-50'
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
            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-emerald-950/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-600 font-medium">
                Tìm thấy <strong className="text-forest-800 font-bold">{filteredProducts.length}</strong> sản phẩm phù hợp
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-forest-600" />
                  <span>Bộ lọc</span>
                </button>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 hidden sm:inline font-medium">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs font-bold text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest-600 cursor-pointer"
                  >
                    <option value="popular">Bán chạy nhất</option>
                    <option value="newest">Mới cập nhật</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-emerald-950/5 shadow-sm">
                <div className="text-5xl mb-3">🌱</div>
                <h3 className="text-base font-bold text-slate-900 font-serif">Không tìm thấy sản phẩm nào</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục và khoảng giá khác xem sao nhé!
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 px-6 py-2.5 rounded-full bg-forest-800 text-white text-xs font-bold hover:bg-forest-900 transition shadow-md"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl ml-auto p-5 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="font-bold text-base text-forest-950 font-serif">Bộ Lọc Hạt Giống</span>
              <button onClick={() => setShowMobileFilters(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-2">Danh mục</span>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                <button
                  onClick={() => { setSelectedCategory('all'); setShowMobileFilters(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${selectedCategory === 'all' ? 'bg-forest-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  Tất cả danh mục
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.slug); setShowMobileFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${selectedCategory === cat.slug ? 'bg-forest-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-2">Mức giá</span>
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
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${priceRange === p.id ? 'bg-emerald-100 text-forest-900 font-bold' : 'text-slate-700'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => { resetFilters(); setShowMobileFilters(false); }}
                className="w-full py-2.5 rounded-xl border border-forest-300 text-forest-800 font-bold text-xs"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductListPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Đang tải danh sách hạt giống...</div>}>
      <ProductListContent />
    </Suspense>
  );
}
