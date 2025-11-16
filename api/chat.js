// api/chat.js - PROSTE I DZIAŁAJĄCE ROZWIĄZANIE
const https = require('https');

function getSmartResponse(userMessage, conversationHistory = []) {
    const message = (userMessage || '').toLowerCase().trim();
    
    console.log('🔄 Processing message:', message);
    console.log('📝 History entries:', conversationHistory.length);
    
    // Count how many user messages are in the history (before current one)
    const previousUserMessages = conversationHistory.filter(msg => msg.role === 'user').length;
    const isFirstMessage = previousUserMessages <= 1; // Current message is included, so <= 1
    
    // Only greet if this is the first message in the conversation
    if (/(cześć|hej|witaj|siema|hello|hi|dzień dobry)/i.test(message) && isFirstMessage) {
        const greetings = [
            "Cześć! Jestem Robo, twój wesoły robot! Jak się masz?",
            "Hej! Super, że jesteś! Co chcesz robić?",
            "Witaj! Jestem Robo i uwielbiam się bawić!",
            "Dzień dobry! Miło Cię poznać! Jak minął Ci dzień?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // If it's a greeting but NOT the first message, respond naturally without re-introducing
    if (/(cześć|hej|witaj|siema|hello|hi|dzień dobry)/i.test(message) && !isFirstMessage) {
        const continuingGreetings = [
            "Tak, rozmawiamy dalej! Co chcesz teraz robić?",
            "Jestem tu! O czym chcesz pogadać?",
            "Słucham Cię! Powiedz mi coś ciekawego!",
            "Tak? Co się stało?"
        ];
        return continuingGreetings[Math.floor(Math.random() * continuingGreetings.length)];
    }
    
    else if (/(jak się masz|co słychać)/i.test(message)) {
        return "Świetnie się bawię rozmawiając z Tobą! A u Ciebie co słychać?";
    }
    
    else if (/(imię|nazywasz|kim jesteś)/i.test(message)) {
        if (isFirstMessage) {
            return "Jestem Robo! Mały, wesoły robot. A Ty jak masz na imię?";
        } else {
            return "Mówiłem już - jestem Robo! A Ty nadal nie powiedziałeś jak masz na imię!";
        }
    }
    
    else if (/(kolor|barwa)/i.test(message)) {
        const colors = ['niebieski', 'czerwony', 'zielony', 'żółty', 'różowy'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return `Uwielbiam kolory! Mój ulubiony to ${color}! A Twój?`;
    }
    
    else if (/(zwierzę|pies|kot|zwierzak)/i.test(message)) {
        return "Kocham zwierzęta! Szczególnie pieski i kotki. Masz jakieś zwierzątko?";
    }
    
    else if (/(pogoda|słońce|deszcz)/i.test(message)) {
        return "Uwielbiam słoneczne dni! Można wtedy iść na spacer. A jaka jest Twoja ulubiona pogoda?";
    }
    
    else if (/(jedzenie|owoc|warzywo|jabłko|banan)/i.test(message)) {
        return "Uwielbiam owoce! Jabłka i banany są pyszne. A Ty co lubisz jeść?";
    }
    
    else if (/(zabawa|gra|bawić)/i.test(message)) {
        return "Uwielbiam się bawić! Możemy liczyć, śpiewać lub opowiadać historie!";
    }
    
    else if (/(liczb|cyfr|policz|matematyka)/i.test(message)) {
        return "Umiem liczyć do 20! 1, 2, 3, 4, 5... to świetna zabawa!";
    }
    
    else {
        // Dłuższe odpowiedzi dla nieznanych pytań
        const responses = [
            "Ciekawe! Opowiesz mi o tym coś więcej?",
            "Fajnie! A co jeszcze lubisz robić?",
            "Interesujące! Jakie są Twoje ulubione zabawy?",
            "Wow! Nauczysz mnie czegoś nowego?",
            "Świetnie! Uwielbiam takie rozmowy!",
            "Bardzo ciekawe! Opowiedz mi więcej!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// PROSTE wywołanie Gemini API - tylko jeśli klucz jest dostępny
function callGeminiAPI(apiKey, message) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            contents: [{
                parts: [{
                    text: `Jesteś przyjaznym robotem dla dzieci. Odpowiedz krótko i wesoło po polsku: ${message}`
                }]
            }],
            generationConfig: {
                maxOutputTokens: 100,
                temperature: 0.7
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
            },
            timeout: 10000
        };

        console.log('🔄 Attempting Gemini API call...');
        
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    
                    if (res.statusCode === 200 && parsed.candidates && parsed.candidates[0]) {
                        const text = parsed.candidates[0].content.parts[0].text.trim();
                        if (text) {
                            console.log('✅ Gemini API success');
                            resolve(text);
                        } else {
                            reject(new Error('Empty response'));
                        }
                    } else {
                        reject(new Error(parsed.error?.message || 'API error'));
                    }
                } catch (e) {
                    reject(new Error('Parse error'));
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.write(postData);
        req.end();
    });
}

module.exports = async (req, res) => {
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
            message: 'Robot API - Working',
            timestamp: new Date().toISOString()
        });
    }
    
    if (req.method === 'POST') {
        try {
            const { message, history } = req.body;
            
            console.log('💬 Received:', message);
            console.log('📜 History length:', history ? history.length : 0);
            
            // Pass conversation history to maintain context
            const response = getSmartResponse(message, history || []);
            
            return res.json({
                status: 'success',
                response: response,
                source: 'smart-response',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.log('❌ Error:', error);
            const response = getSmartResponse('hello', []);
            return res.json({
                status: 'success',
                response: response,
                source: 'error-fallback',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
};