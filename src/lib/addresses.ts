import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp, DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

export interface SavedAddress {
  id: string;
  userId: string;
  label: string;           // "집", "회사", "부모님 댁" 등
  name: string;            // 수령인
  phone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  isDefault: boolean;
  createdAt: string;
}

const addressCollection = collection(db, 'addresses');

function docToAddress(data: DocumentData, id: string): SavedAddress {
  return {
    id,
    userId: data.userId || '',
    label: data.label || '',
    name: data.name || '',
    phone: data.phone || '',
    postalCode: data.postalCode || '',
    address: data.address || '',
    addressDetail: data.addressDetail || '',
    isDefault: data.isDefault || false,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

export async function getUserAddresses(userId: string): Promise<SavedAddress[]> {
  const q = query(addressCollection, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => docToAddress(d.data(), d.id))
    .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
}

export async function addAddress(input: Omit<SavedAddress, 'id' | 'createdAt'>): Promise<string | null> {
  try {
    // 기본 배송지로 설정 시 기존 기본 배송지 해제
    if (input.isDefault) {
      const existing = await getUserAddresses(input.userId);
      for (const addr of existing.filter(a => a.isDefault)) {
        await updateDoc(doc(db, 'addresses', addr.id), { isDefault: false });
      }
    }

    const docRef = await addDoc(addressCollection, {
      ...input,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding address:', error);
    return null;
  }
}

export async function updateAddress(addressId: string, data: Partial<SavedAddress>): Promise<boolean> {
  try {
    const { id, createdAt, ...updateData } = data as any;

    // 기본 배송지로 변경 시 기존 해제
    if (updateData.isDefault && updateData.userId) {
      const existing = await getUserAddresses(updateData.userId);
      for (const addr of existing.filter(a => a.isDefault && a.id !== addressId)) {
        await updateDoc(doc(db, 'addresses', addr.id), { isDefault: false });
      }
    }

    await updateDoc(doc(db, 'addresses', addressId), updateData);
    return true;
  } catch (error) {
    console.error('Error updating address:', error);
    return false;
  }
}

export async function deleteAddress(addressId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'addresses', addressId));
    return true;
  } catch (error) {
    console.error('Error deleting address:', error);
    return false;
  }
}
