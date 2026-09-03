'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, Trash2, ChevronRight } from 'lucide-react';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { ProductCard } from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { wishlist, clearWishlist, totalWishlist } = useWishlist();

  return (
    <div className="bg-forest-50/30 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-forest-900">Danh sách yêu thích</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-950 font-serif flex items-center gap-2">
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
              <span>Sản Phẩm Yêu Thích ({totalWishlist})</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Các loại hạt giống hoa và cây trồng bạn đã lưu lại</p>
          </div>

          {totalWishlist > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ</span>
            </button>
          )}
        </div>

        {totalWishlist === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-3xl mb-4">
              ❤️
            </div>
            <h2 className="text-lg font-bold text-gray-900">Chưa có sản phẩm yêu thích nào</h2>
            <p className="text-xs text-gray-500 mt-1">
              Bạn có thể nhấn vào biểu tượng trái tim ở từng sản phẩm để lưu lại những giống hoa ưng ý nhất!
            </p>
            <div className="mt-6">
              <Link
                href="/san-pham"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest-800 text-white text-xs font-bold hover:bg-forest-900 transition shadow-md"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
