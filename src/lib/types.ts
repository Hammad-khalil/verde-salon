
export type BrandingSettings = {
  siteName: string;
  logoMediaAssetId?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor: string;
  headlineFont: string;
  bodyFont: string;
};

export type SEOConfig = {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
};

export type PageSectionType = 
  | 'Hero' 
  | 'TextBlock' 
  | 'ImageGallery' 
  | 'ServicePreview' 
  | 'TestimonialSlider' 
  | 'InstagramPreview' 
  | 'CallToActionBlock' 
  | 'FormBlock' 
  | 'FAQSection' 
  | 'BlogListing';

export type PageSection = {
  id: string;
  type: PageSectionType;
  name: string;
  content: string; // JSON string of specific section data
  order: number;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  sectionIds: string[];
  seoTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  imageUrl: string;
  category: string;
  isPublished: boolean;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  isPublished: boolean;
  category: string;
  excerpt?: string;
  seo?: SEOConfig;
};

export type Testimonial = {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type GlobalSettings = {
  id: string;
  siteName: string;
  logo?: {
    url: string;
    height: number;
    placement: 'left' | 'center';
  };
  colors?: {
    primary: string;
    background: string;
    accent: string;
  };
  typography?: {
    headline: string;
    body: string;
  };
  seo?: {
    titlePrefix?: string;
    autoSitemap?: boolean;
    robotsTxt?: string;
  };
  integrations?: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
    zapierWebhookUrl?: string;
    hubspotPortalId?: string;
  };
  payments?: {
    stripePublicKey?: string;
    paypalClientId?: string;
    razorpayKeyId?: string;
  };
};
