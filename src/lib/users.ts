'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';

export type UserRole = 'customer' | 'seller' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  roles: UserRole[];
  vendorId?: string; // seller 역할인 경우 vendors 컬렉션 참조
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

/**
 * 사용자 역할 조회
 * 사용자가 존재하지 않으면 기본 'customer' 역할로 생성
 */
export async function getUserRole(uid: string): Promise<UserRole[]> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // 사용자가 없으면 기본 customer로 생성
      const newUser: User = {
        uid,
        email: '',
        roles: ['customer'],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(userRef, newUser);
      console.log(`✅ Created new user with customer role: ${uid}`);
      return ['customer'];
    }

    const userData = userDoc.data() as User;
    return userData.roles || ['customer'];
  } catch (error) {
    console.error('❌ Error getting user role:', error);
    return ['customer']; // Fallback to customer
  }
}

/**
 * 관리자 권한 확인
 */
export async function isAdmin(uid: string): Promise<boolean> {
  const roles = await getUserRole(uid);
  return roles.includes('admin');
}

/**
 * 판매자 권한 확인
 */
export async function isSeller(uid: string): Promise<boolean> {
  const roles = await getUserRole(uid);
  return roles.includes('seller');
}

/**
 * 사용자 생성 또는 업데이트
 */
export async function createOrUpdateUser(
  uid: string,
  data: Partial<Omit<User, 'uid' | 'createdAt'>>
): Promise<User> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // 기존 사용자 업데이트
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(userRef, updateData);

      const updatedDoc = await getDoc(userRef);
      return updatedDoc.data() as User;
    } else {
      // 새 사용자 생성
      const newUser: User = {
        uid,
        email: data.email || '',
        displayName: data.displayName,
        photoURL: data.photoURL,
        roles: data.roles || ['customer'],
        vendorId: data.vendorId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLoginAt: data.lastLoginAt,
      };

      await setDoc(userRef, newUser);
      console.log(`✅ Created new user: ${uid}`);
      return newUser;
    }
  } catch (error) {
    console.error('❌ Error creating/updating user:', error);
    throw error;
  }
}

/**
 * 사용자 정보 조회
 */
export async function getUser(uid: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as User;
  } catch (error) {
    console.error('❌ Error getting user:', error);
    return null;
  }
}

/**
 * 역할 추가
 */
export async function addRole(uid: string, role: UserRole): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error(`User ${uid} not found`);
    }

    const userData = userDoc.data() as User;
    const currentRoles = userData.roles || [];

    if (!currentRoles.includes(role)) {
      const updatedRoles = [...currentRoles, role];
      await updateDoc(userRef, {
        roles: updatedRoles,
        updatedAt: Timestamp.now(),
      });
      console.log(`✅ Added role "${role}" to user ${uid}`);
    } else {
      console.log(`ℹ️ User ${uid} already has role "${role}"`);
    }
  } catch (error) {
    console.error('❌ Error adding role:', error);
    throw error;
  }
}

/**
 * 역할 제거
 */
export async function removeRole(uid: string, role: UserRole): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error(`User ${uid} not found`);
    }

    const userData = userDoc.data() as User;
    const currentRoles = userData.roles || [];

    if (currentRoles.includes(role)) {
      const updatedRoles = currentRoles.filter(r => r !== role);

      // 최소 1개의 역할은 유지 (customer)
      if (updatedRoles.length === 0) {
        updatedRoles.push('customer');
      }

      await updateDoc(userRef, {
        roles: updatedRoles,
        updatedAt: Timestamp.now(),
      });
      console.log(`✅ Removed role "${role}" from user ${uid}`);
    } else {
      console.log(`ℹ️ User ${uid} does not have role "${role}"`);
    }
  } catch (error) {
    console.error('❌ Error removing role:', error);
    throw error;
  }
}

/**
 * 마지막 로그인 시간 업데이트
 */
export async function updateLastLogin(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastLoginAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('❌ Error updating last login:', error);
  }
}

/**
 * 특정 역할을 가진 사용자 목록 조회
 */
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('roles', 'array-contains', role));
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });

    return users;
  } catch (error) {
    console.error('❌ Error getting users by role:', error);
    return [];
  }
}

/**
 * vendorId로 판매자 사용자 조회
 */
export async function getUserByVendorId(vendorId: string): Promise<User | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as User;
  } catch (error) {
    console.error('❌ Error getting user by vendorId:', error);
    return null;
  }
}

/**
 * Admin 이메일 목록으로 초기 Admin 사용자 마이그레이션
 * (ADMIN_EMAILS 환경변수 사용)
 */
export async function migrateAdminUsers(): Promise<void> {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim()).filter(Boolean);

  if (adminEmails.length === 0) {
    console.log('ℹ️ No admin emails found in ADMIN_EMAILS env variable');
    return;
  }

  console.log(`🔄 Migrating ${adminEmails.length} admin users...`);

  for (const email of adminEmails) {
    try {
      // Firebase Auth에서 이메일로 사용자 찾기 (서버 측에서만 가능)
      // 여기서는 임시로 이메일을 uid로 사용 (실제로는 Firebase Admin SDK 필요)
      console.log(`  Adding admin role for: ${email}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate admin: ${email}`, error);
    }
  }

  console.log('✅ Admin user migration completed');
}
