import React, { useState, useCallback } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import styles from './DiffChecker.module.css';

interface DiffEntry {
  id: string;
  leftText: string;
  rightText: string;
  timestamp: Date;
  language: string;
}

type DiffMode = 'side-by-side' | 'inline';
type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'html' | 'css' | 'json' | 'markdown' | 'plaintext';

const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
];

export const DiffChecker: React.FC = () => {
  const [leftText, setLeftText] = useState<string>('// Original code\nfunction hello() {\n  console.log("Hello");\n}');
  const [rightText, setRightText] = useState<string>('// Modified code\nfunction hello() {\n  console.log("Hello, World!");\n}');
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [diffMode, setDiffMode] = useState<DiffMode>('side-by-side');
  const [history, setHistory] = useState<DiffEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleLeftChange = useCallback((value: string | undefined) => {
    setLeftText(value || '');
  }, []);

  const handleRightChange = useCallback((value: string | undefined) => {
    setRightText(value || '');
  }, []);

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  }, []);

  const toggleDiffMode = useCallback(() => {
    setDiffMode(prev => prev === 'side-by-side' ? 'inline' : 'side-by-side');
  }, []);

  const saveDiff = useCallback(() => {
    const newEntry: DiffEntry = {
      id: `diff-${Date.now()}`,
      leftText,
      rightText,
      timestamp: new Date(),
      language,
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 20)); // Keep last 20
  }, [leftText, rightText, language]);

  const loadDiff = useCallback((entry: DiffEntry) => {
    setLeftText(entry.leftText);
    setRightText(entry.rightText);
    setLanguage(entry.language as SupportedLanguage);
    setShowHistory(false);
  }, []);

  const clearDiff = useCallback(() => {
    setLeftText('');
    setRightText('');
  }, []);

  const swapTexts = useCallback(() => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  }, [leftText, rightText]);

  const handleFileUpload = useCallback((side: 'left' | 'right') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      if (side === 'left') {
        setLeftText(text);
      } else {
        setRightText(text);
      }

      // Auto-detect language from file extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      const langMap: Record<string, SupportedLanguage> = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'cpp',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'md': 'markdown',
      };
      if (ext && langMap[ext]) {
        setLanguage(langMap[ext]);
      }
    } catch (error) {
      console.error('File upload error:', error);
    }
  }, []);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log(`${label} copied to clipboard`);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>⚡</span>
          Diff Checker
        </h2>
        <p className={styles.subtitle}>Compare text & code side-by-side with syntax highlighting</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Language:</label>
          <select value={language} onChange={handleLanguageChange} className={styles.select}>
            {LANGUAGE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <button
            onClick={toggleDiffMode}
            className={`${styles.button} ${styles.buttonSecondary}`}
            title="Toggle diff mode"
          >
            {diffMode === 'side-by-side' ? '📊 Side-by-Side' : '📝 Inline'}
          </button>
        </div>

        <div className={styles.controlGroup}>
          <button onClick={swapTexts} className={`${styles.button} ${styles.buttonSecondary}`} title="Swap left and right">
            🔄 Swap
          </button>
          <button onClick={clearDiff} className={`${styles.button} ${styles.buttonSecondary}`} title="Clear both sides">
            🗑️ Clear
          </button>
          <button onClick={saveDiff} className={`${styles.button} ${styles.buttonPrimary}`} title="Save to history">
            💾 Save
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`${styles.button} ${styles.buttonSecondary}`}
            title="View history"
          >
            📜 History ({history.length})
          </button>
        </div>
      </div>

      {showHistory && history.length > 0 && (
        <div className={styles.historyPanel}>
          <h3>Comparison History</h3>
          <div className={styles.historyList}>
            {history.map(entry => (
              <div key={entry.id} className={styles.historyItem} onClick={() => loadDiff(entry)}>
                <div className={styles.historyMeta}>
                  <span className={styles.historyLang}>{entry.language}</span>
                  <span className={styles.historyTime}>
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className={styles.historyPreview}>
                  {entry.leftText.substring(0, 50)}... ↔ {entry.rightText.substring(0, 50)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.inputSection}>
        <div className={styles.inputColumn}>
          <div className={styles.inputHeader}>
            <span className={styles.inputLabel}>Original (Left)</span>
            <div className={styles.inputActions}>
              <label className={styles.fileButton}>
                📂 Upload
                <input
                  type="file"
                  accept=".txt,.js,.ts,.py,.java,.cpp,.c,.html,.css,.json,.md"
                  onChange={handleFileUpload('left')}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                onClick={() => copyToClipboard(leftText, 'Left text')}
                className={styles.copyButton}
                title="Copy left text"
              >
                📋
              </button>
            </div>
          </div>
          <textarea
            value={leftText}
            onChange={(e) => handleLeftChange(e.target.value)}
            className={styles.textarea}
            placeholder="Paste or type original text here..."
            spellCheck={false}
          />
        </div>

        <div className={styles.inputColumn}>
          <div className={styles.inputHeader}>
            <span className={styles.inputLabel}>Modified (Right)</span>
            <div className={styles.inputActions}>
              <label className={styles.fileButton}>
                📂 Upload
                <input
                  type="file"
                  accept=".txt,.js,.ts,.py,.java,.cpp,.c,.html,.css,.json,.md"
                  onChange={handleFileUpload('right')}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                onClick={() => copyToClipboard(rightText, 'Right text')}
                className={styles.copyButton}
                title="Copy right text"
              >
                📋
              </button>
            </div>
          </div>
          <textarea
            value={rightText}
            onChange={(e) => handleRightChange(e.target.value)}
            className={styles.textarea}
            placeholder="Paste or type modified text here..."
            spellCheck={false}
          />
        </div>
      </div>

      <div className={styles.diffSection}>
        <div className={styles.diffHeader}>
          <h3>Diff View</h3>
          <span className={styles.modeIndicator}>
            {diffMode === 'side-by-side' ? 'Side-by-Side Mode' : 'Inline Mode'}
          </span>
        </div>
        <div className={styles.editorWrapper}>
          <DiffEditor
            original={leftText}
            modified={rightText}
            language={language}
            theme="vs-dark"
            options={{
              renderSideBySide: diffMode === 'side-by-side',
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'off',
              renderWhitespace: 'selection',
              diffWordWrap: 'off',
            }}
            height="500px"
          />
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Left Lines:</span>
          <span className={styles.statValue}>{leftText.split('\n').length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Right Lines:</span>
          <span className={styles.statValue}>{rightText.split('\n').length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Left Chars:</span>
          <span className={styles.statValue}>{leftText.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Right Chars:</span>
          <span className={styles.statValue}>{rightText.length}</span>
        </div>
      </div>
    </div>
  );
};

export default DiffChecker;
