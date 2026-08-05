import { useState, useEffect } from 'react';
import { localStore } from '@/utils/storage';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return localStore.get<T>(key, initialValue);
  });

  useEffect(() => {
    localStore.set<T>(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
