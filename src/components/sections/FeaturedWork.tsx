
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FeaturedWorkProps {
  title?: string;
  subtitle?: string;
  images?: string[];
  styles?: any;
}

export default function FeaturedWork({ 
  title = "Our Work", 
  subtitle = "The Verde Aesthetic",
  images = [],
  styles
}: FeaturedWorkProps) {
  const db = useFirestore();
  const paddingVal = styles?.paddingVertical || '128';
  const objectFit = styles?.objectFit || 'cover';

  // Dynamic Linkage: Fetch images from Services if no manual images exist
  const servicesQuery = useMemoFirebase(() => collection(db, 'services'), [db]);
  const { data: services } = useCollection(servicesQuery);

  const displayImages = useMemo(() => {
    // 1. Priority: User-provided images in Page Builder
    if (Array.isArray(images) && images.length > 0) return images;
    
    // 2. Dynamic: Service Images from CMS
    if (services && services.length > 0) {
      return services.map(s => s.imageUrl).filter(Boolean);
    }

    // 3. Fallback: Aesthetic Placeholders
    return [
      'https://picsum.photos/seed/verde-work-1/600/800',
      'https://picsum.photos/seed/verde-work-2/600/800',
      'https://picsum.photos/seed/verde-work-3/600/800',
      'https://picsum.photos/seed/verde-work-4/600/800',
      'https://picsum.photos/seed/verde-work-5/600/800',
      'https://picsum.photos/seed/verde-work-6/600/800',
    ];
  }, [images, services]);

  return (
    <section 
      style={{ 
        paddingTop: `${paddingVal}px`, 
        paddingBottom: `${paddingVal}px`,
        backgroundColor: styles?.backgroundColor || '#ffffff'
      }}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 space-y-4">
          <span 
            className="font-bold uppercase tracking-[0.4em] text-[10px] opacity-60"
            style={{ color: styles?.subtitleColor || 'inherit' }}
          >
            {subtitle}
          </span>
          <h2 
            className="text-4xl md:text-6xl font-headline font-light"
            style={{ color: styles?.titleColor || 'inherit' }}
          >
            {title}
          </h2>
          <div className="h-[1px] w-12 bg-accent/40 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayImages.map((img, i) => (
            <div key={i} className="group relative aspect-[3/4] overflow-hidden bg-muted shadow-2xl">
              <Image 
                src={typeof img === 'string' ? img : (img as any).imageUrl || 'https://picsum.photos/seed/missing/600/800'} 
                alt={`${title} item ${i+1}`} 
                fill 
                className={cn(
                  "grayscale-[0.3] transition-all duration-[2s] group-hover:scale-110 group-hover:grayscale-0",
                  objectFit === 'contain' ? "object-contain" : "object-cover"
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
