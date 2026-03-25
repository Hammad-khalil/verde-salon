'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export default function CTA({ 
  title = "Ready for a transformation?", 
  subtitle = "Book your experience today at Verde Salon.", 
  buttonText = "Book Your Visit",
  buttonUrl = "/services#book-now"
}: CTAProps) {
  return (
    <section className="py-32 bg-primary text-primary-foreground overflow-hidden relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 border border-white/20 rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-3xl mx-auto space-y-10">
          <h2 className="text-4xl md:text-7xl font-headline font-light leading-tight tracking-tight">
            {title}
          </h2>
          <p className="text-xl text-primary-foreground/60 font-light max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          <div className="pt-8">
            <Button asChild className="bg-accent text-primary hover:bg-white hover:text-primary rounded-none px-16 py-8 text-[12px] font-bold tracking-[0.4em] uppercase transition-all duration-700 shadow-2xl group">
              <Link href={buttonUrl || '/services#book-now'} className="relative z-10 flex items-center">
                {buttonText}
                <ArrowRight className="ml-3 w-4 h-4 transition-transform duration-500 group-hover:translate-x-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
