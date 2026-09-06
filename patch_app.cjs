const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const diningImports = `
// Dining Marketplace & Restaurant Owner Platform
import { DiningMarketplaceView } from './components/dining/DiningMarketplaceView';
import { RestaurantDetailView } from './components/dining/RestaurantDetailView';
import { AddRestaurantWizardView } from './components/dining/AddRestaurantWizardView';
import { RestaurantDashboardView } from './components/dining/RestaurantDashboardView';
`;

code = code.replace("import { ShopMarketplaceView } from './components/shops/ShopMarketplaceView';", diningImports + "\nimport { ShopMarketplaceView } from './components/shops/ShopMarketplaceView';");

const diningRoutes = `
      case 'dining':
      case 'dining-marketplace':
        return <DiningMarketplaceView />;
      case 'restaurant-detail':
      case 'dining-detail':
        return <RestaurantDetailView />;
      case 'add-restaurant':
        return <AddRestaurantWizardView />;
      case 'restaurant-dashboard':
        return <RestaurantDashboardView />;
`;

code = code.replace("      case 'businesses':", diningRoutes + "\n      case 'businesses':");

fs.writeFileSync('src/App.tsx', code);
