/**
 * Centralized CMS Defaults for Verde Salon.
 * Standardizes section content and styles across the Admin Panel and Visual Architect.
 */

export const defaultStyles = {
  backgroundColor: '#F5F3EF',
  titleColor: '#0F2F2F',
  subtitleColor: '#C6A15B',
  paddingVertical: '128',
  overlayOpacity: 20,
  overlayColor: '#000000',
  alignment: 'center',
  buttonType: 'primary',
  objectFit: 'cover'
};

export const defaultContents: Record<string, any> = {
  Hero: { 
    title: 'Elevate Your Natural Beauty', 
    subtitle: 'Premium hair, skin, and wellness treatments tailored for you.', 
    ctaText: 'Book Appointment', 
    ctaUrl: '/services#book-now', 
    imageUrl: 'https://picsum.photos/seed/verde-luxury-hero/1920/1080', 
    backgroundType: 'image' 
  },
  TextBlock: { 
    title: 'A New Narrative', 
    content: 'Share your story here...', 
    alignment: 'center' 
  },
  BrandIntro: { 
    title: 'About VERDE SALON', 
    subtitle: 'The Essence of Luxury', 
    content: 'At Verde Salon, we blend modern beauty techniques with natural care. Our mission is to enhance your beauty while maintaining the health of your hair and skin.', 
    imageUrl: 'https://picsum.photos/seed/verde-about/800/1000', 
    buttonText: 'Discover Our Story', 
    buttonUrl: '/blog' 
  },
  CTA: { 
    title: 'Ready for a transformation?', 
    subtitle: 'Book your experience today at Verde Salon.', 
    buttonText: 'Book Your Visit', 
    buttonUrl: '/services#book-now' 
  },
  FormBlock: { 
    title: 'Book an Experience', 
    subtitle: 'Request a service at Verde Salon.', 
    type: 'Booking' 
  },
  VideoBlock: { 
    title: 'Featured Video', 
    subtitle: 'Experience Verde Salon in motion', 
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
    posterUrl: 'https://picsum.photos/seed/video-thumb/1280/720', 
    autoplay: true, 
    loop: true, 
    muted: true, 
    showControls: false, 
    startTime: 0, 
    endTime: 60,
    styles: {
      ...defaultStyles,
      objectFit: 'cover',
      height: 'auto',
      maxWidth: '100%'
    }
  },
  FAQSection: { 
    title: 'Common Queries', 
    subtitle: 'Information for your visit' 
  },
  ServicesPreview: { 
    title: 'Signature Services', 
    subtitle: 'Our Craft', 
    services: [] 
  },
  FeaturedWork: { 
    title: 'Our Work', 
    subtitle: 'The Verde Aesthetic', 
    images: [] 
  },
  Testimonials: { 
    title: 'Client Reflections', 
    subtitle: 'Voices of Verde Salon', 
    testimonials: [] 
  },
  InstagramPreview: { 
    handle: '@verdesalonsalon', 
    title: 'Follow Us on Instagram', 
    posts: [] 
  },
  BlogListing: { 
    title: 'Reflections & Insights', 
    subtitle: 'Blogs', 
    description: 'Curated thoughts on beauty and intentional living.' 
  },
  ServicesListing: { 
    title: 'Signature Services', 
    subtitle: 'The Menu', 
    description: 'Timeless techniques meets contemporary science.' 
  }
};
