'use server';

export async function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.NEXT_GEMINI_API_KEY;
  if (!key) {
    throw new Error('Gemini API Key is not configured');
  }
  return key;
}
