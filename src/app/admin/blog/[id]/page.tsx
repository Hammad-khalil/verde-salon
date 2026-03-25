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
import { Save, ArrowLeft, Image as ImageIcon, Search, Upload, Trash2, Globe, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
    publishedAt: '',
    isPublished: false,
    imageUrl: '',
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  });

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (existingPost) {
      setPost(existingPost);
    } else if (isNew) {
      setPost((prev: any) => ({ 
        ...prev, 
        publishedAt: new Date().toISOString(),
        imageUrl: 'https://picsum.photos/seed/blog/1200/800'
      }));
    }
  }, [existingPost, isNew]);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    
    // Firestore Document Limit is 1MB. We store data twice (Draft + Live).
    const limit = 400000; // 400KB
    if (file.size > limit) {
      toast({ 
        variant: "destructive", 
        title: "File too large", 
        description: "Please use images under 400KB for internal storage, or use a Direct URL." 
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setPost({ ...post, imageUrl: result });
        toast({ title: "Image Uploaded", description: "Local asset processed for preview." });
      }
    };
    reader.readAsDataURL(file);
  };

  function handleSave() {
    if (!post.title) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a title." });
      return;
    }

    const blogId = isNew ? doc(collection(db, 'blog_posts')).id : id;
    const finalPost = {
      ...post,
      id: blogId,
      updatedAt: new Date().toISOString(),
      slug: (post.slug || post.title).toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    };

    setDocumentNonBlocking(doc(db, 'blog_posts', blogId), finalPost, { merge: true });
    
    toast({
      title: "Article Saved",
      description: "Changes have been stored in the database.",
    });

    if (isNew) {
      router.push(`/admin/blog/${blogId}`);
    }
  }

  if (isLoading && !isNew) return <div className="py-20 text-center animate-pulse font-headline text-primary tracking-widest">LOADING EDITOR...</div>;

  return (
    <div className="space-y-8 pb-32 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/admin/blog"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">{isNew ? 'Draft New Story' : 'Refine Article'}</h1>
            <p className="text-muted-foreground font-light">{post.title || 'Untitled Masterpiece'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-white px-4 py-2 border rounded-full">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Status</Label>
            <div className="flex items-center space-x-2">
              <span className={cn("text-[9px] font-bold uppercase", post.isPublished ? "text-emerald-600" : "text-amber-600")}>
                {post.isPublished ? 'Live' : 'Draft'}
              </span>
              <Switch 
                checked={post.isPublished} 
                onCheckedChange={(checked) => setPost({...post, isPublished: checked})} 
              />
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90 px-10 h-12 rounded-none shadow-xl" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Save Story
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-10">
          <Card className="border-none shadow-sm rounded-none">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-xl font-headline">Article Core</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Headline Title</Label>
                <Input 
                  className="text-3xl font-headline h-16 rounded-none border-0 border-b focus-visible:ring-0 focus-visible:border-primary px-0" 
                  value={post.title ?? ''} 
                  onChange={(e) => setPost({...post, title: e.target.value})}
                  placeholder="Enter a compelling title..." 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest opacity-50">URL Slug</Label>
                  <Input 
                    className="rounded-none h-12"
                    value={post.slug ?? ''} 
                    onChange={(e) => setPost({...post, slug: e.target.value})}
                    placeholder="e.g., summer-rituals" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Category</Label>
                  <Input 
                    className="rounded-none h-12"
                    value={post.category ?? ''} 
                    onChange={(e) => setPost({...post, category: e.target.value})}
                    placeholder="e.g., Hair Design" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Short Excerpt (Search Preview)</Label>
                <Textarea 
                  className="rounded-none min-h-[100px] text-sm leading-relaxed"
                  value={post.excerpt ?? ''} 
                  onChange={(e) => setPost({...post, excerpt: e.target.value})}
                  placeholder="Summarize the article for the listing page..." 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Story Content (Rich Text)</Label>
                <Textarea 
                  className="min-h-[600px] font-body text-lg leading-relaxed rounded-none border-primary/5 focus-visible:ring-primary/10" 
                  value={post.content ?? ''} 
                  onChange={(e) => setPost({...post, content: e.target.value})}
                  placeholder="Begin your narrative here..." 
                />
                <p className="text-[10px] text-muted-foreground italic">Tip: Use # for H1, ## for H2, and * for lists.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-10">
          {/* Media Engine */}
          <Card className="border-none shadow-sm rounded-none overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-headline flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2 text-primary" /> Cover Media
                </CardTitle>
                <div className="group relative">
                  <Info className="w-4 h-4 text-muted-foreground/40 cursor-help" />
                  <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-black text-white text-[8px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Max file size: 400KB. Larger files will fail to save.
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div 
                className={cn(
                  "relative aspect-video bg-muted border-2 border-dashed rounded-none transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden",
                  isDragging ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/20"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  handleFileUpload(file);
                }}
                onClick={() => document.getElementById('blog-upload')?.click()}
              >
                {post.imageUrl ? (
                  <div className="relative w-full h-full group">
                    <Image src={post.imageUrl} className="w-full h-full object-cover" alt="Preview" fill sizes="33vw" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                      <Upload className="w-6 h-6 text-white mb-2" />
                      <p className="text-[10px] text-white font-bold uppercase tracking-widest">Replace Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3 opacity-40">
                    <Upload className="w-8 h-8" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Drop local file here</p>
                  </div>
                )}
                <input id="blog-upload" type="file" className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }} />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold opacity-40">Image Path / URL</Label>
                <Input 
                  className="h-10 text-[10px] font-mono rounded-none"
                  value={post.imageUrl?.startsWith('data:') ? 'Local Asset Uploaded' : (post.imageUrl ?? '')} 
                  onChange={(e) => setPost({...post, imageUrl: e.target.value})}
                  placeholder="External URL" 
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO & Config */}
          <Card className="border-none shadow-sm rounded-none">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg font-headline flex items-center">
                <Search className="w-4 h-4 mr-2 text-primary" /> Search Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold opacity-50">Meta Title</Label>
                <Input 
                  className="rounded-none"
                  value={post.seo?.title ?? ''} 
                  onChange={(e) => setPost({...post, seo: {...post.seo, title: e.target.value}})}
                  placeholder="Google search title" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold opacity-50">Meta Description</Label>
                <Textarea 
                  className="text-xs rounded-none min-h-[100px]"
                  value={post.seo?.description ?? ''} 
                  onChange={(e) => setPost({...post, seo: {...post.seo, description: e.target.value}})}
                  placeholder="Search engine summary" 
                />
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-40">
                  <span>Author</span>
                  <span>{post.author}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
