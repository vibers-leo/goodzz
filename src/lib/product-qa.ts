import {
  collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy, Timestamp, DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

export interface ProductQA {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  subject: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
  isSecret: boolean;
  email?: string;
  createdAt: string;
}

const qaCollection = collection(db, 'productQA');

function docToQA(data: DocumentData, id: string): ProductQA {
  return {
    id,
    productId: data.productId || '',
    userId: data.userId || '',
    userName: data.userName || '',
    subject: data.subject || '',
    question: data.question || '',
    answer: data.answer,
    answeredBy: data.answeredBy,
    answeredAt: data.answeredAt?.toDate?.()?.toISOString() || data.answeredAt,
    isSecret: data.isSecret || false,
    email: data.email,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

export async function getQAsByProduct(productId: string): Promise<ProductQA[]> {
  try {
    const q = query(qaCollection, where('productId', '==', productId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => docToQA(d.data(), d.id));
  } catch {
    const q = query(qaCollection, where('productId', '==', productId));
    const snap = await getDocs(q);
    return snap.docs.map(d => docToQA(d.data(), d.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function getQAsByUser(userId: string): Promise<ProductQA[]> {
  const q = query(qaCollection, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => docToQA(d.data(), d.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllQAs(): Promise<ProductQA[]> {
  const snap = await getDocs(qaCollection);
  return snap.docs.map(d => docToQA(d.data(), d.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getUnansweredQAs(): Promise<ProductQA[]> {
  const all = await getAllQAs();
  return all.filter(qa => !qa.answer);
}

export async function createQA(input: Omit<ProductQA, 'id' | 'createdAt'>): Promise<string | null> {
  try {
    const docRef = await addDoc(qaCollection, {
      ...input,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating Q&A:', error);
    return null;
  }
}

export async function answerQA(qaId: string, answer: string, answeredBy: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'productQA', qaId), {
      answer,
      answeredBy,
      answeredAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error answering Q&A:', error);
    return false;
  }
}
