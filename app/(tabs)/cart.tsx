import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../../store/useCartStore";
import Animated, { FadeIn, FadeOut, SlideInRight } from "react-native-reanimated";

export default function CartScreen() {
  const { items, updateQuantity, getCartTotal, clearCart } = useCartStore();

  const total = getCartTotal();

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <View className="w-24 h-24 bg-slate-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="cart-outline" size={48} color="#94a3b8" />
        </View>
        <Text className="text-2xl font-bold text-slate-800 mb-2 font-[Inter-Bold]">Your cart is empty</Text>
        <Text className="text-slate-500 text-center mb-8">
          Looks like you haven't added any items to the cart yet. Start shopping to fill it up!
        </Text>
        <TouchableOpacity className="bg-black py-4 px-8 rounded-full shadow-lg shadow-black/20">
          <Text className="text-white font-semibold flex-row text-center text-lg">Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="pt-16 pb-6 px-6 bg-white flex-row items-center justify-between border-b border-slate-100 shadow-sm shadow-slate-200/50 z-10">
        <Text className="text-2xl font-black text-slate-900 font-[Inter-Black]">My Cart</Text>
        <TouchableOpacity onPress={clearCart} className="bg-slate-100 px-4 py-2 rounded-full">
          <Text className="text-sm font-semibold text-slate-600">Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        contentContainerClassName="p-6 pb-40"
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View 
            entering={SlideInRight.delay(index * 100).springify()}
            exiting={FadeOut.duration(200)}
            className="flex-row bg-white p-4 rounded-3xl mb-4 shadow-sm shadow-slate-200/40 border border-slate-100 items-center"
          >
            <View className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
              <Ionicons name="cube-outline" size={32} color="#64748b" />
            </View>
            <View className="flex-1 ml-4 justify-center">
              <Text className="text-lg font-bold text-slate-800 mb-1" numberOfLines={1}>{item.name}</Text>
              <Text className="text-emerald-500 font-bold mb-3">${item.price.toFixed(2)}</Text>
              
              <View className="flex-row items-center space-x-4 bg-slate-50 self-start rounded-full px-2 py-1 border border-slate-200">
                <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} className="w-8 h-8 items-center justify-center bg-white rounded-full shadow-sm">
                  <Ionicons name="remove" size={16} color="#334155" />
                </TouchableOpacity>
                <Text className="font-bold text-slate-700 mx-2">{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} className="w-8 h-8 items-center justify-center bg-black rounded-full shadow-sm shadow-black/30">
                  <Ionicons name="add" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      />

      <Animated.View 
        entering={FadeIn.delay(300).duration(500)}
        className="absolute bottom-0 w-full bg-white rounded-t-[40px] pt-8 pb-10 px-8 shadow-2xl shadow-slate-400 border-t border-slate-100 backdrop-blur-3xl"
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-slate-500 text-lg font-medium">Subtotal</Text>
          <Text className="text-slate-800 text-xl font-bold">${total.toFixed(2)}</Text>
        </View>
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-slate-500 text-lg font-medium">Shipping</Text>
          <Text className="text-emerald-500 text-lg font-semibold">Free</Text>
        </View>
        
        <TouchableOpacity className="bg-black w-full py-5 rounded-full flex-row items-center justify-center shadow-lg shadow-black/20">
          <Text className="text-white font-[Inter-Black] text-xl flex-row">Checkout • ${total.toFixed(2)}</Text>
          <Ionicons name="arrow-forward" size={24} color="#fff" className="ml-2" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
