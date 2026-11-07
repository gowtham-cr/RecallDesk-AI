const express = require('express');
const chatService = require('../services/chatService');

const router = express.Router();

/**
 * POST /api/chat
 * Primary conversation endpoint for RecallDesk AI.
 * Receives customer message, retrieves Hindsight memory context,
 * prompts Gemini, retains the turn, and returns response with memory references.
 * 
 * Body: { customerId: string, message: string, metadata?: object }
 */
router.post('/', async (req, res) => {
  const { customerId, message, metadata } = req.body || {};

  if (!customerId || typeof customerId !== 'string' || !customerId.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid required field: customerId (must be a non-empty string).'
    });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid required field: message (must be a non-empty string).'
    });
  }

  try {
    const result = await chatService.processCustomerMessage({
      customerId,
      message,
      metadata
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode || 500,
      details: err.originalError || err.details || null
    });
  }
});

module.exports = router;

