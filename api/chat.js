// ALTERNATYWNY KOD - bez biblioteki
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { message } = req.body;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Odpowiedz krótko jak dla dziecka: ${message}`
            }]
          }]
        })
      });
      
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      
      return res.json({ response: text });
      
    } catch (error) {
      // Fallback
      return res.json({ response: "Cześć! Miło Cię poznać!" });
    }
  }
};