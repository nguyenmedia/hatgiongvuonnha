'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { SiteSettings } from '@/types/database.types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    // 1. Read LocalStorage settings first for immediate display
    try {
      const savedLocal = localStorage.getItem('site_settings');
      if (savedLocal) {
        setSettings(JSON.parse(savedLocal));
      }
    } catch (e) {}

    // 2. Fetch latest settings from Supabase
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'site_info')
          .maybeSingle();

        if (data && data.value) {
          setSettings(data.value);
          localStorage.setItem('site_settings', JSON.stringify(data.value));
        }
      } catch (e) {
        console.error('Error fetching site settings from Supabase:', e);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSettings();

    // Listen for custom settings update events (e.g. when saved in Admin)
    const handleSettingsUpdate = () => {
      loadSettings();
    };

    window.addEventListener('settings-updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, []);

  const updateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('site_settings', JSON.stringify(newSettings));
      window.dispatchEvent(new Event('settings-updated'));
    } catch (e) {}
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      settings: DEFAULT_SETTINGS,
      updateSettings: () => {},
      isLoading: false,
    };
  }
  return context;
}
