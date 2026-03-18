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
import { useCollection, useFirestore, useMemoFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, query, doc, getDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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

  async function handleAddSectionAt(index: number, type: string) {
    const pageId = window.location.pathname === '/' ? 'home' : window.location.pathname.replace('/', '');
    const newId = doc(collection(db, 'cms_page_sections')).id;
    
    // Default data for new sections
    const defaults: Record<string, any> = {
      Hero: { title: 'New Story Begins', subtitle: 'Experience luxury.', ctaText: 'Explore', backgroundType: 'image' },
      TextBlock: { title: 'Heading', content: 'Sample text content...', alignment: 'center' },
      CTA: { title: 'Call to Action', subtitle: 'Join us today.', buttonText: 'Contact' },
      VideoBlock: { title: 'Video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      FAQSection: { title: 'Common Queries', subtitle: 'Information' }
    };

    const newSection = {
      id: newId,
      type: type,
      content: JSON.stringify(defaults[type] || { title: `New ${type}` })
    };

    // 1. Create the section
    setDocumentNonBlocking(doc(db, 'cms_page_sections', newId), newSection, { merge: true });

    // 2. Update the page array
    const pageRef = doc(db, 'cms_pages', pageId);
    const pageSnap = await getDoc(pageRef);
    if (pageSnap.exists()) {
      const data = pageSnap.data();
      const currentIds = [...(data.sectionIds || [])];
      currentIds.splice(index, 0, newId);
      setDocumentNonBlocking(pageRef, { ...data, sectionIds: currentIds }, { merge: true });
    }
  }

  const AddButton = ({ index }: { index: number }) => (
    <div className="flex justify-center -my-4 relative z-50 opacity-0 group-hover/builder:opacity-100 transition-opacity">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="rounded-full bg-accent hover:bg-accent/90 shadow-xl border-4 border-white h-10 w-10">
            <Plus className="w-5 h-5 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          {['Hero', 'TextBlock', 'BrandIntro', 'CTA', 'VideoBlock', 'FAQSection'].map(type => (
            <DropdownMenuItem key={type} onClick={() => handleAddSectionAt(index, type)}>
              {type}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className={cn("relative group/builder", isEditMode && "pr-96")}>
      {isEditMode && <AddButton index={0} />}
      
      {orderedSections.map((section: any, idx: number) => {
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
          <div key={section.id}>
            <div 
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
            {isEditMode && <AddButton index={idx + 1} />}
          </div>
        );
      })}
    </div>
  );
}
