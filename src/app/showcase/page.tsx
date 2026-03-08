"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { Heart, MessageCircle, Share2, Filter, Zap, Eye, Download, Repeat2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import ShowcaseModal from "@/components/ShowcaseModal";
import { getShowcaseItems, likeShowcaseItem, type ShowcaseItem } from "@/lib/showcase";

const styleTabs = [
  { key: "ALL", label: "전체" },
  { key: "수채화", label: "수채화" },
  { key: "사이버펑크", label: "사이버펑크" },
  { key: "미니멀", label: "미니멀" },
  { key: "3D", label: "3D" },
  { key: "캐릭터", label: "캐릭터" },
  { key: "풍경", label: "풍경" },
  { key: "로고", label: "로고" },
  { key: "패턴", label: "패턴" },
];

const MOCK_SHOWCASE = [
  {
    id: 1,
    title: "Neon City Vibes",
    author: "CyberArtist",
    authorPhoto: "",
    image: "https://images.unsplash.com/photo-1636955860106-9eb84e578c3c?auto=format&fit=crop&q=80&w=800",
    likes: 124,
    views: 1205,
    tag: "사이버펑크",
    prompt: "Neon city skyline with cyberpunk vibes",
  },
  {
    id: 2,
    title: "Morning Coffee",
    author: "LatteArt",
    authorPhoto: "",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=800",
    likes: 89,
    views: 450,
    tag: "수채화",
    prompt: "Watercolor morning coffee still life",
  },
  {
    id: 3,
    title: "Space Traveler",
    author: "StarWalker",
    authorPhoto: "",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    likes: 256,
    views: 3100,
    tag: "캐릭터",
    prompt: "Space traveler character in a cosmic landscape",
  },
  {
    id: 4,
    title: "Abstract Waves",
    author: "Modernist",
    authorPhoto: "",
    image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800",
    likes: 67,
    views: 230,
    tag: "패턴",
    prompt: "Abstract waves pattern in modern style",
  },
  {
    id: 5,
    title: "Future Car",
    author: "GearHead",
    authorPhoto: "",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
    likes: 156,
    views: 1102,
    tag: "사이버펑크",
    prompt: "Futuristic concept car with neon lights",
  },
  {
    id: 6,
    title: "Zen Garden",
    author: "PeaceMind",
    authorPhoto: "",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
    likes: 92,
    views: 560,
    tag: "풍경",
    prompt: "Peaceful zen garden with cherry blossoms",
  },
];

// Unified type for display (covers both mock and Firestore items)
interface DisplayItem {
  id: number | string;
  title: string;
  author: string;
  authorPhoto: string;
  image: string;
  likes: number;
  views: number;
  tag: string;
  prompt: string;
}

function showcaseToDisplay(item: ShowcaseItem): DisplayItem {
  return {
    id: item.id || item.createdAt,
    title: item.prompt.slice(0, 40) || "AI Design",
    author: item.userName,
    authorPhoto: item.userPhoto,
    image: item.designUrl,
    likes: item.likes,
    views: 0,
    tag: item.style,
    prompt: item.prompt,
  };
}

export default function ShowcasePage() {
  const [activeTag, setActiveTag] = useState("ALL");
  const [hoveredId, setHoveredId] = useState<number | string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DisplayItem | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string | number>>(new Set());
  const [displayItems, setDisplayItems] = useState<DisplayItem[]>(
    MOCK_SHOWCASE.map((m) => ({
      ...m,
      authorPhoto: m.authorPhoto || "",
      prompt: m.prompt || "",
    }))
  );

  // Fetch from Firestore on mount
  useEffect(() => {
    async function fetchItems() {
      try {
        const firestoreItems = await getShowcaseItems({ limit: 50 });
        if (firestoreItems.length > 0) {
          const converted = firestoreItems.map(showcaseToDisplay);
          // Merge: Firestore items first, then mock fallback
          setDisplayItems([...converted, ...MOCK_SHOWCASE.map((m) => ({
            ...m,
            authorPhoto: m.authorPhoto || "",
            prompt: m.prompt || "",
          }))]);
        }
      } catch (error) {
        console.error("Error loading showcase:", error);
        // Keep mock data as fallback
      }
    }
    fetchItems();
  }, []);

  const handleLike = useCallback(async (e: React.MouseEvent, item: DisplayItem) => {
    e.stopPropagation();
    if (likedIds.has(item.id)) return;

    setLikedIds((prev) => new Set(prev).add(item.id));
    setDisplayItems((prev) =>
      prev.map((d) => (d.id === item.id ? { ...d, likes: d.likes + 1 } : d))
    );

    // Persist to Firestore if it's a real item (string id)
    if (typeof item.id === "string") {
      await likeShowcaseItem(item.id);
    }
  }, [likedIds]);

  const filteredItems =
    activeTag === "ALL"
      ? displayItems
      : displayItems.filter((item) => item.tag === activeTag);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 text-center px-4">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-4"
        >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Showcase</h1>
            <p className="text-gray-500 text-lg">
                다른 크리에이터들이 AI로 만든 놀라운 작품들을 감상하고 영감을 얻으세요.
            </p>
        </motion.div>
      </section>

      {/* Style Filter Tabs */}
      <section className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {styleTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTag(tab.key)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                            activeTag === tab.key
                            ? 'bg-black text-white shadow-lg'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                          {tab.label}
                      </button>
                  ))}
              </div>
              <button className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
                  <Filter className="w-4 h-4" /> 필터
              </button>
          </div>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
            layout
            className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
        >
            <AnimatePresence>
                {filteredItems.map((item) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={item.id}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setSelectedItem(item)}
                        className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-gray-100 cursor-pointer"
                    >
                        <Image
                            src={item.image}
                            alt={item.title}
                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                            width={800}
                            height={800}
                            unoptimized
                        />

                        {/* Overlay */}
                        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex flex-col justify-end p-6 ${hoveredId === item.id ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                {/* User Info */}
                                <div className="flex items-center gap-2 mb-3">
                                    {item.authorPhoto ? (
                                        <Image
                                            src={item.authorPhoto}
                                            alt={item.author}
                                            width={24}
                                            height={24}
                                            className="w-6 h-6 rounded-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                                            {item.author[0]}
                                        </div>
                                    )}
                                    <span className="text-white/90 text-xs font-medium">{item.author}</span>
                                </div>

                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-white font-bold text-lg">{item.title}</h3>
                                    <span className="text-[10px] bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded font-bold">
                                        {item.tag}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-white">
                                    {/* Like Button */}
                                    <button
                                        onClick={(e) => handleLike(e, item)}
                                        className={`flex items-center gap-1.5 transition-colors ${
                                            likedIds.has(item.id) ? 'text-pink-400' : 'hover:text-pink-300'
                                        }`}
                                    >
                                        <Heart className={`w-4 h-4 ${likedIds.has(item.id) ? 'fill-pink-400' : 'fill-white/20'}`} />
                                        <span className="text-xs font-bold">{item.likes}</span>
                                    </button>
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-xs font-bold">{item.views}</span>
                                    </div>

                                    {/* Remix Button */}
                                    <Link
                                        href={`/create?remix=${encodeURIComponent(item.prompt)}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="ml-auto bg-white text-black px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
                                    >
                                        <Repeat2 className="w-3.5 h-3.5" />
                                        이 디자인으로 만들기
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>

        {filteredItems.length === 0 && (
            <div className="py-20 text-center">
                <p className="text-gray-400">해당 태그의 작품이 없습니다.</p>
            </div>
        )}

        <div className="mt-20 text-center">
            <Link
                href="/create"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
                <Zap className="w-5 h-5 fill-current" /> 나도 작품 올리기
            </Link>
        </div>
      </section>

      {/* Modal */}
      {selectedItem && (
        <ShowcaseModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
        />
      )}
    </main>
  );
}
