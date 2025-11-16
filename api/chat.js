// api/chat.js - NATIVE HTTP MODULE (no dependencies)
const https = require('https');

const SYSTEM_PROMPT = `Jesteś przyjaznym asystentem edukacyjnym dla dzieci w wieku przedszkolnym. 
Twoim zadaniem jest pomagać w nauce przez zabawę.

ZASADY:
1. Odpowiadaj krótko i prostym językiem (max 1-2 zdania)
2. Bądź entuzjastyczny i zachęcający
3. Używaj zrozumiałego języka dla 5-latka
4. Odpowiadaj wyłącznie na tematy przyjazne dzieciom

TERAZ ODPOWIEDZ:`;

function makeGeminiRequest(apiKey, message) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [{
        parts: [{
          text: `${SYSTEM_PROMPT}\n\nUŻYTKOWNIK: ${message}\n\nASYSTENT:`
        }]
      }],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.8,
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200 && parsed.candidates && parsed.candidates[0]) {
            resolve(parsed.candidates[0].content.parts[0].text);
          } else {
            reject(new Error(`API Error: ${parsed.error?.message || 'Unknown error'}`));
          }
        } catch (e) {
          reject(new Error('Failed to parse API response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

module.exports = async (req, res) => {
  console.log('🎯 API Request received - Native HTTP Version');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.json({
      status: 'success',
      message: '🤖 Robot API with Native HTTP',
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.method === 'POST') {
    try {
      const { message } = req.body;
      console.log('User message:', message);
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
      }
      
      console.log('🔑 API key found, making native HTTP request...');
      
      const geminiResponse = await makeGeminiRequest(process.env.GEMINI_API_KEY, message);
      console.log('✅ Gemini SUCCESS! Response:', geminiResponse);
      
      return res.json({
        status: 'success',
        response: geminiResponse.trim(),
        source: 'gemini-native-http',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Gemini API failed:', error.message);
      
      // Inteligentne fallback
      const userMessage = (req.body?.message || '').toLowerCase();
      let fallbackResponse;
      
      if (userMessage.includes('cześć') || userMessage.includes('hej')) {
        fallbackResponse = "Cześć! Miło Cię poznać! Jestem małym robotem!";
      } else if (userMessage.includes('jak się masz')) {
        fallbackResponse = "Świetnie się bawię! A Ty jak się masz?";
      } else if (userMessage.includes('imię')) {
        fallbackResponse = "Jestem wesołym robotem! Jakie imię mi dasz?";
      } else if (userMessage.includes('kolor')) {
        fallbackResponse = "Uwielbiam kolory! Mój ulubiony to niebieski! A Twój?";
      } else if (userMessage.includes('zwierzę')) {
        fallbackResponse = "Kocham zwierzęta! Masz jakieś zwierzątko?";
      } else {
        fallbackResponse = "To bardzo ciekawe! Opowiesz mi więcej?";
      }
      
      return res.json({
        status: 'success',
        response: fallbackResponse,
        source: 'fallback',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};