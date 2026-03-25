'use client';

import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, ExternalLink, Calendar, Search, FileText } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function BlogAdmin() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const blogQuery = useMemoFirebase(() => {
    return query(collection(db, 'blog_posts'), orderBy('publishedAt', 'desc'));
  }, [db]);

  const { data: posts, isLoading } = useCollection(blogQuery);

  const filteredPosts = posts?.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to permanently delete this article?')) {
      deleteDocumentNonBlocking(doc(db, 'blog_posts', id));
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Strategy */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">Journal Management</h1>
          <p className="text-muted-foreground mt-2 font-light">Craft and publish luxury narratives for Verde Salon.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 h-12 px-10 rounded-none shadow-lg" asChild>
          <Link href="/admin/blog/new">
            <Plus className="w-4 h-4 mr-2" /> Draft New Story
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Search & Filter Bar */}
        <div className="flex items-center space-x-4 max-w-md bg-white border p-1 rounded-sm shadow-sm">
          <div className="pl-4"><Search className="w-4 h-4 text-muted-foreground" /></div>
          <Input 
            placeholder="Search stories or categories..." 
            className="border-none focus-visible:ring-0 text-sm h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card className="border-none shadow-sm rounded-none overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-xl font-headline">Editorial Library</CardTitle>
            <CardDescription>A complete collection of your brand reflections and stories.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-24 text-center animate-pulse font-headline text-primary tracking-widest uppercase">Syncing Library...</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow>
                    <TableHead className="px-8 h-12 uppercase tracking-widest text-[9px] font-bold">Story Details</TableHead>
                    <TableHead className="h-12 uppercase tracking-widest text-[9px] font-bold">Classification</TableHead>
                    <TableHead className="h-12 uppercase tracking-widest text-[9px] font-bold">Status</TableHead>
                    <TableHead className="h-12 uppercase tracking-widest text-[9px] font-bold">Publication</TableHead>
                    <TableHead className="text-right px-8 h-12 uppercase tracking-widest text-[9px] font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts?.map((post: any) => (
                    <TableRow key={post.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-slate-100 overflow-hidden border border-primary/5 flex items-center justify-center">
                            {post.imageUrl ? (
                              <img src={post.imageUrl} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <FileText className="w-5 h-5 text-primary/20" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-headline font-bold text-lg">{post.title}</span>
                            <span className="text-[10px] text-muted-foreground font-mono opacity-60">/{post.slug}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-none uppercase tracking-[0.2em] text-[9px] px-3 py-1 bg-white border-primary/10">
                          {post.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {post.isPublished ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none rounded-none text-[9px] uppercase font-bold tracking-widest px-3 py-1">Live</Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-none text-[9px] uppercase font-bold tracking-widest px-3 py-1 opacity-40">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-light">
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-2 opacity-30 text-accent" />
                          {post.publishedAt ? format(new Date(post.publishedAt), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8 space-x-2">
                        <Button variant="ghost" size="icon" asChild className="hover:bg-primary/5 text-primary">
                          <Link href={`/admin/blog/${post.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild className="hover:bg-slate-100">
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/5"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filteredPosts || filteredPosts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-32 text-center text-muted-foreground font-light italic">
                        No stories found in the library. Start by drafting a new one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
