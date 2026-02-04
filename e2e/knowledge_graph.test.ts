import { expect, test } from '@playwright/test';
import { KnowledgeGraph } from '../src/orchestra/knowledge/KnowledgeGraph';

test.describe('Knowledge Graph Integrity', () => {
    const kg = new KnowledgeGraph();

    test('should retrieve W3C Standards', () => {
        const results = kg.query('WEB');
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].action).toContain('<nav>');
    });

    test('should retrieve Math Library Recommendations', () => {
        const results = kg.query('MATH');
        const nalgebra = results.find(n => n.action.includes('nalgebra'));
        expect(nalgebra).toBeDefined();
        expect(nalgebra?.domain).toBe('MATH');
    });

    test('should retrieve Academic Insights', () => {
        const practice = kg.getBestPractice('AI');
        expect(practice).toContain('Dynamic Role Switching');
        expect(practice).toContain('Critic');
    });

    test('should handle unknown queries gracefully', () => {
        const empty = kg.query('UNKNOWN_DOMAIN');
        expect(empty.length).toBe(0);
        
        const advice = kg.getBestPractice('UNKNOWN_DOMAIN');
        expect(advice).toContain('No data found');
    });
});
