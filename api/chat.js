// api/chat.js - SIMPLE TEST VERSION
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Zawsze zwracaj success dla testu
    res.json({ 
        response: "✅ TEST: API działa poprawnie! Otrzymałem: " + (req.body.message || "brak wiadomości"),
        timestamp: new Date().toISOString()
    });
};