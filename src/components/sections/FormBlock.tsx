'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  service: z.string().min(1, 'Please select a service'),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FormBlockProps {
  title: string;
  subtitle: string;
  type: 'Booking' | 'Contact';
}

export default function FormBlock({ title, subtitle, type }: FormBlockProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const servicesQuery = useMemoFirebase(() => collection(db, 'services'), [db]);
  const { data: services } = useCollection(servicesQuery);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: settings } = useDoc(settingsRef);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      service: '',
      message: '',
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const submissionId = doc(collection(db, 'form_submissions')).id;
      const payload = {
        ...data,
        id: submissionId,
        type: type || 'Booking',
        createdAt: new Date().toISOString(),
        status: 'New',
      };

      // Save to Firestore
      await setDoc(doc(db, 'form_submissions', submissionId), payload);

      // Trigger Webhook from CMS Settings
      const webhookUrl = settings?.integrations?.zapierWebhookUrl;
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          body: JSON.stringify(payload),
          mode: 'no-cors'
        }).catch(e => console.warn('Webhook dispatch failed', e));
      }

      setIsSuccess(true);
      toast({
        title: "Request Received",
        description: "A specialist will reach out shortly.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Please try again later or call us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <section id="book-now" className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-2xl text-center space-y-8 animate-fade-in">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
          <h2 className="text-4xl font-headline font-light">Thank You</h2>
          <p className="text-muted-foreground text-lg font-light">
            Your inquiry for Verde Salon has been received. We look forward to crafting your experience.
          </p>
          <Button variant="outline" onClick={() => setIsSuccess(false)} className="rounded-none">
            Send Another Request
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="book-now" className="py-32 bg-[#F9F9F9]">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-8">
            <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px]">{type}</span>
            <h2 className="text-5xl font-headline font-light leading-tight">{title}</h2>
            <p className="text-muted-foreground font-light text-lg leading-relaxed">
              {subtitle}
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-10 shadow-sm space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Full Name</Label>
              <Input 
                {...form.register('name')} 
                className="rounded-none border-0 border-b border-muted focus-visible:ring-0 focus-visible:border-primary px-0"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Email</Label>
                <Input {...form.register('email')} type="email" className="rounded-none border-0 border-b border-muted px-0" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Phone</Label>
                <Input {...form.register('phone')} className="rounded-none border-0 border-b border-muted px-0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Desired Ritual</Label>
              <Select onValueChange={(val) => form.setValue('service', val)}>
                <SelectTrigger className="rounded-none border-0 border-b border-muted px-0">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services?.map(s => <SelectItem key={s.id} value={s.title}>{s.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Details</Label>
              <Textarea {...form.register('message')} className="rounded-none border-0 border-b border-muted px-0 min-h-[100px]" />
            </div>
            <Button type="submit" className="w-full bg-primary py-8 uppercase tracking-[0.4em] text-[11px]" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Experience"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
