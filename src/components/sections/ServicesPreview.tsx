'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface ServicePreviewItem {
  id: string;
  title: string;
  description: string;
  price?: string;
  imageUrl: string;
}

interface ServicesPreviewProps {
  title?: string;
  subtitle?: string;
  services?: ServicePreviewItem[];
}

const DEFAULT_SERVICES: ServicePreviewItem[] = [
  {
    id: 'hair',
    title: 'Hair Styling',
    description: 'Precision cuts and artisanal coloring tailored to your unique persona.',
    imageUrl: 'https://picsum.photos/seed/verde-hair-preview/800/1000',
  },
  {
    id: 'skin',
    title: 'Skin Treatments',
    description: 'Rejuvenating botanical facials that restore your natural radiance.',
    imageUrl: 'https://picsum.photos/seed/verde-skin-preview/800/1000',
  },
  {
    id: 'nails',
    title: 'Nail Care',
    description: 'Sophisticated manicures and pedicures with a focus on nail health.',
    imageUrl: 'https://picsum.photos/seed/verde-nails-preview/800/1000',
  },
  {
    id: 'spa',
    title: 'Spa & Relaxation',
    description: 'Immersive wellness rituals designed to soothe the mind and body.',
    imageUrl: 'https://picsum.photos/seed/verde-spa-preview/800/1000',
  }
];

export default function ServicesPreview({ 
  title = "Signature Rituals", 
  subtitle = "Our Craft", 
  services = DEFAULT_SERVICES 
}: ServicesPreviewProps) {
  // Use default services if the provided array is empty (CMS safety)
  const displayServices = services.length > 0 ? services : DEFAULT_SERVICES;

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
            href="/services" 
            className="group flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary hover:text-accent transition-all duration-300"
          >
            View Full Menu <ArrowRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {displayServices.slice(0, 4).map((service) => (
            <div 
              key={service.id} 
              className="group flex flex-col bg-white rounded-xl overflow-hidden border border-border/40 shadow-sm hover:shadow-xl transition-all duration-500 ease-out"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image 
                  src={service.imageUrl} 
                  alt={service.title} 
                  fill 
                  className="object-cover grayscale-[0.2] transition-transform duration-[1.5s] ease-out group-hover:scale(1.05) group-hover:grayscale-0"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="p-8 space-y-4">
                <h3 className="text-2xl font-headline font-light text-foreground group-hover:text-primary transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-2">
                  {service.description}
                </p>
                {service.price && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent block pt-2">
                    Starts from {service.price}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
