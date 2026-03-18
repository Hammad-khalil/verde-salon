
'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionRenderer from '@/components/sections/SectionRenderer';
import SEOManager from '@/components/seo/SEOManager';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ServicesPage() {
  const db = useFirestore();
  const pageRef = useMemoFirebase(() => doc(db, 'cms_pages', 'services'), [db]);
  const { data: pageData, isLoading } = useDoc(pageRef);

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
        ) : pageData?.sectionIds && pageData.sectionIds.length > 0 ? (
          <SectionRenderer sectionIds={pageData.sectionIds} />
        ) : (
          <div className="py-40 text-center text-muted-foreground flex flex-col items-center justify-center space-y-6">
            <p className="font-headline text-2xl">Ritual Architecture Pending</p>
            <p className="text-sm font-light max-w-md mx-auto">Please go to the Sanctuary Command (Dashboard) and click "Complete Architecture Now" to initialize this page.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
