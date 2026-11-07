const express = require('express');
const geminiService = require('../services/geminiService');

const router = express.Router();

/**
 * POST /api/ai/test
 * Test endpoint to generate a customer support AI response.
 * Body: { message?: string, context?: string, model?: string }
 */
router.post('/test', async (req, res) => {
  const { message = 'Hello, I need help with my account.', context, model } = req.body || {};

  try {
    const result = await geminiService.generateSupportResponse(message, {
      context,
      model
    });

    res.status(200).json({
      success: true,
      service: 'Google Gemini AI',
      model: result.model,
      query: message,
      response: result.text,
      usage: result.usage
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode || 500,
      details: err.originalError || null
    });
  }
});

/**
 * GET /api/ai/status
 * Verifies Gemini credentials and API reachability.
 */
router.get('/status', async (req, res) => {
  try {
    const check = await geminiService.testConnection();
    res.status(200).json({
      success: true,
      service: 'Google Gemini AI',
      ...check
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode || 500,
      details: err.originalError || null
    });
  }
});

module.exports = router;

