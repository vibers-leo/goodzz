import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy, limit as firestoreLimit, where, increment } from 'firebase/firestore';
import { db } from './firebase';

export interface ShowcaseItem {
  id?: string;
  userId: string;
  userName: string;
  userPhoto: string;
  designUrl: string;
  prompt: string;
  style: string;
  productType: string;
  likes: number;
  remixCount: number;
  isPublic: boolean;
  createdAt: string;
}

export async function publishToShowcase(
  item: Omit<ShowcaseItem, 'id' | 'likes' | 'remixCount' | 'createdAt'>
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'showcase'), {
      ...item,
      likes: 0,
      remixCount: 0,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error publishing to showcase:', error);
    return null;
  }
}

export async function getShowcaseItems(options?: {
  limit?: number;
  style?: string;
}): Promise<ShowcaseItem[]> {
  try {
    const showcaseRef = collection(db, 'showcase');
    const constraints: Parameters<typeof query>[1][] = [
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
    ];

    if (options?.style) {
      constraints.push(where('style', '==', options.style));
    }

    if (options?.limit) {
      constraints.push(firestoreLimit(options.limit));
    }

    const q = query(showcaseRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ShowcaseItem[];
  } catch (error) {
    console.error('Error fetching showcase items:', error);
    return [];
  }
}

export async function likeShowcaseItem(itemId: string): Promise<void> {
  try {
    const itemRef = doc(db, 'showcase', itemId);
    await updateDoc(itemRef, {
      likes: increment(1),
    });
  } catch (error) {
    console.error('Error liking showcase item:', error);
  }
}

export async function getPopularShowcaseItems(count: number): Promise<ShowcaseItem[]> {
  try {
    const showcaseRef = collection(db, 'showcase');
    const q = query(
      showcaseRef,
      where('isPublic', '==', true),
      orderBy('likes', 'desc'),
      firestoreLimit(count)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ShowcaseItem[];
  } catch (error) {
    console.error('Error fetching popular showcase items:', error);
    return [];
  }
}
