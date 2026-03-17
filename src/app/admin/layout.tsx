'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Image as ImageIcon, 
  HelpCircle, 
  MessageSquare,
  Scissors,
  Eye,
  LogOut,
  ChevronRight,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, pathname, router]);

  if (isUserLoading) {
    return <div className="min-h-screen flex items-center justify-center font-headline text-primary tracking-widest animate-pulse">VERDE SALON CMS LOADING...</div>;
  }

  if (!user && pathname !== '/admin/login') {
    return null;
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Inquiries', href: '/admin/submissions', icon: Inbox },
    { name: 'Pages & Content', href: '/admin/pages', icon: FileText },
    { name: 'Services Menu', href: '/admin/services', icon: Scissors },
    { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
    { name: 'FAQs', href: '/admin/faq', icon: HelpCircle },
    { name: 'Branding & Theme', href: '/admin/branding', icon: Settings },
  ];

  async function handleLogout() {
    await signOut(auth);
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 bg-sidebar border-r border-sidebar-border hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-sidebar-border">
          <Link href="/admin" className="font-headline text-2xl font-bold text-sidebar-primary tracking-[0.3em]">
            VERDE SALON
          </Link>
          <div className="flex items-center mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            <span className="w-2 h-2 rounded-full bg-accent mr-2" />
            Active Editor
          </div>
        </div>
        
        <nav className="flex-grow p-6 space-y-2">
          {adminLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-sm transition-all group",
                pathname === link.href 
                  ? "bg-primary text-white" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <div className="flex items-center space-x-3">
                <link.icon className={cn("w-4 h-4", pathname === link.href ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                <span>{link.name}</span>
              </div>
              {pathname === link.href && <ChevronRight className="w-3 h-3" />}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-sidebar-border space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start space-x-3 border-primary/20 hover:bg-primary/5" 
            asChild
          >
            <Link href="/" target="_blank">
              <Eye className="w-4 h-4" />
              <span>View Live Site</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start space-x-3 text-destructive hover:text-destructive hover:bg-destructive/5" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-10 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
