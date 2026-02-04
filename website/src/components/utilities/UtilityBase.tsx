// eCy OS v1005.0 - Utility Base Component
// Shared wrapper for all 14 utility apps

import type { ReactNode } from 'react';
import styles from './UtilityBase.module.css';

interface UtilityBaseProps {
  title: string;
  icon: string;
  description: string;
  children: ReactNode;
}

export function UtilityBase({ title, icon, description, children }: UtilityBaseProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.icon}>{icon}</span>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <p className={styles.description}>{description}</p>
      </header>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
