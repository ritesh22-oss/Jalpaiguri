const fs = require('fs');
let code = fs.readFileSync('src/components/dining/RestaurantDashboardView.tsx', 'utf8');

const newFields = `
  const [newMenuItemIsVeg, setNewMenuItemIsVeg] = useState(true);
  const [newMenuItemIsEgg, setNewMenuItemIsEgg] = useState(false);
`;

code = code.replace("  const [newMenuItemInStock, setNewMenuItemInStock] = useState(true);", "  const [newMenuItemInStock, setNewMenuItemInStock] = useState(true);\n" + newFields);

const addLogic = `
      isVeg: newMenuItemIsVeg,
      isEgg: newMenuItemIsEgg,
`;

code = code.replace(/discountPrice: newMenuItemDiscount \? parseFloat\(newMenuItemDiscount\) : undefined,/g, "discountPrice: newMenuItemDiscount ? parseFloat(newMenuItemDiscount) : undefined,\n      isVeg: newMenuItemIsVeg,\n      isEgg: newMenuItemIsEgg,");

const formUI = `
            {/* Diet Type (Veg / Non-Veg / Egg) */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#11241C] dark:text-white mb-2">
                Diet Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={newMenuItemIsVeg && !newMenuItemIsEgg} onChange={() => { setNewMenuItemIsVeg(true); setNewMenuItemIsEgg(false); }} className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">Pure Veg</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!newMenuItemIsVeg && newMenuItemIsEgg} onChange={() => { setNewMenuItemIsVeg(false); setNewMenuItemIsEgg(true); }} className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700 dark:text-yellow-500">Egg</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!newMenuItemIsVeg && !newMenuItemIsEgg} onChange={() => { setNewMenuItemIsVeg(false); setNewMenuItemIsEgg(false); }} className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-400">Non-Veg</span>
                </label>
              </div>
            </div>
`;

code = code.replace('{/* In Stock Toggle */}', formUI + '\n            {/* In Stock Toggle */}');

fs.writeFileSync('src/components/dining/RestaurantDashboardView.tsx', code);
