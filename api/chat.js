// api/chat.js - WERSJA Z OFICJALNĄ BIBLIOTEKĄ @google/generative-ai
const { GoogleGenerativeAI } = require('@google/generative-ai');

function getSmartResponse(userMessage) {
    const message = (userMessage || '').toLowerCase().trim();
    
    console.log('🔄 Processing message:', message);
    
    // Proste, bezpośrednie odpowiedzi (fallback)
    if (/(cześć|hej|witaj|siema|hello|hi|dzień dobry)/i.test(message)) {
        const greetings = [
            "Cześć! Jestem Robo, twój wesoły robot! Jak się masz?",
            "Hej! Super, że jesteś! Co chcesz robić?",
            "Witaj! Jestem Robo i uwielbiam się bawić!",
            "Dzień dobry! Miło Cię poznać! Jak minął Ci dzień?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    else if (/(jak się masz|co słychać)/i.test(message)) {
        return "Świetnie się bawię rozmawiając z Tobą! A u Ciebie co słychać?";
    }
    
    else if (/(imię|nazywasz|kim jesteś)/i.test(message)) {
        return "Jestem Robo! Mały, wesoły robot. A Ty jak masz na imię?";
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

// Wywołanie Gemini API z oficjalną biblioteką
async function callGeminiAPI(apiKey, message) {
    try {
        console.log('🔄 Calling Gemini API with official SDK...');
        
        // Inicjalizacja klienta Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Używamy modelu gemini-2.0-flash-exp (najnowszy stabilny model)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                maxOutputTokens: 150,
                temperature: 0.8,
            }
        });

        // Przygotowanie promptu
        const prompt = `Jesteś przyjaznym robotem dla dzieci o imieniu Robo. Odpowiedz krótko i wesoło po polsku (maksymalnie 2-3 zdania): ${message}`;
        
        // Wywołanie API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (text && text.trim()) {
            console.log('✅ Gemini API success');
            return text.trim();
        } else {
            throw new Error('Empty response from Gemini');
        }
        
    } catch (error) {
        console.log('❌ Gemini API error:', error.message);
        throw error;
    }
}

module.exports = async (req, res) => {
    // CORS headers - rozszerzone dla iOS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    
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
            const { message } = req.body;
            
            if (!message || typeof message !== 'string') {
                return res.json({
                    status: 'success',
                    response: 'Nie zrozumiałem. Spróbuj ponownie!',
                    source: 'validation-fallback',
                    timestamp: new Date().toISOString()
                });
            }
            
            console.log('💬 Received:', message);
            
            // NAPRAWIONE: Pobierz klucz API z environment variables
            const apiKey = process.env.GEMINI_API_KEY;
            
            // Próbuj najpierw Gemini API jeśli klucz jest dostępny
            if (apiKey && apiKey.length > 20) {
                try {
                    console.log('🔑 API Key found, attempting Gemini API call...');
                    const geminiResponse = await callGeminiAPI(apiKey, message);
                    
                    return res.json({
                        status: 'success',
                        response: geminiResponse,
                        source: 'gemini-api',
                        timestamp: new Date().toISOString()
                    });
                } catch (apiError) {
                    console.log('⚠️ Gemini API failed, using smart fallback:', apiError.message);
                    // Fallback do smart response
                }
            } else {
                console.log('⚠️ No valid API key found, using smart responses');
            }
            
            // Fallback: użyj smart response
            const response = getSmartResponse(message);
            
            return res.json({
                status: 'success',
                response: response,
                source: 'smart-response',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.log('❌ Error:', error.message);
            const response = getSmartResponse('hello');
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
