'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogCard from '@/components/blog/BlogCard';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import SEOManager from '@/components/seo/SEOManager';

export default function BlogPage() {
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState('All');

  const blogQuery = useMemoFirebase(() => {
    return query(collection(db, 'blog_posts'), where('isPublished', '==', true));
  }, [db]);

  const { data: posts, isLoading } = useCollection(blogQuery);

  const categories = ['All', 'Hair', 'Skincare', 'Trends', 'Wellness', 'Sustainability'];

  const processedPosts = useMemo(() => {
    if (!posts) return [];
    
    const filtered = posts.filter(post => 
      activeCategory === 'All' || post.category === activeCategory
    );

    return [...filtered].sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [posts, activeCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOManager 
        title="Blogs | Rituals & Reflections"
        description="Curated insights from Verde Salon on beauty, sustainability, and the art of intentional living."
      />
      <Navbar />
      
      <main className="flex-grow pt-40">
        <section className="container mx-auto px-6 mb-32">
          <div className="max-w-4xl space-y-8">
            <span className="text-accent font-bold uppercase tracking-[0.5em] text-[11px] block animate-fade-in opacity-70">
              Blogs
            </span>
            <h1 className="text-6xl md:text-8xl font-headline font-light leading-tight text-primary tracking-tight">
              Rituals & Reflections
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl leading-relaxed tracking-wide">
              Mastering the art of natural beauty and sustainable luxury.
            </p>
          </div>
        </section>

        {/* Categories Minimalist Filter */}
        <section className="container mx-auto px-6 mb-24 border-y border-primary/5 py-10">
          <div className="flex flex-wrap gap-x-12 gap-y-4 items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mr-4">Explore By</span>
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500",
                  activeCategory === cat ? "text-accent" : "text-primary/40 hover:text-primary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 mb-48">
          {isLoading ? (
            <div className="py-20 text-center animate-pulse font-headline text-primary tracking-widest uppercase">
              Assembling Blogs...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
              {processedPosts.map((post) => (
                <BlogCard 
                  key={post.id}
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt || ''}
                  imageUrl={post.imageUrl}
                  category={post.category}
                />
              ))}
              {processedPosts.length === 0 && (
                <div className="col-span-full py-40 text-center text-muted-foreground font-light italic bg-muted/20 rounded-sm">
                  The blogs are currently quiet. Check back soon for new insights.
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
