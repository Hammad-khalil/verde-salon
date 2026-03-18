
'use client';

import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'business';
}

/**
 * SEOManager handles client-side metadata updates and Structured Data (JSON-LD).
 * Standardized for Verde Salon luxury deployment.
 */
export default function SEOManager({ title, description, keywords, ogImage, canonical, type = 'website' }: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? (title.includes('Verde Salon') ? title : `${title} | Verde Salon`) : 'Verde Salon';
    document.title = fullTitle;

    // Update Meta Tags
    updateMetaTag('name', 'description', description || 'Luxury boutique salon experience.');
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description || 'Experience natural elegance and sustainable luxury at Verde Salon.');
    updateMetaTag('property', 'og:type', type === 'article' ? 'article' : 'website');

    if (keywords && keywords.length > 0) {
      updateMetaTag('name', 'keywords', keywords.join(', '));
    }

    if (ogImage) {
      updateMetaTag('property', 'og:image', ogImage);
      updateMetaTag('name', 'twitter:image', ogImage);
    }

    // Canonical URL logic
    const finalCanonical = canonical || window.location.href;
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', finalCanonical);

    // JSON-LD Structured Data Generation
    const schemaData = type === 'article' ? {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "image": ogImage || "https://picsum.photos/seed/verde-blog/800/600",
      "author": { "@type": "Person", "name": "Elena Verde" },
      "publisher": { "@type": "Organization", "name": "Verde Salon" },
      "datePublished": new Date().toISOString()
    } : {
      "@context": "https://schema.org",
      "@type": "BeautySalon",
      "name": "Verde Salon",
      "description": description || "Luxury boutique salon experience dedicated to sustainable beauty.",
      "image": ogImage || "https://picsum.photos/seed/verde-salon/1200/800",
      "url": window.location.origin,
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Green Ave",
        "addressLocality": "Beauty District",
        "addressRegion": "Metropolis",
        "postalCode": "12345",
        "addressCountry": "US"
      },
      "openingHours": "Tu-Fr 10:00-20:00, Sa 09:00-18:00"
    };

    let script = document.getElementById('json-ld-schema');
    if (!script) {
      script = document.createElement('script');
      script.id = 'json-ld-schema';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.innerHTML = JSON.stringify(schemaData);

  }, [title, description, keywords, ogImage, canonical, type]);

  function updateMetaTag(attr: string, value: string, content: string) {
    let element = document.querySelector(`meta[${attr}="${value}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, value);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  }

  return null;
}
