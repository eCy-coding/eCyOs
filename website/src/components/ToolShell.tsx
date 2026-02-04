// eCy OS v1005.0 - ToolShell Component
// Universal wrapper for all utility applications
// Cyberpunk aesthetic with Glow/Glassmorphism effects

import React from 'react';
import type { ToolShellProps } from '../types/utility';

/**
 * ToolShell Component
 * Wraps utility apps with consistent eCy OS Cyberpunk UI
 */
export const ToolShell: React.FC<ToolShellProps> = ({
  title,
  icon,
  children,
  color = 'text-cyan-400', // Default cyan color
  headerActions,
  footer,
  className = '',
}) => {
  return (
    <div 
      className={`
        w-full h-full flex flex-col
        bg-black/40 backdrop-blur-2xl
        border border-white/10 rounded-2xl
        overflow-hidden shadow-2xl
        relative
        ${className}
      `}
      style={{
        opacity: 1,
        transform: 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Top glow effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-3">
          <span className={color}>
            {icon}
          </span>
          <h2 className="text-lg font-bold tracking-wider text-white uppercase">
            {title}
          </h2>
        </div>
        
        {headerActions && (
          <div className="flex items-center gap-2">
            {headerActions}
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-6 relative">
        {/* Grid pattern background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
        
        {/* Content wrapper */}
        <div className="relative z-10 h-full">
          {children}
        </div>
      </div>

      {/* Footer (optional) */}
      {footer && (
        <div className="px-6 py-4 border-t border-white/10 bg-white/5">
          {footer}
        </div>
      )}
    </div>
  );
};
