
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price: string;
  duration?: string;
  imageUrl: string;
  imageUrlAlt?: string;
  category: string;
}

interface ServicesListingProps {
  title?: string;
  subtitle?: string;
  description?: string;
  services?: ServiceItem[]; // Allow sidebar to inject items
  styles?: any;
}

export default function ServicesListing({ 
  title = "Signature Services", 
  subtitle = "The Menu",
  description = "Our specialists blend timeless techniques with contemporary science to create results that are uniquely yours.",
  services: manualServices = [],
  styles 
}: ServicesListingProps) {
  const db = useFirestore();
  
  // Dynamic fetch if no manual items provided
  const servicesQuery = useMemoFirebase(() => query(collection(db, 'services'), orderBy('category', 'asc')), [db]);
  const { data: fetchedServices, isLoading } = useCollection(servicesQuery);

  const displayServices = (manualServices && manualServices.length > 0) ? manualServices : fetchedServices;
  const categories = Array.from(new Set(displayServices?.map(s => s.category) || ['Hair', 'Skin', 'Nails']));
  
  const paddingVal = styles?.paddingVertical || '128';

  return (
    <section 
      style={{ 
        backgroundColor: styles?.backgroundColor || '#F5F3EF',
        paddingTop: `${paddingVal}px`,
        paddingBottom: `${paddingVal}px`
      }}
      className="overflow-hidden"
    >
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="max-w-4xl space-y-10 mb-32">
          <div className="space-y-6">
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

        {isLoading && !manualServices.length ? (
          <div className="py-20 text-center animate-pulse font-headline text-primary uppercase tracking-widest">
            Assembling Sanctuary Menu...
          </div>
        ) : (
          <>
            {/* Category Navigation */}
            <div className="flex flex-wrap gap-x-12 gap-y-4 items-center mb-24 border-b border-primary/10 pb-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mr-4">Explore By</span>
              {categories.map((cat) => (
                <a 
                  key={cat} 
                  href={`#${cat.toLowerCase().replace(/\s+/g, '-')}`} 
                  className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary/40 hover:text-accent transition-all duration-500 ease-out"
                >
                  {cat}
                </a>
              ))}
            </div>

            {/* Services Grid */}
            <div className="space-y-48">
              {categories.map((category) => (
                <div key={category} id={category.toLowerCase().replace(/\s+/g, '-')} className="space-y-20 scroll-mt-40">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Sparkles className="w-4 h-4 text-accent/60" />
                      <h2 className="text-4xl md:text-5xl font-headline font-light text-primary">{category}</h2>
                    </div>
                    <div className="h-[1px] w-12 bg-accent/20" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-32">
                    {displayServices?.filter(s => s.category === category).map((service) => (
                      <div key={service.id} className="group space-y-10">
                        {/* Service Media */}
                        <div className="relative aspect-[4/5] overflow-hidden shadow-2xl bg-muted group-hover:shadow-accent/10 transition-all duration-700">
                          <Image 
                            src={service.imageUrl || 'https://picsum.photos/seed/verde-service/800/1000'} 
                            alt={service.imageUrlAlt || service.title} 
                            fill 
                            className="object-cover grayscale-[0.2] transition-transform duration-[2.5s] ease-out group-hover:scale-110 group-hover:grayscale-0" 
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-1000 pointer-events-none" />
                          
                          {/* Floating Category Tag */}
                          <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.3em] text-primary shadow-sm">
                              {category}
                            </span>
                          </div>
                        </div>

                        {/* Service Details */}
                        <div className="space-y-8">
                          <div className="flex justify-between items-baseline border-b border-primary/5 pb-6">
                            <h3 className="text-3xl md:text-4xl font-headline font-light text-primary group-hover:text-accent transition-colors duration-700 tracking-tight">
                              {service.title}
                            </h3>
                            <span className="text-xl font-headline font-light text-accent/80 tracking-widest">{service.price}</span>
                          </div>
                          
                          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed tracking-wide line-clamp-3">
                            {service.description}
                          </p>

                          <div className="flex items-center justify-between pt-4">
                            <div className="flex flex-col space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Duration</span>
                              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary/60">{service.duration || 'Consultation'}</span>
                            </div>
                            
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-[11px] font-bold uppercase tracking-[0.4em] text-accent hover:text-primary transition-all duration-500 group/btn"
                              asChild
                            >
                              <a href="/services">
                                Reserve <ArrowRight className="ml-3 w-3.5 h-3.5 transition-transform duration-500 group-hover/btn:translate-x-2" />
                              </a>
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
