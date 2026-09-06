const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');
if (!content.includes('tourCompleted')) {
  content = content.replace(
    'export interface UserProfile {',
    'export interface UserProfile {\n  tourCompleted?: boolean;\n  tourVersion?: number;'
  );
  fs.writeFileSync('src/types/index.ts', content);
  console.log('Added tour fields to UserProfile in src/types/index.ts');
} else {
  console.log('tour fields already present in UserProfile');
}
