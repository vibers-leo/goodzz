'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '../lib/mock-data';
import { Star, Heart, ShoppingCart, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const discountRate = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getBadgeStyles = (badge: string) => {
    switch (badge) {
      case 'BEST':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
      case 'NEW':
        return 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white';
      case 'HOT':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-700 to-gray-800 text-white';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link href={`/shop/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 mb-4 aspect-square border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300">
          {/* Badge */}
          {product.badge && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={isVisible ? { scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`absolute top-3 left-3 z-10 ${getBadgeStyles(product.badge)} text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1`}
            >
              {product.badge === 'NEW' && <Sparkles className="w-3 h-3" />}
              {product.badge}
            </motion.div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>

          {/* Quick Add to Cart */}
          <button
            onClick={(e) => {
              e.preventDefault();
            }}
            className="absolute bottom-3 right-3 z-10 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 shadow-lg text-sm font-semibold"
          >
            <ShoppingCart className="w-4 h-4" />
            담기
          </button>

          {/* Image with enhanced hover effect */}
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={product.thumbnail}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Discount Badge */}
          {discountRate > 0 && (
            <div className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {discountRate}% OFF
            </div>
          )}
        </div>

        <div className="space-y-2 px-1">
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            {product.category}
          </div>
          <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {product.originalPrice.toLocaleString()}원
              </span>
            )}
            <span className="font-extrabold text-xl text-gray-900">
              {product.price.toLocaleString()}원
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <div className="flex items-center gap-0.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-gray-900">{product.rating}</span>
            </div>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">리뷰 {product.reviewCount}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
