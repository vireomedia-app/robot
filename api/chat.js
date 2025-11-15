// api/chat.js
export default async function handler(request, response) {
  console.log('🎯 API CHAT - Request received');
  
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  
  // Handle preflight
  if (request.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight');
    return response.status(200).end();
  }
  
  // Handle GET requests
  if (request.method === 'GET') {
    console.log('📨 GET request');
    return response.status(200).json({
      status: 'success',
      message: 'API chat is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }
  
  // Handle POST requests
  if (request.method === 'POST') {
    try {
      console.log('📨 POST request');
      const body = request.body;
      console.log('Request body:', body);
      
      return response.status(200).json({
        status: 'success',
        response: `Received: ${body?.message || 'No message'}`,
        timestamp: new Date().toISOString(),
        yourMessage: body?.message
      });
      
    } catch (error) {
      console.error('Error:', error);
      return response.status(500).json({
        status: 'error',
        error: error.message
      });
    }
  }
  
  // Method not allowed
  console.log('❌ Method not allowed:', request.method);
  return response.status(405).json({
    status: 'error',
    message: `Method ${request.method} not allowed`
  });
}