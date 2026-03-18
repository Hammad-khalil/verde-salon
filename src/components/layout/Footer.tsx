import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-background border-t border-primary/10 mt-20 pb-12 pt-32">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-12">
        {/* Brand Identity */}
        <div className="space-y-10">
          <Link href="/" className="font-headline text-3xl font-light text-accent tracking-[0.4em] block">
            VERDE SALON
          </Link>
          <p className="text-background/60 font-light leading-relaxed max-w-xs text-sm tracking-wide">
            Refining beauty through natural elegance and sustainable practices. A boutique sanctuary dedicated to intentional living and artisan care.
          </p>
          <div className="flex items-center space-x-8">
            <Link href="#" className="text-background/30 hover:text-accent transition-all duration-500 transform hover:scale-110">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-background/30 hover:text-accent transition-all duration-500 transform hover:scale-110">
              <Facebook className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-headline text-xl font-light text-accent mb-10 uppercase tracking-[0.3em]">Navigation</h4>
          <ul className="space-y-5 text-[11px] font-bold uppercase tracking-[0.3em] text-background/60">
            <li><Link href="/" className="hover:text-accent transition-all duration-300">Home</Link></li>
            <li><Link href="/services" className="hover:text-accent transition-all duration-300">Rituals</Link></li>
            <li><Link href="/blog" className="hover:text-accent transition-all duration-300">Blogs</Link></li>
            <li><Link href="/admin" className="hover:text-accent transition-all duration-300">Staff Portal</Link></li>
          </ul>
        </div>

        {/* Contact Rituals */}
        <div>
          <h4 className="font-headline text-xl font-light text-accent mb-10 uppercase tracking-[0.3em]">Contact</h4>
          <ul className="space-y-8 text-sm font-light text-background/60 tracking-wide">
            <li className="flex items-start space-x-5">
              <Phone className="w-4 h-4 text-accent/60 mt-1" />
              <span>(555) 123-4567</span>
            </li>
            <li className="flex items-start space-x-5">
              <Mail className="w-4 h-4 text-accent/60 mt-1" />
              <span>hello@verdesalon.com</span>
            </li>
            <li className="flex items-start space-x-5 leading-loose">
              <MapPin className="w-4 h-4 text-accent/60 mt-1" />
              <span>123 Green Avenue,<br />Beauty District, Metropolis</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Inward */}
        <div>
          <h4 className="font-headline text-xl font-light text-accent mb-10 uppercase tracking-[0.3em]">Newsletter</h4>
          <p className="text-sm font-light text-background/60 mb-10 leading-relaxed tracking-wide">Join our curated inner circle for seasonal insights and priority ritual updates.</p>
          <div className="flex border-b border-background/10 pb-3 group">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-transparent border-none focus:ring-0 px-0 w-full text-sm text-background placeholder:text-background/20 font-light tracking-widest"
            />
            <button className="text-[10px] uppercase font-bold tracking-[0.4em] text-accent hover:text-white transition-all duration-500">
              Join
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Signature */}
      <div className="container mx-auto px-6 mt-40 pt-10 border-t border-background/5 flex flex-col md:flex-row items-center justify-between text-[10px] text-background/20 font-bold uppercase tracking-[0.4em]">
        <p>&copy; {new Date().getFullYear()} VERDE SALON STUDIO. ALL RIGHTS RESERVED.</p>
        <p className="mt-6 md:mt-0 opacity-40">SUSTAINABLE BEAUTY, NATURALLY DEFINED.</p>
      </div>
    </footer>
  );
}
