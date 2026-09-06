'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Filter, SlidersHorizontal, Search, ArrowUpDown, 
  Sparkles, Check, ChevronRight, X, Home, Flame, Sprout, Tag, CheckCircle2
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
          <span className="font-extrabold text-forest-900">Tất cả sản phẩm hạt giống F1</span>
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-black mb-3 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Kho Hạt Giống Thuần F1 Kháng Sâu Bệnh &gt; 85%</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-white">
              Cửa Hàng Hạt Giống &amp; Vật Tư Làm Vườn 🌱
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
              Hơn 500+ loại hạt giống hoa, rau củ quả hữu cơ F1 chuẩn tỷ lệ nảy mầm cao và vật tư dinh dưỡng giá thể đóng gói cao cấp.
            </p>
          </div>
        </div>

        {/* Quick Filter Pill Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all shadow-2xs ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-forest-800 to-forest-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-forest-50 border border-slate-200/80'
            }`}
          >
            Tất cả ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs ${
                selectedCategory === cat.slug
                  ? 'bg-gradient-to-r from-forest-800 to-forest-900 text-white font-black shadow-md'
                  : 'bg-white text-slate-700 hover:bg-forest-50 border border-slate-200/80'
              }`}
            >
              <span>{cat.icon || '🌱'}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Layout: Sidebar Filter + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-emerald-950/8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-forest-950 text-sm">
                <Filter className="w-4 h-4 text-forest-700" />
                <span>BỘ LỌC TÌM KIẾM</span>
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
              <label className="text-xs font-black text-slate-800 block mb-2">Tìm kiếm theo tên</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ví dụ: hướng dương, cà chua..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium text-slate-900"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Categories filter */}
            <div>
              <label className="text-xs font-black text-slate-800 block mb-2">Danh mục hạt giống</label>
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-forest-800 text-white shadow-sm font-black'
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
                      className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                        selectedCategory === cat.slug
                          ? 'bg-forest-800 text-white shadow-sm font-black'
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
              <label className="text-xs font-black text-slate-800 block mb-2">Khoảng giá</label>
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
                    className={`w-full text-left px-3 py-2.5 rounded-2xl transition flex items-center justify-between font-medium ${
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

            {/* Quality Commitment Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-forest-50 to-emerald-50 border border-emerald-100 text-xs text-forest-900 space-y-2">
              <div className="font-black flex items-center gap-1.5 text-forest-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cam Kết Từ Nhà Vườn</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Tất cả hạt giống đều được kiểm định nảy mầm định kỳ & đóng gói kín túi bạc giữ ẩm.
              </p>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main className="lg:col-span-3">
            
            {/* Top Sort & Count Bar */}
            <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-emerald-950/8 shadow-2xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-medium">
                Tìm thấy <strong className="text-forest-800 font-black text-sm">{filteredProducts.length}</strong> sản phẩm phù hợp
              </div>

              <div className="flex items-center gap-2 justify-between sm:justify-end">
                {/* Mobile Filter Drawer Trigger */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Bộ lọc</span>
                </button>

                {/* Sort Selector */}
                <div className="flex items-center gap-1.5 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-500 hidden sm:inline">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Sắp xếp sản phẩm"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 cursor-pointer"
                  >
                    <option value="popular">Bán chạy nhất 🔥</option>
                    <option value="newest">Hàng mới về</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-emerald-950/5 shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto mb-4 text-2xl">
                  🌱
                </div>
                <h3 className="text-base font-bold text-slate-900 font-serif">Không tìm thấy hạt giống phù hợp</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Vui lòng thử tìm với từ khóa khác hoặc điều chỉnh lại các tiêu chí bộ lọc.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 px-6 py-2.5 rounded-full bg-forest-800 text-white text-xs font-extrabold hover:bg-forest-900 transition shadow"
                >
                  Xem lại tất cả sản phẩm
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

          </main>
        </div>

      </div>

      {/* Mobile Filter Drawer Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-forest-950/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-extrabold text-sm text-forest-950">Bộ Lọc Sản Phẩm</span>
                <button onClick={() => setShowMobileFilters(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Tên hạt giống..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50"
                />
              </div>

              {/* Mobile Categories */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Danh mục</label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => { setSelectedCategory('all'); setShowMobileFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs ${selectedCategory === 'all' ? 'bg-forest-800 text-white font-bold' : 'text-slate-700'}`}
                  >
                    Tất cả danh mục
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCategory(c.slug); setShowMobileFilters(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${selectedCategory === c.slug ? 'bg-forest-800 text-white font-bold' : 'text-slate-700'}`}
                    >
                      <span>{c.icon} {c.name}</span>
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

            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full py-3 bg-forest-800 text-white rounded-2xl text-xs font-bold shadow-md mt-6"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Đang tải danh mục hạt giống cao cấp...</p>
        </div>
      </div>
    }>
      <ProductListContent />
    </Suspense>
  );
}
