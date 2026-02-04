// eCy OS v1005.0 - JSON Refiner
// Validate, format, and beautify JSON with syntax highlighting

import { useState } from 'react';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './JSONRefiner.module.css';

type FormatOption = 'format2' | 'format4' | 'minify' | 'validate';

export function JSONRefiner() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ keys: number; size: number } | null>(null);
  
  const processJSON = (option: FormatOption) => {
    if (!input.trim()) {
      setError('Please enter JSON to process');
      return;
    }
    
    try {
      const parsed = JSON.parse(input);
      
      let formatted: string;
      switch (option) {
        case 'format2':
          formatted = JSON.stringify(parsed, null, 2);
          break;
        case 'format4':
          formatted = JSON.stringify(parsed, null, 4);
          break;
        case 'minify':
          formatted = JSON.stringify(parsed);
          break;
        case 'validate':
          formatted = '✅ Valid JSON!';
          break;
        default:
          formatted = JSON.stringify(parsed, null, 2);
      }
      
      setOutput(formatted);
      setError('');
      
      // Calculate stats
      const countKeys = (obj: unknown): number => {
        if (typeof obj !== 'object' || obj === null) return 0;
        return Object.keys(obj as object).length + 
               Object.values(obj as object).reduce((sum: number, val) => sum + countKeys(val), 0);
      };
      
      setStats({
        keys: countKeys(parsed),
        size: new Blob([formatted]).size
      });
      
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
      setStats(null);
    }
  };
  
  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setStats(null);
  };
  
  const handleExample = () => {
    setInput(JSON.stringify({
      name: "eCy OS",
      version: "1005.0",
      features: ["AI Debates", "Calculator", "Utilities"],
      config: {
        theme: "cyberpunk",
        models: 400
      }
    }, null, 2));
  };
  
  return (
    <UtilityBase
      title="JSON Refiner"
      icon="🔧"
      description="Validate, format, and beautify JSON with instant feedback"
    >
      <div className={styles.container}>
        {/* Controls */}
        <div className={styles.controls}>
          <button onClick={() => processJSON('format2')} className={styles.btnPrimary}>
            Format (2 spaces)
          </button>
          <button onClick={() => processJSON('format4')} className={styles.btnPrimary}>
            Format (4 spaces)
          </button>
          <button onClick={() => processJSON('minify')} className={styles.btnSecondary}>
            Minify
          </button>
          <button onClick={() => processJSON('validate')} className={styles.btnSecondary}>
            Validate
          </button>
          <button onClick={handleExample} className={styles.btnOutline}>
            Load Example
          </button>
          <button onClick={handleClear} className={styles.btnOutline}>
            Clear
          </button>
        </div>
        
        {/* Editor Grid */}
        <div className={styles.editorGrid}>
          {/* Input */}
          <div className={styles.editorSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>📝 Input JSON</span>
              <span className={styles.sectionInfo}>
                {input.length} characters
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"example": "Paste your JSON here..."}'
              className={styles.textarea}
              spellCheck={false}
            />
          </div>
          
          {/* Output */}
          <div className={styles.editorSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>✨ Output</span>
              {stats && (
                <span className={styles.sectionInfo}>
                  {stats.keys} keys • {stats.size} bytes
                </span>
              )}
            </div>
            
            {error && (
              <div className={styles.errorBox}>
                <span className={styles.errorIcon}>❌</span>
                <span className={styles.errorText}>{error}</span>
              </div>
            )}
            
            {output && !error && (
              <div className={styles.outputWrapper}>
                <pre className={styles.output}>{output}</pre>
                <div className={styles.outputActions}>
                  <CopyButton text={output} />
                </div>
              </div>
            )}
            
            {!output && !error && (
              <div className={styles.placeholder}>
                Process JSON to see output here
              </div>
            )}
          </div>
        </div>
      </div>
    </UtilityBase>
  );
}
