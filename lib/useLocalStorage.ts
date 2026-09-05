"use client";

import { useCallback, useSyncExternalStore } from "react";

const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function readFromStorage<T>(key: string, initialValue: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored !== null ? (JSON.parse(stored) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

function getSnapshot<T>(key: string, initialValue: T): T {
  if (!cache.has(key)) {
    cache.set(key, readFromStorage(key, initialValue));
  }
  return cache.get(key) as T;
}

function writeToStorage<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable, keep the in-memory value only
  }
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, onStoreChange: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  const set = listeners.get(key)!;
  set.add(onStoreChange);
  return () => set.delete(onStoreChange);
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const value = useSyncExternalStore(
    useCallback((onStoreChange) => subscribe(key, onStoreChange), [key]),
    () => getSnapshot(key, initialValue),
    () => initialValue,
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(getSnapshot(key, initialValue)) : next;
      writeToStorage(key, resolved);
    },
    [key, initialValue],
  );

  const hydrated = value !== initialValue || cache.has(key);

  return [value, setValue, hydrated] as const;
}
