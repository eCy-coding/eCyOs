import React, { useState } from 'react';

const LANGUAGES = ['python', 'javascript', 'bash', 'rust', 'go', 'ruby', 'php', 'java'];

export function PolyglotPlayground() {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('print("Hello World")');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRun = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const res = await window.api.python.execute('POLYGLOT_EXEC', { language, code });
            if (res.status === 'success') {
                setOutput(res.output || `[${res.mode}] executed successfully.`);
            } else {
                setOutput('Error: ' + res.error);
            }
        } catch (e: any) {
            setOutput('Error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', marginTop: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px' }}>Polyglot Playground 🌍</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <select 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)}
                    className="glass-input"
                    style={{ minWidth: '150px' }}
                >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                </select>
                <button onClick={handleRun} disabled={loading} className="glass-btn">
                    {loading ? 'Running...' : 'Run Code'}
                </button>
            </div>
            <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                className="glass-input"
                style={{ width: '100%', height: '150px', fontFamily: 'JetBrains Mono', boxSizing: 'border-box' }}
                spellCheck={false}
            />
            <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '15px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px' }}>OUTPUT</div>
                <pre style={{ margin: 0, fontFamily: 'JetBrains Mono', fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: '#e2e8f0' }}>
                    {output || '// Output will appear here'}
                </pre>
            </div>
        </div>
    );
}
