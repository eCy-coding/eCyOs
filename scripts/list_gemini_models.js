
const https = require('https');

const KEY = process.argv[2];
if (!KEY) { console.error('No key provided'); process.exit(1); }

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error('Error:', json.error.message);
            } else {
                console.log('Available Models:');
                json.models.forEach(m => console.log(`- ${m.name} (${m.version}) [${m.supportedGenerationMethods.join(', ')}]`));
            }
        } catch (e) {
            console.error('Parse Error:', e.message, data);
        }
    });
}).on('error', e => console.error(e));
