'use client';

import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import GlobalSearch from '@/components/search/GlobalSearch';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchParams = useSearchParams();
  const isEditMode = useMemo(() => searchParams.get('edit') === 'true', [searchParams]);
  
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: settings, isLoading } = useDoc(settingsRef);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = useMemo(() => [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Blogs', href: '/blog' },
  ], []);

  const getHref = (path: string) => isEditMode ? `${path}${path.includes('?') ? '&' : '?'}edit=true` : path;

  const brandConfig = useMemo(() => isEditMode ? settings : settings?.published, [isEditMode, settings]);
  const logoSettings = brandConfig?.logo;
  const siteName = brandConfig?.siteName || 'VERDE SALON';

  // Optimization: Return a ghost navbar during initial brand identity load to prevent layout shift
  if (isLoading && !settings) return <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-background/40 backdrop-blur-md" />;

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out px-6 md:px-12",
        isScrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-primary/5 py-4 shadow-sm" 
          : "bg-background/40 backdrop-blur-md py-6"
      )}>
        <div className="container mx-auto flex items-center justify-between">
          <div className={cn(
            "flex items-center",
            logoSettings?.placement === 'center' ? 'md:flex-1' : ''
          )}>
            {logoSettings?.placement !== 'center' && (
              <Link href={getHref('/')} className="group transition-all duration-500 flex items-center">
                {logoSettings?.url ? (
                  <div 
                    className="relative flex items-center justify-center"
                    style={{ 
                      padding: `${logoSettings.padding || 0}px`,
                      margin: `${logoSettings.margin || 0}px`,
                      minHeight: `${logoSettings.height || 40}px`
                    }}
                  >
                    <img 
                      src={logoSettings.url} 
                      alt={siteName} 
                      style={{ 
                        height: `${logoSettings.height || 40}px`,
                        width: logoSettings.width && logoSettings.width > 0 ? `${logoSettings.width}px` : 'auto',
                        maxWidth: 'none'
                      }} 
                      className="object-contain transition-all duration-500"
                    />
                  </div>
                ) : (
                  <span className="font-headline text-2xl font-light tracking-[0.4em] uppercase text-primary group-hover:text-accent transition-colors duration-500">
                    {siteName}
                  </span>
                )}
              </Link>
            )}
          </div>

          {logoSettings?.placement === 'center' && (
            <div className="hidden md:flex flex-1 justify-center">
              <Link href={getHref('/')} className="group transition-all duration-500 flex items-center">
                {logoSettings?.url ? (
                  <div 
                    className="relative flex items-center justify-center"
                    style={{ 
                      padding: `${logoSettings.padding || 0}px`,
                      margin: `${logoSettings.margin || 0}px`,
                      minHeight: `${logoSettings.height || 40}px`
                    }}
                  >
                    <img 
                      src={logoSettings.url} 
                      alt={siteName} 
                      style={{ 
                        height: `${logoSettings.height || 40}px`,
                        width: logoSettings.width && logoSettings.width > 0 ? `${logoSettings.width}px` : 'auto',
                        maxWidth: 'none'
                      }} 
                      className="object-contain transition-all duration-500"
                    />
                  </div>
                ) : (
                  <span className="font-headline text-2xl font-light tracking-[0.4em] uppercase text-primary group-hover:text-accent transition-colors duration-500">
                    {siteName}
                  </span>
                )}
              </Link>
            </div>
          )}

          <div className="hidden md:flex items-center space-x-12">
            <div className="flex items-center space-x-10">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={getHref(link.href)} 
                  className="text-[10px] font-bold tracking-[0.3em] uppercase text-foreground/70 hover:text-primary transition-all duration-300 relative group pb-1"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right group-hover:origin-left" />
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-6 border-l border-foreground/10 pl-10">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-foreground/60 hover:text-primary transition-colors duration-500"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button className="bg-primary hover:bg-accent text-white rounded-none px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-700 shadow-lg" asChild>
                <Link href={getHref('/services')}>Book Now</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="text-primary">
              <Search className="w-5 h-5" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full bg-background border-none p-0">
                <div className="flex flex-col items-center justify-center h-full space-y-12">
                   <Link href={getHref('/')} className="mb-8">
                    {logoSettings?.url ? (
                      <img src={logoSettings.url} alt={siteName} style={{ height: '60px' }} />
                    ) : (
                      <span className="font-headline text-4xl tracking-[0.3em] text-primary uppercase">{siteName}</span>
                    )}
                  </Link>
                  {navLinks.map((link) => (
                    <Link key={link.name} href={getHref(link.href)} className="text-4xl font-headline font-light text-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  ))}
                  <Button className="w-full max-w-xs bg-primary hover:bg-accent text-white rounded-none py-8 text-[12px] font-bold tracking-[0.3em] uppercase transition-all duration-500" asChild>
                    <Link href={getHref('/services')}>Book Service</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}