const hindsightService = require('./hindsightService');
const geminiService = require('./geminiService');

/**
 * Orchestrates a complete customer support conversation turn:
 * 1. Recalls customer history and relevant memories from Hindsight.
 * 2. Formats memory context with strict support boundaries.
 * 3. Prompts Gemini with customer memory context to produce a personalized answer.
 * 4. Retains new interaction into customer Hindsight memory bank.
 * 5. Returns response with memory trace for frontend visibility.
 * 
 * @param {object} params
 * @param {string} params.customerId - Unique identifier for the customer
 * @param {string} params.message - Customer inquiry or problem report
 * @param {object} [params.metadata] - Optional additional interaction metadata
 * @returns {Promise<object>}
 */
async function processCustomerMessage({ customerId, message, metadata = {} }) {
  if (!customerId || typeof customerId !== 'string' || !customerId.trim()) {
    const error = new Error('Invalid customerId: must be a non-empty string.');
    error.statusCode = 400;
    throw error;
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    const error = new Error('Invalid message: must be a non-empty string.');
    error.statusCode = 400;
    throw error;
  }

  const cleanCustomerId = customerId.trim();
  const cleanMessage = message.trim();

  // 1. Retrieve relevant memories from Hindsight
  let recalledResults = [];
  let recalledEntities = {};
  let memoryError = null;

  try {
    const recallResponse = await hindsightService.recallCustomerMemory(cleanCustomerId, cleanMessage, {
      maxTokens: 1024
    });
    recalledResults = recallResponse.results || [];
    recalledEntities = recallResponse.entities || {};
  } catch (err) {
    console.error(`[ChatService] Memory recall warning for customer ${cleanCustomerId}:`, err.message);
    memoryError = err.message;
  }

  // 2. Format memory context
  const memoryFacts = recalledResults.map(r => r.text).filter(Boolean);
  let contextBlock = '';
  if (memoryFacts.length > 0) {
    contextBlock = memoryFacts.map(fact => `- ${fact}`).join('\n');
  }

  // 3. System instruction with explicit safety, memory, and groundedness rules
  const systemInstruction = 
    'You are RecallDesk AI, a memory-powered technical customer support specialist.\n' +
    'CRITICAL OPERATING PRINCIPLES:\n' +
    '1. MEMORY UTILIZATION: Review the provided [Customer Memory & Context]. Acknowledge known customer hardware, OS, and issues naturally.\n' +
    '2. NEVER REPEAT FAILED STEPS: If memory records that a troubleshooting step already failed (e.g. driver update), DO NOT instruct the customer to try it again. Instead, explicitly acknowledge the prior failure and recommend the next diagnostic step (e.g. checking Windows Event Viewer / minidump crash logs, testing RAM via Windows Memory Diagnostic, checking hardware thermals, or safe mode isolation).\n' +
    '3. NO INVENTED ACTIONS: NEVER claim or invent that a refund was issued, an account change was applied, or a hardware replacement was dispatched unless confirmed in memory or performed.\n' +
    '4. NO FALSE SUCCESS: Never claim an issue is resolved until the customer confirms it.\n' +
    '5. TONE: Empathetic, concise, clear, and step-by-step actionable.';

  // 4. Generate Gemini support response
  const aiResult = await geminiService.generateSupportResponse(cleanMessage, {
    context: contextBlock || undefined,
    systemInstruction
  });

  // 5. Retain the new interaction in Hindsight
  let retained = false;
  let retainError = null;

  try {
    const interactionSummary = `Customer reported: "${cleanMessage}". Support agent recommended: "${aiResult.text.slice(0, 300)}...".`;
    await hindsightService.retainCustomerMemory(cleanCustomerId, interactionSummary, {
      metadata: {
        source: 'support_chat',
        timestamp: new Date().toISOString(),
        ...metadata
      },
      async: false
    });
    retained = true;
  } catch (err) {
    console.error(`[ChatService] Memory retain warning for customer ${cleanCustomerId}:`, err.message);
    retainError = err.message;
  }

  // 6. Return response with memory references
  return {
    success: true,
    customerId: cleanCustomerId,
    message: cleanMessage,
    response: aiResult.text,
    model: aiResult.model,
    recalledMemories: memoryFacts,
    entities: Object.keys(recalledEntities),
    retained,
    warnings: memoryError || retainError ? { memoryError, retainError } : null,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  processCustomerMessage
};

