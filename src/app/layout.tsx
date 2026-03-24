import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import AnalyticsManager from '@/components/analytics/AnalyticsManager';
import ThemeManager from '@/components/theme/ThemeManager';
import LiveEditorSidebar from '@/components/admin/LiveEditorSidebar';
import Preloader from '@/components/layout/Preloader';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'VERDE SALON | Timeless Beauty, Naturally Defined',
  description: 'Experience luxury and serenity at Verde Salon. Expert hair styling, skincare, and nail care in a minimal, nature-inspired environment.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-body)' }}>
        <FirebaseClientProvider>
          {/* Global Preloader - Prevents logo/theme flicker */}
          <Preloader />
          
          <ThemeManager />
          <AnalyticsManager />
          <div className="flex-grow flex flex-col relative">
            {children}
            <Suspense fallback={null}>
              <LiveEditorSidebar />
            </Suspense>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
