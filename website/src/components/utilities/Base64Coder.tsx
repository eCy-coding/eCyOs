// eCy OS v1005.0 - Base64 Coder
// Encode and decode Base64 with file support

import { useState, useRef } from 'react';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './Base64Coder.module.css';

type Mode = 'encode' | 'decode';
type Variant = 'standard' | 'urlsafe';

export function Base64Coder() {
  const [mode, setMode] = useState<Mode>('encode');
  const [variant, setVariant] = useState<Variant>('standard');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const encodeBase64 = (text: string, urlSafe: boolean): string => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(text)));
      return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded;
    } catch (e) {
      throw new Error('Encoding failed: Invalid characters');
    }
  };

  const decodeBase64 = (text: string, urlSafe: boolean): string => {
    try {
      let normalized = text;
      if (urlSafe) {
        normalized = text.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding
        while (normalized.length % 4) {
          normalized += '=';
        }
      }
      return decodeURIComponent(escape(atob(normalized)));
    } catch (e) {
      throw new Error('Decoding failed: Invalid Base64 string');
    }
  };

  const handleProcess = () => {
    setError('');
    try {
      if (mode === 'encode') {
        const result = encodeBase64(input, variant === 'urlsafe');
        setOutput(result);
      } else {
        const result = decodeBase64(input, variant === 'urlsafe');
        setOutput(result);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Processing failed');
      setOutput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setInput(result);
        setError('');
      } else if (result instanceof ArrayBuffer) {
        // Convert ArrayBuffer to Base64
        const bytes = new Uint8Array(result);
        const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        const base64 = btoa(binary);
        setInput(base64);
        setMode('decode'); // Auto-switch to decode mode
        setError('');
      }
    };

    reader.onerror = () => {
      setError('File reading failed');
    };

    // For text files, read as text; for binary, read as ArrayBuffer
    if (file.type.startsWith('text/')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `base64-${mode}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateDataURL = () => {
    if (!input || mode !== 'encode') return;
    const mimeType = 'text/plain';
    const dataURL = `data:${mimeType};base64,${output}`;
    setOutput(dataURL);
  };

  const loadExample = () => {
    setInput('Hello, Base64! 🚀 Unicode support enabled.');
    setMode('encode');
    setError('');
  };

  return (
    <UtilityBase
      title="Base64 Coder"
      icon="🔐"
      description="Encode/decode Base64 with file support"
    >
      <div className={styles.container}>
        {/* Mode & Variant Selection */}
        <div className={styles.controls}>
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeBtn} ${mode === 'encode' ? styles.active : ''}`}
              onClick={() => setMode('encode')}
            >
              Encode
            </button>
            <button
              className={`${styles.modeBtn} ${mode === 'decode' ? styles.active : ''}`}
              onClick={() => setMode('decode')}
            >
              Decode
            </button>
          </div>

          <div className={styles.variantToggle}>
            <label>
              <input
                type="radio"
                name="variant"
                checked={variant === 'standard'}
                onChange={() => setVariant('standard')}
              />
              Standard
            </label>
            <label>
              <input
                type="radio"
                name="variant"
                checked={variant === 'urlsafe'}
                onChange={() => setVariant('urlsafe')}
              />
              URL-Safe
            </label>
          </div>
        </div>

        {/* File Upload */}
        <div className={styles.fileSection}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className={styles.fileInput}
            id="base64-file-input"
          />
          <label htmlFor="base64-file-input" className={styles.fileLabel}>
            📁 Upload File
          </label>
          {fileName && <span className={styles.fileName}>{fileName}</span>}
        </div>

        {/* Input */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              {mode === 'encode' ? '📝 Text Input' : '🔓 Base64 Input'}
            </span>
            <button onClick={loadExample} className={styles.exampleBtn}>
              Load Example
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            className={styles.textarea}
            rows={6}
          />
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button onClick={handleProcess} className={styles.processBtn}>
            ⚡ {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
          {mode === 'encode' && output && (
            <button onClick={generateDataURL} className={styles.dataUrlBtn}>
              🌐 Generate Data URL
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                {mode === 'encode' ? '🔒 Base64 Output' : '📜 Decoded Text'}
              </span>
              <div className={styles.outputActions}>
                <CopyButton text={output} label="Copy" />
                <button onClick={handleDownload} className={styles.downloadBtn}>
                  ⬇️ Download
                </button>
              </div>
            </div>
            <div className={styles.output}>
              <pre>{output}</pre>
            </div>
          </div>
        )}

        {/* Stats */}
        {output && (
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Input Length:</span>
              <span className={styles.statValue}>{input.length} chars</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Output Length:</span>
              <span className={styles.statValue}>{output.length} chars</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Size Ratio:</span>
              <span className={styles.statValue}>
                {input.length > 0 ? ((output.length / input.length) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        )}
      </div>
    </UtilityBase>
  );
}
