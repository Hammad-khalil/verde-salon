
'use client';

import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, limit, orderBy, doc, getDoc, writeBatch } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Plus, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Sparkles, 
  Scissors, 
  MessageSquare,
  Loader2,
  Eye,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  // Queries
  const pagesQuery = useMemoFirebase(() => collection(db, 'cms_pages'), [db]);
  const blogQuery = useMemoFirebase(() => query(collection(db, 'blog_posts'), orderBy('publishedAt', 'desc'), limit(5)), [db]);
  const servicesQuery = useMemoFirebase(() => collection(db, 'services'), [db]);
  const testimonialsQuery = useMemoFirebase(() => collection(db, 'testimonials'), [db]);

  const { data: pages, isLoading: pagesLoading } = useCollection(pagesQuery);
  const { data: posts } = useCollection(blogQuery);
  const { data: services } = useCollection(servicesQuery);
  const { data: testimonials } = useCollection(testimonialsQuery);

  const isMissingCorePages = useMemo(() => {
    if (pagesLoading) return false;
    if (!pages || pages.length === 0) return true;
    const required = ['home', 'services', 'blog'];
    return !required.every(id => pages.find(page => page.id === id));
  }, [pages, pagesLoading]);

  async function handleSeedSanctuary() {
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);

      // 1. Safe Global Settings
      const settingsRef = doc(db, 'settings', 'global');
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        batch.set(settingsRef, {
          siteName: 'VERDE SALON',
          colors: { primary: '#0F2F2F', background: '#F5F3EF', accent: '#C6A15B' },
          typography: { headline: 'Playfair Display', body: 'Inter' },
          logo: { placement: 'left', height: 40 },
          published: {
            siteName: 'VERDE SALON',
            colors: { primary: '#0F2F2F', background: '#F5F3EF', accent: '#C6A15B' },
            typography: { headline: 'Playfair Display', body: 'Inter' },
            logo: { placement: 'left', height: 40 }
          }
        });
      }

      // 2. Define Essential Sections (New Structural Standard)
      const sectionDefinitions = [
        {
          id: 'initial-hero',
          type: 'Hero',
          content: JSON.stringify({ 
            title: 'Elevate Your Natural Beauty', 
            subtitle: 'Premium hair, skin, and wellness treatments tailored for you.', 
            ctaText: 'Book Appointment', 
            imageUrl: 'https://picsum.photos/seed/verde-hero-main/1920/1080',
            backgroundType: 'image',
            styles: { paddingVertical: '0', titleColor: '#ffffff', subtitleColor: '#C6A15B' }
          })
        },
        {
          id: 'initial-services-list',
          type: 'ServicesListing',
          content: JSON.stringify({ 
            title: 'Signature Services', 
            subtitle: 'The Menu',
            description: 'Timeless techniques meets contemporary science.'
          })
        },
        {
          id: 'initial-blog-list',
          type: 'BlogListing',
          content: JSON.stringify({ 
            title: 'Reflections & Insights', 
            subtitle: 'Blogs',
            description: 'Curated thoughts on beauty and intentional living.'
          })
        }
      ];

      for (const section of sectionDefinitions) {
        const draftRef = doc(db, 'cms_page_sections', section.id);
        const liveRef = doc(db, 'cms_sections_live', section.id);
        
        const snap = await getDoc(draftRef);
        if (!snap.exists()) {
          const payload = {
            ...section,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          batch.set(draftRef, payload);
          batch.set(liveRef, payload); // Auto-publish on seed
        }
      }

      // 3. Page Construction
      const pageDefinitions = [
        { id: 'home', title: 'Home', slug: '/', sections: ['initial-hero'] },
        { id: 'services', title: 'Services', slug: '/services', sections: ['initial-services-list'] },
        { id: 'blog', title: 'Blogs', slug: '/blog', sections: ['initial-blog-list'] }
      ];

      for (const p of pageDefinitions) {
        const pRef = doc(db, 'cms_pages', p.id);
        const pSnap = await getDoc(pRef);
        
        if (!pSnap.exists()) {
          batch.set(pRef, {
            id: p.id,
            title: p.title,
            slug: p.slug,
            sectionIds: p.sections,
            publishedSectionIds: p.sections,
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString()
          });
        }
      }

      await batch.commit();
      toast({ title: "Sanctuary Synced", description: "Architecture initialized with decoupled state management." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Setup Failed", description: "Could not finalize architecture. Please try again." });
    } finally {
      setIsSeeding(false);
    }
  }

  const stats = [
    { name: 'Active Services', value: services?.length || 0, icon: Scissors, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Blog Entries', value: posts?.length || 0, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { name: 'Client Voices', value: testimonials?.length || 0, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-12 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-foreground tracking-tight">Sanctuary Command</h1>
          <p className="text-muted-foreground mt-2 font-light">Centralized management for Verde Salon.</p>
        </div>
        <div className="flex space-x-4">
          <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 rounded-none px-8 font-bold uppercase tracking-widest text-[10px] shadow-lg" asChild>
            <Link href="/?edit=true">
              <Sparkles className="w-4 h-4 mr-2" /> Edit Entire Website
            </Link>
          </Button>
          <Button variant="outline" className="rounded-none border-primary/20 text-[10px] uppercase tracking-widest font-bold" asChild>
            <Link href="/" target="_blank"><Eye className="w-4 h-4 mr-2" /> View Site</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-none shadow-sm rounded-none hover:shadow-md transition-shadow">
            <CardContent className="pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{stat.name}</p>
                  <p className="text-4xl font-headline font-bold mt-2 text-foreground">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Pages Management */}
        <Card className="border-none shadow-sm rounded-none overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-2xl font-headline font-bold">Website Architecture</CardTitle>
            <CardDescription>Manage your visual identity and live content sections.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {pagesLoading ? (
              <div className="py-20 text-center animate-pulse text-muted-foreground uppercase tracking-widest text-xs">Assembling Architecture...</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow>
                    <TableHead className="px-8 h-12 uppercase tracking-widest text-[9px] font-bold">Page Title</TableHead>
                    <TableHead className="h-12 uppercase tracking-widest text-[9px] font-bold">Path</TableHead>
                    <TableHead className="h-12 uppercase tracking-widest text-[9px] font-bold">Status</TableHead>
                    <TableHead className="text-right px-8 h-12 uppercase tracking-widest text-[9px] font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages?.map((page: any) => {
                    const slug = page.slug || '/';
                    const editUrl = `${slug === '/' ? '' : slug}?edit=true`;
                    
                    return (
                      <TableRow key={page.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-bold font-headline text-lg px-8 py-6">{page.title}</TableCell>
                        <TableCell className="font-mono text-xs opacity-60">{slug}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none rounded-none text-[9px] uppercase font-bold tracking-widest px-3 py-1">Live</Badge>
                        </TableCell>
                        <TableCell className="text-right px-8 space-x-2">
                          <Button variant="ghost" size="icon" asChild title="Live Visual Editor" className="hover:bg-primary/5 text-primary">
                            <Link href={editUrl}>
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild title="Preview Page" className="hover:bg-slate-100">
                            <Link href={slug} target="_blank">
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FOOTER UTILITIES */}
      <div className="space-y-8 pt-12 border-t">
        <div className="flex flex-col space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/40">System Utilities</h3>
          <p className="text-[10px] text-muted-foreground italic">Use these tools for architecture maintenance and data recovery.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Action Banner for Missing Architecture */}
          {isMissingCorePages && (
            <Card className="border-none bg-accent text-primary shadow-lg rounded-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Sparkles className="w-16 h-16" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between relative z-10 p-6">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-headline font-bold">Initialize Your Sanctuary</CardTitle>
                  <CardDescription className="text-primary/70 text-xs max-w-xs">Complete missing Services, Blogs, and Home page structures.</CardDescription>
                </div>
                <Button 
                  onClick={handleSeedSanctuary} 
                  disabled={isSeeding}
                  className="bg-primary text-white hover:bg-primary/90 rounded-none uppercase tracking-[0.2em] text-[9px] font-bold h-12 px-6"
                >
                  {isSeeding ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                  {isSeeding ? "Syncing..." : "Run Seed Now"}
                </Button>
              </CardHeader>
            </Card>
          )}

          {/* Recovery Banner */}
          <Card className="border-2 border-dashed border-primary/20 bg-white/50 rounded-none">
            <CardContent className="py-6 px-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/5 rounded-full"><ShieldCheck className="w-5 h-5 text-primary" /></div>
                <div>
                  <h4 className="font-headline font-bold text-base">Data Recovery Center</h4>
                  <p className="text-[10px] text-muted-foreground">Restore deleted sections from your library.</p>
                </div>
              </div>
              <Button variant="outline" className="rounded-none font-bold uppercase tracking-widest text-[9px] h-10" asChild>
                <Link href="/admin/pages">Open Library</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
