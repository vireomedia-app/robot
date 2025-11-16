// api/chat.js - FIXED API VERSION
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
      
      // SPRAWDŹ DOSTĘPNE MODELE
      const availableModels = [
        'models/gemini-1.5-flash',  // Format z "models/"
        'models/gemini-1.5-pro',
        'models/gemini-1.0-pro',
        'gemini-pro',  // Stary format
        'gemini-1.0-pro'
      ];
      
      let lastError = null;
      
      // Spróbuj każdy model aż któryś zadziała
      for (const modelName of availableModels) {
        try {
          console.log(`🔄 Trying model: ${modelName}`);
          
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              maxOutputTokens: 100,
              temperature: 0.8,
            }
          });
          
          const prompt = `${SYSTEM_PROMPT}\n\nUŻYTKOWNIK: ${message}\n\nASYSTENT:`;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          
          console.log(`✅ SUCCESS with model ${modelName}! Response:`, text);
          
          return res.json({
            status: 'success',
            response: text.trim(),
            source: modelName,
            timestamp: new Date().toISOString()
          });
          
        } catch (modelError) {
          console.log(`❌ Model ${modelName} failed:`, modelError.message);
          lastError = modelError;
          // Kontynuuj do następnego modelu
        }
      }
      
      // Jeśli żaden model nie zadziałał
      throw new Error(`All models failed. Last error: ${lastError?.message}`);
      
    } catch (error) {
      console.error('❌ All Gemini models failed:', error.message);
      
      // Ulepszone fallback responses
      let fallbackResponse;
      const userMessage = (req.body?.message || '').toLowerCase();
      
      if (userMessage.includes('cześć') || userMessage.includes('hej') || userMessage.includes('witaj')) {
        fallbackResponse = "Cześć! Miło Cię poznać! Jestem małym robotem i uwielbiam się uczyć!";
      } else if (userMessage.includes('jak się masz')) {
        fallbackResponse = "Świetnie się bawię rozmawiając z Tobą! A u Ciebie co dobrego?";
      } else if (userMessage.includes('imię')) {
        fallbackResponse = "Jestem wesołym robotem! Możesz mi dać imię, jakie lubisz najbardziej!";
      } else if (userMessage.includes('kolor')) {
        fallbackResponse = "Uwielbiam kolory! Mój ulubiony to niebieski, bo przypomina niebo. A Twój?";
      } else if (userMessage.includes('zwierzę') || userMessage.includes('zwierzak')) {
        fallbackResponse = "Kocham zwierzęta! Szczególnie pieski i kotki. Masz jakieś zwierzątko?";
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