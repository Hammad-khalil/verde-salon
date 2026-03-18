'use client';

import { use, useEffect, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEOManager from '@/components/seo/SEOManager';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
      <div className="min-h-screen flex items-center justify-center animate-pulse font-headline text-primary tracking-widest uppercase">
        VERDE JOURNAL
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-background">
        <h1 className="text-4xl md:text-6xl font-headline font-light text-primary">Article Not Found</h1>
        <Button variant="outline" className="rounded-none border-primary/20 px-10" asChild>
          <Link href="/blog">Return to Blogs</Link>
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
      
      <main className="flex-grow pt-40 pb-32">
        <article className="container mx-auto px-6 max-w-4xl">
          {/* Header Section */}
          <div className="mb-16 space-y-12 text-center">
            <Link href="/blog" className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-accent transition-colors">
              <ArrowLeft className="w-3 h-3 mr-3" /> Back to Blogs
            </Link>
            
            <div className="space-y-6">
              <span className="text-accent font-bold uppercase tracking-[0.5em] text-[10px] block">
                {post.category}
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-light leading-[1.1] text-primary tracking-tight">
                {post.title}
              </h1>
              <div className="h-[1px] w-20 bg-accent/30 mx-auto" />
            </div>

            <div className="flex items-center justify-center space-x-12 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-3 text-accent" />
                {post.publishedAt ? format(new Date(post.publishedAt), 'MMMM dd, yyyy') : 'Recently'}
              </div>
              <div className="flex items-center">
                <User className="w-3 h-3 mr-3 text-accent" />
                By {post.author}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-[21/10] mb-20 overflow-hidden shadow-2xl">
            <Image 
              src={post.imageUrl || 'https://picsum.photos/seed/verde-blog-hero/1200/600'} 
              alt={post.title} 
              fill 
              className="object-cover transition-transform duration-[3s] hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          </div>

          {/* Article Content */}
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg prose-primary max-w-none font-body leading-[1.8] text-muted-foreground space-y-10 tracking-wide">
              {post.content.split('\n').map((line: string, i: number) => {
                if (line.startsWith('# ')) {
                  return <h1 key={i} className="text-4xl font-headline font-bold text-primary mt-12 mb-6">{line.replace('# ', '')}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-2xl font-headline font-bold text-primary mt-10 mb-4">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('* ') || line.startsWith('1. ')) {
                  return <li key={i} className="ml-6 mb-2 list-disc">{line.replace(/^\* |^1\. /, '')}</li>;
                }
                if (line.trim()) {
                  return (
                    <p key={i} className="first-letter:text-5xl first-letter:font-headline first-letter:float-left first-letter:mr-3 first-letter:text-accent first-letter:leading-none">
                      {line}
                    </p>
                  );
                }
                return <div key={i} className="h-4" />;
              })}
            </div>

            {/* Footer / Share */}
            <div className="mt-24 pt-12 border-t border-primary/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{post.author}</p>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Artisan Contributor</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
