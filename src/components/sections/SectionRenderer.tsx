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
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SectionRendererProps {
  sectionIds: string[];
}

export default function SectionRenderer({ sectionIds }: SectionRendererProps) {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true' && !!user;
  const db = useFirestore();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  
  const sectionsQuery = useMemoFirebase(() => {
    return query(collection(db, 'cms_page_sections'));
  }, [db]);

  const { data: allSections, isLoading } = useCollection(sectionsQuery);

  if (isLoading) return <div className="py-20 text-center animate-pulse font-headline text-primary uppercase tracking-widest">Assembling your experience...</div>;
  if (!allSections) return null;

  const orderedSections = sectionIds
    .map(id => allSections.find(s => s.id === id))
    .filter(Boolean);

  const handleSectionClick = (id: string) => {
    if (isEditMode) {
      setActiveSectionId(id);
      window.dispatchEvent(new CustomEvent('verde-select-section', { detail: { id } }));
    }
  };

  return (
    <div className={cn("relative", isEditMode && "pr-96")}>
      {orderedSections.map((section: any) => {
        const data = JSON.parse(section.content || '{}');
        
        let content;
        switch (section.type) {
          case 'Hero': content = <Hero {...data} />; break;
          case 'BrandIntro': content = <BrandIntro {...data} />; break;
          case 'TextBlock': content = <TextBlock {...data} />; break;
          case 'ServicesPreview': content = <ServicesPreview {...data} />; break;
          case 'FeaturedWork': content = <FeaturedWork {...data} />; break;
          case 'Testimonials': content = <Testimonials {...data} />; break;
          case 'InstagramPreview': content = <InstagramPreview {...data} />; break;
          case 'CTA': content = <CTA {...data} />; break;
          case 'FormBlock': content = <FormBlock {...data} />; break;
          case 'VideoBlock': content = <VideoBlock {...data} />; break;
          case 'FAQSection': content = <FAQSection {...data} />; break;
          default: content = null;
        }

        return (
          <div 
            key={section.id} 
            onClick={() => handleSectionClick(section.id)}
            className={cn(
              "relative group/section transition-all duration-300",
              isEditMode && "cursor-pointer hover:ring-4 hover:ring-primary/20",
              isEditMode && activeSectionId === section.id && "ring-4 ring-accent"
            )}
          >
            {isEditMode && (
              <div className="absolute top-4 left-4 z-[60] bg-accent text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover/section:opacity-100 transition-opacity">
                {section.type}
              </div>
            )}
            {content}
          </div>
        );
      })}
    </div>
  );
}
