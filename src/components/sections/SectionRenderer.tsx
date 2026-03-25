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
  
  // Load collections. We fetch draft sections even in live mode as a robust migration fallback
  const draftQuery = useMemoFirebase(() => query(collection(db, 'cms_page_sections')), [db]);
  const { data: draftSections, isLoading: draftLoading } = useCollection(draftQuery);

  const liveQuery = useMemoFirebase(() => query(collection(db, 'cms_sections_live')), [db]);
  const { data: liveSections, isLoading: liveLoading } = useCollection(liveQuery);

  const orderedSections = useMemo(() => {
    // Determine the primary source based on mode
    const primarySource = isEditMode ? draftSections : liveSections;
    const fallbackSource = isEditMode ? null : draftSections;
    
    if (!sectionIds) return [];

    return sectionIds
      .map(id => {
        // Try primary source first
        let found = primarySource?.find(s => s.id === id);
        
        // Robust Fallback: If not found in live, try draft (migration period support)
        if (!found && fallbackSource) {
          found = fallbackSource.find(s => s.id === id);
        }
        
        return found;
      })
      .filter(Boolean);
  }, [draftSections, liveSections, sectionIds, isEditMode]);

  // Signal completion for preloader - Ensure it fires even if sections are missing
  useEffect(() => {
    const currentLoading = isEditMode ? draftLoading : (liveLoading && draftLoading);
    if (!currentLoading) {
      window.dispatchEvent(new CustomEvent('verde-progress', { detail: { progress: 100 } }));
    }
  }, [draftLoading, liveLoading, isEditMode]);

  if ((isEditMode && draftLoading && !draftSections) || (!isEditMode && liveLoading && draftLoading && !liveSections && !draftSections)) {
    return <div className="min-h-screen bg-background" />;
  }

  const handleSectionClick = (id: string) => {
    if (isEditMode) {
      setActiveSectionId(id);
      window.dispatchEvent(new CustomEvent('verde-select-section', { detail: { id } }));
    }
  };

  return (
    <div className={cn("relative", isEditMode && "pb-32")}>
      {orderedSections.map((section: any) => {
        const isHidden = section.isHidden === true;
        if (!isEditMode && isHidden) return null;

        let data = {};
        try { 
          data = typeof section.content === 'string' ? JSON.parse(section.content || '{}') : (section.content || {}); 
        } catch (e) { 
          console.error("Content Parse Error:", e);
          return null; 
        }
        
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
