/**
 * KnowledgeGraph.ts
 * 
 * The Central Knowledge Repository for Antigravity Agents.
 * Stores distilled insights from:
 * 1. W3C Standards (2025)
 * 2. Library Ecosystem (50 Titans)
 * 3. Academic Papers (LLM Dynamics)
 */

export interface KnowledgeNode {
    id: string;
    domain: 'WEB' | 'MATH' | 'CODE' | 'AI';
    topic: string;
    insight: string;
    action: string;
    tags: string[];
}

export class KnowledgeGraph {
    private _nodes: KnowledgeNode[] = [];

    constructor() {
        this.initialize();
    }

    private initialize() {
        // --- 1. W3C Standards ---
        this.addNode({
            id: 'w3c-semantic',
            domain: 'WEB',
            topic: 'Semantic HTML',
            insight: 'Screen readers and AI agents require semantic structure.',
            action: 'Use <nav>, <section>, <article> instead of <div>.',
            tags: ['html', 'a11y', 'seo']
        });
        this.addNode({
            id: 'w3c-aria',
            domain: 'WEB',
            topic: 'Accessibility',
            insight: 'Dynamic updates must be announced to agents.',
            action: 'Use aria-live="polite" and role="log" for terminal outputs.',
            tags: ['a11y', 'aria', 'ux']
        });

        // --- 2. Library Ecosystem ---
        this.addNode({
            id: 'lib-math-rust',
            domain: 'MATH',
            topic: 'Heavy Computation',
            insight: 'Native JS math is slow for tensors.',
            action: 'Delegate matrix/vector ops to "nalgebra" (Rust/WASM).',
            tags: ['rust', 'wasm', 'performance']
        });
        this.addNode({
            id: 'lib-parse',
            domain: 'CODE',
            topic: 'AST Parsing',
            insight: 'Regex is insufficient for syntax understanding.',
            action: 'Use "Tree-sitter" or "swc" for code analysis.',
            tags: ['parsing', 'ast', 'tools']
        });

        // --- 3. Academic Papers ---
        this.addNode({
            id: 'ai-roles',
            domain: 'AI',
            topic: 'Multi-Agent Dynamics',
            insight: 'Static personas fail in edge cases.',
            action: 'Enable "Dynamic Role Switching" (Paper #26) when stuck.',
            tags: ['agents', 'planning', 'research']
        });
        this.addNode({
            id: 'ai-verify',
            domain: 'AI',
            topic: 'Self-Correction',
            insight: 'LLMs hallucinate without feedback loops.',
            action: 'Always run a "Critic" pass on generated code.',
            tags: ['reliability', 'verification']
        });
    }

    private addNode(node: KnowledgeNode) {
        this._nodes.push(node);
    }

    /**
     * Query the graph for relevant insights.
     */
    public query(searchTerm: string): KnowledgeNode[] {
        const term = searchTerm.toLowerCase();
        return this._nodes.filter(n => 
            n.topic.toLowerCase().includes(term) || 
            n.tags.some(t => t.includes(term)) ||
            n.domain.toLowerCase() === term
        );
    }

    public getBestPractice(domain: string): string {
        const nodes = this.query(domain);
        if (nodes.length === 0) return "No data found. Proceed with caution.";
        return nodes.map(n => `- ${n.topic}: ${n.action}`).join('\n');
    }
}
