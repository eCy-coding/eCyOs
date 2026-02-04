
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, UploadCloud, Database, CheckCircle, Clock, Search, Trash2, ShieldCheck } from 'lucide-react';

interface Doc {
    id: string;
    name: string;
    size: string;
    type: 'pdf' | 'txt' | 'md';
    status: 'indexed' | 'processing' | 'queued';
    ragReady: boolean;
    date: string;
}

export const DocuVault: React.FC = () => {
    const [docs, setDocs] = useState<Doc[]>([
        { id: '1', name: 'Strategic_Report_v2.md', size: '24 KB', type: 'md', status: 'indexed', ragReady: true, date: '2025-10-24' },
        { id: '2', name: 'AI_Ethics_Guidelines.pdf', size: '2.4 MB', type: 'pdf', status: 'indexed', ragReady: true, date: '2025-10-22' },
        { id: '3', name: 'Project_Nebula_Specs.pdf', size: '8.1 MB', type: 'pdf', status: 'processing', ragReady: false, date: '2025-10-25' },
    ]);
    const [isDragging, setIsDragging] = useState(false);

    const handleDelete = (id: string) => {
        setDocs(docs.filter(d => d.id !== id));
    };

    const handleUpload = () => {
        // Simulate upload
        const newDoc: Doc = {
            id: Math.random().toString(),
            name: `Upload_${Math.floor(Math.random() * 1000)}.txt`,
            size: '12 KB',
            type: 'txt',
            status: 'queued',
            ragReady: false,
            date: new Date().toISOString().split('T')[0]
        };
        setDocs([newDoc, ...docs]);
        
        // Simulate processing
        setTimeout(() => {
            setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'processing' } : d));
        }, 1000);
        setTimeout(() => {
            setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'indexed', ragReady: true } : d));
        }, 4000);
    };

    return (
        <div className="flex flex-col w-full h-full max-w-6xl mx-auto p-4 gap-6">
            
            {/* Header */}
            <motion.div 
                layout
                className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-2xl"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                        <Database className="text-amber-300" size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-wide">DocuVault</h2>
                        <div className="text-xs text-amber-200/60 font-mono flex items-center gap-2">
                            <ShieldCheck size={12} /> SECURE KNOWLEDGE BASE
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <div className="text-2xl font-mono font-bold text-white">{docs.filter(d => d.ragReady).length} / {docs.length}</div>
                        <div className="text-[10px] uppercase text-white/40 tracking-widest">RAG Optimized</div>
                    </div>
                    <div className="h-10 w-px bg-white/10 hidden md:block" />
                    <button 
                        onClick={handleUpload}
                        className="flex items-center gap-2 px-6 py-3 bg-cyan-500/20 text-cyan-300 rounded-xl font-bold hover:bg-cyan-500/30 transition-all border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    >
                        <UploadCloud size={18} /> Upload
                    </button>
                </div>
            </motion.div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[250px,1fr] gap-6">
                
                {/* Sidebar Filter */}
                <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-white/30" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search docs..." 
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                        />
                    </div>
                    
                    <FilterBtn label="All Documents" count={docs.length} active />
                    <FilterBtn label="PDFs" count={docs.filter(d => d.type === 'pdf').length} />
                    <FilterBtn label="Text / Markdown" count={docs.filter(d => d.type !== 'pdf').length} />
                    <FilterBtn label="Processing" count={docs.filter(d => d.status !== 'indexed').length} />
                </div>

                {/* Grid */}
                <div 
                    className={`bg-black/20 backdrop-blur-md border border-white/5 rounded-2xl p-6 overflow-y-auto ${isDragging ? 'ring-2 ring-cyan-500/50 bg-cyan-500/5' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(); }}
                >
                    <AnimatePresence>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {docs.map((doc) => (
                                <motion.div
                                    key={doc.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative bg-[#151515] border border-white/5 hover:border-white/20 rounded-xl p-4 transition-all hover:bg-[#1a1a1a]"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${doc.type === 'pdf' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            <FileText size={24} />
                                        </div>
                                        {doc.status === 'indexed' ? (
                                            <div className="text-green-400" title="Indexed"><CheckCircle size={16} /></div>
                                        ) : (
                                            <div className="text-yellow-400 animate-spin" title="Processing"><Clock size={16} /></div>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-white font-medium text-sm mb-1 truncate" title={doc.name}>{doc.name}</h3>
                                    <div className="flex items-center justify-between text-xs text-white/40">
                                        <span>{doc.size}</span>
                                        <span>{doc.date}</span>
                                    </div>

                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                                            <FileText size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(doc.id)}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-300 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Upload Placeholder */}
                            <button 
                                onClick={handleUpload}
                                className="border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-white/20 hover:text-white/50 hover:border-white/30 transition-all min-h-[140px]"
                            >
                                <UploadCloud size={32} />
                                <span className="text-xs font-bold uppercase">Drop files to Index</span>
                            </button>
                        </div>
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

const FilterBtn = ({ label, count, active }: { label: string, count: number, active?: boolean }) => (
    <button className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${active ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
        <span>{label}</span>
        <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{count}</span>
    </button>
);
