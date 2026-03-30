
'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Save, Palette, Type, ImageIcon, Layout, Upload, Trash2, Globe, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const LogoMediaField = ({ 
  label, 
  value, 
  onChange,
  altValue,
  onAltChange 
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void,
  altValue?: string,
  onAltChange?: (val: string) => void 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file) return;
    const limit = 300000; // 300KB
    if (file.size > limit) {
      toast({ 
        variant: "destructive", 
        title: "Asset too large", 
        description: `Logo files must be under 300KB for database compatibility.` 
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase font-bold tracking-widest opacity-60">{label}</Label>
        <Info className="w-3 h-3 text-muted-foreground/40 cursor-help" />
      </div>
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50/50 min-h-[160px]",
          isDragging ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/30"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          handleFile(file);
        }}
        onClick={() => document.getElementById('logo-upload')?.click()}
      >
        {value ? (
          <div className="relative w-full h-full p-4 flex items-center justify-center group">
            <img src={value} className="max-h-32 object-contain" alt={altValue || "Logo Preview"} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 opacity-40">
            <Upload className="w-8 h-8" />
            <p className="text-xs font-bold uppercase tracking-widest">Drop logo here</p>
          </div>
        )}
        <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }} />
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-[9px] opacity-40 uppercase font-bold">Direct URL</Label>
          <Input 
            placeholder="https://..."
            className="h-9 text-xs rounded-none"
            value={value?.startsWith('data:') ? 'Local Asset' : (value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[9px] opacity-40 uppercase font-bold">Logo Alt Text</Label>
          <Input 
            placeholder="Verde Salon Logo Description"
            className="h-9 text-xs rounded-none"
            value={altValue ?? ''}
            onChange={(e) => onAltChange?.(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default function BrandingEditor() {
  const db = useFirestore();
  const { toast } = useToast();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: settings, isLoading } = useDoc(settingsRef);
  const [isPublishing, setIsPublishing] = useState(false);

  const [form, setForm] = useState({
    siteName: 'Verde Salon',
    logoUrl: '',
    logoAlt: '',
    logoHeight: 40,
    logoWidth: 0,
    logoPlacement: 'left',
    logoPadding: 0,
    logoMargin: 0,
    hoverScale: 100,
    hoverOpacity: 100,
    primaryColor: '#4A6741',
    backgroundColor: '#F4F6F5',
    accentColor: '#A8B89E',
    headlineFont: 'Playfair Display',
    bodyFont: 'PT Sans'
  });

  useEffect(() => {
    if (settings) {
      setForm({
        siteName: settings.siteName || 'Verde Salon',
        logoUrl: settings.logo?.url || '',
        logoAlt: settings.logo?.alt || '',
        logoHeight: settings.logo?.height || 40,
        logoWidth: settings.logo?.width || 0,
        logoPlacement: settings.logo?.placement || 'left',
        logoPadding: settings.logo?.padding || 0,
        logoMargin: settings.logo?.margin || 0,
        hoverScale: settings.logo?.hoverScale || 100,
        hoverOpacity: settings.logo?.hoverOpacity || 100,
        primaryColor: settings.colors?.primary || '#4A6741',
        backgroundColor: settings.colors?.background || '#F4F6F5',
        accentColor: settings.colors?.accent || '#A8B89E',
        headlineFont: settings.typography?.headline || 'Playfair Display',
        bodyFont: settings.typography?.body || 'PT Sans'
      });
    }
  }, [settings]);

  function handleSaveDraft() {
    setDocumentNonBlocking(settingsRef, {
      ...settings,
      siteName: form.siteName,
      logo: {
        url: form.logoUrl,
        alt: form.logoAlt,
        height: form.logoHeight,
        width: form.logoWidth,
        placement: form.logoPlacement,
        padding: form.logoPadding,
        margin: form.logoMargin,
        hoverScale: form.hoverScale,
        hoverOpacity: form.hoverOpacity
      },
      colors: {
        primary: form.primaryColor,
        background: form.backgroundColor,
        accent: form.accentColor
      },
      typography: {
        headline: form.headlineFont,
        body: form.bodyFont
      }
    }, { merge: true });

    toast({ title: "Draft Saved", description: "Changes are visible in Architect Mode." });
  }

  async function handlePublish() {
    setIsPublishing(true);
    try {
      const currentConfig = {
        siteName: form.siteName,
        logo: {
          url: form.logoUrl,
          alt: form.logoAlt,
          height: form.logoHeight,
          width: form.logoWidth,
          placement: form.logoPlacement,
          padding: form.logoPadding,
          margin: form.logoMargin,
          hoverScale: form.hoverScale,
          hoverOpacity: form.hoverOpacity
        },
        colors: {
          primary: form.primaryColor,
          background: form.backgroundColor,
          accent: form.accentColor
        },
        typography: {
          headline: form.headlineFont,
          body: form.bodyFont
        }
      };

      setDocumentNonBlocking(settingsRef, {
        ...settings,
        ...currentConfig,
        published: currentConfig,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({ title: "Identity Published", description: "Your brand changes are now live for everyone." });
    } catch (e) {
      toast({ variant: "destructive", title: "Publish Failed" });
    } finally {
      setIsPublishing(false);
    }
  }

  if (isLoading) return <div className="py-20 text-center animate-pulse">Loading Identity...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Identity Architect</h1>
          <p className="text-muted-foreground mt-1">Refine your logo and global aesthetic signature.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleSaveDraft} className="border-primary/20">
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button className="bg-primary hover:bg-primary/90 min-w-[160px]" onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
            Publish Live
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <CardTitle>Logo Engine</CardTitle>
              </div>
              <CardDescription>Upload and style your brand anchor</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <LogoMediaField 
                    label="Brand Logo" 
                    value={form.logoUrl} 
                    onChange={(val) => setForm({...form, logoUrl: val})}
                    altValue={form.logoAlt}
                    onAltChange={(val) => setForm({...form, logoAlt: val})} 
                  />
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Navbar Alignment</Label>
                    <Select value={form.logoPlacement ?? 'left'} onValueChange={(v) => setForm({...form, logoPlacement: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left Aligned</SelectItem>
                        <SelectItem value="center">Centered Hub</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-bold uppercase opacity-60">Dimensions (px)</Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-[9px] opacity-50 uppercase">Height</p>
                        <Slider value={[form.logoHeight ?? 40]} max={150} min={20} step={2} onValueChange={([v]) => setForm({...form, logoHeight: v})} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] opacity-50 uppercase">Width (Set 0 for Auto)</p>
                        <Slider value={[form.logoWidth ?? 0]} max={400} min={0} step={5} onValueChange={([v]) => setForm({...form, logoWidth: v})} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t">
                    <Label className="text-[10px] font-bold uppercase opacity-60">Spacing (px)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[9px] opacity-50 uppercase">Padding</p>
                        <Input type="number" value={form.logoPadding ?? 0} onChange={(e) => setForm({...form, logoPadding: parseInt(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] opacity-50 uppercase">Margin</p>
                        <Input type="number" value={form.logoMargin ?? 0} onChange={(e) => setForm({...form, logoMargin: parseInt(e.target.value) || 0})} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <CardTitle>Color Signature</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'Primary (Forest)', key: 'primaryColor' },
                  { label: 'Background (Canvas)', key: 'backgroundColor' },
                  { label: 'Accent (Gold)', key: 'accentColor' }
                ].map((color) => (
                  <div key={color.key} className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full border shadow-inner" style={{ backgroundColor: (form as any)[color.key] }} />
                    <div className="flex-grow space-y-1">
                      <Label className="text-[10px] uppercase">{color.label}</Label>
                      <input 
                        type="color" 
                        value={(form as any)[color.key]} 
                        onChange={(e) => setForm({...form, [color.key]: e.target.value})}
                        className="w-full h-8 cursor-pointer border-none bg-transparent"
                      />
                      <Input value={(form as any)[color.key] ?? ''} onChange={(e) => setForm({...form, [color.key]: e.target.value})} className="h-8 text-xs font-mono" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Type className="w-5 h-5 text-primary" />
                  <CardTitle>Typography</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase">Headline Font</Label>
                  <Input value={form.headlineFont ?? ''} onChange={(e) => setForm({...form, headlineFont: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase">Body Text Font</Label>
                  <Input value={form.bodyFont ?? ''} onChange={(e) => setForm({...form, bodyFont: e.target.value})} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-xl sticky top-8 bg-white overflow-hidden">
            <CardHeader className="bg-primary text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center">
                  <Layout className="w-4 h-4 mr-2" /> Live Navbar Preview
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-slate-100 p-8">
                <div className="bg-white shadow-lg border h-24 flex items-center px-6 overflow-hidden">
                  <div className={cn(
                    "flex w-full items-center transition-all",
                    form.logoPlacement === 'center' ? 'justify-center' : 'justify-start'
                  )}>
                    {form.logoUrl ? (
                      <div className="relative group cursor-pointer" style={{ padding: `${form.logoPadding}px`, margin: `${form.logoMargin}px` }}>
                        <img 
                          src={form.logoUrl} 
                          alt={form.logoAlt || form.siteName} 
                          style={{ 
                            height: `${form.logoHeight}px`,
                            width: form.logoWidth && form.logoWidth > 0 ? `${form.logoWidth}px` : 'auto'
                          }}
                        />
                      </div>
                    ) : (
                      <span className="font-headline text-xl tracking-[0.3em] font-light uppercase">{form.siteName}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
