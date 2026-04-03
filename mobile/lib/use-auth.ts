import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiFetch } from './api';

interface User {
  id: string;
  email: string;
  nickname: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await apiFetch<User>('/auth/profile');
      setUser(profile);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync('userToken');
    setUser(null);
  }, []);

  return { user, loading, signOut, refreshProfile: fetchProfile };
}
