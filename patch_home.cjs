const fs = require('fs');
let code = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

const diningQuickService = `    { id: 'srv-dining', label: isBengali ? 'ক্যাফে ও রেস্তোরাঁ' : 'Cafés & Dining', icon: <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-300" />, view: 'dining-marketplace' as const, cat: 'Dining' as NearbyCategoryType, bg: 'bg-amber-100/50 dark:bg-amber-900/40' },
`;

code = code.replace("    { id: 'srv-businesses', label: isBengali ? 'দোকান ও বাজার' : 'Shops & Mart'", diningQuickService + "    { id: 'srv-businesses', label: isBengali ? 'দোকান ও বাজার' : 'Shops & Mart'");
// also need to import Coffee if it's not imported. Let's assume it's not.
if (!code.includes('Coffee')) {
  code = code.replace('import {', 'import {\n  Coffee,');
}

fs.writeFileSync('src/components/views/HomeView.tsx', code);
