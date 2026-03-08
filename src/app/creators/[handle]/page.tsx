import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCreatorByHandle, getCreatorProductsByHandle } from '@/lib/creators';
import { Store, ExternalLink, Instagram, Youtube, Globe, ShoppingBag } from 'lucide-react';

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const creator = await getCreatorByHandle(handle);
  if (!creator) return { title: '크리에이터를 찾을 수 없습니다' };

  return {
    title: `${creator.shopName} - 크리에이터 샵`,
    description: creator.bio || `${creator.displayName}의 크리에이터 샵`,
    openGraph: {
      title: creator.shopName,
      description: creator.bio,
      images: creator.profileImage ? [creator.profileImage] : [],
    },
  };
}

export default async function CreatorStorePage({ params }: Props) {
  const { handle } = await params;
  const creator = await getCreatorByHandle(handle);

  if (!creator) {
    notFound();
  }

  const products = await getCreatorProductsByHandle(handle);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero / Cover */}
      <div className="relative h-64 bg-gradient-to-r from-emerald-600 to-teal-600">
        {creator.coverImage && (
          <Image src={creator.coverImage} alt="" fill className="object-cover" unoptimized />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
          <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-lg overflow-hidden relative shrink-0">
            {creator.profileImage ? (
              <Image src={creator.profileImage} alt={creator.displayName} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                <Store className="text-emerald-600" size={40} />
              </div>
            )}
          </div>

          <div className="flex-1 pt-2">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{creator.shopName}</h1>
              {creator.isVerified && (
                <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">인증됨</span>
              )}
            </div>
            <p className="text-gray-500 mb-3">@{creator.handle} · {creator.displayName}</p>
            {creator.bio && <p className="text-gray-600 text-sm mb-4 max-w-lg">{creator.bio}</p>}

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span><strong className="text-gray-900">{creator.productCount}</strong> 상품</span>
              <span><strong className="text-gray-900">{creator.followerCount}</strong> 팔로워</span>
              <span><strong className="text-gray-900">{creator.totalSales}</strong> 판매</span>
            </div>

            {/* Social Links */}
            {(creator.socialLinks?.instagram || creator.socialLinks?.youtube || creator.socialLinks?.website) && (
              <div className="flex items-center gap-3 mt-4">
                {creator.socialLinks.instagram && (
                  <a href={`https://instagram.com/${creator.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Instagram size={16} className="text-gray-600" />
                  </a>
                )}
                {creator.socialLinks.youtube && (
                  <a href={creator.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Youtube size={16} className="text-gray-600" />
                  </a>
                )}
                {creator.socialLinks.website && (
                  <a href={creator.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Globe size={16} className="text-gray-600" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="border-t border-gray-100 pt-8 pb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            <ShoppingBag className="inline mr-2" size={20} />
            상품 ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <Store className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-400">아직 등록된 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/shop/${product.productId}`} className="group">
                  <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative mb-3">
                    <Image
                      src={product.designUrl}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-emerald-600 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-emerald-600 font-bold text-sm">{product.price.toLocaleString()}원</p>
                  {product.salesCount > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{product.salesCount}개 판매</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
