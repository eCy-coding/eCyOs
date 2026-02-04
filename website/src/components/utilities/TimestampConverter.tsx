// eCy OS v1005.0 - Timestamp Converter
// Convert between Unix timestamps and human-readable dates

import { useState, useEffect } from 'react';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './TimestampConverter.module.css';

type TimezoneId = 'UTC' | 'EST' | 'CST' | 'MST' | 'PST' | 'GMT' | 'CET' | 'EET' | 'IST' | 'CST_CHINA' | 'JST' | 'AEST' | 'NZST';

interface Timezone {
  id: TimezoneId;
  name: string;
  offset: number; // hours from UTC
}

const timezones: Timezone[] = [
  { id: 'UTC', name: 'UTC (Coordinated Universal Time)', offset: 0 },
  { id: 'EST', name: 'EST (Eastern Standard Time)', offset: -5 },
  { id: 'CST', name: 'CST (Central Standard Time)', offset: -6 },
  { id: 'MST', name: 'MST (Mountain Standard Time)', offset: -7 },
  { id: 'PST', name: 'PST (Pacific Standard Time)', offset: -8 },
  { id: 'GMT', name: 'GMT (Greenwich Mean Time)', offset: 0 },
  { id: 'CET', name: 'CET (Central European Time)', offset: 1 },
  { id: 'EET', name: 'EET (Eastern European Time)', offset: 2 },
  { id: 'IST', name: 'IST (India Standard Time)', offset: 5.5 },
  { id: 'CST_CHINA', name: 'CST (China Standard Time)', offset: 8 },
  { id: 'JST', name: 'JST (Japan Standard Time)', offset: 9 },
  { id: 'AEST', name: 'AEST (Australian Eastern Time)', offset: 10 },
  { id: 'NZST', name: 'NZST (New Zealand Standard Time)', offset: 12 },
];

export function TimestampConverter() {
  const [unixTimestamp, setUnixTimestamp] = useState('');
  const [humanReadable, setHumanReadable] = useState('');
  const [timezone, setTimezone] = useState<TimezoneId>('UTC');
  const [useMilliseconds, setUseMilliseconds] = useState(false);
  const [iso8601, setIso8601] = useState('');
  const [rfc2822, setRfc2822] = useState('');
  const [relativeTime, setRelativeTime] = useState('');

  const convertUnixToHuman = (timestamp: string) => {
    if (!timestamp || isNaN(Number(timestamp))) {
      setHumanReadable('');
      setIso8601('');
      setRfc2822('');
      setRelativeTime('');
      return;
    }

    const ts = Number(timestamp);
    const milliseconds = useMilliseconds ? ts : ts * 1000;
    const date = new Date(milliseconds);

    if (isNaN(date.getTime())) {
      setHumanReadable('Invalid timestamp');
      return;
    }

    // Apply timezone offset
    const tz = timezones.find((t) => t.id === timezone);
    const offsetMs = (tz?.offset || 0) * 60 * 60 * 1000;
    const adjustedDate = new Date(date.getTime() + offsetMs);

    // Human readable format
    const year = adjustedDate.getUTCFullYear();
    const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
    const hours = String(adjustedDate.getUTCHours()).padStart(2, '0');
    const minutes = String(adjustedDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(adjustedDate.getUTCSeconds()).padStart(2, '0');

    setHumanReadable(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);

    // ISO 8601
    setIso8601(date.toISOString());

    // RFC 2822
    setRfc2822(date.toUTCString());

    // Relative time
    const now = Date.now();
    const diff = now - milliseconds;
    const seconds_diff = Math.floor(Math.abs(diff) / 1000);
    const minutes_diff = Math.floor(seconds_diff / 60);
    const hours_diff = Math.floor(minutes_diff / 60);
    const days_diff = Math.floor(hours_diff / 24);

    let relative = '';
    if (days_diff > 0) {
      relative = `${days_diff} day${days_diff > 1 ? 's' : ''} ${diff > 0 ? 'ago' : 'from now'}`;
    } else if (hours_diff > 0) {
      relative = `${hours_diff} hour${hours_diff > 1 ? 's' : ''} ${diff > 0 ? 'ago' : 'from now'}`;
    } else if (minutes_diff > 0) {
      relative = `${minutes_diff} minute${minutes_diff > 1 ? 's' : ''} ${diff > 0 ? 'ago' : 'from now'}`;
    } else {
      relative = `${seconds_diff} second${seconds_diff > 1 ? 's' : ''} ${diff > 0 ? 'ago' : 'from now'}`;
    }
    setRelativeTime(relative);
  };

  const convertHumanToUnix = (human: string) => {
    if (!human) {
      setUnixTimestamp('');
      return;
    }

    const date = new Date(human);
    if (isNaN(date.getTime())) {
      setUnixTimestamp('Invalid date');
      return;
    }

    // Apply timezone offset (reverse)
    const tz = timezones.find((t) => t.id === timezone);
    const offsetMs = (tz?.offset || 0) * 60 * 60 * 1000;
    const adjustedDate = new Date(date.getTime() - offsetMs);

    const timestamp = useMilliseconds
      ? adjustedDate.getTime()
      : Math.floor(adjustedDate.getTime() / 1000);

    setUnixTimestamp(timestamp.toString());
  };

  const handleNow = () => {
    const now = Date.now();
    const timestamp = useMilliseconds ? now : Math.floor(now / 1000);
    setUnixTimestamp(timestamp.toString());
    convertUnixToHuman(timestamp.toString());
  };

  const handleExample = () => {
    // Example: 2024-01-01 00:00:00 UTC
    const example = useMilliseconds ? '1704067200000' : '1704067200';
    setUnixTimestamp(example);
    convertUnixToHuman(example);
  };

  useEffect(() => {
    if (unixTimestamp) {
      convertUnixToHuman(unixTimestamp);
    }
  }, [timezone, useMilliseconds]);

  return (
    <UtilityBase
      title="Timestamp Converter"
      icon="🕐"
      description="Convert Unix timestamps ↔ Human readable dates"
    >
      <div className={styles.container}>
        {/* Options */}
        <div className={styles.options}>
          <div className={styles.option}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={useMilliseconds}
                onChange={(e) => setUseMilliseconds(e.target.checked)}
              />
              <span>Use milliseconds</span>
            </label>
          </div>

          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value as TimezoneId)}
            className={styles.timezoneSelect}
          >
            {timezones.map((tz) => (
              <option key={tz.id} value={tz.id}>
                {tz.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Actions */}
        <div className={styles.actions}>
          <button onClick={handleNow} className={styles.nowBtn}>
            ⏰ Now
          </button>
          <button onClick={handleExample} className={styles.exampleBtn}>
            Load Example
          </button>
        </div>

        {/* Unix Timestamp Input */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Unix Timestamp</span>
            {unixTimestamp && <CopyButton text={unixTimestamp} label="Copy" />}
          </div>
          <input
            type="text"
            value={unixTimestamp}
            onChange={(e) => {
              setUnixTimestamp(e.target.value);
              convertUnixToHuman(e.target.value);
            }}
            placeholder={useMilliseconds ? "e.g. 1704067200000" : "e.g. 1704067200"}
            className={styles.input}
          />
        </div>

        {/* Human Readable Input */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Human Readable</span>
            {humanReadable && <CopyButton text={humanReadable} label="Copy" />}
          </div>
          <input
            type="datetime-local"
            value={humanReadable.replace(' ', 'T')}
            onChange={(e) => {
              const value = e.target.value.replace('T', ' ');
              setHumanReadable(value);
              convertHumanToUnix(e.target.value);
            }}
            className={styles.input}
          />
        </div>

        {/* Formatted Outputs */}
        {iso8601 && (
          <div className={styles.outputs}>
            <div className={styles.outputItem}>
              <div className={styles.outputLabel}>
                <span>ISO 8601</span>
                <CopyButton text={iso8601} label="Copy" />
              </div>
              <div className={styles.outputValue}>{iso8601}</div>
            </div>

            <div className={styles.outputItem}>
              <div className={styles.outputLabel}>
                <span>RFC 2822</span>
                <CopyButton text={rfc2822} label="Copy" />
              </div>
              <div className={styles.outputValue}>{rfc2822}</div>
            </div>

            <div className={styles.outputItem}>
              <div className={styles.outputLabel}>
                <span>Relative Time</span>
              </div>
              <div className={styles.outputValue}>{relativeTime}</div>
            </div>
          </div>
        )}
      </div>
    </UtilityBase>
  );
}
