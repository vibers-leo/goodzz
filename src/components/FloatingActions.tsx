'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ShoppingCart, X, Plus, Sparkles, ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

export default function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { cart } = useStore();

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Show scroll-to-top button after scrolling 300px
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fabActions = [
    {
      id: 'ai-editor',
      label: 'AI 에디터',
      icon: Wand2,
      href: '/ai-editor',
      color: 'from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
    },
    {
      id: 'cart',
      label: '장바구니',
      icon: ShoppingCart,
      href: '/cart',
      color: 'from-amber-500 to-amber-600',
      hoverColor: 'hover:from-amber-600 hover:to-amber-700',
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
  ];

  return (
    <>
      {/* Main FAB Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full bg-gray-200/80 backdrop-blur-md hover:bg-gray-300/80 text-gray-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group border border-gray-300/50"
              aria-label="맨 위로 이동"
            >
              <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {fabActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: 50, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 50, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={action.href}
                    className="group flex items-center gap-3"
                    onClick={() => setIsOpen(false)}
                  >
                    {/* Label */}
                    <motion.span
                      className="px-4 py-2 bg-gray-900/90 backdrop-blur-md text-white text-sm font-medium rounded-full shadow-lg whitespace-nowrap"
                      whileHover={{ scale: 1.05 }}
                    >
                      {action.label}
                    </motion.span>

                    {/* Button */}
                    <div className="relative">
                      <motion.div
                        className={`w-14 h-14 rounded-full bg-gradient-to-r ${action.color} ${action.hoverColor} shadow-xl hover:shadow-2xl transition-all flex items-center justify-center text-white border-2 border-white/20`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <action.icon className="w-6 h-6" />
                      </motion.div>

                      {/* Badge */}
                      {action.badge && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                        >
                          {action.badge > 9 ? '9+' : action.badge}
                        </motion.div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-full shadow-2xl transition-all flex items-center justify-center overflow-hidden group ${
            isOpen
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500'
          }`}
          whileHover={{ scale: 1.1, rotate: isOpen ? 90 : 0 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isOpen ? '메뉴 닫기' : '빠른 메뉴'}
        >
          {/* Animated Background Effect */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-400 to-indigo-600"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}

          {/* Icon */}
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-7 h-7 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Plus className="w-7 h-7 text-white" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Border Ring Animation */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}
        </motion.button>
      </div>

      {/* Backdrop (optional - for mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
