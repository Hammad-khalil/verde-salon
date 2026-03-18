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
import { useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Plus, Trash2, Edit2, Layout, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface SectionRendererProps {
  sectionIds: string[];
}

export default function SectionRenderer({ sectionIds }: SectionRendererProps) {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isEditMode = searchParams.get('edit') === 'true' && !!user;
  const db = useFirestore();
  const { toast } = useToast();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  
  const sectionsQuery = useMemoFirebase(() => {
    return query(collection(db, 'cms_page_sections'));
  }, [db]);

  const { data: allSections, isLoading, error } = useCollection(sectionsQuery);

  if (isLoading) {
    return (
      <div className="py-40 text-center animate-pulse font-headline text-primary uppercase tracking-widest bg-background min-h-screen flex items-center justify-center">
        VERDE
      </div>
    );
  }

  if (error || !allSections) return null;

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
    const pageId = pathname === '/' ? 'home' : pathname.replace('/', '');
    const newId = doc(collection(db, 'cms_page_sections')).id;
    
    const defaults: Record<string, any> = {
      Hero: { title: 'A New Awakening', subtitle: 'Experience true luxury.', ctaText: 'Explore', imageUrl: 'https://picsum.photos/seed/verde-luxury-hero/1920/1080', backgroundType: 'image', styles: { paddingVertical: '0', buttonType: 'primary' } },
      TextBlock: { title: 'Our Narrative', content: 'Share the soul of your brand...', alignment: 'center', styles: { paddingVertical: '128' } },
      CTA: { title: 'Join the Sanctuary', subtitle: 'Reserve your next ritual.', buttonText: 'Contact Us', styles: { paddingVertical: '96' } },
      BrandIntro: { title: 'Our Philosophy', subtitle: 'Pure. Conscious.', content: 'Beauty refined through natural elegance...', buttonText: 'Discover', imageUrl: 'https://picsum.photos/seed/verde-about/800/1000', styles: { paddingVertical: '128' } }
    };

    const newSection = {
      id: newId,
      type: type,
      content: JSON.stringify(defaults[type] || { title: `New ${type}` })
    };

    setDocumentNonBlocking(doc(db, 'cms_page_sections', newId), newSection, { merge: true });

    const pageRef = doc(db, 'cms_pages', pageId);
    const pageSnap = await getDoc(pageRef);
    if (pageSnap.exists()) {
      const data = pageSnap.data();
      const currentIds = [...(data.sectionIds || [])];
      currentIds.splice(index, 0, newId);
      setDocumentNonBlocking(pageRef, { ...data, sectionIds: currentIds }, { merge: true });
      toast({ title: "Blueprint Placed", description: `A new ${type} has been integrated.` });
    }
  }

  const AddButton = ({ index }: { index: number }) => (
    <div className="relative group/add h-4 flex items-center justify-center -my-2 z-[70] opacity-0 hover:opacity-100 transition-opacity">
      <div className="absolute left-0 right-0 h-[2px] bg-accent/60 w-full" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="rounded-full bg-accent hover:bg-white shadow-2xl border-4 border-white h-10 w-10 relative z-10 transition-all hover:scale-110">
            <Plus className="w-5 h-5 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56 p-2 rounded-none border-2 shadow-2xl">
          {['Hero', 'TextBlock', 'BrandIntro', 'CTA', 'VideoBlock', 'FAQSection', 'ServicesPreview', 'FeaturedWork', 'Testimonials'].map(type => (
            <DropdownMenuItem key={type} className="rounded-none text-[10px] font-bold uppercase tracking-wider py-3 cursor-pointer" onClick={() => handleAddSectionAt(index, type)}>
              {type.replace(/([A-Z])/g, ' $1')}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className={cn("relative group/builder", isEditMode && "pb-20")}>
      {isEditMode && <AddButton index={0} />}
      
      {orderedSections.map((section: any, idx: number) => {
        let data = {};
        try {
          data = JSON.parse(section.content || '{}');
        } catch (e) {
          console.error("Renderer: Error parsing section", e);
        }
        
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
              className={cn(
                "relative group/section transition-all duration-300",
                isEditMode && "cursor-pointer hover:ring-2 hover:ring-accent/50",
                isEditMode && activeSectionId === section.id && "ring-4 ring-accent"
              )}
              onClick={() => handleSectionClick(section.id)}
            >
              {isEditMode && (
                <div className="absolute top-4 right-4 z-[60] flex space-x-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md p-1 pr-3 rounded-none shadow-xl border border-accent/20">
                    <div className="bg-accent p-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">{section.type}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-primary hover:bg-primary/5" onClick={(e) => { e.stopPropagation(); handleSectionClick(section.id); }}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
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
