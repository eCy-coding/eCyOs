// eCy OS v1005.0 - Password Generator
// Generate secure passwords with customization

import { useState } from 'react';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './PasswordGenerator.module.css';

interface PasswordHistory {
  id: string;
  password: string;
  strength: string;
  timestamp: Date;
}

type StrengthLevel = 'weak' | 'medium' | 'strong' | 'very-strong';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = '0OIl';

function calculateStrength(password: string): { level: StrengthLevel; score: number } {
  let score = 0;
  
  // Length bonus
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Entropy bonus for very long passwords
  if (password.length >= 32) score += 2;
  
  let level: StrengthLevel;
  if (score <= 3) level = 'weak';
  else if (score <= 5) level = 'medium';
  else if (score <= 7) level = 'strong';
  else level = 'very-strong';
  
  return { level, score: Math.min(score, 10) };
}

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [strength, setStrength] = useState<{ level: StrengthLevel; score: number } | null>(null);
  const [history, setHistory] = useState<PasswordHistory[]>([]);

  const generatePassword = () => {
    // Build character set
    let charset = '';
    if (useUppercase) charset += UPPERCASE;
    if (useLowercase) charset += LOWERCASE;
    if (useNumbers) charset += NUMBERS;
    if (useSymbols) charset += SYMBOLS;

    // Exclude ambiguous characters if needed
    if (excludeAmbiguous) {
      charset = charset.split('').filter(char => !AMBIGUOUS.includes(char)).join('');
    }

    if (charset.length === 0) {
      alert('Please select at least one character type');
      return;
    }

    // Generate password
    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    // Calculate strength
    const passwordStrength = calculateStrength(password);

    // Update state
    setCurrentPassword(password);
    setStrength(passwordStrength);

    // Add to history
    const historyItem: PasswordHistory = {
      id: Date.now().toString(),
      password,
      strength: passwordStrength.level,
      timestamp: new Date(),
    };
    setHistory(prev => [historyItem, ...prev].slice(0, 10)); // Keep last 10
  };

  const downloadPasswords = () => {
    if (history.length === 0) return;

    const content = history
      .map(item => `${item.password} (${item.strength}) - ${item.timestamp.toLocaleString()}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'passwords.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setCurrentPassword('');
    setStrength(null);
  };

  const getStrengthColor = (level: StrengthLevel): string => {
    switch (level) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#10b981';
      case 'very-strong': return '#8b5cf6';
    }
  };

  const getStrengthLabel = (level: StrengthLevel): string => {
    switch (level) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      case 'very-strong': return 'Very Strong';
    }
  };

  return (
    <UtilityBase
      title="Password Generator"
      icon="🔐"
      description="Generate secure passwords with customization"
    >
      <div className={styles.container}>
        {/* Length Control */}
        <div className={styles.control}>
          <label className={styles.controlLabel}>
            Password Length: {length}
          </label>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className={styles.slider}
          />
        </div>

        {/* Character Options */}
        <div className={styles.options}>
          <div className={styles.optionsHeader}>Character Types</div>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={useUppercase}
              onChange={(e) => setUseUppercase(e.target.checked)}
            />
            <span>Uppercase (A-Z)</span>
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={useLowercase}
              onChange={(e) => setUseLowercase(e.target.checked)}
            />
            <span>Lowercase (a-z)</span>
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={useNumbers}
              onChange={(e) => setUseNumbers(e.target.checked)}
            />
            <span>Numbers (0-9)</span>
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={useSymbols}
              onChange={(e) => setUseSymbols(e.target.checked)}
            />
            <span>Symbols (!@#$%...)</span>
          </label>
        </div>

        {/* Advanced Options */}
        <div className={styles.advanced}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
            />
            <span>Exclude Ambiguous (0, O, I, l)</span>
          </label>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={generatePassword} className={styles.generateBtn}>
            🔐 Generate Password
          </button>
          <button onClick={clearAll} className={styles.clearBtn}>
            Clear
          </button>
          <button 
            onClick={downloadPasswords} 
            disabled={history.length === 0}
            className={styles.downloadBtn}
          >
            📥 Download History
          </button>
        </div>

        {/* Current Password */}
        {currentPassword && (
          <div className={styles.result}>
            <div className={styles.resultHeader}>
              <span className={styles.resultTitle}>Generated Password</span>
              <CopyButton text={currentPassword} label="Copy" />
            </div>
            <div className={styles.password}>
              {currentPassword}
            </div>

            {/* Strength Meter */}
            {strength && (
              <div className={styles.strengthMeter}>
                <div className={styles.strengthHeader}>
                  <span>Password Strength</span>
                  <span 
                    className={styles.strengthLabel}
                    style={{ color: getStrengthColor(strength.level) }}
                  >
                    {getStrengthLabel(strength.level)}
                  </span>
                </div>
                <div className={styles.strengthBar}>
                  <div 
                    className={styles.strengthFill}
                    style={{
                      width: `${(strength.score / 10) * 100}%`,
                      backgroundColor: getStrengthColor(strength.level),
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className={styles.history}>
            <div className={styles.historyHeader}>
              Recent Passwords ({history.length})
            </div>
            <div className={styles.historyList}>
              {history.map((item) => (
                <div key={item.id} className={styles.historyItem}>
                  <div className={styles.historyPassword}>
                    <span className={styles.historyPasswordText}>
                      {item.password}
                    </span>
                    <CopyButton text={item.password} label="" />
                  </div>
                  <div className={styles.historyMeta}>
                    <span 
                      className={styles.historyStrength}
                      style={{ 
                        color: getStrengthColor(item.strength as StrengthLevel) 
                      }}
                    >
                      {getStrengthLabel(item.strength as StrengthLevel)}
                    </span>
                    <span className={styles.historyTime}>
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Length</span>
            <span className={styles.statValue}>{length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>History</span>
            <span className={styles.statValue}>{history.length}</span>
          </div>
        </div>
      </div>
    </UtilityBase>
  );
}
