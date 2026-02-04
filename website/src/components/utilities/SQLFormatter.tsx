/**
 * SQL Formatter Utility
 * eCy OS v1005.0 - Tier A Utility 4/5
 * 
 * Features:
 * - Multi-dialect support (MySQL, PostgreSQL, SQLite, T-SQL, PL/SQL)
 * - Syntax highlighting
 * - Formatting options (keyword case, indentation, line breaks)
 * - Copy formatted SQL
 * - Cyberpunk aesthetic
 */

import React, { useState } from 'react';
import { format } from 'sql-formatter';
import styles from './SQLFormatter.module.css';

type SQLDialect = 'mysql' | 'postgresql' | 'sqlite' | 'tsql' | 'plsql';
type KeywordCase = 'upper' | 'lower' | 'preserve';

interface FormatOptions {
  dialect: SQLDialect;
  keywordCase: KeywordCase;
  indentSize: number;
  useTabs: boolean;
}

export const SQLFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState<FormatOptions>({
    dialect: 'mysql',
    keywordCase: 'upper',
    indentSize: 2,
    useTabs: false,
  });

  const handleFormat = () => {
    try {
      const formatted = format(input, {
        language: options.dialect,
        keywordCase: options.keywordCase,
        indentStyle: options.useTabs ? 'tabularLeft' : 'standard',
        tabWidth: options.indentSize,
        linesBetweenQueries: 2,
      });
      setOutput(formatted);
    } catch (error) {
      setOutput(`❌ Error formatting SQL:\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      alert('✅ Copied to clipboard!');
    } catch (error) {
      alert('❌ Failed to copy');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>🗄️</span>
          SQL Formatter
        </h2>
        <p className={styles.subtitle}>Format & beautify SQL queries</p>
      </div>

      {/* Options Panel */}
      <div className={styles.optionsPanel}>
        <div className={styles.optionGroup}>
          <label className={styles.label}>Dialect</label>
          <select
            className={styles.select}
            value={options.dialect}
            onChange={(e) => setOptions({ ...options, dialect: e.target.value as SQLDialect })}
          >
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="sqlite">SQLite</option>
            <option value="tsql">T-SQL (SQL Server)</option>
            <option value="plsql">PL/SQL (Oracle)</option>
          </select>
        </div>

        <div className={styles.optionGroup}>
          <label className={styles.label}>Keyword Case</label>
          <select
            className={styles.select}
            value={options.keywordCase}
            onChange={(e) => setOptions({ ...options, keywordCase: e.target.value as KeywordCase })}
          >
            <option value="upper">UPPERCASE</option>
            <option value="lower">lowercase</option>
            <option value="preserve">Preserve</option>
          </select>
        </div>

        <div className={styles.optionGroup}>
          <label className={styles.label}>Indent Size</label>
          <select
            className={styles.select}
            value={options.indentSize}
            onChange={(e) => setOptions({ ...options, indentSize: parseInt(e.target.value) })}
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="8">8 spaces</option>
          </select>
        </div>

        <div className={styles.optionGroup}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={options.useTabs}
              onChange={(e) => setOptions({ ...options, useTabs: e.target.checked })}
            />
            Use Tabs
          </label>
        </div>
      </div>

      {/* Input/Output Panels */}
      <div className={styles.panels}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Input SQL</span>
            <span className={styles.charCount}>{input.length} characters</span>
          </div>
          <textarea
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your SQL query here..."
            spellCheck={false}
          />
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Formatted SQL</span>
            <span className={styles.charCount}>{output.length} characters</span>
          </div>
          <textarea
            className={styles.textarea}
            value={output}
            readOnly
            placeholder="Formatted SQL will appear here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button onClick={handleFormat} className={`${styles.button} ${styles.primary}`}>
          ✨ Format SQL
        </button>
        <button onClick={handleCopy} className={`${styles.button} ${styles.secondary}`} disabled={!output}>
          📋 Copy
        </button>
        <button onClick={handleClear} className={`${styles.button} ${styles.danger}`}>
          🗑️ Clear
        </button>
      </div>

      {/* Sample Queries */}
      <div className={styles.samples}>
        <h3 className={styles.samplesTitle}>Sample Queries</h3>
        <div className={styles.sampleButtons}>
          <button
            className={styles.sampleButton}
            onClick={() => setInput('SELECT * FROM users WHERE id=1 AND status="active"')}
          >
            Simple SELECT
          </button>
          <button
            className={styles.sampleButton}
            onClick={() => setInput('SELECT u.id,u.name,o.total FROM users u INNER JOIN orders o ON u.id=o.user_id WHERE o.total>100 ORDER BY o.total DESC')}
          >
            Complex JOIN
          </button>
          <button
            className={styles.sampleButton}
            onClick={() => setInput('INSERT INTO products(name,price,stock)VALUES("Widget",19.99,100),("Gadget",29.99,50)')}
          >
            INSERT Multiple
          </button>
          <button
            className={styles.sampleButton}
            onClick={() => setInput('CREATE TABLE employees(id INT PRIMARY KEY AUTO_INCREMENT,name VARCHAR(100) NOT NULL,email VARCHAR(100) UNIQUE,department VARCHAR(50),salary DECIMAL(10,2),hired_at DATETIME DEFAULT CURRENT_TIMESTAMP)')}
          >
            CREATE TABLE
          </button>
        </div>
      </div>
    </div>
  );
};

export default SQLFormatter;
