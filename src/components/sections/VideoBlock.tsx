
'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface VideoBlockProps {
  title?: string;
  subtitle?: string;
  videoUrl: string;
  posterUrl?: string;
  isFullWidth?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showControls?: boolean;
  startTime?: number;
  endTime?: number;
  styles?: any;
}

export default function VideoBlock({ 
  title, 
  subtitle, 
  videoUrl, 
  posterUrl,
  isFullWidth = true,
  autoplay = true,
  loop = true,
  muted = true,
  showControls = false,
  startTime,
  endTime,
  styles
}: VideoBlockProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Force muted/playsinline for autoplay compatibility if requested
  const effectiveMuted = autoplay ? true : (muted ?? true);
  const effectiveControls = showControls ?? false;
  
  const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');
  
  let finalUrl = videoUrl;
  if (isYouTube && videoUrl) {
    const videoId = videoUrl.includes('watch?v=') ? videoUrl.split('v=')[1]?.split('&')[0] : videoUrl.split('/').pop();
    
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      mute: effectiveMuted ? '1' : '0',
      loop: loop ? '1' : '0',
      playlist: videoId || '',
      playsinline: '1',
      controls: effectiveControls ? '1' : '0',
      modestbranding: '1',
      rel: '0',
      iv_load_policy: '3',
      showinfo: '0'
    });

    if (startTime) params.append('start', startTime.toString());
    if (endTime) params.append('end', endTime.toString());

    finalUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  // Ensure native video properties are applied correctly after hydration
  useEffect(() => {
    if (videoRef.current && !isYouTube) {
      videoRef.current.muted = effectiveMuted;
      if (autoplay) {
        videoRef.current.play().catch(e => console.warn('Autoplay prevented:', e));
      }
    }
  }, [videoUrl, effectiveMuted, autoplay, isYouTube]);

  const paddingVal = styles?.paddingVertical || '96';

  return (
    <section 
      className={cn(
        "bg-background relative transition-all duration-1000",
        isFullWidth ? '' : 'container mx-auto px-6'
      )}
      style={{ 
        paddingTop: `${paddingVal}px`, 
        paddingBottom: `${paddingVal}px`,
        backgroundColor: styles?.backgroundColor || 'transparent'
      }}
    >
      <div className={cn("space-y-12", isFullWidth ? '' : 'max-w-5xl mx-auto')}>
        {(title || subtitle) && (
          <div className="text-center space-y-6 px-6 max-w-3xl mx-auto animate-fade-in">
            {title && (
              <h2 
                className="text-4xl md:text-6xl font-headline font-light tracking-tight" 
                style={{ color: styles?.titleColor || 'inherit' }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p 
                className="text-muted-foreground font-light text-lg md:text-xl uppercase tracking-[0.3em]" 
                style={{ color: styles?.subtitleColor || 'inherit' }}
              >
                {subtitle}
              </p>
            )}
            <div className="h-[1px] w-12 bg-accent/40 mx-auto mt-8" />
          </div>
        )}

        <div className={cn(
          "relative aspect-video overflow-hidden bg-black shadow-2xl transition-all duration-700",
          isFullWidth ? '' : 'rounded-sm',
          !effectiveControls ? "pointer-events-none" : ""
        )}>
          {isYouTube ? (
            <div className={cn(
              "absolute inset-0 w-full h-full",
              !effectiveControls && "scale-[1.15]"
            )}>
              <iframe
                src={finalUrl}
                className="w-full h-full border-none"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={title || "Video content"}
              ></iframe>
            </div>
          ) : (
            <video 
              ref={videoRef}
              key={videoUrl}
              src={videoUrl} 
              poster={posterUrl}
              autoPlay={autoplay} 
              loop={loop} 
              muted={effectiveMuted} 
              playsInline={true}
              controls={effectiveControls}
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          
          {/* Subtle overlay gradient if controls are hidden */}
          {!effectiveControls && (
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          )}
        </div>
      </div>
    </section>
  );
}
