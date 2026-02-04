// eCy OS v1005.0 - Utility App Type Definitions
// Strict TypeScript interfaces (no 'any' types)
// MIT/Google Engineering Standards

import type { ReactNode, ComponentType } from 'react';

/**
 * Base interface for all utility applications in eCy OS
 * Each app must implement this contract
 */
export interface UtilityApp {
  /** Unique identifier (kebab-case) */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Short description (max 100 chars) */
  description: string;
  
  /** Category for organization */
  category: UtilityCategory;
  
  /** Icon component (Lucide React) */
  icon: ReactNode;
  
  /** Main component to render */
  component: ComponentType;
  
  /** Keyboard shortcuts (e.g., ['ctrl+u', 'cmd+u']) */
  shortcuts?: string[];
  
  /** Data types this app can export for inter-app sharing */
  dataExports?: DataExportType[];
  
  /** Priority order (lower = higher priority, default: 100) */
  priority?: number;
}

/**
 * Utility app categories
 */
export type UtilityCategory = 
  | 'math'          // Mathematical tools (Calculator, Unit Converter)
  | 'dev'           // Developer tools (JSON, Regex, Diff)
  | 'security'      // Security tools (Crypto, Hash Generator)
  | 'productivity'  // Productivity tools (Markdown, Time)
  | 'data';         // Data tools (CSV, Base64, QR)

/**
 * Data types that can be shared between apps
 */
export type DataExportType =
  | 'number'
  | 'string'
  | 'json'
  | 'color'
  | 'regex'
  | 'unit'
  | 'timestamp'
  | 'hash';

/**
 * Data bridge for inter-app communication
 */
export interface DataBridgePayload {
  /** Source app ID */
  sourceApp: string;
  
  /** Data type */
  type: DataExportType;
  
  /** Actual data */
  data: unknown;
  
  /** Timestamp */
  timestamp: number;
}

/**
 * Zustand store interface for utility apps
 */
export interface UtilityStore {
  /** Registry of all available apps */
  apps: UtilityApp[];
  
  /** Currently active app ID */
  activeAppId: string | null;
  
  /** Data bridge for sharing between apps */
  dataBridge: DataBridgePayload | null;
  
  /** Actions */
  registerApp: (app: UtilityApp) => void;
  setActiveApp: (appId: string) => void;
  exportData: (payload: DataBridgePayload) => void;
  importData: (targetAppId: string) => DataBridgePayload | null;
}

/**
 * ToolShell component props
 * Wraps all utility apps with consistent UI
 */
export interface ToolShellProps {
  /** App title */
  title: string;
  
  /** Icon component */
  icon: ReactNode;
  
  /** Main content */
  children: ReactNode;
  
  /** Optional color class for icon/accent (e.g., 'text-cyan-400') */
  color?: string;
  
  /** Optional header actions */
  headerActions?: ReactNode;
  
  /** Optional footer */
  footer?: ReactNode;
  
  /** Class name for customization */
  className?: string;
}
