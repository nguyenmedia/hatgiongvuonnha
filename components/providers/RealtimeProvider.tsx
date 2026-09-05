'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useToast } from './ToastProvider';

interface RealtimeContextType {
  lastUpdated: number;
  isRealtimeActive: boolean;
  notifyChange: (type?: string, payload?: any) => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  lastUpdated: Date.now(),
  isRealtimeActive: false,
  notifyChange: () => {},
});

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(true);
  const { info } = useToast();

  const notifyChange = useCallback((type?: string, payload?: any) => {
    const now = Date.now();
    setLastUpdated(now);

    // 1. Broadcast via BroadcastChannel API (cross-tab in browser)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('hatgiong_sync_channel');
        bc.postMessage({ type: type || 'change', payload, timestamp: now });
        bc.close();
      }
    } catch (e) {}

    // 2. Broadcast via localStorage storage event (supported in 100% browsers)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hatgiong_realtime_ping', JSON.stringify({ type, timestamp: now }));
      }
    } catch (e) {}
  }, []);

  // Listen for cross-tab messages
  useEffect(() => {
    // 1. BroadcastChannel listener
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('hatgiong_sync_channel');
        bc.onmessage = (event) => {
          if (event.data?.timestamp) {
            setLastUpdated(event.data.timestamp);
          }
        };
      }
    } catch (e) {}

    // 2. Storage event listener (fires when other tabs update localStorage)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'hatgiong_realtime_ping' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          setLastUpdated(data.timestamp || Date.now());
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Supabase Realtime Postgres Changes
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    try {
      const channel = supabase
        .channel('public-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            setLastUpdated(Date.now());
            info('Dữ liệu sản phẩm vừa được đồng bộ tự động từ hệ thống.');
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            setLastUpdated(Date.now());
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'settings' },
          (payload) => {
            setLastUpdated(Date.now());
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          (payload) => {
            setLastUpdated(Date.now());
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsRealtimeActive(true);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <RealtimeContext.Provider value={{ lastUpdated, isRealtimeActive, notifyChange }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
