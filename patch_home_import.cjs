const fs = require('fs');
let code = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

if (!code.includes('Coffee')) {
  code = code.replace(/import \{([\s\S]*?)Search,/, "import {\n  Coffee,\n  Search,");
  fs.writeFileSync('src/components/views/HomeView.tsx', code);
}
