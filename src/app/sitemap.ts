import type { MetadataRoute } from 'next';

const BASE_URL = 'https://goodzz.co.kr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/create`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/showcase`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/academy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // 동적: 브랜드 스토어 페이지
  let storePages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BASE_URL}/api/store`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.success && data.brands) {
      storePages = data.brands.map((brand: any) => ({
        url: `${BASE_URL}/store/${brand.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch {}

  // 동적: 상품 페이지
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BASE_URL}/api/products?limit=100`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.success && data.products) {
      productPages = data.products.map((p: any) => ({
        url: `${BASE_URL}/shop/${p.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch {}

  return [...staticPages, ...storePages, ...productPages];
}
