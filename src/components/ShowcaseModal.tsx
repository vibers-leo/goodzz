"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Eye, Share2, Download, User } from "lucide-react";

interface ShowcaseItem {
  id: number | string;
  title: string;
  author: string;
  authorPhoto?: string;
  image: string;
  likes: number;
  views: number;
  tag: string;
  prompt?: string;
}

interface ShowcaseModalProps {
  item: ShowcaseItem | null;
  onClose: () => void;
}

export default function ShowcaseModal({ item, onClose }: ShowcaseModalProps) {
  if (!item) return null;

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8"
          >
            {/* Modal Content */}
            <motion.div
              layoutId={`showcase-${item.id}`} // For smooth transition if we linked it from grid (future enhancement)
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left: Image Area */}
              <div className="md:w-2/3 bg-gray-100 flex items-center justify-center p-4 md:p-0 relative group">
                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain shadow-lg"
                />
                 {/* Quick Actions overlay on image */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white/90 hover:bg-white text-gray-900 px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 backdrop-blur-sm transition-transform hover:scale-105 active:scale-95">
                        <Download className="w-5 h-5" /> 다운로드
                    </button>
                </div>
              </div>

              {/* Right: Info Area */}
              <div className="md:w-1/3 flex flex-col bg-white">
                {/* Header info */}
                <div className="p-6 border-b border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                {item.author[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 leading-tight">{item.title}</h3>
                                <p className="text-xs text-gray-500">by {item.author}</p>
                            </div>
                        </div>
                        <button className="text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                            Follow
                        </button>
                    </div>
                </div>

                {/* Engagement Stats */}
                <div className="p-6 grid grid-cols-3 gap-4 text-center border-b border-gray-100">
                     <div className="space-y-1">
                        <Heart className="w-6 h-6 mx-auto text-pink-500" />
                        <div className="font-bold text-gray-900">{item.likes}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Likes</div>
                     </div>
                     <div className="space-y-1">
                        <Eye className="w-6 h-6 mx-auto text-blue-500" />
                        <div className="font-bold text-gray-900">{item.views}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Views</div>
                     </div>
                     <div className="space-y-1">
                        <Share2 className="w-6 h-6 mx-auto text-green-500" />
                        <div className="font-bold text-gray-900">Share</div>
                        <div className="text-[10px] text-gray-400 uppercase">Link</div>
                     </div>
                </div>

                {/* Comments / Description Area (Placeholder) */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <h4 className="font-bold text-sm text-gray-900 mb-4">Prompt Info</h4>
                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 font-mono leading-relaxed border border-gray-100">
                        "A futuristic city with neon lights, {item.tag} style, highly detailed, 8k resolution, cinematic lighting..."
                        <div className="mt-3 flex gap-2">
                            <button className="text-xs font-bold text-blue-500 hover:underline">Copy Prompt</button>
                        </div>
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 mt-8 mb-4">Comments (2)</h4>
                    <div className="space-y-4">
                        <div className="flex gap-3 text-sm">
                            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0 items-center justify-center flex"><User className="w-4 h-4 text-gray-500"/></div>
                            <div>
                                <p className="font-bold text-gray-900">Alice123</p>
                                <p className="text-gray-600">와 색감이 너무 예쁘네요! 어떤 모델 쓰셨나요?</p>
                            </div>
                        </div>
                        <div className="flex gap-3 text-sm">
                            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0 items-center justify-center flex"><User className="w-4 h-4 text-gray-500"/></div>
                            <div>
                                <p className="font-bold text-gray-900">DesignPro</p>
                                <p className="text-gray-600">This is amazing work!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-gray-100">
                    <button className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                        <Heart className="w-5 h-5" /> 이 디자인으로 굿즈 만들기
                    </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
