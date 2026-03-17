'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
}

export default function FAQSection({ title = "Frequently Asked Questions", subtitle = "Information for your visit" }: FAQSectionProps) {
  const db = useFirestore();
  const faqQuery = useMemoFirebase(() => query(collection(db, 'faqs'), orderBy('question', 'asc')), [db]);
  const { data: faqs, isLoading } = useCollection(faqQuery);

  if (isLoading) return <div className="py-20 text-center animate-pulse font-headline text-primary">Loading FAQs...</div>;
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="bg-[#F8F8F8] py-32">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-24 space-y-4">
          <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px]">{subtitle}</span>
          <h2 className="text-4xl md:text-5xl font-headline font-light">{title}</h2>
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
  );
}
