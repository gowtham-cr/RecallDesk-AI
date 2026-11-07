const { HindsightClient, HindsightError } = require('@vectorize-io/hindsight-client');

/**
 * Lazily creates and returns a HindsightClient instance using environment variables.
 * @returns {HindsightClient}
 */
function getClient() {
  const baseUrl = process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io';
  const apiKey = process.env.HINDSIGHT_API_KEY;

  if (!apiKey) {
    const error = new Error('HINDSIGHT_API_KEY is not configured in environment variables.');
    error.statusCode = 500;
    throw error;
  }

  return new HindsightClient({
    baseUrl,
    apiKey: apiKey || undefined
  });
}

/**
 * Normalizes customer identifiers into a clean Hindsight bank ID.
 * @param {string} customerId
 * @returns {string}
 */
function formatCustomerBankId(customerId) {
  if (!customerId || typeof customerId !== 'string' || !customerId.trim()) {
    const error = new Error('Invalid customerId: must be a non-empty string.');
    error.statusCode = 400;
    throw error;
  }

  const sanitized = customerId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return sanitized.startsWith('customer-') ? sanitized : `customer-${sanitized}`;
}

/**
 * Verifies connectivity to the configured Hindsight Cloud deployment.
 * @returns {Promise<{ connected: boolean, apiVersion: string, features: object }>}
 */
async function checkConnection() {
  try {
    const client = getClient();
    const version = await client.getVersion();
    return {
      connected: true,
      apiVersion: version.api_version,
      features: version.features || {}
    };
  } catch (err) {
    const error = new Error(`Hindsight connectivity check failed: ${err.message}`);
    error.statusCode = err.statusCode || 502;
    error.details = err.details || null;
    throw error;
  }
}

/**
 * Retains memory/context for a specific customer.
 * 
 * @param {string} customerId - Customer identifier
 * @param {string} content - Customer interaction or note to store
 * @param {object} [options] - Optional retention metadata and parameters
 * @param {string} [options.context] - Surrounding context
 * @param {Record<string, string>} [options.metadata] - Key-value metadata
 * @param {string} [options.documentId] - Optional document correlation ID
 * @param {boolean} [options.async] - Whether to process asynchronously
 * @returns {Promise<import('@vectorize-io/hindsight-client').RetainResponse>}
 */
async function retainCustomerMemory(customerId, content, options = {}) {
  const bankId = formatCustomerBankId(customerId);

  if (!content || typeof content !== 'string' || !content.trim()) {
    const error = new Error('Invalid content: must be a non-empty string.');
    error.statusCode = 400;
    throw error;
  }

  const client = getClient();

  const retainOptions = {};
  if (options.context && typeof options.context === 'string') {
    retainOptions.context = options.context;
  }
  if (options.metadata && typeof options.metadata === 'object') {
    retainOptions.metadata = options.metadata;
  }
  if (options.documentId && typeof options.documentId === 'string') {
    retainOptions.documentId = options.documentId;
  }
  if (typeof options.async === 'boolean') {
    retainOptions.async = options.async;
  }

  try {
    const response = await client.retain(bankId, content.trim(), retainOptions);
    return response;
  } catch (err) {
    const error = new Error(err.message || 'Failed to retain customer memory in Hindsight.');
    error.statusCode = err.statusCode || 500;
    error.details = err.details || null;
    error.bankId = bankId;
    throw error;
  }
}

/**
 * Recalls relevant memories for a specific customer given a query.
 * 
 * @param {string} customerId - Customer identifier
 * @param {string} query - Natural language query or context to search against
 * @param {object} [options] - Optional recall parameters
 * @param {string[]} [options.types] - Memory types to recall ('world', 'experience', 'observation')
 * @param {number} [options.maxTokens] - Max token budget for recalled content
 * @returns {Promise<import('@vectorize-io/hindsight-client').RecallResponse>}
 */
async function recallCustomerMemory(customerId, query, options = {}) {
  const bankId = formatCustomerBankId(customerId);

  if (!query || typeof query !== 'string' || !query.trim()) {
    const error = new Error('Invalid query: must be a non-empty string.');
    error.statusCode = 400;
    throw error;
  }

  const client = getClient();

  const recallOptions = {};
  if (Array.isArray(options.types) && options.types.length > 0) {
    recallOptions.types = options.types;
  }
  if (typeof options.maxTokens === 'number' && options.maxTokens > 0) {
    recallOptions.maxTokens = options.maxTokens;
  }

  try {
    const response = await client.recall(bankId, query.trim(), recallOptions);
    return response;
  } catch (err) {
    const error = new Error(err.message || 'Failed to recall customer memory from Hindsight.');
    error.statusCode = err.statusCode || 500;
    error.details = err.details || null;
    error.bankId = bankId;
    throw error;
  }
}

module.exports = {
  getClient,
  formatCustomerBankId,
  checkConnection,
  retainCustomerMemory,
  recallCustomerMemory
};

