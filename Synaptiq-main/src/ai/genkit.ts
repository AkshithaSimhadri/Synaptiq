import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {config} from 'dotenv';
config();

let keyIndex = 0;

function getApiKey(): string {
  const keysEnv = process.env.GEMINI_API_KEYS;
  if (keysEnv) {
    const apiKeys = keysEnv.split(',').map(key => key.trim()).filter(Boolean);
    if (apiKeys.length > 0) {
      const key = apiKeys[keyIndex];
      // Move to the next key for the next request
      keyIndex = (keyIndex + 1) % apiKeys.length; 
      return key;
    }
  }
  // Fallback to the single API key if the list is not available
  return process.env.GEMINI_API_KEY || '';
}

export const ai = genkit({
  plugins: [
    googleAI({
      requestMiddleware: (req) => {
        const apiKey = getApiKey();
        req.url = req.url.replace(/key=[^&]+/, `key=${apiKey}`);
        return req;
      },
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
