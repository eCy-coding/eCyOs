/**
 * SetTheory.ts
 * 
 * Mathematical Set Operations Module for Antigravity.
 * Implements standard Set Theory concepts compliant with:
 * - Zermelo-Fraenkel Set Theory (Conceptually)
 * - ECMAScript 2025 Standards
 * - "Universal Perfection" Error Handling
 */

export class SetTheory<T> {
    private _elements: Set<T>;

    constructor(initialElements?: T[]) {
        this._elements = new Set(initialElements);
    }

    /**
     * Returns the cardinality (size) of the set.
     */
    get cardinality(): number {
        return this._elements.size;
    }

    /**
     * Adds an element to the set.
     * @returns true if the element was added (did not strictly exist).
     */
    add(element: T): boolean {
        if (this._elements.has(element)) return false;
        this._elements.add(element);
        return true;
    }

    /**
     * Checks if element belongs to the set.
     */
    has(element: T): boolean {
        return this._elements.has(element);
    }

    /**
     * UNION (A ∪ B): Elements in A OR B.
     */
    union(other: SetTheory<T>): SetTheory<T> {
        const result = new SetTheory<T>(Array.from(this._elements));
        other._elements.forEach(e => result.add(e));
        return result;
    }

    /**
     * INTERSECTION (A ∩ B): Elements in A AND B.
     */
    intersection(other: SetTheory<T>): SetTheory<T> {
        const result = new SetTheory<T>();
        this._elements.forEach(e => {
            if (other.has(e)) result.add(e);
        });
        return result;
    }

    /**
     * DIFFERENCE (A \ B): Elements in A BUT NOT in B.
     */
    difference(other: SetTheory<T>): SetTheory<T> {
        const result = new SetTheory<T>();
        this._elements.forEach(e => {
            if (!other.has(e)) result.add(e);
        });
        return result;
    }

    /**
     * SYMMETRIC DIFFERENCE (A Δ B): Elements in A OR B BUT NOT BOTH.
     */
    symmetricDifference(other: SetTheory<T>): SetTheory<T> {
        const union = this.union(other);
        const intersection = this.intersection(other);
        return union.difference(intersection);
    }

    /**
     * SUBSET (A ⊆ B): Is every element of A in B?
     */
    isSubsetOf(other: SetTheory<T>): boolean {
        for (const elem of this._elements) {
            if (!other.has(elem)) return false;
        }
        return true;
    }

    toArray(): T[] {
        return Array.from(this._elements);
    }
}
