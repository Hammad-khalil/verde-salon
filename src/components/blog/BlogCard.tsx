'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Calendar } from 'lucide-react';

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  date?: string;
}

export default function BlogCard({ slug, title, excerpt, imageUrl, category, date }: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="group flex flex-col space-y-10">
      <div className="relative aspect-[16/11] overflow-hidden bg-muted shadow-lg">
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-[1.5s] ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute top-6 left-6 flex space-x-2">
          <span className="bg-white/95 backdrop-blur-md px-5 py-2 text-[9px] font-bold uppercase tracking-[0.4em] text-primary shadow-sm">
            {category}
          </span>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-3xl font-headline font-light group-hover:text-accent transition-colors duration-700 leading-tight tracking-tight">
              {title}
            </h2>
            <div className="pt-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700 text-accent">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
          <p className="text-muted-foreground font-light line-clamp-2 leading-relaxed tracking-wide text-lg">
            {excerpt}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-primary/5">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary group-hover:text-accent transition-colors">
            Read Ritual
          </span>
          {date && (
            <div className="flex items-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
              <Calendar className="w-3 h-3 mr-2" />
              {date}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
