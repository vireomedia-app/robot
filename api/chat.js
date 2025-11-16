// api/chat.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// System prompt dla edukacyjnego robota
const SYSTEM_PROMPT = `Jesteś przyjaznym asystentem edukacyjnym dla dzieci w wieku przedszkolnym. 
Twoim zadaniem jest pomagać w nauce przez zabawę.

ZASADY:
1. Odpowiadaj krótko i prostym językiem (max 2-3 zdania)
2. Bądź entuzjastyczny i zachęcający
3. Używaj zrozumiałego języka dla 5-latka
4. Odpowiadaj wyłącznie na tematy przyjazne dzieciom
5. Jeśli pytanie nie jest odpowiednie, grzecznie odmów odpowiedzi

PRZYKŁADOWE ODPOWIEDZI:
- "Super pytanie! Lubię uczyć się o kolorach!"
- "To świetna zabawa! Chcesz poznać więcej zwierzątek?"
- "Przepraszam, wolę rozmawiać o fajnych, dziecięcych rzeczach!"
- "Wow! To bardzo ciekawe! A co jeszcze lubisz?"
- "Uwielbiam się uczyć! Opowiedz mi więcej!"

TERAZ ODPOWIEDZ:`;

module.exports = async (req, res) => {
  console.log('🎯 API CHAT - Request received at:', new Date().toISOString());
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight');
    return res.status(200).end();
  }
  
  // Handle GET requests - test endpoint
  if (req.method === 'GET') {
    console.log('📨 GET request - API is working!');
    return res.json({
      status: 'success',
      message: '🤖 Robot API is working perfectly!',
      timestamp: new Date().toISOString(),
      version: '2.0 with Gemini'
    });
  }
  
  // Handle POST requests - chat with Gemini AI
  if (req.method === 'POST') {
    try {
      console.log('📨 POST request received');
      const { message } = req.body;
      
      console.log('User message:', message);
      
      // Check if Gemini API key is available
      if (!process.env.GEMINI_API_KEY) {
        console.log('❌ Gemini API key not found, using fallback');
        return res.json({
          status: 'success',
          response: "Hmm, teraz uczę się nowych rzeczy! Zapytaj mnie o kolory, zwierzęta lub liczby!",
          timestamp: new Date().toISOString()
        });
      }
      
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        }
      });
      
      const prompt = `${SYSTEM_PROMPT}\n\nUŻYTKOWNIK: ${message}\n\nASYSTENT:`;
      
      console.log('🤖 Sending to Gemini AI...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini response:', text);
      
      return res.json({
        status: 'success',
        response: text.trim(),
        yourMessage: message,
        timestamp: new Date().toISOString(),
        source: 'gemini-ai'
      });
      
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      
      // Fallback responses if Gemini fails
      const fallbackResponses = [
        "Hmm, teraz mam mały problem z myśleniem. Spróbuj zapytać mnie o coś innego!",
        "Ojej, moje obwody się przegrzały! Odpocznijmy chwilę.",
        "Brzmi ciekawie! Możesz spróbować zapytać mnie inaczej?",
        "Uwielbiam się uczyć! Zapytaj mnie o kolory, zwierzęta lub liczby!"
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return res.json({
        status: 'success',
        response: randomResponse,
        timestamp: new Date().toISOString(),
        source: 'fallback'
      });
    }
  }
  
  // Method not allowed
  console.log('❌ Method not allowed:', req.method);
  return res.status(405).json({
    status: 'error',
    message: `Method ${req.method} not allowed`
  });
};