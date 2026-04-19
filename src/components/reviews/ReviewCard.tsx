'use client';

import React from 'react';
import { Star, ShieldCheck, User, MessageSquareReply } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Review {
  id: string;
  userName: string;
  rating: number;
  content: string;
  images?: string[];
  replyContent?: string;
  replyAt?: string;
  createdAt: string;
}

interface ReviewCardProps {
  review: Review;
  index: number;
}

export default function ReviewCard({ review, index }: ReviewCardProps) {
  const hasImages = review.images && review.images.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col"
    >
      {/* Photo Section */}
      {hasImages && (
        <div className="aspect-[4/5] relative overflow-hidden bg-gray-50">
          <Image
            src={review.images![0]}
            alt="Review photo"
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-700"
            unoptimized
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-gray-900 shadow-sm border border-white/50 tracking-widest uppercase">
            Photo Review
          </div>
          
          {/* Multi-photo indicator */}
          {review.images!.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold">
              +{review.images!.length - 1} photos
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <User size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 tracking-tight">{review.userName}</p>
              <div className="flex items-center gap-1 text-[9px] font-bold text-primary-600 uppercase tracking-tighter">
                <ShieldCheck size={10} /> Verified Purchase
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-100"}
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
          {review.content}
        </p>

        {/* 사장님 답변 */}
        {review.replyContent && (
          <div className="bg-purple-50 rounded-xl p-4 mb-4 border-l-4 border-purple-400">
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageSquareReply size={12} className="text-purple-600" />
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">사장님 답변</span>
            </div>
            <p className="text-xs text-purple-900 leading-relaxed">{review.replyContent}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-primary-200" />
        </div>
      </div>
      
      {/* Decorative Accent */}
      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-primary-100/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    </motion.div>
  );
}
