// W funkcji callGeminiAPI zmień timeout i dodaj lepszą obsługę błędów
function callGeminiAPI(apiKey, message) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            contents: [{
                parts: [{
                    text: `Jesteś przyjaznym robotem dla dzieci. Odpowiedz krótko i wesoło: ${message}`
                }]
            }],
            generationConfig: {
                maxOutputTokens: 80,
                temperature: 0.7,
            }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 10000 // 10 sekund timeout
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log('Gemini API response status:', res.statusCode);
                    
                    if (res.statusCode === 200 && parsed.candidates && parsed.candidates[0]) {
                        const text = parsed.candidates[0].content.parts[0].text.trim();
                        if (text && text.length > 3) {
                            resolve(text);
                        } else {
                            reject(new Error('Pusta odpowiedź z Gemini'));
                        }
                    } else {
                        reject(new Error(`API Error: ${parsed.error?.message || 'Unknown error'}`));
                    }
                } catch (e) {
                    reject(new Error('Failed to parse API response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('API timeout'));
        });

        req.write(postData);
        req.end();
    });
}