'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/types/database.types';
import { useToast } from './ToastProvider';

interface CartContextType {
  cart: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode: string;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  finalTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { success, info } = useToast();

  // Load cart from LocalStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hg_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem('hg_coupon');
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        setCouponCode(parsed.code || '');
        setDiscount(parsed.discount || 0);
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to LocalStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('hg_cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addItem = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    info('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscount(0);
    localStorage.removeItem('hg_cart');
    localStorage.removeItem('hg_coupon');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product.sale_price !== null && item.product.sale_price !== undefined
      ? item.product.sale_price
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Free ship for orders >= 300,000 VND
  const shippingFee = subtotal >= 300000 || subtotal === 0 ? 0 : 30000;

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'NHAVUON10') {
      if (subtotal < 150000) {
        return { success: false, message: 'Mã NHAVUON10 áp dụng cho đơn hàng từ 150.000 ₫' };
      }
      const disc = Math.round(subtotal * 0.1);
      setCouponCode(clean);
      setDiscount(disc);
      localStorage.setItem('hg_coupon', JSON.stringify({ code: clean, discount: disc }));
      return { success: true, message: 'Áp dụng mã giảm giá 10% thành công!' };
    }
    if (clean === 'FREESHIP') {
      if (subtotal < 200000) {
        return { success: false, message: 'Mã FREESHIP áp dụng cho đơn từ 200.000 ₫' };
      }
      setCouponCode(clean);
      setDiscount(30000);
      localStorage.setItem('hg_coupon', JSON.stringify({ code: clean, discount: 30000 }));
      return { success: true, message: 'Đã miễn phí vận chuyển 30.000 ₫!' };
    }
    if (clean === 'CHAOHOMNAY') {
      const disc = 20000;
      setCouponCode(clean);
      setDiscount(disc);
      localStorage.setItem('hg_coupon', JSON.stringify({ code: clean, discount: disc }));
      return { success: true, message: 'Áp dụng mã giảm 20.000 ₫ thành công!' };
    }
    return { success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    localStorage.removeItem('hg_coupon');
  };

  const finalTotal = Math.max(0, subtotal + shippingFee - discount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shippingFee,
        discount,
        couponCode,
        applyCoupon,
        removeCoupon,
        finalTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
