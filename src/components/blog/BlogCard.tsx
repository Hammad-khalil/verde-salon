'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Calendar, Clock } from 'lucide-react';

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
    <Link href={`/blog/${slug}`} className="group flex flex-col space-y-10 animate-fade-in">
      {/* Cinematic Card Media */}
      <div className="relative aspect-[16/11] overflow-hidden bg-slate-50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 group-hover:shadow-accent/10">
        <Image 
          src={imageUrl || 'https://picsum.photos/seed/verde-default/800/600'} 
          alt={title} 
          fill 
          className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-[2s] ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        
        {/* Floating Category Badge */}
        <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
          <span className="bg-white/95 backdrop-blur-md px-5 py-2 text-[9px] font-bold uppercase tracking-[0.4em] text-primary shadow-xl">
            {category}
          </span>
        </div>

        {/* Visual Overlay */}
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-1000 pointer-events-none" />
      </div>
      
      {/* Content Metadata */}
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex justify-between items-start gap-6">
            <h2 className="text-3xl md:text-4xl font-headline font-light group-hover:text-accent transition-colors duration-700 leading-[1.1] tracking-tight">
              {title}
            </h2>
            <div className="pt-3 opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 text-accent">
              <ArrowUpRight className="w-7 h-7 stroke-[1px]" />
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground/80 font-light line-clamp-2 leading-relaxed tracking-wide">
            {excerpt}
          </p>
        </div>
        
        {/* Card Footer Signature */}
        <div className="flex items-center justify-between pt-6 border-t border-primary/5">
          <div className="flex items-center space-x-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary group-hover:text-accent transition-all duration-500">
              Read Story
            </span>
            {date && (
              <div className="flex items-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">
                <Calendar className="w-3 h-3 mr-2 text-accent/40" />
                {date}
              </div>
            )}
          </div>
          <div className="flex items-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20">
            <Clock className="w-3 h-3 mr-2" />
            5 MIN
          </div>
        </div>
      </div>
    </Link>
  );
}
