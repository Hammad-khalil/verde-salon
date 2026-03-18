'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ServicesListingProps {
  title?: string;
  subtitle?: string;
  description?: string;
  styles?: any;
}

export default function ServicesListing({ 
  title = "Signature Rituals", 
  subtitle = "The Menu",
  description = "Our specialists blend timeless techniques with contemporary science to create results that are uniquely yours.",
  styles 
}: ServicesListingProps) {
  const db = useFirestore();
  
  const servicesQuery = useMemoFirebase(() => query(collection(db, 'services'), orderBy('category', 'asc')), [db]);
  const { data: services, isLoading } = useCollection(servicesQuery);

  const categories = Array.from(new Set(services?.map(s => s.category) || ['Hair', 'Skin', 'Nails']));
  const paddingVal = styles?.paddingVertical || '128';

  return (
    <section 
      style={{ 
        backgroundColor: styles?.backgroundColor || '#F5F3EF',
        paddingTop: `${paddingVal}px`,
        paddingBottom: `${paddingVal}px`
      }}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-4xl space-y-8 mb-32">
          <div className="space-y-4">
            <span 
              className="font-bold uppercase tracking-[0.5em] text-[11px] block opacity-70"
              style={{ color: styles?.subtitleColor || 'inherit' }}
            >
              {subtitle}
            </span>
            <h1 
              className="text-6xl md:text-8xl font-headline font-light leading-[1.1] tracking-tight"
              style={{ color: styles?.titleColor || 'inherit' }}
            >
              {title}
            </h1>
            <div className="h-[1px] w-20 bg-accent/40" />
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl tracking-wide">
            {description}
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center animate-pulse font-headline text-primary uppercase tracking-widest">
            Assembling Rituals...
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-x-12 gap-y-4 items-center mb-24 border-b border-primary/10 pb-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mr-4">Filter By</span>
              {categories.map((cat) => (
                <a 
                  key={cat} 
                  href={`#${cat.toLowerCase().replace(' ', '-')}`} 
                  className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary/40 hover:text-accent transition-all duration-300"
                >
                  {cat}
                </a>
              ))}
            </div>

            <div className="space-y-48">
              {categories.map((category) => (
                <div key={category} id={category.toLowerCase().replace(' ', '-')} className="space-y-20 scroll-mt-40">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Sparkles className="w-4 h-4 text-accent/60" />
                      <h2 className="text-4xl md:text-5xl font-headline font-light text-primary">{category}</h2>
                    </div>
                    <div className="h-[1px] w-12 bg-accent/20" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-32">
                    {services?.filter(s => s.category === category).map((service) => (
                      <div key={service.id} className="group space-y-8">
                        <div className="relative aspect-[4/5] overflow-hidden shadow-2xl bg-muted">
                          <Image 
                            src={service.imageUrl || 'https://picsum.photos/seed/verde-ritual/800/1000'} 
                            alt={service.title} 
                            fill 
                            className="object-cover grayscale-[0.3] transition-transform duration-[2s] group-hover:scale-105 group-hover:grayscale-0" 
                          />
                          <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-700" />
                        </div>
                        <div className="space-y-6">
                          <div className="flex justify-between items-baseline border-b border-primary/10 pb-4">
                            <h3 className="text-2xl md:text-3xl font-headline font-light text-primary group-hover:text-accent transition-colors duration-500">{service.title}</h3>
                            <span className="text-lg font-headline font-light text-accent">{service.price}</span>
                          </div>
                          <p className="text-muted-foreground font-light leading-relaxed tracking-wide text-lg">
                            {service.description}
                          </p>
                          <div className="flex items-center justify-between pt-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Duration: {service.duration}</span>
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-[11px] font-bold uppercase tracking-[0.3em] text-accent hover:text-primary transition-colors group/btn"
                            >
                              Reserve Now <ArrowRight className="ml-2 w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
