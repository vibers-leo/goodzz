import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../../store/useCartStore";
import Animated, { FadeInDown } from "react-native-reanimated";

const PRODUCTS = [
  { id: "1", name: "Premium Hoodie", price: 89.99, image: "cube-outline", cat: "Featured" },
  { id: "2", name: "Cyber Sneakers", price: 149.99, image: "cube-outline", cat: "New" },
  { id: "3", name: "Minimalist Watch", price: 299.99, image: "cube-outline", cat: "Accessories" },
  { id: "4", name: "Canvas Backpack", price: 119.50, image: "cube-outline", cat: "Trending" },
];

export default function HomeScreen() {
  const { addItem, items } = useCartStore();
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <View className="flex-1 bg-white">
      <View className="pt-16 pb-4 px-6 bg-white flex-row justify-between items-center bg-slate-50/80 backdrop-blur-xl z-10">
        <View>
          <Text className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Welcome back</Text>
          <Text className="text-3xl font-black text-slate-900 font-[Inter-Black]">GOODZZ</Text>
        </View>
        <TouchableOpacity className="relative bg-slate-100 p-3 rounded-full">
          <Ionicons name="cart-outline" size={24} color="#0f172a" />
          {cartItemCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center shadow-sm">
              <Text className="text-white text-xs font-bold">{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={PRODUCTS}
        numColumns={2}
        contentContainerClassName="p-4 pb-24"
        showsVerticalScrollIndicator={false}
        columnWrapperClassName="justify-between"
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View 
            entering={FadeInDown.delay(index * 150).springify()}
            className="w-[48%] bg-slate-50 p-4 rounded-3xl mb-4 shadow-sm shadow-slate-200 border border-slate-100/50 flex-col items-center"
          >
            <View className="bg-white px-2 py-1 rounded-full absolute top-3 left-3 z-10 shadow-sm border border-slate-100">
              <Text className="text-xs font-bold text-slate-600">{item.cat}</Text>
            </View>
            <View className="w-full h-32 bg-white rounded-2xl flex items-center justify-center mb-4 mt-2 border border-slate-100 shadow-sm">
              <Ionicons name="cube-outline" size={48} color="#cbd5e1" />
            </View>
            <Text className="font-bold text-slate-800 text-lg mb-1 w-full" numberOfLines={1}>{item.name}</Text>
            <Text className="text-emerald-500 font-bold w-full mb-4">${item.price}</Text>

            <TouchableOpacity 
              onPress={() => addItem({ id: item.id, name: item.name, price: item.price, image: item.image })}
              className="bg-black py-3 rounded-2xl w-full flex-row justify-center items-center shadow-md shadow-black/20"
            >
              <Text className="text-white font-bold mr-2 text-sm">Add to Cart</Text>
              <Ionicons name="add-circle" size={18} color="white" />
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}
