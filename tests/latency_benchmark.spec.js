/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  RONDA – Latency Benchmark Test
 * ─────────────────────────────────────────────────────────────────────────────
 *  Measures the real-world response times of www.playronda.ma.
 *  Run this test whenever you make server changes to compare performance.
 *
 *  Usage:
 *    npx playwright test tests/latency_benchmark.spec.js --reporter=list
 *
 *  Results are saved to:
 *    test-results/latency_benchmark.json   ← all historical runs
 *    test-results/latency_latest.json      ← only the most recent run
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';

// ── Configuration ────────────────────────────────────────────────────────────
const FRONTEND_URL = 'https://www.playronda.ma';
const BACKEND_URL = 'https://ronda-backend.up.railway.app';
const SAMPLE_COUNT = 10; // Number of requests per metric (higher = more accurate)
const RESULTS_DIR = 'test-results';
const HISTORY_FILE = `${RESULTS_DIR}/latency_benchmark.json`;
const LATEST_FILE = `${RESULTS_DIR}/latency_latest.json`;

// ── Helper: measure N sequential fetch requests, return stats ─────────────────
async function measureEndpoint(request, url, label, count = SAMPLE_COUNT) {
  const times = [];
  let errors = 0;

  for (let i = 0; i < count; i++) {
    const start = Date.now();
    try {
      await request.get(url, { timeout: 10_000 });
    } catch {
      errors++;
    }
    times.push(Date.now() - start);
    // Small gap to avoid server-side rate limiting
    await new Promise(r => setTimeout(r, 150));
  }

  const valid = times.filter((_, i) => i >= errors);
  const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : null;
  const min = valid.length ? Math.min(...valid) : null;
  const max = valid.length ? Math.max(...valid) : null;
  const p95 = valid.length
    ? valid.sort((a, b) => a - b)[Math.floor(valid.length * 0.95)] ?? max
    : null;

  return { label, url, samples: count, errors, avg, min, max, p95, rawMs: times };
}

// ── Helper: measure browser page load via Navigation Timing API ───────────────
async function measurePageLoad(page, url) {
  await page.goto(url, { waitUntil: 'load', timeout: 30_000 });

  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return {
      dnsMs: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
      tcpMs: Math.round(nav.connectEnd - nav.connectStart),
      tlsMs: Math.round(nav.connectEnd - nav.secureConnectionStart),
      ttfbMs: Math.round(nav.responseStart - nav.requestStart),
      domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      fullyLoadedMs: Math.round(nav.loadEventEnd - nav.startTime),
    };
  });

  return timing;
}

// ── Helper: measure WebSocket connection setup time ───────────────────────────
async function measureWebSocketSetup(page) {
  // Navigate to the game page first
  await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded', timeout: 20_000 });

  const wsResult = await page.evaluate((backendUrl) => {
    return new Promise((resolve) => {
      const start = Date.now();
      const wsUrl = backendUrl
        .replace('https://', 'wss://')
        .replace('http://', 'ws://');

      try {
        const ws = new WebSocket(`${wsUrl}/socket.io/?EIO=4&transport=websocket`);
        ws.onopen = () => {
          const ms = Date.now() - start;
          ws.close();
          resolve({ ms, success: true });
        };
        ws.onerror = () => {
          resolve({ ms: Date.now() - start, success: false, error: 'WebSocket error' });
        };
        setTimeout(() => {
          ws.close();
          resolve({ ms: Date.now() - start, success: false, error: 'Timeout after 8s' });
        }, 8000);
      } catch (e) {
        resolve({ ms: null, success: false, error: String(e) });
      }
    });
  }, BACKEND_URL);

  return wsResult;
}

// ── Helper: save results to disk ──────────────────────────────────────────────
function saveResults(results) {
  if (!existsSync(RESULTS_DIR)) mkdirSync(RESULTS_DIR, { recursive: true });

  // Save latest run
  writeFileSync(LATEST_FILE, JSON.stringify(results, null, 2), 'utf-8');

  // Append to history file
  let history = [];
  if (existsSync(HISTORY_FILE)) {
    try { history = JSON.parse(readFileSync(HISTORY_FILE, 'utf-8')); } catch { /* first run */ }
  }
  history.push(results);
  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

// ── Helper: compare with last run ─────────────────────────────────────────────
function loadHistory() {
  if (!existsSync(HISTORY_FILE)) return [];
  try { return JSON.parse(readFileSync(HISTORY_FILE, 'utf-8')); } catch { return []; }
}

// ═════════════════════════════════════════════════════════════════════════════
//  TESTS
// ═════════════════════════════════════════════════════════════════════════════

test.describe('🏎️  Latency Benchmark – www.playronda.ma', () => {
  test.setTimeout(120_000); // 2 min budget per test

  let allResults = {};

  // ── 1. API Endpoints (HTTP Response Times) ─────────────────────────────────
  test('Backend API – Response Time Measurement', async ({ request }) => {
    console.log(`\n📡 Measuring backend API latency (${SAMPLE_COUNT} samples each)...\n`);

    const gamesEndpoint = await measureEndpoint(
      request,
      `${BACKEND_URL}/games/ronda`,
      'GET /games/ronda (match list)'
    );

    console.log(`  ✔ ${gamesEndpoint.label}`);
    console.log(`     avg: ${gamesEndpoint.avg}ms | min: ${gamesEndpoint.min}ms | max: ${gamesEndpoint.max}ms | p95: ${gamesEndpoint.p95}ms`);

    allResults.backendApi = { gamesEndpoint };

    // Basic sanity: the endpoint should respond in under 3 seconds on average
    expect(gamesEndpoint.avg).toBeLessThan(3000);
  });

  // ── 2. Frontend Page Load (Real Browser Navigation) ────────────────────────
  test('Frontend – Full Page Load Timing', async ({ page }) => {
    console.log(`\n🌐 Measuring full page load at ${FRONTEND_URL}...\n`);

    const timing = await measurePageLoad(page, FRONTEND_URL);

    console.log(`  DNS Resolution:       ${timing.dnsMs}ms`);
    console.log(`  TCP Handshake:        ${timing.tcpMs}ms`);
    console.log(`  TLS Handshake:        ${timing.tlsMs}ms`);
    console.log(`  Time To First Byte:   ${timing.ttfbMs}ms`);
    console.log(`  DOM Content Loaded:   ${timing.domContentLoadedMs}ms`);
    console.log(`  Fully Loaded:         ${timing.fullyLoadedMs}ms`);

    // Wait for main UI to render
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 });
    console.log(`\n  ✅ Page rendered successfully.`);

    allResults.pageLoad = timing;
  });

  // ── 3. WebSocket Connection Setup ─────────────────────────────────────────
  test('WebSocket – Connection Setup Time', async ({ page }) => {
    console.log(`\n🔌 Measuring WebSocket connection setup to ${BACKEND_URL}...\n`);

    const ws = await measureWebSocketSetup(page);

    if (ws.success) {
      console.log(`  WebSocket connected in: ${ws.ms}ms ✅`);
    } else {
      console.log(`  WebSocket failed: ${ws.error} ⚠️ (${ws.ms}ms)`);
    }

    allResults.websocket = ws;
  });

  // ── 4. Save Results & Print Summary ───────────────────────────────────────
  test('📊 Summary & Benchmark Report', async ({ request }) => {
    // Do a final single request for a clean, representative measurement
    const now = new Date().toISOString();
    const finalCheck = await measureEndpoint(request, `${BACKEND_URL}/games/ronda`, 'Final check', 5);

    // Load previous run for comparison
    const history = loadHistory();
    const prevRun = history.length > 1 ? history[history.length - 2] : null;

    const results = {
      timestamp: now,
      version: '0.5.7',
      target: FRONTEND_URL,
      backend: BACKEND_URL,
      samples: SAMPLE_COUNT,
      backendApiAvgMs: finalCheck.avg,
      backendApiMinMs: finalCheck.min,
      backendApiP95Ms: finalCheck.p95,
      ...allResults,
    };

    saveResults(results);

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  🏁 BENCHMARK SUMMARY – ${now}`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`  Target:             ${FRONTEND_URL}`);
    console.log(`  Backend API avg:    ${finalCheck.avg}ms`);
    console.log(`  Backend API min:    ${finalCheck.min}ms`);
    console.log(`  Backend API p95:    ${finalCheck.p95}ms`);

    if (prevRun && prevRun.backendApiAvgMs != null) {
      const diff = finalCheck.avg - prevRun.backendApiAvgMs;
      const arrow = diff <= 0 ? '⬇️ IMPROVED' : '⬆️ SLOWER';
      console.log(`\n  vs. previous run (${prevRun.timestamp.slice(0, 10)}):`);
      console.log(`    API avg delta:  ${diff > 0 ? '+' : ''}${diff}ms  ${arrow}`);
    } else {
      console.log(`\n  (No previous run to compare – this is your baseline)`);
    }

    console.log(`\n  Results saved to:`);
    console.log(`    ${LATEST_FILE}`);
    console.log(`    ${HISTORY_FILE}`);
    console.log(`${'═'.repeat(60)}\n`);
  });
});
