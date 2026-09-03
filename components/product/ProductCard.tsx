'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, Sparkles, Check, Flame } from 'lucide-react';
import { Product } from '@/types/database.types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '../providers/CartProvider';
import { useWishlist } from '../providers/WishlistProvider';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorite = isInWishlist(product.id);
  const mainImage = product.image_url || product.images?.[0] || (product.product_images?.[0]?.image_url) || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80';
  
  const discountPercent = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100) 
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100/90 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {discountPercent > 0 && (
          <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
            -{discountPercent}%
          </span>
        )}
        {product.is_best_seller && (
          <span className="bg-amber-500 text-forest-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Flame className="w-3 h-3 fill-forest-950" /> BÁN CHẠY
          </span>
        )}
        {product.germination_rate && (
          <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Nảy mầm {product.germination_rate}
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 shadow-sm ${
          isFavorite
            ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
            : 'bg-white/85 backdrop-blur-sm text-gray-500 hover:text-rose-500 hover:bg-white'
        }`}
        title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích sản phẩm'}
        aria-label="Wishlist"
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Product Image */}
      <Link href={`/san-pham/${product.slug}`} className="block relative aspect-square bg-forest-50/50 overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {product.origin && (
          <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
            Xuất xứ: {product.origin}
          </div>
        )}
      </Link>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-gray-700">{product.rating || 5.0}</span>
            <span className="text-[11px] text-gray-400">({product.review_count || 48} đánh giá)</span>
          </div>

          {/* Product Title */}
          <Link href={`/san-pham/${product.slug}`}>
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-forest-700 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          {product.short_description && (
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-extrabold text-forest-700 leading-none">
              {formatPrice(product.sale_price || product.price)}
            </div>
            {product.sale_price && (
              <div className="text-xs text-gray-400 line-through mt-1">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          <button
            onClick={() => addItem(product, 1)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-forest-800 hover:bg-forest-900 text-white transition-all shadow-sm hover:shadow hover:scale-105 active:scale-95 shrink-0"
            title="Thêm vào giỏ hàng"
            aria-label="Thêm vào giỏ hàng"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
