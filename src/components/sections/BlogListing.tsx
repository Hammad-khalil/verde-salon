'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import BlogCard from '@/components/blog/BlogCard';
import { Sparkles, Info } from 'lucide-react';

interface BlogListingProps {
  title?: string;
  subtitle?: string;
  description?: string;
  styles?: any;
}

export default function BlogListing({ 
  title = "Reflections & Insights", 
  subtitle = "The Journal",
  description = "Mastering the art of natural beauty and sustainable luxury through intentional living.",
  styles 
}: BlogListingProps) {
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState('All');

  const blogQuery = useMemoFirebase(() => {
    return query(collection(db, 'blog_posts'), orderBy('publishedAt', 'desc'));
  }, [db]);

  const { data: posts, isLoading } = useCollection(blogQuery);

  const categories = useMemo(() => {
    const cats = ['All'];
    if (posts && posts.length > 0) {
      const distinct = Array.from(new Set(posts.map(p => p.category))).filter(Boolean);
      cats.push(...distinct);
    } else {
      cats.push('Hair', 'Skin', 'Wellness');
    }
    return cats;
  }, [posts]);

  const processedPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter(post => 
      post.isPublished && (activeCategory === 'All' || post.category === activeCategory)
    );
  }, [posts, activeCategory]);

  const paddingVal = styles?.paddingVertical || '160';

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return undefined;
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? undefined : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return undefined;
    }
  };

  return (
    <section 
      className="overflow-hidden"
      style={{ 
        backgroundColor: styles?.backgroundColor || '#ffffff',
        paddingTop: `${paddingVal}px`,
        paddingBottom: `${paddingVal}px`
      }}
    >
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="max-w-5xl space-y-12 mb-32">
          <div className="space-y-6">
            <span 
              className="font-bold uppercase tracking-[0.6em] text-[11px] block opacity-70 animate-fade-in"
              style={{ color: styles?.subtitleColor || '#C6A15B' }}
            >
              {subtitle}
            </span>
            <h1 
              className="text-6xl md:text-8xl lg:text-9xl font-headline font-light leading-[1] tracking-tighter"
              style={{ color: styles?.titleColor || 'inherit' }}
            >
              {title}
            </h1>
            <div className="h-[1px] w-24 bg-accent/40 mt-10" />
          </div>
          <p className="text-xl md:text-3xl text-muted-foreground/80 font-light max-w-3xl leading-relaxed tracking-wide">
            {description}
          </p>
        </div>

        {/* Dynamic Categories Filter */}
        <div className="flex flex-wrap gap-x-12 gap-y-6 items-center mb-24 border-y border-primary/5 py-12">
          <div className="flex items-center space-x-4 mr-8">
            <Sparkles className="w-4 h-4 text-accent/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Curated By</span>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={(e) => { e.stopPropagation(); setActiveCategory(cat); }}
                className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.4em] transition-all duration-700 relative group",
                  activeCategory === cat ? "text-primary" : "text-primary/30 hover:text-primary"
                )}
              >
                {cat}
                <span className={cn(
                  "absolute -bottom-2 left-0 w-full h-[1.5px] bg-accent transition-transform duration-500",
                  activeCategory === cat ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )} />
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-40 text-center animate-pulse font-headline text-primary tracking-widest uppercase border border-dashed border-primary/5">
            GATHERING STORIES...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
            {processedPosts.map((post) => (
              <BlogCard 
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt || ''}
                imageUrl={post.imageUrl}
                category={post.category}
                date={formatDate(post.publishedAt)}
              />
            ))}
            {!isLoading && processedPosts.length === 0 && (
              <div className="col-span-full py-48 text-center bg-slate-50/50 border border-dashed border-primary/10 flex flex-col items-center justify-center space-y-6">
                <Info className="w-10 h-10 text-primary/20" />
                <div className="space-y-2">
                  <p className="font-headline text-2xl text-muted-foreground/60 italic">The blog is currently being curated.</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/40">Ensure articles are marked as "Live" in the editor to appear here.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
