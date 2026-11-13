import { GoogleGenAI } from '@google/genai';

// Ordered list of active Gemini models for Google AI Studio
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash'
];

export default async function handler(req: any, res: any) {
  // Set permissive CORS headers for mobile WebView and web clients
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const {
      message,
      history = [],
      language = 'en',
      role = 'general',
      modelType = 'general'
    } = body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const apiKey =
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_API_KEY?.trim() ||
      process.env.AI_STUDIO_API_KEY?.trim();

    // Intelligent local fallback if API key is not configured
    if (!apiKey) {
      const lower = message.toLowerCase();
      let reply = language === 'bn' 
        ? 'নমস্কার! আমি MYJPG এআই অ্যাসিস্ট্যান্ট। জলপাইগুড়ি সম্পর্কিত জরুরি তথ্য নিচে দেওয়া হলো:'
        : 'Namaskar! I am your MYJPG AI Assistant. Here is essential Jalpaiguri community information:';

      if (lower.includes('doctor') || lower.includes('hospital') || lower.includes('medical') || lower.includes('health') || lower.includes('ডাক্তার') || lower.includes('হাসপাতাল')) {
        reply = language === 'bn'
          ? 'জলপাইগুড়ি সুপার স্পেশালিটি ও সদর হাসপাতাল (Sadar Hospital): ফোন ০৩৫৬১-২৩০০০০। জরুরি অ্যাম্বুলেন্সের জন্য ডায়াল করুন ১০২ বা ১১২।'
          : 'Jalpaiguri District Super Speciality & Sadar Hospital: 03561-230005 / 03561-227282. For emergency ambulance dial 102 or 112.';
      } else if (lower.includes('blood') || lower.includes('donor') || lower.includes('রক্ত')) {
        reply = language === 'bn'
          ? 'জলপাইগুড়ি সদর হাসপাতাল ব্লাড ব্যাঙ্ক: ০৩৫৬১-২২৭২৮২। এছাড়া MYJPG অ্যাপের Blood ট্যাবে গিয়ে রক্তদাতা খুঁজতে পারেন।'
          : 'Jalpaiguri Sadar Hospital Blood Bank: 03561-227282 (24x7). You can also explore real-time verified donors in the MYJPG Blood section.';
      } else if (lower.includes('police') || lower.includes('emergency') || lower.includes('পুলিশ')) {
        reply = language === 'bn'
          ? 'জরুরি পুলিশ সহায়তা: ১১২ বা জলপাইগুড়ি কোতোয়ালি থানা: ০৩৫৬১-২২২৩০৩ / ০৩৫৬১-২২২৩৩৩।'
          : 'Emergency Police Help: Dial 112 or Jalpaiguri Kotwali Police Station: 03561-222303 / 03561-222333.';
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

    // Comprehensive system prompt covering General, Jalpaiguri, and App questions
    const systemInstruction = language === 'bn'
      ? `আপনি MYJPG-এর অফিসিয়াল ইন্টেলিজেন্ট এআই সহকারী (MYJPG AI Assistant)। 
আপনার মূল দায়িত্বসমূহ:
1. সাধারণ প্রশ্নাবলী: বিজ্ঞান, প্রযুক্তি, গণিত, প্রোগ্রামিং (কোড ব্লক সহ), সাধারণ জ্ঞান এবং যেকোনো প্রশ্নের স্পষ্ট ও সঠিক উত্তর বাংলায় দিন।
2. জলপাইগুড়ি তথ্য: পৌরসভা, সরকারি পরিষেবা, হাসপাতাল, ব্লাড ব্যাঙ্ক, থানা ও পর্যটন (যেমন রাজবাড়ি দিঘী, তিস্তা ব্যারেজ, গোরুমারা) সম্পর্কিত সঠিক তথ্য দিন। কোনো তথ্য নিশ্চিত না হলে আন্দাজে বলবেন না।
3. MYJPG অ্যাপ নির্দেশিকা: অ্যাপের বিভিন্ন ফিচার (জরুরি সেবা, রক্তদান, দোকান ও খাদ্য, লোকাল সার্ভিসেস) ব্যবহার করতে ব্যবহারকারীদের সাহায্য করুন।
উত্তর সর্বদা মার্জিত, সুগঠিত ও পরিষ্কার বাংলায় প্রদান করুন। কোড থাকলে উপযুক্ত মার্কডাউন ব্যাকটিক্সে প্রদর্শন করুন।`
      : `You are the official, intelligent AI Assistant for MYJPG (Jalpaiguri Connected).
Your capabilities and guidelines:
1. General Questions: You are a fully capable AI assistant. Answer questions on science, technology, programming, mathematics, education, and general knowledge with clear explanations, structured paragraphs, lists, and markdown code blocks.
2. Jalpaiguri Civic & Community: Provide accurate, verified local information for Jalpaiguri municipality and district — including healthcare (District Sadar Hospital 03561-230005), blood banks (03561-227282), Kotwali Police (03561-222303, 112), and tourism (Rajbari Dighi, Teesta Embankment, Gorumara). Never invent fake contacts, numbers, or addresses.
3. MYJPG App Guidance: Explain how to navigate MYJPG features (Home, Blood Donors, Civic Reports, Local Shops, Dining, Verified Workers, Safety SOS).
4. Tone & Style: Be friendly, articulate, polite, and direct. Format responses with clean GitHub-flavored markdown.`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    let lastError: any = null;
    let selectedModel = CANDIDATE_MODELS[0];

    // Loop through candidate models with fallback for high demand (503), rate limits (429), or unavailable models
    for (const model of CANDIDATE_MODELS) {
      try {
        selectedModel = model;
        const response = await ai.models.generateContent({
          model: selectedModel,
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
          modelUsed: selectedModel,
          role
        });
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Chat API] Model ${model} failed, attempting next model if available. Error:`, err?.message || err);
        // Continue to next model in candidate list
      }
    }

    // If all candidate models failed, throw or respond with meaningful error
    console.error('[Gemini Chat API] All candidate models failed:', lastError);
    return res.status(500).json({
      success: false,
      error: lastError?.message || 'AI service temporarily unavailable. Please try again in a moment.'
    });

  } catch (err: any) {
    console.error('Gemini Chat API Error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'AI service encountered an error'
    });
  }
}
