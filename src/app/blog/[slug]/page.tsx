'use client';

import { use, useEffect, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEOManager from '@/components/seo/SEOManager';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, User, ArrowLeft, Share2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function BlogPostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const db = useFirestore();

  const blogQuery = useMemoFirebase(() => {
    return query(collection(db, 'blog_posts'), where('slug', '==', slug), limit(1));
  }, [db, slug]);

  const { data: posts, isLoading } = useCollection(blogQuery);
  const post = posts?.[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-pulse font-headline text-primary tracking-widest uppercase bg-white">
        SYNCHRONIZING BLOG...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-background">
        <h1 className="text-4xl md:text-6xl font-headline font-light text-primary">Story Not Found</h1>
        <Button variant="outline" className="rounded-none border-primary/20 px-10 h-14 uppercase tracking-widest text-[10px] font-bold" asChild>
          <Link href="/blog">Back to Collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOManager 
        title={post.seo?.title || post.title}
        description={post.seo?.description || post.excerpt}
        keywords={post.seo?.keywords}
        ogImage={post.imageUrl}
        type="article"
      />
      <Navbar />
      
      <main className="flex-grow pt-48 pb-40">
        <article className="container mx-auto px-6 max-w-5xl">
          {/* Top Navigation */}
          <div className="mb-20 text-center space-y-12">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground hover:text-accent transition-all duration-500 group"
            >
              <ArrowLeft className="w-3 h-3 mr-4 transition-transform group-hover:-translate-x-2" /> 
              The Blog Collection
            </Link>
            
            <div className="space-y-8">
              <div className="flex items-center justify-center space-x-4">
                <div className="h-[1px] w-12 bg-accent/30" />
                <span className="text-accent font-bold uppercase tracking-[0.6em] text-[10px]">
                  {post.category}
                </span>
                <div className="h-[1px] w-12 bg-accent/30" />
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-light leading-[1.05] text-primary tracking-tight max-w-4xl mx-auto">
                {post.title}
              </h1>
            </div>

            <div className="flex items-center justify-center space-x-12 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/50 border-y border-primary/5 py-8 max-w-2xl mx-auto">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-3 text-accent/60" />
                {post.publishedAt ? format(new Date(post.publishedAt), 'MMMM dd, yyyy') : 'Recently'}
              </div>
              <div className="flex items-center">
                <User className="w-3 h-3 mr-3 text-accent/60" />
                {post.author}
              </div>
            </div>
          </div>

          {/* Epic Hero Image */}
          <div className="relative aspect-[21/9] mb-32 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] bg-slate-50">
            <Image 
              src={post.imageUrl || 'https://picsum.photos/seed/verde-blog-hero/1920/1080'} 
              alt={post.title} 
              fill 
              className="object-cover transition-transform duration-[5s] hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          </div>

          {/* Article Master Content */}
          <div className="max-w-3xl mx-auto">
            <div className="font-body text-xl leading-[2.1] text-muted-foreground/90 space-y-12 tracking-wide text-justify">
              {post.content.split('\n').map((line: string, i: number) => {
                if (line.startsWith('# ')) {
                  return <h2 key={i} className="text-5xl font-headline font-bold text-primary mt-20 mb-10 leading-tight">{line.replace('# ', '')}</h2>;
                }
                if (line.startsWith('## ')) {
                  return <h3 key={i} className="text-3xl font-headline font-bold text-primary mt-16 mb-8">{line.replace('## ', '')}</h3>;
                }
                if (line.startsWith('* ') || line.startsWith('1. ')) {
                  return (
                    <div key={i} className="flex items-start space-x-4 ml-4 mb-4">
                      <div className="mt-3.5 w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                      <p className="text-lg">{line.replace(/^\* |^1\. /, '')}</p>
                    </div>
                  );
                }
                
                const trimmedLine = line.trim();
                if (trimmedLine) {
                  // Enhanced readability: Dropcap for the first paragraph
                  const isFirstPara = i === 0 || (i > 0 && post.content.split('\n')[i-1].trim() === '');
                  
                  return (
                    <p key={i} className={cn(
                      "mb-8",
                      isFirstPara && "first-letter:text-7xl first-letter:font-headline first-letter:float-left first-letter:mr-4 first-letter:text-accent first-letter:leading-[0.8] first-letter:mt-2"
                    )}>
                      {trimmedLine}
                    </p>
                  );
                }
                return <div key={i} className="h-4" />;
              })}
            </div>

            {/* Reflection Signature */}
            <div className="mt-32 pt-16 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-full bg-primary/5 border border-accent/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary">{post.author}</p>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mt-1">Verde Artisan Contributor</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" className="rounded-none border-primary/10 h-14 px-8 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-500">
                  <Share2 className="w-4 h-4 mr-3" /> Share Reflection
                </Button>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
