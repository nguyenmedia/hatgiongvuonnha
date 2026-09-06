'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Sparkles, Filter, Sprout, ArrowUpDown, Flame, Home, CheckCircle2 } from 'lucide-react';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/lib/constants';
import { isProductInCategory } from '@/lib/utils';
import { ProductCard } from '@/components/product/ProductCard';
import { Product, Category } from '@/types/database.types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface Props {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: Props) {
  const [category, setCategory] = useState<Category | null>(
    INITIAL_CATEGORIES.find((c) => c.slug === params.slug) || null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'newest'>('popular');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under30' | '30to50' | 'above50'>('all');

  useEffect(() => {
    async function loadData() {
      let deletedIds: string[] = [];
      let localSavedCats: Category[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem('deleted_product_ids') || '[]');
        const storedCats = localStorage.getItem('custom_categories');
        if (storedCats) localSavedCats = JSON.parse(storedCats);
      } catch (e) {}

      let allCats = INITIAL_CATEGORIES;
      let allProds = INITIAL_PRODUCTS;

      if (isSupabaseConfigured) {
        try {
          const [prodRes, catRes] = await Promise.all([
            supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase.from('categories').select('*').order('sort_order', { ascending: true })
          ]);

          if (catRes.data && catRes.data.length > 0) {
            allCats = catRes.data;
          } else if (localSavedCats.length > 0) {
            allCats = localSavedCats;
          }

          if (prodRes.data && prodRes.data.length > 0) {
            const fetchedMap = new Map(prodRes.data.map((p) => [p.id, p]));
            allProds = [
              ...prodRes.data,
              ...INITIAL_PRODUCTS.filter((p) => !fetchedMap.has(p.id))
            ];
          }
        } catch (err) {
          console.error('Error loading category data:', err);
        }
      }

      const foundCat = allCats.find((c) => c.slug === params.slug);
      setCategory(foundCat || null);

      if (foundCat) {
        const catProds = allProds.filter((p) => {
          if (deletedIds.includes(p.id)) return false;
          return isProductInCategory(p.category_id, foundCat);
        });
        setProducts(catProds);
      }
      setIsLoading(false);
    }
    loadData();
  }, [params.slug]);

  // Filter & Sort
  const displayProducts = useMemo(() => {
    let list = [...products];

    // Price filter
    if (priceFilter === 'under30') {
      list = list.filter((p) => (p.sale_price || p.price) < 30000);
    } else if (priceFilter === '30to50') {
      list = list.filter((p) => {
        const effectivePrice = p.sale_price || p.price;
        return effectivePrice >= 30000 && effectivePrice <= 50000;
      });
    } else if (priceFilter === 'above50') {
      list = list.filter((p) => (p.sale_price || p.price) > 50000);
    }

    // Sort
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
  }, [products, priceFilter, sortBy]);

  if (!category && !isLoading) {
    notFound();
  }

  return (
    <div className="bg-[#f8faf7] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/san-pham" className="hover:text-forest-700 transition">Sản phẩm</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-extrabold text-forest-900">{category?.name || 'Danh mục'}</span>
        </nav>

        {/* Category Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-forest-950 via-forest-900 to-emerald-950 text-white p-8 sm:p-12 mb-8 shadow-xl border border-forest-800">
          <div className="absolute inset-0 opacity-25">
            <img
              src={category?.image_url || 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1200&q=80'}
              alt={category?.name || 'Danh mục'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/80 to-transparent"></div>

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-black mb-3 border border-emerald-500/30 backdrop-blur-md">
              <span>{category?.icon || '🌱'}</span>
              <span>Chủng Giống F1 Thuần Năng Suất Cao</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white leading-tight">
              {category?.name}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-2.5 leading-relaxed">
              {category?.description || 'Tuyển chọn các loại hạt giống chất lượng cao, tỉ lệ nảy mầm chuẩn F1 > 85%, phù hợp khí hậu nhiệt đới Việt Nam.'}
            </p>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-emerald-950/8 shadow-2xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Price Range Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-forest-600" /> Mức giá:
            </span>
            <button
              onClick={() => setPriceFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                priceFilter === 'all'
                  ? 'bg-forest-800 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-forest-50'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setPriceFilter('under30')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                priceFilter === 'under30'
                  ? 'bg-forest-800 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-forest-50'
              }`}
            >
              Dưới 30.000 ₫
            </button>
            <button
              onClick={() => setPriceFilter('30to50')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                priceFilter === '30to50'
                  ? 'bg-forest-800 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-forest-50'
              }`}
            >
              30.000 ₫ - 50.000 ₫
            </button>
            <button
              onClick={() => setPriceFilter('above50')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                priceFilter === 'above50'
                  ? 'bg-forest-800 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-forest-50'
              }`}
            >
              Trên 50.000 ₫
            </button>
          </div>

          {/* Sort Selection & Product Count */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              <strong className="text-forest-800 font-bold">{displayProducts.length}</strong> sản phẩm
            </span>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="popular">Bán chạy nhất</option>
                <option value="newest">Mới cập nhật</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

        </div>

        {/* Loading spinner or Product Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500 font-semibold">Đang tải hạt giống theo danh mục...</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-emerald-950/5 shadow-sm max-w-lg mx-auto">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">Chưa tìm thấy sản phẩm phù hợp</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Bạn có thể thử chọn khoảng giá khác hoặc xem tất cả danh mục hạt giống của nhà vườn.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setPriceFilter('all')}
                className="px-5 py-2.5 rounded-xl bg-forest-50 text-forest-800 text-xs font-bold hover:bg-forest-100 transition"
              >
                Xóa bộ lọc giá
              </button>
              <Link
                href="/san-pham"
                className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-md transition"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
