
import { SiteContent } from './types';

const INITIAL_DATA: SiteContent = {
  branding: {
    siteName: 'Verde Salon',
    primaryColor: '#4A6741',
    backgroundColor: '#F8F9F8',
    accentColor: '#A8B89E',
    headlineFont: 'Playfair Display',
    bodyFont: 'PT Sans'
  },
  home: {
    hero: {
      title: 'Luxury Hair & Beauty Experience',
      subtitle: 'Where elegance meets perfection. Experience the art of luxury hair and skincare in an environment designed for serenity.',
      ctaText: 'Book Appointment',
      imageUrl: 'https://picsum.photos/seed/verde-hero/1920/1080'
    },
    brandIntro: {
      title: 'Pure. Elegant. Conscious.',
      content: 'At Verde Salon, we believe beauty is more than skin deep. Our boutique studio combines high-end techniques with sustainable practices to bring out your most radiant self. Founded on the principles of natural elegance, we offer a sanctuary where your personal style is refined by masters of the craft.'
    },
    featuredWork: [
      'https://picsum.photos/seed/verde-gal1/600/800',
      'https://picsum.photos/seed/verde-gal2/600/800',
      'https://picsum.photos/seed/verde-gal3/600/800'
    ]
  },
  services: [
    {
      id: '1',
      title: 'Hair Cut',
      category: 'Hair',
      description: 'Precision cutting tailored to your face shape and lifestyle.',
      price: '$30',
      duration: '45 min',
      imageUrl: 'https://picsum.photos/seed/verde-cut/800/600'
    },
    {
      id: '2',
      title: 'Hair Coloring',
      category: 'Hair',
      description: 'Expert color application for depth, dimension, and vibrant shine.',
      price: '$80',
      duration: '120 min',
      imageUrl: 'https://picsum.photos/seed/verde-color/800/600'
    },
    {
      id: '3',
      title: 'Facial Treatment',
      category: 'Skin',
      description: 'A rejuvenating experience focused on skin health and radiant glow.',
      price: '$50',
      duration: '60 min',
      imageUrl: 'https://picsum.photos/seed/verde-facial/800/600'
    },
    {
      id: '4',
      title: 'Manicure',
      category: 'Nails',
      description: 'Elegant nail care and polish for a sophisticated look.',
      price: '$25',
      duration: '30 min',
      imageUrl: 'https://picsum.photos/seed/verde-mani/800/600'
    },
    {
      id: '5',
      title: 'Pedicure',
      category: 'Nails',
      description: 'Relaxing foot treatment including exfoliation and professional finish.',
      price: '$30',
      duration: '45 min',
      imageUrl: 'https://picsum.photos/seed/verde-pedi/800/600'
    }
  ],
  blog: [
    {
      id: '1',
      slug: 'summer-hair-rituals',
      title: 'Essential Summer Hair Rituals',
      excerpt: 'Protect your tresses from the sun and salt with expert tips.',
      content: 'Detailed summer hair care advice...',
      author: 'Elena Verde',
      publishedAt: '2024-06-01',
      category: 'Hair',
      imageUrl: 'https://picsum.photos/seed/blog-summer/800/600',
      seo: {
        title: 'Summer Hair Care Tips | Verde Salon',
        description: 'Expert guide to maintaining hair health during the summer months.',
        keywords: ['hair care', 'summer', 'beauty']
      }
    },
    {
      id: '2',
      slug: 'radiant-skin-secrets',
      title: 'Secrets to Radiant Skin',
      excerpt: 'Achieve a glowing complexion with our specialist-approved routine.',
      content: 'Pro skincare secrets revealed...',
      author: 'Julian Thorne',
      publishedAt: '2024-05-15',
      category: 'Beauty',
      imageUrl: 'https://picsum.photos/seed/blog-skin/800/600',
      seo: {
        title: 'Radiant Skin Secrets | Skincare Guide',
        description: 'Discover how to get a glowing complexion naturally.',
        keywords: ['skincare', 'glow', 'beauty routine']
      }
    },
    {
      id: '3',
      slug: 'minimalist-nail-trends',
      title: 'Minimalist Nail Trends for 2024',
      excerpt: 'Sophisticated and simple designs that make a statement.',
      content: 'Exploring the shift towards minimalism in nail art...',
      author: 'Mia Chen',
      publishedAt: '2024-05-10',
      category: 'Trends',
      imageUrl: 'https://picsum.photos/seed/blog-nails/800/600',
      seo: {
        title: '2024 Minimalist Nail Trends | Verde Salon',
        description: 'Stay ahead of the curve with our 2024 nail art trends.',
        keywords: ['nails', 'trends', '2024']
      }
    },
    {
      id: '4',
      slug: 'the-art-of-balayage',
      title: 'The Art of Artisan Balayage',
      excerpt: 'Why this hand-painted technique remains a timeless favorite.',
      content: 'Deep dive into the balayage process...',
      author: 'Elena Verde',
      publishedAt: '2024-04-20',
      category: 'Hair',
      imageUrl: 'https://picsum.photos/seed/blog-balay/800/600',
      seo: {
        title: 'Mastering Balayage | Hair Color Guide',
        description: 'Everything you need to know about the balayage technique.',
        keywords: ['balayage', 'hair color', 'styling']
      }
    },
    {
      id: '5',
      slug: 'eco-friendly-beauty-rituals',
      title: 'Eco-Friendly Beauty Rituals',
      excerpt: 'Sustainable practices for a more conscious beauty routine.',
      content: 'How to transition to sustainable beauty...',
      author: 'Sarah Jenkins',
      publishedAt: '2024-04-05',
      category: 'Beauty',
      imageUrl: 'https://picsum.photos/seed/blog-eco/800/600',
      seo: {
        title: 'Sustainable Beauty Rituals | Eco Guide',
        description: 'Transition to an eco-friendly beauty routine today.',
        keywords: ['sustainability', 'green beauty', 'eco-friendly']
      }
    }
  ],
  testimonials: [
    {
      id: '1',
      name: 'Isabella Rossi',
      role: 'Creative Director',
      content: 'Verde Salon is a true sanctuary. Their attention to detail is simply unparalleled.',
      rating: 5
    },
    {
      id: '2',
      name: 'Marcus Vance',
      role: 'Architect',
      content: 'The minimalist aesthetic and professionalism make every visit a grounding experience.',
      rating: 5
    },
    {
      id: '3',
      name: 'Sophie Laurent',
      role: 'Model',
      content: 'I trust Verde with my skin and hair completely. Their commitment to sustainable luxury is rare.',
      rating: 5
    }
  ],
  faqs: [
    {
      id: '1',
      question: 'Do you offer bridal services?',
      answer: 'Yes, we provide curated bridal packages. Contact us for a bespoke consultation.'
    },
    {
      id: '2',
      question: 'What products do you use?',
      answer: 'We exclusively use sustainable, high-performance botanical brands.'
    }
  ],
  analytics: {}
};

class Store {
  private data: SiteContent = INITIAL_DATA;

  getContent(): SiteContent {
    return this.data;
  }

  updateContent(newData: Partial<SiteContent>) {
    this.data = { ...this.data, ...newData };
    return this.data;
  }
}

export const siteStore = new Store();
