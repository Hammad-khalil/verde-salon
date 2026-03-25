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
  styles?: {
    backgroundColor?: string;
    titleColor?: string;
    subtitleColor?: string;
    paddingVertical?: string;
    objectFit?: 'cover' | 'contain';
    height?: string;
    maxWidth?: string;
  };
}

/**
 * VideoBlock - A high-performance media section.
 * Supports local and external videos with custom fitting and sizing.
 */
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
  
  // Audio and Interface Logic
  const effectiveMuted = autoplay ? true : (muted ?? true);
  const effectiveControls = showControls ?? false;
  
  // Layout Logic
  const objectFit = styles?.objectFit || 'cover';
  const customHeight = styles?.height || ''; // empty means standard aspect-video
  const customWidth = styles?.maxWidth || '100%';
  
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
      <div 
        className={cn("space-y-12 mx-auto", isFullWidth ? 'w-full' : '')} 
        style={{ maxWidth: isFullWidth ? '100%' : customWidth }}
      >
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

        <div 
          className={cn(
            "relative overflow-hidden bg-black shadow-2xl transition-all duration-700",
            (!customHeight || customHeight === 'auto' || customHeight === '') ? "aspect-video" : "",
            isFullWidth ? '' : 'rounded-sm',
            !effectiveControls ? "pointer-events-none" : ""
          )}
          style={{ height: (customHeight && customHeight !== 'auto' && customHeight !== '') ? customHeight : undefined }}
        >
          {isYouTube ? (
            <div className={cn(
              "absolute inset-0 w-full h-full",
              objectFit === 'cover' ? "scale-[1.35]" : "scale-100"
            )}>
              <iframe
                src={finalUrl}
                className="w-full h-full border-none"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={title || "Video content"}
                style={{ objectFit: objectFit as any }}
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
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: objectFit as any }}
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
