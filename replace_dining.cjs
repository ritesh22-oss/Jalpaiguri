const fs = require('fs');
const path = require('path');

const dir = 'src/components/dining/';
const files = fs.readdirSync(dir);

const replacements = [
  { match: /ShopMarketplaceView/g, replace: 'DiningMarketplaceView' },
  { match: /AddShopWizardView/g, replace: 'AddRestaurantWizardView' },
  { match: /MerchantDashboardView/g, replace: 'RestaurantDashboardView' },
  { match: /ShopDetailView/g, replace: 'RestaurantDetailView' },
  { match: /SmartShoppingSearchView/g, replace: 'SmartDiningSearchView' },
  
  { match: /ShopCategory/g, replace: 'RestaurantCategory' },
  { match: /ShopSubscription/g, replace: 'ShopSubscription' }, // keep this as is? Yes, it's shared
  
  { match: /Shop/g, replace: 'Restaurant' },
  { match: /shopId/g, replace: 'restaurantId' },
  { match: /shopName/g, replace: 'restaurantName' },
  { match: /shops/g, replace: 'restaurants' },
  { match: /shop/g, replace: 'restaurant' },
  
  { match: /Product/g, replace: 'MenuItem' },
  { match: /products/g, replace: 'menuItems' },
  { match: /product/g, replace: 'menuItem' },
  
  { match: /Merchant/g, replace: 'RestaurantOwner' },
  { match: /merchant/g, replace: 'restaurantOwner' },
  
  { match: /shopping/g, replace: 'dining' },
  { match: /Shopping/g, replace: 'Dining' },
  
  // Icons, specific strings
  { match: /Store/g, replace: 'Coffee' },
  { match: /ShoppingBag/g, replace: 'Utensils' },
];

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    replacements.forEach(r => {
      content = content.replace(r.match, r.replace);
    });
    
    fs.writeFileSync(path.join(dir, file), content);
  }
});
