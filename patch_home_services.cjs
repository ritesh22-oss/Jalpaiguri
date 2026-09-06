const fs = require('fs');
let code = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

const newItems = `    { id: 'srv-transport', label: isBengali ? 'পরিবহন' : 'Transport', icon: <Bus className="w-5 h-5 text-blue-600 dark:text-blue-300" />, view: 'transport' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { id: 'srv-courier', label: isBengali ? 'কুরিয়ার' : 'Courier', icon: <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />, view: 'courier' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { id: 'srv-education', label: isBengali ? 'শিক্ষা' : 'Education', icon: <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />, view: 'education' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-indigo-50 dark:bg-indigo-950/40' },`;

if (!code.includes("srv-transport")) {
  code = code.replace("    { id: 'srv-workers',", newItems + "\n    { id: 'srv-workers',");
  // Also import Bus, Package, GraduationCap if needed
  if (!code.includes('Bus')) {
    code = code.replace("import {\n  Coffee, Search,", "import {\n  Bus, Package, GraduationCap,\n  Coffee, Search,");
  }
}

fs.writeFileSync('src/components/views/HomeView.tsx', code);
