'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionRenderer from '@/components/sections/SectionRenderer';
import SEOManager from '@/components/seo/SEOManager';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function ServicesPage() {
  const db = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const isEditMode = useMemo(() => searchParams.get('edit') === 'true' && !!user, [searchParams, user]);

  const pageRef = useMemoFirebase(() => doc(db, 'cms_pages', 'services'), [db]);
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
        title={pageData?.seo?.title || "Signature Rituals | Verde Salon"}
        description={pageData?.seo?.description || "Explore our curated menu of hair, skin, and nail rituals at Verde Salon."}
      />
      <Navbar />
      
      <main className="flex-grow">
        {isLoading ? (
          <div className="h-screen flex items-center justify-center animate-pulse font-headline text-primary tracking-widest bg-background">
            VERDE RITUALS
          </div>
        ) : pageData ? (
          sectionIds.length > 0 ? (
            <SectionRenderer sectionIds={sectionIds} />
          ) : (
            /* ⚠️ CRITICAL: Do NOT modify fallback unless CMS data is truly empty. */
            <div className="py-40 text-center text-muted-foreground flex flex-col items-center justify-center space-y-6">
              <p className="font-headline text-2xl">Ritual Architecture Pending</p>
              <p className="text-sm font-light max-w-md mx-auto">
                {isEditMode 
                  ? "Initialize the Services page in the Sanctuary Command to start editing."
                  : "We are currently updating our ritual menu. Please check back shortly."}
              </p>
            </div>
          )
        ) : (
          <div className="py-40 text-center text-muted-foreground flex flex-col items-center justify-center space-y-6">
            <p className="font-headline text-2xl">Architecture Pending</p>
            <p className="text-sm font-light max-w-md mx-auto">
              Initialize the Services page in the Sanctuary Command to begin.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
