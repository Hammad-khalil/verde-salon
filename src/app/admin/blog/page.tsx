'use client';

import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function BlogAdmin() {
  const db = useFirestore();
  const blogQuery = useMemoFirebase(() => {
    return query(collection(db, 'blog_posts'), orderBy('publishedAt', 'desc'));
  }, [db]);

  const { data: posts, isLoading } = useCollection(blogQuery);

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this blog post?')) {
      deleteDocumentNonBlocking(doc(db, 'blog_posts', id));
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold">Blog Management</h1>
          <p className="text-muted-foreground mt-2">Manage your luxury insights and journals.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" asChild>
          <Link href="/admin/blog/new">
            <Plus className="w-4 h-4 mr-2" /> New Article
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
          <CardDescription>A list of all blog posts currently in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 text-center animate-pulse text-muted-foreground">Loading articles...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts?.map((post: any) => (
                  <TableRow key={post.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{post.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">/{post.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-none uppercase tracking-widest text-[10px]">
                        {post.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {post.isPublished ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-none text-[10px] uppercase font-bold tracking-widest">Live</Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-none text-[10px] uppercase font-bold tracking-widest">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-2 opacity-40" />
                        {post.publishedAt ? format(new Date(post.publishedAt), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/blog/${post.id}`}>
                          <Edit className="w-4 h-4 text-primary" />
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
                {posts?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                      No articles found. Start by creating a new one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
