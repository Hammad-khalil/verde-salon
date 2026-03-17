'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  imageUrl?: string;
  videoUrl?: string;
  styles?: any;
}

export default function Hero({ 
  title = "Elevate Your Natural Beauty", 
  subtitle = "Premium hair, skin, and wellness treatments tailored for you.", 
  ctaText = "Book Appointment", 
  imageUrl = "https://picsum.photos/seed/verde-hero-main/1920/1080", 
  videoUrl,
  styles
}: HeroProps) {
  const alignmentClass = styles?.alignment === 'left' ? 'text-left items-start' : 'text-center items-center';
  const overlayOpacity = (styles?.overlayOpacity || 20) / 100;

  return (
    <section 
      className="relative h-[100vh] w-full overflow-hidden flex items-center justify-center bg-primary"
      style={{ backgroundColor: styles?.backgroundColor }}
    >
      <div className="absolute inset-0 z-0">
        {videoUrl ? (
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover brightness-[0.6]"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <Image 
            src={imageUrl} 
            alt="Verde Salon Luxury Atmosphere" 
            fill 
            priority
            className="object-cover scale-[1.05]"
            style={{ filter: `brightness(${1 - overlayOpacity})` }}
            data-ai-hint="luxury salon"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      </div>
      
      <div className={cn("relative z-10 container mx-auto px-6 text-white flex flex-col", alignmentClass)}>
        <div className={cn("max-w-4xl space-y-10 animate-fade-in", alignmentClass)}>
          <span className="text-[12px] font-bold tracking-[0.6em] uppercase text-accent/80 block">
            The Art of Transformation
          </span>
          <h1 
            className="text-5xl md:text-8xl font-headline font-light leading-[1.1] md:leading-[1.05] tracking-tight"
            style={{ color: styles?.titleColor || '#ffffff' }}
          >
            {title}
          </h1>
          <p className="text-lg md:text-2xl font-light text-white/70 max-w-2xl font-body tracking-wide leading-relaxed">
            {subtitle}
          </p>
          <div className="pt-8">
            <Button 
              className={cn(
                "rounded-none px-16 py-8 text-[12px] font-bold tracking-[0.4em] uppercase transition-all duration-700 shadow-2xl group relative overflow-hidden",
                styles?.buttonType === 'outline' ? 'bg-transparent border border-white text-white hover:bg-white hover:text-primary' : 'bg-accent text-primary hover:bg-white hover:text-primary'
              )}
            >
              <span className="relative z-10">{ctaText}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4 opacity-30">
        <span className="text-[10px] uppercase tracking-[0.4em] text-white font-bold rotate-90 translate-y-8">Scroll</span>
        <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
