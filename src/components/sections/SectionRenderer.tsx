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
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc, setDocumentNonBlocking } from '@/firebase';
import { collection, query, doc, writeBatch } from 'firebase/firestore';
import { useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Sparkles, Library, Layout, Search, Type, Video, HelpCircle, Grid, Quote, Instagram, FileText, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { defaultContents, defaultStyles } from '@/lib/cms-defaults';

interface SectionRendererProps {
  sectionIds: string[];
}

const SECTION_COMPONENTS: Record<string, any> = {
  Hero, BrandIntro, TextBlock, ServicesPreview, FeaturedWork, Testimonials, 
  InstagramPreview, CTA, FormBlock, VideoBlock, FAQSection, BlogListing, ServicesListing
};

const SECTION_ICONS: Record<string, any> = {
  Hero: Layout,
  TextBlock: Type,
  BrandIntro: Type,
  CTA: Layout,
  FormBlock: Layout,
  VideoBlock: Video,
  FAQSection: HelpCircle,
  ServicesPreview: Layout,
  FeaturedWork: Grid,
  Testimonials: Quote,
  InstagramPreview: Instagram,
  BlogListing: FileText,
  ServicesListing: Scissors
};

export default function SectionRenderer({ sectionIds }: SectionRendererProps) {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [insertionPoint, setInsertionPoint] = useState<{ targetId: string, position: 'before' | 'after' } | null>(null);

  const isEditMode = useMemo(() => searchParams.get('edit') === 'true' && !!user, [searchParams, user]);
  
  const pageId = useMemo(() => {
    if (pathname === '/') return 'home';
    if (pathname.includes('/services')) return 'services';
    if (pathname.includes('/blog')) return 'blog';
    return null;
  }, [pathname]);

  const pageRef = useMemoFirebase(() => pageId ? doc(db, 'cms_pages', pageId) : null, [db, pageId]);
  const { data: pageData } = useDoc(pageRef);

  const draftQuery = useMemoFirebase(() => query(collection(db, 'cms_page_sections')), [db]);
  const { data: draftSections, isLoading: draftLoading } = useCollection(draftQuery);

  const liveQuery = useMemoFirebase(() => query(collection(db, 'cms_sections_live')), [db]);
  const { data: liveSections, isLoading: liveLoading } = useCollection(liveQuery);

  const orderedSections = useMemo(() => {
    const primarySource = isEditMode ? draftSections : liveSections;
    const fallbackSource = isEditMode ? null : draftSections;
    
    if (!sectionIds) return [];

    return sectionIds
      .map(id => {
        let found = primarySource?.find(s => s.id === id);
        if (!found && fallbackSource) {
          found = fallbackSource.find(s => s.id === id);
        }
        return found;
      })
      .filter(Boolean);
  }, [draftSections, liveSections, sectionIds, isEditMode]);

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

  const handleInsertSection = async (type: string) => {
    if (!insertionPoint || !pageId || !pageData) return;

    const newId = doc(collection(db, 'cms_page_sections')).id;
    const sectionDefaults = {
      ...(defaultContents[type] || {}),
      styles: { ...defaultStyles },
      backgroundType: 'image'
    };

    const newSection = {
      id: newId,
      type: type,
      content: JSON.stringify(sectionDefaults),
      isHidden: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const currentIds = [...(pageData.sectionIds || [])];
    const targetIdx = currentIds.indexOf(insertionPoint.targetId);
    const insertIdx = insertionPoint.position === 'before' ? targetIdx : targetIdx + 1;
    
    currentIds.splice(insertIdx, 0, newId);

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'cms_page_sections', newId), newSection);
      batch.update(doc(db, 'cms_pages', pageId), { sectionIds: currentIds, updatedAt: new Date().toISOString() });
      await batch.commit();
      
      setIsLibraryOpen(false);
      setInsertionPoint(null);
      toast({ title: "Section Inserted", description: `New ${type} added to the architecture.` });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Insertion Failed" });
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
            {/* Contextual Insertion Before */}
            {isEditMode && activeSectionId === section.id && (
              <div className="flex items-center justify-center -mb-6 relative z-50 animate-fade-in group/insert">
                <div className="h-px bg-accent/20 flex-grow" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full border-accent/30 bg-white/90 backdrop-blur-sm text-[9px] font-bold uppercase tracking-widest px-4 h-8 hover:bg-accent hover:text-primary transition-all shadow-lg mx-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInsertionPoint({ targetId: section.id, position: 'before' });
                    setIsLibraryOpen(true);
                  }}
                >
                  <Plus className="w-3 h-3 mr-2" /> Add Section Before
                </Button>
                <div className="h-px bg-accent/20 flex-grow" />
              </div>
            )}

            <div 
              className={cn(
                "relative transition-all duration-300",
                isEditMode && "cursor-pointer hover:ring-2 hover:ring-accent/50",
                isEditMode && activeSectionId === section.id && "ring-4 ring-accent z-40",
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

            {/* Contextual Insertion After */}
            {isEditMode && activeSectionId === section.id && (
              <div className="flex items-center justify-center -mt-6 relative z-50 animate-fade-in group/insert">
                <div className="h-px bg-accent/20 flex-grow" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full border-accent/30 bg-white/90 backdrop-blur-sm text-[9px] font-bold uppercase tracking-widest px-4 h-8 hover:bg-accent hover:text-primary transition-all shadow-lg mx-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInsertionPoint({ targetId: section.id, position: 'after' });
                    setIsLibraryOpen(true);
                  }}
                >
                  <Plus className="w-3 h-3 mr-2" /> Add Section After
                </Button>
                <div className="h-px bg-accent/20 flex-grow" />
              </div>
            )}
          </div>
        );
      })}

      {/* ELEMENT VAULT DIALOG (SHARED) */}
      <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 border-none shadow-2xl rounded-none">
          <DialogHeader className="p-8 border-b bg-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary rounded-none shadow-lg"><Library className="w-6 h-6 text-white" /></div>
              <div>
                <DialogTitle className="text-3xl font-headline font-bold">Artisan Library</DialogTitle>
                <DialogDescription className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/60">Choose a section to insert {insertionPoint?.position} the selected element.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-grow overflow-y-auto p-10 bg-slate-50/50 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(defaultContents).map((type) => {
                const Icon = SECTION_ICONS[type] || Layout;
                return (
                  <Card 
                    key={type} 
                    className="p-6 flex flex-col items-center text-center space-y-4 bg-white border-none shadow-sm hover:shadow-xl hover:ring-1 hover:ring-accent/30 cursor-pointer transition-all duration-500 rounded-none group"
                    onClick={() => handleInsertSection(type)}
                  >
                    <div className="p-4 bg-slate-50 rounded-none border border-primary/5 group-hover:bg-primary/5 transition-colors">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-lg">{type.replace(/([A-Z])/g, ' $1')}</h4>
                      <p className="text-[9px] uppercase tracking-widest text-accent font-bold mt-1">Artisan Element</p>
                    </div>
                    <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest h-10 border border-primary/5 mt-2">
                      Insert Here
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
          <DialogFooter className="p-8 border-t bg-white">
            <Button variant="ghost" className="rounded-none uppercase tracking-widest text-[10px] font-bold" onClick={() => setIsLibraryOpen(false)}>Close Library</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
