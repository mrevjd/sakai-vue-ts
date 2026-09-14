// PrimeVue's optionLabel and optionValue contract: a key into the option object, or the option itself.
export function optionLabel(option: unknown, key?: string): string {
    if (key && option !== null && typeof option === 'object') return String((option as Record<string, unknown>)[key] ?? '');
    return option === null || option === undefined ? '' : String(option);
}

export function optionValue(option: unknown, key?: string): unknown {
    if (key && option !== null && typeof option === 'object') return (option as Record<string, unknown>)[key];
    return option;
}

export function sameOption(a: unknown, b: unknown, key?: string): boolean {
    if (key) return optionValue(a, key) === optionValue(b, key);
    if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') return JSON.stringify(a) === JSON.stringify(b);
    return a === b;
}
