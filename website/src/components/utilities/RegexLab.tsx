// eCy OS v1005.0 - Regex Lab
// Test regular expressions with live feedback and highlighting

import { useState, useMemo } from 'react';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './RegexLab.module.css';

interface Match {
  fullMatch: string;
  groups: string[];
  index: number;
}

const COMMON_PATTERNS = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', desc: 'Basic email validation' },
  { name: 'URL', pattern: 'https?://[^\\s]+', desc: 'HTTP/HTTPS URLs' },
  { name: 'Phone (US)', pattern: '\\(\\d{3}\\)\\s?\\d{3}-\\d{4}', desc: '(555) 123-4567' },
  { name: 'Hex Color', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})', desc: '#FFF or #FFFFFF' },
  { name: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', desc: '192.168.1.1' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', desc: '2024-01-15' },
  { name: 'Credit Card', pattern: '\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}', desc: '1234-5678-9012-3456' },
  { name: 'Username', pattern: '^[a-zA-Z0-9_]{3,16}$', desc: 'Alphanumeric 3-16 chars' },
];

export function RegexLab() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [error, setError] = useState('');
  
  const { matches, isValid } = useMemo(() => {
    if (!pattern || !testString) {
      return { matches: [], isValid: true };
    }
    
    try {
      const regex = new RegExp(pattern, flags);
      const foundMatches: Match[] = [];
      let match;
      
      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            fullMatch: match[0],
            groups: match.slice(1),
            index: match.index
          });
          
          // Prevent infinite loop on zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            fullMatch: match[0],
            groups: match.slice(1),
            index: match.index
          });
        }
      }
      
      return { matches: foundMatches, isValid: true };
    } catch (e) {
      return { matches: [], isValid: false };
    }
  }, [pattern, flags, testString]);
  
  const highlightedText = useMemo(() => {
    if (!pattern || !testString || !isValid || matches.length === 0) {
      return testString;
    }
    
    let result = '';
    let lastIndex = 0;
    
    matches.forEach((match) => {
      result += testString.slice(lastIndex, match.index);
      result += `<mark class="${styles.highlight}">${match.fullMatch}</mark>`;
      lastIndex = match.index + match.fullMatch.length;
    });
    
    result += testString.slice(lastIndex);
    return result;
  }, [testString, matches, isValid, pattern]);
  
  const replacedText = useMemo(() => {
    if (!pattern || !testString || !isValid || !replaceWith) {
      return '';
    }
    
    try {
      const regex = new RegExp(pattern, flags);
      return testString.replace(regex, replaceWith);
    } catch {
      return '';
    }
  }, [pattern, flags, testString, replaceWith, isValid]);
  
  const handleLoadPattern = (presetPattern: string) => {
    setPattern(presetPattern);
    setError('');
  };
  
  const handleTest = () => {
    if (!pattern) {
      setError('Please enter a regex pattern');
      return;
    }
    
    try {
      new RegExp(pattern, flags);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regex pattern');
    }
  };
  
  return (
    <UtilityBase
      title="Regex Lab"
      icon="🔬"
      description="Test regular expressions with live match highlighting and capture groups"
    >
      <div className={styles.container}>
        {/* Pattern Input */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>🎯 Pattern</span>
            {!isValid && pattern && (
              <span className={styles.errorBadge}>Invalid Regex</span>
            )}
            {isValid && pattern && (
              <span className={styles.successBadge}>✓ Valid</span>
            )}
          </div>
          
          <div className={styles.patternRow}>
            <span className={styles.regexPrefix}>/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              onBlur={handleTest}
              placeholder="Enter regex pattern... e.g., \d{3}-\d{4}"
              className={styles.patternInput}
              spellCheck={false}
            />
            <span className={styles.regexSuffix}>/</span>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="g"
              className={styles.flagsInput}
              maxLength={5}
            />
          </div>
          
          {error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>❌</span>
              <span className={styles.errorText}>{error}</span>
            </div>
          )}
        </div>
        
        {/* Common Patterns Library */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>📚 Common Patterns</span>
          </div>
          <div className={styles.patternLibrary}>
            {COMMON_PATTERNS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleLoadPattern(preset.pattern)}
                className={styles.presetButton}
                title={preset.desc}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Test String & Results */}
        <div className={styles.gridContainer}>
          {/* Test Input */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>📝 Test String</span>
              <span className={styles.sectionInfo}>
                {matches.length} {matches.length === 1 ? 'match' : 'matches'}
              </span>
            </div>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against your regex pattern..."
              className={styles.textarea}
              rows={8}
              spellCheck={false}
            />
          </div>
          
          {/* Highlighted Output */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>✨ Matches Highlighted</span>
            </div>
            <div 
              className={styles.highlightedOutput}
              dangerouslySetInnerHTML={{ __html: highlightedText || '<span class="' + styles.placeholder + '">Matches will be highlighted here</span>' }}
            />
          </div>
        </div>
        
        {/* Match Details */}
        {matches.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>📊 Match Details</span>
            </div>
            <div className={styles.matchList}>
              {matches.map((match, idx) => (
                <div key={idx} className={styles.matchItem}>
                  <div className={styles.matchIndex}>Match {idx + 1}</div>
                  <div className={styles.matchContent}>
                    <div><strong>Full:</strong> "{match.fullMatch}"</div>
                    <div><strong>Index:</strong> {match.index}</div>
                    {match.groups.length > 0 && (
                      <div>
                        <strong>Groups:</strong> {match.groups.map((g, i) => (
                          <span key={i} className={styles.group}>({i + 1}) "{g}"</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Replace */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>🔄 Replace</span>
          </div>
          <div className={styles.replaceRow}>
            <input
              type="text"
              value={replaceWith}
              onChange={(e) => setReplaceWith(e.target.value)}
              placeholder="Replacement text... (use $1, $2 for groups)"
              className={styles.replaceInput}
            />
            {replacedText && <CopyButton text={replacedText} label="Copy Result" />}
          </div>
          {replacedText && (
            <pre className={styles.replaceOutput}>{replacedText}</pre>
          )}
        </div>
      </div>
    </UtilityBase>
  );
}
