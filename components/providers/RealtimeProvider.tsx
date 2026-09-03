'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useToast } from './ToastProvider';

interface RealtimeContextType {
  lastUpdated: number;
  isRealtimeActive: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
  lastUpdated: Date.now(),
  isRealtimeActive: false,
});

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);
  const { info } = useToast();

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    try {
      const channel = supabase
        .channel('public-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            console.log('[Realtime] Product update received:', payload);
            setLastUpdated(Date.now());
            info('Dữ liệu sản phẩm vừa được đồng bộ tự động từ hệ thống.');
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('[Realtime] Order update received:', payload);
            setLastUpdated(Date.now());
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'settings' },
          (payload) => {
            console.log('[Realtime] Settings update received:', payload);
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
    <RealtimeContext.Provider value={{ lastUpdated, isRealtimeActive }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
