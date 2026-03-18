'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  videoStartTime?: number;
  videoEndTime?: number;
  backgroundType?: 'image' | 'video' | 'color';
  styles?: {
    backgroundColor?: string;
    titleColor?: string;
    subtitleColor?: string;
    alignment?: 'left' | 'center';
    overlayOpacity?: number;
    overlayColor?: string;
    buttonType?: 'primary' | 'outline';
  };
}

export default function Hero({ 
  title = "Elevate Your Natural Beauty", 
  subtitle = "Premium hair, skin, and wellness treatments tailored for you.", 
  ctaText = "Book Appointment", 
  ctaUrl = "/services",
  imageUrl = "https://picsum.photos/seed/verde-hero-main/1920/1080", 
  videoUrl,
  videoStartTime,
  videoEndTime,
  backgroundType = 'image',
  styles
}: HeroProps) {
  const alignmentClass = styles?.alignment === 'left' ? 'text-left items-start' : 'text-center items-center';
  const overlayOpacity = (styles?.overlayOpacity ?? 20) / 100;
  const overlayColor = styles?.overlayColor || '#000000';

  const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');
  let finalVideoUrl = videoUrl;

  if (isYouTube && videoUrl) {
    const videoId = videoUrl.includes('watch?v=') ? videoUrl.split('v=')[1]?.split('&')[0] : videoUrl.split('/').pop();
    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      loop: '1',
      playlist: videoId || '',
      playsinline: '1',
      controls: '0',
      modestbranding: '1',
      rel: '0',
      iv_load_policy: '3',
      enablejsapi: '1',
      widget_referrer: window.location.href
    });
    if (videoStartTime) params.append('start', videoStartTime.toString());
    if (videoEndTime) params.append('end', videoEndTime.toString());
    finalVideoUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  return (
    <section 
      className="relative h-[100vh] w-full overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: styles?.backgroundColor || '#0F2F2F' }}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {backgroundType === 'video' && finalVideoUrl ? (
          isYouTube ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%]">
              <iframe
                src={finalVideoUrl}
                className="w-full h-full border-none pointer-events-none"
                allow="autoplay; fullscreen"
              ></iframe>
            </div>
          ) : (
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="w-full h-full object-cover"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          )
        ) : backgroundType === 'image' ? (
          <Image 
            src={imageUrl || "https://picsum.photos/seed/verde-hero-main/1920/1080"} 
            alt="Verde Salon Luxury Atmosphere" 
            fill 
            priority
            className="object-cover scale-[1.02]"
            data-ai-hint="luxury salon"
          />
        ) : null}
        
        {/* Overlay Layer */}
        <div 
          className="absolute inset-0 z-1" 
          style={{ 
            backgroundColor: overlayColor,
            opacity: overlayOpacity
          }} 
        />
        
        {/* Subtle Gradient Shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-2" />
      </div>
      
      {/* Content Layer */}
      <div className={cn("relative z-10 container mx-auto px-6 text-white flex flex-col", alignmentClass)}>
        <div className={cn("max-w-4xl space-y-10 animate-fade-in", alignmentClass)}>
          <span 
            className="text-[12px] font-bold tracking-[0.6em] uppercase block"
            style={{ color: styles?.subtitleColor || '#C6A15B' }}
          >
            The Art of Transformation
          </span>
          <h1 
            className="text-5xl md:text-8xl font-headline font-light leading-[1.1] md:leading-[1.05] tracking-tight"
            style={{ color: styles?.titleColor || '#ffffff' }}
          >
            {title}
          </h1>
          <p className="text-lg md:text-2xl font-light text-white/80 max-w-2xl font-body tracking-wide leading-relaxed">
            {subtitle}
          </p>
          <div className="pt-8">
            <Button 
              asChild
              className={cn(
                "rounded-none px-16 py-8 text-[12px] font-bold tracking-[0.4em] uppercase transition-all duration-700 shadow-2xl group relative overflow-hidden",
                styles?.buttonType === 'outline' 
                  ? 'bg-transparent border border-white text-white hover:bg-white hover:text-primary' 
                  : 'bg-accent text-primary hover:bg-white hover:text-primary'
              )}
            >
              <Link href={ctaUrl || '/services'}>
                <span className="relative z-10">{ctaText}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4 opacity-30 z-10">
        <span className="text-[10px] uppercase tracking-[0.4em] text-white font-bold rotate-90 translate-y-8">Scroll</span>
        <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
