'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import BlogCard from '@/components/blog/BlogCard';

interface BlogListingProps {
  title?: string;
  subtitle?: string;
  description?: string;
  styles?: any;
}

export default function BlogListing({ 
  title = "Reflections & Insights", 
  subtitle = "Blogs",
  description = "Mastering the art of natural beauty and sustainable luxury.",
  styles 
}: BlogListingProps) {
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState('All');

  const blogQuery = useMemoFirebase(() => {
    return query(collection(db, 'blog_posts'), orderBy('publishedAt', 'desc'));
  }, [db]);

  const { data: posts, isLoading } = useCollection(blogQuery);

  const categories = ['All', 'Hair', 'Skincare', 'Trends', 'Wellness', 'Sustainability'];

  const processedPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter(post => 
      post.isPublished && (activeCategory === 'All' || post.category === activeCategory)
    );
  }, [posts, activeCategory]);

  const paddingVal = styles?.paddingVertical || '128';

  return (
    <section 
      style={{ 
        backgroundColor: styles?.backgroundColor || '#ffffff',
        paddingTop: `${paddingVal}px`,
        paddingBottom: `${paddingVal}px`
      }}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-4xl space-y-8 mb-24">
          <span 
            className="font-bold uppercase tracking-[0.5em] text-[11px] block opacity-70"
            style={{ color: styles?.subtitleColor || 'inherit' }}
          >
            {subtitle}
          </span>
          <h1 
            className="text-6xl md:text-8xl font-headline font-light leading-tight tracking-tight"
            style={{ color: styles?.titleColor || 'inherit' }}
          >
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl leading-relaxed tracking-wide">
            {description}
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap gap-x-12 gap-y-4 items-center mb-20 border-y border-primary/5 py-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mr-4">Explore By</span>
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={(e) => { e.stopPropagation(); setActiveCategory(cat); }}
              className={cn(
                "text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500",
                activeCategory === cat ? "text-accent" : "text-primary/40 hover:text-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

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
                Our blog is currently quiet. Check back soon for new insights.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}