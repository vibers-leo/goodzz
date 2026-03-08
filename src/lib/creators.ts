import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Creator {
  uid: string;
  handle: string; // URL-friendly unique identifier
  displayName: string;
  shopName: string;
  bio: string;
  profileImage: string;
  coverImage?: string;
  socialLinks: {
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  commissionRate: number; // Platform commission (default 30%)
  totalSales: number;
  totalRevenue: number;
  productCount: number;
  followerCount: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorProduct {
  id?: string;
  creatorUid: string;
  creatorHandle: string;
  productId: string; // Reference to base product
  title: string;
  description: string;
  designUrl: string;
  price: number;
  baseProductPrice: number;
  category: string;
  tags: string[];
  salesCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Payout {
  id?: string;
  creatorUid: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  period: string; // e.g. "2026-03"
  orderIds: string[];
  processedAt?: string;
  createdAt: string;
}

const creatorsCollection = collection(db, 'creators');
const creatorProductsCollection = collection(db, 'creator_products');
const payoutsCollection = collection(db, 'payouts');

// ============ Creator Registration & Profile ============

export async function registerCreator(data: {
  uid: string;
  handle: string;
  displayName: string;
  shopName: string;
  bio: string;
  profileImage: string;
}): Promise<boolean> {
  try {
    // Check handle uniqueness
    const existing = await getCreatorByHandle(data.handle);
    if (existing) {
      throw new Error('이미 사용 중인 핸들입니다.');
    }

    const creator: Creator = {
      ...data,
      coverImage: '',
      socialLinks: {},
      commissionRate: 30,
      totalSales: 0,
      totalRevenue: 0,
      productCount: 0,
      followerCount: 0,
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(creatorsCollection, data.uid), creator);
    return true;
  } catch (error) {
    console.error('Creator registration error:', error);
    throw error;
  }
}

export async function getCreatorByUid(uid: string): Promise<Creator | null> {
  try {
    const docRef = doc(creatorsCollection, uid);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as Creator;
  } catch {
    return null;
  }
}

export async function getCreatorByHandle(handle: string): Promise<Creator | null> {
  try {
    const q = query(creatorsCollection, where('handle', '==', handle), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Creator;
  } catch {
    return null;
  }
}

export async function updateCreatorProfile(uid: string, updates: Partial<Creator>): Promise<boolean> {
  try {
    const docRef = doc(creatorsCollection, uid);
    await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
    return true;
  } catch {
    return false;
  }
}

export async function getAllCreators(options?: {
  limitCount?: number;
  onlyActive?: boolean;
}): Promise<Creator[]> {
  try {
    let q;
    if (options?.onlyActive) {
      q = query(creatorsCollection, where('isActive', '==', true), limit(options?.limitCount || 50));
    } else {
      q = query(creatorsCollection, limit(options?.limitCount || 50));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as Creator);
  } catch {
    return [];
  }
}

// ============ Creator Products ============

export async function createCreatorProduct(product: Omit<CreatorProduct, 'id' | 'salesCount' | 'isActive' | 'createdAt'>): Promise<string | null> {
  try {
    const docRef = await addDoc(creatorProductsCollection, {
      ...product,
      salesCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    // Update creator's product count
    const creatorRef = doc(creatorsCollection, product.creatorUid);
    const creatorSnap = await getDoc(creatorRef);
    if (creatorSnap.exists()) {
      await updateDoc(creatorRef, {
        productCount: (creatorSnap.data().productCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Create creator product error:', error);
    return null;
  }
}

export async function getCreatorProducts(creatorUid: string): Promise<CreatorProduct[]> {
  try {
    const q = query(creatorProductsCollection, where('creatorUid', '==', creatorUid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CreatorProduct));
  } catch {
    return [];
  }
}

export async function getCreatorProductsByHandle(handle: string): Promise<CreatorProduct[]> {
  try {
    const q = query(
      creatorProductsCollection,
      where('creatorHandle', '==', handle),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CreatorProduct));
  } catch {
    return [];
  }
}

// ============ Payouts ============

export async function getCreatorPayouts(creatorUid: string): Promise<Payout[]> {
  try {
    const q = query(payoutsCollection, where('creatorUid', '==', creatorUid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Payout));
  } catch {
    return [];
  }
}

export async function getCreatorStats(creatorUid: string) {
  try {
    const creator = await getCreatorByUid(creatorUid);
    const products = await getCreatorProducts(creatorUid);
    const payouts = await getCreatorPayouts(creatorUid);

    const totalEarnings = payouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayout = payouts
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalSales: creator?.totalSales || 0,
      totalRevenue: creator?.totalRevenue || 0,
      totalEarnings,
      pendingPayout,
      productCount: products.length,
      activeProducts: products.filter(p => p.isActive).length,
    };
  } catch {
    return {
      totalSales: 0,
      totalRevenue: 0,
      totalEarnings: 0,
      pendingPayout: 0,
      productCount: 0,
      activeProducts: 0,
    };
  }
}
