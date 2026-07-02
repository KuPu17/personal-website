import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

const passcode = process.argv.slice(2).join(' ');

if (!passcode) {
  console.error('Usage: npm run hash-passcode -- <your-passcode>');
  console.error('  Use quotes for passcodes with spaces: npm run hash-passcode -- "my secret pass"');
  process.exit(1);
}

bcrypt.hash(passcode, 12).then((hash) => {
  const escaped = hash.replace(/\$/g, '\\$');
  console.log('\nAdd to .env (backslashes required — Next.js expands bare $):\n');
  console.log(`OWNER_PASSCODE_HASH=${escaped}`);
  console.log('\nAmplify / hosting console (no escaping needed):');
  console.log(`OWNER_PASSCODE_HASH=${hash}`);
  console.log('');
});
