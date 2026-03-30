
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Scissors, Image as ImageIcon, Upload, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function ServicesAdmin() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  
  const servicesQuery = useMemoFirebase(() => {
    return query(collection(db, 'services'), orderBy('category', 'asc'));
  }, [db]);

  const { data: services, isLoading } = useCollection(servicesQuery);

  function openCreateDialog() {
    setEditingService({
      id: '',
      title: '',
      category: 'Hair',
      description: '',
      price: '',
      duration: '',
      imageUrl: 'https://picsum.photos/seed/service/800/600',
      imageUrlAlt: '',
      isPublished: true
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(service: any) {
    setEditingService({ ...service, imageUrlAlt: service.imageUrlAlt ?? '' });
    setIsDialogOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const serviceId = editingService.id || doc(collection(db, 'services')).id;
    setDocumentNonBlocking(doc(db, 'services', serviceId), {
      ...editingService,
      id: serviceId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    setIsDialogOpen(false);
    toast({ title: "Service Saved", description: "Your sanctuary menu has been updated." });
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteDocumentNonBlocking(doc(db, 'services', id));
      toast({ title: "Service Removed" });
    }
  }

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const limit = 400000; // 400KB
    if (file.size > limit) {
      toast({ 
        variant: "destructive", 
        title: "Database Limit", 
        description: "Image too large. Please use an asset under 400KB." 
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setEditingService({ ...editingService, imageUrl: e.target.result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold">Service Architecture</h1>
          <p className="text-muted-foreground mt-2">Manage the artisan menu offered at Verde Salon.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 rounded-none px-8 h-12" onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" /> New Service
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-none overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-xl font-headline">Service Inventory</CardTitle>
          <CardDescription>Configure the detailed menu displayed on your website.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center animate-pulse text-muted-foreground uppercase tracking-widest text-xs">Synchronizing Menu...</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead className="px-8 h-12 uppercase tracking-widest text-[9px] font-bold">Service</TableHead>
                  <TableHead className="h-12 uppercase tracking-widest text-[9px] font-bold">Category</TableHead>
                  <TableHead className="h-12 uppercase tracking-widest text-[9px] font-bold">Price</TableHead>
                  <TableHead className="h-12 uppercase tracking-widest text-[9px] font-bold">Duration</TableHead>
                  <TableHead className="text-right px-8 h-12 uppercase tracking-widest text-[9px] font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.map((service: any) => (
                  <TableRow key={service.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-sm bg-muted flex items-center justify-center overflow-hidden border border-primary/5">
                           {service.imageUrl ? (
                             <img src={service.imageUrl} className="w-full h-full object-cover" alt="" />
                           ) : (
                             <Scissors className="w-5 h-5 text-primary/20" />
                           )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-headline font-bold text-lg">{service.title ?? ''}</span>
                          <span className="text-xs text-muted-foreground font-light line-clamp-1 max-w-[300px]">{service.description ?? ''}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-none uppercase tracking-[0.2em] text-[10px] px-3 py-1 bg-white border-primary/10">
                        {service.category ?? ''}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-primary font-bold">{service.price ?? ''}</TableCell>
                    <TableCell className="text-muted-foreground text-xs uppercase tracking-widest">{service.duration ?? ''}</TableCell>
                    <TableCell className="text-right px-8 space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(service)} className="hover:bg-primary/5 text-primary">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/5"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-none shadow-2xl">
          <DialogHeader className="p-8 border-b bg-primary text-white space-y-1">
            <DialogTitle className="text-3xl font-headline font-bold tracking-tight">{editingService?.id ? 'Refine Service' : 'New Service'}</DialogTitle>
            <DialogDescription className="text-white/60 uppercase tracking-widest text-[10px] font-bold">Artisan Menu Configuration</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="p-8 space-y-8 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Service Name</Label>
                <Input 
                  value={editingService?.title ?? ''} 
                  onChange={(e) => setEditingService({...editingService, title: e.target.value})}
                  className="rounded-none border-primary/10 h-12"
                  placeholder="e.g., Signature Balayage"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Category</Label>
                <Select 
                  value={editingService?.category ?? 'Hair'} 
                  onValueChange={(val) => setEditingService({...editingService, category: val})}
                >
                  <SelectTrigger className="rounded-none border-primary/10 h-12">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="Hair">Hair Design</SelectItem>
                    <SelectItem value="Skin">Skincare</SelectItem>
                    <SelectItem value="Nails">Nail Artistry</SelectItem>
                    <SelectItem value="Wellness">Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Media Asset</Label>
                <Info className="w-3.5 h-3.5 text-muted-foreground/40 cursor-help" />
              </div>
              <div className="flex items-center space-x-6 bg-slate-50 p-4 border border-dashed border-primary/10">
                <div className="w-24 h-24 bg-white border flex items-center justify-center relative group overflow-hidden">
                  {editingService?.imageUrl ? (
                    <img src={editingService.imageUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-primary/20" />
                  )}
                  <div 
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                    onClick={() => document.getElementById('service-upload')?.click()}
                  >
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-grow space-y-2">
                  <Input 
                    value={editingService?.imageUrl?.startsWith('data:') ? 'Local Asset' : (editingService?.imageUrl ?? '')} 
                    onChange={(e) => setEditingService({...editingService, imageUrl: e.target.value})}
                    placeholder="External Image URL"
                    className="rounded-none h-10 text-xs border-primary/5"
                  />
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase opacity-40 font-bold">Image Alt Text (SEO)</Label>
                    <Input 
                      value={editingService?.imageUrlAlt ?? ''} 
                      onChange={(e) => setEditingService({...editingService, imageUrlAlt: e.target.value})}
                      placeholder="Describe this service image..."
                      className="rounded-none h-8 text-[10px] border-primary/5"
                    />
                  </div>
                </div>
                <input id="service-upload" type="file" className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Description</Label>
              <Textarea 
                value={editingService?.description ?? ''} 
                onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                className="rounded-none border-primary/10 min-h-[120px] text-sm leading-relaxed"
                placeholder="Describe the service experience..."
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Price Profile</Label>
                <Input 
                  value={editingService?.price ?? ''} 
                  onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                  className="rounded-none border-primary/10 h-12 font-mono"
                  placeholder="e.g., $120+"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Duration Profile</Label>
                <Input 
                  value={editingService?.duration ?? ''} 
                  onChange={(e) => setEditingService({...editingService, duration: e.target.value})}
                  className="rounded-none border-primary/10 h-12"
                  placeholder="e.g., 90 min"
                  required 
                />
              </div>
            </div>

            <DialogFooter className="pt-6 border-t mt-8 sticky bottom-0 bg-white">
              <Button type="button" variant="ghost" className="rounded-none uppercase tracking-widest text-[10px] font-bold" onClick={() => setIsDialogOpen(false)}>Discard</Button>
              <Button type="submit" className="bg-primary hover:bg-accent text-white rounded-none px-12 h-14 uppercase tracking-[0.2em] text-[11px] font-bold shadow-xl transition-all duration-500">
                Update Menu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
