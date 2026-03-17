'use client';

import { useState } from 'react';
import { useDoc, useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trash2, 
  Plus, 
  Save, 
  ChevronUp, 
  ChevronDown,
  Layout,
  Settings2,
  Eye,
  Video,
  Type,
  HelpCircle,
  Quote,
  Grid,
  Instagram,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PagesEditor() {
  const db = useFirestore();
  const { toast } = useToast();
  const [currentPageId, setCurrentPageId] = useState('home');
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);

  const pageRef = useMemoFirebase(() => doc(db, 'cms_pages', currentPageId), [db, currentPageId]);
  const { data: pageData, isLoading: pageLoading } = useDoc(pageRef);

  const sectionsQuery = useMemoFirebase(() => collection(db, 'cms_page_sections'), [db]);
  const { data: allSections } = useCollection(sectionsQuery);

  const pageSections = pageData?.sectionIds
    ?.map((id: string) => allSections?.find(s => s.id === id))
    .filter(Boolean) || [];

  function handleSavePage() {
    toast({ title: "Success", description: "Page layout published." });
  }

  function handleInitializePage() {
    setDocumentNonBlocking(pageRef, {
      id: currentPageId,
      title: currentPageId === 'home' ? 'Home' : 'Services',
      sectionIds: [],
      isPublished: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    toast({ title: "Initialized", description: `The ${currentPageId} page has been created.` });
  }

  function handleMove(index: number, direction: 'up' | 'down') {
    if (!pageData) return;
    const newIds = [...pageData.sectionIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newIds.length) return;

    [newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];
    setDocumentNonBlocking(pageRef, { ...pageData, sectionIds: newIds }, { merge: true });
  }

  function handleRemoveSection(id: string) {
    if (!pageData) return;
    const newIds = pageData.sectionIds.filter((sid: string) => sid !== id);
    setDocumentNonBlocking(pageRef, { ...pageData, sectionIds: newIds }, { merge: true });
  }

  function openEditSection(section: any) {
    setEditingSection({ ...section, parsedContent: JSON.parse(section.content || '{}') });
    setIsSectionDialogOpen(true);
  }

  function handleSaveSection() {
    if (!editingSection) return;
    const updatedSection = {
      ...editingSection,
      content: JSON.stringify(editingSection.parsedContent)
    };
    delete updatedSection.parsedContent;
    
    setDocumentNonBlocking(doc(db, 'cms_page_sections', editingSection.id), updatedSection, { merge: true });
    setIsSectionDialogOpen(false);
    toast({ title: "Updated", description: "Section content saved." });
  }

  function handleAddSection(type: string) {
    const newId = doc(collection(db, 'cms_page_sections')).id;
    const sectionDefaults = defaultContents[type] || {};

    const newSection = {
      id: newId,
      type: type,
      content: JSON.stringify(sectionDefaults)
    };

    setDocumentNonBlocking(doc(db, 'cms_page_sections', newId), newSection, { merge: true });
    setDocumentNonBlocking(pageRef, { 
      ...pageData, 
      sectionIds: [...(pageData?.sectionIds || []), newId] 
    }, { merge: true });
  }

  const sectionIcons: Record<string, any> = {
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
    InstagramPreview: Instagram
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold">Page Builder</h1>
          <p className="text-muted-foreground mt-2">Design your boutique digital presence for VERDE SALON.</p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" asChild>
            <a href="/" target="_blank"><Eye className="w-4 h-4 mr-2" /> Preview Site</a>
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleSavePage}>
            <Save className="w-4 h-4 mr-2" /> Publish Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="home" onValueChange={setCurrentPageId}>
        <TabsList className="bg-white border p-1 rounded-sm">
          <TabsTrigger value="home" className="px-8 rounded-none data-[state=active]:bg-primary data-[state=active]:text-white">Home Page</TabsTrigger>
          <TabsTrigger value="services" className="px-8 rounded-none data-[state=active]:bg-primary data-[state=active]:text-white">Services Page</TabsTrigger>
        </TabsList>

        <TabsContent value={currentPageId} className="mt-8 space-y-4">
          {pageLoading ? (
            <div className="py-20 text-center animate-pulse">Loading Layout...</div>
          ) : !pageData ? (
            <div className="py-20 text-center bg-white border-2 border-dashed rounded-sm space-y-6">
              <div className="flex flex-col items-center">
                <Sparkles className="w-12 h-12 text-accent opacity-20 mb-4" />
                <h3 className="font-headline text-2xl">This page isn't initialized yet</h3>
                <p className="text-muted-foreground mt-2">Create the database record for this page to start building.</p>
              </div>
              <Button className="bg-accent text-primary font-bold px-10" onClick={handleInitializePage}>
                Initialize {currentPageId} Page
              </Button>
            </div>
          ) : (
            <>
              {pageSections.map((section: any, index: number) => {
                const Icon = sectionIcons[section.type] || Layout;
                return (
                  <Card key={section.id} className="border-none shadow-sm group overflow-hidden">
                    <div className="flex items-center justify-between bg-muted/30 px-6 py-3 border-b border-muted">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-sm shadow-sm">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{section.type}</span>
                          <h3 className="font-headline text-sm font-bold">
                            {JSON.parse(section.content || '{}').title || 'Untitled Section'}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleMove(index, 'up')} disabled={index === 0}>
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleMove(index, 'down')} disabled={index === pageSections.length - 1}>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-primary" onClick={() => openEditSection(section)}>
                          <Settings2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveSection(section.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              <div className="flex justify-center pt-8">
                <div className="flex flex-col items-center space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Add New Section</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Object.keys(defaultContents).map(type => (
                      <Button key={type} variant="outline" size="sm" className="rounded-none border-dashed" onClick={() => handleAddSection(type)}>
                        <Plus className="w-3 h-3 mr-2" /> {type.replace(/([A-Z])/g, ' $1')}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Edit {editingSection?.type}</DialogTitle>
          </DialogHeader>
          {editingSection && (
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
              {Object.keys(editingSection.parsedContent).map((key) => {
                if (key === 'testimonials' || key === 'images' || key === 'posts' || key === 'services') return null;
                
                return (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    {key === 'type' && editingSection.type === 'FormBlock' ? (
                      <Select 
                        value={editingSection.parsedContent[key]} 
                        onValueChange={(val) => setEditingSection({
                          ...editingSection, 
                          parsedContent: { ...editingSection.parsedContent, [key]: val }
                        })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Booking">Booking Request</SelectItem>
                          <SelectItem value="Contact">General Contact</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : key === 'alignment' ? (
                      <Select 
                        value={editingSection.parsedContent[key]} 
                        onValueChange={(val) => setEditingSection({
                          ...editingSection, 
                          parsedContent: { ...editingSection.parsedContent, [key]: val }
                        })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : key.toLowerCase().includes('content') || key.toLowerCase().includes('subtitle') ? (
                      <Textarea 
                        value={editingSection.parsedContent[key]} 
                        onChange={(e) => setEditingSection({
                          ...editingSection, 
                          parsedContent: { ...editingSection.parsedContent, [key]: e.target.value }
                        })}
                      />
                    ) : (
                      <Input 
                        value={editingSection.parsedContent[key]} 
                        onChange={(e) => setEditingSection({
                          ...editingSection, 
                          parsedContent: { ...editingSection.parsedContent, [key]: e.target.value }
                        })}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsSectionDialogOpen(false)}>Cancel</Button>
            <Button className="bg-primary" onClick={handleSaveSection}>Save Content</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const defaultContents: Record<string, any> = {
  Hero: { title: 'Elevate Your Natural Beauty', subtitle: 'Premium hair, skin, and wellness treatments tailored for you.', ctaText: 'Book Appointment', imageUrl: 'https://picsum.photos/seed/verde-hero-main/1920/1080' },
  TextBlock: { title: 'A New Narrative', content: 'Share your story here...', alignment: 'center' },
  BrandIntro: { title: 'About VERDE SALON', subtitle: 'The Essence of Luxury', content: 'At Verde Salon, we blend modern beauty techniques with natural care. Our mission is to enhance your beauty while maintaining the health of your hair and skin.', imageUrl: 'https://picsum.photos/seed/verde-about/800/1000', buttonText: 'Discover Our Story' },
  CTA: { title: 'Ready for a transformation?', subtitle: 'Book your experience today at Verde Salon.', buttonText: 'Book Your Visit' },
  FormBlock: { title: 'Book an Experience', subtitle: 'Request a ritual at Verde Salon.', type: 'Booking' },
  VideoBlock: { title: 'Featured Video', subtitle: 'Experience Verde Salon in motion', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  FAQSection: { title: 'Common Queries', subtitle: 'Information for your visit' },
  ServicesPreview: { title: 'Signature Rituals', subtitle: 'Our Craft', services: [] },
  FeaturedWork: { title: 'Our Work', subtitle: 'The Verde Aesthetic', images: [] },
  Testimonials: { title: 'Client Reflections', subtitle: 'Voices of Verde Salon', testimonials: [] },
  InstagramPreview: { handle: '@verdesalonsalon', title: 'Follow Us on Instagram', posts: [] }
};
