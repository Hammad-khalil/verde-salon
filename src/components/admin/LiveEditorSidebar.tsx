'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  X, 
  Save, 
  Type, 
  Sparkles,
  ChevronLeft,
  Image as ImageIcon,
  Video,
  Palette,
  Link as LinkIcon,
  Layers,
  Component,
  Upload,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

/**
 * MediaField Component
 * Handles both URL input and Drag & Drop file uploads
 */
const MediaField = ({ label, value, onChange, type = 'image' }: { label: string, value: string, onChange: (val: string) => void, type?: 'image' | 'video' }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">{label}</Label>
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer group",
          isDragging ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50",
          value ? "aspect-video" : "h-32"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          handleFile(file);
        }}
        onClick={() => document.getElementById(`file-input-${label}`)?.click()}
      >
        {value ? (
          <div className="relative w-full h-full">
            {type === 'image' ? (
              <img src={value} className="w-full h-full object-contain rounded" alt="Preview" />
            ) : (
              <video src={value} className="w-full h-full object-contain rounded" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
              <p className="text-[10px] text-white font-bold uppercase tracking-widest">Replace Media</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-3 bg-slate-100 rounded-full group-hover:bg-primary/10 transition-colors">
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium text-center">
              Drag & drop or <span className="text-primary underline">browse</span>
            </p>
          </>
        )}
        <input 
          id={`file-input-${label}`}
          type="file" 
          className="hidden" 
          accept={type === 'image' ? "image/*" : "video/*"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Or paste external URL..."
          className="h-9 text-[10px] font-mono border-slate-200"
          value={value?.startsWith('data:') ? '' : value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 text-destructive hover:bg-destructive/5" onClick={() => onChange('')}>
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

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
    toast({ title: "Design Synced", description: "Your changes are now live." });
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
              <TabsContent value="content" className="mt-0 space-y-10">
                {/* Text Group */}
                <div className="space-y-6">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
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

                {/* Media Group */}
                <div className="space-y-8 pt-6 border-t border-slate-100">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                    <ImageIcon className="w-3 h-3 mr-2 text-accent" /> Media Management
                  </div>
                  
                  {/* Primary Media Field */}
                  {editingData.parsedContent.imageUrl !== undefined && (
                    <div className="space-y-6">
                      <MediaField 
                        label="Image Asset" 
                        value={editingData.parsedContent.imageUrl} 
                        onChange={(val) => updateValue('imageUrl', val)}
                        type="image"
                      />
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold opacity-50">Alt Text (SEO)</Label>
                        <Input 
                          placeholder="Describe the image..."
                          className="h-10 text-sm rounded-none border-slate-200"
                          value={editingData.parsedContent.altText || ''} 
                          onChange={(e) => updateValue('altText', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {editingData.parsedContent.videoUrl !== undefined && (
                    <MediaField 
                      label="Video Asset" 
                      value={editingData.parsedContent.videoUrl} 
                      onChange={(val) => updateValue('videoUrl', val)}
                      type="video"
                    />
                  )}
                </div>

                {/* Navigation Group */}
                {['ctaUrl', 'buttonUrl', 'linkUrl'].some(k => editingData.parsedContent[k] !== undefined) && (
                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
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
              </TabsContent>

              <TabsContent value="style" className="mt-0 space-y-10">
                {/* Background Strategy */}
                <div className="space-y-4">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
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

                {/* Object Fit Control (If media is used) */}
                {['image', 'video'].includes(editingData.parsedContent.backgroundType) && (
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <Label className="text-[10px] uppercase font-bold opacity-50">Media Sizing</Label>
                    <Select 
                      value={editingData.parsedContent.styles?.objectFit || 'cover'} 
                      onValueChange={(val) => updateValue('objectFit', val, true)}
                    >
                      <SelectTrigger className="h-10 text-xs rounded-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover (Full Bleed)</SelectItem>
                        <SelectItem value="contain">Contain (Keep Aspect)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Color Palette */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                    <Palette className="w-3 h-3 mr-2 text-accent" /> Palette Controls
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Background Color</Label>
                      <div className="flex items-center space-x-3">
                        <input type="color" className="w-10 h-10 border rounded-full cursor-pointer" value={editingData.parsedContent.styles?.backgroundColor || '#FFFFFF'} onChange={(e) => updateValue('backgroundColor', e.target.value, true)} />
                        <Input 
                          className="h-11 rounded-none font-mono text-xs uppercase" 
                          value={editingData.parsedContent.styles?.backgroundColor || ''} 
                          onChange={(e) => updateValue('backgroundColor', e.target.value, true)} 
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Heading Color</Label>
                      <div className="flex items-center space-x-3">
                        <input type="color" className="w-10 h-10 border rounded-full cursor-pointer" value={editingData.parsedContent.styles?.titleColor || '#000000'} onChange={(e) => updateValue('titleColor', e.target.value, true)} />
                        <Input 
                          className="h-11 rounded-none font-mono text-xs uppercase" 
                          value={editingData.parsedContent.styles?.titleColor || ''} 
                          onChange={(e) => updateValue('titleColor', e.target.value, true)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlay Intensity */}
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
                {/* Video Playback Settings (If video is used) */}
                {(editingData.parsedContent.videoUrl || editingData.parsedContent.backgroundType === 'video') && (
                  <div className="space-y-6">
                    <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                      <Video className="w-3 h-3 mr-2 text-accent" /> Playback Rules
                    </div>
                    <div className="grid grid-cols-1 gap-4 bg-white p-4 border rounded-sm">
                      <div className="flex items-center justify-between">
                        <Label className="text-[9px] uppercase font-bold opacity-60">Autoplay</Label>
                        <Switch checked={editingData.parsedContent.autoplay ?? true} onCheckedChange={(val) => updateValue('autoplay', val)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[9px] uppercase font-bold opacity-60">Loop</Label>
                        <Switch checked={editingData.parsedContent.loop ?? true} onCheckedChange={(val) => updateValue('loop', val)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[9px] uppercase font-bold opacity-60">Mute</Label>
                        <Switch checked={editingData.parsedContent.muted ?? true} onCheckedChange={(val) => updateValue('muted', val)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[9px] uppercase font-bold opacity-60">Player Controls</Label>
                        <Switch checked={editingData.parsedContent.showControls ?? false} onCheckedChange={(val) => updateValue('showControls', val)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold opacity-50">Start (sec)</Label>
                        <Input type="number" className="h-9 text-xs" value={editingData.parsedContent.startTime || 0} onChange={(e) => updateValue('startTime', parseInt(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold opacity-50">End (sec)</Label>
                        <Input type="number" className="h-9 text-xs" value={editingData.parsedContent.endTime || 0} onChange={(e) => updateValue('endTime', parseInt(e.target.value))} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Layout Spacing */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Vertical Padding</Label>
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
                  <Label className="text-[10px] uppercase font-bold opacity-50">Content Alignment</Label>
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
                    <Label className="text-[10px] uppercase font-bold opacity-50">Button Style</Label>
                    <Select 
                      value={editingData.parsedContent.styles?.buttonType || 'primary'} 
                      onValueChange={(val) => updateValue('buttonType', val, true)}
                    >
                      <SelectTrigger className="rounded-none h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Solid Gold</SelectItem>
                        <SelectItem value="outline">Luxury Outline</SelectItem>
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
          <Save className="w-4 h-4 mr-2" /> Sync Design Changes
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-grow rounded-none h-12 uppercase tracking-widest text-[9px] font-bold" onClick={handleExitEditor}>
            Publish & Exit Architect
          </Button>
          <Button variant="outline" className="rounded-none h-12 px-4" onClick={() => setSelectedSectionId(null)} title="Back to Overview">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Builder Overlay (When no section is active) */}
      {!selectedSectionId && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center space-y-8 animate-fade-in">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-accent animate-pulse" />
          </div>
          <div>
            <h4 className="font-headline text-3xl font-bold text-primary">Sanctuary Mode</h4>
            <p className="text-muted-foreground text-sm mt-4 font-light leading-relaxed">
              Navigate your live sanctuary. Click any element to refine its aesthetic or reorder content blocks.
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
