'use client';

import { useEffect, useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * Converts a hex color to HSL values (as a string "H S% L%")
 */
function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function ThemeManager() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: settings } = useDoc(settingsRef);

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // Apply Colors
    const primary = settings.colors?.primary || '#0F2F2F';
    const background = settings.colors?.background || '#F5F3EF';
    const accent = settings.colors?.accent || '#C6A15B';

    root.style.setProperty('--primary', hexToHsl(primary));
    root.style.setProperty('--background', hexToHsl(background));
    root.style.setProperty('--accent', hexToHsl(accent));

    // Apply Fonts
    const headline = settings.typography?.headline || 'Playfair Display';
    const body = settings.typography?.body || 'Inter';

    root.style.setProperty('--font-headline', `"${headline}", serif`);
    root.style.setProperty('--font-body', `"${body}", sans-serif`);

    // Dynamic Font Injection with display=swap to prevent CLS
    const fontId = 'dynamic-fonts';
    let styleLink = document.getElementById(fontId) as HTMLLinkElement;
    if (!styleLink) {
      styleLink = document.createElement('link');
      styleLink.id = fontId;
      styleLink.rel = 'stylesheet';
      document.head.appendChild(styleLink);
    }
    
    const fontQuery = `family=${headline.replace(/ /g, '+')}:wght@400..900&family=${body.replace(/ /g, '+')}:wght@400..700&display=swap`;
    styleLink.href = `https://fonts.googleapis.com/css2?${fontQuery}`;

  }, [settings]);

  return null;
}
