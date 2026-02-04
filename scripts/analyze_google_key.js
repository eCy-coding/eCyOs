
const js = require('axios'); // Assuming axios is available in project, or using https
const https = require('https');

const KEY = process.argv[2];
if (!KEY) { console.error('No key provided'); process.exit(1); }

const APIs = {
    'Gemini Pro': {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${KEY}`,
        method: 'POST',
        data: { contents: [{ parts: [{ text: "Hello" }] }] },
        check: (d) => d.candidates && d.candidates.length > 0
    },
    'Gemini Flash': {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`,
        method: 'POST',
        data: { contents: [{ parts: [{ text: "Hello" }] }] },
        check: (d) => d.candidates && d.candidates.length > 0
    },
    'Translate': {
        url: `https://translation.googleapis.com/language/translate/v2?key=${KEY}&q=Hello&target=es`,
        method: 'GET',
        check: (d) => d.data && d.data.translations
    },
    // Adding Text-to-Speech probe
    'Text-to-Speech': {
        url: `https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`,
        method: 'POST',
        data: {
             input: { text: "Hello" },
             voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
             audioConfig: { audioEncoding: "MP3" }
        },
        check: (d) => d.audioContent
    }
};

async function probe() {
    console.log('--- Analyzing Google API Key Capabilities ---');
    const results = [];

    for (const [name, config] of Object.entries(APIs)) {
        try {
            let res;
            if (config.method === 'POST') {
                const r = await fetch(config.url, {
                    method: 'POST',
                    body: JSON.stringify(config.data),
                    headers: { 'Content-Type': 'application/json' }
                });
                res = await r.json();
            } else {
                const r = await fetch(config.url);
                res = await r.json();
            }

            if (res.error) {
                // console.log(`[x] ${name}: Failed (${res.error.message})`);
                results.push({ name, status: 'FAILED', reason: res.error.message });
            } else if (config.check(res)) {
                // console.log(`[✓] ${name}: ACTIVE`);
                results.push({ name, status: 'ACTIVE', details: 'Functioning correctly' });
            } else {
                results.push({ name, status: 'UNKNOWN', reason: 'Response structure mismatch' });
            }
        } catch (e) {
            results.push({ name, status: 'ERROR', reason: e.message });
        }
    }
    
    console.log(JSON.stringify(results, null, 2));
}

probe();
