const fs = require('fs');
let code = fs.readFileSync('src/components/dining/AddRestaurantWizardView.tsx', 'utf8');

const newCategories = `const CATEGORIES: { key: RestaurantCategory; labelEn: string; labelBn: string; defaultPhoto: string }[] = [
  { key: 'Cafe', labelEn: 'Cafe & Coffee', labelBn: 'ক্যাফে', defaultPhoto: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' },
  { key: 'Restaurant', labelEn: 'Restaurant', labelBn: 'রেস্তোরাঁ', defaultPhoto: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' },
  { key: 'Fast Food', labelEn: 'Fast Food', labelBn: 'ফাস্ট ফুড', defaultPhoto: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80' },
  { key: 'Street Food', labelEn: 'Street Food', labelBn: 'রাস্তার খাবার', defaultPhoto: 'https://images.unsplash.com/photo-1579208035252-47c0b0f0aef2?auto=format&fit=crop&w=800&q=80' },
  { key: 'Bakery & Sweets', labelEn: 'Bakery & Sweets', labelBn: 'মিষ্টি ও বেকারি', defaultPhoto: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
  { key: 'Cloud Kitchen', labelEn: 'Cloud Kitchen', labelBn: 'ক্লাউড কিচেন', defaultPhoto: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80' },
  { key: 'Dhaba', labelEn: 'Dhaba', labelBn: 'ধাবা', defaultPhoto: 'https://images.unsplash.com/photo-1628173499426-17b5f0857321?auto=format&fit=crop&w=800&q=80' },
  { key: 'Other', labelEn: 'Other Food Joint', labelBn: 'অন্যান্য', defaultPhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' }
];`;

code = code.replace(/const CATEGORIES: \{ key: RestaurantCategory; labelEn: string; labelBn: string; defaultPhoto: string \}\[\] = \[[\s\S]*?\];/, newCategories);

code = code.replace(/const \[category, setCategory\] = useState<RestaurantCategory>\('.*?'\);/, "const [category, setCategory] = useState<RestaurantCategory>('Restaurant');");
code = code.replace(/A premier \$\{category\.toLowerCase\(\)\} store/g, "A premier ${category.toLowerCase()} situated");

fs.writeFileSync('src/components/dining/AddRestaurantWizardView.tsx', code);
