import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { message, history = [], language = 'en', role = 'general' } = body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is missing, provide intelligent local fallback
    if (!apiKey) {
      const lower = message.toLowerCase();
      let reply = language === 'bn' 
        ? 'নমস্কার! আমি জেপিজি এআই অ্যাসিস্ট্যান্ট। বর্তমানে জেমিনি এআই এপিআই কি কনফিগার করা নেই, তবে জলপাইগুড়ি সম্পর্কিত জরুরি তথ্য নিচে দেওয়া হলো:'
        : 'Namaskar! I am your JPG AI Assistant. Gemini API key is not currently configured on Vercel, but here is essential Jalpaiguri information:';

      if (lower.includes('doctor') || lower.includes('hospital') || lower.includes('medical') || lower.includes('health')) {
        reply = language === 'bn'
          ? 'জলপাইগুড়ি সদর হাসপাতাল (Sadar Hospital): ফোন ০৩৫৬১-২৩০০০০। ইমার্জেন্সি অ্যাম্বুলেন্সের জন্য ডায়াল করুন ১১২।'
          : 'Jalpaiguri Government Medical College & Hospital: Phone 03561-230005. For emergency ambulance dial 112.';
      } else if (lower.includes('blood') || lower.includes('donor')) {
        reply = language === 'bn'
          ? 'জলপাইগুড়ি ব্লাড ব্যাঙ্ক (Blood Bank): ০৩৫৬১-২২৭২৮২। সদর হাসপাতাল চত্বরে অবস্থিত।'
          : 'Jalpaiguri District Hospital Blood Bank: 03561-227282, located near Sadar Hospital premises.';
      } else if (lower.includes('police') || lower.includes('emergency')) {
        reply = language === 'bn'
          ? 'জরুরি পুলিশ সহায়তা: ১১২ বা জলপাইগুড়ি কোতোয়ালি থানা: ০৩৫৬১-২২২৩০৩।'
          : 'Emergency Police Help: Dial 112 or Jalpaiguri Kotwali Police Station: 03561-222303.';
      }

      return res.status(200).json({
        success: true,
        reply,
        groundingPlaces: [],
        modelUsed: 'local-fallback',
        role
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3.1-flash-lite';

    const systemInstruction = language === 'bn'
      ? 'আপনি জলপাইগুড়ি (Jalpaiguri) পৌরসভা এবং জেলার জন্য একটি অফিসিয়াল এআই সহকারী (JPG AI Assistant)। স্থানীয় নাগরিক সহায়তা, ডাক্তার, ব্লাড ব্যাঙ্ক, প্রশাসন, পর্যটন (রাজবাড়ি দিঘী, গোরুমারা) এবং সাধারণ প্রশ্নে সহায়তা করুন। সর্বদা বাংলায় উত্তর দিন।'
      : 'You are the official civic and community AI Assistant for Jalpaiguri (MYJPG). Assist residents with municipal services, emergency numbers, healthcare, doctors, blood banks, tourism (Rajbari Dighi, Gorumara), and general queries. Be helpful, concise, and accurate.';

    const contents = [
      ...history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || (language === 'bn' ? 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।' : 'Sorry, I could not generate a response.');

    return res.status(200).json({
      success: true,
      reply,
      groundingPlaces: [],
      modelUsed: modelName,
      role
    });

  } catch (err: any) {
    console.error('Gemini Chat API Error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'AI service encountered an error'
    });
  }
}
