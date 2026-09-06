const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const newValidation = `
    function isValidRestaurant(data) {
      return data.keys().hasAll(['ownerId', 'name', 'category', 'address', 'locality', 'pincode', 'lat', 'lng']) &&
             data.ownerId == request.auth.uid &&
             data.name is string && data.name.size() <= 100 &&
             data.category is string && data.category.size() <= 100 &&
             data.address is string && data.address.size() <= 300 &&
             data.lat is number && data.lng is number;
    }

    function isValidMenuItem(data) {
      return data.keys().hasAll(['restaurantId', 'ownerId', 'name', 'category', 'price']) &&
             data.ownerId == request.auth.uid &&
             data.restaurantId is string && data.restaurantId.size() <= 100 &&
             data.name is string && data.name.size() <= 100 &&
             data.category is string && data.category.size() <= 100 &&
             data.price is number;
    }
`;

code = code.replace("    // --- COLLECTION RULES ---", newValidation + "\n    // --- COLLECTION RULES ---");

const newRules = `
    match /restaurants/{restaurantId} {
      allow read: if true;
      allow create: if isSignedIn() && isValidRestaurant(incoming());
      allow update: if (isOwner(existing().ownerId) || isAdmin());
      allow delete: if isOwner(existing().ownerId) || isAdmin();
      
      match /menuItems/{menuItemId} {
        allow read: if true;
        allow create: if isSignedIn() && isValidMenuItem(incoming());
        allow update: if (isOwner(existing().ownerId) || isAdmin());
        allow delete: if isOwner(existing().ownerId) || isAdmin();
      }
    }
`;

code = code.replace("    match /shops/{shopId} {", newRules + "\n    match /shops/{shopId} {");

fs.writeFileSync('firestore.rules', code);
