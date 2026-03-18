'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Settings2, 
  X, 
  Save, 
  Type, 
  Sparkles,
  ChevronLeft,
  Image as ImageIcon,
  MousePointer2,
  CheckCircle2,
  Video,
  Layout as LayoutIcon,
  Palette,
  Link as LinkIcon,
  Timer,
  Layers,
  Component
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function LiveEditorSidebar() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const db = useFirestore();
  
  const isEditMode = searchParams.get('edit') === 'true' && !!user;
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);

  useEffect(() => {
    const handleSectionSelect = (e: any) => {
      if (isEditMode) {
        setSelectedSectionId(e.detail.id);
      }
    };
    window.addEventListener('verde-select-section', handleSectionSelect);
    return () => window.removeEventListener('verde-select-section', handleSectionSelect);
  }, [isEditMode]);

  const sectionRef = useMemoFirebase(() => 
    selectedSectionId ? doc(db, 'cms_page_sections', selectedSectionId) : null, 
  [db, selectedSectionId]);
  
  const { data: sectionData } = useDoc(sectionRef);

  useEffect(() => {
    if (sectionData) {
      const parsed = JSON.parse(sectionData.content || '{}');
      if (!parsed.styles) parsed.styles = {};
      setEditingData({ ...sectionData, parsedContent: parsed });
    }
  }, [sectionData]);

  if (!isEditMode) return null;

  function updateValue(key: string, value: any, isStyle: boolean = false) {
    if (!editingData) return;
    const updated = { ...editingData.parsedContent };
    if (isStyle) {
      updated.styles = { ...updated.styles, [key]: value };
    } else {
      updated[key] = value;
    }
    setEditingData({ ...editingData, parsedContent: updated });
  }

  function handleSave() {
    if (!editingData || !selectedSectionId) return;
    const finalSection = {
      ...editingData,
      content: JSON.stringify(editingData.parsedContent)
    };
    delete finalSection.parsedContent;
    
    setDocumentNonBlocking(doc(db, 'cms_page_sections', selectedSectionId), finalSection, { merge: true });
    toast({ title: "Design Synced", description: "Changes are now live across Pakistan." });
  }

  function handleExitEditor() {
    router.push(pathname);
  }

  return (
    <div className={cn(
      "fixed top-0 right-0 h-screen w-[400px] bg-white shadow-2xl z-[100] flex flex-col border-l transition-transform duration-500 ease-in-out",
      selectedSectionId ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between bg-primary text-white shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-accent rounded-sm shadow-inner">
            <Component className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg">{editingData?.type || 'Element Editor'}</h3>
            <p className="text-[9px] uppercase tracking-[0.2em] text-accent font-bold">Element ID: {selectedSectionId?.slice(0,8)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => setSelectedSectionId(null)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Content Area */}
      <div className="flex-grow overflow-y-auto custom-scrollbar bg-slate-50/30">
        {editingData && (
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full rounded-none h-14 bg-white border-b sticky top-0 z-10">
              <TabsTrigger value="content" className="flex-1 h-full rounded-none text-[10px] uppercase font-bold tracking-widest data-[state=active]:border-b-2 data-[state=active]:border-primary">Content</TabsTrigger>
              <TabsTrigger value="style" className="flex-1 h-full rounded-none text-[10px] uppercase font-bold tracking-widest data-[state=active]:border-b-2 data-[state=active]:border-primary">Style</TabsTrigger>
              <TabsTrigger value="advanced" className="flex-1 h-full rounded-none text-[10px] uppercase font-bold tracking-widest data-[state=active]:border-b-2 data-[state=active]:border-primary">Layout</TabsTrigger>
            </TabsList>

            <div className="p-8 space-y-10 pb-32">
              <TabsContent value="content" className="mt-0 space-y-8">
                {/* Identification Display */}
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-sm space-y-1">
                  <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">Active Blueprint</span>
                  <p className="text-xs font-headline font-bold text-primary">{editingData.type} Section</p>
                </div>

                {/* Text Group */}
                <div className="space-y-4">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                    <Type className="w-3 h-3 mr-2 text-accent" /> Text Elements
                  </div>
                  {['title', 'subtitle', 'content', 'handle', 'ctaText', 'buttonText'].map((key) => {
                    if (editingData.parsedContent[key] === undefined) return null;
                    return (
                      <div key={key} className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        {key.includes('content') || key.includes('subtitle') ? (
                          <Textarea 
                            className="rounded-none min-h-[100px] text-sm border-slate-200 focus-visible:ring-primary/20"
                            value={editingData.parsedContent[key]} 
                            onChange={(e) => updateValue(key, e.target.value)}
                          />
                        ) : (
                          <Input 
                            className="rounded-none h-11 text-sm border-slate-200 focus-visible:ring-primary/20"
                            value={editingData.parsedContent[key]} 
                            onChange={(e) => updateValue(key, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Group */}
                {['ctaUrl', 'buttonUrl', 'linkUrl'].some(k => editingData.parsedContent[k] !== undefined) && (
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                      <LinkIcon className="w-3 h-3 mr-2 text-accent" /> Navigation
                    </div>
                    {['ctaUrl', 'buttonUrl', 'linkUrl'].map((key) => {
                      if (editingData.parsedContent[key] === undefined) return null;
                      return (
                        <div key={key} className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</Label>
                          <Input 
                            placeholder="/services or https://..."
                            className="rounded-none h-11 text-sm border-slate-200"
                            value={editingData.parsedContent[key]} 
                            onChange={(e) => updateValue(key, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Media Configuration */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                    <Video className="w-3 h-3 mr-2 text-accent" /> Media Configuration
                  </div>
                  
                  {['imageUrl', 'videoUrl'].map((key) => {
                    if (editingData.parsedContent[key] === undefined) return null;
                    return (
                      <div key={key} className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        <Input 
                          placeholder="https://..."
                          className="rounded-none h-11 text-xs font-mono border-slate-200"
                          value={editingData.parsedContent[key] || ''} 
                          onChange={(e) => updateValue(key, e.target.value)}
                        />
                      </div>
                    );
                  })}

                  {(editingData.parsedContent.videoUrl || editingData.parsedContent.backgroundType === 'video') && (
                    <div className="grid grid-cols-2 gap-4 bg-white p-4 border rounded-sm">
                      <div className="flex items-center justify-between space-x-2">
                        <Label className="text-[9px] uppercase font-bold opacity-60">Autoplay</Label>
                        <Switch 
                          checked={editingData.parsedContent.autoplay ?? true}
                          onCheckedChange={(val) => updateValue('autoplay', val)}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label className="text-[9px] uppercase font-bold opacity-60">Controls</Label>
                        <Switch 
                          checked={editingData.parsedContent.showControls ?? false}
                          onCheckedChange={(val) => updateValue('showControls', val)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="style" className="mt-0 space-y-10">
                {/* Background Engine */}
                <div className="space-y-4">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                    <Layers className="w-3 h-3 mr-2 text-accent" /> Styling Strategy
                  </div>
                  <Select 
                    value={editingData.parsedContent.backgroundType || 'color'} 
                    onValueChange={(val) => updateValue('backgroundType', val)}
                  >
                    <SelectTrigger className="rounded-none h-11 border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Solid Background</SelectItem>
                      <SelectItem value="image">High-Res Image</SelectItem>
                      <SelectItem value="video">Cinematic Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Palette */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                    <Palette className="w-3 h-3 mr-2 text-accent" /> Palette Controls
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Background Color</Label>
                      <div className="flex items-center space-x-3">
                        <input type="color" className="w-10 h-10 border rounded-full cursor-pointer" value={editingData.parsedContent.styles?.backgroundColor || '#FFFFFF'} onChange={(e) => updateValue('backgroundColor', e.target.value, true)} />
                        <Input className="h-11 rounded-none font-mono text-xs" value={editingData.parsedContent.styles?.backgroundColor || ''} onChange={(e) => updateValue('backgroundColor', e.target.value, true)} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Heading Color</Label>
                      <div className="flex items-center space-x-3">
                        <input type="color" className="w-10 h-10 border rounded-full cursor-pointer" value={editingData.parsedContent.styles?.titleColor || '#000000'} onChange={(e) => updateValue('titleColor', e.target.value, true)} />
                        <Input className="h-11 rounded-none font-mono text-xs" value={editingData.parsedContent.styles?.titleColor || ''} onChange={(e) => updateValue('titleColor', e.target.value, true)} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Accent Color</Label>
                      <div className="flex items-center space-x-3">
                        <input type="color" className="w-10 h-10 border rounded-full cursor-pointer" value={editingData.parsedContent.styles?.subtitleColor || '#C6A15B'} onChange={(e) => updateValue('subtitleColor', e.target.value, true)} />
                        <Input className="h-11 rounded-none font-mono text-xs" value={editingData.parsedContent.styles?.subtitleColor || ''} onChange={(e) => updateValue('subtitleColor', e.target.value, true)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlay Density */}
                <div className="pt-6 border-t border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Overlay Intensity</Label>
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded">{editingData.parsedContent.styles?.overlayOpacity || 20}%</span>
                  </div>
                  <Slider 
                    value={[editingData.parsedContent.styles?.overlayOpacity ?? 20]} 
                    max={100} 
                    onValueChange={([val]) => updateValue('overlayOpacity', val, true)} 
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="mt-0 space-y-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Section Padding (Vertical)</Label>
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded">{editingData.parsedContent.styles?.paddingVertical || '128'}px</span>
                  </div>
                  <Slider 
                    value={[parseInt(editingData.parsedContent.styles?.paddingVertical || '128')]} 
                    max={300} 
                    step={8} 
                    onValueChange={([val]) => updateValue('paddingVertical', val.toString(), true)} 
                  />
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Content Alignment</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['left', 'center'].map(align => (
                      <Button 
                        key={align}
                        variant={editingData.parsedContent.styles?.alignment === align ? 'default' : 'outline'}
                        className="rounded-none h-11 text-[10px] uppercase font-bold tracking-widest"
                        onClick={() => updateValue('alignment', align, true)}
                      >
                        {align}
                      </Button>
                    ))}
                  </div>
                </div>

                {['ctaText', 'buttonText'].some(k => editingData.parsedContent[k] !== undefined) && (
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Button Preset</Label>
                    <Select 
                      value={editingData.parsedContent.styles?.buttonType || 'primary'} 
                      onValueChange={(val) => updateValue('buttonType', val, true)}
                    >
                      <SelectTrigger className="rounded-none"><SelectValue placeholder="Button Style" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Solid Gold (Signature)</SelectItem>
                        <SelectItem value="outline">Luxury Outline (Minimal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t bg-white flex flex-col space-y-3 shrink-0">
        <Button className="w-full bg-primary hover:bg-primary/90 rounded-none h-14 uppercase tracking-[0.2em] text-[10px] font-bold shadow-xl" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Sync Design Settings
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-grow rounded-none h-12 uppercase tracking-widest text-[9px] font-bold" onClick={handleExitEditor}>
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Publish & Exit
          </Button>
          <Button variant="outline" className="rounded-none h-12 px-4" onClick={() => setSelectedSectionId(null)} title="Back to Overview">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Builder Overlay */}
      {!selectedSectionId && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center space-y-8 animate-fade-in">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-accent animate-pulse" />
          </div>
          <div>
            <h4 className="font-headline text-3xl font-bold text-primary">Sanctuary Mode</h4>
            <p className="text-muted-foreground text-sm mt-4 font-light leading-relaxed">
              You are navigating the live sanctuary. Hover over any blueprint to refine its aesthetic or reorder elements.
            </p>
          </div>
          <Button variant="outline" className="rounded-none px-10 h-12 uppercase tracking-widest text-[10px] font-bold border-primary/20" onClick={handleExitEditor}>
            Exit Architect Mode
          </Button>
        </div>
      )}
    </div>
  );
}
