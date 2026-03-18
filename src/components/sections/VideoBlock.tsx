'use client';

interface VideoBlockProps {
  title?: string;
  subtitle?: string;
  videoUrl: string;
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
  isFullWidth = true,
  autoplay = true,
  loop = true,
  muted = true,
  showControls = false,
  startTime,
  endTime,
  styles
}: VideoBlockProps) {
  // Force muted/playsinline for autoplay compatibility
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
      iv_load_policy: '3'
    });

    if (startTime) params.append('start', startTime.toString());
    if (endTime) params.append('end', endTime.toString());

    finalUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  const paddingVal = styles?.paddingVertical || '96';

  return (
    <section 
      className={`bg-background relative ${isFullWidth ? '' : 'container mx-auto px-6'}`}
      style={{ 
        paddingTop: `${paddingVal}px`, 
        paddingBottom: `${paddingVal}px`,
        backgroundColor: styles?.backgroundColor || 'transparent'
      }}
    >
      <div className={`space-y-12 ${isFullWidth ? '' : 'max-w-4xl mx-auto'}`}>
        {(title || subtitle) && (
          <div className="text-center space-y-4 px-6 max-w-2xl mx-auto">
            {title && <h2 className="text-4xl md:text-5xl font-headline font-light" style={{ color: styles?.titleColor || 'inherit' }}>{title}</h2>}
            {subtitle && <p className="text-muted-foreground font-light text-lg" style={{ color: styles?.subtitleColor || 'inherit' }}>{subtitle}</p>}
          </div>
        )}
        <div className={`relative aspect-video overflow-hidden bg-black ${isFullWidth ? '' : 'rounded-sm shadow-2xl'} ${!effectiveControls ? 'pointer-events-none' : ''}`}>
          {isYouTube ? (
            <div className={!effectiveControls ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%]' : 'absolute inset-0 w-full h-full'}>
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
              src={videoUrl} 
              autoPlay={autoplay} 
              loop={loop} 
              muted={effectiveMuted} 
              playsInline={true}
              controls={effectiveControls}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}
