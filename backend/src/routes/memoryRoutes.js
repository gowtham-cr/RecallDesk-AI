const express = require('express');
const hindsightService = require('../services/hindsightService');

const router = express.Router();

/**
 * GET /api/memory/status
 * Verifies connectivity and retrieves API version & active features from Hindsight Cloud.
 */
router.get('/status', async (req, res) => {
  try {
    const status = await hindsightService.checkConnection();
    res.status(200).json({
      success: true,
      service: 'Vectorize Hindsight Cloud',
      ...status
    });
  } catch (err) {
    res.status(err.statusCode || 502).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode || 502,
      details: err.details || null
    });
  }
});

/**
 * POST /api/memory/retain
 * Stores customer interaction, profile facts, or support context in Hindsight.
 * Body: { customerId: string, content: string, context?: string, metadata?: object, async?: boolean }
 */
router.post('/retain', async (req, res) => {
  const { customerId, content, context, metadata, documentId, async: isAsync } = req.body || {};

  if (!customerId || typeof customerId !== 'string' || !customerId.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: customerId (must be a non-empty string).'
    });
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: content (must be a non-empty string).'
    });
  }

  try {
    const result = await hindsightService.retainCustomerMemory(customerId, content, {
      context,
      metadata,
      documentId,
      async: isAsync
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode || 500,
      bankId: err.bankId || null,
      details: err.details || null
    });
  }
});

/**
 * POST /api/memory/recall
 * Recalls relevant memories for a customer given a query or context.
 * Body: { customerId: string, query: string, types?: string[], maxTokens?: number }
 */
router.post('/recall', async (req, res) => {
  const { customerId, query, types, maxTokens } = req.body || {};

  if (!customerId || typeof customerId !== 'string' || !customerId.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: customerId (must be a non-empty string).'
    });
  }

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: query (must be a non-empty string).'
    });
  }

  try {
    const result = await hindsightService.recallCustomerMemory(customerId, query, {
      types,
      maxTokens
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode || 500,
      bankId: err.bankId || null,
      details: err.details || null
    });
  }
});

/**
 * GET /api/memory/recall
 * Convenience GET endpoint for querying memories via query string params.
 * Query: ?customerId=...&query=...
 */
router.get('/recall', async (req, res) => {
  const { customerId, query } = req.query || {};

  if (!customerId || typeof customerId !== 'string' || !customerId.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Missing required query parameter: customerId.'
    });
  }

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Missing required query parameter: query.'
    });
  }

  try {
    const result = await hindsightService.recallCustomerMemory(customerId, query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode || 500,
      bankId: err.bankId || null,
      details: err.details || null
    });
  }
});

module.exports = router;

