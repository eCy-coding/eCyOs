// eCy OS v1005.0 - JSON Refiner Component
// Tier 1 Priority #3 - JSON validation, formatting, syntax highlighting
// Cyberpunk aesthetic with ToolShell wrapper

import React, { useState, useEffect } from 'react';
import { FileJson, Check, X, Copy, Download, Upload, Minimize2, Maximize2 } from 'lucide-react';
import { ToolShell } from './ToolShell';
import { useUtilityStore } from '../stores/utilityStore';

type FormatMode = 'beautify' | 'minify';

interface ValidationResult {
  isValid: boolean;
  error?: string;
  lineNumber?: number;
}

export const JSONRefiner: React.FC = () => {
  const [input, setInput] = useState<string>('{\n  "name": "eCy OS",\n  "version": "1005.0"\n}');
  const [output, setOutput] = useState<string>('');
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [formatMode, setFormatMode] = useState<FormatMode>('beautify');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [history, setHistory] = useState<string[]>([]);

  const exportData = useUtilityStore(state => state.exportData);

  // Validate and format JSON
  const processJSON = () => {
    try {
      // Parse JSON
      const parsed = JSON.parse(input);
      
      // Format based on mode
      let formatted: string;
      if (formatMode === 'beautify') {
        formatted = JSON.stringify(parsed, null, indentSize);
      } else {
        formatted = JSON.stringify(parsed);
      }

      setOutput(formatted);
      setValidation({ isValid: true });

      // Add to history
      const historyEntry = `${formatMode.toUpperCase()}: ${input.substring(0, 50)}...`;
      setHistory([historyEntry, ...history.slice(0, 9)]);

      // Export to DataBridge
      exportData({
        sourceApp: 'json-refiner',
        type: 'json',
        data: parsed,
        timestamp: Date.now(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Extract line number from error message if available
      const lineMatch = errorMessage.match(/line (\d+)/i) || errorMessage.match(/position (\d+)/i);
      const lineNumber = lineMatch ? parseInt(lineMatch[1]) : undefined;

      setValidation({
        isValid: false,
        error: errorMessage,
        lineNumber,
      });
      setOutput('');
    }
  };

  // Auto-process on input change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        processJSON();
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, formatMode, indentSize]);

  // Copy to clipboard
  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  // Download as file
  const downloadJSON = () => {
    if (output) {
      const blob = new Blob([output], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `refined_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Upload file
  const uploadJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  };

  // Toggle format mode
  const toggleFormatMode = () => {
    setFormatMode(prev => prev === 'beautify' ? 'minify' : 'beautify');
  };

  return (
    <ToolShell title="JSON Refiner" icon={<FileJson size={24} />} color="text-cyan-400">
      <div className="h-full flex flex-col gap-4 p-6">
        {/* Toolbar */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Format Mode Toggle */}
          <button
            onClick={toggleFormatMode}
            className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all ${
              formatMode === 'beautify'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-purple-500/20 border-purple-500 text-purple-300'
            }`}
          >
            {formatMode === 'beautify' ? (
              <><Maximize2 size={16} className="inline mr-2" />BEAUTIFY</>
            ) : (
              <><Minimize2 size={16} className="inline mr-2" />MINIFY</>
            )}
          </button>

          {/* Indent Size (only for beautify) */}
          {formatMode === 'beautify' && (
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(parseInt(e.target.value))}
              className="bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={8}>Tab (8)</option>
            </select>
          )}

          {/* Actions */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={copyToClipboard}
              disabled={!output}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Copy to clipboard"
            >
              <Copy size={16} className="text-white" />
            </button>
            <button
              onClick={downloadJSON}
              disabled={!output}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Download JSON"
            >
              <Download size={16} className="text-white" />
            </button>
            <label className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
              <Upload size={16} className="text-white" />
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={uploadJSON}
              />
            </label>
          </div>
        </div>

        {/* Validation Status */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
          validation.isValid
            ? 'bg-green-500/10 border-green-500/30 text-green-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          {validation.isValid ? (
            <>
              <Check size={16} />
              <span className="text-sm font-mono">VALID JSON</span>
            </>
          ) : (
            <>
              <X size={16} />
              <span className="text-sm font-mono">
                ERROR: {validation.error}
                {validation.lineNumber && ` (Line ${validation.lineNumber})`}
              </span>
            </>
          )}
        </div>

        {/* Editor Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          {/* Input */}
          <div className="flex flex-col">
            <label className="block text-sm font-bold text-cyan-400 mb-2">INPUT</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-black/60 border border-white/20 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none resize-none"
              placeholder='{"key": "value"}'
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="flex flex-col">
            <label className="block text-sm font-bold text-cyan-400 mb-2">OUTPUT</label>
            <div className="flex-1 bg-cyan-500/5 border border-cyan-400/30 rounded-lg px-4 py-3 text-cyan-300 font-mono text-sm overflow-auto whitespace-pre">
              {output || '...'}
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="max-h-32 overflow-auto">
            <label className="block text-sm font-bold text-cyan-400 mb-2">HISTORY</label>
            <div className="space-y-1">
              {history.map((entry, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded px-3 py-1 text-white/70 text-xs font-mono truncate"
                >
                  {entry}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};
