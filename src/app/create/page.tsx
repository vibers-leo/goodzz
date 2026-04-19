import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CreateClientContent from '@/components/CreateClientContent';

export default async function CreatePage() {
  const products: any[] = [];

  return (
    <main className="min-h-[100dvh]">
      <Navbar />
      <CreateClientContent products={products} />
      <Footer />
    </main>
  );
}
