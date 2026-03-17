'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram as InstagramIcon } from 'lucide-react';

interface InstagramPreviewProps {
  handle?: string;
  title?: string;
  posts?: string[];
}

export default function InstagramPreview({ 
  handle = "@verdesalonsalon", 
  title = "Follow Us on Instagram",
  posts = [] 
}: InstagramPreviewProps) {
  // Use 6 images as requested
  const galleryPosts = posts.length > 0 ? posts : [
    'https://picsum.photos/seed/insta1/600/600',
    'https://picsum.photos/seed/insta2/600/600',
    'https://picsum.photos/seed/insta3/600/600',
    'https://picsum.photos/seed/insta4/600/600',
    'https://picsum.photos/seed/insta5/600/600',
    'https://picsum.photos/seed/insta6/600/600',
  ];

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-24 space-y-4">
          <Link 
            href={`https://instagram.com/${handle.replace('@', '')}`} 
            target="_blank" 
            className="group inline-flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.5em] mb-4 hover:opacity-70 transition-opacity"
          >
            <InstagramIcon className="mr-3 w-3 h-3 text-accent" /> {handle}
          </Link>
          <h2 className="text-4xl md:text-6xl font-headline font-light tracking-tight">{title}</h2>
          <div className="h-[1px] w-12 bg-accent/40 mt-8" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {galleryPosts.slice(0, 6).map((url, i) => (
            <div key={i} className="relative aspect-square overflow-hidden group bg-muted">
              <Image 
                src={url} 
                alt={`Instagram Post ${i+1}`} 
                fill 
                className="object-cover transition-all duration-[1.5s] ease-out group-hover:scale-110 group-hover:brightness-75 grayscale-[0.3] group-hover:grayscale-0"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                data-ai-hint="salon aesthetic"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-primary/20">
                <InstagramIcon className="text-white w-6 h-6 font-light" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
