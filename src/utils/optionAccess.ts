// PrimeVue's optionLabel and optionValue contract: a key into the option object, or the option itself.
export function optionLabel(option: unknown, key?: string): string {
    if (key && option !== null && typeof option === 'object') return String((option as Record<string, unknown>)[key] ?? '');
    return option === null || option === undefined ? '' : String(option);
}

export function optionValue(option: unknown, key?: string): unknown {
    if (key && option !== null && typeof option === 'object') return (option as Record<string, unknown>)[key];
    return option;
}

// Structural equality for demo-service records (PrimeVue compared options and `in` filters deeply): field order
// does not matter, array order does, and Dates compare by time because they have no enumerable fields to walk.
export function deepEquals(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
    if (a instanceof Date || b instanceof Date) return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, index) => deepEquals(item, b[index]));
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every((key) => Object.prototype.hasOwnProperty.call(right, key) && deepEquals(left[key], right[key]));
}

export function sameOption(a: unknown, b: unknown, key?: string): boolean {
    if (key) return optionValue(a, key) === optionValue(b, key);
    return deepEquals(a, b);
}
