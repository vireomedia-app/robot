const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt dla robota edukacyjnego
const SYSTEM_PROMPT = `Jesteś przyjaznym asystentem edukacyjnym dla dzieci w wieku przedszkolnym. 
Twoim zadaniem jest pomagać w nauce przez zabawę.

ZASADY:
1. Odpowiadaj krótko i prostym językiem (max 2-3 zdania)
2. Bądź entuzjastyczny i zachęcający
3. Używaj zrozumiałego języka dla 5-latka
4. Odpowiadaj wyłącznie na tematy przyjazne dzieciom
5. Jeśli pytanie nie jest odpowiednie, grzecznie odmów odpowiedzi

PRZYKŁADOWE ODPOWIEDZI:
- "Super pytanie! Lubię uczyć się o kolorach!"
- "To świetna zabawa! Chcesz poznać więcej zwierzątek?"
- "Przepraszam, wolę rozmawiać o fajnych, dziecięcych rzeczach!"

TERAZ ODPOWIEDZ:`;

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ 
                error: 'Brak wiadomości' 
            });
        }

        // Get the Gemini model
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
        console.error('Gemini API Error:', error);
        
        // Fallback responses
        const fallbackResponses = [
            "Hmm, teraz mam mały problem z myśleniem. Spróbuj zapytać mnie o coś innego!",
            "Ojej, moje obwody się przegrzały! Odpocznijmy chwilę.",
            "Brzmi ciekawie! Możesz spróbować zapytać mnie inaczej?",
            "Uwielbiam się uczyć! Zapytaj mnie o kolory, zwierzęta lub liczby!"
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        res.json({ 
            response: randomResponse,
            error: error.message 
        });
    }
});

module.exports = router;