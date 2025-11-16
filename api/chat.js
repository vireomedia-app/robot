// api/chat.js - FIXED GEMINI MODEL
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
  console.log('🎯 API Request received');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.json({
      status: 'success',
      message: '🤖 Robot API with Gemini is ready!',
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
      
      console.log('🔑 API key found, calling Gemini...');
      
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      // UŻYJ POPRAWNEJ NAZWY MODELU
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",  // ZMIENIONE: gemini-1.5-flash zamiast gemini-pro
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.8,
        }
      });
      
      const prompt = `${SYSTEM_PROMPT}\n\nUŻYTKOWNIK: ${message}\n\nASYSTENT:`;
      console.log('Sending prompt to Gemini...');
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini SUCCESS! Response:', text);
      
      return res.json({
        status: 'success',
        response: text.trim(),
        source: 'gemini',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Gemini ERROR:', error.message);
      
      // Spróbuj z innym modelem jeśli pierwszy nie działa
      if (error.message.includes('not found') || error.message.includes('404')) {
        console.log('🔄 Trying with gemini-1.0-pro model...');
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ 
            model: "gemini-1.0-pro",  // ALTERNATYWNY MODEL
            generationConfig: {
              maxOutputTokens: 100,
              temperature: 0.8,
            }
          });
          
          const prompt = `${SYSTEM_PROMPT}\n\nUŻYTKOWNIK: ${message}\n\nASYSTENT:`;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          
          console.log('✅ Gemini 1.0-pro SUCCESS! Response:', text);
          
          return res.json({
            status: 'success',
            response: text.trim(),
            source: 'gemini-1.0-pro',
            timestamp: new Date().toISOString()
          });
          
        } catch (secondError) {
          console.error('❌ Gemini 1.0-pro also failed:', secondError.message);
        }
      }
      
      // Fallback responses
      const fallbackResponses = [
        "Cześć! Miło Cię poznać! Jestem małym robotem!",
        "Super! Uwielbiam się uczyć nowych rzeczy!",
        "Wow, to ciekawe! Opowiedz mi więcej!",
        "Uwielbiam rozmawiać z dziećmi! Masz jakieś ulubione zwierzątko?"
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return res.json({
        status: 'success',
        response: randomResponse,
        source: 'fallback',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};