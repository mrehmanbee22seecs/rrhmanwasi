/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Premium Firebase Studio Dark Colors
        'logo-navy': '#1A1A2E',
        'logo-navy-light': '#2A2A3E',
        'logo-navy-dark': '#0F0F23',
        'logo-teal': '#00D9FF',
        'logo-teal-light': '#4DFFFF',
        
        // Vibrant Gradient Accent Colors
        'vibrant-orange': '#FF6B9D',
        'vibrant-orange-light': '#FFA3C7',
        'vibrant-orange-dark': '#E6458C',
        'vibrant-purple': '#8B5CF6',
        'vibrant-cyan': '#00D9FF',
        
        // Premium Warm Colors for Light Theme
        'cream-elegant': '#F5E6D3',  // Warm beige for surfaces
        'cream-white': '#FAF6F1',    // Soft cream background
        'cream-soft': '#F0E6D6',     // Slightly darker beige
        'cream-feature': '#f8f1e6',  // Feature card beige
        'gold-luxury': '#D4AF37',    // Golden accent
        'gold-light': '#FFE44D',
        
        // Dark Theme Colors
        'deep-black': '#0a0a0a',     // Deep black for feature cards
        
        // Text Colors
        'text-dark': '#1F2937',       // Dark text for light themes
        'text-darker': '#111111',    // Darker text for feature cards
        'text-medium': '#4B5563',     // Medium gray
        'text-light': '#6B7280',      // Light gray
        'dark-readable': '#FFFFFF',   // White text for dark themes
      },
      fontFamily: {
        'luxury-display': ['Playfair Display', 'serif'],
        'luxury-heading': ['Poppins', 'sans-serif'],
        'luxury-body': ['Inter', 'sans-serif'],
        'luxury-medium': ['Inter', 'sans-serif'],
        'arabic': ['Amiri', 'serif'],
      },
      animation: {
        'cinematic-fade': 'cinematic-fade-in 1.2s ease-out forwards',
        'text-shimmer': 'text-shimmer 3s linear infinite',
        'counter': 'counter-up 0.8s ease-out forwards',
        'parallax-float': 'parallax-float 8s ease-in-out infinite',
        'luxury-glow': 'luxury-glow 4s ease-in-out infinite',
        'wave': 'wave-motion 6s ease-in-out infinite',
        'particle-drift': 'particle-drift 5s ease-in-out infinite',
        'slide-up-luxury': 'slide-up-luxury 1s ease-out forwards',
        'fade-in-luxury': 'fade-in-luxury 0.8s ease-out forwards',
      },
      boxShadow: {
        'luxury': '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 107, 157, 0.2)',
        'luxury-lg': '0 40px 80px rgba(0, 0, 0, 0.6), 0 0 50px rgba(0, 217, 255, 0.3)',
        'luxury-glow': '0 0 30px rgba(255, 107, 157, 0.5), 0 0 60px rgba(0, 217, 255, 0.3)',
        'luxury-glow-lg': '0 0 50px rgba(255, 107, 157, 0.7), 0 0 100px rgba(0, 217, 255, 0.5)',
        'premium': '0 20px 60px rgba(255, 107, 157, 0.3), 0 0 40px rgba(0, 217, 255, 0.2)',
      },
      borderRadius: {
        'luxury': '20px',
        'luxury-lg': '28px',
      },
      backdropBlur: {
        'luxury': '25px',
      },
    },
  },
  plugins: [],
};