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
  Search,
  Settings2,
  Layout,
  Maximize,
  Minimize
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

/**
 * MediaField Component
 * Handles both URL input, Drag & Drop, and Alt Text
 */
const MediaField = ({ 
  label, 
  value, 
  onChange, 
  type = 'image',
  altText = '',
  onAltChange
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  type?: 'image' | 'video',
  altText?: string,
  onAltChange?: (val: string) => void
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file) return;
    if (file.size > 800000) {
      toast({
        variant: "destructive",
        title: "Asset too large",
        description: "Please use files under 800KB for high-performance syncing.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const safeValue = typeof value === 'string' ? value : '';
  const inputId = `file-upload-${label.replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-4 p-4 bg-white border rounded-sm shadow-sm">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase font-bold text-primary tracking-widest">{label}</Label>
        {safeValue && <span className="text-[8px] font-mono opacity-40 uppercase">Media Detected</span>}
      </div>

      <div 
        className={cn(
          "relative border-2 border-dashed rounded-sm transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50",
          isDragging ? "border-accent bg-accent/5" : "border-slate-200 hover:border-accent/50",
          safeValue ? "aspect-video" : "h-24"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          handleFile(file);
        }}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        {safeValue ? (
          <div className="relative w-full h-full group">
            {type === 'image' ? (
              <img src={safeValue} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <Video className="w-8 h-8 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
              <Upload className="w-6 h-6 text-accent mb-2" />
              <p className="text-[9px] text-white font-bold uppercase tracking-widest">Replace Asset</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="p-2 bg-white rounded-full shadow-sm">
              <ImageIcon className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[9px] text-slate-500 font-medium uppercase tracking-tighter">
              Drop or <span className="text-accent underline">Upload</span>
            </p>
          </div>
        )}
        <input 
          id={inputId}
          type="file" 
          className="hidden" 
          accept={type === 'image' ? "image/*" : "video/*"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-[8px] uppercase opacity-50 font-bold">Source URL</Label>
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Paste URL..."
              className="h-8 text-[10px] font-mono rounded-none"
              value={safeValue.startsWith('data:') ? 'Local Asset' : safeValue}
              onChange={(e) => onChange(e.target.value)}
            />
            {safeValue && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onChange('')}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {onAltChange && (
          <div className="space-y-1">
            <Label className="text-[8px] uppercase opacity-50 font-bold">Alt Text (SEO)</Label>
            <Input 
              placeholder="Describe this image..."
              className="h-8 text-[10px] rounded-none"
              value={altText}
              onChange={(e) => onAltChange(e.target.value)}
            />
          </div>
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
      if (isEditMode) setSelectedSectionId(e.detail.id);
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
      try {
        const parsed = JSON.parse(sectionData.content || '{}');
        if (!parsed.styles) parsed.styles = {};
        setEditingData({ ...sectionData, parsedContent: parsed });
      } catch (err) {
        console.error("Editor: Error parsing section content", err);
      }
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
    const contentString = JSON.stringify(editingData.parsedContent);
    
    if (contentString.length > 950000) {
      toast({ variant: "destructive", title: "Config too large", description: "Use external URLs for large assets." });
      return;
    }

    const finalSection = { ...editingData, content: contentString };
    delete finalSection.parsedContent;
    
    setDocumentNonBlocking(doc(db, 'cms_page_sections', selectedSectionId), finalSection, { merge: true });
    toast({ title: "Sanctuary Synced", description: "Live updates are now persistent." });
  }

  const isMediaKey = (key: string) => {
    const k = key.toLowerCase();
    return k.includes('image') || k.includes('photo') || k.includes('thumb') || 
           k.includes('logo') || k.includes('icon') || k.includes('video') || 
           k === 'images' || k === 'posts' || k === 'gallery';
  };

  const isLinkKey = (key: string) => {
    const k = key.toLowerCase();
    return k.includes('url') || k.includes('link') || k.includes('href');
  };

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
            <p className="text-[9px] uppercase tracking-[0.2em] text-accent font-bold">Visual Architect</p>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setSelectedSectionId(null)}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar bg-slate-50/30">
        {editingData && (
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full rounded-none h-14 bg-white border-b sticky top-0 z-10">
              <TabsTrigger value="content" className="flex-1 h-full rounded-none text-[10px] uppercase font-bold tracking-widest">Content</TabsTrigger>
              <TabsTrigger value="media" className="flex-1 h-full rounded-none text-[10px] uppercase font-bold tracking-widest">Media</TabsTrigger>
              <TabsTrigger value="style" className="flex-1 h-full rounded-none text-[10px] uppercase font-bold tracking-widest">Style</TabsTrigger>
            </TabsList>

            <div className="p-6 space-y-8 pb-32">
              <TabsContent value="content" className="mt-0 space-y-8">
                {/* Text discovery */}
                <div className="space-y-6">
                  <div className="flex items-center text-primary font-bold text-[9px] uppercase tracking-[0.2em] border-b pb-2">
                    <Type className="w-3 h-3 mr-2 text-accent" /> Text Elements
                  </div>
                  {Object.keys(editingData.parsedContent).map(key => {
                    const val = editingData.parsedContent[key];
                    if (typeof val !== 'string' || isMediaKey(key) || isLinkKey(key) || key === 'backgroundType') return null;
                    return (
                      <div key={key} className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        {val.length > 50 || key.includes('content') ? (
                          <Textarea className="rounded-none min-h-[100px] text-sm border-slate-200" value={val} onChange={(e) => updateValue(key, e.target.value)} />
                        ) : (
                          <Input className="rounded-none h-11 text-sm border-slate-200" value={val} onChange={(e) => updateValue(key, e.target.value)} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Link discovery */}
                <div className="space-y-6">
                  <div className="flex items-center text-primary font-bold text-[9px] uppercase tracking-[0.2em] border-b pb-2">
                    <LinkIcon className="w-3 h-3 mr-2 text-accent" /> Navigation & Links
                  </div>
                  {Object.keys(editingData.parsedContent).map(key => {
                    const val = editingData.parsedContent[key];
                    if (typeof val !== 'string' || !isLinkKey(key)) return null;
                    return (
                      <div key={key} className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        <Input className="rounded-none h-11 text-sm border-slate-200" value={val} onChange={(e) => updateValue(key, e.target.value)} />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="media" className="mt-0 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center text-primary font-bold text-[9px] uppercase tracking-[0.2em] border-b pb-2">
                    <ImageIcon className="w-3 h-3 mr-2 text-accent" /> Media Library
                  </div>
                  {Object.keys(editingData.parsedContent).map(key => {
                    if (!isMediaKey(key)) return null;
                    const val = editingData.parsedContent[key];
                    
                    if (Array.isArray(val)) {
                      return val.map((item, idx) => (
                        <MediaField 
                          key={`${key}-${idx}`} 
                          label={`${key.replace(/([A-Z])/g, ' $1')} Slot ${idx + 1}`} 
                          value={typeof item === 'string' ? item : (item.imageUrl || '')} 
                          onChange={(newVal) => {
                            const newArr = [...val];
                            if (typeof newArr[idx] === 'string') {
                              newArr[idx] = newVal;
                            } else {
                              newArr[idx] = { ...newArr[idx], imageUrl: newVal };
                            }
                            updateValue(key, newArr);
                          }} 
                        />
                      ));
                    }
                    
                    return (
                      <MediaField 
                        key={key} 
                        label={key} 
                        value={val} 
                        onChange={(newVal) => updateValue(key, newVal)} 
                        type={key.toLowerCase().includes('video') ? 'video' : 'image'} 
                      />
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="style" className="mt-0 space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Background Mode</Label>
                  <Select value={editingData.parsedContent.backgroundType || 'color'} onValueChange={(val) => updateValue('backgroundType', val)}>
                    <SelectTrigger className="rounded-none h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Solid Theme Color</SelectItem>
                      <SelectItem value="image">Cinematic Image</SelectItem>
                      <SelectItem value="video">Background Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(editingData.parsedContent.backgroundType === 'image' || editingData.parsedContent.backgroundType === 'video') && (
                  <MediaField 
                    label="Background Media" 
                    value={editingData.parsedContent.backgroundType === 'image' ? (editingData.parsedContent.imageUrl || '') : (editingData.parsedContent.videoUrl || '')} 
                    onChange={(val) => updateValue(editingData.parsedContent.backgroundType === 'image' ? 'imageUrl' : 'videoUrl', val)} 
                    type={editingData.parsedContent.backgroundType === 'video' ? 'video' : 'image'}
                  />
                )}

                <div className="space-y-6 pt-6 border-t">
                  <div className="flex items-center text-primary font-bold text-[9px] uppercase tracking-[0.2em] mb-4">
                    <Palette className="w-3 h-3 mr-2 text-accent" /> Palette & Visuals
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] opacity-50 uppercase font-bold">Accent Overlay</Label>
                    <div className="flex items-center space-x-3">
                      <input type="color" className="w-10 h-10 border rounded-sm cursor-pointer" value={editingData.parsedContent.styles?.backgroundColor || '#FFFFFF'} onChange={(e) => updateValue('backgroundColor', e.target.value, true)} />
                      <Input className="h-11 rounded-none font-mono text-xs border-slate-200" value={editingData.parsedContent.styles?.backgroundColor || ''} onChange={(e) => updateValue('backgroundColor', e.target.value, true)} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label className="text-[10px] opacity-50 uppercase font-bold">Overlay Intensity</Label>
                      <span className="text-[10px] font-mono">{editingData.parsedContent.styles?.overlayOpacity || 20}%</span>
                    </div>
                    <Slider value={[editingData.parsedContent.styles?.overlayOpacity || 20]} max={100} onValueChange={([v]) => updateValue('overlayOpacity', v, true)} />
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t">
                  <div className="flex items-center text-primary font-bold text-[9px] uppercase tracking-[0.2em]">
                    <Layout className="w-3 h-3 mr-2 text-accent" /> Layout Config
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] uppercase font-bold opacity-50">Section Padding</Label>
                      <span className="text-[10px] font-mono">{editingData.parsedContent.styles?.paddingVertical || '128'}px</span>
                    </div>
                    <Slider value={[parseInt(editingData.parsedContent.styles?.paddingVertical || '128')]} max={300} step={8} onValueChange={([val]) => updateValue('paddingVertical', val.toString(), true)} />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-bold opacity-50">Alignment</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['left', 'center'].map(align => (
                        <Button key={align} variant={editingData.parsedContent.styles?.alignment === align ? 'default' : 'outline'} className="rounded-none h-11 text-[10px] uppercase font-bold" onClick={() => updateValue('alignment', align, true)}>
                          {align}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>

      <div className="p-6 border-t bg-white flex flex-col space-y-3 shrink-0">
        <Button className="w-full bg-primary hover:bg-primary/90 rounded-none h-14 uppercase tracking-[0.2em] text-[10px] font-bold" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Publish to Live Site
        </Button>
        <Button variant="outline" className="w-full rounded-none h-12 uppercase tracking-widest text-[9px] font-bold" onClick={() => router.push(pathname)}>
          Cancel & Exit
        </Button>
      </div>
    </div>
  );
}
