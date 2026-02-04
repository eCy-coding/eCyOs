import { expect, test } from '@playwright/test';
import { SetTheory } from '../src/orchestra/math/SetTheory';

test.describe('Mathematical Set Theory', () => {
    test('should calculate UNION correctly', () => {
        const A = new SetTheory([1, 2, 3]);
        const B = new SetTheory([3, 4, 5]);
        const union = A.union(B);
        expect(union.toArray().sort()).toEqual([1, 2, 3, 4, 5]);
        expect(union.cardinality).toBe(5);
    });

    test('should calculate INTERSECTION correctly', () => {
        const A = new SetTheory(['a', 'b', 'c']);
        const B = new SetTheory(['b', 'c', 'd']);
        const intersection = A.intersection(B);
        expect(intersection.toArray().sort()).toEqual(['b', 'c']);
    });

    test('should calculate DIFFERENCE correctly', () => {
        const A = new SetTheory([1, 2, 3]);
        const B = new SetTheory([2, 3, 4]);
        const diff = A.difference(B); // 1
        expect(diff.toArray()).toEqual([1]);
    });

    test('should verify SUBSET correctly', () => {
        const A = new SetTheory([1, 2]);
        const B = new SetTheory([1, 2, 3]);
        expect(A.isSubsetOf(B)).toBe(true);
        expect(B.isSubsetOf(A)).toBe(false);
    });
});
