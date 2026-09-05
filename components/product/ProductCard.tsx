'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, Star, Flame, Check, Sparkles } from 'lucide-react';
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
  const [justAdded, setJustAdded] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const mainImage = product.image_url || product.images?.[0] || (product.product_images?.[0]?.image_url) || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80';
  
  const discountPercent = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100) 
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl border border-emerald-950/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_-6px_rgba(22,101,52,0.16)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {discountPercent > 0 && (
          <span className="bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md">
            -{discountPercent}%
          </span>
        )}
        {product.is_best_seller && (
          <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-forest-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
            <Flame className="w-3 h-3 fill-forest-950" /> BÁN CHẠY
          </span>
        )}
        {product.germination_rate && (
          <span className="bg-forest-900/85 backdrop-blur-md text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-xs">
            🌱 Mầm {product.germination_rate}
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
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
          isFavorite
            ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 scale-105'
            : 'bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 hover:bg-white hover:scale-110'
        }`}
        title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích sản phẩm'}
        aria-label="Yêu thích"
      >
        <Heart className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-rose-500 scale-110' : ''}`} />
      </button>

      {/* Product Image Container */}
      <Link href={`/san-pham/${product.slug}`} className="block relative aspect-square bg-forest-50/40 overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {product.origin && (
          <div className="absolute bottom-2.5 left-2.5 bg-forest-950/70 backdrop-blur-md text-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/20">
            {product.origin}
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Star Rating & Reviews */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-800">{product.rating || 5.0}</span>
            <span className="text-[11px] text-slate-400">({product.review_count || 48})</span>
          </div>

          {/* Product Title */}
          <Link href={`/san-pham/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-forest-700 transition-colors line-clamp-2 leading-snug font-sans">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          {product.short_description && (
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Pricing & Add To Cart */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-sm sm:text-base font-extrabold text-forest-800 leading-none">
              {formatPrice(product.sale_price || product.price)}
            </div>
            {product.sale_price && (
              <div className="text-[11px] text-slate-400 line-through mt-1">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-300 shadow-md shrink-0 ${
              justAdded
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-forest-800 hover:bg-forest-900 text-white hover:scale-105 active:scale-95'
            }`}
            title="Thêm vào giỏ hàng"
            aria-label="Thêm vào giỏ hàng"
          >
            {justAdded ? (
              <Check className="w-4 h-4 animate-in zoom-in" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
