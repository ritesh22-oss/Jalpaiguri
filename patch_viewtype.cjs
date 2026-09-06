const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

const newViews = `  | 'transport'
  | 'transport-detail'
  | 'courier'
  | 'courier-detail'
  | 'add-courier'
  | 'education'
  | 'education-detail'
  | 'add-education'`;

code = code.replace("  | 'government'", newViews + "\n  | 'government'");
fs.writeFileSync('src/types/index.ts', code);
