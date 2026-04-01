import { View, Text, ScrollView, Pressable, Dimensions, Image } from "react-native";
import { Sparkles, ArrowRight, Star, TrendingUp, ShoppingBag, Search, Bell, Menu, ChevronRight } from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

// 목업 굿즈 데이터
const MOCK_GOODS = [
  {
    id: "1",
    title: "커스텀 아크릴 키링",
    price: "8,900",
    rating: 4.8,
    reviews: 128,
    category: "Keyring",
    color: "#f59e0b"
  },
  {
    id: "2",
    title: "AI 일러스트 스티커팩",
    price: "3,500",
    rating: 4.9,
    reviews: 256,
    category: "Sticker",
    color: "#3b82f6"
  },
  {
    id: "3",
    title: "포토카드 세트 (5장)",
    price: "12,000",
    rating: 4.7,
    reviews: 89,
    category: "Photo",
    color: "#8b5cf6"
  },
  {
    id: "4",
    title: "캔버스 액자 (A4)",
    price: "25,000",
    rating: 4.6,
    reviews: 45,
    category: "Canvas",
    color: "#10b981"
  },
];

const CATEGORIES = ["All", "Keyring", "Sticker", "Photo", "Frame", "Tech"];

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-[#fcfcfc]">
      <StatusBar style="dark" />
      
      {/* 커스텀 헤더 */}
      <View className="bg-white px-6 pt-14 pb-4 flex-row items-center justify-between border-b border-gray-50">
        <View className="flex-row items-center gap-2">
           <View className="w-10 h-10 bg-[#f59e0b] rounded-xl items-center justify-center">
             <ShoppingBag size={20} color="#fff" />
           </View>
           <Text className="text-gray-900 text-2xl font-black tracking-tight">GOODZZ</Text>
        </View>
        <View className="flex-row items-center gap-4">
           <Pressable className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100">
              <Search size={20} color="#111" />
           </Pressable>
           <Pressable className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100">
              <Menu size={20} color="#111" />
           </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-20">
          
          {/* 히어로 배너 */}
          <Animated.View entering={FadeInDown.duration(800)}>
            <LinearGradient
              colors={['#111', '#333']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  <Text className="text-white text-[10px] font-black uppercase tracking-widest">AI Design Engine</Text>
                </View>
              </View>
              
              <Text className="text-white text-3xl font-black leading-tight mb-4">
                Design Your{"\n"}
                <Text className="text-[#f59e0b]">Ultimate Merch</Text>
              </Text>
              
              <Text className="text-white/60 text-sm font-bold mb-8">
                Your imagination, powered by AI.{"\n"}We create, you enjoy.
              </Text>

              <Pressable className="bg-[#f59e0b] self-start rounded-2xl py-4 px-8 flex-row items-center">
                <Text className="text-black font-black mr-2">Start Designing</Text>
                <ArrowRight size={18} color="#000" />
              </Pressable>

              {/* 데코 엘리먼트 */}
              <View className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </LinearGradient>
          </Animated.View>

          {/* 카테고리 필터 */}
          <View className="mt-10">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-6">
              {CATEGORIES.map((cat, i) => (
                <Pressable
                  key={cat}
                  className={`px-6 py-3 rounded-2xl border ${i === 0 ? "bg-[#111] border-[#111]" : "bg-white border-gray-100"}`}
                >
                  <Text className={`font-black text-sm ${i === 0 ? "text-white" : "text-gray-400"}`}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* 섹션 타이틀 */}
          <View className="flex-row items-center justify-between mt-12 mb-6">
            <View className="flex-row items-center gap-2">
              <TrendingUp size={20} color="#f59e0b" strokeWidth={3} />
              <Text className="text-gray-900 text-xl font-black">Popular Picks</Text>
            </View>
            <Pressable className="flex-row items-center gap-1">
              <Text className="text-gray-400 text-sm font-bold">View All</Text>
              <ChevronRight size={16} color="#ccc" />
            </Pressable>
          </View>

          {/* 상품 그리드 */}
          <View className="flex-row flex-wrap justify-between">
            {MOCK_GOODS.map((item, idx) => (
              <Animated.View 
                key={item.id} 
                entering={FadeInUp.delay(idx * 100)}
                className="w-[48%] mb-6"
              >
                <Pressable className="bg-white rounded-[32px] p-2 border border-gray-50 shadow-sm overflow-hidden">
                  <View className="bg-gray-50 rounded-[24px] h-40 items-center justify-center mb-4 relative">
                    <Sparkles size={40} color={item.color} opacity={0.3} />
                    <View className="absolute top-3 right-3 bg-white/80 px-2 py-1 rounded-lg backdrop-blur-md">
                       <View className="flex-row items-center gap-1">
                         <Star size={10} color="#f59e0b" fill="#f59e0b" />
                         <Text className="text-[10px] font-black">{item.rating}</Text>
                       </View>
                    </View>
                  </View>
                  
                  <View className="px-3 pb-3">
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{item.category}</Text>
                    <Text className="text-gray-900 font-bold text-sm mb-2" numberOfLines={1}>{item.title}</Text>
                    <View className="flex-row items-center justify-between">
                       <Text className="text-[#f59e0b] font-black text-lg">₩{item.price}</Text>
                       <View className="w-8 h-8 bg-[#111] rounded-lg items-center justify-center">
                          <ShoppingBag size={14} color="#fff" />
                       </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 바텀 플레이팅 버튼 (모바일 트렌드) */}
      <View className="absolute bottom-10 left-0 right-0 items-center pointer-events-none">
         <Animated.View entering={FadeInUp.delay(600)} className="pointer-events-auto">
            <Pressable className="bg-[#111] px-10 py-5 rounded-full shadow-2xl flex-row items-center gap-3">
               <Sparkles size={20} color="#f59e0b" />
               <Text className="text-white font-black text-lg">Create Custom Merch</Text>
            </Pressable>
         </Animated.View>
      </View>
    </View>
  );
}
