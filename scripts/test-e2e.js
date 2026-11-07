/**
 * End-to-End System Integration Test for RecallDesk AI
 * Verifies Backend, Hindsight Memory, Gemini AI, and Multi-Customer Isolation.
 */
const http = require('http');

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const parsedUrl = new URL(url);

    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 30000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    req.write(payload);
    req.end();
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = http.get({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

async function runTests() {
  console.log('=== RecallDesk AI End-to-End Verification Suite ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Health Check
  try {
    const health = await getJson('http://127.0.0.1:5000/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'Express Backend Health Check (/api/health)');
  } catch (err) {
    assert(false, `Express Backend Health Check failed: ${err.message}`);
  }

  // 2. Gemini AI Check
  try {
    const aiStatus = await getJson('http://127.0.0.1:5000/api/ai/status');
    assert(aiStatus.status === 200 && aiStatus.data.success, 'Google Gemini AI Service Connectivity (/api/ai/status)');
  } catch (err) {
    assert(false, `Gemini Service check failed: ${err.message}`);
  }

  // 3. Hindsight Memory Check
  try {
    const memStatus = await getJson('http://127.0.0.1:5000/api/memory/status');
    assert(memStatus.status === 200 && memStatus.data.connected, 'Vectorize Hindsight Engine Connectivity (/api/memory/status)');
  } catch (err) {
    assert(false, `Hindsight Service check failed: ${err.message}`);
  }

  // 4. Multi-Customer Bank Isolation Check
  const custA = 'test_cust_isolation_A';
  const custB = 'test_cust_isolation_B';

  try {
    // Retain secret fact in Customer A's bank
    const secretFact = 'Customer A secret code is DELTA_998811.';
    await postJson('http://127.0.0.1:5000/api/memory/retain', {
      customerId: custA,
      content: secretFact,
      async: false
    });

    // Query Customer B's bank for secret code
    const recallB = await postJson('http://127.0.0.1:5000/api/memory/recall', {
      customerId: custB,
      query: 'secret code'
    });

    const bResults = (recallB.data?.data?.results || []).map(r => r.text);
    const leaked = bResults.some(t => t.includes('DELTA_998811'));
    assert(!leaked, 'Customer Bank Isolation: Customer A memories NOT accessible to Customer B');
  } catch (err) {
    assert(false, `Customer isolation check failed: ${err.message}`);
  }

  // 5. Chat Endpoint & Memory Grounding Check
  try {
    const chatRes = await postJson('http://127.0.0.1:5000/api/chat', {
      customerId: 'demo_customer_01',
      message: 'My laptop restarted again. What should we do?'
    });

    assert(chatRes.status === 200 && chatRes.data.success, 'Chat Endpoint HTTP 200 (/api/chat)');
    assert(chatRes.data.recalledMemories && chatRes.data.recalledMemories.length > 0, 'Chat correctly retrieved memories from Hindsight');
    assert(chatRes.data.response && chatRes.data.response.length > 50, 'Chat produced a grounded AI response');
  } catch (err) {
    assert(false, `Chat endpoint test failed: ${err.message}`);
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

