'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Sparkles, Filter, Sprout } from 'lucide-react';
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

  useEffect(() => {
    async function loadData() {
      let deletedIds: string[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem('deleted_product_ids') || '[]');
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

      // Exclude deleted products
      allProds = allProds.filter((p) => !deletedIds.includes(p.id));

      // Find current category by slug
      const currentCat = allCats.find((c) => c.slug === params.slug) || INITIAL_CATEGORIES.find((c) => c.slug === params.slug);

      if (currentCat) {
        setCategory(currentCat);
        const matchedProducts = allProds.filter((p) => isProductInCategory(p.category_id, currentCat));
        setProducts(matchedProducts);
      }
      setIsLoading(false);
    }
    loadData();
  }, [params.slug]);

  if (!category && !isLoading) {
    notFound();
  }

  return (
    <div className="bg-forest-50/30 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/san-pham" className="hover:text-forest-700 transition">Sản phẩm</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-forest-900">{category?.name || 'Danh mục'}</span>
        </nav>

        {/* Category Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-forest-900 text-white p-8 sm:p-12 mb-10 shadow-lg">
          <div className="absolute inset-0 opacity-30">
            <img
              src={category?.image_url || 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1200&q=80'}
              alt={category?.name || 'Danh mục'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-900/80 to-transparent"></div>

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/80 text-emerald-300 text-xs font-semibold mb-3 border border-forest-700">
              <span>{category?.icon || '🌱'}</span>
              <span>Danh Mục Chuyên Sâu</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
              {category?.name}
            </h1>
            <p className="text-xs sm:text-sm text-forest-100/90 mt-2 leading-relaxed">
              {category?.description || 'Tuyển chọn các loại hạt giống chất lượng cao, tỉ lệ nảy mầm chuẩn F1.'}
            </p>
          </div>
        </div>

        {/* Product Count & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between mb-6">
          <div className="text-xs text-gray-600 font-medium">
            Có <strong className="text-forest-800 font-bold">{products.length}</strong> sản phẩm trong danh mục này
          </div>
          <Link
            href="/san-pham"
            className="text-xs text-forest-700 hover:text-forest-900 font-semibold"
          >
            ← Xem tất cả danh mục khác
          </Link>
        </div>

        {/* Loading spinner or Product Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-gray-500 font-semibold">Đang tải sản phẩm danh mục...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="text-base font-bold text-gray-900">Danh mục đang cập nhật thêm sản phẩm</h3>
            <p className="text-xs text-gray-500 mt-1">Vui lòng quay lại sau hoặc liên hệ Hotline để được tư vấn.</p>
            <Link
              href="/san-pham"
              className="mt-5 inline-block px-6 py-2 rounded-full bg-forest-800 text-white text-xs font-bold"
            >
              Xem sản phẩm khác
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
