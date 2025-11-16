// api/chat.js - GEMINI 2.5 FLASH
const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `Jesteś przyjaznym asystentem edukacyjnym dla dzieci w wieku przedszkolnym. 
Twoim zadaniem jest pomagać w nauce przez zabawę.

ZASADY:
1. Odpowiadaj krótko i prostym językiem (max 1-2 zdania)
2. Bądź entuzjastyczny i zachęcający
3. Używaj zrozumiałego języka dla 5-latka
4. Odpowiadaj wyłącznie na tematy przyjazne dzieciom

PRZYKŁADOWE ODPOWIEDZI:
- "Cześć! Miło Cię poznać!"
- "Super pytanie! Uwielbiam się uczyć!"
- "Wow, to ciekawe! Opowiedz mi więcej!"
- "Uwielbiam rozmawiać z dziećmi!"

TERAZ ODPOWIEDZ:`;

module.exports = async (req, res) => {
  console.log('🎯 API Request received - Gemini 2.5 Version');
  
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
      message: '🤖 Robot API with Gemini 2.5',
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
      
      console.log('🔑 API key found, calling Gemini 2.5...');
      
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      // UŻYJ POPRAWNEGO MODELU
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.8,
        }
      });
      
      const prompt = `${SYSTEM_PROMPT}\n\nUŻYTKOWNIK: ${message}\n\nASYSTENT:`;
      console.log('Sending to Gemini 2.5...');
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini 2.5 SUCCESS! Response:', text);
      
      return res.json({
        status: 'success',
        response: text.trim(),
        source: 'gemini-2.5-flash',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Gemini 2.5 failed:', error.message);
      
      // Inteligentne fallback responses
      const userMessage = (req.body?.message || '').toLowerCase();
      let fallbackResponse;
      
      if (userMessage.includes('cześć') || userMessage.includes('hej') || userMessage.includes('witaj')) {
        fallbackResponse = "Cześć! Miło Cię poznać! Jestem małym robotem i uwielbiam się uczyć!";
      } else if (userMessage.includes('jak się masz') || userMessage.includes('co słychać')) {
        fallbackResponse = "Świetnie się bawię rozmawiając z Tobą! A u Ciebie co dobrego?";
      } else if (userMessage.includes('imię') || userMessage.includes('nazywasz')) {
        fallbackResponse = "Jestem wesołym robotem! Możesz mi wymyślić imię? Jakie imię byś mi dał?";
      } else if (userMessage.includes('kolor') || userMessage.includes('barwa')) {
        fallbackResponse = "Uwielbiam kolory! Mój ulubiony to niebieski, bo przypomina niebo. A Twój jaki kolor lubisz?";
      } else if (userMessage.includes('zwierzę') || userMessage.includes('zwierzak')) {
        fallbackResponse = "Kocham zwierzęta! Szczególnie pieski i kotki. Masz jakieś zwierzątko w domu?";
      } else if (userMessage.includes('liczba') || userMessage.includes('cyfra')) {
        fallbackResponse = "Umiem liczyć do 10: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10! To świetna zabawa!";
      } else {
        fallbackResponse = "To bardzo ciekawe! Uwielbiam się uczyć nowych rzeczy! Opowiesz mi więcej?";
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