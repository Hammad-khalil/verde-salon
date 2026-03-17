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
import { Plus, Edit, Trash2, Scissors, DollarSign, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function ServicesAdmin() {
  const db = useFirestore();
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
      isPublished: true
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(service: any) {
    setEditingService({ ...service });
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
  }

  function handleDelete(id: string) {
    if (confirm('Delete this service?')) {
      deleteDocumentNonBlocking(doc(db, 'services', id));
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold">Services Menu</h1>
          <p className="text-muted-foreground mt-2">Manage your signature rituals and pricing.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Service Inventory</CardTitle>
          <CardDescription>Configure the menu displayed on your website.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 text-center animate-pulse">Loading menu...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.map((service: any) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center overflow-hidden">
                           <Scissors className="w-4 h-4 text-primary/40" />
                        </div>
                        <div className="flex flex-col">
                          <span>{service.title}</span>
                          <span className="text-xs text-muted-foreground font-light line-clamp-1 max-w-[200px]">{service.description}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-none uppercase tracking-[0.2em] text-[10px] px-2">
                        {service.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-primary font-bold">{service.price}</TableCell>
                    <TableCell className="text-muted-foreground text-xs uppercase tracking-widest">{service.duration}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(service)}>
                        <Edit className="w-4 h-4 text-primary" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">{editingService?.id ? 'Edit Service' : 'New Service'}</DialogTitle>
            <DialogDescription>Fill in the details for your luxury service offering.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input 
                  value={editingService?.title || ''} 
                  onChange={(e) => setEditingService({...editingService, title: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={editingService?.category} 
                  onValueChange={(val) => setEditingService({...editingService, category: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hair">Hair</SelectItem>
                    <SelectItem value="Skin">Skin</SelectItem>
                    <SelectItem value="Nails">Nails</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={editingService?.description || ''} 
                onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (e.g., $80)</Label>
                <Input 
                  value={editingService?.price || ''} 
                  onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (e.g., 60 min)</Label>
                <Input 
                  value={editingService?.duration || ''} 
                  onChange={(e) => setEditingService({...editingService, duration: e.target.value})}
                  required 
                />
              </div>
            </div>

            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 px-8">Save Ritual</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
