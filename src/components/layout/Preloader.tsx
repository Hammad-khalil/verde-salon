'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Preloader - A luxury full-screen loading state that prevents
 * unstyled content (FOUC) and logo flickering on initial load.
 */
export default function Preloader() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: settings, isLoading } = useDoc(settingsRef);
  
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Artificial progress for premium feel
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Once data is no longer loading and settings are found
    if (!isLoading && settings) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsExiting(true);
        // Wait for animation to finish
        setTimeout(() => setIsVisible(false), 800);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, settings]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F2F2F] transition-all duration-1000 ease-in-out",
        isExiting ? "opacity-0 pointer-events-none translate-y-[-20px]" : "opacity-100"
      )}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C6A15B]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C6A15B]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-12 max-w-md w-full px-12">
        {/* Brand Signature */}
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <div className="p-4 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
            <Sparkles className="w-8 h-8 text-[#C6A15B] animate-pulse" />
          </div>
          <h1 className="font-headline text-3xl md:text-4xl text-white tracking-[0.4em] uppercase font-light">
            Verde Salon
          </h1>
          <p className="text-[#C6A15B] text-[10px] uppercase tracking-[0.5em] font-bold opacity-60">
            Timeless Sanctuary
          </p>
        </div>

        {/* Progress System */}
        <div className="w-full space-y-4">
          <div className="h-[1px] w-full bg-white/10 relative overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-[#C6A15B] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-white/40">
            <span>Synchronizing Identity</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[8px] text-[#C6A15B] uppercase tracking-[0.3em] font-bold animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Refining Aesthetic</span>
        </div>
      </div>

      {/* Aesthetic Signature Footer */}
      <div className="absolute bottom-12 text-[9px] text-white/20 uppercase tracking-[0.6em] font-bold">
        Naturally Defined
      </div>
    </div>
  );
}
