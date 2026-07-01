import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

const passcode = process.argv[2];

if (!passcode) {
  console.error('Usage: npm run hash-passcode -- <your-passcode>');
  process.exit(1);
}

bcrypt.hash(passcode, 12).then((hash: string) => {
  console.log('\nAdd this to your environment as OWNER_PASSCODE_HASH:\n');
  console.log(hash);
  console.log('');
});
