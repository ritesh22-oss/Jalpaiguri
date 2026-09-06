const fs = require('fs');
let code = fs.readFileSync('src/components/dining/DiningMarketplaceView.tsx', 'utf8');

const newCategories = `const CATEGORIES: { key: string; labelEn: string; labelBn: string; icon: string }[] = [
  { key: 'All', labelEn: 'All Dining', labelBn: 'সব', icon: '🍽️' },
  { key: 'Cafe', labelEn: 'Cafés & Coffee', labelBn: 'ক্যাফে', icon: '☕' },
  { key: 'Restaurant', labelEn: 'Restaurants', labelBn: 'রেস্তোরাঁ', icon: '🍛' },
  { key: 'Fast Food', labelEn: 'Fast Food', labelBn: 'ফাস্ট ফুড', icon: '🍔' },
  { key: 'Street Food', labelEn: 'Street Food', labelBn: 'রাস্তার খাবার', icon: '🥙' },
  { key: 'Bakery & Sweets', labelEn: 'Bakery & Sweets', labelBn: 'মিষ্টি ও বেকারি', icon: '🍰' },
  { key: 'Cloud Kitchen', labelEn: 'Cloud Kitchen', labelBn: 'ক্লাউড কিচেন', icon: '📦' },
  { key: 'Dhaba', labelEn: 'Dhaba', labelBn: 'ধাবা', icon: '🍲' },
  { key: 'Other', labelEn: 'Other', labelBn: 'অন্যান্য', icon: '🍴' }
];`;

code = code.replace(/const CATEGORIES: \{ key: string; labelEn: string; labelBn: string; icon: string \}\[\] = \[[\s\S]*?\];/, newCategories);
fs.writeFileSync('src/components/dining/DiningMarketplaceView.tsx', code);
