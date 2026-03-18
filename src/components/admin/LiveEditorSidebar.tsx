'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
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
  Palette, 
  Layout, 
  Type, 
  Sparkles,
  ChevronLeft,
  Image as ImageIcon,
  Video,
  MousePointer2,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function LiveEditorSidebar() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  
  const isEditMode = searchParams.get('edit') === 'true' && !!user;
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);

  // Listen for custom events from SectionRenderer
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
    toast({ title: "Updated", description: "Changes synced to Firestore." });
  }

  return (
    <div className={cn(
      "fixed top-0 right-0 h-screen w-96 bg-white shadow-2xl z-[100] flex flex-col border-l transition-transform duration-500 ease-in-out",
      selectedSectionId ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between bg-primary text-white">
        <div className="flex items-center space-x-3">
          <Settings2 className="w-5 h-5" />
          <div>
            <h3 className="font-headline font-bold text-lg">{editingData?.type || 'Editor'}</h3>
            <p className="text-[10px] uppercase tracking-widest opacity-60">Visual Architect</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => setSelectedSectionId(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {editingData && (
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full rounded-none h-12 bg-muted/30 border-b">
              <TabsTrigger value="content" className="flex-1 rounded-none text-[10px] uppercase font-bold tracking-widest">Content</TabsTrigger>
              <TabsTrigger value="style" className="flex-1 rounded-none text-[10px] uppercase font-bold tracking-widest">Style</TabsTrigger>
              <TabsTrigger value="advanced" className="flex-1 rounded-none text-[10px] uppercase font-bold tracking-widest">Layout</TabsTrigger>
            </TabsList>

            <div className="p-6 space-y-8">
              <TabsContent value="content" className="mt-0 space-y-6">
                {/* Text Elements */}
                <div className="space-y-4">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-widest opacity-40">
                    <Type className="w-3 h-3 mr-2" /> Text Elements
                  </div>
                  {['title', 'subtitle', 'content', 'handle', 'ctaText', 'buttonText'].map((key) => {
                    if (editingData.parsedContent[key] === undefined) return null;
                    return (
                      <div key={key} className="space-y-2">
                        <Label className="text-[9px] uppercase font-bold opacity-60">{key}</Label>
                        {key.includes('content') || key.includes('subtitle') ? (
                          <Textarea 
                            className="rounded-none min-h-[80px] text-sm"
                            value={editingData.parsedContent[key]} 
                            onChange={(e) => updateValue(key, e.target.value)}
                          />
                        ) : (
                          <Input 
                            className="rounded-none text-sm"
                            value={editingData.parsedContent[key]} 
                            onChange={(e) => updateValue(key, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Media Elements */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-widest opacity-40">
                    <ImageIcon className="w-3 h-3 mr-2" /> Media Assets
                  </div>
                  {['imageUrl', 'videoUrl', 'audioUrl'].map((key) => {
                    if (editingData.parsedContent[key] === undefined && !editingData.type.includes('Block')) return null;
                    return (
                      <div key={key} className="space-y-2">
                        <Label className="text-[9px] uppercase font-bold opacity-60">{key}</Label>
                        <Input 
                          placeholder="https://..."
                          className="rounded-none text-xs font-mono"
                          value={editingData.parsedContent[key] || ''} 
                          onChange={(e) => updateValue(key, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Interaction Elements */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-widest opacity-40">
                    <MousePointer2 className="w-3 h-3 mr-2" /> Action Link
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase font-bold opacity-60">Button/Link Target</Label>
                    <Input 
                      placeholder="/services"
                      className="rounded-none text-xs"
                      value={editingData.parsedContent.targetLink || ''} 
                      onChange={(e) => updateValue('targetLink', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="mt-0 space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase font-bold tracking-widest">Background Control</Label>
                  <Select 
                    value={editingData.parsedContent.backgroundType || 'image'} 
                    onValueChange={(val) => updateValue('backgroundType', val)}
                  >
                    <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Solid Color</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video (BG)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-[10px] uppercase font-bold tracking-widest">Colors</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] opacity-50">Headings</Label>
                      <div className="flex items-center space-x-2">
                        <input type="color" className="w-6 h-6 border rounded-sm" value={editingData.parsedContent.styles?.titleColor || '#000000'} onChange={(e) => updateValue('titleColor', e.target.value, true)} />
                        <Input className="h-8 text-[10px]" value={editingData.parsedContent.styles?.titleColor || ''} onChange={(e) => updateValue('titleColor', e.target.value, true)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] opacity-50">Accents</Label>
                      <div className="flex items-center space-x-2">
                        <input type="color" className="w-6 h-6 border rounded-sm" value={editingData.parsedContent.styles?.subtitleColor || '#C6A15B'} onChange={(e) => updateValue('subtitleColor', e.target.value, true)} />
                        <Input className="h-8 text-[10px]" value={editingData.parsedContent.styles?.subtitleColor || ''} onChange={(e) => updateValue('subtitleColor', e.target.value, true)} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase font-bold tracking-widest">Overlay Engine</Label>
                    <span className="text-[10px] font-mono">{editingData.parsedContent.styles?.overlayOpacity || 20}%</span>
                  </div>
                  <Slider 
                    value={[editingData.parsedContent.styles?.overlayOpacity ?? 20]} 
                    max={100} 
                    onValueChange={([val]) => updateValue('overlayOpacity', val, true)} 
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="mt-0 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="text-[10px] uppercase font-bold tracking-widest">Vertical Padding</Label>
                    <span className="text-[10px] font-mono">{editingData.parsedContent.styles?.paddingVertical || '128'}px</span>
                  </div>
                  <Slider 
                    value={[parseInt(editingData.parsedContent.styles?.paddingVertical || '128')]} 
                    max={300} 
                    step={8} 
                    onValueChange={([val]) => updateValue('paddingVertical', val.toString(), true)} 
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-[10px] uppercase font-bold tracking-widest">Alignment</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['left', 'center', 'right'].map(align => (
                      <Button 
                        key={align}
                        variant={editingData.parsedContent.styles?.alignment === align ? 'default' : 'outline'}
                        className="rounded-none h-8 text-[9px] uppercase font-bold"
                        onClick={() => updateValue('alignment', align, true)}
                      >
                        {align}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-[10px] uppercase font-bold tracking-widest">Button Styling</Label>
                  <Select 
                    value={editingData.parsedContent.styles?.buttonType || 'primary'} 
                    onValueChange={(val) => updateValue('buttonType', val, true)}
                  >
                    <SelectTrigger className="rounded-none h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Luxury Gold (Solid)</SelectItem>
                      <SelectItem value="outline">Editorial (Outline)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t bg-white flex space-x-3">
        <Button className="flex-grow bg-primary hover:bg-primary/90 rounded-none h-12 uppercase tracking-widest text-[10px] font-bold" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Sync Sanctuary
        </Button>
        <Button variant="outline" className="rounded-none h-12" onClick={() => router.push('/admin')}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Status Indicators */}
      {!selectedSectionId && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center space-y-6">
          <Sparkles className="w-12 h-12 text-accent animate-pulse" />
          <div>
            <h4 className="font-headline text-2xl">Visual Builder Ready</h4>
            <p className="text-muted-foreground text-sm mt-2 font-light">Click any section on the left to start fine-tuning your luxury experience.</p>
          </div>
          <Button variant="outline" className="rounded-none" onClick={() => router.push('/admin')}>Return to Command</Button>
        </div>
      )}
    </div>
  );
}
