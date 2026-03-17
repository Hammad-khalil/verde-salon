'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials: TestimonialItem[];
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    name: 'Ayesha Khan',
    role: 'Regular Guest',
    content: 'Best salon experience ever! The attention to detail at Verde Salon is simply unmatched.',
    rating: 5
  },
  {
    id: '2',
    name: 'Sara Ali',
    role: 'Art Director',
    content: 'Incredible service and ambiance. A true sanctuary for those who appreciate natural beauty.',
    rating: 5
  },
  {
    id: '3',
    name: 'Hina Malik',
    role: 'Creative Consultant',
    content: 'My go-to place for self-care. Every visit leaves me feeling refreshed and inspired.',
    rating: 5
  }
];

export default function Testimonials({ 
  title = "Client Reflections", 
  subtitle = "Voices of Verde Salon",
  testimonials = DEFAULT_TESTIMONIALS 
}: TestimonialsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    duration: 30,
  });

  const displayTestimonials = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;

  return (
    <section className="py-32 bg-primary text-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <span className="text-accent font-bold uppercase tracking-[0.4em] text-[10px] opacity-70">
              {subtitle}
            </span>
            <h2 className="text-4xl md:text-5xl font-headline font-light">{title}</h2>
          </div>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {displayTestimonials.map((t) => (
                <div key={t.id} className="flex-[0_0_100%] min-w-0 px-4">
                  <div className="flex flex-col items-center text-center space-y-10">
                    <Quote className="w-12 h-12 text-accent opacity-30" />
                    <p className="text-2xl md:text-4xl font-headline font-light italic leading-relaxed max-w-3xl">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="pt-4">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent mb-2">
                        {t.name}
                      </h4>
                      <span className="text-background/40 text-[9px] uppercase tracking-[0.3em]">
                        {t.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slider Indicators */}
          <div className="flex justify-center space-x-3 mt-16">
            {displayTestimonials.map((_, index) => (
              <button
                key={index}
                className="w-2 h-2 rounded-full bg-accent/20 transition-all hover:bg-accent/50"
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
