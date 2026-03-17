
'use client';

interface VideoBlockProps {
  title?: string;
  subtitle?: string;
  videoUrl: string;
  isFullWidth?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export default function VideoBlock({ 
  title, 
  subtitle, 
  videoUrl, 
  isFullWidth = true,
  autoplay = false,
  loop = true,
  muted = true
}: VideoBlockProps) {
  // Simple check for Direct vs YouTube
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  
  let finalUrl = videoUrl;
  if (isYouTube) {
    const videoId = videoUrl.includes('watch?v=') ? videoUrl.split('v=')[1]?.split('&')[0] : videoUrl.split('/').pop();
    finalUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&playlist=${videoId}`;
  }

  return (
    <section className={`py-24 bg-background ${isFullWidth ? '' : 'container mx-auto px-6'}`}>
      <div className={`space-y-12 ${isFullWidth ? '' : 'max-w-4xl mx-auto'}`}>
        {(title || subtitle) && (
          <div className="text-center space-y-4 px-6">
            {title && <h2 className="text-4xl md:text-5xl font-headline font-light">{title}</h2>}
            {subtitle && <p className="text-muted-foreground font-light">{subtitle}</p>}
          </div>
        )}
        <div className={`relative aspect-video overflow-hidden ${isFullWidth ? '' : 'rounded-sm shadow-xl'}`}>
          {isYouTube ? (
            <iframe
              src={finalUrl}
              className="absolute inset-0 w-full h-full border-none"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={title || "Video content"}
            ></iframe>
          ) : (
            <video 
              src={videoUrl} 
              autoPlay={autoplay} 
              loop={loop} 
              muted={muted} 
              controls={!autoplay}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}
