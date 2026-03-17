'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Quote, User, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function TestimonialsAdmin() {
  const db = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);

  const testimonialQuery = useMemoFirebase(() => {
    return query(collection(db, 'testimonials'), orderBy('name', 'asc'));
  }, [db]);

  const { data: testimonials, isLoading } = useCollection(testimonialQuery);

  function openCreateDialog() {
    setEditingTestimonial({
      id: '',
      name: '',
      role: '',
      content: '',
      rating: 5
    });
    setIsDialogOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const id = editingTestimonial.id || doc(collection(db, 'testimonials')).id;
    setDocumentNonBlocking(doc(db, 'testimonials', id), {
      ...editingTestimonial,
      id
    }, { merge: true });
    setIsDialogOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm('Delete this testimonial?')) {
      deleteDocumentNonBlocking(doc(db, 'testimonials', id));
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold">Client Testimonials</h1>
          <p className="text-muted-foreground mt-2">Manage reviews that build trust and elegance.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" /> Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center animate-pulse">Loading testimonials...</div>
        ) : (
          testimonials?.map((t: any) => (
            <Card key={t.id} className="border-none shadow-sm relative group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-headline">{t.name}</CardTitle>
                      <CardDescription className="text-[10px] uppercase tracking-widest">{t.role}</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Quote className="w-4 h-4 text-primary/20 mb-2" />
                <p className="text-sm text-muted-foreground font-light leading-relaxed italic">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="mt-6 pt-4 border-t border-muted flex justify-end">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive h-8 w-8 hover:bg-destructive/5"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        {testimonials?.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-lg border-2 border-dashed border-muted text-muted-foreground">
             No testimonials yet. Share what your clients are saying!
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">New Testimonial</DialogTitle>
            <DialogDescription>Capture the voice of your radiant clients.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input 
                  value={editingTestimonial?.name || ''} 
                  onChange={(e) => setEditingTestimonial({...editingTestimonial, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Client Role/Title</Label>
                <Input 
                  value={editingTestimonial?.role || ''} 
                  onChange={(e) => setEditingTestimonial({...editingTestimonial, role: e.target.value})}
                  placeholder="e.g., Regular Guest" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Testimonial Content</Label>
              <Textarea 
                value={editingTestimonial?.content || ''} 
                onChange={(e) => setEditingTestimonial({...editingTestimonial, content: e.target.value})}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>Rating (1-5)</Label>
              <Input 
                type="number" 
                min="1" 
                max="5"
                value={editingTestimonial?.rating || 5} 
                onChange={(e) => setEditingTestimonial({...editingTestimonial, rating: parseInt(e.target.value)})}
              />
            </div>

            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 px-8">Add Voice</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
