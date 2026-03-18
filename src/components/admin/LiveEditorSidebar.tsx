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
  Layout
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
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file) return;
    
    // Firestore limit is 1MB. Base64 adds ~33% overhead. 
    // We restrict to ~700KB to be safe.
    if (file.size > 700000) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please use an asset under 700KB for real-time synchronization.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const safeValue = typeof value === 'string' ? value : '';
  const inputId = `file-input-${label.replace(/\s+/g, '-')}-${type}`;

  return (
    <div className="space-y-3">
      <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">{label}</Label>
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer group",
          isDragging ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50",
          safeValue ? "aspect-video" : "h-32"
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
          <div className="relative w-full h-full">
            {type === 'image' ? (
              <img src={safeValue} className="w-full h-full object-contain rounded" alt="Preview" />
            ) : (
              <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center">
                <Video className="w-8 h-8 text-white/20" />
              </div>
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
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Or paste external URL..."
          className="h-9 text-[10px] font-mono border-slate-200"
          value={safeValue.startsWith('data:') ? '' : safeValue}
          onChange={(e) => onChange(e.target.value)}
        />
        {safeValue && (
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
      toast({ variant: "destructive", title: "Section too large", description: "Please use external links for large images." });
      return;
    }

    const finalSection = { ...editingData, content: contentString };
    delete finalSection.parsedContent;
    
    setDocumentNonBlocking(doc(db, 'cms_page_sections', selectedSectionId), finalSection, { merge: true });
    toast({ title: "Sanctuary Synced", description: "Design changes are now live." });
  }

  const isMediaKey = (key: string) => 
    key.toLowerCase().includes('image') || 
    key.toLowerCase().includes('photo') || 
    key.toLowerCase().includes('thumb') || 
    key.toLowerCase().includes('logo') || 
    key.toLowerCase().includes('icon') ||
    key.toLowerCase().includes('video');

  const isLinkKey = (key: string) => 
    key.toLowerCase().includes('url') || 
    key.toLowerCase().includes('link') || 
    key.toLowerCase().includes('href');

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
            <p className="text-[9px] uppercase tracking-[0.2em] text-accent font-bold">Live Visual Architect</p>
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
              <TabsTrigger value="style" className="flex-1 h-full rounded-none text-[10px] uppercase font-bold tracking-widest">Style</TabsTrigger>
              <TabsTrigger value="layout" className="flex-1 h-full rounded-none text-[10px] uppercase font-bold tracking-widest">Layout</TabsTrigger>
            </TabsList>

            <div className="p-8 space-y-10 pb-32">
              <TabsContent value="content" className="mt-0 space-y-10">
                {/* Text discovery */}
                <div className="space-y-6">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                    <Type className="w-3 h-3 mr-2 text-accent" /> Text Elements
                  </div>
                  {Object.keys(editingData.parsedContent).map(key => {
                    const val = editingData.parsedContent[key];
                    if (typeof val !== 'string' || isMediaKey(key) || isLinkKey(key) || key === 'backgroundType') return null;
                    return (
                      <div key={key} className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        {val.length > 50 || key.includes('content') ? (
                          <Textarea className="rounded-none min-h-[100px] text-sm" value={val} onChange={(e) => updateValue(key, e.target.value)} />
                        ) : (
                          <Input className="rounded-none h-11 text-sm" value={val} onChange={(e) => updateValue(key, e.target.value)} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Media discovery */}
                <div className="space-y-8 pt-6 border-t border-slate-100">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                    <ImageIcon className="w-3 h-3 mr-2 text-accent" /> Media Management
                  </div>
                  {Object.keys(editingData.parsedContent).map(key => {
                    if (!isMediaKey(key)) return null;
                    const val = editingData.parsedContent[key];
                    if (Array.isArray(val)) {
                      return val.map((item, idx) => (
                        <MediaField key={`${key}-${idx}`} label={`${key} ${idx + 1}`} value={item} onChange={(newVal) => {
                          const newArr = [...val];
                          newArr[idx] = newVal;
                          updateValue(key, newArr);
                        }} />
                      ));
                    }
                    return <MediaField key={key} label={key} value={val} onChange={(newVal) => updateValue(key, newVal)} type={key.toLowerCase().includes('video') ? 'video' : 'image'} />;
                  })}
                </div>

                {/* Link discovery */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                    <LinkIcon className="w-3 h-3 mr-2 text-accent" /> Navigation
                  </div>
                  {Object.keys(editingData.parsedContent).map(key => {
                    if (!isLinkKey(key) || isMediaKey(key)) return null;
                    return (
                      <div key={key} className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        <Input className="rounded-none h-11 text-sm" value={editingData.parsedContent[key]} onChange={(e) => updateValue(key, e.target.value)} />
                      </div>
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
                      <SelectItem value="color">Solid Background</SelectItem>
                      <SelectItem value="image">High-Res Image</SelectItem>
                      <SelectItem value="video">Cinematic Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingData.parsedContent.backgroundType === 'image' && (
                  <MediaField label="Background Image" value={editingData.parsedContent.imageUrl || ''} onChange={(val) => updateValue('imageUrl', val)} />
                )}

                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                    <Palette className="w-3 h-3 mr-2 text-accent" /> Palette Controls
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] opacity-50 uppercase font-bold">Base Color</Label>
                    <div className="flex items-center space-x-3">
                      <input type="color" className="w-10 h-10 border rounded-full cursor-pointer" value={editingData.parsedContent.styles?.backgroundColor || '#FFFFFF'} onChange={(e) => updateValue('backgroundColor', e.target.value, true)} />
                      <Input className="h-11 rounded-none font-mono text-xs" value={editingData.parsedContent.styles?.backgroundColor || ''} onChange={(e) => updateValue('backgroundColor', e.target.value, true)} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="mt-0 space-y-10">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Vertical Spacing</Label>
                    <span className="text-[10px] font-mono">{editingData.parsedContent.styles?.paddingVertical || '128'}px</span>
                  </div>
                  <Slider value={[parseInt(editingData.parsedContent.styles?.paddingVertical || '128')]} max={300} step={8} onValueChange={([val]) => updateValue('paddingVertical', val.toString(), true)} />
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <Label className="text-[10px] uppercase font-bold opacity-50">Content Alignment</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['left', 'center'].map(align => (
                      <Button key={align} variant={editingData.parsedContent.styles?.alignment === align ? 'default' : 'outline'} className="rounded-none h-11 text-[10px] uppercase font-bold" onClick={() => updateValue('alignment', align, true)}>
                        {align}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>

      <div className="p-6 border-t bg-white flex flex-col space-y-3 shrink-0">
        <Button className="w-full bg-primary hover:bg-primary/90 rounded-none h-14 uppercase tracking-[0.2em] text-[10px] font-bold" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Sync Design Changes
        </Button>
        <Button variant="outline" className="w-full rounded-none h-12 uppercase tracking-widest text-[9px] font-bold" onClick={() => router.push(pathname)}>
          Exit Visual Architect
        </Button>
      </div>
    </div>
  );
}
