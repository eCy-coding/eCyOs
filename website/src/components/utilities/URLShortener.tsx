// eCy OS v1005.0 - URL Shortener
// Generate short links with QR codes

import { useState } from 'react';
import { nanoid } from 'nanoid';
import QRCodeLib from 'qrcode';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './URLShortener.module.css';

interface ShortenedURL {
  id: string;
  original: string;
  short: string;
  alias?: string;
  clicks: number;
  createdAt: Date;
}

const BASE_URL = 'https://ecy.sh/';

function isValidURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export function URLShortener() {
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [currentShortUrl, setCurrentShortUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [history, setHistory] = useState<ShortenedURL[]>([]);
  const [error, setError] = useState('');

  const generateQR = async (url: string) => {
    try {
      const dataUrl = await QRCodeLib.toDataURL(url, {
        errorCorrectionLevel: 'M',
        width: 200,
        margin: 2,
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR generation error:', err);
      setQrDataUrl('');
    }
  };

  const shortenURL = () => {
    setError('');

    // Validation
    if (!longUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidURL(longUrl)) {
      setError('Invalid URL format. Must start with http:// or https://');
      return;
    }

    // Custom alias validation
    if (customAlias) {
      if (customAlias.length < 3 || customAlias.length > 20) {
        setError('Alias must be 3-20 characters');
        return;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
        setError('Alias can only contain letters, numbers, hyphens, and underscores');
        return;
      }
      // Check if alias already exists
      if (history.some(item => item.alias === customAlias)) {
        setError('Alias already exists. Please choose another.');
        return;
      }
    }

    // Generate short code
    const shortCode = customAlias || nanoid(8);
    const shortUrl = `${BASE_URL}${shortCode}`;

    // Create shortened URL object
    const shortened: ShortenedURL = {
      id: nanoid(),
      original: longUrl,
      short: shortUrl,
      alias: customAlias || undefined,
      clicks: Math.floor(Math.random() * 100), // Mock click count
      createdAt: new Date(),
    };

    // Update state
    setCurrentShortUrl(shortUrl);
    setHistory(prev => [shortened, ...prev].slice(0, 5)); // Keep last 5
    generateQR(shortUrl);

    // Clear inputs
    setLongUrl('');
    setCustomAlias('');
  };

  const clearAll = () => {
    setLongUrl('');
    setCustomAlias('');
    setCurrentShortUrl('');
    setQrDataUrl('');
    setError('');
  };

  const loadExample = () => {
    const examples = [
      'https://github.com/eCy-OS',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://en.wikipedia.org/wiki/URL_shortening',
    ];
    setLongUrl(examples[Math.floor(Math.random() * examples.length)]);
  };

  return (
    <UtilityBase
      title="URL Shortener"
      icon="🔗"
      description="Generate short links with QR codes"
    >
      <div className={styles.container}>
        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={loadExample} className={styles.exampleBtn}>
            Load Example
          </button>
          <button onClick={clearAll} className={styles.clearBtn}>
            Clear
          </button>
        </div>

        {/* Input Section */}
        <div className={styles.section}>
          <label className={styles.label}>Long URL</label>
          <input
            type="text"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com/very/long/url/path..."
            className={styles.input}
            onKeyPress={(e) => e.key === 'Enter' && shortenURL()}
          />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>
            Custom Alias <span className={styles.optional}>(optional)</span>
          </label>
          <input
            type="text"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="my-custom-link (3-20 chars, alphanumeric)"
            className={styles.input}
            onKeyPress={(e) => e.key === 'Enter' && shortenURL()}
          />
        </div>

        {/* Error */}
        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {/* Generate Button */}
        <button onClick={shortenURL} className={styles.generateBtn}>
          🚀 Shorten URL
        </button>

        {/* Result */}
        {currentShortUrl && (
          <div className={styles.result}>
            <div className={styles.resultHeader}>
              <span className={styles.resultTitle}>Short URL</span>
              <CopyButton text={currentShortUrl} label="Copy" />
            </div>
            <div className={styles.shortUrl}>
              {currentShortUrl}
            </div>

            {/* QR Code */}
            {qrDataUrl && (
              <div className={styles.qrSection}>
                <span className={styles.qrTitle}>QR Code</span>
                <img src={qrDataUrl} alt="QR Code" className={styles.qrImage} />
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className={styles.history}>
            <div className={styles.historyHeader}>
              Recent Links ({history.length})
            </div>
            <div className={styles.historyList}>
              {history.map((item) => (
                <div key={item.id} className={styles.historyItem}>
                  <div className={styles.historyShort}>
                    {item.short}
                    <CopyButton text={item.short} label="" />
                  </div>
                  <div className={styles.historyOriginal} title={item.original}>
                    → {item.original.length > 40 
                      ? item.original.substring(0, 40) + '...' 
                      : item.original}
                  </div>
                  <div className={styles.historyStats}>
                    👁️ {item.clicks} clicks
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total Shortened</span>
            <span className={styles.statValue}>{history.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total Clicks</span>
            <span className={styles.statValue}>
              {history.reduce((sum, item) => sum + item.clicks, 0)}
            </span>
          </div>
        </div>
      </div>
    </UtilityBase>
  );
}
