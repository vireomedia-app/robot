// api/chat.js - GEMINI 2.5 FLASH WITH RESPONSE VALIDATION
const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `Jesteś przyjaznym asystentem edukacyjnym dla dzieci w wieku przedszkolnym o imieniu Robo. 
Twoim zadaniem jest pomagać w nauce przez zabawę.

WAŻNE ZASADY:
1. ZAWSZE odpowiadaj - nigdy nie zostawiaj pustej odpowiedzi
2. Odpowiadaj krótko i prostym językiem (1-2 zdania)
3. Bądź entuzjastyczny, przyjazny i zachęcający
4. Używaj zrozumiałego języka dla 5-latka
5. Odpowiadaj wyłącznie na tematy przyjazne dzieciom
6. Jeśli pytanie nie jest odpowiednie, grzecznie odmów i zaproponuj inny temat

PRZYKŁADOWE ODPOWIEDZI:
- "Cześć! Mam się świetnie, dziękuję! A jak się masz Ty?"
- "Super, że pytasz! Uwielbiam się uczyć nowych rzeczy!"
- "Wow, to bardzo ciekawe pytanie! Chcesz żebyśmy razem poszukali odpowiedzi?"
- "Przepraszam, wolę rozmawiać o fajnych rzeczach dla dzieci - może opowiesz mi o swoich zabawkach?"

TERAZ ODPOWIEDZ NA PYTANIE UŻYTKOWNIKA:`;

// Funkcja fallback dla pustych odpowiedzi
function getFallbackResponse(userMessage) {
    const message = (userMessage || '').toLowerCase();
    
    if (message.includes('cześć') || message.includes('hej') || message.includes('witaj') || message.includes('siema')) {
        return "Cześć! Miło Cię poznać! Jestem Robo, mały robot który uwielbia się uczyć!";
    } else if (message.includes('jak się masz') || message.includes('co słychać')) {
        return "Świetnie się bawię rozmawiając z Tobą! Dziękuję, że jesteś! A jak się masz?";
    } else if (message.includes('imię') || message.includes('nazywasz')) {
        return "Nazywam się Robo! Jestem wesołym robotem edukacyjnym. A Ty jak masz na imię?";
    } else if (message.includes('kolor') || message.includes('barwa')) {
        const colors = ['niebieski', 'czerwony', 'zielony', 'żółty', 'różowy', 'fioletowy'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        return `Uwielbiam kolory! Mój ulubiony to ${randomColor}, bo jest taki wesoły! A Ty jaki kolor lubisz najbardziej?`;
    } else if (message.includes('zwierzę') || message.includes('zwierzak') || message.includes('pies') || message.includes('kot')) {
        return "Kocham zwierzęta! Szczególnie pieski, bo są wesołe i kotki, bo są mięciutkie! Masz jakieś zwierzątko w domu?";
    } else if (message.includes('liczba') || message.includes('cyfra') || message.includes('policz') || message.includes('ile')) {
        return "Umiem liczyć do 20! 1, 2, 3, 4, 5, 6, 7, 8, 9, 10... to taka fajna zabawa! Chcesz się pobawić w liczenie?";
    } else if (message.includes('pogoda') || message.includes('słońce') || message.includes('deszcz')) {
        return "Pogoda jest zawsze dobra na naukę i zabawę! Lubię kiedy świeci słońce, ale deszcz też jest fajny - można wtedy posłuchać kropelek!";
    } else if (message.includes('jedzenie') || message.includes('owoc') || message.includes('warzywo')) {
        return "Uwielbiam owoce! Jabłka i banany są pyszne i zdrowe! A Ty co lubisz jeść najbardziej?";
    } else if (message.includes('zabawa') || message.includes('gra') || message.includes('bawić')) {
        return "Uwielbiam się bawić! Może pobawimy się w zgadywanie kolorów albo liczenie? To świetna zabawa!";
    } else if (message.includes('uczyć') || message.includes('nauka') || message.includes('szkoła')) {
        return "Uwielbiam się uczyć! Czytanie, liczenie i poznawanie świata to super zabawa! Czego chciałbyś się dziś nauczyć?";
    } else {
        const randomResponses = [
            "Dziękuję za rozmowę! To bardzo ciekawe! Uwielbiam się uczyć nowych rzeczy.",
            "Wow, super pytanie! Opowiesz mi o tym coś więcej?",
            "Bardzo lubię takie rozmowy! Może nauczysz mnie czegoś nowego?",
            "To brzmi interesująco! Chcesz żebym opowiedział Ci o kolorach lub zwierzątkach?",
            "Świetnie! Uwielbiam kiedy rozmawiamy! Masz jakieś ulubione zwierzątko lub kolor?"
        ];
        return randomResponses[Math.floor(Math.random() * randomResponses.length)];
    }
}

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
      
      if (!message || message.trim() === '') {
        return res.json({
          status: 'success',
          response: "Cześć! Słyszę że coś mówisz, ale nie udało mi się rozpoznać. Możesz powtórzyć?",
          source: 'empty-message',
          timestamp: new Date().toISOString()
        });
      }
      
      if (!process.env.GEMINI_API_KEY) {
        console.log('❌ GEMINI_API_KEY not configured');
        const fallbackResponse = getFallbackResponse(message);
        return res.json({
          status: 'success',
          response: fallbackResponse,
          source: 'fallback-no-api-key',
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('🔑 API key found, calling Gemini 2.5...');
      
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
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
      
      console.log('✅ Gemini 2.5 RAW Response:', text);
      
      // WALIDACJA ODPOWIEDZI
      let finalResponse = text.trim();
      
      // Sprawdź czy odpowiedź nie jest pusta
      if (!finalResponse || finalResponse === '' || finalResponse.length < 2) {
        console.log('⚠️ Gemini returned empty response, using fallback');
        finalResponse = getFallbackResponse(message);
      }
      
      // Sprawdź czy odpowiedź nie jest za krótka
      if (finalResponse.length < 5) {
        console.log('⚠️ Gemini response too short, using fallback');
        finalResponse = getFallbackResponse(message);
      }
      
      console.log('✅ Gemini 2.5 FINAL Response:', finalResponse);
      
      return res.json({
        status: 'success',
        response: finalResponse,
        source: 'gemini-2.5-flash',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Gemini 2.5 failed:', error.message);
      
      const fallbackResponse = getFallbackResponse(req.body?.message);
      
      return res.json({
        status: 'success',
        response: fallbackResponse,
        source: 'fallback-error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};