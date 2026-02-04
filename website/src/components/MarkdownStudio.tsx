
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // or atom-one-dark
import { motion } from 'framer-motion';
import { FileText, Save, Code, Bold, Italic, Link as LinkIcon, List, Image } from 'lucide-react';

export const MarkdownStudio: React.FC = () => {
    const [markdown, setMarkdown] = useState<string>(`# Welcome to Markdown Studio
    
This is a **live preview** editor powered by the Brain cortex.

## Features
- [x] Monaco Editor Integration
- [x] Real-time GFM Preview
- [x] Syntax Highlighting

\`\`\`javascript
console.log("Hello, eCy OS");
\`\`\`

> "Knowledge is power." - Francis Bacon
`);
    const [activeView, setActiveView] = useState<'both' | 'edit' | 'preview'>('both');

    const handleEditorChange = (value: string | undefined) => {
        setMarkdown(value || '');
    };

    const insertText = (text: string) => {
        // Simple append for now, proper insertion requires ref to editor instance
        setMarkdown(prev => prev + '\n' + text);
    };

    return (
        <div className="flex flex-col w-full h-full p-4 max-w-7xl mx-auto gap-4">
            
            {/* Toolbar */}
            <motion.div 
                layout
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center justify-between shadow-lg"
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 border-r border-white/10">
                        <FileText className="text-pink-400" size={20} />
                        <span className="font-bold text-white tracking-wide">MD Studio</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <ToolbarBtn icon={<Bold size={16}/>} onClick={() => insertText('**Bold**')} tooltip="Bold" />
                        <ToolbarBtn icon={<Italic size={16}/>} onClick={() => insertText('*Italic*')} tooltip="Italic" />
                        <ToolbarBtn icon={<LinkIcon size={16}/>} onClick={() => insertText('[Link](url)')} tooltip="Link" />
                        <ToolbarBtn icon={<Code size={16}/>} onClick={() => insertText('`Code`')} tooltip="Code" />
                        <ToolbarBtn icon={<List size={16}/>} onClick={() => insertText('- List Item')} tooltip="List" />
                        <ToolbarBtn icon={<Image size={16}/>} onClick={() => insertText('![Alt](url)')} tooltip="Image" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                        <ViewBtn active={activeView === 'edit'} onClick={() => setActiveView('edit')} label="Editor" />
                        <ViewBtn active={activeView === 'both'} onClick={() => setActiveView('both')} label="Split" />
                        <ViewBtn active={activeView === 'preview'} onClick={() => setActiveView('preview')} label="Preview" />
                    </div>
                    <button className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors border border-cyan-500/30">
                        <Save size={18} />
                    </button>
                </div>
            </motion.div>

            {/* Main Workspace */}
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Editor Pane */}
                {(activeView === 'edit' || activeView === 'both') && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`bg-[#1e1e1e]/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col ${activeView === 'edit' ? 'col-span-2' : ''}`}
                    >
                        <div className="bg-black/20 px-4 py-2 text-xs font-mono text-white/40 uppercase tracking-widest border-b border-white/5 flex justify-between">
                            <span>Input Source</span>
                            <span>Markdown</span>
                        </div>
                        <div className="flex-1 pt-2">
                            <Editor
                                height="100%"
                                defaultLanguage="markdown"
                                theme="vs-dark"
                                value={markdown}
                                onChange={handleEditorChange}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'off',
                                    wordWrap: 'on',
                                    padding: { top: 16, bottom: 16 },
                                    scrollBeyondLastLine: false,
                                    fontFamily: 'JetBrains Mono, monospace',
                                    // minimap option removed to avoid atomic collision
                                }}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Preview Pane */}
                {(activeView === 'preview' || activeView === 'both') && (
                     <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col relative ${activeView === 'preview' ? 'col-span-2' : ''}`}
                    >
                        <div className="bg-white/5 px-4 py-2 text-xs font-mono text-white/40 uppercase tracking-widest border-b border-white/5">
                            Rendered View
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto prose prose-invert prose-headings:font-bold prose-headings:tracking-tighter prose-p:text-white/80 prose-a:text-cyan-400 prose-code:text-pink-300 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 max-w-none">
                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                {markdown}
                            </ReactMarkdown>
                        </div>
                        
                        {/* Background Decoration */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 z-0" />
                    </motion.div>
                )}

            </div>
        </div>
    );
};

const ToolbarBtn = ({ icon, onClick, tooltip }: { icon: React.ReactNode, onClick: () => void, tooltip: string }) => (
    <button 
        onClick={onClick}
        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all active:scale-95"
        title={tooltip}
    >
        {icon}
    </button>
);

const ViewBtn = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
    <button 
        onClick={onClick}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${active ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
    >
        {label}
    </button>
);
