'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandIntroProps {
  title: string;
  content: string;
  imageUrl?: string;
  altText?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  styles?: any;
}

export default function BrandIntro({ 
  title = "About Verde Salon", 
  content, 
  imageUrl = "https://picsum.photos/seed/verde-about/800/1000",
  altText = "Verde Salon Interior",
  subtitle = "The Essence of Luxury",
  buttonText = "Discover Our Story",
  buttonUrl = "/blog",
  styles
}: BrandIntroProps) {
  const paddingVal = styles?.paddingVertical || '128';
  const objectFit = styles?.objectFit || 'cover';
  
  return (
    <section 
      className="overflow-hidden"
      style={{ 
        backgroundColor: styles?.backgroundColor || '#F5F3EF',
        paddingTop: `${paddingVal}px`,
        paddingBottom: `${paddingVal}px`
      }}
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text Content */}
          <div className="space-y-10 order-2 lg:order-1">
            <div className="space-y-6">
              <span 
                className="font-bold uppercase tracking-[0.5em] text-[11px] block animate-fade-in opacity-70"
                style={{ color: styles?.subtitleColor || '#0F2F2F' }}
              >
                {subtitle}
              </span>
              <h2 
                className="text-4xl md:text-6xl lg:text-7xl font-headline font-light leading-[1.1] tracking-tight"
                style={{ color: styles?.titleColor || '#0F2F2F' }}
              >
                {title}
              </h2>
              <div className="h-[1px] w-20 bg-accent/40" />
            </div>
            
            <p className="text-lg md:text-xl font-light leading-relaxed text-muted-foreground tracking-wide max-w-xl">
              {content}
            </p>

            <div className="pt-6">
              <Button 
                asChild
                variant="outline" 
                className={cn(
                  "group relative overflow-hidden rounded-none border-primary/20 px-10 py-7 text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500 hover:border-primary hover:bg-primary hover:text-white",
                  styles?.buttonType === 'primary' && 'bg-primary text-white hover:bg-accent border-primary'
                )}
              >
                <Link href={buttonUrl || '/blog'}>
                  <span className="relative z-10 flex items-center">
                    {buttonText} 
                    <ArrowRight className="ml-3 w-4 h-4 transition-transform duration-500 group-hover:translate-x-2" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Image Content */}
          <div className="relative order-1 lg:order-2 group">
            <div className="relative aspect-[4/5] overflow-hidden shadow-2xl">
              <Image 
                src={imageUrl} 
                alt={altText} 
                fill 
                className={cn(
                  "transition-transform duration-[2s] ease-out group-hover:scale-105 grayscale-[0.2] group-hover:grayscale-0",
                  objectFit === 'cover' ? "object-cover" : "object-contain"
                )}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
            </div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 border-l border-b border-accent/20 hidden md:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
