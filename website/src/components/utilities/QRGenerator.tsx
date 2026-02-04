// eCy OS v1005.0 - QR Generator
// Generate QR codes from text/URLs

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './QRGenerator.module.css';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const examples = [
  'https://github.com',
  'https://eCy-OS.com',
  'Hello, eCy OS v1005.0!',
  'mailto:contact@example.com',
  'tel:+1234567890',
];

export function QRGenerator() {
  const [text, setText] = useState('https://github.com');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  const generateQR = async () => {
    if (!text) {
      setQrDataUrl('');
      return;
    }

    try {
      const url = await QRCode.toDataURL(text, {
        errorCorrectionLevel: errorLevel,
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('QR generation error:', err);
      setQrDataUrl('');
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'qr-code.png';
    link.click();
  };

  const loadExample = () => {
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setText(randomExample);
  };

  const clearAll = () => {
    setText('');
    setQrDataUrl('');
  };

  // Generate on mount and when inputs change
  useEffect(() => {
    generateQR();
  }, [text, errorLevel, size, fgColor, bgColor]);

  return (
    <UtilityBase
      title="QR Generator"
      icon="📱"
      description="Generate QR codes from text/URLs"
    >
      <div className={styles.container}>
        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={loadExample} className={styles.exampleBtn}>
            Random Example
          </button>
          <button onClick={clearAll} className={styles.clearBtn}>
            Clear
          </button>
          <button onClick={downloadQR} disabled={!qrDataUrl} className={styles.downloadBtn}>
            📥 Download PNG
          </button>
        </div>

        {/* Input */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Text / URL</span>
            {text && <CopyButton text={text} label="Copy" />}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text or URL to generate QR code..."
            className={styles.textarea}
            rows={3}
          />
        </div>

        {/* QR Display */}
        {qrDataUrl && (
          <div className={styles.qrDisplay}>
            <img src={qrDataUrl} alt="QR Code" className={styles.qrImage} />
          </div>
        )}

        {/* Controls */}
        <div className={styles.controls}>
          {/* Error Correction */}
          <div className={styles.control}>
            <label className={styles.controlLabel}>
              Error Correction
              <span className={styles.controlHint}>
                {errorLevel === 'L' && '7% recovery'}
                {errorLevel === 'M' && '15% recovery'}
                {errorLevel === 'Q' && '25% recovery'}
                {errorLevel === 'H' && '30% recovery'}
              </span>
            </label>
            <div className={styles.radioGroup}>
              {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((level) => (
                <label key={level} className={styles.radio}>
                  <input
                    type="radio"
                    name="errorLevel"
                    value={level}
                    checked={errorLevel === level}
                    onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                  />
                  <span>{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className={styles.control}>
            <label className={styles.controlLabel}>
              Size: {size}px
            </label>
            <input
              type="range"
              min="128"
              max="512"
              step="32"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          {/* Colors */}
          <div className={styles.colorControls}>
            <div className={styles.colorControl}>
              <label className={styles.controlLabel}>Foreground</label>
              <div className={styles.colorPicker}>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className={styles.colorInput}
                />
                <span className={styles.colorValue}>{fgColor}</span>
              </div>
            </div>

            <div className={styles.colorControl}>
              <label className={styles.controlLabel}>Background</label>
              <div className={styles.colorPicker}>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className={styles.colorInput}
                />
                <span className={styles.colorValue}>{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Characters</span>
            <span className={styles.statValue}>{text.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Size</span>
            <span className={styles.statValue}>{size}px</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Error Level</span>
            <span className={styles.statValue}>{errorLevel}</span>
          </div>
        </div>
      </div>
    </UtilityBase>
  );
}
