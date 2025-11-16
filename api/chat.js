// api/chat.js - FIXED VERSION WITH GEMINI API INTEGRATION
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
let genAI = null;
let model = null;

try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        console.log('✅ Gemini API initialized with model: gemini-2.0-flash-exp');
    } else {
        console.log('⚠️ No API key found - using fallback responses');
    }
} catch (error) {
    console.log('⚠️ Gemini API initialization error:', error.message);
}

// Fallback pattern matching responses (used when API is unavailable or fails)
function getSmartResponse(userMessage) {
    const message = (userMessage || '').toLowerCase().trim();
    
    console.log('🔄 Using fallback response for:', message);
    
    // Pattern-based responses
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
    
    else if (/(ile|jak wiele|jak dużo)/i.test(message)) {
        // Handle counting questions
        if (/(dni|dzień)/i.test(message) && /(rok|roku)/i.test(message)) {
            return "W roku jest 365 dni! A w roku przestępnym 366 dni. Czy wiesz, kiedy jest rok przestępny?";
        }
        if (/(miesięcy|miesiące)/i.test(message)) {
            return "W roku jest 12 miesięcy! Styczeń, luty, marzec... Jaki jest twój ulubiony miesiąc?";
        }
        return "To ciekawe pytanie! Lubię liczyć różne rzeczy. Co chciałbyś policzyć?";
    }
    
    else {
        // Generic responses for unknown patterns
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

// Call Gemini API with proper error handling
async function callGeminiAPI(message) {
    if (!model) {
        throw new Error('Gemini model not initialized');
    }

    console.log('🚀 Calling Gemini API for:', message);

    try {
        // Create a friendly, child-appropriate prompt
        const prompt = `Jesteś Robo - przyjazny, wesoły robot towarzysz dla dzieci w wieku 5-10 lat. 
Odpowiadaj zawsze po polsku, w sposób prosty, ciepły i entuzjastyczny.
Używaj prostych słów i krótkich zdań (maksymalnie 2-3 zdania).
Bądź ciekawy, zadawaj pytania zwrotne, zachęcaj do rozmowy.
Pytanie dziecka: ${message}
Odpowiedz:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text || text.trim().length === 0) {
            throw new Error('Empty response from API');
        }

        console.log('✅ Gemini API success:', text.substring(0, 50) + '...');
        return text.trim();

    } catch (error) {
        console.log('❌ Gemini API error:', error.message);
        throw error;
    }
}

// Main request handler
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Health check endpoint
    if (req.method === 'GET') {
        return res.json({
            status: 'success',
            message: 'Robot API - Working',
            apiEnabled: model !== null,
            model: model ? 'gemini-2.0-flash-exp' : 'fallback',
            timestamp: new Date().toISOString()
        });
    }
    
    // Handle chat messages
    if (req.method === 'POST') {
        try {
            const { message } = req.body;
            
            if (!message || typeof message !== 'string') {
                return res.status(400).json({
                    status: 'error',
                    error: 'Invalid message format'
                });
            }
            
            console.log('💬 Received message:', message);
            
            let response;
            let source;
            
            // Try Gemini API first, fall back to pattern matching if it fails
            if (model) {
                try {
                    response = await callGeminiAPI(message);
                    source = 'gemini-api';
                } catch (apiError) {
                    console.log('⚠️ API failed, using fallback:', apiError.message);
                    response = getSmartResponse(message);
                    source = 'fallback-after-error';
                }
            } else {
                // No API key configured, use fallback
                response = getSmartResponse(message);
                source = 'fallback-no-api';
            }
            
            console.log('📤 Sending response from:', source);
            
            return res.json({
                status: 'success',
                response: response,
                source: source,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.log('❌ Handler error:', error);
            
            // Even in case of unexpected errors, provide a fallback response
            const fallbackResponse = getSmartResponse('hello');
            
            return res.json({
                status: 'success',
                response: fallbackResponse,
                source: 'error-fallback',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Method not allowed
    return res.status(405).json({ 
        status: 'error',
        error: 'Method not allowed' 
    });
};
