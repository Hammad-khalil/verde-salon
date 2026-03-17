'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, ArrowLeft, Image as ImageIcon, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function BlogPostEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const isNew = id === 'new';
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const blogRef = useMemoFirebase(() => {
    return isNew ? null : doc(db, 'blog_posts', id);
  }, [db, id, isNew]);

  const { data: existingPost, isLoading } = useDoc(blogRef);
  const [post, setPost] = useState<any>({
    title: '',
    slug: '',
    category: 'Hair',
    excerpt: '',
    content: '',
    author: 'Elena Verde',
    publishedAt: new Date().toISOString(),
    isPublished: false,
    imageUrl: 'https://picsum.photos/seed/blog/800/600',
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  });

  useEffect(() => {
    if (existingPost) {
      setPost(existingPost);
    }
  }, [existingPost]);

  function handleSave() {
    const blogId = isNew ? doc(collection(db, 'blog_posts')).id : id;
    const finalPost = {
      ...post,
      id: blogId,
      updatedAt: new Date().toISOString(),
      slug: post.slug || post.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    };

    setDocumentNonBlocking(doc(db, 'blog_posts', blogId), finalPost, { merge: true });
    
    toast({
      title: "Success",
      description: "Article saved successfully.",
    });

    if (isNew) {
      router.push(`/admin/blog/${blogId}`);
    }
  }

  if (isLoading && !isNew) return <div className="py-20 text-center animate-pulse">Loading article editor...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-headline font-bold">{isNew ? 'New Article' : 'Edit Article'}</h1>
            <p className="text-muted-foreground">{post.title || 'Drafting a new masterpiece'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 mr-4">
            <Label className="text-xs uppercase tracking-widest font-bold">Published</Label>
            <Switch 
              checked={post.isPublished} 
              onCheckedChange={(checked) => setPost({...post, isPublished: checked})} 
            />
          </div>
          <Button className="bg-primary hover:bg-primary/90 px-8" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Save Article
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Headline Title</Label>
                <Input 
                  className="text-2xl font-headline h-14" 
                  value={post.title} 
                  onChange={(e) => setPost({...post, title: e.target.value})}
                  placeholder="Enter a compelling title..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input 
                    value={post.slug} 
                    onChange={(e) => setPost({...post, slug: e.target.value})}
                    placeholder="e.g., summer-rituals" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input 
                    value={post.category} 
                    onChange={(e) => setPost({...post, category: e.target.value})}
                    placeholder="e.g., Hair Care" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Excerpt (Summary)</Label>
                <Textarea 
                  value={post.excerpt} 
                  onChange={(e) => setPost({...post, excerpt: e.target.value})}
                  placeholder="A brief summary for the listing page..." 
                />
              </div>
              <div className="space-y-2">
                <Label>Main Content</Label>
                <Textarea 
                  className="min-h-[400px] font-body text-lg leading-relaxed" 
                  value={post.content} 
                  onChange={(e) => setPost({...post, content: e.target.value})}
                  placeholder="Tell your story..." 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" /> Featured Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted border-2 border-dashed rounded-lg flex items-center justify-center relative overflow-hidden">
                {post.imageUrl ? (
                  <Image src={post.imageUrl} className="w-full h-full object-cover" alt="Preview" fill sizes="(max-width: 768px) 100vw, 33vw" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                )}
              </div>
              <Input 
                value={post.imageUrl} 
                onChange={(e) => setPost({...post, imageUrl: e.target.value})}
                placeholder="Image URL" 
              />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Search className="w-4 h-4 mr-2" /> SEO Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Meta Title</Label>
                <Input 
                  value={post.seo?.title || ''} 
                  onChange={(e) => setPost({...post, seo: {...post.seo, title: e.target.value}})}
                  placeholder="Search engine title" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Meta Description</Label>
                <Textarea 
                  className="text-xs"
                  value={post.seo?.description || ''} 
                  onChange={(e) => setPost({...post, seo: {...post.seo, description: e.target.value}})}
                  placeholder="Search engine summary" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
