const { GoogleGenerativeAI } = require('@google/generative-ai');

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
            message: 'Robot API - Working with Gemini 2.0',
            timestamp: new Date().toISOString()
        });
    }
    
    if (req.method === 'POST') {
        try {
            const { message } = req.body;
            
            if (!message || typeof message !== 'string' || message.trim().length === 0) {
                return res.status(400).json({
                    status: 'error',
                    error: 'Invalid message'
                });
            }
            
            console.log('💬 Received message:', message);
            
            // Get API key from environment variable
            const apiKey = process.env.GEMINI_API_KEY;
            
            if (!apiKey) {
                console.log('⚠️ No API key found, using fallback response');
                return res.json({
                    status: 'success',
                    response: 'Cześć! Jestem Robo, twój przyjazny robot. Jak się masz?',
                    source: 'fallback',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Initialize Gemini AI with the official SDK
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            
            // Create the prompt for a friendly robot assistant for children
            const prompt = `Jesteś przyjaznym robotem asystentem dla dzieci o imieniu Robo. 
Odpowiadaj w sposób prosty, ciepły i zachęcający po polsku. 
Używaj krótkich zdań (maksymalnie 2-3 zdania).
Pytanie dziecka: ${message}`;
            
            console.log('🤖 Calling Gemini API with model: gemini-2.0-flash-exp');
            
            // Generate response with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('API timeout')), 15000);
            });
            
            const generationPromise = model.generateContent(prompt);
            
            const result = await Promise.race([generationPromise, timeoutPromise]);
            const response = await result.response;
            const text = response.text();
            
            if (!text || text.trim().length === 0) {
                throw new Error('Empty response from API');
            }
            
            console.log('✅ Gemini API success');
            
            return res.json({
                status: 'success',
                response: text.trim(),
                source: 'gemini-2.0-flash-exp',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Error:', error.message);
            
            // Provide friendly fallback response on error
            return res.json({
                status: 'success',
                response: 'Cześć! Jestem Robo! Jak mogę Ci dzisiaj pomóc?',
                source: 'error-fallback',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    return res.status(405).json({ 
        status: 'error',
        error: 'Method not allowed' 
    });
};
