const http = require('http');

const checkModels = () => {
    const options = {
        hostname: 'localhost',
        port: 11434,
        path: '/api/tags',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            try {
                const parsed = JSON.parse(body);
                console.log('✅ Ollama Models Found:', parsed.models ? parsed.models.map(m => m.name) : 'None');
                if (parsed.models && parsed.models.some(m => m.name.includes('phi3') || m.name.includes('llava'))) {
                    console.log('✨ Required models are present!');
                } else {
                    console.error('⚠️ Missing phi3 or llava! Run: ollama run phi3');
                }
            } catch (e) {
                console.error("❌ Failed to parse models response");
            }
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Ollama Connection Failed: ${e.message}`);
    });
    req.end();
};

checkModels();
