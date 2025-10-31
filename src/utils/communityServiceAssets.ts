/**
 * Community Service Assets Configuration
 * Manages paths and fallbacks for Wasillah Special theme assets
 */

export interface CommunityAsset {
  path: string;
  fallback: string;
  alt: string;
}

// SVG placeholder for missing images - represents community service
const placeholderSVG = (text: string) => `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23D97706;stop-opacity:0.3'/%3E%3Cstop offset='100%25' style='stop-color:%23F59E0B;stop-opacity:0.3'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23grad)'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial,sans-serif' font-size='32' fill='%23D97706' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;

// Hero videos for each page
export const heroVideos = {
  home: {
    video: '/videos/home-hero.mp4',
    poster: '/community-service/community-helping.jpg',
    fallback: placeholderSVG('Community Service - Home')
  },
  about: {
    video: '/videos/about-hero.mp4',
    poster: '/community-service/volunteers-action.jpg',
    fallback: placeholderSVG('Community Service - About')
  },
  projects: {
    video: '/videos/projects-hero.mp4',
    poster: '/community-service/community-gathering.jpg',
    fallback: placeholderSVG('Community Service - Projects')
  },
  events: {
    video: '/videos/events-hero.mp4',
    poster: '/community-service/event-community.jpg',
    fallback: placeholderSVG('Community Service - Events')
  },
  volunteer: {
    video: '/videos/volunteer-hero.mp4',
    poster: '/community-service/volunteers-action.jpg',
    fallback: placeholderSVG('Community Service - Volunteer')
  },
  contact: {
    video: '/videos/contact-hero.mp4',
    poster: '/community-service/community-gathering.jpg',
    fallback: placeholderSVG('Community Service - Contact')
  }
};

// Section background images
export const sectionImages = {
  // Home page sections
  home: {
    impact: '/community-service/volunteers-action.jpg',
    whoWeAre: '/community-service/community-helping.jpg',
    programs: '/community-service/community-gathering.jpg',
    testimonials: '/community-service/event-celebration.jpg',
    cta: '/community-service/volunteers-action.jpg'
  },
  
  // About page sections
  about: {
    mission: '/community-service/education-children.jpg',
    vision: '/community-service/community-gathering.jpg',
    values: '/community-service/volunteers-action.jpg',
    team: '/community-service/event-community.jpg',
    journey: '/community-service/community-helping.jpg'
  },
  
  // Projects page sections
  projects: {
    header: '/community-service/skills-training.jpg',
    education: '/community-service/education-classroom.jpg',
    healthcare: '/community-service/healthcare-community.jpg',
    food: '/community-service/food-distribution.jpg',
    skills: '/community-service/skills-workshop.jpg',
    environment: '/community-service/environment-cleanup.jpg'
  },
  
  // Events page sections
  events: {
    header: '/community-service/event-community.jpg',
    upcoming: '/community-service/event-gathering.jpg',
    past: '/community-service/event-celebration.jpg',
    impact: '/community-service/community-helping.jpg'
  },
  
  // Volunteer page sections
  volunteer: {
    header: '/community-service/volunteers-action.jpg',
    opportunities: '/community-service/community-helping.jpg',
    benefits: '/community-service/event-celebration.jpg',
    process: '/community-service/skills-empowerment.jpg',
    testimonials: '/community-service/community-gathering.jpg'
  },
  
  // Contact page sections
  contact: {
    header: '/community-service/community-gathering.jpg',
    form: '/community-service/volunteers-action.jpg',
    info: '/community-service/community-helping.jpg'
  }
};

/**
 * Get hero video configuration for a page
 */
export const getHeroVideo = (page: keyof typeof heroVideos) => {
  return heroVideos[page] || heroVideos.home;
};

/**
 * Get section background image for a page and section
 */
export const getSectionImage = (page: keyof typeof sectionImages, section: string) => {
  const pageImages = sectionImages[page];
  if (!pageImages) return placeholderSVG('Community Service');
  
  return (pageImages as any)[section] || placeholderSVG('Community Service');
};

/**
 * Check if an image exists, return fallback if not
 */
export const getImageWithFallback = (path: string, fallbackText: string = 'Community Service') => {
  return {
    src: path,
    fallback: placeholderSVG(fallbackText)
  };
};
