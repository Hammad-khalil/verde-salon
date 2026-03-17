'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEOManager from '@/components/seo/SEOManager';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const db = useFirestore();
  
  const pageRef = useMemoFirebase(() => doc(db, 'cms_pages', 'services'), [db]);
  const { data: pageData } = useDoc(pageRef);

  const servicesQuery = useMemoFirebase(() => query(collection(db, 'services'), orderBy('category', 'asc')), [db]);
  const { data: services, isLoading: servicesLoading } = useCollection(servicesQuery);

  const faqsQuery = useMemoFirebase(() => collection(db, 'faqs'), [db]);
  const { data: faqs } = useCollection(faqsQuery);

  const categories = Array.from(new Set(services?.map(s => s.category) || ['Hair', 'Skin', 'Nails', 'Spa']));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOManager 
        title={pageData?.seo?.title || "Signature Rituals | Verde Salon"}
        description={pageData?.seo?.description || "Explore our curated menu of hair, skin, and nail rituals at Verde Salon."}
        keywords={pageData?.seo?.keywords}
      />
      <Navbar />
      
      <main className="flex-grow pt-40">
        {/* Page Header */}
        <section className="container mx-auto px-6 mb-32">
          <div className="max-w-4xl space-y-8">
            <div className="space-y-4">
              <span className="text-accent font-bold uppercase tracking-[0.5em] text-[11px] block animate-fade-in opacity-70">
                The Menu
              </span>
              <h1 className="text-6xl md:text-8xl font-headline font-light leading-[1.1] text-primary tracking-tight">
                Services
              </h1>
              <div className="h-[1px] w-20 bg-accent/40" />
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl tracking-wide">
              Our specialists at Verde Salon blend timeless techniques with contemporary science to create results that are uniquely yours.
            </p>
          </div>
        </section>

        {servicesLoading ? (
          <div className="py-20 text-center animate-pulse font-headline text-primary uppercase tracking-widest">
            Assembling Rituals...
          </div>
        ) : (
          <>
            {/* Categories Navigation */}
            <section className="container mx-auto px-6 mb-24 border-b border-primary/10 pb-10">
              <div className="flex flex-wrap gap-x-12 gap-y-4 items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mr-4">Filter By</span>
                {categories.map((cat) => (
                  <a 
                    key={cat} 
                    href={`#${cat.toLowerCase().replace(' ', '-')}`} 
                    className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary/40 hover:text-accent transition-all duration-300"
                  >
                    {cat}
                  </a>
                ))}
              </div>
            </section>

            {/* Service List by Category */}
            <section className="container mx-auto px-6 space-y-48 mb-48">
              {categories.map((category) => (
                <div key={category} id={category.toLowerCase().replace(' ', '-')} className="space-y-20 scroll-mt-40">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Sparkles className="w-4 h-4 text-accent/60" />
                      <h2 className="text-4xl md:text-5xl font-headline font-light text-primary">{category}</h2>
                    </div>
                    <div className="h-[1px] w-12 bg-accent/20" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-32">
                    {services?.filter(s => s.category === category).map((service) => (
                      <div key={service.id} className="group space-y-8">
                        <div className="relative aspect-[4/5] overflow-hidden shadow-2xl">
                          <Image 
                            src={service.imageUrl || 'https://picsum.photos/seed/verde-ritual/800/1000'} 
                            alt={service.title} 
                            fill 
                            className="object-cover grayscale-[0.3] transition-transform duration-[2s] group-hover:scale-105 group-hover:grayscale-0" 
                          />
                          <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-700" />
                        </div>
                        <div className="space-y-6">
                          <div className="flex justify-between items-baseline border-b border-primary/10 pb-4">
                            <h3 className="text-2xl md:text-3xl font-headline font-light text-primary group-hover:text-accent transition-colors duration-500">{service.title}</h3>
                            <span className="text-lg font-headline font-light text-accent">{service.price}</span>
                          </div>
                          <p className="text-muted-foreground font-light leading-relaxed tracking-wide text-lg">
                            {service.description}
                          </p>
                          <div className="flex items-center justify-between pt-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Duration: {service.duration}</span>
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-[11px] font-bold uppercase tracking-[0.3em] text-accent hover:text-primary transition-colors group/btn"
                            >
                              Reserve Now <ArrowRight className="ml-2 w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!services || services.filter(s => s.category === category).length === 0) && (
                      <div className="col-span-full py-20 text-center border-2 border-dashed border-primary/5 rounded-sm">
                        <p className="font-headline text-xl text-muted-foreground/40 italic">New rituals coming soon to {category} care.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

        {/* Global CTA */}
        <section className="py-32 bg-primary text-background overflow-hidden relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-3xl mx-auto space-y-10">
              <h2 className="text-4xl md:text-7xl font-headline font-light leading-tight tracking-tight">
                Experience Verde Salon
              </h2>
              <p className="text-xl text-background/60 font-light max-w-xl mx-auto leading-relaxed">
                Step into a world where beauty is an intentional ritual. Book your sanctuary visit today.
              </p>
              <div className="pt-8">
                <Button className="bg-accent text-primary hover:bg-white hover:text-primary rounded-none px-16 py-8 text-[12px] font-bold tracking-[0.4em] uppercase transition-all duration-700 shadow-2xl group">
                  <span className="relative z-10 flex items-center">
                    Book Appointment
                    <ArrowRight className="ml-3 w-4 h-4 transition-transform duration-500 group-hover:translate-x-2" />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Knowledge Base */}
        {faqs && faqs.length > 0 && (
          <section className="bg-muted/30 py-32 border-t border-primary/5">
            <div className="container mx-auto px-6 max-w-4xl">
              <div className="text-center mb-24 space-y-4">
                <span className="text-accent font-bold uppercase tracking-[0.4em] text-[10px] block">Information</span>
                <h2 className="text-4xl md:text-5xl font-headline font-light text-primary">Knowledge Base</h2>
              </div>
              <Accordion type="single" collapsible className="w-full space-y-6">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border-none bg-white px-10 shadow-sm transition-all duration-300">
                    <AccordionTrigger className="text-xl md:text-2xl font-headline font-light text-primary hover:no-underline py-8">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-lg font-light leading-relaxed pb-8">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
