
import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { apiKeyService } from '../../server/apiKeyService';

// Replicating helper functions
function formatGeminiHistory(
  history: Array<{ role: 'user' | 'model'; text: string }>,
  currentMessage: string
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(history)) {
    for (const item of history) {
      if (!item || !item.text || typeof item.text !== 'string') continue;
      const role: 'user' | 'model' = item.role === 'model' ? 'model' : 'user';

      if (contents.length === 0 && role === 'model') continue;

      const last = contents[contents.length - 1];
      if (last && last.role === role) {
        last.parts[0].text += `\n\n${item.text}`;
      } else {
        contents.push({ role, parts: [{ text: item.text }] });
      }
    }
  }

  const last = contents[contents.length - 1];
  if (last && last.role === 'user') {
    last.parts[0].text += `\n\n${currentMessage}`;
  } else {
    contents.push({ role: 'user', parts: [{ text: currentMessage }] });
  }

  while (contents.length > 0 && contents[0].role === 'model') contents.shift();

  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: currentMessage || 'Nomoshkar' }] });
  }
  return contents;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, history = [], role = 'general', modelType = 'general' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'A valid message string is required.' });
  }

  const ai = apiKeyService.getGeminiClient();
  let selectedModel = 'gemini-3.5-flash';
  if (modelType === 'complex' || modelType === 'pro') selectedModel = 'gemini-3.1-pro-preview';
  else if (modelType === 'fast' || modelType === 'lite') selectedModel = 'gemini-3.1-flash-lite';

  if (!ai) {
    return res.status(500).json({ error: 'Gemini API not configured.' });
  }

  try {
    const formattedContents = formatGeminiHistory(history, message);
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: { temperature: 0.7 }
    });

    return res.json({
      reply: response.text || 'Nomoshkar!',
      modelUsed: selectedModel,
      role
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({ error: 'Failed to get Gemini response.' });
  }
}
