// eCy OS v1005.0 - CSV/JSON Converter
// Bidirectional CSV ↔ JSON conversion

import { useState } from 'react';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './CSVJSONConverter.module.css';

type ConversionMode = 'csv-to-json' | 'json-to-csv';
type Delimiter = ',' | ';' | '\t';

export function CSVJSONConverter() {
  const [mode, setMode] = useState<ConversionMode>('csv-to-json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [delimiter, setDelimiter] = useState<Delimiter>(',');
  const [hasHeaders, setHasHeaders] = useState(true);
  const [error, setError] = useState('');

  const csvToJson = (csv: string, delim: Delimiter, headers: boolean): string => {
    const lines = csv.trim().split('\n');
    if (lines.length === 0) return '[]';

    const result: any[] = [];
    let headerRow: string[] = [];

    if (headers && lines.length > 0) {
      headerRow = lines[0].split(delim).map(h => h.trim());
      lines.shift();
    }

    for (const line of lines) {
      if (!line.trim()) continue;
      const values = line.split(delim).map(v => v.trim());
      
      if (headers) {
        const obj: any = {};
        headerRow.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        result.push(obj);
      } else {
        result.push(values);
      }
    }

    return JSON.stringify(result, null, 2);
  };

  const jsonToCsv = (json: string, delim: Delimiter, headers: boolean): string => {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array');
      }

      if (data.length === 0) return '';

      const lines: string[] = [];

      // Check if array of objects or array of arrays
      if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
        // Array of objects
        const keys = Object.keys(data[0]);
        
        if (headers) {
          lines.push(keys.join(delim));
        }

        data.forEach(obj => {
          const values = keys.map(key => {
            const val = obj[key];
            // Escape values containing delimiter
            if (String(val).includes(delim)) {
              return `"${val}"`;
            }
            return val;
          });
          lines.push(values.join(delim));
        });
      } else {
        // Array of arrays
        data.forEach(row => {
          if (Array.isArray(row)) {
            const values = row.map(val => {
              if (String(val).includes(delim)) {
                return `"${val}"`;
              }
              return val;
            });
            lines.push(values.join(delim));
          }
        });
      }

      return lines.join('\n');
    } catch (err) {
      throw new Error('Invalid JSON format');
    }
  };

  const convert = () => {
    setError('');
    
    if (!input.trim()) {
      setError('Please enter data to convert');
      return;
    }

    try {
      if (mode === 'csv-to-json') {
        const result = csvToJson(input, delimiter, hasHeaders);
        setOutput(result);
      } else {
        const result = jsonToCsv(input, delimiter, hasHeaders);
        setOutput(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion error');
      setOutput('');
    }
  };

  const loadExample = () => {
    if (mode === 'csv-to-json') {
      setInput('name,age,city\nAlice,30,New York\nBob,25,Los Angeles\nCharlie,35,Chicago');
    } else {
      setInput(JSON.stringify([
        { name: 'Alice', age: 30, city: 'New York' },
        { name: 'Bob', age: 25, city: 'Los Angeles' },
        { name: 'Charlie', age: 35, city: 'Chicago' }
      ], null, 2));
    }
    setError('');
    setOutput('');
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const downloadOutput = () => {
    if (!output) return;

    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mode === 'csv-to-json' ? 'data.json' : 'data.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const swapMode = () => {
    setMode(prev => prev === 'csv-to-json' ? 'json-to-csv' : 'csv-to-json');
    setInput(output || '');
    setOutput('');
    setError('');
  };

  const getDelimiterLabel = (delim: Delimiter): string => {
    switch (delim) {
      case ',': return 'Comma (,)';
      case ';': return 'Semicolon (;)';
      case '\t': return 'Tab (\\t)';
    }
  };

  return (
    <UtilityBase
      title="CSV/JSON Converter"
      icon="🔄"
      description="Convert between CSV and JSON formats"
    >
      <div className={styles.container}>
        {/* Mode Toggle */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'csv-to-json' ? styles.active : ''}`}
            onClick={() => setMode('csv-to-json')}
          >
            CSV → JSON
          </button>
          <button
            className={styles.swapBtn}
            onClick={swapMode}
            title="Swap input/output"
          >
            🔄
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'json-to-csv' ? styles.active : ''}`}
            onClick={() => setMode('json-to-csv')}
          >
            JSON → CSV
          </button>
        </div>

        {/* Options */}
        <div className={styles.options}>
          {mode === 'csv-to-json' && (
            <div className={styles.option}>
              <label className={styles.optionLabel}>CSV Delimiter</label>
              <div className={styles.delimiterBtns}>
                {[',', ';', '\t'].map((delim) => (
                  <button
                    key={delim}
                    className={`${styles.delimiterBtn} ${delimiter === delim ? styles.active : ''}`}
                    onClick={() => setDelimiter(delim as Delimiter)}
                  >
                    {getDelimiterLabel(delim as Delimiter)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={hasHeaders}
              onChange={(e) => setHasHeaders(e.target.checked)}
            />
            <span>{mode === 'csv-to-json' ? 'First row is header' : 'Include headers in CSV'}</span>
          </label>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={loadExample} className={styles.exampleBtn}>
            Load Example
          </button>
          <button onClick={convert} className={styles.convertBtn}>
            🔄 Convert
          </button>
          <button onClick={clearAll} className={styles.clearBtn}>
            Clear
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {/* Input/Output */}
        <div className={styles.conversion}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>
                {mode === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}
              </span>
              <CopyButton text={input} label="Copy" />
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'csv-to-json' 
                ? 'Paste CSV data here...\n\nname,age,city\nAlice,30,NYC'
                : 'Paste JSON array here...\n\n[{"name":"Alice","age":30}]'
              }
              className={styles.textarea}
            />
          </div>

          <div className={styles.arrow}>→</div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>
                {mode === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}
              </span>
              {output && (
                <>
                  <CopyButton text={output} label="Copy" />
                  <button onClick={downloadOutput} className={styles.downloadBtn}>
                    📥
                  </button>
                </>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Converted data will appear here..."
              className={`${styles.textarea} ${styles.output}`}
            />
          </div>
        </div>

        {/* Stats */}
        {output && (
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Input Lines</span>
              <span className={styles.statValue}>{input.split('\n').length}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Output Lines</span>
              <span className={styles.statValue}>{output.split('\n').length}</span>
            </div>
          </div>
        )}
      </div>
    </UtilityBase>
  );
}
