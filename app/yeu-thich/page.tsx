'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, Trash2, ChevronRight, Home, Sparkles } from 'lucide-react';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { ProductCard } from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { wishlist, clearWishlist, totalWishlist } = useWishlist();

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
          <span className="font-extrabold text-forest-900">Danh sách yêu thích</span>
        </nav>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-950 font-serif flex items-center gap-2.5">
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
              <span>Sản Phẩm Yêu Thích ({totalWishlist})</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Các giống hoa và cây trồng hữu cơ bạn đã quan tâm lưu lại</p>
          </div>

          {totalWishlist > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-rose-600 hover:underline font-bold flex items-center gap-1.5 bg-rose-50 px-3.5 py-2 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ danh sách</span>
            </button>
          )}
        </div>

        {totalWishlist === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-emerald-950/8 shadow-2xs max-w-xl mx-auto">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 flex items-center justify-center text-4xl mb-4 shadow-inner">
              ❤️
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">Chưa có sản phẩm yêu thích nào</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Bạn có thể nhấn vào biểu tượng trái tim ở từng sản phẩm hạt giống để dễ dàng xem lại và đặt mua khi cần!
            </p>
            <div className="mt-8">
              <Link
                href="/san-pham"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-900 text-white text-xs font-extrabold hover:from-forest-900 hover:to-forest-950 transition shadow-md active:scale-95"
              >
                <span>Khám phá các giống hoa F1</span>
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

