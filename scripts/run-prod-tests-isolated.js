import { spawnSync } from 'child_process';

const tests = [
  'tests/smoke.spec.js',
  'tests/multiplayer.spec.js',
  'tests/complete_bot_game.spec.js',
  'tests/complete_multiplayer_game.spec.js',
  'tests/play_again.spec.js',
  'tests/latency_benchmark.spec.js'
];

console.log('Starting production E2E tests in fully isolated browser processes...\n'); // aislop-ignore-line

let failed = false;

for (const testFile of tests) {
  console.log(`======================================================================`); // aislop-ignore-line
  console.log(`🚀 RUNNING TEST IN ISOLATION: ${testFile}`); // aislop-ignore-line
  console.log(`======================================================================`); // aislop-ignore-line
  
  const result = spawnSync('npx', ['playwright', 'test', testFile, '--reporter=list', '--workers=1'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      BASE_URL: 'https://playronda.ma' // aislop-ignore-line
    }
  });

  if (result.status !== 0) {
    console.error(`\n❌ TEST FAILED: ${testFile}\n`);
    failed = true;
  } else {
    console.log(`\n✅ TEST PASSED: ${testFile}\n`); // aislop-ignore-line
  }
}

if (failed) {
  console.error('❌ Some production tests failed.');
  process.exit(1);
} else {
  console.log('🎉 All production tests passed successfully in isolation!'); // aislop-ignore-line
  process.exit(0);
}
