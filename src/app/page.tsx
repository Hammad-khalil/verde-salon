'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionRenderer from '@/components/sections/SectionRenderer';
import SEOManager from '@/components/seo/SEOManager';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function Home() {
  const db = useFirestore();
  
  const pageRef = useMemoFirebase(() => {
    return doc(db, 'cms_pages', 'home');
  }, [db]);

  const { data: pageData, isLoading } = useDoc(pageRef);

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
        ) : pageData?.sectionIds ? (
          <SectionRenderer sectionIds={pageData.sectionIds} />
        ) : (
          <div className="py-40 text-center text-muted-foreground">
            Welcome to Verde Salon. Please configure your Home page in the CMS.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
