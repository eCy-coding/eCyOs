
import React, { useEffect, useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import '../styles/glass.css';

interface AgenticEditorProps {
  initialCode?: string;
  language?: string;
  readOnly?: boolean;
}

const AgenticEditor: React.FC<AgenticEditorProps> = ({ 
  initialCode = "// eCy OS Agentic Interface Initialized...", 
  language = "python",
  readOnly = false 
}) => {
  const monaco = useMonaco();
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    if (monaco) {
      // Define 'Antigravity' Theme
      monaco.editor.defineTheme('antigravity', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
          { token: 'string', foreground: 'f1fa8c' },
          { token: 'function', foreground: '8be9fd' },
          { token: 'variable', foreground: 'f8f8f2' },
          { token: 'number', foreground: 'bd93f9' },
        ],
        colors: {
          'editor.background': '#00000000', // Transparent for glass effect
          'editor.foreground': '#f8f8f2',
          'editorCursor.foreground': '#8be9fd',
          'editor.lineHighlightBackground': '#10101080',
          'editorLineNumber.foreground': '#6272a4',
          'editor.selectionBackground': '#44475a',
        },
      });
      monaco.editor.setTheme('antigravity');
    }
  }, [monaco]);

  useEffect(() => {
    if (initialCode !== code) {
        setCode(initialCode);
    }
  }, [initialCode]);

  return (
    <div className="w-full h-full relative group backdrop-blur-md rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
      {/* Header / Status Bar */}
      <div className="absolute top-0 left-0 w-full h-8 bg-black/40 flex items-center justify-between px-4 z-10 border-b border-white/5">
        <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <span className="ml-2 text-xs font-mono text-cyan-400 opacity-70 flex items-center gap-2">
                {readOnly && <Loader2 className="w-3 h-3 animate-spin" />}
                {readOnly ? 'AI_STREAM_ACTIVE' : 'MANUAL_OVERRIDE'}
            </span>
        </div>
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50 uppercase">
            {language}
        </span>
      </div>

      {/* Monaco Instance */}
      <div className="pt-8 h-full">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="antigravity"
          options={{
            readOnly: readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            padding: { top: 16 },
            lineNumbers: 'on',
            folding: true,
            renderLineHighlight: "all",
          }}
          onChange={(val) => !readOnly && setCode(val || "")}
        />
      </div>

      {/* Decorative Glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-[50px] pointer-events-none" />
    </div>
  );
};

export default AgenticEditor;
