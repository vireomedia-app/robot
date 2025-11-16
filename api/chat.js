// api/chat.js - USING BUILT-IN FETCH (no dependencies needed)
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
  console.log('🎯 API Request received - Built-in Fetch Version');
  
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
      message: '🤖 Robot API with Built-in Fetch',
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.method === 'POST') {
    try {
      const { message } = req.body;
      console.log('User message:', message);
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured in environment variables');
      }
      
      console.log('🔑 API key found, making direct API call...');
      
      // Używamy wbudowanego fetch (dostępny w Node.js 18+)
      const apiEndpoints = [
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        'https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent'
      ];
      
      let lastError = null;
      
      for (const endpoint of apiEndpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${endpoint}`);
          
          const url = `${endpoint}?key=${process.env.GEMINI_API_KEY}`;
          const prompt = `${SYSTEM_PROMPT}\n\nUŻYTKOWNIK: ${message}\n\nASYSTENT:`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                maxOutputTokens: 100,
                temperature: 0.8,
              }
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('✅ API Response received');
          
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text;
            console.log(`✅ SUCCESS with endpoint ${endpoint}! Response:`, text);
            
            return res.json({
              status: 'success',
              response: text.trim(),
              source: 'direct-api',
              endpoint: endpoint,
              timestamp: new Date().toISOString()
            });
          } else {
            throw new Error('Invalid response format from Gemini API');
          }
          
        } catch (endpointError) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message);
          lastError = endpointError;
          // Kontynuuj do następnego endpointu
        }
      }
      
      // Jeśli wszystkie endpointy zawiodły
      throw new Error(`All API endpoints failed. Last error: ${lastError?.message}`);
      
    } catch (error) {
      console.error('❌ All direct API calls failed:', error.message);
      
      // Inteligentne fallback responses
      const userMessage = (req.body?.message || '').toLowerCase();
      let fallbackResponse;
      
      if (userMessage.includes('cześć') || userMessage.includes('hej') || userMessage.includes('witaj')) {
        fallbackResponse = "Cześć! Miło Cię poznać! Jestem małym robotem i uwielbiam się uczyć!";
      } else if (userMessage.includes('jak się masz')) {
        fallbackResponse = "Świetnie się bawię rozmawiając z Tobą! A u Ciebie co dobrego?";
      } else if (userMessage.includes('imię') || userMessage.includes('nazywasz')) {
        fallbackResponse = "Jestem wesołym robotem! Możesz mi dać imię, jakie lubisz najbardziej!";
      } else if (userMessage.includes('kolor') || userMessage.includes('barwa')) {
        fallbackResponse = "Uwielbiam kolory! Mój ulubiony to niebieski, bo przypomina niebo. A Twój?";
      } else if (userMessage.includes('zwierzę') || userMessage.includes('zwierzak')) {
        fallbackResponse = "Kocham zwierzęta! Szczególnie pieski i kotki. Masz jakieś zwierzątko?";
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