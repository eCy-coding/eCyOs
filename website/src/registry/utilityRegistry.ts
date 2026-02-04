// eCy OS v1005.0 - Utility App Registry
// Central registry for all 15 utility applications
// Auto-registration system

import React from 'react';
import { Calculator, Scale, Shield, Code2, Sparkles, PaletteIcon } from 'lucide-react';
import type { UtilityApp } from '../types/utility';

// Import utility app components
import { Calculator as CalculatorApp } from '../components/Calculator';
// TODO: Import other apps as they're built

/**
 * Central registry of all utility applications
 * Apps are auto-registered on import
 */
export const UTILITY_REGISTRY: UtilityApp[] = [
  // TIER 1: Mathematical & Development Tools
  {
    id: 'omni-calculator',
    name: 'Omni-Calculator',
    description: 'Scientific, Graphing, and Programmer calculator with MIT 2000 standards',
    category: 'math',
    icon: React.createElement(Calculator, { size: 24 }),
    component: CalculatorApp,
    shortcuts: ['ctrl+c', 'cmd+c'],
    dataExports: ['number'],
    priority: 1, // Highest priority
  },

  // Placeholder for Unit Converter (will be built next)
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: '100+ unit types across 10 categories with real-time conversion',
    category: 'math',
    icon: React.createElement(Scale, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'Unit Converter - Coming Soon'),
    shortcuts: ['ctrl+u', 'cmd+u'],
    dataExports: ['number', 'unit'],
    priority: 2,
  },

  {
    id: 'json-refiner',
    name: 'JSON Refiner',
    description: 'Format, validate, and visualize JSON with schema support',
    category: 'dev',
    icon: React.createElement(Code2, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'JSON Refiner - Coming Soon'),
    dataExports: ['json', 'string'],
    priority: 3,
  },

  {
    id: 'regex-lab',
    name: 'Regex Lab',
    description: 'Live regex testing with capture group visualization',
    category: 'dev',
    icon: React.createElement(Sparkles, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'Regex Lab - Coming Soon'),
    dataExports: ['regex', 'string'],
    priority: 4,
  },

  {
    id: 'color-alchemy',
    name: 'Color Alchemy',
    description: 'Color picker with Cyberpunk palette generation',
    category: 'productivity',
    icon: React.createElement(PaletteIcon, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'Color Alchemy - Coming Soon'),
    dataExports: ['color', 'string'],
    priority: 5,
  },

  // TIER 2: Security Tools
  {
    id: 'crypto-vault',
    name: 'Crypto Vault',
    description: 'AES-256-GCM encryption and hash generation',
    category: 'security',
    icon: React.createElement(Shield, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'Crypto Vault - Coming Soon'),
    dataExports: ['hash', 'string'],
    priority: 6,
  },

  // TIER 3: Productivity & Data Tools
  {
    id: 'net-sentinel',
    name: 'Net Sentinel',
    description: 'Network diagnostics: ping, traceroute, DNS lookup, port scanner',
    category: 'dev',
    icon: React.createElement(Shield, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'Net Sentinel - Coming Soon'),
    dataExports: ['string'],
    priority: 7,
  },

  {
    id: 'diff-lens',
    name: 'Diff Lens',
    description: 'Side-by-side text diff with syntax highlighting',
    category: 'dev',
    icon: React.createElement(Code2, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'Diff Lens - Coming Soon'),
    dataExports: ['string'],
    priority: 8,
  },

  {
    id: 'markdown-live',
    name: 'Markdown Live',
    description: 'Real-time Markdown preview with GitHub flavored support',
    category: 'productivity',
    icon: React.createElement(Sparkles, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'Markdown Live - Coming Soon'),
    dataExports: ['string'],
    priority: 9,
  },

  {
    id: 'base64-studio',
    name: 'Base64 Studio',
    description: 'Encode/decode Base64 with file support',
    category: 'data',
    icon: React.createElement(Code2, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'Base64 Studio - Coming Soon'),
    dataExports: ['string'],
    priority: 10,
  },

  {
    id: 'ascii-artist',
    name: 'ASCII Artist',
    description: 'Convert text to ASCII art with multiple fonts',
    category: 'productivity',
    icon: React.createElement(Sparkles, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'ASCII Artist - Coming Soon'),
    dataExports: ['string'],
    priority: 11,
  },

  {
    id: 'csv-alchemist',
    name: 'CSV Alchemist',
    description: 'CSV parser, validator, and transformer',
    category: 'data',
    icon: React.createElement(Code2, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'CSV Alchemist - Coming Soon'),
    dataExports: ['json', 'string'],
    priority: 12,
  },

  {
    id: 'time-machine',
    name: 'Time Machine',
    description: 'Timezone converter and timestamp utilities',
    category: 'productivity',
    icon: React.createElement(Sparkles, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'Time Machine - Coming Soon'),
    dataExports: ['timestamp', 'string'],
    priority: 13,
  },

  {
    id: 'qr-forge',
    name: 'QR Forge',
    description: 'QR code generator and scanner',
    category: 'data',
    icon: React.createElement(Code2, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'QR Forge - Coming Soon'),
    dataExports: ['string'],
    priority: 14,
  },

  // TIER 4: Advanced Math Tools
  {
    id: 'matrix-lab',
    name: 'Matrix Lab',
    description: 'Matrix operations: multiplication, inverse, determinant, eigenvalues',
    category: 'math',
    icon: React.createElement(Calculator, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'Matrix Lab - Coming Soon'),
    dataExports: ['number', 'json'],
    priority: 15,
  },

  // TIER 5: Statistics Engine (bonus 16th app for advanced analytics)
  {
    id: 'statistics-engine',
    name: 'Statistics Engine',
    description: 'Statistical analysis: mean, median, std dev, regression, probability',
    category: 'math',
    icon: React.createElement(Calculator, { size: 24 }),
    component: () => React.createElement('div', { className: 'text-white' }, 'Statistics Engine - Coming Soon'),
    dataExports: ['number', 'json'],
    priority: 16,
  },
];

/**
 * Get app by ID
 */
export const getUtilityApp = (id: string): UtilityApp | undefined => {
  return UTILITY_REGISTRY.find(app => app.id === id);
};

/**
 * Get apps by category
 */
export const getUtilityAppsByCategory = (category: string): UtilityApp[] => {
  return UTILITY_REGISTRY.filter(app => app.category === category);
};

/**
 * Auto-register helper
 * Call this in App.tsx to populate Zustand store
 */
export const autoRegisterUtilities = (registerFn: (app: UtilityApp) => void) => {
  UTILITY_REGISTRY.forEach(app => {
    registerFn(app);
  });
  
  console.log(`[UtilityRegistry] Registered ${UTILITY_REGISTRY.length} utility apps`);
};
