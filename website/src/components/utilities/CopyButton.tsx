// eCy OS v1005.0 - Copy Button Component
// Reusable copy-to-clipboard button for all utilities

import { useState } from 'react';
import styles from './CopyButton.module.css';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  return (
    <button 
      onClick={handleCopy} 
      className={`${styles.button} ${copied ? styles.copied : ''}`}
      disabled={!text}
    >
      <span className={styles.icon}>{copied ? '✅' : '📋'}</span>
      <span className={styles.label}>{copied ? 'Copied!' : label}</span>
    </button>
  );
}
