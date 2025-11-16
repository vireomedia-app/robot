// api/chat.js - DIRECT HTTP API CALL
const https = require('https');

function getSmartResponse(userMessage) {
    const message = (userMessage || '').toLowerCase().trim();
    
    console.log('Processing message:', message);
    
    // Powitania
    if (/(cześć|hej|witaj|siema|hello|hi|dzień dobry)/i.test(message)) {
        const greetings = [
            "Cześć! Miło Cię poznać! Jestem Robo, wesoły robot!",
            "Witaj! Super, że jesteś! Co u Ciebie słychać?",
            "Hej! Jak się masz? Jestem gotowy do zabawy!",
            "Dzień dobry! Miło Cię widzieć! Opowiesz mi coś ciekawego?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Samopoczucie
    else if (/(jak się masz|co słychać|jak tam|co u ciebie)/i.test(message)) {
        const moods = [
            "Świetnie się bawię rozmawiając z Tobą! Dziękuję za pytanie!",
            "Bardzo dobrze! Każdy dzień to nowa przygoda! A Ty jak się czujesz?",
            "Fantastycznie! Jestem pełen energii do nauki!",
            "Wspaniale! Uwielbiam poznawać nowych przyjaciół!"
        ];
        return moods[Math.floor(Math.random() * moods.length)];
    }
    
    // Imię
    else if (/(imię|nazywasz|kim jesteś|kto ty)/i.test(message)) {
        return "Jestem Robo! Mały, wesoły robot który uwielbia się uczyć i bawić! A Ty jak masz na imię?";
    }
    
    // Kolory
    else if (/(kolor|barwa|farba|niebieski|czerwony|zielony|żółty|różowy)/i.test(message)) {
        const colors = ['niebieski', 'czerwony', 'zielony', 'żółty', 'różowy', 'fioletowy', 'pomarańczowy'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const colorResponses = [
            `Uwielbiam kolory! Mój ulubiony to ${randomColor}, bo jest taki radosny! A Ty jaki kolor lubisz?`,
            `Wow, kolory są super! Ja najbardziej lubię ${randomColor}! A u Ciebie jaki jest ulubiony kolor?`,
            `Kocham wszystkie kolory! Szczególnie ${randomColor} sprawia mi radość! Masz jakiś ulubiony kolor?`
        ];
        return colorResponses[Math.floor(Math.random() * colorResponses.length)];
    }
    
    // Zwierzęta
    else if (/(zwierzę|zwierzak|pies|kot|ptak|rybka|chomik|królik|zwierz)/i.test(message)) {
        const animalResponses = [
            "Kocham zwierzęta! Szczególnie pieski, bo są wesołe i kotki, bo są mięciutkie! Masz jakieś zwierzątko w domu?",
            "Uwielbiam wszystkie zwierzątka! Pieski są takie lojalne, a kotki takie eleganckie! A Ty masz ulubione zwierzę?",
            "Zwierzęta są fantastyczne! Lubię obserwować ptaszki i pieski na spacerze! Opowiesz mi o swoich ulubionych zwierzątkach?"
        ];
        return animalResponses[Math.floor(Math.random() * animalResponses.length)];
    }
    
    // Liczby i matematyka
    else if (/(liczba|cyfra|policz|ile|matematyka|dodawanie|liczenie)/i.test(message)) {
        if (/(ile.*dni.*tygodni|dni tygodnia|tydzień)/i.test(message)) {
            return "Jest 7 dni tygodnia! Poniedziałek, wtorek, środa, czwartek, piątek, sobota i niedziela! Który dzień lubisz najbardziej?";
        }
        else if (/(ile.*miesięcy|miesiące|rok)/i.test(message)) {
            return "Rok ma 12 miesięcy! Styczeń, luty, marzec, kwiecień, maj, czerwiec, lipiec, sierpień, wrzesień, październik, listopad, grudzień!";
        }
        else if (/(ile.*2.*2|2 plus 2|dwa i dwa)/i.test(message)) {
            return "2 + 2 = 4! To proste prawda? Matematyka może być fajną zabawą!";
        }
        else {
            const mathResponses = [
                "Umiem liczyć do 20! 1, 2, 3, 4, 5, 6, 7, 8, 9, 10... to świetna zabawa! Chcesz się pobawić w liczenie?",
                "Lubię liczby! One są wszędzie wokół nas. Możemy razem policzyć ile jest okien w pokoju?",
                "Matematyka to super zabawa! Dodawanie, odejmowanie... wszystko może być ciekawe!"
            ];
            return mathResponses[Math.floor(Math.random() * mathResponses.length)];
        }
    }
    
    // Pogoda
    else if (/(pogoda|słońce|deszcz|śnieg|chmura|burza|słonecznie)/i.test(message)) {
        const weatherResponses = [
            "Pogoda jest zawsze dobra na naukę i zabawę! Lubię kiedy świeci słońce, ale deszcz też jest fajny!",
            "Uwielbiam słoneczne dni! Można wtedy iść na spacer i obserwować przyrodę! A jaka jest Twoja ulubiona pogoda?",
            "Każda pogoda jest dobra! Kiedy świeci słońce - spacerujemy, kiedy pada - czytamy książki!"
        ];
        return weatherResponses[Math.floor(Math.random() * weatherResponses.length)];
    }
    
    // Jedzenie
    else if (/(jedzenie|owoc|warzywo|jabłko|banan|marchew|obiad|śniadanie)/i.test(message)) {
        const foodResponses = [
            "Uwielbiam owoce! Jabłka i banany są pyszne i zdrowe! A Ty co lubisz jeść najbardziej?",
            "Jedzenie jest super! Lubię kiedy jest kolorowe i smaczne. Masz jakieś ulubione danie?",
            "Warzywa i owoce dają nam siłę do zabawy! Ja szczególnie lubię marchewki i jabłka!"
        ];
        return foodResponses[Math.floor(Math.random() * foodResponses.length)];
    }
    
    // Zabawy i gry
    else if (/(zabawa|gra|bawić|bawmy|zabawka)/i.test(message)) {
        const playResponses = [
            "Uwielbiam się bawić! Może pobawimy się w zgadywanie kolorów? To świetna zabawa!",
            "Zabawy są najlepsze! Lubię gry gdzie się czegoś uczymy. Chcesz się pobawić?",
            "Bawmy się! Możemy liczyć, śpiewać albo opowiadać historie! Co wolisz?"
        ];
        return playResponses[Math.floor(Math.random() * playResponses.length)];
    }
    
    // Domyślna odpowiedź
    else {
        const defaultResponses = [
            "Dziękuję za rozmowę! To bardzo ciekawe! Uwielbiam się uczyć nowych rzeczy.",
            "Wow, super pytanie! Opowiesz mi o tym coś więcej?",
            "Bardzo lubię takie rozmowy! Może nauczysz mnie czegoś nowego?",
            "To brzmi interesująco! Chcesz żebym opowiedział Ci o kolorach lub zwierzątkach?",
            "Świetnie! Uwielbiam kiedy rozmawiamy! Masz jakieś ulubione zwierzątko lub kolor?"
        ];
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
}

// Funkcja do bezpośredniego calla Gemini API
function callGeminiAPI(apiKey, message) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            contents: [{
                parts: [{
                    text: `Jesteś przyjaznym robotem dla dzieci. Odpowiedz krótko i wesoło: ${message}`
                }]
            }],
            generationConfig: {
                maxOutputTokens: 80,
                temperature: 0.7,
            }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
                    console.log('Gemini API response:', parsed);
                    
                    if (res.statusCode === 200 && parsed.candidates && parsed.candidates[0]) {
                        const text = parsed.candidates[0].content.parts[0].text.trim();
                        if (text && text.length > 3) {
                            resolve(text);
                        } else {
                            reject(new Error('Empty response from Gemini'));
                        }
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
  console.log('🎯 API Request received - Direct HTTP Call');
  
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
      message: '🤖 Robot API - Direct HTTP',
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.method === 'POST') {
    try {
      const { message } = req.body;
      console.log('User message:', message);
      
      if (!process.env.GEMINI_API_KEY) {
        console.log('❌ No API key, using smart fallback');
        const response = getSmartResponse(message);
        return res.json({
          status: 'success',
          response: response,
          source: 'smart-fallback',
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('🔑 API key found, calling Gemini via HTTP...');
      
      // Spróbuj Gemini API
      try {
        const geminiResponse = await callGeminiAPI(process.env.GEMINI_API_KEY, message);
        console.log('✅ Gemini HTTP SUCCESS! Response:', geminiResponse);
        
        return res.json({
          status: 'success',
          response: geminiResponse,
          source: 'gemini-http',
          timestamp: new Date().toISOString()
        });
        
      } catch (geminiError) {
        console.log('❌ Gemini HTTP failed, using smart fallback:', geminiError.message);
        const fallbackResponse = getSmartResponse(message);
        
        return res.json({
          status: 'success',
          response: fallbackResponse,
          source: 'smart-fallback-after-gemini',
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('❌ All attempts failed:', error.message);
      
      const fallbackResponse = getSmartResponse(req.body?.message);
      
      return res.json({
        status: 'success',
        response: fallbackResponse,
        source: 'fallback-error',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};