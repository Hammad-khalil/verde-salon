'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, limit, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Scissors, 
  FileText,
  Plus,
  ArrowUpRight,
  Sparkles,
  Zap,
  Loader2,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const servicesQuery = useMemoFirebase(() => collection(db, 'services'), [db]);
  const blogQuery = useMemoFirebase(() => query(collection(db, 'blog_posts'), orderBy('updatedAt', 'desc'), limit(3)), [db]);
  const testimonialsQuery = useMemoFirebase(() => collection(db, 'testimonials'), [db]);

  const { data: services } = useCollection(servicesQuery);
  const { data: posts } = useCollection(blogQuery);
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
      const servicesId = 'initial-services';
      const galleryId = 'initial-gallery';
      const ctaId = 'initial-cta';

      setDocumentNonBlocking(doc(db, 'cms_page_sections', heroId), {
        id: heroId,
        type: 'Hero',
        content: JSON.stringify({ 
          title: 'Elevate Your Natural Beauty', 
          subtitle: 'Premium hair, skin, and wellness treatments tailored for you.', 
          ctaText: 'Book Appointment', 
          imageUrl: 'https://picsum.photos/seed/verde-hero-main/1920/1080' 
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

      setDocumentNonBlocking(doc(db, 'cms_page_sections', servicesId), {
        id: servicesId,
        type: 'ServicesPreview',
        content: JSON.stringify({ title: 'Signature Rituals', subtitle: 'Our Craft' })
      }, { merge: true });

      setDocumentNonBlocking(doc(db, 'cms_page_sections', galleryId), {
        id: galleryId,
        type: 'FeaturedWork',
        content: JSON.stringify({ title: 'Our Work', subtitle: 'The Verde Aesthetic' })
      }, { merge: true });

      setDocumentNonBlocking(doc(db, 'cms_page_sections', ctaId), {
        id: ctaId,
        type: 'CTA',
        content: JSON.stringify({ 
          title: 'Ready for a transformation?', 
          subtitle: 'Book your experience today at Verde Salon.', 
          buttonText: 'Book Your Visit' 
        })
      }, { merge: true });

      // 3. Seed Home Page Layout
      setDocumentNonBlocking(doc(db, 'cms_pages', 'home'), {
        id: 'home',
        title: 'Home',
        sectionIds: [heroId, introId, servicesId, galleryId, ctaId],
        isPublished: true
      }, { merge: true });

      // 4. Seed Services
      const starterServices = [
        { id: 's1', title: 'Signature Haircut', category: 'Hair', price: '$85', duration: '60 min', description: 'A bespoke cutting experience.', isPublished: true },
        { id: 's2', title: 'Botanical Facial', category: 'Skin', price: '$120', duration: '75 min', description: 'Rejuvenating skin therapy.', isPublished: true },
        { id: 's3', title: 'Artisan Manicure', category: 'Nails', price: '$45', duration: '45 min', description: 'Minimalist nail refinement.', isPublished: true }
      ];

      starterServices.forEach(s => {
        setDocumentNonBlocking(doc(db, 'services', s.id), { ...s, updatedAt: new Date().toISOString() }, { merge: true });
      });

      // 5. Seed FAQs
      const faqs = [
        { id: 'f1', question: "What are your working hours?", answer: "We are open Tuesday through Friday from 10am to 8pm." },
        { id: 'f2', question: "Do I need an appointment?", answer: "We highly recommend booking in advance." }
      ];
      faqs.forEach(f => {
        setDocumentNonBlocking(doc(db, 'faqs', f.id), f, { merge: true });
      });

      toast({
        title: "Sanctuary Initialized",
        description: "Your luxury digital space is ready for you.",
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Setup Failed", description: "Could not seed initial data." });
    } finally {
      setIsSeeding(false);
    }
  }

  const stats = [
    { name: 'Active Rituals', value: services?.length || 0, icon: Scissors, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Journal Entries', value: posts?.length || 0, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { name: 'Client Voices', value: testimonials?.length || 0, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-foreground">Welcome back, Sanctuary Editor</h1>
          <p className="text-muted-foreground mt-2 font-light">Managing the Verde Salon aesthetic across all platforms.</p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" className="rounded-none border-primary/20" asChild>
            <Link href="/admin/pages">Design Pages</Link>
          </Button>
          <Button className="bg-primary hover:bg-primary/90 rounded-none" asChild>
            <Link href="/admin/blog/new"><Plus className="w-4 h-4 mr-2" /> New Journal</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-none shadow-sm overflow-hidden group rounded-none">
            <CardContent className="pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{stat.name}</p>
                  <p className="text-4xl font-headline font-bold mt-2 text-foreground">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-full ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
            <div className={`h-1 w-full ${stat.bg.replace('/10', '')}`} />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Recent Blog Posts */}
        <Card className="border-none shadow-sm rounded-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-headline">Recent Journals</CardTitle>
              <CardDescription>Stories currently shared with your clients.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary uppercase tracking-widest text-[10px] font-bold" asChild>
              <Link href="/admin/blog">View All <ArrowUpRight className="ml-2 w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {posts?.map((post: any) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted overflow-hidden flex-shrink-0 relative">
                      {post.imageUrl && (
                        <Image src={post.imageUrl} className="object-cover grayscale" alt="" fill sizes="48px" />
                      )}
                    </div>
                    <div>
                      <p className="font-headline text-base leading-tight">{post.title}</p>
                      <Badge variant="outline" className="mt-1 text-[9px] uppercase tracking-widest font-light h-5 rounded-none">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/blog/${post.id}`}><Sparkles className="w-4 h-4 text-primary/40" /></Link>
                  </Button>
                </div>
              ))}
              {(!posts || posts.length === 0) && (
                <div className="py-10 text-center text-muted-foreground italic font-light">No journal entries yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Master Control Card */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-accent/5 border-l-4 border-l-accent rounded-none">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-headline">
                <Zap className="w-5 h-5 mr-2 text-accent" /> One-Click Setup
              </CardTitle>
              <CardDescription>If your database is empty, click this to generate a premium starter layout instantly.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSeedSanctuary} 
                disabled={isSeeding}
                className="w-full bg-accent text-primary hover:bg-accent/90 rounded-none uppercase tracking-[0.2em] text-[10px] font-bold py-8"
              >
                {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {isSeeding ? "Initializing..." : "Initialize Sanctuary Content"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary text-white border-none shadow-xl overflow-hidden relative rounded-none">
            <CardHeader>
              <CardTitle className="text-xl font-headline">Knowledge Base</CardTitle>
              <CardDescription className="text-white/60">Manage your salon's expert FAQs.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-light leading-relaxed mb-6 opacity-90">
                Help your clients understand your rituals before they even step foot in the sanctuary.
              </p>
              <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 rounded-none uppercase tracking-[0.2em] text-[10px] font-bold w-full py-6" asChild>
                <Link href="/admin/faq">Manage FAQs</Link>
              </Button>
            </CardContent>
            <HelpCircle className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
          </Card>
        </div>
      </div>
    </div>
  );
}