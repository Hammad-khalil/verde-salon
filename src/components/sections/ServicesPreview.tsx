'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

interface ServicesPreviewProps {
  title?: string;
  subtitle?: string;
}

export default function ServicesPreview({ 
  title = "Signature Rituals", 
  subtitle = "Our Craft"
}: ServicesPreviewProps) {
  const db = useFirestore();

  // Fetch the latest 4 published blog posts to act as "Rituals"
  const blogQuery = useMemoFirebase(() => {
    return query(
      collection(db, 'blog_posts'), 
      where('isPublished', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(4)
    );
  }, [db]);

  const { data: blogs, isLoading, error } = useCollection(blogQuery);

  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-20 gap-8">
          <div className="max-w-xl">
            <span className="text-primary text-[11px] font-bold uppercase tracking-[0.4em] mb-4 block opacity-70">
              {subtitle}
            </span>
            <h2 className="text-4xl md:text-6xl font-headline font-light leading-tight text-foreground">
              {title}
            </h2>
          </div>
          <Link 
            href="/blog" 
            className="group flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary hover:text-accent transition-all duration-300"
          >
            Explore The Journal <ArrowRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-20 text-center animate-pulse font-headline text-primary uppercase tracking-widest">
            Gathering Insights...
          </div>
        ) : error ? (
          <div className="py-20 text-center border-2 border-dashed border-primary/5 rounded-sm">
            <p className="font-headline text-xl text-muted-foreground/40 italic">We're updating our seasonal rituals. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {blogs?.map((blog) => (
              <Link 
                key={blog.id} 
                href={`/blog/${blog.slug}`}
                className="group flex flex-col bg-white rounded-xl overflow-hidden border border-border/40 shadow-sm hover:shadow-xl transition-all duration-500 ease-out"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image 
                    src={blog.imageUrl || 'https://picsum.photos/seed/verde-default/800/1000'} 
                    alt={blog.title} 
                    fill 
                    className="object-cover grayscale-[0.2] transition-transform duration-[1.5s] ease-out group-hover:scale-[1.05] group-hover:grayscale-0"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500" />
                  <div className="absolute top-4 left-4">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-semibold transition-colors bg-white/90 backdrop-blur-md text-primary uppercase tracking-widest border-none px-3 py-1">
                      {blog.category}
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="text-2xl font-headline font-light text-foreground group-hover:text-accent transition-colors duration-300 line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-2">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center text-[9px] font-bold uppercase tracking-[0.2em] text-accent pt-2">
                    Read Ritual <ArrowRight className="ml-2 w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
            {(!blogs || blogs.length === 0) && !isLoading && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-primary/5 rounded-sm">
                <p className="font-headline text-xl text-muted-foreground/40 italic">New stories are being crafted. Check back soon.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}