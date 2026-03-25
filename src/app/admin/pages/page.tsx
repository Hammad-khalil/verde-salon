'use client';

import { useState } from 'react';
import { useDoc, useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, collection, writeBatch } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
  Sparkles,
  Palette,
  Maximize,
  ImageIcon,
  Monitor,
  Library,
  Search,
  FileText,
  Scissors,
  Loader2,
  Volume2,
  VolumeX,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PagesEditor() {
  const db = useFirestore();
  const { toast } = useToast();
  const [currentPageId, setCurrentPageId] = useState('home');
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const pageRef = useMemoFirebase(() => doc(db, 'cms_pages', currentPageId), [db, currentPageId]);
  const { data: pageData, isLoading: pageLoading } = useDoc(pageRef);

  const sectionsQuery = useMemoFirebase(() => collection(db, 'cms_page_sections'), [db]);
  const { data: allSections } = useCollection(sectionsQuery);

  const pageSections = pageData?.sectionIds
    ?.map((id: string) => allSections?.find(s => s.id === id))
    .filter(Boolean) || [];

  const unassignedSections = allSections?.filter(s => 
    !pageData?.sectionIds?.includes(s.id)
  ) || [];

  function handleInitializePage() {
    setDocumentNonBlocking(pageRef, {
      id: currentPageId,
      title: currentPageId.charAt(0).toUpperCase() + currentPageId.slice(1),
      sectionIds: [],
      publishedSectionIds: [],
      isPublished: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    toast({ title: "Initialized", description: `The ${currentPageId} page has been created.` });
  }

  function handleMove(index: number, direction: 'up' | 'down') {
    if (!pageData) return;
    const newIds = [...(pageData.sectionIds || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newIds.length) return;

    [newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];
    setDocumentNonBlocking(pageRef, { ...pageData, sectionIds: newIds }, { merge: true });
  }

  function handleRemoveSection(id: string) {
    if (!pageData) return;
    const newIds = (pageData.sectionIds || []).filter((sid: string) => sid !== id);
    setDocumentNonBlocking(pageRef, { ...pageData, sectionIds: newIds }, { merge: true });
    toast({ title: "Section Detached", description: "The section was moved to your Library for recovery." });
  }

  function handleAttachFromLibrary(sectionId: string) {
    if (!pageData) return;
    setDocumentNonBlocking(pageRef, { 
      ...pageData, 
      sectionIds: [...(pageData?.sectionIds || []), sectionId] 
    }, { merge: true });
    setIsLibraryOpen(false);
    toast({ title: "Restored", description: "The section has been re-attached to your page." });
  }

  function openEditSection(section: any) {
    const parsed = JSON.parse(section.content || '{}');
    if (!parsed.styles) {
      parsed.styles = { ...defaultStyles };
    }
    setEditingSection({ ...section, parsedContent: parsed });
    setIsSectionDialogOpen(true);
  }

  function updateNestedContent(key: string, value: any, isStyle: boolean = false) {
    const updated = { ...editingSection.parsedContent };
    if (isStyle) {
      updated.styles = { ...updated.styles, [key]: value };
    } else {
      updated[key] = value;
    }
    setEditingSection({ ...editingSection, parsedContent: updated });
  }

  function handleSaveSection() {
    if (!editingSection) return;
    
    const contentString = JSON.stringify(editingSection.parsedContent);
    const byteSize = new TextEncoder().encode(contentString).length;
    
    if (byteSize > 800000) {
      toast({ 
        variant: "destructive", 
        title: "Section Too Large", 
        description: `This section is ${Math.round(byteSize / 1024)}KB. Firestore limit is 1MB. Please use external URLs for media instead of uploading Base64 strings.`
      });
      return;
    }

    const updatedSection = {
      ...editingSection,
      content: contentString,
      updatedAt: new Date().toISOString()
    };
    delete updatedSection.parsedContent;
    
    setDocumentNonBlocking(doc(db, 'cms_page_sections', editingSection.id), updatedSection, { merge: true });
    setIsSectionDialogOpen(false);
    toast({ title: "Draft Updated", description: "Changes saved to draft workspace." });
  }

  async function handlePublish() {
    if (!pageData || !allSections) return;
    setIsPublishing(true);
    
    try {
      const batch = writeBatch(db);
      
      batch.update(pageRef, {
        publishedSectionIds: pageData.sectionIds || [],
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      });
      
      const activeIds = pageData.sectionIds || [];
      activeIds.forEach((id: string) => {
        const section = allSections.find(s => s.id === id);
        if (section) {
          const liveRef = doc(db, 'cms_sections_live', id);
          batch.set(liveRef, {
            id: section.id,
            type: section.type,
            content: section.content,
            updatedAt: new Date().toISOString()
          });
        }
      });
      
      await batch.commit();
      toast({ title: "Sanctuary Published", description: "Architecture successfully synchronized to the public site." });
    } catch (e: any) {
      console.error("Publish Error:", e);
      const isSizeError = e.message?.toLowerCase().includes('size') || e.message?.toLowerCase().includes('limit');
      toast({ 
        variant: "destructive", 
        title: "Publish Failed", 
        description: isSizeError 
          ? "Database limit reached (1MB). One or more sections contain too much data. Switch to External URLs for your background videos or large images."
          : "Could not apply live changes. Check your connection and try again." 
      });
    } finally {
      setIsPublishing(false);
    }
  }

  function handleAddSection(type: string) {
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
    InstagramPreview: Instagram,
    BlogListing: FileText,
    ServicesListing: Scissors
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">Visual Architect</h1>
          <p className="text-muted-foreground mt-2 font-light italic">Refining the digital sanctuary of Verde Salon.</p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" className="border-primary/20 rounded-none h-12" onClick={() => setIsLibraryOpen(true)}>
            <Library className="w-4 h-4 mr-2 text-primary" /> Section Library
          </Button>
          <Button variant="outline" asChild className="rounded-none h-12">
            <a href={`/${currentPageId === 'home' ? '' : currentPageId}`} target="_blank"><Eye className="w-4 h-4 mr-2" /> Preview Public</a>
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 min-w-[180px] rounded-none h-12 shadow-xl" 
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Publish Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="home" onValueChange={setCurrentPageId}>
        <TabsList className="bg-white border p-1 rounded-none h-14 w-full justify-start overflow-x-auto custom-scrollbar">
          <TabsTrigger value="home" className="px-10 rounded-none data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-widest text-[10px] font-bold h-full">Home Page</TabsTrigger>
          <TabsTrigger value="services" className="px-10 rounded-none data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-widest text-[10px] font-bold h-full">Services Page</TabsTrigger>
          <TabsTrigger value="blog" className="px-10 rounded-none data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-widest text-[10px] font-bold h-full">Blogs Page</TabsTrigger>
        </TabsList>

        <TabsContent value={currentPageId} className="mt-10 space-y-6">
          {pageLoading ? (
            <div className="py-24 text-center animate-pulse font-headline text-primary tracking-widest uppercase">Initializing Layout Engine...</div>
          ) : !pageData ? (
            <div className="py-32 text-center bg-white border border-dashed rounded-none space-y-8">
              <div className="flex flex-col items-center">
                <Sparkles className="w-16 h-16 text-accent opacity-20 mb-6" />
                <h3 className="font-headline text-3xl font-light">Empty Sanctuary</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto font-light">Initialize this page architecture to start designing your digital ritual.</p>
              </div>
              <Button className="bg-accent text-primary font-bold px-12 py-8 rounded-none uppercase tracking-[0.3em] text-[11px]" onClick={handleInitializePage}>
                Initialize Page: {currentPageId}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {pageSections.map((section: any, index: number) => {
                  const Icon = sectionIcons[section.type] || Layout;
                  let content = {};
                  try { content = JSON.parse(section.content || '{}'); } catch(e) {}
                  
                  return (
                    <Card key={section.id} className="border-none shadow-sm group overflow-hidden bg-white hover:ring-1 hover:ring-primary/20 transition-all rounded-none">
                      <div className="flex items-center justify-between px-8 py-6">
                        <div className="flex items-center space-x-6">
                          <div className="p-4 bg-slate-50 rounded-none border border-primary/5">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent block mb-1">{section.type}</span>
                            <h3 className="font-headline text-xl font-bold">
                              {(content as any).title || (content as any).handle || 'Artisan Section'}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-slate-50" onClick={() => handleMove(index, 'up')} disabled={index === 0}>
                            <ChevronUp className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-slate-50" onClick={() => handleMove(index, 'down')} disabled={index === pageSections.length - 1}>
                            <ChevronDown className="w-5 h-5" />
                          </Button>
                          <div className="w-px h-6 bg-slate-100 mx-4" />
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-primary bg-primary/5 hover:bg-primary hover:text-white" onClick={() => openEditSection(section)}>
                            <Settings2 className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveSection(section.id)}>
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="flex flex-col items-center pt-20 pb-32">
                <div className="flex flex-col items-center space-y-10 w-full">
                  <div className="flex items-center space-x-6 w-full">
                    <div className="h-px flex-grow bg-gradient-to-r from-transparent to-primary/10" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-muted-foreground/40 whitespace-nowrap">Add Artisan Element</span>
                    <div className="h-px flex-grow bg-gradient-to-l from-transparent to-primary/10" />
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                    {Object.keys(defaultContents).map(type => (
                      <Button key={type} variant="outline" size="sm" className="rounded-none border-dashed border-primary/20 hover:border-primary hover:bg-primary/5 text-[10px] font-bold uppercase tracking-widest px-8 py-6 h-auto" onClick={() => handleAddSection(type)}>
                        <Plus className="w-4 h-4 mr-3 text-accent" /> {type.replace(/([A-Z])/g, ' $1')}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* SECTION LIBRARY DIALOG */}
      <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 border-none shadow-2xl rounded-none">
          <DialogHeader className="p-8 border-b bg-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary rounded-none shadow-lg"><Library className="w-6 h-6 text-white" /></div>
              <div>
                <DialogTitle className="text-3xl font-headline font-bold">Element Vault</DialogTitle>
                <DialogDescription className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/60">Restore archived sections and custom galleries.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-grow overflow-y-auto p-10 bg-slate-50/50 custom-scrollbar">
            {unassignedSections.length === 0 ? (
              <div className="py-32 text-center space-y-6">
                <div className="relative inline-block">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto opacity-10" />
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent opacity-20" />
                </div>
                <p className="text-muted-foreground font-light text-lg italic">The vault is currently empty. All your artisan sections are live.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {unassignedSections.map((section: any) => {
                  const Icon = sectionIcons[section.type] || Layout;
                  let content = {};
                  try { content = JSON.parse(section.content || '{}'); } catch(e) {}
                  
                  return (
                    <Card key={section.id} className="p-6 flex items-center justify-between bg-white border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-none group">
                      <div className="flex items-center space-x-5">
                        <div className="p-4 bg-muted/50 rounded-none border border-primary/5 group-hover:bg-primary/5 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent mb-1">{section.type}</p>
                          <h4 className="font-bold text-lg">{(content as any).title || 'Archived Section'}</h4>
                          <p className="text-[10px] font-mono text-muted-foreground opacity-40">{section.id}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-primary hover:bg-primary hover:text-white rounded-none h-12 px-6 border border-primary/10" onClick={() => handleAttachFromLibrary(section.id)}>
                        <Plus className="w-4 h-4 mr-2" /> Restore
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter className="p-8 border-t bg-white">
            <Button variant="ghost" className="rounded-none uppercase tracking-widest text-[10px] font-bold" onClick={() => setIsLibraryOpen(false)}>Close Vault</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT SECTION DIALOG */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden border-none shadow-2xl rounded-none">
          <div className="flex h-[90vh]">
            {/* Sidebar Controls */}
            <div className="w-[420px] bg-slate-50 border-r flex flex-col">
              <DialogHeader className="p-8 border-b bg-white space-y-0 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent block mb-1">Editor Core</span>
                    <DialogTitle className="font-headline text-3xl font-bold flex items-center tracking-tight">
                      <Settings2 className="w-6 h-6 mr-3 text-primary" /> {editingSection?.type}
                    </DialogTitle>
                  </div>
                </div>
                <DialogDescription className="sr-only">Refine section architecture</DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="content" className="flex-grow flex flex-col">
                <TabsList className="w-full justify-start rounded-none bg-white border-b h-16 px-4">
                  <TabsTrigger value="content" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-bold uppercase tracking-widest h-full">Content</TabsTrigger>
                  <TabsTrigger value="background" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-bold uppercase tracking-widest h-full">Aesthetic</TabsTrigger>
                  {editingSection?.type === 'VideoBlock' && <TabsTrigger value="playback" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-bold uppercase tracking-widest h-full">Video</TabsTrigger>}
                  <TabsTrigger value="layout" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-bold uppercase tracking-widest h-full">Layout</TabsTrigger>
                </TabsList>

                <div className="flex-grow overflow-y-auto custom-scrollbar p-8 space-y-10">
                  {editingSection && (
                    <>
                      <TabsContent value="content" className="mt-0 space-y-8">
                        {Object.keys(editingSection.parsedContent).map((key) => {
                          if (['styles', 'backgroundType', 'testimonials', 'images', 'posts', 'services', 'muted', 'showControls', 'autoplay', 'loop', 'objectFit'].includes(key)) return null;
                          return (
                            <div key={key} className="space-y-3">
                              <Label className="text-[10px] uppercase tracking-widest font-bold text-primary/60">{key.replace(/([A-Z])/g, ' $1')}</Label>
                              {key.toLowerCase().includes('content') || key.toLowerCase().includes('subtitle') ? (
                                <Textarea 
                                  className="text-base rounded-none border-primary/10 focus-visible:ring-primary/20 min-h-[160px] bg-white leading-relaxed"
                                  value={editingSection.parsedContent[key] ?? ''} 
                                  onChange={(e) => updateNestedContent(key, e.target.value)}
                                />
                              ) : (
                                <Input 
                                  className="h-12 text-base rounded-none border-primary/10 focus-visible:ring-primary/20 bg-white"
                                  value={editingSection.parsedContent[key] ?? ''} 
                                  onChange={(e) => updateNestedContent(key, e.target.value)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </TabsContent>

                      <TabsContent value="background" className="mt-0 space-y-10">
                        <div className="space-y-4">
                          <Label className="text-[10px] uppercase tracking-widest font-bold">Canvas Mode</Label>
                          <Select 
                            value={editingSection.parsedContent.backgroundType || 'image'} 
                            onValueChange={(val) => updateNestedContent('backgroundType', val)}
                          >
                            <SelectTrigger className="h-12 rounded-none border-primary/10"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-none">
                              <SelectItem value="color">Solid Theme Color</SelectItem>
                              <SelectItem value="image">Artisan Imagery</SelectItem>
                              <SelectItem value="video">Cinematic Background Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {editingSection.parsedContent.backgroundType === 'color' && (
                          <div className="space-y-4 p-6 bg-white border border-primary/5">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Theme Selector</Label>
                            <div className="flex items-center space-x-4">
                              <input 
                                type="color" 
                                className="w-12 h-12 rounded-none border cursor-pointer" 
                                value={editingSection.parsedContent.styles?.backgroundColor || '#ffffff'} 
                                onChange={(e) => updateNestedContent('backgroundColor', e.target.value, true)} 
                              />
                              <Input 
                                className="text-sm h-12 rounded-none font-mono" 
                                value={editingSection.parsedContent.styles?.backgroundColor ?? ''} 
                                onChange={(e) => updateNestedContent('backgroundColor', e.target.value, true)} 
                              />
                            </div>
                          </div>
                        )}

                        {(editingSection.parsedContent.backgroundType === 'image' || editingSection.parsedContent.backgroundType === 'video') && (
                          <div className="space-y-4 p-6 bg-white border border-primary/5">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Media Resource (URL)</Label>
                            <Input 
                              className="h-12 rounded-none border-primary/10"
                              value={editingSection.parsedContent[editingSection.parsedContent.backgroundType === 'image' ? 'imageUrl' : 'videoUrl'] ?? ''} 
                              onChange={(e) => updateNestedContent(editingSection.parsedContent.backgroundType === 'image' ? 'imageUrl' : 'videoUrl', e.target.value)}
                              placeholder="https://..."
                            />
                            <p className="text-[10px] text-muted-foreground italic">Tip: Use Unsplash for images or YouTube for 4K video assets.</p>
                          </div>
                        )}

                        <div className="space-y-6 pt-6 border-t">
                          <Label className="text-[10px] uppercase tracking-widest font-bold text-primary/60">Atmospheric Overlays</Label>
                          <div className="space-y-6 p-6 bg-white border border-primary/5">
                            <div className="flex items-center justify-between">
                              <Label className="text-[9px] opacity-50 uppercase font-bold">Shadow Depth (%)</Label>
                              <span className="text-[10px] font-mono bg-slate-50 px-2 py-1">{editingSection.parsedContent.styles?.overlayOpacity ?? 20}%</span>
                            </div>
                            <Slider 
                              value={[editingSection.parsedContent.styles?.overlayOpacity ?? 20]} 
                              max={100} 
                              onValueChange={([val]) => updateNestedContent('overlayOpacity', val, true)} 
                            />
                            <div className="flex items-center space-x-4">
                              <input 
                                type="color" 
                                className="w-10 h-10 rounded-none border cursor-pointer" 
                                value={editingSection.parsedContent.styles?.overlayColor || '#000000'} 
                                onChange={(e) => updateNestedContent('overlayColor', e.target.value, true)} 
                              />
                              <Label className="text-[9px] font-bold uppercase opacity-40">Overlay Hue</Label>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {editingSection?.type === 'VideoBlock' && (
                        <TabsContent value="playback" className="mt-0 space-y-8">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-white border border-primary/10">
                              <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-primary">Silence Audio</Label>
                                <p className="text-[9px] text-muted-foreground italic">Note: Autoplay requires muted state in most browsers.</p>
                              </div>
                              <Switch 
                                checked={editingSection.parsedContent.muted ?? true} 
                                onCheckedChange={(val) => updateNestedContent('muted', val)} 
                              />
                            </div>

                            <div className="space-y-4 p-6 bg-white border border-primary/10">
                              <Label className="text-[10px] uppercase font-bold tracking-widest text-primary">Player Presence</Label>
                              <Select 
                                value={editingSection.parsedContent.showControls ? 'show' : 'hide'} 
                                onValueChange={(val) => updateNestedContent('showControls', val === 'show')}
                              >
                                <SelectTrigger className="h-12 rounded-none border-primary/5 bg-slate-50"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-none">
                                  <SelectItem value="hide">Cinematic View (No Controls)</SelectItem>
                                  <SelectItem value="show">Interactive View (Show Controls)</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-[9px] text-muted-foreground leading-relaxed">"Cinematic View" creates a seamless, ambient background element with no user interaction.</p>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-white border border-primary/10">
                              <Label className="text-[10px] uppercase font-bold tracking-widest text-primary">Infinity Loop</Label>
                              <Switch 
                                checked={editingSection.parsedContent.autoplay ?? true} 
                                onCheckedChange={(val) => updateNestedContent('autoplay', val)} 
                              />
                            </div>
                          </div>
                        </TabsContent>
                      )}

                      <TabsContent value="layout" className="mt-0 space-y-10">
                        <div className="space-y-6">
                          <Label className="text-[10px] uppercase tracking-widest font-bold text-primary/60">Color Signature</Label>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3 p-4 bg-white border border-primary/5">
                              <Label className="text-[9px] opacity-50 uppercase font-bold">Primary Text</Label>
                              <div className="flex items-center space-x-3">
                                <input type="color" className="w-8 h-8 rounded-none border" value={editingSection.parsedContent.styles?.titleColor || '#000000'} onChange={(e) => updateNestedContent('titleColor', e.target.value, true)} />
                                <Input className="h-10 text-[10px] rounded-none font-mono" value={editingSection.parsedContent.styles?.titleColor ?? ''} onChange={(e) => updateNestedContent('titleColor', e.target.value, true)} />
                              </div>
                            </div>
                            <div className="space-y-3 p-4 bg-white border border-primary/5">
                              <Label className="text-[9px] opacity-50 uppercase font-bold">Accent Details</Label>
                              <div className="flex items-center space-x-3">
                                <input type="color" className="w-8 h-8 rounded-none border" value={editingSection.parsedContent.styles?.subtitleColor || '#C6A15B'} onChange={(e) => updateNestedContent('subtitleColor', e.target.value, true)} />
                                <Input className="h-10 text-[10px] rounded-none font-mono" value={editingSection.parsedContent.styles?.subtitleColor ?? ''} onChange={(e) => updateNestedContent('subtitleColor', e.target.value, true)} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {editingSection?.type === 'VideoBlock' && (
                          <div className="space-y-6 border-t pt-8">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-primary/60">Video Scaling & Size</Label>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-[9px] uppercase font-bold opacity-50">Fitting Mode</Label>
                                <Select 
                                  value={editingSection.parsedContent.styles?.objectFit || 'cover'} 
                                  onValueChange={(val) => updateNestedContent('objectFit', val, true)}
                                >
                                  <SelectTrigger className="h-10 rounded-none bg-white"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cover">Cover (No Black Bars)</SelectItem>
                                    <SelectItem value="contain">Contain (Show Full Frame)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-[9px] uppercase font-bold opacity-50">Custom Height</Label>
                                  <Input 
                                    placeholder="e.g. 600px or auto" 
                                    className="h-10 rounded-none bg-white"
                                    value={editingSection.parsedContent.styles?.height ?? ''} 
                                    onChange={(e) => updateNestedContent('height', e.target.value, true)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[9px] uppercase font-bold opacity-50">Max Width</Label>
                                  <Input 
                                    placeholder="e.g. 1200px or 100%" 
                                    className="h-10 rounded-none bg-white"
                                    value={editingSection.parsedContent.styles?.maxWidth ?? ''} 
                                    onChange={(e) => updateNestedContent('maxWidth', e.target.value, true)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-6 border-t pt-8">
                          <Label className="text-[10px] uppercase tracking-widest font-bold text-primary/60">Spatial Rhythm</Label>
                          <div className="space-y-6 p-6 bg-white border border-primary/5">
                            <div className="flex justify-between">
                              <Label className="text-[9px] opacity-50 uppercase font-bold">Vertical Sanctuary (px)</Label>
                              <span className="text-[10px] font-mono bg-slate-50 px-2 py-1">{editingSection.parsedContent.styles?.paddingVertical}</span>
                            </div>
                            <Slider 
                              value={[parseInt(editingSection.parsedContent.styles?.paddingVertical || '128')]} 
                              max={300} 
                              step={16} 
                              onValueChange={([val]) => updateNestedContent('paddingVertical', val.toString(), true)} 
                            />
                          </div>
                        </div>

                        <div className="space-y-6 border-t pt-8">
                          <Label className="text-[10px] uppercase tracking-widest font-bold text-primary/60">Alignment & Buttons</Label>
                          <div className="space-y-4">
                            <Select 
                              value={editingSection.parsedContent.styles?.alignment || 'center'} 
                              onValueChange={(val) => updateNestedContent('alignment', val, true)}
                            >
                              <SelectTrigger className="h-12 rounded-none border-primary/10 bg-white"><SelectValue placeholder="Text Alignment" /></SelectTrigger>
                              <SelectContent className="rounded-none">
                                <SelectItem value="left">Left Aligned (Modern)</SelectItem>
                                <SelectItem value="center">Center Aligned (Classic)</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select 
                              value={editingSection.parsedContent.styles?.buttonType || 'primary'} 
                              onValueChange={(val) => updateNestedContent('buttonType', val, true)}
                            >
                              <SelectTrigger className="h-12 rounded-none border-primary/10 bg-white"><SelectValue placeholder="Button Aesthetic" /></SelectTrigger>
                              <SelectContent className="rounded-none">
                                <SelectItem value="primary">Solid Gold Signature</SelectItem>
                                <SelectItem value="outline">Luxury Outline (Minimal)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>
                    </>
                  )}
                </div>
              </Tabs>

              <div className="p-8 border-t bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <Button className="w-full bg-primary hover:bg-accent text-white rounded-none h-16 text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl transition-all duration-700" onClick={handleSaveSection}>
                  <Save className="w-4 h-4 mr-3" /> Update Draft State
                </Button>
              </div>
            </div>

            {/* Visual Canvas Preview */}
            <div className="flex-grow bg-slate-100 relative overflow-hidden flex flex-col">
              <div className="p-6 bg-white/95 backdrop-blur-xl border-b flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Architectural Preview</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/20" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/20" />
                  <div className="w-3 h-3 rounded-full bg-green-400/20" />
                </div>
              </div>
              <div className="flex-grow overflow-y-auto flex items-center justify-center p-20">
                <div className="max-w-3xl w-full aspect-video bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-none border border-slate-200 flex flex-col items-center justify-center text-center p-16 space-y-8 animate-fade-in">
                  <div className="p-6 bg-accent/5 rounded-full border border-accent/10">
                    <Sparkles className="w-12 h-12 text-accent animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-headline text-4xl font-light text-primary">Refining the Ritual</h4>
                    <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-md">These changes are isolated in your **Draft State**. Visitors will only see them after you click **"Publish Changes"** in the main header.</p>
                  </div>
                  
                  {editingSection && (new TextEncoder().encode(JSON.stringify(editingSection.parsedContent)).length > 600000) && (
                    <div className="flex items-center space-x-3 text-amber-600 bg-amber-50 p-4 border border-amber-100 mt-4">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Section Density High: Consider External Media</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const defaultStyles = {
  backgroundColor: '#F5F3EF',
  titleColor: '#0F2F2F',
  subtitleColor: '#C6A15B',
  paddingVertical: '128',
  overlayOpacity: 20,
  overlayColor: '#000000',
  alignment: 'center',
  buttonType: 'primary',
  objectFit: 'cover'
};

const defaultContents: Record<string, any> = {
  Hero: { title: 'Elevate Your Natural Beauty', subtitle: 'Premium hair, skin, and wellness treatments tailored for you.', ctaText: 'Book Appointment', ctaUrl: '/services', imageUrl: 'https://picsum.photos/seed/verde-luxury-hero/1920/1080', backgroundType: 'image' },
  TextBlock: { title: 'A New Narrative', content: 'Share your story here...', alignment: 'center' },
  BrandIntro: { title: 'About VERDE SALON', subtitle: 'The Essence of Luxury', content: 'At Verde Salon, we blend modern beauty techniques with natural care. Our mission is to enhance your beauty while maintaining the health of your hair and skin.', imageUrl: 'https://picsum.photos/seed/verde-about/800/1000', buttonText: 'Discover Our Story', buttonUrl: '/blog' },
  CTA: { title: 'Ready for a transformation?', subtitle: 'Book your experience today at Verde Salon.', buttonText: 'Book Your Visit', buttonUrl: '/services' },
  FormBlock: { title: 'Book an Experience', subtitle: 'Request a service at Verde Salon.', type: 'Booking' },
  VideoBlock: { 
    title: 'Featured Video', 
    subtitle: 'Experience Verde Salon in motion', 
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
    posterUrl: 'https://picsum.photos/seed/video-thumb/1280/720', 
    autoplay: true, 
    loop: true, 
    muted: true, 
    showControls: false, 
    startTime: 0, 
    endTime: 60,
    styles: {
      ...defaultStyles,
      objectFit: 'cover',
      height: 'auto',
      maxWidth: '100%'
    }
  },
  FAQSection: { title: 'Common Queries', subtitle: 'Information for your visit' },
  ServicesPreview: { title: 'Signature Services', subtitle: 'Our Craft', services: [] },
  FeaturedWork: { title: 'Our Work', subtitle: 'The Verde Aesthetic', images: [] },
  Testimonials: { title: 'Client Reflections', subtitle: 'Voices of Verde Salon', testimonials: [] },
  InstagramPreview: { handle: '@verdesalonsalon', title: 'Follow Us on Instagram', posts: [] },
  BlogListing: { title: 'Reflections & Insights', subtitle: 'Blogs', description: 'Curated thoughts on beauty and intentional living.' },
  ServicesListing: { title: 'Signature Services', subtitle: 'The Menu', description: 'Timeless techniques meets contemporary science.' }
};
