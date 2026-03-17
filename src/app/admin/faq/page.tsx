'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, HelpCircle, Save, Sparkles } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

export default function FaqAdmin() {
  const db = useFirestore();
  const { toast } = useToast();
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  const faqQuery = useMemoFirebase(() => {
    return query(collection(db, 'faqs'), orderBy('question', 'asc'));
  }, [db]);

  const { data: faqs, isLoading } = useCollection(faqQuery);

  function handleAdd() {
    if (!newFaq.question || !newFaq.answer) return;
    const id = doc(collection(db, 'faqs')).id;
    setDocumentNonBlocking(doc(db, 'faqs', id), {
      ...newFaq,
      id
    }, { merge: true });
    setNewFaq({ question: '', answer: '' });
    toast({ title: "Added", description: "FAQ successfully created." });
  }

  function handleSeedSampleData() {
    const samples = [
      { question: "What are your working hours?", answer: "We are open Tuesday through Friday from 10am to 8pm, and Saturdays from 9am to 6pm. We are closed on Sundays and Mondays." },
      { question: "Do I need an appointment?", answer: "While we sometimes have availability for walk-ins, we highly recommend booking in advance to ensure your preferred specialist is available." },
      { question: "What products do you use?", answer: "We exclusively use sustainable, high-performance botanical brands that are cruelty-free and ethically sourced." },
      { question: "Do you offer gift cards?", answer: "Yes, we offer both physical and digital gift cards for any value or specific ritual. They can be purchased in-studio or via phone." },
      { question: "Is there parking available?", answer: "Yes, complimentary client parking is available in the private lot directly behind the studio building." }
    ];

    samples.forEach(sample => {
      const id = doc(collection(db, 'faqs')).id;
      setDocumentNonBlocking(doc(db, 'faqs', id), { ...sample, id }, { merge: true });
    });

    toast({ title: "Success", description: "Sample FAQs generated." });
  }

  function handleDelete(id: string) {
    if (confirm('Delete this FAQ?')) {
      deleteDocumentNonBlocking(doc(db, 'faqs', id));
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mt-2">Manage the salon's knowledge base.</p>
        </div>
        <Button variant="outline" className="border-primary/20" onClick={handleSeedSampleData}>
          <Sparkles className="w-4 h-4 mr-2" /> Seed Samples
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-sm sticky top-10">
            <CardHeader>
              <CardTitle>Add New FAQ</CardTitle>
              <CardDescription>Common queries and expert answers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input 
                  placeholder="e.g., Do you offer bridal packages?" 
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea 
                  className="min-h-[150px]"
                  placeholder="Provide a concise and helpful answer..." 
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" /> Add to List
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center space-x-2 text-primary">
            <HelpCircle className="w-5 h-5" />
            <h2 className="text-xl font-headline">Active FAQs ({faqs?.length || 0})</h2>
          </div>

          {isLoading ? (
            <div className="py-20 text-center animate-pulse">Loading FAQs...</div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs?.map((faq: any) => (
                <AccordionItem key={faq.id} value={faq.id} className="bg-white border-none shadow-sm px-6 group">
                  <div className="flex items-center justify-between">
                    <AccordionTrigger className="text-left font-headline text-lg py-6 hover:no-underline flex-grow">
                      {faq.question}
                    </AccordionTrigger>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(faq.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6 pt-0">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
              {faqs?.length === 0 && (
                <div className="py-20 text-center text-muted-foreground bg-white rounded-lg border-2 border-dashed border-muted">
                  Your knowledge base is empty. Click 'Seed Samples' to populate it.
                </div>
              )}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}
