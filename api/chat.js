// api/chat.js - USING CORRECT GEMINI 2.5 MODEL
const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `Jesteś przyjaznym asystentem edukacyjnym dla dzieci w wieku przedszkolnym. 
Twoim zadaniem jest pomagać w nauce przez zabawę.

ZASADY:
1. Odpowiadaj krótko i prostym językiem (max 1-2 zdania)
2. Bądź entuzjastyczny i zachęcający
3. Używaj zrozumiałego języka dla 5-latka
4. Odpowiadaj wyłącznie na tematy przyjazne dzieciom

TERAZ ODPOWIEDZ:`;

module.exports = async (req, res) => {
  console.log('🎯 API Request received - Gemini 2.5 Version');
  
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
      
      // UŻYJ POPRAWNEGO MODELU Z TWOJEGO KONTA
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",  // TEN MODEL JEST DOSTĘPNY W TWOIM KONCIE!
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
      
      // Fallback na wypadek błędu
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