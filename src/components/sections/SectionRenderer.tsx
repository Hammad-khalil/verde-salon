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
import { useState, useMemo } from 'react';
import { Plus, Edit2, Sparkles } from 'lucide-react';
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
  const db = useFirestore();
  const { toast } = useToast();
  
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const isEditMode = useMemo(() => searchParams.get('edit') === 'true' && !!user, [searchParams, user]);
  
  const sectionsQuery = useMemoFirebase(() => query(collection(db, 'cms_page_sections')), [db]);
  const { data: allSections, isLoading } = useCollection(sectionsQuery);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center animate-pulse font-headline text-primary tracking-widest bg-background">VERDE</div>;
  }

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
    let pageId = 'home';
    if (pathname.includes('services')) pageId = 'services';
    else if (pathname.includes('blog')) pageId = 'blog';
    
    const newId = doc(collection(db, 'cms_page_sections')).id;
    
    const defaults: Record<string, any> = {
      Hero: { title: 'New Vision', subtitle: 'Elevating beauty.', ctaText: 'Explore', imageUrl: 'https://picsum.photos/seed/hero/1920/1080', backgroundType: 'image' },
      TextBlock: { title: 'Our Story', content: 'Crafting luxury...', alignment: 'center' },
      CTA: { title: 'Begin Ritual', subtitle: 'Book your visit.', buttonText: 'Connect' },
      BrandIntro: { title: 'The Philosophy', content: 'Pure elegance...', imageUrl: 'https://picsum.photos/seed/about/800/1000' }
    };

    const newSection = { id: newId, type, content: JSON.stringify(defaults[type] || { title: `New ${type}` }) };
    setDocumentNonBlocking(doc(db, 'cms_page_sections', newId), newSection, { merge: true });

    const pageRef = doc(db, 'cms_pages', pageId);
    const pageSnap = await getDoc(pageRef);
    if (pageSnap.exists()) {
      const data = pageSnap.data();
      const currentIds = [...(data.sectionIds || [])];
      currentIds.splice(index, 0, newId);
      setDocumentNonBlocking(pageRef, { ...data, sectionIds: currentIds }, { merge: true });
      toast({ title: "Section Added", description: `${type} integrated.` });
    }
  }

  const AddButton = ({ index }: { index: number }) => (
    <div className="relative h-4 flex items-center justify-center -my-2 z-50 opacity-0 hover:opacity-100 transition-opacity">
      <div className="absolute inset-x-0 h-px bg-accent/40" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="rounded-full bg-accent hover:bg-white shadow-lg h-8 w-8 relative z-10 border-2 border-white">
            <Plus className="w-4 h-4 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48 p-1 rounded-none">
          {['Hero', 'TextBlock', 'BrandIntro', 'CTA', 'FeaturedWork', 'ServicesPreview', 'Testimonials', 'BlogListing', 'ServicesListing'].map(type => (
            <DropdownMenuItem key={type} className="text-[9px] font-bold uppercase tracking-wider py-2 cursor-pointer" onClick={() => handleAddSectionAt(index, type)}>
              {type.replace(/([A-Z])/g, ' $1')}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className={cn("relative", isEditMode && "pb-32")}>
      {isEditMode && <AddButton index={0} />}
      {orderedSections.map((section: any, idx: number) => {
        let data = {};
        try { 
          data = JSON.parse(section.content || '{}'); 
        } catch (e) { 
          console.error("Renderer Parse Error:", e);
          return null; // Skip corrupted sections
        }
        
        const SectionComponents: Record<string, any> = {
          Hero, BrandIntro, TextBlock, ServicesPreview, FeaturedWork, Testimonials, InstagramPreview, CTA, FormBlock, VideoBlock, FAQSection, BlogListing, ServicesListing
        };
        const Component = SectionComponents[section.type];

        if (!Component) return null;

        return (
          <div key={section.id}>
            <div 
              className={cn(
                "relative transition-all duration-300",
                isEditMode && "cursor-pointer hover:ring-2 hover:ring-accent/50",
                isEditMode && activeSectionId === section.id && "ring-4 ring-accent"
              )}
              onClick={() => handleSectionClick(section.id)}
            >
              {isEditMode && (
                <div className="absolute top-4 right-4 z-50 flex space-x-2 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md p-1 pr-3 shadow-xl border border-accent/20">
                    <div className="bg-accent p-2"><Sparkles className="w-3 h-3 text-primary" /></div>
                    <span className="text-[9px] font-bold uppercase widests tracking-widest text-primary">{section.type}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleSectionClick(section.id); }}><Edit2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              )}
              <Component {...data} />
            </div>
            {isEditMode && <AddButton index={idx + 1} />}
          </div>
        );
      })}
    </div>
  );
}