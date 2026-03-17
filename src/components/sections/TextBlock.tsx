'use client';

interface TextBlockProps {
  title: string;
  content: string;
  alignment?: 'left' | 'center';
}

export default function TextBlock({ title, content, alignment = 'center' }: TextBlockProps) {
  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className={`max-w-4xl mx-auto space-y-10 ${alignment === 'center' ? 'text-center' : 'text-left'}`}>
          <h2 className="text-4xl md:text-6xl font-headline font-light leading-tight text-primary">
            {title}
          </h2>
          <div className={`h-[1px] w-20 bg-accent/40 ${alignment === 'center' ? 'mx-auto' : ''}`} />
          <p className="text-lg md:text-xl font-light leading-relaxed text-muted-foreground tracking-wide">
            {content}
          </p>
        </div>
      </div>
    </section>
  );
}
