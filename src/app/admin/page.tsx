
'use client';

import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, limit, orderBy, doc, getDoc } from 'firebase/firestore';
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
  Eye
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

  // Logic to show seeding banner only if core architecture is missing
  const isMissingCorePages = useMemo(() => {
    if (pagesLoading) return false;
    if (!pages || pages.length === 0) return true;
    const required = ['home', 'services', 'blog'];
    return !required.every(id => pages.find(p => p.id === id));
  }, [pages, pagesLoading]);

  async function handleSeedSanctuary() {
    setIsSeeding(true);
    try {
      // 1. Safe Global Settings (Only if missing)
      const settingsRef = doc(db, 'settings', 'global');
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        setDocumentNonBlocking(settingsRef, {
          siteName: 'VERDE SALON',
          colors: { primary: '#0F2F2F', background: '#F5F3EF', accent: '#C6A15B' },
          typography: { headline: 'Playfair Display', body: 'Inter' },
          logo: { placement: 'left', height: 40 }
        }, { merge: true });
      }

      // 2. Define Essential Sections
      const heroId = 'initial-hero';
      const introId = 'initial-intro';
      const craftId = 'initial-craft';
      const blogListId = 'initial-blog-list';
      const servicesListId = 'initial-services-list';
      const galleryId = 'initial-gallery';
      
      const sections = [
        {
          id: heroId,
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
          id: introId,
          type: 'BrandIntro',
          content: JSON.stringify({ 
            title: 'The Verde Philosophy', 
            subtitle: 'Pure. Elegant. Conscious.',
            content: 'At Verde Salon, we blend modern beauty techniques with natural care. Our mission is to enhance your beauty while maintaining the health of your hair and skin.',
            imageUrl: 'https://picsum.photos/seed/verde-about/800/1000'
          })
        },
        {
          id: craftId,
          type: 'ServicesPreview',
          content: JSON.stringify({ title: 'Signature Rituals', subtitle: 'Our Craft' })
        },
        {
          id: galleryId,
          type: 'FeaturedWork',
          content: JSON.stringify({ title: 'Our Work', subtitle: 'The Verde Aesthetic', images: [] })
        },
        {
          id: blogListId,
          type: 'BlogListing',
          content: JSON.stringify({ 
            title: 'Rituals & Reflections', 
            subtitle: 'The Journal',
            description: 'Curated insights on beauty and intentional living.'
          })
        },
        {
          id: servicesListId,
          type: 'ServicesListing',
          content: JSON.stringify({ 
            title: 'Signature Rituals', 
            subtitle: 'The Menu',
            description: 'Timeless techniques meets contemporary science.'
          })
        }
      ];

      // Safe write sections (Only if ID doesn't exist)
      for (const section of sections) {
        const secRef = doc(db, 'cms_page_sections', section.id);
        const secSnap = await getDoc(secRef);
        if (!secSnap.exists()) {
          setDocumentNonBlocking(secRef, section, { merge: true });
        }
      }

      // 3. Safe Page Construction
      const pageDefinitions = [
        { id: 'home', title: 'Home', slug: '/', sections: [heroId, introId, craftId, galleryId] },
        { id: 'services', title: 'Services', slug: '/services', sections: [servicesListId] },
        { id: 'blog', title: 'Blog', slug: '/blog', sections: [blogListId] }
      ];

      for (const p of pageDefinitions) {
        const pRef = doc(db, 'cms_pages', p.id);
        const pSnap = await getDoc(pRef);
        
        if (!pSnap.exists()) {
          // Create new page if missing
          setDocumentNonBlocking(pRef, {
            id: p.id,
            title: p.title,
            slug: p.slug,
            sectionIds: p.sections,
            isPublished: true,
            createdAt: new Date().toISOString()
          }, { merge: true });
        } else {
          // Ensure essential sections are present without overwriting custom ones
          const currentData = pSnap.data();
          const currentIds = currentData.sectionIds || [];
          const missingIds = p.sections.filter(id => !currentIds.includes(id));
          
          if (missingIds.length > 0) {
            setDocumentNonBlocking(pRef, {
              ...currentData,
              sectionIds: [...currentIds, ...missingIds]
            }, { merge: true });
          }
        }
      }

      toast({ title: "Sanctuary Safeguarded", description: "Missing architecture filled without overwriting your changes." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Setup Failed", description: "Could not safely verify architecture." });
    } finally {
      setIsSeeding(false);
    }
  }

  const stats = [
    { name: 'Active Rituals', value: services?.length || 0, icon: Scissors, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Blogs', value: posts?.length || 0, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
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

      {/* Action Banner for Missing Architecture */}
      {isMissingCorePages && (
        <Card className="border-none bg-accent text-primary shadow-2xl rounded-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Sparkles className="w-32 h-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between relative z-10">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-headline font-bold">Initialize Your Sanctuary</CardTitle>
              <CardDescription className="text-primary/70 text-base max-w-xl">Complete your architecture. This creates missing Services, Blog, and Home page structures in your CMS.</CardDescription>
            </div>
            <Button 
              onClick={handleSeedSanctuary} 
              disabled={isSeeding}
              className="bg-primary text-white hover:bg-primary/90 rounded-none uppercase tracking-[0.2em] text-[11px] font-bold h-16 px-12 shadow-2xl"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Sparkles className="w-4 h-4 mr-3" />}
              {isSeeding ? "Syncing..." : "Complete Architecture Now"}
            </Button>
          </CardHeader>
        </Card>
      )}

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
            <CardTitle className="text-2xl font-headline font-bold">Website Pages</CardTitle>
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
    </div>
  );
}
