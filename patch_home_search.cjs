const fs = require('fs');
let code = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');
if (!code.includes('id="home-search-bar"')) {
  code = code.replace(
    'className="w-full bg-[#F8FAFC]',
    'id="home-search-bar"\n            className="w-full bg-[#F8FAFC]'
  );
  fs.writeFileSync('src/components/views/HomeView.tsx', code);
  console.log('Added id="home-search-bar" to HomeView.tsx');
}
