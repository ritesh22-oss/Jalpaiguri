const fs = require('fs');
let code = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

// Fix PackageCoffee, Search,
code = code.replace("PackageCoffee, Search,", "PackageSearch,");

fs.writeFileSync('src/components/views/HomeView.tsx', code);
