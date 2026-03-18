'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  X, 
  Save, 
  Type, 
  Image as ImageIcon, 
  Video, 
  Palette, 
  Link as LinkIcon, 
  Component, 
  Upload,
  Layout,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const isMediaKey = (key: string) => {
  const k = key.toLowerCase();
  return k.includes('image') || k.includes('photo') || k.includes('thumb') || 
         k.includes('logo') || k.includes('icon') || k.includes('video') || 
         k.includes('src') || k.includes('media') || (k.includes('url') && !k.includes('cta'));
};

const isLinkKey = (key: string) => {
  const k = key.toLowerCase();
  return k.includes('url') || k.includes('link') || k.includes('href') || k.includes('path');
};

const MediaField = ({ 
  label, 
  value, 
  onChange, 
  type = 'image',
  onRemove
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  type?: 'image' | 'video',
  onRemove?: () => void
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file) return;
    if (file.size > 800000) {
      toast({ variant: "destructive", title: "Asset too large", description: "Use files under 800KB." });
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
  const inputId = `upload-${label.replace(/\W/g, '-')}`;

  return (
    <div className="space-y-3 p-4 bg-white border rounded-sm shadow-sm border-primary/5">
      <div className="flex items-center justify-between">
        <Label className="text-[9px] uppercase font-bold tracking-widest text-primary/60">{label}</Label>
        {onRemove && (
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={onRemove}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <div 
        className={cn(
          "relative border-2 border-dashed rounded-sm transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50/50",
          isDragging ? "border-accent bg-accent/5" : "border-slate-200 hover:border-accent/30",
          safeValue ? "aspect-video" : "h-20"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          handleFile(file);
        }}
        onClick={() => {
          const el = document.getElementById(inputId);
          if (el) (el as HTMLInputElement).click();
        }}
      >
        {safeValue ? (
          <div className="relative w-full h-full group">
            {type === 'image' ? (
              <img src={safeValue} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center"><Video className="w-6 h-6 text-white/20" /></div>
            )}
            <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
              <Upload className="w-5 h-5 text-white mb-1" />
              <p className="text-[8px] text-white font-bold uppercase tracking-widest">Replace</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-1 opacity-40">
            <Upload className="w-4 h-4" />
            <p className="text-[8px] font-bold uppercase tracking-tighter">Upload Media</p>
          </div>
        )}
        <input id={inputId} type="file" className="hidden" accept={type === 'image' ? "image/*" : "video/*"} onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }} />
      </div>

      <div className="space-y-1">
        <Label className="text-[8px] uppercase opacity-40 font-bold">Source URL</Label>
        <Input 
          placeholder="https://..."
          className="h-8 text-[9px] font-mono rounded-none"
          value={safeValue.startsWith('data:') ? 'Local Asset' : safeValue}
          onChange={(e) => onChange(e.target.value)}
        />
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
    const handleSectionSelect = (e: any) => { if (isEditMode) setSelectedSectionId(e.detail.id); };
    window.addEventListener('verde-select-section', handleSectionSelect);
    return () => window.removeEventListener('verde-select-section', handleSectionSelect);
  }, [isEditMode]);

  const sectionRef = useMemoFirebase(() => selectedSectionId ? doc(db, 'cms_page_sections', selectedSectionId) : null, [db, selectedSectionId]);
  const { data: sectionData } = useDoc(sectionRef);

  useEffect(() => {
    if (sectionData) {
      try {
        const parsed = JSON.parse(sectionData.content || '{}');
        if (!parsed.styles) parsed.styles = {};
        setEditingData({ ...sectionData, parsedContent: parsed });
      } catch (err) { console.error("Editor Error:", err); }
    }
  }, [sectionData]);

  const updateValue = (path: string, value: any) => {
    if (!editingData) return;
    const updated = { ...editingData.parsedContent };
    const keys = path.split('.');
    let current = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setEditingData({ ...editingData, parsedContent: updated });
  };

  const getDeepFields = (obj: any, path: string = '', acc: any[] = []) => {
    if (!obj || typeof obj !== 'object') return acc;
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      const fullPath = path ? `${path}.${key}` : key;
      if (Array.isArray(val)) {
        acc.push({ path: fullPath, value: val, key, type: 'array' });
      } else if (typeof val === 'object' && val !== null) {
        getDeepFields(val, fullPath, acc);
      } else {
        acc.push({ path: fullPath, value: val, key, type: typeof val });
      }
    });
    return acc;
  };

  const allFields = useMemo(() => editingData ? getDeepFields(editingData.parsedContent) : [], [editingData]);

  function handleSave() {
    if (!editingData || !selectedSectionId) return;
    const contentString = JSON.stringify(editingData.parsedContent);
    if (contentString.length > 900000) {
      toast({ variant: "destructive", title: "Error", description: "Config too large." });
      return;
    }
    setDocumentNonBlocking(doc(db, 'cms_page_sections', selectedSectionId), { ...editingData, content: contentString }, { merge: true });
    toast({ title: "Sanctuary Synced", description: "Live updates published." });
  }

  // Moved conditional return to the bottom to avoid Rules of Hooks violation
  if (!isEditMode) return null;

  return (
    <div className={cn(
      "fixed top-0 right-0 h-screen w-[400px] bg-white shadow-2xl z-[100] flex flex-col border-l transition-transform duration-500 ease-in-out",
      selectedSectionId ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="p-6 border-b flex items-center justify-between bg-primary text-white shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-accent rounded-sm shadow-inner"><Component className="w-5 h-5 text-primary" /></div>
          <div>
            <h3 className="font-headline font-bold text-lg">{editingData?.type || 'Editor'}</h3>
            <p className="text-[9px] uppercase tracking-[0.2em] text-accent font-bold">Element ID: {selectedSectionId?.split('-')[0]}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setSelectedSectionId(null)}><X className="w-4 h-4" /></button>
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
                <div className="space-y-6">
                  <div className="flex items-center text-primary font-bold text-[9px] uppercase tracking-[0.2em] border-b pb-2"><Type className="w-3 h-3 mr-2 text-accent" /> Text Elements</div>
                  {allFields.filter(f => f.type === 'string' && !isMediaKey(f.key) && !isLinkKey(f.key) && f.key !== 'backgroundType').map(f => (
                    <div key={f.path} className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">{f.path.split('.').pop()?.replace(/([A-Z])/g, ' $1')}</Label>
                      {f.value.length > 50 || f.path.includes('content') ? (
                        <Textarea className="rounded-none min-h-[100px] text-sm border-slate-200" value={f.value} onChange={(e) => updateValue(f.path, e.target.value)} />
                      ) : (
                        <Input className="rounded-none h-11 text-sm border-slate-200" value={f.value} onChange={(e) => updateValue(f.path, e.target.value)} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center text-primary font-bold text-[9px] uppercase tracking-[0.2em] border-b pb-2"><LinkIcon className="w-3 h-3 mr-2 text-accent" /> Navigation</div>
                  {allFields.filter(f => f.type === 'string' && isLinkKey(f.key)).map(f => (
                    <div key={f.path} className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">{f.path}</Label>
                      <Input className="rounded-none h-11 text-sm border-slate-200 font-mono" value={f.value} onChange={(e) => updateValue(f.path, e.target.value)} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="media" className="mt-0 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center text-primary font-bold text-[9px] uppercase tracking-[0.2em] border-b pb-2"><ImageIcon className="w-3 h-3 mr-2 text-accent" /> Global Media</div>
                  {allFields.map(f => {
                    if (f.type === 'array') {
                      return f.value.map((item: any, idx: number) => {
                        const itemUrl = typeof item === 'string' ? item : (item.imageUrl || item.url || '');
                        if (typeof itemUrl !== 'string') return null;
                        return (
                          <MediaField 
                            key={`${f.path}-${idx}`} 
                            label={`${f.path} [${idx + 1}]`} 
                            value={itemUrl} 
                            onChange={(newVal) => {
                              const newArr = [...f.value];
                              if (typeof newArr[idx] === 'string') newArr[idx] = newVal;
                              else newArr[idx] = { ...newArr[idx], imageUrl: newVal, url: newVal };
                              updateValue(f.path, newArr);
                            }} 
                          />
                        );
                      });
                    }
                    if (isMediaKey(f.key) && f.type === 'string') {
                      return <MediaField key={f.path} label={f.path} value={f.value} onChange={(newVal) => updateValue(f.path, newVal)} type={f.path.toLowerCase().includes('video') ? 'video' : 'image'} />;
                    }
                    return null;
                  })}
                  {['images', 'gallery', 'posts'].some(k => editingData.parsedContent[k]) && (
                    <Button variant="outline" className="w-full border-dashed rounded-none text-[10px] uppercase font-bold" onClick={() => {
                      const key = ['images', 'gallery', 'posts'].find(k => editingData.parsedContent[k])!;
                      updateValue(key, [...editingData.parsedContent[key], 'https://picsum.photos/seed/new/800/600']);
                    }}><Plus className="w-3 h-3 mr-2" /> Add Item</Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="style" className="mt-0 space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Background Layer</Label>
                  <Select value={editingData.parsedContent.backgroundType || 'color'} onValueChange={(val) => updateValue('backgroundType', val)}>
                    <SelectTrigger className="rounded-none h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Solid Theme</SelectItem>
                      <SelectItem value="image">Image Background</SelectItem>
                      <SelectItem value="video">Video Background</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-6 pt-6 border-t">
                  <div className="flex items-center text-primary font-bold text-[9px] uppercase tracking-[0.2em] mb-4"><Palette className="w-3 h-3 mr-2 text-accent" /> Visuals</div>
                  <div className="space-y-4">
                    <Label className="text-[10px] opacity-50 uppercase font-bold">Accent Color</Label>
                    <div className="flex items-center space-x-3">
                      <input type="color" className="w-10 h-10 border rounded-sm cursor-pointer" value={editingData.parsedContent.styles?.backgroundColor || '#FFFFFF'} onChange={(e) => updateValue('styles.backgroundColor', e.target.value)} />
                      <Input className="h-11 rounded-none font-mono text-xs" value={editingData.parsedContent.styles?.backgroundColor || ''} onChange={(e) => updateValue('styles.backgroundColor', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between"><Label className="text-[10px] opacity-50 uppercase font-bold">Overlay</Label><span className="text-[10px] font-mono">{editingData.parsedContent.styles?.overlayOpacity || 20}%</span></div>
                    <Slider value={[editingData.parsedContent.styles?.overlayOpacity || 20]} max={100} onValueChange={([v]) => updateValue('styles.overlayOpacity', v)} />
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t">
                  <div className="flex items-center text-primary font-bold text-[9px] uppercase tracking-[0.2em]"><Layout className="w-3 h-3 mr-2 text-accent" /> Layout</div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><Label className="text-[10px] uppercase font-bold opacity-50">Vertical Padding</Label><span className="text-[10px] font-mono">{editingData.parsedContent.styles?.paddingVertical || '128'}px</span></div>
                    <Slider value={[parseInt(editingData.parsedContent.styles?.paddingVertical || '128')]} max={300} step={8} onValueChange={([val]) => updateValue('styles.paddingVertical', val.toString())} />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-bold opacity-50">Alignment</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['left', 'center'].map(align => (
                        <Button key={align} variant={editingData.parsedContent.styles?.alignment === align ? 'default' : 'outline'} className="rounded-none h-11 text-[10px] uppercase font-bold" onClick={() => updateValue('styles.alignment', align)}>{align}</Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>

      <div className="p-6 border-t bg-white flex flex-col space-y-3 shrink-0 shadow-inner">
        <Button className="w-full bg-primary hover:bg-primary/90 rounded-none h-14 uppercase tracking-[0.2em] text-[10px] font-bold" onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Publish Changes</Button>
        <Button variant="outline" className="w-full rounded-none h-12 uppercase tracking-widest text-[9px] font-bold" onClick={() => router.push(pathname)}>Exit Visual Architect</Button>
      </div>
    </div>
  );
}