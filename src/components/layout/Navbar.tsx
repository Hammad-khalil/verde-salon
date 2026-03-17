'use client';

import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import GlobalSearch from '@/components/search/GlobalSearch';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: settings } = useDoc(settingsRef);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Journal', href: '/blog' },
  ];

  const logoSettings = settings?.logo;
  const siteName = settings?.siteName || 'VERDE SALON';

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out px-6 md:px-12",
        isScrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-primary/5 py-4" 
          : "bg-background/40 backdrop-blur-md py-6"
      )}>
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo Area */}
          <div className="flex justify-start items-center">
            <Link href="/" className="flex items-center group transition-all duration-500">
              {logoSettings?.url ? (
                <img 
                  src={logoSettings.url} 
                  alt={siteName} 
                  style={{ height: `${logoSettings.height || 40}px` }} 
                  className="object-contain"
                />
              ) : (
                <span className={cn(
                  "font-headline text-2xl font-light tracking-[0.4em] uppercase transition-colors duration-500",
                  "text-primary group-hover:text-accent"
                )}>
                  {siteName}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-16">
            <div className="flex items-center space-x-12">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={cn(
                    "text-[11px] font-bold tracking-[0.3em] uppercase transition-all duration-300 relative group pb-1",
                    "text-foreground/70 hover:text-primary"
                  )}
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right group-hover:origin-left" />
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-6 border-l border-foreground/10 pl-12">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "rounded-full transition-colors duration-500 text-foreground/60 hover:text-primary hover:bg-primary/5"
                )}
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button className="bg-primary hover:bg-accent text-white rounded-none px-10 py-6 text-[11px] font-bold tracking-[0.3em] uppercase transition-all duration-700 shadow-lg">
                Reserve
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center space-x-4 md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary"
              onClick={() => setIsSearchOpen(true)}
            >
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
                   <Link href="/" className="mb-8" onClick={() => {}}>
                    {logoSettings?.url ? (
                      <img src={logoSettings.url} alt={siteName} style={{ height: '60px' }} />
                    ) : (
                      <span className="font-headline text-4xl tracking-[0.3em] text-primary uppercase">{siteName}</span>
                    )}
                  </Link>
                  {navLinks.map((link) => (
                    <Link 
                      key={link.name} 
                      href={link.href} 
                      className="text-4xl font-headline font-light text-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <Button className="w-full max-w-xs bg-primary hover:bg-accent text-white rounded-none py-8 text-[12px] font-bold tracking-[0.3em] uppercase transition-all duration-500">
                    Reserve Ritual
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
