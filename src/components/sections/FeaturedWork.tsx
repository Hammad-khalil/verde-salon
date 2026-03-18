'use client';

import Image from 'next/image';

interface FeaturedWorkProps {
  title?: string;
  subtitle?: string;
  images?: string[];
}

export default function FeaturedWork({ 
  title = "Our Work", 
  subtitle = "The Verde Aesthetic",
  images = [] 
}: FeaturedWorkProps) {
  // Ensure we handle both prop-based images and fallbacks correctly
  // If images array is empty or not provided, use default luxury placeholders
  const galleryImages = (Array.isArray(images) && images.length > 0) ? images : [
    'https://picsum.photos/seed/verde-work-1/600/800',
    'https://picsum.photos/seed/verde-work-2/600/800',
    'https://picsum.photos/seed/verde-work-3/600/800',
    'https://picsum.photos/seed/verde-work-4/600/800',
    'https://picsum.photos/seed/verde-work-5/600/800',
    'https://picsum.photos/seed/verde-work-6/600/800',
  ];

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 space-y-4">
          <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] opacity-60">
            {subtitle}
          </span>
          <h2 className="text-4xl md:text-6xl font-headline font-light">{title}</h2>
          <div className="h-[1px] w-12 bg-accent/40 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryImages.slice(0, 6).map((img, i) => (
            <div key={i} className="group relative aspect-[3/4] overflow-hidden bg-muted shadow-sm">
              <Image 
                src={img} 
                alt={`${title} item ${i+1}`} 
                fill 
                className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-[1.5s] ease-out group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                data-ai-hint="luxury hair"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
