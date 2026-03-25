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
import BlogListing from './BlogListing';
import ServicesListing from './ServicesListing';
import { useCollection, useFirestore, useMemoFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, query, doc, getDoc } from 'firebase/firestore';
import { useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Sparkles, EyeOff } from 'lucide-react';
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

const SECTION_COMPONENTS: Record<string, any> = {
  Hero, BrandIntro, TextBlock, ServicesPreview, FeaturedWork, Testimonials, 
  InstagramPreview, CTA, FormBlock, VideoBlock, FAQSection, BlogListing, ServicesListing
};

export default function SectionRenderer({ sectionIds }: SectionRendererProps) {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const isEditMode = useMemo(() => searchParams.get('edit') === 'true' && !!user, [searchParams, user]);
  
  // OPTIMIZATION: Separate queries to reduce data transfer based on mode
  const draftQuery = useMemoFirebase(() => isEditMode ? query(collection(db, 'cms_page_sections')) : null, [db, isEditMode]);
  const { data: draftSections, isLoading: draftLoading } = useCollection(draftQuery);

  const liveQuery = useMemoFirebase(() => !isEditMode ? query(collection(db, 'cms_sections_live')) : null, [db, isEditMode]);
  const { data: liveSections, isLoading: liveLoading } = useCollection(liveQuery);

  const orderedSections = useMemo(() => {
    const targetSource = isEditMode ? draftSections : liveSections;
    if (!targetSource || !sectionIds) return [];

    return sectionIds
      .map(id => {
        let found = targetSource.find(s => s.id === id);
        
        // Fallback if live hasn't been populated yet
        if (!found && !isEditMode && draftSections) {
          found = draftSections.find(s => s.id === id);
        }
        
        return found;
      })
      .filter(Boolean);
  }, [draftSections, liveSections, sectionIds, isEditMode]);

  // Signal completion for preloader
  useEffect(() => {
    const currentLoading = isEditMode ? draftLoading : liveLoading;
    if (!currentLoading && (orderedSections.length > 0 || (sectionIds && sectionIds.length === 0))) {
      window.dispatchEvent(new CustomEvent('verde-progress', { detail: { progress: 100 } }));
    }
  }, [draftLoading, liveLoading, isEditMode, orderedSections, sectionIds]);

  if ((isEditMode && draftLoading && !draftSections) || (!isEditMode && liveLoading && !liveSections && !draftSections)) {
    return <div className="min-h-screen bg-background" />;
  }

  const handleSectionClick = (id: string) => {
    if (isEditMode) {
      setActiveSectionId(id);
      window.dispatchEvent(new CustomEvent('verde-select-section', { detail: { id } }));
    }
  };

  async function handleAddSectionAt(index: number, type: string) {
    let pageId = 'home';
    if (pathname.includes('services')) pageId = 'services';
    else if (pathname.includes('blog')) pageId = 'blog';
    
    const newId = doc(collection(db, 'cms_page_sections')).id;
    
    const defaults: Record<string, any> = {
      Hero: { title: 'New Vision', subtitle: 'Elevating beauty.', ctaText: 'Explore', imageUrl: 'https://picsum.photos/seed/hero/1920/1080', backgroundType: 'image' },
      TextBlock: { title: 'Our Story', content: 'Crafting luxury...', alignment: 'center' },
      CTA: { title: 'Begin Ritual', subtitle: 'Book your visit.', buttonText: 'Connect' }
    };

    const newSection = { 
      id: newId, 
      type, 
      content: JSON.stringify(defaults[type] || { title: `New ${type}` }),
      isHidden: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setDocumentNonBlocking(doc(db, 'cms_page_sections', newId), newSection, { merge: true });

    const pageRef = doc(db, 'cms_pages', pageId);
    const pageSnap = await getDoc(pageRef);
    if (pageSnap.exists()) {
      const data = pageSnap.data();
      const currentIds = [...(data.sectionIds || [])];
      currentIds.splice(index, 0, newId);
      setDocumentNonBlocking(pageRef, { ...data, sectionIds: currentIds }, { merge: true });
      toast({ title: "Draft Section Added" });
    }
  }

  return (
    <div className={cn("relative", isEditMode && "pb-32")}>
      {orderedSections.map((section: any, idx: number) => {
        const isHidden = section.isHidden === true;
        if (!isEditMode && isHidden) return null;

        let data = {};
        try { data = JSON.parse(section.content || '{}'); } catch (e) { return null; }
        
        const Component = SECTION_COMPONENTS[section.type];
        if (!Component) return null;

        return (
          <div key={section.id} className="animate-section-in">
            <div 
              className={cn(
                "relative transition-all duration-300",
                isEditMode && "cursor-pointer hover:ring-2 hover:ring-accent/50",
                isEditMode && activeSectionId === section.id && "ring-4 ring-accent",
                isEditMode && isHidden && "opacity-40 grayscale-[0.5]"
              )}
              onClick={() => handleSectionClick(section.id)}
            >
              {isEditMode && (
                <div className="absolute top-4 right-4 z-50 flex flex-col items-end space-y-2 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md p-1 pr-3 shadow-xl border border-accent/20">
                    <div className="bg-accent p-2"><Sparkles className="w-3 h-3 text-primary" /></div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">{section.type}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleSectionClick(section.id); }}><Edit2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              )}
              <Component {...data} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
