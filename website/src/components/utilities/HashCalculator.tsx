// eCy OS v1005.0 - Hash Calculator
// Generate cryptographic hashes with multiple algorithms

import { useState, useRef } from 'react';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './HashCalculator.module.css';
import CryptoJS from 'crypto-js';

type Algorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';
type OutputFormat = 'hex' | 'base64';

interface HashResult {
  algorithm: string;
  hash: string;
  time: number;
}

export function HashCalculator() {
  const [input, setInput] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('sha256');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('hex');
  const [useHMAC, setUseHMAC] = useState(false);
  const [results, setResults] = useState<HashResult[]>([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateHash = async (algorithm: Algorithm, text: string, hmac: boolean, key: string): Promise<string> => {
    const startTime = performance.now();
    
    try {
      if (hmac && key) {
        // HMAC mode
        const hmacResult = CryptoJS.HmacSHA256(text, key);
        return outputFormat === 'hex' ? hmacResult.toString() : hmacResult.toString(CryptoJS.enc.Base64);
      }

      // Regular hash mode
      switch (algorithm) {
        case 'md5': {
          const hash = CryptoJS.MD5(text);
          return outputFormat === 'hex' ? hash.toString() : hash.toString(CryptoJS.enc.Base64);
        }
        case 'sha1': {
          const hash = CryptoJS.SHA1(text);
          return outputFormat === 'hex' ? hash.toString() : hash.toString(CryptoJS.enc.Base64);
        }
        case 'sha256': {
          // Use Web Crypto API for modern browsers
          if (window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            if (outputFormat === 'hex') {
              return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } else {
              const binary = String.fromCharCode(...hashArray);
              return btoa(binary);
            }
          } else {
            // Fallback to CryptoJS
            const hash = CryptoJS.SHA256(text);
            return outputFormat === 'hex' ? hash.toString() : hash.toString(CryptoJS.enc.Base64);
          }
        }
        case 'sha512': {
          // Use Web Crypto API
          if (window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const hashBuffer = await window.crypto.subtle.digest('SHA-512', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            if (outputFormat === 'hex') {
              return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } else {
              const binary = String.fromCharCode(...hashArray);
              return btoa(binary);
            }
          } else {
            // Fallback to CryptoJS
            const hash = CryptoJS.SHA512(text);
            return outputFormat === 'hex' ? hash.toString() : hash.toString(CryptoJS.enc.Base64);
          }
        }
        default:
          throw new Error('Unsupported algorithm');
      }
    } finally {
      const endTime = performance.now();
      console.log(`${algorithm.toUpperCase()} took ${(endTime - startTime).toFixed(2)}ms`);
    }
  };

  const handleGenerate = async () => {
    if (!input) return;

    const startTime = performance.now();
    const hash = await generateHash(selectedAlgorithm, input, useHMAC, secretKey);
    const endTime = performance.now();

    const result: HashResult = {
      algorithm: useHMAC ? `HMAC-${selectedAlgorithm.toUpperCase()}` : selectedAlgorithm.toUpperCase(),
      hash,
      time: endTime - startTime
    };

    setResults([result]);
  };

  const handleGenerateAll = async () => {
    if (!input) return;

    const algorithms: Algorithm[] = ['md5', 'sha1', 'sha256', 'sha512'];
    const allResults: HashResult[] = [];

    for (const algo of algorithms) {
      const startTime = performance.now();
      const hash = await generateHash(algo, input, false, '');
      const endTime = performance.now();

      allResults.push({
        algorithm: algo.toUpperCase(),
        hash,
        time: endTime - startTime
      });
    }

    setResults(allResults);
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
      }
    };

    reader.onerror = () => {
      console.error('File reading failed');
    };

    reader.readAsText(file);
  };

  const loadExample = () => {
    setInput('The quick brown fox jumps over the lazy dog');
    setSecretKey('');
    setUseHMAC(false);
  };

  return (
    <UtilityBase
      title="Hash Calculator"
      icon="🔐"
      description="Generate cryptographic hashes (MD5, SHA-256, SHA-512, HMAC)"
    >
      <div className={styles.container}>
        {/* Algorithm Selection */}
        <div className={styles.controls}>
          <div className={styles.algorithmGrid}>
            {(['md5', 'sha1', 'sha256', 'sha512'] as Algorithm[]).map((algo) => (
              <button
                key={algo}
                className={`${styles.algoBtn} ${selectedAlgorithm === algo ? styles.active : ''}`}
                onClick={() => setSelectedAlgorithm(algo)}
              >
                {algo.toUpperCase()}
              </button>
            ))}
          </div>

          <div className={styles.optionsRow}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={useHMAC}
                onChange={(e) => setUseHMAC(e.target.checked)}
              />
              <span>HMAC Mode</span>
            </label>

            <div className={styles.formatToggle}>
              <label>
                <input
                  type="radio"
                  name="format"
                  checked={outputFormat === 'hex'}
                  onChange={() => setOutputFormat('hex')}
                />
                Hex
              </label>
              <label>
                <input
                  type="radio"
                  name="format"
                  checked={outputFormat === 'base64'}
                  onChange={() => setOutputFormat('base64')}
                />
                Base64
              </label>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className={styles.fileSection}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className={styles.fileInput}
            id="hash-file-input"
          />
          <label htmlFor="hash-file-input" className={styles.fileLabel}>
            📁 Upload File
          </label>
          {fileName && <span className={styles.fileName}>{fileName}</span>}
        </div>

        {/* Input */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>📝 Text Input</span>
            <button onClick={loadExample} className={styles.exampleBtn}>
              Load Example
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            className={styles.textarea}
            rows={4}
          />
        </div>

        {/* HMAC Secret Key */}
        {useHMAC && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>🔑 Secret Key</span>
            </div>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter secret key for HMAC..."
              className={styles.input}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button onClick={handleGenerate} className={styles.generateBtn}>
            ⚡ Generate {selectedAlgorithm.toUpperCase()}
          </button>
          <button onClick={handleGenerateAll} className={styles.compareBtn}>
            🔍 Compare All Algorithms
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>📊 Hash Results</span>
            </div>
            <div className={styles.resultsTable}>
              {results.map((result, idx) => (
                <div key={idx} className={styles.resultRow}>
                  <div className={styles.resultAlgo}>
                    {result.algorithm}
                    <span className={styles.resultTime}>{result.time.toFixed(2)}ms</span>
                  </div>
                  <div className={styles.resultHash}>
                    <code>{result.hash}</code>
                    <CopyButton text={result.hash} label="Copy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {results.length > 0 && (
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Input Length:</span>
              <span className={styles.statValue}>{input.length} chars</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Hash Length:</span>
              <span className={styles.statValue}>{results[0].hash.length} chars</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Format:</span>
              <span className={styles.statValue}>{outputFormat.toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>
    </UtilityBase>
  );
}
