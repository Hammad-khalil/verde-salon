'use client';

import { useState } from 'react';
import { useDoc, useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
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
  Loader2
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
    const updatedSection = {
      ...editingSection,
      content: JSON.stringify(editingSection.parsedContent)
    };
    delete updatedSection.parsedContent;
    
    setDocumentNonBlocking(doc(db, 'cms_page_sections', editingSection.id), updatedSection, { merge: true });
    setIsSectionDialogOpen(false);
    toast({ title: "Draft Updated", description: "Changes saved to draft." });
  }

  async function handlePublish() {
    if (!pageData || !allSections) return;
    setIsPublishing(true);
    
    try {
      const batch = writeBatch(db);
      
      batch.update(pageRef, {
        publishedSectionIds: pageData.sectionIds || [],
        updatedAt: new Date().toISOString()
      });
      
      const activeIds = pageData.sectionIds || [];
      activeIds.forEach((id: string) => {
        const section = allSections.find(s => s.id === id);
        if (section) {
          batch.update(doc(db, 'cms_page_sections', id), {
            publishedContent: section.content
          });
        }
      });
      
      await batch.commit();
      toast({ title: "Site Published", description: "All changes are now live for visitors." });
    } catch (e) {
      console.error("Publish Error:", e);
      toast({ variant: "destructive", title: "Publish Failed", description: "Could not sync draft to live." });
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
    InstagramPreview: Instagram,
    BlogListing: FileText,
    ServicesListing: Scissors
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold">Verde Visual Architect</h1>
          <p className="text-muted-foreground mt-2">The ultimate no-code design system for your sanctuary.</p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" className="border-primary/20" onClick={() => setIsLibraryOpen(true)}>
            <Library className="w-4 h-4 mr-2 text-primary" /> Section Library
          </Button>
          <Button variant="outline" asChild>
            <a href={`/${currentPageId === 'home' ? '' : currentPageId}`} target="_blank"><Eye className="w-4 h-4 mr-2" /> View Public Site</a>
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 min-w-[160px]" 
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Publish Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="home" onValueChange={setCurrentPageId}>
        <TabsList className="bg-white border p-1 rounded-sm">
          <TabsTrigger value="home" className="px-8 rounded-none data-[state=active]:bg-primary data-[state=active]:text-white">Home Page</TabsTrigger>
          <TabsTrigger value="services" className="px-8 rounded-none data-[state=active]:bg-primary data-[state=active]:text-white">Services Page</TabsTrigger>
          <TabsTrigger value="blog" className="px-8 rounded-none data-[state=active]:bg-primary data-[state=active]:text-white">Blog Page</TabsTrigger>
        </TabsList>

        <TabsContent value={currentPageId} className="mt-8 space-y-4">
          {pageLoading ? (
            <div className="py-20 text-center animate-pulse">Initializing Layout Engine...</div>
          ) : !pageData ? (
            <div className="py-20 text-center bg-white border-2 border-dashed rounded-sm space-y-6">
              <div className="flex flex-col items-center">
                <Sparkles className="w-12 h-12 text-accent opacity-20 mb-4" />
                <h3 className="font-headline text-2xl">Empty Sanctuary</h3>
                <p className="text-muted-foreground mt-2">Initialize this page to start your design journey.</p>
              </div>
              <Button className="bg-accent text-primary font-bold px-10 rounded-none" onClick={handleInitializePage}>
                Initialize Page: {currentPageId}
              </Button>
            </div>
          ) : (
            <>
              {pageSections.map((section: any, index: number) => {
                const Icon = sectionIcons[section.type] || Layout;
                let content = {};
                try { content = JSON.parse(section.content || '{}'); } catch(e) {}
                
                return (
                  <Card key={section.id} className="border-none shadow-sm group overflow-hidden bg-white hover:ring-1 hover:ring-primary/20 transition-all">
                    <div className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-muted/50 rounded-sm">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent">{section.type}</span>
                          <h3 className="font-headline text-base font-bold">
                            {(content as any).title || (content as any).handle || 'Custom Section'}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMove(index, 'up')} disabled={index === 0}>
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMove(index, 'down')} disabled={index === pageSections.length - 1}>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <div className="w-[1px] h-4 bg-muted mx-2" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary bg-primary/5" onClick={() => openEditSection(section)}>
                          <Settings2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveSection(section.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              <div className="flex justify-center pt-12">
                <div className="flex flex-col items-center space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">New Element</span>
                  <div className="flex flex-wrap justify-center gap-3">
                    {Object.keys(defaultContents).map(type => (
                      <Button key={type} variant="outline" size="sm" className="rounded-none border-dashed border-primary/20 hover:border-primary hover:bg-primary/5 text-[10px] font-bold uppercase tracking-widest px-6" onClick={() => handleAddSection(type)}>
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

      {/* SECTION LIBRARY DIALOG (RECOVERY TOOL) */}
      <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b bg-white">
            <div className="flex items-center space-x-3">
              <Library className="w-6 h-6 text-primary" />
              <div>
                <DialogTitle className="text-2xl font-headline">Section Library</DialogTitle>
                <DialogDescription>Recover your manual sections, Video Blocks, and custom galleries here.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-grow overflow-y-auto p-6 bg-muted/10">
            {unassignedSections.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
                <p className="text-muted-foreground">No unassigned sections found. All your sections are currently on pages.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unassignedSections.map((section: any) => {
                  const Icon = sectionIcons[section.type] || Layout;
                  let content = {};
                  try { content = JSON.parse(section.content || '{}'); } catch(e) {}
                  
                  return (
                    <Card key={section.id} className="p-4 flex items-center justify-between bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-muted/50 rounded-sm">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">{section.type}</p>
                          <h4 className="font-bold">{(content as any).title || 'Custom Section'}</h4>
                          <p className="text-[10px] font-mono text-muted-foreground">{section.id}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/5" onClick={() => handleAttachFromLibrary(section.id)}>
                        <Plus className="w-4 h-4 mr-2" /> Add to Page
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter className="p-6 border-t bg-white">
            <Button variant="ghost" onClick={() => setIsLibraryOpen(false)}>Close Library</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT SECTION DIALOG */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="flex h-[85vh]">
            {/* Sidebar Controls */}
            <div className="w-96 bg-muted/30 border-r flex flex-col">
              <DialogHeader className="p-6 border-b bg-white space-y-0 text-left">
                <div className="flex items-center justify-between">
                  <DialogTitle className="font-headline text-xl font-bold flex items-center">
                    <Settings2 className="w-4 h-4 mr-2 text-primary" /> {editingSection?.type}
                  </DialogTitle>
                </div>
                <DialogDescription className="sr-only">Edit section properties</DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="content" className="flex-grow flex flex-col">
                <TabsList className="w-full justify-start rounded-none bg-transparent border-b h-12 px-2">
                  <TabsTrigger value="content" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Content</TabsTrigger>
                  <TabsTrigger value="background" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Background</TabsTrigger>
                  <TabsTrigger value="layout" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Layout</TabsTrigger>
                </TabsList>

                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-8">
                  {editingSection && (
                    <>
                      <TabsContent value="content" className="mt-0 space-y-6">
                        {Object.keys(editingSection.parsedContent).map((key) => {
                          if (['styles', 'backgroundType', 'testimonials', 'images', 'posts', 'services'].includes(key)) return null;
                          return (
                            <div key={key} className="space-y-2">
                              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">{key.replace(/([A-Z])/g, ' $1')}</Label>
                              {key.toLowerCase().includes('content') || key.toLowerCase().includes('subtitle') ? (
                                <Textarea 
                                  className="text-sm rounded-none border-primary/10 focus-visible:ring-primary/20 min-h-[120px]"
                                  value={editingSection.parsedContent[key] ?? ''} 
                                  onChange={(e) => updateNestedContent(key, e.target.value)}
                                />
                              ) : (
                                <Input 
                                  className="h-10 text-sm rounded-none border-primary/10 focus-visible:ring-primary/20"
                                  value={editingSection.parsedContent[key] ?? ''} 
                                  onChange={(e) => updateNestedContent(key, e.target.value)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </TabsContent>

                      <TabsContent value="background" className="mt-0 space-y-8">
                        <div className="space-y-4">
                          <Label className="text-[10px] uppercase tracking-widest font-bold">Background Type</Label>
                          <Select 
                            value={editingSection.parsedContent.backgroundType || 'image'} 
                            onValueChange={(val) => updateNestedContent('backgroundType', val)}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="color">Solid Color</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Autoplay Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {editingSection.parsedContent.backgroundType === 'color' && (
                          <div className="space-y-4">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Select Color</Label>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="color" 
                                className="w-10 h-10 rounded-sm border" 
                                value={editingSection.parsedContent.styles?.backgroundColor || '#ffffff'} 
                                onChange={(e) => updateNestedContent('backgroundColor', e.target.value, true)} 
                              />
                              <Input 
                                className="text-sm h-10" 
                                value={editingSection.parsedContent.styles?.backgroundColor ?? ''} 
                                onChange={(e) => updateNestedContent('backgroundColor', e.target.value, true)} 
                              />
                            </div>
                          </div>
                        )}

                        {(editingSection.parsedContent.backgroundType === 'image' || editingSection.parsedContent.backgroundType === 'video') && (
                          <div className="space-y-4">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Media URL</Label>
                            <div className="flex space-x-2">
                              <Input 
                                value={editingSection.parsedContent[editingSection.parsedContent.backgroundType === 'image' ? 'imageUrl' : 'videoUrl'] ?? ''} 
                                onChange={(e) => updateNestedContent(editingSection.parsedContent.backgroundType === 'image' ? 'imageUrl' : 'videoUrl', e.target.value)}
                                placeholder="https://..."
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground">For Video, use a direct MP4 link or YouTube URL for best performance.</p>
                          </div>
                        )}

                        <div className="space-y-4 pt-4 border-t">
                          <Label className="text-[10px] uppercase tracking-widest font-bold">Overlay Engine</Label>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-[9px] opacity-50">Overlay Opacity</Label>
                              <span className="text-[10px] font-mono">{editingSection.parsedContent.styles?.overlayOpacity ?? 20}%</span>
                            </div>
                            <Slider 
                              value={[editingSection.parsedContent.styles?.overlayOpacity ?? 20]} 
                              max={100} 
                              onValueChange={([val]) => updateNestedContent('overlayOpacity', val, true)} 
                            />
                            <div className="flex items-center space-x-2">
                              <input 
                                type="color" 
                                className="w-8 h-8 rounded-sm" 
                                value={editingSection.parsedContent.styles?.overlayColor || '#000000'} 
                                onChange={(e) => updateNestedContent('overlayColor', e.target.value, true)} 
                              />
                              <Label className="text-[9px]">Overlay Color</Label>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="layout" className="mt-0 space-y-8">
                        <div className="space-y-6">
                          <Label className="text-[10px] uppercase tracking-widest font-bold">Typography Colors</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[9px] opacity-50">Heading</Label>
                              <div className="flex items-center space-x-2">
                                <input type="color" className="w-6 h-6" value={editingSection.parsedContent.styles?.titleColor || '#000000'} onChange={(e) => updateNestedContent('titleColor', e.target.value, true)} />
                                <Input className="h-8 text-[10px]" value={editingSection.parsedContent.styles?.titleColor ?? ''} onChange={(e) => updateNestedContent('titleColor', e.target.value, true)} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[9px] opacity-50">Accent</Label>
                              <div className="flex items-center space-x-2">
                                <input type="color" className="w-6 h-6" value={editingSection.parsedContent.styles?.subtitleColor || '#C6A15B'} onChange={(e) => updateNestedContent('subtitleColor', e.target.value, true)} />
                                <Input className="h-8 text-[10px]" value={editingSection.parsedContent.styles?.subtitleColor ?? ''} onChange={(e) => updateNestedContent('subtitleColor', e.target.value, true)} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6 border-t pt-6">
                          <Label className="text-[10px] uppercase tracking-widest font-bold">Responsive Spacing</Label>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <Label className="text-[9px] opacity-50">Vertical Padding (px)</Label>
                              <span className="text-[10px] font-mono">{editingSection.parsedContent.styles?.paddingVertical}</span>
                            </div>
                            <Slider 
                              value={[parseInt(editingSection.parsedContent.styles?.paddingVertical || '128')]} 
                              max={300} 
                              step={8} 
                              onValueChange={([val]) => updateNestedContent('paddingVertical', val.toString(), true)} 
                            />
                          </div>
                        </div>

                        <div className="space-y-4 border-t pt-6">
                          <Label className="text-[10px] uppercase tracking-widest font-bold">Alignment & Buttons</Label>
                          <Select 
                            value={editingSection.parsedContent.styles?.alignment || 'center'} 
                            onValueChange={(val) => updateNestedContent('alignment', val, true)}
                          >
                            <SelectTrigger className="rounded-none"><SelectValue placeholder="Text Alignment" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left Aligned</SelectItem>
                              <SelectItem value="center">Center Aligned</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select 
                            value={editingSection.parsedContent.styles?.buttonType || 'primary'} 
                            onValueChange={(val) => updateNestedContent('buttonType', val, true)}
                          >
                            <SelectTrigger className="rounded-none"><SelectValue placeholder="Button Style" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Solid Gold</SelectItem>
                              <SelectItem value="outline">Luxury Outline</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TabsContent>
                    </>
                  )}
                </div>
              </Tabs>

              <div className="p-6 border-t bg-white">
                <Button className="w-full bg-primary rounded-none h-14 text-[11px] font-bold uppercase tracking-[0.2em]" onClick={handleSaveSection}>
                  <Save className="w-4 h-4 mr-2" /> Update Draft
                </Button>
              </div>
            </div>

            {/* Live Canvas Preview */}
            <div className="flex-grow bg-slate-100 relative overflow-hidden flex flex-col">
              <div className="p-4 bg-white/90 backdrop-blur-md border-b flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Editor View</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              </div>
              <div className="flex-grow overflow-y-auto flex items-center justify-center p-12">
                <div className="max-w-2xl w-full aspect-video bg-white shadow-2xl rounded-sm border border-slate-200 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                  <h4 className="font-headline text-2xl font-light">Visualizing Draft Layout</h4>
                  <p className="text-muted-foreground text-sm font-light">These changes are currently in DRAFT mode. Visitors cannot see them yet. Use the "Publish Changes" button in the header to take them live.</p>
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
  buttonType: 'primary'
};

const defaultContents: Record<string, any> = {
  Hero: { title: 'Elevate Your Natural Beauty', subtitle: 'Premium hair, skin, and wellness treatments tailored for you.', ctaText: 'Book Appointment', ctaUrl: '/services', imageUrl: 'https://picsum.photos/seed/verde-luxury-hero/1920/1080', backgroundType: 'image' },
  TextBlock: { title: 'A New Narrative', content: 'Share your story here...', alignment: 'center' },
  BrandIntro: { title: 'About VERDE SALON', subtitle: 'The Essence of Luxury', content: 'At Verde Salon, we blend modern beauty techniques with natural care. Our mission is to enhance your beauty while maintaining the health of your hair and skin.', imageUrl: 'https://picsum.photos/seed/verde-about/800/1000', buttonText: 'Discover Our Story', buttonUrl: '/blog' },
  CTA: { title: 'Ready for a transformation?', subtitle: 'Book your experience today at Verde Salon.', buttonText: 'Book Your Visit', buttonUrl: '/services' },
  FormBlock: { title: 'Book an Experience', subtitle: 'Request a service at Verde Salon.', type: 'Booking' },
  VideoBlock: { title: 'Featured Video', subtitle: 'Experience Verde Salon in motion', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', posterUrl: 'https://picsum.photos/seed/video-thumb/1280/720', autoplay: true, startTime: 0, endTime: 60, showControls: false },
  FAQSection: { title: 'Common Queries', subtitle: 'Information for your visit' },
  ServicesPreview: { title: 'Signature Services', subtitle: 'Our Craft', services: [] },
  FeaturedWork: { title: 'Our Work', subtitle: 'The Verde Aesthetic', images: [] },
  Testimonials: { title: 'Client Reflections', subtitle: 'Voices of Verde Salon', testimonials: [] },
  InstagramPreview: { handle: '@verdesalonsalon', title: 'Follow Us on Instagram', posts: [] },
  BlogListing: { title: 'Reflections & Insights', subtitle: 'Blogs', description: 'Curated thoughts on beauty and intentional living.' },
  ServicesListing: { title: 'Signature Services', subtitle: 'The Menu', description: 'Timeless techniques meets contemporary science.' }
};
