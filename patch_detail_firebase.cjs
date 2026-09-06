const fs = require('fs');
let code = fs.readFileSync('src/components/dining/RestaurantDetailView.tsx', 'utf8');

const importFirebase = `import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';`;

if (!code.includes('import { db }')) {
  code = code.replace("import { useApp } from '../../context/AppContext';", "import { useApp } from '../../context/AppContext';\n" + importFirebase);
}

const firebaseQuery = `
        const [restaurantRes, prodRes] = await Promise.all([
          fetch(\`/api/restaurants/\${restaurantId}\`).catch(() => null),
          fetch(\`/api/restaurants/\${restaurantId}/menuItems\`).catch(() => null)
        ]);
        
        let foundRestaurant: any = null;
        let foundMenuItems: any[] = [];
        
        try {
          // Fetch from Firebase directly for menu items
          const q = query(collection(db, 'restaurants', restaurantId, 'menuItems'));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            foundMenuItems.push({ id: doc.id, ...doc.data() });
          });
        } catch (e) {
          console.error("Error fetching menu items from firebase", e);
        }
`;

code = code.replace(/const \[restaurantRes, prodRes\] = await Promise\.all\(\[[\s\S]*?\]\);[\s\S]*?let foundRestaurant: any = null;[\s\S]*?let foundMenuItems: any\[\] = \[\];/, firebaseQuery);

fs.writeFileSync('src/components/dining/RestaurantDetailView.tsx', code);
