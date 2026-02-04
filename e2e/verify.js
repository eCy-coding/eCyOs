const { spawnSync } = require('child_process');
const path = require('path');
const assert = require('assert');

const CLI_PATH = path.resolve(__dirname, '../dist/cli.js');

function run(args) {
  return spawnSync('node', [CLI_PATH, ...args], { encoding: 'utf-8' });
}

// console.log('Starting Comprehensive E2E Verification...');

// 1. Basic Command Execution
{
  // console.log('[Test] Basic Command Execution');
  const res = run(['echo', 'hello world']);
  assert.strictEqual(res.status, 0, 'Exit code should be 0');
  assert.ok(res.stdout.includes('hello world'), 'Stdout should contain "hello world"');
}

// 2. JSON Output Format
{
  // console.log('[Test] JSON Output Flag');
  const res = run(['--json', 'echo json test']);
  assert.strictEqual(res.status, 0);
  try {
    const json = JSON.parse(res.stdout);
    assert.strictEqual(json.code, 0);
    assert.ok(json.stdout.includes('json test'));
  } catch (e) {
    assert.fail('Output was not valid JSON: ' + res.stdout);
  }
}

// 3. Answer Engine - Strict & Noisy
{
  // console.log('[Test] Answer Engine');
  const queries = [
    'Türkiye\'nin başkenti neresidir?',
    'TURKIYE BASKENTI NERESIDIR',
    'What is the capital of Turkey?',
    '  baskent... neresi ... turkiye?? '
  ];

  for (const q of queries) {
    const res = run(['ask', q]);
    assert.strictEqual(res.status, 0, `Failed for query: ${q}`);
    assert.strictEqual(res.stdout.trim(), 'Ankara', `Wrong answer for: ${q}`);
  }
}

// 4. Invalid Command Handling
{
  // console.log('[Test] Invalid Command');
  const res = run(['--json', 'command_that_does_not_exist']);
  assert.strictEqual(res.status, 127); // Standard exit code for command not found is usually 127
  const json = JSON.parse(res.stdout);
  assert.strictEqual(json.code, 127);
}

// 5. Environment Isolation
{
  // console.log('[Test] Environment Isolation');
  // Check if a random env let from host leaks in
  process.env.TEST_LEAK = 'leaked';
  const res = run(['env']);
  // The output should NOT contain TEST_LEAK
  assert.ok(!res.stdout.includes('TEST_LEAK'), 'Host environment variable leaked into isolated shell');
  
  // Check PATH is standard
  assert.ok(res.stdout.includes('PATH=/bin:/usr/bin:/usr/local/bin'), 'PATH was not set to standard value');
}

// console.log('All tests passed successfully! ✅');
