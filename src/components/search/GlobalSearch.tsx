'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, X, Scissors, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const db = useFirestore();

  const servicesQuery = useMemoFirebase(() => collection(db, 'services'), [db]);
  const blogQuery = useMemoFirebase(() => collection(db, 'blog_posts'), [db]);

  const { data: allServices } = useCollection(servicesQuery);
  const { data: allBlogs } = useCollection(blogQuery);

  const filteredServices = allServices?.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 3) || [];

  const filteredBlogs = allBlogs?.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 3) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Global Search</DialogTitle>
          <DialogDescription>Search for rituals, blogs, and salon information.</DialogDescription>
        </DialogHeader>
        <div className="bg-white p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search rituals, blogs, or expertise..."
              className="pl-12 h-16 text-xl font-headline border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary px-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={onClose} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {searchTerm.length > 0 ? (
              <>
                {/* Services Results */}
                {filteredServices.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 px-2">Signature Rituals</h3>
                    <div className="grid gap-2">
                      {filteredServices.map(service => (
                        <Link 
                          key={service.id} 
                          href="/services" 
                          onClick={onClose}
                          className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/5 flex items-center justify-center">
                              <Scissors className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-headline text-lg leading-none">{service.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{service.category}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blog Results */}
                {filteredBlogs.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 px-2">Blogs</h3>
                    <div className="grid gap-2">
                      {filteredBlogs.map(post => (
                        <Link 
                          key={post.id} 
                          href={`/blog/${post.slug}`} 
                          onClick={onClose}
                          className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/5 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-headline text-lg leading-none">{post.title}</p>
                              <Badge variant="outline" className="mt-1 text-[9px] font-light tracking-widest uppercase h-4 px-1 rounded-none">
                                {post.category}
                              </Badge>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {filteredServices.length === 0 && filteredBlogs.length === 0 && (
                  <div className="py-20 text-center space-y-4">
                    <p className="font-headline text-2xl text-muted-foreground">No matches found for "{searchTerm}"</p>
                    <p className="text-sm text-muted-foreground font-light">Try searching for 'Hair', 'Skin', or 'Care'</p>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center space-y-4 opacity-40">
                <Search className="w-12 h-12 mx-auto" />
                <p className="font-headline text-2xl">Begin typing to discover...</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
