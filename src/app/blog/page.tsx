'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionRenderer from '@/components/sections/SectionRenderer';
import SEOManager from '@/components/seo/SEOManager';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function BlogPage() {
  const db = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const isEditMode = useMemo(() => searchParams.get('edit') === 'true' && !!user, [searchParams, user]);

  const pageRef = useMemoFirebase(() => doc(db, 'cms_pages', 'blog'), [db]);
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
        title={pageData?.seo?.title || "Rituals & Reflections | Verde Salon"}
        description={pageData?.seo?.description || "Curated insights from Verde Salon on beauty and intentional living."}
      />
      <Navbar />
      
      <main className="flex-grow">
        {isLoading ? (
          <div className="h-screen flex items-center justify-center animate-pulse font-headline text-primary tracking-widest bg-background">
            VERDE JOURNAL
          </div>
        ) : sectionIds && sectionIds.length > 0 ? (
          <SectionRenderer sectionIds={sectionIds} />
        ) : (
          /* ⚠️ CRITICAL: Do NOT modify fallback unless CMS data is truly empty. This previously broke the page renderer. */
          <div className="py-40 text-center text-muted-foreground flex flex-col items-center justify-center space-y-6">
            <p className="font-headline text-2xl">Journal Architecture Pending</p>
            <p className="text-sm font-light max-w-md mx-auto">
              {isEditMode 
                ? "Initialize the Blog page in the Sanctuary Command to start editing."
                : "Our journal is currently being curated. New reflections coming soon."}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
