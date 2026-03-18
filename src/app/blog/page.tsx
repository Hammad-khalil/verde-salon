'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionRenderer from '@/components/sections/SectionRenderer';
import SEOManager from '@/components/seo/SEOManager';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function BlogPage() {
  const db = useFirestore();
  
  const pageRef = useMemoFirebase(() => doc(db, 'cms_pages', 'blog'), [db]);
  const { data: pageData, isLoading } = useDoc(pageRef);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOManager 
        title={pageData?.seo?.title || "Rituals & Reflections | Verde Salon"}
        description={pageData?.seo?.description || "Curated insights from Verde Salon on beauty, sustainability, and intentional living."}
        keywords={pageData?.seo?.keywords}
      />
      <Navbar />
      
      <main className="flex-grow">
        {isLoading ? (
          <div className="h-screen flex items-center justify-center animate-pulse font-headline text-primary tracking-widest bg-background">
            VERDE JOURNAL
          </div>
        ) : pageData?.sectionIds ? (
          <SectionRenderer sectionIds={pageData.sectionIds} />
        ) : (
          <div className="py-40 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
            <p className="font-headline text-2xl">Journal Still Processing</p>
            <p className="text-sm font-light">Please initialize the Blog page in the Sanctuary Command.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
