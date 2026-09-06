const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Imports
code = code.replace("import { Worker, BloodDonor, RentalProperty, AlertEvent, Job, Shop } from '../types';", "import { Worker, BloodDonor, RentalProperty, AlertEvent, Job, Shop, Restaurant } from '../types';");

// Interface
code = code.replace("  shops: Shop[];", "  shops: Shop[];\n  restaurants: Restaurant[];");

// State
code = code.replace("  const [shops, setShops] = useState<Shop[]>([]);", "  const [shops, setShops] = useState<Shop[]>([]);\n  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);");

// Initial data loading
code = code.replace("          { name: 'shops', setter: setShops },", "          { name: 'shops', setter: setShops },\n          { name: 'restaurants', setter: setRestaurants },");

// Return
code = code.replace("        shops\n      }}", "        shops,\n        restaurants\n      }}");

fs.writeFileSync('src/context/AppContext.tsx', code);
