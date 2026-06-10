import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const testsDir = './tests';

// Dynamically read and sort all test files from the tests directory
const testFiles = fs.readdirSync(testsDir)
  .filter(file => file.endsWith('.spec.js'))
  .map(file => path.join(testsDir, file).replace(/\\/g, '/'))
  .sort();

console.log(`Starting all ${testFiles.length} local E2E tests in fully isolated browser processes...\n`);

let failed = false;

for (const testFile of testFiles) {
  console.log(`======================================================================`);
  console.log(`🚀 RUNNING TEST IN ISOLATION: ${testFile}`);
  console.log(`======================================================================`);
  
  const result = spawnSync('npx', ['playwright', 'test', testFile, '--reporter=list', '--workers=1'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env
    }
  });

  if (result.status !== 0) {
    console.error(`\n❌ TEST FAILED: ${testFile}\n`);
    failed = true;
  } else {
    console.log(`\n✅ TEST PASSED: ${testFile}\n`);
  }
}

if (failed) {
  console.error('❌ Some local tests failed.');
  process.exit(1);
} else {
  console.log('🎉 All local tests passed successfully in isolation!');
  process.exit(0);
}
