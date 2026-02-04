import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileText, ChevronRight, ChevronDown, Braces, Box } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useStore, type ArtifactNode } from '../store';

// Move mock data out or keep as initial load logic
const MOCK_ARTIFACTS: ArtifactNode = {
    id: 'root',
    name: '~/.gemini/antigravity/brain',
    type: 'folder',
    path: '/root',
    children: [
        {
            id: 'task',
            name: 'task.md',
            type: 'file',
            path: '/root/task.md',
            icon: <FileText size={14} className="text-amber-400" />,
            content: `# Task Ledger
- [x] Phase 1: Initialization
- [x] Phase 2: Core Architecture
- [x] Phase 3: AI Debates
- [x] Phase 4: Zustand Refactor (Current)
`
        },
        {
            id: 'reports',
            name: 'reports',
            type: 'folder',
            path: '/root/reports',
            children: [
                { id: 'r1', name: 'research_report_phase12.md', type: 'file', path: '/root/reports/research_report_phase12.md', icon: <FileText size={14} className="text-blue-400" />, content: '# Research Report Phase 12\n\nOpenRouter Capabilities...' },
                { id: 'r2', name: 'strategic_report_utilities.md', type: 'file', path: '/root/reports/strategic_report_utilities.md', icon: <FileText size={14} className="text-blue-400" />, content: '# Strategic Report\n\n15 Utilities Plan...' }
            ]
        },
        {
            id: 'walkthrough',
            name: 'walkthrough.md',
            type: 'file',
            path: '/root/walkthrough.md',
            icon: <FileText size={14} className="text-purple-400" />,
            content: '# Walkthrough\n\nSystem verification steps...'
        }
    ]
};

export const ArtifactBrowser: React.FC = () => {
    const root = useStore(state => state.root);
    const activeFile = useStore(state => state.activeFile);
    const setRoot = useStore(state => state.setRoot);
    const setActiveFile = useStore(state => state.setActiveFile);

    // Hydrate store on mount (Mock for now, API later)
    useEffect(() => {
        if (root.length === 0) {
            setRoot([MOCK_ARTIFACTS]); 
        }
    }, [root.length, setRoot]);

    return (
        <div className="flex w-full h-full max-w-7xl mx-auto p-4 gap-4">
            
            {/* Sidebar Tree */}
            <motion.div 
                layout
                className="w-1/3 min-w-[250px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-y-auto shadow-2xl flex flex-col"
            >
                <div className="flex items-center gap-2 mb-4 px-2 pb-2 border-b border-white/5">
                    <Box className="text-cyan-400" size={20} />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Artifact Vault</h2>
                </div>
                <div className="flex-1">
                    {root.length > 0 ? root.map(node => (
                        <TreeNode 
                            key={node.id} 
                            node={node} 
                            onSelect={setActiveFile} 
                            activeId={activeFile?.id} 
                            depth={0} 
                        />
                    )) : (
                         <div className="text-white/20 text-xs p-4">Initializing Vault...</div>
                    )}
                </div>
            </motion.div>

            {/* Preview Pane */}
            <motion.div 
                layout
                className="flex-1 bg-black/20 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col"
            >
                {activeFile ? (
                    <>
                        <div className="bg-white/5 px-4 py-3 text-sm font-mono text-white/60 border-b border-white/5 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                {activeFile.icon || <FileText size={14} />}
                                {activeFile.name}
                            </span>
                            <span className="text-xs opacity-50 uppercase">Preview Mode</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                {activeFile.content || '*No content*'}
                            </ReactMarkdown>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
                        <Braces size={64} strokeWidth={1} />
                        <p className="font-mono text-sm">Select an artifact to decipher</p>
                    </div>
                )}
            </motion.div>

        </div>
    );
};

const TreeNode = ({ node, onSelect, activeId, depth }: { node: ArtifactNode, onSelect: (n: ArtifactNode | null) => void, activeId?: string, depth: number }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isFolder = node.type === 'folder';

    return (
        <div className="mt-1">
            <button
                onClick={() => {
                    if (isFolder) setIsOpen(!isOpen);
                    else onSelect(node);
                }}
                className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg transition-colors 
                    ${node.id === activeId ? 'bg-cyan-500/20 text-cyan-300' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                `}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                {isFolder && (
                    <span className="opacity-50">
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                )}
                {!isFolder && <span className="w-3.5" />} {/* Spacer for leaf nodes */}
                
                {node.icon || (isFolder ? <Folder size={14} className="text-white/40" /> : <FileText size={14} />)}
                <span className="truncate text-xs font-mono">{node.name}</span>
            </button>
            
            <AnimatePresence>
                {isFolder && isOpen && node.children && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {node.children.map(child => (
                            <TreeNode key={child.id} node={child} onSelect={onSelect} activeId={activeId} depth={depth + 1} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
