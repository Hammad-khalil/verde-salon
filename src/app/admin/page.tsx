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

      // 2. Seed Page Sections
      const heroId = 'initial-hero';
      const introId = 'initial-intro';
      
      setDocumentNonBlocking(doc(db, 'cms_page_sections', heroId), {
        id: heroId,
        type: 'Hero',
        content: JSON.stringify({ 
          title: 'Elevate Your Natural Beauty', 
          subtitle: 'Premium hair, skin, and wellness treatments tailored for you.', 
          ctaText: 'Book Appointment', 
          imageUrl: 'https://picsum.photos/seed/verde-hero-main/1920/1080',
          backgroundType: 'image'
        })
      }, { merge: true });

      setDocumentNonBlocking(doc(db, 'cms_page_sections', introId), {
        id: introId,
        type: 'BrandIntro',
        content: JSON.stringify({ 
          title: 'The Verde Philosophy', 
          subtitle: 'Pure. Elegant. Conscious.',
          content: 'At Verde Salon, we blend modern beauty techniques with natural care.',
          imageUrl: 'https://picsum.photos/seed/verde-about/800/1000'
        })
      }, { merge: true });

      // 3. Seed Home Page Layout
      setDocumentNonBlocking(doc(db, 'cms_pages', 'home'), {
        id: 'home',
        title: 'Home',
        slug: '/',
        sectionIds: [heroId, introId],
        isPublished: true
      }, { merge: true });

      // 4. Seed Services Page
      setDocumentNonBlocking(doc(db, 'cms_pages', 'services'), {
        id: 'services',
        title: 'Services',
        slug: '/services',
        sectionIds: [],
        isPublished: true
      }, { merge: true });

      toast({ title: "Sanctuary Initialized", description: "Your luxury digital space is ready." });
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
          <h1 className="text-4xl font-headline font-bold text-foreground">Sanctuary Command</h1>
          <p className="text-muted-foreground mt-2 font-light">Centralized management for Verde Salon.</p>
        </div>
        <div className="flex space-x-4">
          <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 rounded-none px-8 font-bold uppercase tracking-widest text-xs" asChild>
            <Link href="/?edit=true">
              <Layout className="w-4 h-4 mr-2" /> Edit Entire Website
            </Link>
          </Button>
          <Button variant="outline" className="rounded-none border-primary/20" asChild>
            <Link href="/" target="_blank"><Eye className="w-4 h-4 mr-2" /> Live Site</Link>
          </Button>
        </div>
      </div>

      {/* Action Banner for Beginners */}
      {(!pages || pages.length === 0) && (
        <Card className="border-none bg-accent text-primary shadow-xl rounded-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-headline">First Step: Initialize Your Sanctuary</CardTitle>
              <CardDescription className="text-primary/70">Your database is currently empty. Click to generate a luxury starter layout.</CardDescription>
            </div>
            <Button 
              onClick={handleSeedSanctuary} 
              disabled={isSeeding}
              className="bg-primary text-white hover:bg-primary/90 rounded-none uppercase tracking-[0.2em] text-[10px] font-bold h-16 px-10"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isSeeding ? "Initializing..." : "Seed Sanctuary Now"}
            </Button>
          </CardHeader>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-none shadow-sm rounded-none">
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
        <Card className="border-none shadow-sm rounded-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-headline">Website Pages</CardTitle>
              <CardDescription>Manage your visual identity and live content sections.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {pagesLoading ? (
              <div className="py-10 text-center animate-pulse">Loading pages...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page Title</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages?.map((page: any) => {
                    const pageSlug = page.slug || '/';
                    const pageUrl = pageSlug.startsWith('/') ? pageSlug : '/' + pageSlug;
                    return (
                      <TableRow key={page.id} className="group">
                        <TableCell className="font-bold font-headline text-lg">{page.title}</TableCell>
                        <TableCell className="font-mono text-xs opacity-60">{pageSlug}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-none text-[10px] uppercase font-bold">Live</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" asChild title="Live Visual Editor">
                            <Link href={`${pageUrl}?edit=true`}>
                              <Pencil className="w-4 h-4 text-primary" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild title="Preview Page">
                            <Link href={pageUrl} target="_blank">
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
        <Card className="border-none shadow-sm rounded-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-headline">Blogs</CardTitle>
              <CardDescription>Manage your editorial content and SEO insights.</CardDescription>
            </div>
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link href="/admin/blog/new"><Plus className="w-4 h-4 mr-2" /> New Blog</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="py-10 text-center animate-pulse">Loading blogs...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts?.map((post: any) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted relative overflow-hidden flex-shrink-0">
                            {post.imageUrl && <Image src={post.imageUrl} alt="" fill className="object-cover grayscale" />}
                          </div>
                          <span className="font-medium">{post.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-none text-[10px] uppercase font-bold">{post.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {post.isPublished ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-none text-[10px] uppercase font-bold">Published</Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-none text-[10px] uppercase font-bold">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/blog/${post.id}`}><Pencil className="w-4 h-4 text-primary" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBlog(post.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {posts?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground italic">No blogs yet.</TableCell>
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
