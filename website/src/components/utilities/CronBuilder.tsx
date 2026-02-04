import React, { useState, useCallback, useEffect } from 'react';
// @ts-ignore - cron-parser uses CommonJS exports
const cronParser = require('cron-parser');
import styles from './CronBuilder.module.css';

interface CronPreset {
  name: string;
  expression: string;
  description: string;
}

interface CronHistory {
  id: string;
  expression: string;
  description: string;
  timestamp: Date;
}

const PRESETS: CronPreset[] = [
  { name: 'Every Minute', expression: '* * * * *', description: 'Runs every minute' },
  { name: 'Every Hour', expression: '0 * * * *', description: 'Runs at the start of every hour' },
  { name: 'Daily at Midnight', expression: '0 0 * * *', description: 'Runs daily at 00:00' },
  { name: 'Daily at Noon', expression: '0 12 * * *', description: 'Runs daily at 12:00' },
  { name: 'Weekly (Monday)', expression: '0 0 * * 1', description: 'Runs every Monday at midnight' },
  { name: 'Monthly (1st)', expression: '0 0 1 * *', description: 'Runs on the 1st of every month' },
  { name: 'Yearly (Jan 1st)', expression: '0 0 1 1 *', description: 'Runs on January 1st at midnight' },
  { name: 'Weekdays at 9 AM', expression: '0 9 * * 1-5', description: 'Runs Monday-Friday at 9:00 AM' },
  { name: 'Every 15 Minutes', expression: '*/15 * * * *', description: 'Runs every 15 minutes' },
  { name: 'Every 6 Hours', expression: '0 */6 * * *', description: 'Runs every 6 hours' },
];

export const CronBuilder: React.FC = () => {
  const [minute, setMinute] = useState<string>('*');
  const [hour, setHour] = useState<string>('*');
  const [dayOfMonth, setDayOfMonth] = useState<string>('*');
  const [month, setMonth] = useState<string>('*');
  const [dayOfWeek, setDayOfWeek] = useState<string>('*');
  
  const [cronExpression, setCronExpression] = useState<string>('* * * * *');
  const [description, setDescription] = useState<string>('');
  const [nextExecutions, setNextExecutions] = useState<Date[]>([]);
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<CronHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Generate cron expression from parts
  useEffect(() => {
    const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    setCronExpression(expression);
    validateAndPreview(expression);
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  const validateAndPreview = useCallback((expression: string) => {
    try {
      const interval = cronParser.parseExpression(expression);
      const executions: Date[] = [];
      
      for (let i = 0; i < 5; i++) {
        executions.push(interval.next().toDate());
      }
      
      setNextExecutions(executions);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid cron expression');
      setNextExecutions([]);
    }
  }, []);

  const handlePresetSelect = useCallback((preset: CronPreset) => {
    const parts = preset.expression.split(' ');
    setMinute(parts[0]);
    setHour(parts[1]);
    setDayOfMonth(parts[2]);
    setMonth(parts[3]);
    setDayOfWeek(parts[4]);
    setDescription(preset.description);
  }, []);

  const handleManualExpression = useCallback((expr: string) => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
    }
  }, []);

  const saveCron = useCallback(() => {
    if (!error && cronExpression) {
      const newEntry: CronHistory = {
        id: `cron-${Date.now()}`,
        expression: cronExpression,
        description: description || 'Custom cron expression',
        timestamp: new Date(),
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 20));
    }
  }, [cronExpression, description, error]);

  const loadFromHistory = useCallback((entry: CronHistory) => {
    handleManualExpression(entry.expression);
    setDescription(entry.description);
    setShowHistory(false);
  }, [handleManualExpression]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(cronExpression).then(() => {
      console.log('Cron expression copied to clipboard');
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  }, [cronExpression]);

  const resetBuilder = useCallback(() => {
    setMinute('*');
    setHour('*');
    setDayOfMonth('*');
    setMonth('*');
    setDayOfWeek('*');
    setDescription('');
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>⏰</span>
          Cron Builder
        </h2>
        <p className={styles.subtitle}>Visual cron expression builder with next execution preview</p>
      </div>

      {/* Presets */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Quick Presets</h3>
        <div className={styles.presetGrid}>
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              className={styles.presetButton}
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Builder */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Build Custom Expression</h3>
        <div className={styles.builderGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Minute (0-59)</label>
            <input
              type="text"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className={styles.input}
              placeholder="* or 0-59"
            />
            <span className={styles.fieldHint}>* = every minute</span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Hour (0-23)</label>
            <input
              type="text"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className={styles.input}
              placeholder="* or 0-23"
            />
            <span className={styles.fieldHint}>* = every hour</span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Day of Month (1-31)</label>
            <input
              type="text"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              className={styles.input}
              placeholder="* or 1-31"
            />
            <span className={styles.fieldHint}>* = every day</span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Month (1-12)</label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={styles.input}
              placeholder="* or 1-12"
            />
            <span className={styles.fieldHint}>* = every month</span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Day of Week (0-6)</label>
            <input
              type="text"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className={styles.input}
              placeholder="* or 0-6"
            />
            <span className={styles.fieldHint}>0 = Sunday, 6 = Saturday</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Generated Expression</h3>
        <div className={styles.expressionBox}>
          <code className={styles.expressionCode}>{cronExpression}</code>
          <button onClick={copyToClipboard} className={styles.copyButton} title="Copy to clipboard">
            📋 Copy
          </button>
        </div>

        <div className={styles.descriptionBox}>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.descriptionInput}
            placeholder="Add description (optional)"
          />
        </div>

        {error && (
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}
      </div>

      {/* Next Executions */}
      {nextExecutions.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Next 5 Executions</h3>
          <div className={styles.executionsList}>
            {nextExecutions.map((date, index) => (
              <div key={index} className={styles.executionItem}>
                <span className={styles.executionNumber}>#{index + 1}</span>
                <span className={styles.executionDate}>
                  {date.toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button onClick={saveCron} className={`${styles.button} ${styles.buttonPrimary}`} disabled={!!error}>
          💾 Save to History
        </button>
        <button onClick={resetBuilder} className={`${styles.button} ${styles.buttonSecondary}`}>
          🔄 Reset
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`${styles.button} ${styles.buttonSecondary}`}
        >
          📜 History ({history.length})
        </button>
      </div>

      {/* History */}
      {showHistory && history.length > 0 && (
        <div className={styles.historyPanel}>
          <h3>Expression History</h3>
          <div className={styles.historyList}>
            {history.map(entry => (
              <div key={entry.id} className={styles.historyItem} onClick={() => loadFromHistory(entry)}>
                <div className={styles.historyMeta}>
                  <code className={styles.historyExpression}>{entry.expression}</code>
                  <span className={styles.historyTime}>
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className={styles.historyDescription}>{entry.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cheat Sheet */}
      <div className={styles.cheatSheet}>
        <h3>Cron Expression Syntax</h3>
        <div className={styles.cheatGrid}>
          <div className={styles.cheatItem}>
            <code>*</code>
            <span>Any value</span>
          </div>
          <div className={styles.cheatItem}>
            <code>*/15</code>
            <span>Every 15 units</span>
          </div>
          <div className={styles.cheatItem}>
            <code>1-5</code>
            <span>Range (1 to 5)</span>
          </div>
          <div className={styles.cheatItem}>
            <code>1,3,5</code>
            <span>Multiple values</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronBuilder;
