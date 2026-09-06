const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const newValidation = `
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    const testDoc = doc(db, '_connection_test_', 'test');
    await getDoc(testDoc);
    return true;
  } catch (err: any) {
    // If it's a permission-denied error, we successfully connected to Firestore
    // but the rules (correctly) blocked us. This means the connection is working.
    if (err?.code === 'permission-denied' || (err?.message && err.message.includes('Missing or insufficient permissions'))) {
      return true;
    }
    console.error('Firestore connection validation failed:', err);
    return false;
  }
}
`;

code = code.replace(/export async function validateFirestoreConnection\(\)[\s\S]*?return false;\n  }\n}/, newValidation.trim());

fs.writeFileSync('src/lib/firebase.ts', code);
