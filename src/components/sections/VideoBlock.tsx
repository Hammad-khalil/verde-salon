
'use client';

interface VideoBlockProps {
  title?: string;
  subtitle?: string;
  videoUrl: string;
  isFullWidth?: boolean;
}

export default function VideoBlock({ title, subtitle, videoUrl, isFullWidth = true }: VideoBlockProps) {
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
          <iframe
            src={videoUrl.includes('youtube.com') ? videoUrl.replace('watch?v=', 'embed/') : videoUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={title || "Video content"}
          ></iframe>
        </div>
      </div>
    </section>
  );
}
