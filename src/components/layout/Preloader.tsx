'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

/**
 * Preloader - A professional, minimal loading experience for Verde Salon.
 * Blurs the background while real data is fetched and shows progress from 0-100%.
 */
export default function Preloader() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: settings, isLoading: settingsLoading } = useDoc(settingsRef);
  
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Listen for real data progress events from pages and renderers
  useEffect(() => {
    const handleProgress = (e: any) => {
      const newProgress = e.detail?.progress || 0;
      setProgress((prev) => Math.max(prev, newProgress));
    };

    window.addEventListener('verde-progress', handleProgress);
    return () => window.removeEventListener('verde-progress', handleProgress);
  }, []);

  // Initial Identity Sync (Settings)
  useEffect(() => {
    if (!settingsLoading) {
      window.dispatchEvent(new CustomEvent('verde-progress', { detail: { progress: 25 } }));
    }
  }, [settingsLoading]);

  // Completion sequence
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => setIsVisible(false), 1000);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/60 backdrop-blur-2xl transition-all duration-1000 ease-in-out",
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="relative flex flex-col items-center space-y-12 max-w-xs w-full px-6">
        {/* Minimal Brand Signature */}
        <div className="flex flex-col items-center space-y-2">
          <h1 className="font-headline text-2xl md:text-3xl text-primary tracking-[0.3em] uppercase font-light animate-pulse">
            Verde Salon
          </h1>
          <div className="h-px w-8 bg-accent/40" />
        </div>

        {/* Real Progress Display */}
        <div className="w-full flex flex-col items-center space-y-6">
          <div className="font-headline text-4xl md:text-5xl font-light text-primary/80 tabular-nums tracking-tighter">
            {Math.round(progress)}%
          </div>
          
          {/* Hairline Progress Bar */}
          <div className="h-[1px] w-full bg-primary/5 relative overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-accent transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="text-[8px] text-muted-foreground uppercase tracking-[0.4em] font-bold opacity-40">
          Refining Vision
        </div>
      </div>
    </div>
  );
}
