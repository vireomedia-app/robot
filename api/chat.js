// api/chat.js
module.exports = async (req, res) => {
  console.log('🎯 API CHAT - Request received at:', new Date().toISOString());
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight');
    return res.status(200).end();
  }
  
  // Handle GET requests - test endpoint
  if (req.method === 'GET') {
    console.log('📨 GET request - API is working!');
    return res.json({
      status: 'success',
      message: '🤖 Robot API is working perfectly!',
      timestamp: new Date().toISOString(),
      version: '1.0'
    });
  }
  
  // Handle POST requests - chat functionality
  if (req.method === 'POST') {
    try {
      console.log('📨 POST request received');
      const { message } = req.body;
      
      console.log('User message:', message);
      
      // Simple AI responses without external API
      const responses = [
        "Cześć! Jak się masz?",
        "To świetna zabawa! Opowiedz mi coś więcej.",
        "Uwielbiam się uczyć nowych rzeczy!",
        "Super pytanie! Chcesz poznać ciekawostkę?",
        "Jestem małym robotem i dopiero się uczę!"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      return res.json({
        status: 'success',
        response: randomResponse,
        yourMessage: message,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({
        status: 'error',
        error: 'Internal server error'
      });
    }
  }
  
  // Method not allowed
  console.log('❌ Method not allowed:', req.method);
  return res.status(405).json({
    status: 'error',
    message: `Method ${req.method} not allowed`
  });
};