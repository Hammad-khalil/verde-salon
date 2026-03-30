
'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Save, 
  ArrowLeft, 
  Image as ImageIcon, 
  Search, 
  Upload, 
  Trash2, 
  Globe, 
  Info,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Type
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * Custom Rich Text Editor for premium blog editing.
 */
const RichTextEditor = ({ value, onChange, onImageUpload }: { value: string, onChange: (val: string) => void, onImageUpload: (file: File) => void }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Sync only once on mount to prevent cursor reset, or check if value is vastly different
      if (!editorRef.current.innerHTML && value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  return (
    <div className="border border-slate-200 rounded-none overflow-hidden">
      <div className="bg-slate-50 border-b p-2 flex flex-wrap gap-1">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => exec('bold')} title="Bold"><Bold className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => exec('italic')} title="Italic"><Italic className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => exec('underline')} title="Underline"><Underline className="w-4 h-4" /></Button>
        <div className="w-px h-4 bg-slate-300 mx-1 self-center" />
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => exec('formatBlock', 'H1')} title="Heading 1"><span className="text-[10px] font-bold">H1</span></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => exec('formatBlock', 'H2')} title="Heading 2"><span className="text-[10px] font-bold">H2</span></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => exec('formatBlock', 'P')} title="Paragraph"><Type className="w-4 h-4" /></Button>
        <div className="w-px h-4 bg-slate-300 mx-1 self-center" />
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => exec('insertUnorderedList')} title="Unordered List"><List className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => exec('insertOrderedList')} title="Ordered List"><ListOrdered className="w-4 h-4" /></Button>
        <div className="w-px h-4 bg-slate-300 mx-1 self-center" />
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
          const url = prompt('Enter URL:');
          if (url) exec('createLink', url);
        }} title="Insert Link"><LinkIcon className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) onImageUpload(file);
          };
          input.click();
        }} title="Insert Image"><ImageIcon className="w-4 h-4" /></Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="p-6 min-h-[500px] focus:outline-none bg-white font-body text-lg leading-relaxed prose max-w-none"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
};

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
    imageAlt: '',
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  });

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (existingPost) {
      setPost({
        ...existingPost,
        imageAlt: existingPost.imageAlt ?? '',
        content: existingPost.content ?? ''
      });
    } else if (isNew) {
      setPost((prev: any) => ({ 
        ...prev, 
        publishedAt: new Date().toISOString(),
        imageUrl: 'https://picsum.photos/seed/blog/1200/800',
        imageAlt: 'Blog cover placeholder'
      }));
    }
  }, [existingPost, isNew]);

  const handleFileUpload = (file: File, isInline: boolean = false) => {
    if (!file) return;
    
    const limit = 400000; // 400KB
    if (file.size > limit) {
      toast({ 
        variant: "destructive", 
        title: "File too large", 
        description: "Please use images under 400KB for database compatibility." 
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        if (isInline) {
          const alt = prompt('Enter image description (Alt Text):') || '';
          const imgHtml = `<img src="${result}" alt="${alt}" style="max-width: 100%; height: auto; margin: 2rem 0; display: block;" />`;
          document.execCommand('insertHTML', false, imgHtml);
          setPost((prev: any) => ({ ...prev, content: document.querySelector('.prose')?.innerHTML || prev.content }));
        } else {
          setPost({ ...post, imageUrl: result });
          toast({ title: "Image Uploaded", description: "Cover image updated." });
        }
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
      description: "Changes have been stored in the sanctuary library.",
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

              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Story Content (Rich Text)</Label>
                <RichTextEditor 
                  value={post.content ?? ''} 
                  onChange={(val) => setPost({...post, content: val})} 
                  onImageUpload={(file) => handleFileUpload(file, true)}
                />
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
                <Info className="w-4 h-4 text-muted-foreground/40 cursor-help" />
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
                    <p className="text-[10px] font-bold uppercase tracking-widest">Drop local file</p>
                  </div>
                )}
                <input id="blog-upload" type="file" className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }} />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold opacity-40">Image Path / URL</Label>
                  <Input 
                    className="h-10 text-[10px] font-mono rounded-none"
                    value={post.imageUrl?.startsWith('data:') ? 'Local Asset' : (post.imageUrl ?? '')} 
                    onChange={(e) => setPost({...post, imageUrl: e.target.value})}
                    placeholder="External URL" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold opacity-40">Cover Alt Text (SEO)</Label>
                  <Input 
                    className="h-10 text-xs rounded-none"
                    value={post.imageAlt ?? ''} 
                    onChange={(e) => setPost({...post, imageAlt: e.target.value})}
                    placeholder="Describe the cover image..." 
                  />
                </div>
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
