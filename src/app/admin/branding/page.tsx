
'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Palette, Type, ImageIcon, Layout } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BrandingEditor() {
  const db = useFirestore();
  const { toast } = useToast();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: settings, isLoading } = useDoc(settingsRef);

  const [form, setForm] = useState({
    siteName: 'Verde Salon',
    logoUrl: '',
    logoHeight: 40,
    logoPlacement: 'left',
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
        logoHeight: settings.logo?.height || 40,
        logoPlacement: settings.logo?.placement || 'left',
        primaryColor: settings.colors?.primary || '#4A6741',
        backgroundColor: settings.colors?.background || '#F4F6F5',
        accentColor: settings.colors?.accent || '#A8B89E',
        headlineFont: settings.typography?.headline || 'Playfair Display',
        bodyFont: settings.typography?.body || 'PT Sans'
      });
    }
  }, [settings]);

  function handleSave() {
    setDocumentNonBlocking(settingsRef, {
      ...settings,
      siteName: form.siteName,
      logo: {
        url: form.logoUrl,
        height: form.logoHeight,
        placement: form.logoPlacement
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

    toast({
      title: "Identity Published",
      description: "Global theme and assets have been updated.",
    });
  }

  if (isLoading) return <div className="py-20 text-center animate-pulse">Loading Identity...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Branding & Identity</h1>
          <p className="text-muted-foreground">Manage your logo, colors, and typography globally.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Publish Branding
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logo & Site Info */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <CardTitle>Brand Assets</CardTitle>
            </div>
            <CardDescription>Logo placement and site naming</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input 
                value={form.siteName} 
                onChange={(e) => setForm({...form, siteName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Logo Image URL</Label>
              <Input 
                value={form.logoUrl} 
                onChange={(e) => setForm({...form, logoUrl: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Logo Height (px)</Label>
                <Input 
                  type="number"
                  value={form.logoHeight} 
                  onChange={(e) => setForm({...form, logoHeight: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label>Navbar Placement</Label>
                <Select 
                  value={form.logoPlacement} 
                  onValueChange={(val) => setForm({...form, logoPlacement: val})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left Aligned</SelectItem>
                    <SelectItem value="center">Centered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle>Color Palette</CardTitle>
            </div>
            <CardDescription>Nature-inspired theme hex codes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg border shadow-sm" style={{ backgroundColor: form.primaryColor }} />
              <div className="flex-grow space-y-1">
                <Label>Primary (Forest Green)</Label>
                <Input value={form.primaryColor} onChange={(e) => setForm({...form, primaryColor: e.target.value})} />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg border shadow-sm" style={{ backgroundColor: form.backgroundColor }} />
              <div className="flex-grow space-y-1">
                <Label>Background (Off-White)</Label>
                <Input value={form.backgroundColor} onChange={(e) => setForm({...form, backgroundColor: e.target.value})} />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg border shadow-sm" style={{ backgroundColor: form.accentColor }} />
              <div className="flex-grow space-y-1">
                <Label>Accent (Sage)</Label>
                <Input value={form.accentColor} onChange={(e) => setForm({...form, accentColor: e.target.value})} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Type className="w-5 h-5 text-primary" />
              <CardTitle>Typography</CardTitle>
            </div>
            <CardDescription>Luxury Google Font pairings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Headline Font (Serif)</Label>
              <Input 
                placeholder="e.g., Playfair Display" 
                value={form.headlineFont} 
                onChange={(e) => setForm({...form, headlineFont: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Body Font (Sans-Serif)</Label>
              <Input 
                placeholder="e.g., PT Sans" 
                value={form.bodyFont} 
                onChange={(e) => setForm({...form, bodyFont: e.target.value})}
              />
            </div>
            <div className="p-4 bg-muted/30 border border-dashed rounded-lg">
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-2">Preview</p>
              <h3 className="text-2xl mb-2" style={{ fontFamily: `"${form.headlineFont}", serif` }}>Timeless Elegance</h3>
              <p className="text-sm" style={{ fontFamily: `"${form.bodyFont}", sans-serif` }}>High-end craftsmanship meets sustainable beauty.</p>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card className="border-none shadow-sm bg-muted/10">
          <CardHeader>
             <div className="flex items-center space-x-2">
              <Layout className="w-5 h-5 text-primary" />
              <CardTitle>Navbar Preview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white border p-6 rounded-sm flex items-center h-20 shadow-inner">
               <div className={`flex w-full ${form.logoPlacement === 'center' ? 'justify-center' : 'justify-start'}`}>
                 {form.logoUrl ? (
                   <img src={form.logoUrl} alt="Logo" style={{ height: `${form.logoHeight}px` }} />
                 ) : (
                   <span className="font-headline text-xl tracking-[0.2em] text-primary font-bold uppercase">{form.siteName}</span>
                 )}
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
