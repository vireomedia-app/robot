const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `Jesteś przyjaznym asystentem edukacyjnym dla dzieci w wieku przedszkolnym. 
Twoim zadaniem jest pomagać w nauce przez zabawę.

ZASADY:
1. Odpowiadaj krótko i prostym językiem (max 2-3 zdania)
2. Bądź entuzjastyczny i zachęcający
3. Używaj zrozumiałego języka dla 5-latka
4. Odpowiadaj wyłącznie na tematy przyjazne dzieciom
5. Jeśli pytanie nie jest odpowiednie, grzecznie odmów odpowiedzi

TERAZ ODPOWIEDZ:`;

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Brak wiadomości' });
        }
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: 'Brak klucza API',
                response: 'Przepraszam, problem z konfiguracją systemu.'
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            generationConfig: {
                maxOutputTokens: 150,
                temperature: 0.7,
            }
        });

        const prompt = `${SYSTEM_PROMPT}\n\nUŻYTKOWNIK: ${message}\n\nASYSTENT:`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ 
            response: text.trim(),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Błąd:', error);
        
        res.json({ 
            response: "Przepraszam, mam chwilowy problem. Spróbuj ponownie!",
            error: error.message 
        });
    }
};