'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * WhatsAppButton - A premium, floating contact button.
 * Specifically styled for the Verde Salon aesthetic.
 */
export default function WhatsAppButton() {
  const phoneNumber = '923030562559';
  const message = 'Hi Verde Salon Team, I have a query. I would like to get more details about your services.';
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-8 right-8 z-[60] flex items-center justify-center",
        "w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl",
        "bg-white border border-accent/20 transition-all duration-500",
        "hover:scale-110 hover:-translate-y-1 active:scale-95 group",
        "animate-fade-in"
      )}
      aria-label="Contact us on WhatsApp"
    >
      {/* Visual Pulse Effect */}
      <span className="absolute inset-0 rounded-full bg-accent/10 animate-ping opacity-20 pointer-events-none" />
      
      {/* WhatsApp Icon (Minimalist SVG) */}
      <svg
        viewBox="0 0 24 24"
        className="w-7 h-7 md:w-8 md:h-8 fill-primary transition-colors group-hover:fill-accent"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.12.551 4.189 1.596 6.06L0 24l6.117-1.605a11.882 11.815 0 005.925 1.577h.005c6.632 0 12.028-5.398 12.03-12.03a11.85 11.815 0 00-3.527-8.508z" />
      </svg>

      {/* Tooltip Overlay */}
      <div className="absolute right-full mr-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <div className="bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 shadow-xl">
          Inquire Now
        </div>
      </div>
    </a>
  );
}
