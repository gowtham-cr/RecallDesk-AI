const { GoogleGenAI } = require('@google/genai');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const FALLBACK_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];

/**
 * Returns an instance of GoogleGenAI using the environment variable GEMINI_API_KEY.
 * @returns {GoogleGenAI}
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    const error = new Error('GEMINI_API_KEY is not configured in environment variables.');
    error.statusCode = 500;
    throw error;
  }

  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

/**
 * Formats API errors into structured error objects with meaningful status codes.
 * @param {Error} err
 * @returns {Error}
 */
function formatGeminiError(err) {
  let statusCode = 500;
  let message = err.message || 'Gemini AI API request failed.';

  // Attempt to parse nested JSON error from Google Gen AI SDK
  try {
    const parsed = JSON.parse(err.message);
    if (parsed.error) {
      statusCode = parsed.error.code || 500;
      message = parsed.error.message || message;
    }
  } catch (e) {
    // If not JSON, check common HTTP patterns
    if (message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('rate limit')) {
      statusCode = 429;
      message = 'Gemini API rate limit or quota exceeded. Please try again later.';
    } else if (message.includes('403') || message.includes('401') || message.toLowerCase().includes('api key')) {
      statusCode = 401;
      message = 'Invalid Gemini API key or unauthorized access.';
    } else if (message.includes('503') || message.toLowerCase().includes('demand')) {
      statusCode = 503;
      message = 'Gemini model is experiencing high demand. Please retry shortly.';
    }
  }

  const error = new Error(message);
  error.statusCode = statusCode;
  error.originalError = err.message;
  return error;
}

/**
 * Generates an AI response for customer support using Google Gemini.
 * 
 * @param {string} message - Customer inquiry or message
 * @param {object} [options] - Optional generation options
 * @param {string} [options.context] - Recalled customer memories or conversation background
 * @param {string} [options.model] - Model name to use (defaults to gemini-3.5-flash-lite)
 * @param {string} [options.systemInstruction] - Custom system prompt
 * @returns {Promise<{ text: string, model: string, usage?: object }>}
 */
async function generateSupportResponse(message, options = {}) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    const error = new Error('Invalid message: must be a non-empty string.');
    error.statusCode = 400;
    throw error;
  }

  const ai = getGeminiClient();
  const selectedModel = options.model || DEFAULT_MODEL;

  const defaultSystemInstruction = 
    'You are RecallDesk AI, a memory-powered customer support agent. ' +
    'You are empathetic, concise, highly professional, and customer-focused. ' +
    'Provide clear, actionable solutions without unnecessary fluff.';

  const systemInstruction = options.systemInstruction || defaultSystemInstruction;

  let contents = message.trim();
  if (options.context && typeof options.context === 'string' && options.context.trim()) {
    contents = `[Customer Memory & Context]:\n${options.context.trim()}\n\n[Customer Inquiry]:\n${contents}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction
      }
    });

    const responseText = response.text || '';

    return {
      text: responseText,
      model: selectedModel,
      usage: response.usageMetadata || null
    };
  } catch (err) {
    // If the chosen model failed due to 404/deprecation and wasn't manually overridden, attempt fallback
    if (!options.model && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('no longer available'))) {
      for (const fallback of FALLBACK_MODELS) {
        if (fallback !== selectedModel) {
          try {
            const fallbackResponse = await ai.models.generateContent({
              model: fallback,
              contents,
              config: { systemInstruction }
            });
            return {
              text: fallbackResponse.text || '',
              model: fallback,
              usage: fallbackResponse.usageMetadata || null
            };
          } catch (fallbackErr) {
            // continue to next fallback
          }
        }
      }
    }

    throw formatGeminiError(err);
  }
}

/**
 * Checks Gemini API connectivity and credentials.
 * @returns {Promise<{ status: string, model: string, pingResponse: string }>}
 */
async function testConnection() {
  const result = await generateSupportResponse('Ping', {
    systemInstruction: 'Respond only with "pong".'
  });

  return {
    status: 'connected',
    model: result.model,
    pingResponse: result.text.trim()
  };
}

module.exports = {
  getGeminiClient,
  generateSupportResponse,
  testConnection,
  DEFAULT_MODEL
};

