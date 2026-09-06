const fs = require('fs');
let config = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf8'));

config.entities.Restaurant = {
  "title": "Restaurant",
  "description": "Restaurant or Cafe listing",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "ownerId": { "type": "string" },
    "ownerName": { "type": "string" },
    "name": { "type": "string" },
    "category": { "type": "string" },
    "description": { "type": "string" },
    "address": { "type": "string" },
    "locality": { "type": "string" },
    "pincode": { "type": "string" },
    "lat": { "type": "number" },
    "lng": { "type": "number" },
    "phone": { "type": "string" },
    "photoUrl": { "type": "string" },
    "isVerified": { "type": "boolean" },
    "status": { "type": "string", "enum": ["pending", "verified", "rejected", "suspended"] },
    "rating": { "type": "number" },
    "reviewCount": { "type": "number" },
    "createdAt": { "type": "string", "format": "date-time" }
  },
  "required": ["ownerId", "name", "category", "address", "locality", "pincode", "lat", "lng"]
};

config.entities.MenuItem = {
  "title": "MenuItem",
  "description": "Menu item inside a restaurant",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "restaurantId": { "type": "string" },
    "ownerId": { "type": "string" },
    "name": { "type": "string" },
    "nameBn": { "type": "string" },
    "category": { "type": "string" },
    "price": { "type": "number" },
    "isVeg": { "type": "boolean" },
    "isEgg": { "type": "boolean" },
    "inStock": { "type": "boolean" },
    "photoUrl": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" }
  },
  "required": ["restaurantId", "ownerId", "name", "category", "price", "createdAt"]
};

config.firestore["restaurants/{restaurantId}"] = {
  "schema": "Restaurant",
  "description": "Verified restaurants directory"
};

config.firestore["restaurants/{restaurantId}/menuItems/{menuItemId}"] = {
  "schema": "MenuItem",
  "description": "Menu items for a restaurant"
};

fs.writeFileSync('firebase-blueprint.json', JSON.stringify(config, null, 2));
