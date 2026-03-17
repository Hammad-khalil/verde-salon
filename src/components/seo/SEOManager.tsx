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
 */
export default function SEOManager({ title, description, keywords, ogImage, canonical, type = 'website' }: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? (title.includes('Verde Salon') ? title : `${title} | Verde Salon`) : 'Verde Salon';
    document.title = fullTitle;

    if (description) {
      updateMetaTag('name', 'description', description);
      updateMetaTag('property', 'og:description', description);
    }

    if (keywords && keywords.length > 0) {
      updateMetaTag('name', 'keywords', keywords.join(', '));
    }

    if (ogImage) {
      updateMetaTag('property', 'og:image', ogImage);
    }

    if (canonical) {
      let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // JSON-LD Structured Data
    const schemaData = type === 'article' ? {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "image": ogImage,
      "author": { "@type": "Person", "name": "Verde Salon" }
    } : {
      "@context": "https://schema.org",
      "@type": "BeautySalon",
      "name": "Verde Salon",
      "description": description || "Luxury boutique salon experience.",
      "image": ogImage || "https://verdesalon.com/logo.png",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Green Ave",
        "addressLocality": "Beauty District",
        "addressRegion": "City",
        "postalCode": "12345",
        "addressCountry": "US"
      }
    };

    let script = document.getElementById('json-ld');
    if (!script) {
      script = document.createElement('script');
      script.id = 'json-ld';
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
