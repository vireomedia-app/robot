// api/chat.js
const https = require('https');

function getSmartResponse(userMessage) {
    const message = (userMessage || '').toLowerCase().trim();
    
    // Proste odpowiedzi
    if (/(cześć|hej|witaj|siema|hello|hi)/i.test(message)) {
        return "Cześć! Jestem Robo, twój wesoły robot!";
    }
    else if (/(jak się masz|co słychać)/i.test(message)) {
        return "Świetnie się bawię! A u Ciebie co słychać?";
    }
    else if (/(imię|nazywasz)/i.test(message)) {
        return "Jestem Robo! A Ty jak masz na imię?";
    }
    else if (/(kolor|barwa)/i.test(message)) {
        return "Uwielbiam kolory! Mój ulubiony to niebieski! A Twój?";
    }
    else if (/(zwierzę|pies|kot)/i.test(message)) {
        return "Kocham zwierzęta! Szczególnie pieski i kotki!";
    }
    else {
        return "Dziękuję za rozmowę! To bardzo ciekawe!";
    }
}

function callGeminiAPI(apiKey, message) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            contents: [{
                parts: [{
                    text: `Jesteś przyjaznym robotem dla dzieci. Odpowiedz krótko i wesoło: ${message}`
                }]
            }],
            generationConfig: {
                maxOutputTokens: 100,
                temperature: 0.7,
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
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        return res.json({
            status: 'success',
            message: 'Robot API',
            timestamp: new Date().toISOString()
        });
    }
    
    if (req.method === 'POST') {
        try {
            const { message } = req.body;
            
            if (!process.env.GEMINI_API_KEY) {
                const response = getSmartResponse(message);
                return res.json({
                    status: 'success',
                    response: response,
                    source: 'fallback'
                });
            }
            
            try {
                const geminiResponse = await callGeminiAPI(process.env.GEMINI_API_KEY, message);
                return res.json({
                    status: 'success',
                    response: geminiResponse,
                    source: 'gemini'
                });
            } catch (error) {
                const fallbackResponse = getSmartResponse(message);
                return res.json({
                    status: 'success',
                    response: fallbackResponse,
                    source: 'fallback-after-error'
                });
            }
            
        } catch (error) {
            const fallbackResponse = getSmartResponse('hello');
            return res.json({
                status: 'success',
                response: fallbackResponse,
                source: 'error-fallback'
            });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
};