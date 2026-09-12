import { ExplorePlaceCategory } from '../types';

const STOCK_IMAGES: Record<string, string> = {
  'Healthcare': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop',
  'Heritage & Tourism': 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600&auto=format&fit=crop',
  'Commercial & Markets': 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=600&auto=format&fit=crop',
  'Transport': 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=600&auto=format&fit=crop',
  'Education & Civic': 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop',
  'Fuel & Utilities': 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?q=80&w=600&auto=format&fit=crop',
  'Default': 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600&auto=format&fit=crop'
};

// Map Category to corresponding photorealistic stock image
export function getCategoryIllustrationUri(category: ExplorePlaceCategory | string): string {
  switch (category) {
    case 'Healthcare':
      return STOCK_IMAGES['Healthcare'];
    case 'Heritage & Tourism':
      return STOCK_IMAGES['Heritage & Tourism'];
    case 'Commercial & Markets':
      return STOCK_IMAGES['Commercial & Markets'];
    case 'Transport':
      return STOCK_IMAGES['Transport'];
    case 'Education & Civic':
      return STOCK_IMAGES['Education & Civic'];
    case 'Fuel & Utilities':
      return STOCK_IMAGES['Fuel & Utilities'];
    default:
      return STOCK_IMAGES['Default'];
  }
}
