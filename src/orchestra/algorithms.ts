
/**
 * Algorithms Implementation for Ankara Protocol
 * Core mathematical functions for efficiency and logic.
 */

/**
 * Calculates the Levenshtein distance between two strings.
 * This metric measures the minimum number of single-character edits (insertions, deletions, or substitutions)
 * required to change one word into the other.
 * 
 * Time Complexity: O(n*m)
 * Space Complexity: O(n*m) - can be optimized to O(min(n,m)) but this is sufficient for command lengths.
 * 
 * @param a First string (e.g. source)
 * @param b Second string (e.g. target)
 * @returns The distance (0 = identical)
 */
export function levenshteinDistance(a: string, b: string): number {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    
    if (an === 0) return bn;
    if (bn === 0) return an;
    
    const matrix = new Array<number[]>(bn + 1);
    
    // Initialize matrix
    for (let i = 0; i <= bn; ++i) {
        let row = matrix[i] = new Array<number>(an + 1);
        row[0] = i;
    }
    const firstRow = matrix[0];
    for (let j = 1; j <= an; ++j) {
        firstRow[j] = j;
    }
    
    // Fill
    for (let i = 1; i <= bn; ++i) {
        for (let j = 1; j <= an; ++j) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                // Substitution, insertion, deletion
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1], // substitution
                    matrix[i][j - 1],     // deletion
                    matrix[i - 1][j]      // insertion
                ) + 1;
            }
        }
    }
    
    return matrix[bn][an];
}

/**
 * Fuzzy search a list of items based on a key.
 * @param query The search query
 * @param items List of items
 * @param keyExtractor Function to get the string to match from an item
 * @param threshold Max distance to allow (default 3)
 * @returns Sorted list of matches { item, distance }
 */
export function fuzzySearch<T>(
    query: string, 
    items: T[], 
    keyExtractor: (item: T) => string, 
    threshold: number = 5
): { item: T, distance: number }[] {
    if (!query) return [];
    const q = String(query).toLowerCase();
    
    return items
        .map(item => {
            const rawKey = keyExtractor(item);
            if (!rawKey) return { item, distance: Infinity };
            
            const key = String(rawKey).toLowerCase();
            // Optimization: If contains, matching is very likely intended (distance 0 contextually for finding)
            if (key.includes(q)) return { item, distance: 0 };
            
            const distance = levenshteinDistance(q, key);
            return { item, distance };
        })
        .filter(result => result.distance <= threshold)
        .sort((a, b) => a.distance - b.distance);
}
