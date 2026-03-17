'use client';

import Hero from './Hero';
import BrandIntro from './BrandIntro';
import TextBlock from './TextBlock';
import ServicesPreview from './ServicesPreview';
import FeaturedWork from './FeaturedWork';
import Testimonials from './Testimonials';
import InstagramPreview from './InstagramPreview';
import CTA from './CTA';
import FormBlock from './FormBlock';
import VideoBlock from './VideoBlock';
import FAQSection from './FAQSection';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

interface SectionRendererProps {
  sectionIds: string[];
}

export default function SectionRenderer({ sectionIds }: SectionRendererProps) {
  const db = useFirestore();
  
  const sectionsQuery = useMemoFirebase(() => {
    return query(collection(db, 'cms_page_sections'));
  }, [db]);

  const { data: allSections, isLoading } = useCollection(sectionsQuery);

  if (isLoading) return <div className="py-20 text-center animate-pulse font-headline text-primary uppercase tracking-widest">Assembling your experience...</div>;
  if (!allSections) return null;

  const orderedSections = sectionIds
    .map(id => allSections.find(s => s.id === id))
    .filter(Boolean);

  return (
    <>
      {orderedSections.map((section: any) => {
        const data = JSON.parse(section.content || '{}');
        
        switch (section.type) {
          case 'Hero':
            return <Hero key={section.id} {...data} />;
          case 'BrandIntro':
            return <BrandIntro key={section.id} {...data} />;
          case 'TextBlock':
            return <TextBlock key={section.id} {...data} />;
          case 'ServicesPreview':
            return <ServicesPreview key={section.id} {...data} />;
          case 'FeaturedWork':
            return <FeaturedWork key={section.id} {...data} />;
          case 'Testimonials':
            return <Testimonials key={section.id} {...data} />;
          case 'InstagramPreview':
            return <InstagramPreview key={section.id} {...data} />;
          case 'CTA':
            return <CTA key={section.id} {...data} />;
          case 'FormBlock':
            return <FormBlock key={section.id} {...data} />;
          case 'VideoBlock':
            return <VideoBlock key={section.id} {...data} />;
          case 'FAQSection':
            return <FAQSection key={section.id} {...data} />;
          default:
            return null;
        }
      })}
    </>
  );
}
