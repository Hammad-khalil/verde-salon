'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionRenderer from '@/components/sections/SectionRenderer';
import SEOManager from '@/components/seo/SEOManager';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useMemo, useEffect } from 'react';

export default function ServicesPage() {
  const db = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const isEditMode = useMemo(() => searchParams.get('edit') === 'true' && !!user, [searchParams, user]);

  const pageRef = useMemoFirebase(() => doc(db, 'cms_pages', 'services'), [db]);
  const { data: pageData, isLoading } = useDoc(pageRef);

  // Emit progress once page document is resolved
  useEffect(() => {
    if (!isLoading) {
      window.dispatchEvent(new CustomEvent('verde-progress', { detail: { progress: 50 } }));
    }
  }, [isLoading]);

  // STRICT SEPARATION: Public view ONLY uses publishedSectionIds
  const sectionIds = useMemo(() => {
    if (!pageData) return [];
    if (isEditMode) return pageData.sectionIds || [];
    
    // ⚠️ CRITICAL: Migration Fallback
    if (pageData.publishedSectionIds === undefined) {
      return pageData.sectionIds || [];
    }
    
    return pageData.publishedSectionIds || [];
  }, [pageData, isEditMode]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOManager 
        title={pageData?.seo?.title || "Signature Services | Verde Salon"}
        description={pageData?.seo?.description || "Explore our curated menu of hair, skin, and nail services at Verde Salon."}
      />
      <Navbar />
      
      <main className="flex-grow">
        {isLoading ? (
          <div className="h-screen bg-background" />
        ) : pageData ? (
          <>
            {sectionIds.length > 0 ? (
              <SectionRenderer sectionIds={sectionIds} />
            ) : (
              /* ⚠️ CRITICAL: Do NOT modify fallback unless CMS data is truly empty. */
              <div className="py-40 text-center text-muted-foreground flex flex-col items-center justify-center space-y-6">
                <p className="font-headline text-2xl">Services Architecture Pending</p>
                <p className="text-sm font-light max-w-md mx-auto">
                  {isEditMode 
                    ? "Initialize the Services page in the Sanctuary Command to start editing."
                    : "We are currently updating our service menu. Please check back shortly."}
                </p>
              </div>
            )}
            
            {/* Floating WhatsApp Button - Modern, Minimal, Bottom-Right */}
            {!isEditMode && <WhatsAppButton />}
          </>
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
