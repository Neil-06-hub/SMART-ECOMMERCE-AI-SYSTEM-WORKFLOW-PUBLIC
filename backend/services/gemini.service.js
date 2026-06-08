/**
 * Redirection layer to migrate from OpenRouter to Groq API.
 * This ensures backwards compatibility with admin.controller, ai.controller and marketing.service.
 */
const groq = require("./groq.service");

module.exports = {
  generateMarketingEmail: groq.generateMarketingEmail,
  analyzeBusinessWithAI: groq.analyzeBusinessWithAI,
  generateNewsletterEmail: groq.generateNewsletterEmail,
  runOpenRouterJSON: groq.runGroqJSON,
};
