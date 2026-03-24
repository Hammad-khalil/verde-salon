'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Image from 'next/image';

/**
 * Preloader - A high-end, minimal loading experience.
 * Centers the brand logo with an atmospheric pulse and blurs the background.
 */
export default function Preloader() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: settings } = useDoc(settingsRef);
  
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Listen for the 'complete' signal from SectionRenderer
  useEffect(() => {
    const handleProgress = (e: any) => {
      if (e.detail?.progress === 100) {
        // Data is fully loaded
        const timer = setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => setIsVisible(false), 1000);
        }, 500);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('verde-progress', handleProgress);
    return () => window.removeEventListener('verde-progress', handleProgress);
  }, []);

  if (!isVisible) return null;

  // Resolve Logo: Use published logo, fallback to draft, then to null
  const logoUrl = settings?.published?.logo?.url || settings?.logo?.url;
  const siteName = settings?.published?.siteName || settings?.siteName || 'VERDE';

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-2xl transition-all duration-1000 ease-in-out",
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="relative flex flex-col items-center space-y-8 animate-fade-in">
        
        {/* Central Brand Mark with Atmospheric Pulse */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-accent/5 rounded-full animate-ping opacity-20" />
          
          <div className="relative transition-all duration-1000 animate-pulse flex flex-col items-center">
            {logoUrl ? (
              <div className="relative w-24 h-24">
                <Image 
                  src={logoUrl} 
                  alt={siteName} 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <h1 className="font-headline text-3xl text-primary tracking-[0.4em] uppercase font-light">
                {siteName}
              </h1>
            )}
          </div>
        </div>

        {/* Minimal Loading Text */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-bold opacity-40">
            Loading
          </span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1 h-1 bg-accent rounded-full animate-bounce" />
          </div>
        </div>

      </div>
    </div>
  );
}
