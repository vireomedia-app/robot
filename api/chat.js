// api/chat.js - DIRECT HTTP API CALL
const https = require('https');

function getSmartResponse(userMessage) {
    const message = (userMessage || '').toLowerCase().trim();
    
    console.log('Processing message:', message);
    
    // Powitania
    if (/(czeŇõńá|hej|witaj|siema|hello|hi|dzieŇĄ dobry)/i.test(message)) {
        const greetings = [
            "CzeŇõńá! MiŇāo Cińô poznańá! Jestem Robo, wesoŇāy robot!",
            "Witaj! Super, Ňľe jesteŇõ! Co u Ciebie sŇāychańá?",
            "Hej! Jak sińô masz? Jestem gotowy do zabawy!",
            "DzieŇĄ dobry! MiŇāo Cińô widzieńá! Opowiesz mi coŇõ ciekawego?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Samopoczucie
    else if (/(jak sińô masz|co sŇāychańá|jak tam|co u ciebie)/i.test(message)) {
        const moods = [
            "Ňöwietnie sińô bawińô rozmawiajńÖc z TobńÖ! Dzińôkujńô za pytanie!",
            "Bardzo dobrze! KaŇľdy dzieŇĄ to nowa przygoda! A Ty jak sińô czujesz?",
            "Fantastycznie! Jestem peŇāen energii do nauki!",
            "Wspaniale! Uwielbiam poznawańá nowych przyjaci√≥Ňā!"
        ];
        return moods[Math.floor(Math.random() * moods.length)];
    }
    
    // Imińô
    else if (/(imińô|nazywasz|kim jesteŇõ|kto ty)/i.test(message)) {
        return "Jestem Robo! MaŇāy, wesoŇāy robot kt√≥ry uwielbia sińô uczyńá i bawińá! A Ty jak masz na imińô?";
    }
    
    // Kolory
    else if (/(kolor|barwa|farba|niebieski|czerwony|zielony|Ňľ√≥Ňāty|r√≥Ňľowy)/i.test(message)) {
        const colors = ['niebieski', 'czerwony', 'zielony', 'Ňľ√≥Ňāty', 'r√≥Ňľowy', 'fioletowy', 'pomaraŇĄczowy'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const colorResponses = [
            `Uwielbiam kolory! M√≥j ulubiony to ${randomColor}, bo jest taki radosny! A Ty jaki kolor lubisz?`,
            `Wow, kolory sńÖ super! Ja najbardziej lubińô ${randomColor}! A u Ciebie jaki jest ulubiony kolor?`,
            `Kocham wszystkie kolory! Szczeg√≥lnie ${randomColor} sprawia mi radoŇõńá! Masz jakiŇõ ulubiony kolor?`
        ];
        return colorResponses[Math.floor(Math.random() * colorResponses.length)];
    }
    
    // Zwierzńôta
    else if (/(zwierzńô|zwierzak|pies|kot|ptak|rybka|chomik|kr√≥lik|zwierz)/i.test(message)) {
        const animalResponses = [
            "Kocham zwierzńôta! Szczeg√≥lnie pieski, bo sńÖ wesoŇāe i kotki, bo sńÖ mińôciutkie! Masz jakieŇõ zwierzńÖtko w domu?",
            "Uwielbiam wszystkie zwierzńÖtka! Pieski sńÖ takie lojalne, a kotki takie eleganckie! A Ty masz ulubione zwierzńô?",
            "Zwierzńôta sńÖ fantastyczne! Lubińô obserwowańá ptaszki i pieski na spacerze! Opowiesz mi o swoich ulubionych zwierzńÖtkach?"
        ];
        return animalResponses[Math.floor(Math.random() * animalResponses.length)];
    }
    
    // Liczby i matematyka
    else if (/(liczba|cyfra|policz|ile|matematyka|dodawanie|liczenie)/i.test(message)) {
        if (/(ile.*dni.*tygodni|dni tygodnia|tydzieŇĄ)/i.test(message)) {
            return "Jest 7 dni tygodnia! PoniedziaŇāek, wtorek, Ňõroda, czwartek, pińÖtek, sobota i niedziela! Kt√≥ry dzieŇĄ lubisz najbardziej?";
        }
        else if (/(ile.*miesińôcy|miesińÖce|rok)/i.test(message)) {
            return "Rok ma 12 miesińôcy! StyczeŇĄ, luty, marzec, kwiecieŇĄ, maj, czerwiec, lipiec, sierpieŇĄ, wrzesieŇĄ, paŇļdziernik, listopad, grudzieŇĄ!";
        }
        else if (/(ile.*2.*2|2 plus 2|dwa i dwa)/i.test(message)) {
            return "2 + 2 = 4! To proste prawda? Matematyka moŇľe byńá fajnńÖ zabawńÖ!";
        }
        else {
            const mathResponses = [
                "Umiem liczyńá do 20! 1, 2, 3, 4, 5, 6, 7, 8, 9, 10... to Ňõwietna zabawa! Chcesz sińô pobawińá w liczenie?",
                "Lubińô liczby! One sńÖ wszńôdzie wok√≥Ňā nas. MoŇľemy razem policzyńá ile jest okien w pokoju?",
                "Matematyka to super zabawa! Dodawanie, odejmowanie... wszystko moŇľe byńá ciekawe!"
            ];
            return mathResponses[Math.floor(Math.random() * mathResponses.length)];
        }
    }
    
    // Pogoda
    else if (/(pogoda|sŇāoŇĄce|deszcz|Ňõnieg|chmura|burza|sŇāonecznie)/i.test(message)) {
        const weatherResponses = [
            "Pogoda jest zawsze dobra na naukńô i zabawńô! Lubińô kiedy Ňõwieci sŇāoŇĄce, ale deszcz teŇľ jest fajny!",
            "Uwielbiam sŇāoneczne dni! MoŇľna wtedy iŇõńá na spacer i obserwowańá przyrodńô! A jaka jest Twoja ulubiona pogoda?",
            "KaŇľda pogoda jest dobra! Kiedy Ňõwieci sŇāoŇĄce - spacerujemy, kiedy pada - czytamy ksińÖŇľki!"
        ];
        return weatherResponses[Math.floor(Math.random() * weatherResponses.length)];
    }
    
    // Jedzenie
    else if (/(jedzenie|owoc|warzywo|jabŇāko|banan|marchew|obiad|Ňõniadanie)/i.test(message)) {
        const foodResponses = [
            "Uwielbiam owoce! JabŇāka i banany sńÖ pyszne i zdrowe! A Ty co lubisz jeŇõńá najbardziej?",
            "Jedzenie jest super! Lubińô kiedy jest kolorowe i smaczne. Masz jakieŇõ ulubione danie?",
            "Warzywa i owoce dajńÖ nam siŇāńô do zabawy! Ja szczeg√≥lnie lubińô marchewki i jabŇāka!"
        ];
        return foodResponses[Math.floor(Math.random() * foodResponses.length)];
    }
    
    // Zabawy i gry
    else if (/(zabawa|gra|bawińá|bawmy|zabawka)/i.test(message)) {
        const playResponses = [
            "Uwielbiam sińô bawińá! MoŇľe pobawimy sińô w zgadywanie kolor√≥w? To Ňõwietna zabawa!",
            "Zabawy sńÖ najlepsze! Lubińô gry gdzie sińô czegoŇõ uczymy. Chcesz sińô pobawińá?",
            "Bawmy sińô! MoŇľemy liczyńá, Ňõpiewańá albo opowiadańá historie! Co wolisz?"
        ];
        return playResponses[Math.floor(Math.random() * playResponses.length)];
    }
    
    // DomyŇõlna odpowiedŇļ
    else {
        const defaultResponses = [
            "Dzińôkujńô za rozmowńô! To bardzo ciekawe! Uwielbiam sińô uczyńá nowych rzeczy.",
            "Wow, super pytanie! Opowiesz mi o tym coŇõ wińôcej?",
            "Bardzo lubińô takie rozmowy! MoŇľe nauczysz mnie czegoŇõ nowego?",
            "To brzmi interesujńÖco! Chcesz Ňľebym opowiedziaŇā Ci o kolorach lub zwierzńÖtkach?",
            "Ňöwietnie! Uwielbiam kiedy rozmawiamy! Masz jakieŇõ ulubione zwierzńÖtko lub kolor?"
        ];
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
}

// Funkcja do bezpoŇõredniego calla Gemini API
function callGeminiAPI(apiKey, message) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            contents: [{
                parts: [{
                    text: `JesteŇõ przyjaznym robotem dla dzieci. Odpowiedz kr√≥tko i wesoŇāo: ${message}`
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
            },
            timeout: 10000 // 10 sekund timeout
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log('Gemini API response status:', res.statusCode);
                    
                    if (res.statusCode === 200 && parsed.candidates && parsed.candidates[0]) {
                        const text = parsed.candidates[0].content.parts[0].text.trim();
                        if (text && text.length > 3) {
                            resolve(text);
                        } else {
                            reject(new Error('Pusta odpowiedź z Gemini'));
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

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('API timeout'));
        });

        req.write(postData);
        req.end();
    });
}

module.exports = async (req, res) => {
  console.log('ūüéĮ API Request received from:', req.headers.origin);
  
  // SZCZEG√ďŇĀOWE CORS DLA MOBILE
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    console.log('ūüĒĄ Handling OPTIONS preflight');
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.json({
      status: 'success',
      message: 'ūü§Ė Robot API - Direct HTTP',
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.method === 'POST') {
    try {
      const { message } = req.body;
      console.log('User message:', message);
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Empty message',
          timestamp: new Date().toISOString()
        });
      }
      
      if (!process.env.GEMINI_API_KEY) {
        console.log('‚ĚĆ No API key, using smart fallback');
        const response = getSmartResponse(message);
        return res.json({
          status: 'success',
          response: response,
          source: 'smart-fallback',
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('ūüĒĎ API key found, calling Gemini via HTTP...');
      
      // Spr√≥buj Gemini API
      try {
        const geminiResponse = await callGeminiAPI(process.env.GEMINI_API_KEY, message);
        console.log('‚úÖ Gemini HTTP SUCCESS! Response:', geminiResponse);
        
        return res.json({
          status: 'success',
          response: geminiResponse,
          source: 'gemini-http',
          timestamp: new Date().toISOString()
        });
        
      } catch (geminiError) {
        console.log('‚ĚĆ Gemini HTTP failed, using smart fallback:', geminiError.message);
        const fallbackResponse = getSmartResponse(message);
        
        return res.json({
          status: 'success',
          response: fallbackResponse,
          source: 'smart-fallback-after-gemini',
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('‚ĚĆ All attempts failed:', error.message);
      
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