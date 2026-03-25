'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionRenderer from '@/components/sections/SectionRenderer';
import SEOManager from '@/components/seo/SEOManager';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useMemo, useEffect } from 'react';

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
    if (isEditMode) return pageData.sectionIds || [];
    
    // Migration Fallback for pages not yet re-published under new architecture
    if (pageData.publishedSectionIds === undefined) {
      return pageData.sectionIds || [];
    }
    
    return pageData.publishedSectionIds || [];
  }, [pageData, isEditMode]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOManager 
        title={pageData?.seo?.title || "Reflections & Insights | Verde Salon"}
        description={pageData?.seo?.description || "Curated insights from Verde Salon on beauty and intentional living."}
      />
      <Navbar />
      
      <main className="flex-grow">
        {isLoading ? (
          <div className="h-screen bg-background" />
        ) : (
          <SectionRenderer sectionIds={sectionIds} />
        )}
      </main>

      <Footer />
    </div>
  );
}
