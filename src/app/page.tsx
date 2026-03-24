'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionRenderer from '@/components/sections/SectionRenderer';
import SEOManager from '@/components/seo/SEOManager';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function Home() {
  const db = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const isEditMode = useMemo(() => searchParams.get('edit') === 'true' && !!user, [searchParams, user]);
  
  const pageRef = useMemoFirebase(() => {
    return doc(db, 'cms_pages', 'home');
  }, [db]);

  const { data: pageData, isLoading } = useDoc(pageRef);

  // STRICT SEPARATION: Public view ONLY uses publishedSectionIds
  const sectionIds = useMemo(() => {
    if (!pageData) return [];
    return isEditMode 
      ? (pageData.sectionIds || []) 
      : (pageData.publishedSectionIds || []);
  }, [pageData, isEditMode]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOManager 
        title={pageData?.seo?.title || "Luxury Hair & Beauty Experience"}
        description={pageData?.seo?.description || "Experience natural elegance and sustainable luxury at Verde Salon."}
        keywords={pageData?.seo?.keywords}
      />
      <Navbar />
      
      <main className="flex-grow">
        {isLoading ? (
          <div className="h-screen flex items-center justify-center animate-pulse font-headline text-primary tracking-widest">
            VERDE
          </div>
        ) : sectionIds.length > 0 ? (
          <SectionRenderer sectionIds={sectionIds} />
        ) : (
          <div className="py-40 text-center text-muted-foreground flex flex-col items-center justify-center space-y-6">
            <p className="font-headline text-2xl">Welcome to Verde Salon</p>
            <p className="text-sm font-light max-w-md mx-auto">
              {isEditMode 
                ? "Start building your sanctuary by adding sections below." 
                : "This page is currently being prepared. Please check back soon."}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
