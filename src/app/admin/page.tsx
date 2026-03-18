'use client';

import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, limit, orderBy, doc } from 'firebase/firestore';
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
  ArrowUpRight,
  Loader2,
  Eye,
  Layout
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  // Queries
  const pagesQuery = useMemoFirebase(() => collection(db, 'cms_pages'), [db]);
  const blogQuery = useMemoFirebase(() => query(collection(db, 'blog_posts'), orderBy('updatedAt', 'desc'), limit(5)), [db]);
  const servicesQuery = useMemoFirebase(() => collection(db, 'services'), [db]);
  const testimonialsQuery = useMemoFirebase(() => collection(db, 'testimonials'), [db]);

  const { data: pages, isLoading: pagesLoading } = useCollection(pagesQuery);
  const { data: posts, isLoading: postsLoading } = useCollection(blogQuery);
  const { data: services } = useCollection(servicesQuery);
  const { data: testimonials } = useCollection(testimonialsQuery);

  async function handleSeedSanctuary() {
    setIsSeeding(true);
    try {
      // 1. Seed Global Settings
      setDocumentNonBlocking(doc(db, 'settings', 'global'), {
        siteName: 'VERDE SALON',
        colors: { primary: '#0F2F2F', background: '#F5F3EF', accent: '#C6A15B' },
        typography: { headline: 'Playfair Display', body: 'Inter' },
        logo: { placement: 'left', height: 40 }
      }, { merge: true });

      // 2. Seed Common Page Sections
      const heroId = 'initial-hero';
      const introId = 'initial-intro';
      const craftId = 'initial-craft';
      const blogListId = 'initial-blog-list';
      const servicesListId = 'initial-services-list';
      
      setDocumentNonBlocking(doc(db, 'cms_page_sections', heroId), {
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
      }, { merge: true });

      setDocumentNonBlocking(doc(db, 'cms_page_sections', introId), {
        id: introId,
        type: 'BrandIntro',
        content: JSON.stringify({ 
          title: 'The Verde Philosophy', 
          subtitle: 'Pure. Elegant. Conscious.',
          content: 'At Verde Salon, we blend modern beauty techniques with natural care. Our mission is to enhance your beauty while maintaining the health of your hair and skin.',
          imageUrl: 'https://picsum.photos/seed/verde-about/800/1000'
        })
      }, { merge: true });

      setDocumentNonBlocking(doc(db, 'cms_page_sections', craftId), {
        id: craftId,
        type: 'ServicesPreview',
        content: JSON.stringify({ 
          title: 'Signature Rituals', 
          subtitle: 'Our Craft'
        })
      }, { merge: true });

      setDocumentNonBlocking(doc(db, 'cms_page_sections', blogListId), {
        id: blogListId,
        type: 'BlogListing',
        content: JSON.stringify({ 
          title: 'Rituals & Reflections', 
          subtitle: 'The Journal',
          description: 'Curated insights on beauty and intentional living.'
        })
      }, { merge: true });

      setDocumentNonBlocking(doc(db, 'cms_page_sections', servicesListId), {
        id: servicesListId,
        type: 'ServicesListing',
        content: JSON.stringify({ 
          title: 'Signature Rituals', 
          subtitle: 'The Menu',
          description: 'Timeless techniques meets contemporary science.'
        })
      }, { merge: true });

      // 3. Seed All Pages
      setDocumentNonBlocking(doc(db, 'cms_pages', 'home'), {
        id: 'home',
        title: 'Home',
        slug: '/',
        sectionIds: [heroId, introId, craftId],
        isPublished: true
      }, { merge: true });

      setDocumentNonBlocking(doc(db, 'cms_pages', 'services'), {
        id: 'services',
        title: 'Services',
        slug: '/services',
        sectionIds: [servicesListId],
        isPublished: true
      }, { merge: true });

      setDocumentNonBlocking(doc(db, 'cms_pages', 'blog'), {
        id: 'blog',
        title: 'Blog',
        slug: '/blog',
        sectionIds: [blogListId],
        isPublished: true
      }, { merge: true });

      // 4. Seed High-Quality Blog Posts
      const blogsToSeed = [
        {
          id: 'blog-balayage',
          title: 'The Art of the Balayage: Beyond Color',
          slug: 'art-of-balayage',
          category: 'Hair',
          excerpt: 'Explore why this hand-painted technique remains the ultimate luxury in hair transformation.',
          content: `# Understanding Balayage\n\nUnlike traditional highlights, balayage is an artistic approach to hair coloring. It involves hand-painting color onto the hair to create a soft, natural-looking effect.\n\n## Why We Love It\n\n1. Low Maintenance: The grow-out is seamless.\n2. Bespoke: Every application is tailored to your movement.\n3. Dimension: Adds depth and shine that foils can't replicate.`,
          author: 'Elena Verde',
          isPublished: true,
          publishedAt: new Date().toISOString(),
          imageUrl: 'https://picsum.photos/seed/balayage/1200/800',
          seo: { title: 'Art of Balayage | Verde Salon', description: 'Expert insights into the balayage coloring technique.' }
        },
        {
          id: 'blog-skincare',
          title: 'Botanical Rituals for Radiant Skin',
          slug: 'botanical-skincare-guide',
          category: 'Skincare',
          excerpt: 'Unlock the secrets of nature-inspired skincare for a healthier, more vibrant complexion.',
          content: `# Nature's Secret\n\nYour skin is your largest organ, and it deserves the purest care. Botanical extracts provide powerful antioxidants without the harsh chemicals of synthetic products.\n\n## The Verde Routine\n\n* **Cleanse**: Use oil-based botanical cleansers.\n* **Tone**: Rosewater or witch hazel for balance.\n* **Nourish**: Jojoba or squalane for deep hydration.`,
          author: 'Elena Verde',
          isPublished: true,
          publishedAt: new Date().toISOString(),
          imageUrl: 'https://picsum.photos/seed/skincare/1200/800',
          seo: { title: 'Botanical Skincare Guide | Verde Salon', description: 'Natural skincare routines for glowing skin.' }
        }
      ];

      for (const blog of blogsToSeed) {
        setDocumentNonBlocking(doc(db, 'blog_posts', blog.id), blog, { merge: true });
      }

      toast({ title: "Sanctuary Initialized", description: "Your luxury digital space and dynamic pages are ready." });
    } catch (e) {
      toast({ variant: "destructive", title: "Setup Failed", description: "Could not seed initial data." });
    } finally {
      setIsSeeding(false);
    }
  }

  function handleDeleteBlog(id: string) {
    if (confirm('Delete this blog entry?')) {
      deleteDocumentNonBlocking(doc(db, 'blog_posts', id));
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
          <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 rounded-none px-8 font-bold uppercase tracking-widest text-[10px] shadow-lg transition-all hover:-translate-y-1" asChild>
            <Link href="/?edit=true">
              <Sparkles className="w-4 h-4 mr-2" /> Edit Entire Website
            </Link>
          </Button>
          <Button variant="outline" className="rounded-none border-primary/20 text-[10px] uppercase tracking-widest font-bold" asChild>
            <Link href="/" target="_blank"><Eye className="w-4 h-4 mr-2" /> View Site</Link>
          </Button>
        </div>
      </div>

      {/* Action Banner for Beginners */}
      {(!pages || pages.length === 0) && (
        <Card className="border-none bg-accent text-primary shadow-2xl rounded-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Sparkles className="w-32 h-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between relative z-10">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-headline font-bold">First Step: Initialize Your Sanctuary</CardTitle>
              <CardDescription className="text-primary/70 text-base max-w-xl">Your database is empty. Click to generate a luxury starter layout, all pages, rituals, and blogs.</CardDescription>
            </div>
            <Button 
              onClick={handleSeedSanctuary} 
              disabled={isSeeding}
              className="bg-primary text-white hover:bg-primary/90 rounded-none uppercase tracking-[0.2em] text-[11px] font-bold h-16 px-12 shadow-2xl"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Sparkles className="w-4 h-4 mr-3" />}
              {isSeeding ? "Building..." : "Seed Sanctuary Now"}
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-headline font-bold">Website Pages</CardTitle>
                <CardDescription>Manage your visual identity and live content sections.</CardDescription>
              </div>
            </div>
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
                    const editUrl = `${slug.startsWith('/') ? slug : '/' + slug}?edit=true`;
                    const previewUrl = slug.startsWith('/') ? slug : '/' + slug;
                    
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
                            <Link href={previewUrl} target="_blank">
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

        {/* Blog Management */}
        <Card className="border-none shadow-sm rounded-none overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-headline font-bold">Blogs</CardTitle>
              <CardDescription>Manage your editorial content and SEO insights.</CardDescription>
            </div>
            <Button className="bg-primary hover:bg-primary/90 rounded-none text-[10px] font-bold uppercase tracking-widest px-6" asChild>
              <Link href="/admin/blog/new"><Plus className="w-4 h-4 mr-2" /> New Blog</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {postsLoading ? (
              <div className="py-20 text-center animate-pulse text-muted-foreground uppercase tracking-widest text-xs">Syncing Stories...</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow>
                    <TableHead className="px-8 h-12 uppercase tracking-widest text-[9px] font-bold">Article</TableHead>
                    <TableHead className="h-12 uppercase tracking-widest text-[9px] font-bold">Category</TableHead>
                    <TableHead className="h-12 uppercase tracking-widest text-[9px] font-bold">Status</TableHead>
                    <TableHead className="text-right px-8 h-12 uppercase tracking-widest text-[9px] font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts?.map((post: any) => (
                    <TableRow key={post.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="px-8 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-muted relative overflow-hidden flex-shrink-0 shadow-inner">
                            {post.imageUrl && <Image src={post.imageUrl} alt="" fill className="object-cover grayscale" />}
                          </div>
                          <span className="font-medium font-headline text-base">{post.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-none text-[9px] uppercase font-bold tracking-widest border-slate-200">{post.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {post.isPublished ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none rounded-none text-[9px] uppercase font-bold px-3 py-1">Published</Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-none text-[9px] uppercase font-bold px-3 py-1 text-slate-400">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right px-8 space-x-2">
                        <Button variant="ghost" size="icon" asChild className="hover:bg-primary/5 text-primary">
                          <Link href={`/admin/blog/${post.id}`}><Pencil className="w-4 h-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBlog(post.id)} className="hover:bg-destructive/5 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {posts?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-20 text-center text-muted-foreground italic font-light">No blog entries in your sanctuary yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
