export type KeyOf<T> = (item: T) => string;

function selectedIndexes<T>(items: T[], selected: string[], keyOf: KeyOf<T>): number[] {
    const keys = new Set(selected);
    return items.map((item, index) => (keys.has(keyOf(item)) ? index : -1)).filter((index) => index >= 0);
}

export function moveUp<T>(items: T[], selected: string[], keyOf: KeyOf<T>): T[] {
    const indexes = selectedIndexes(items, selected, keyOf);
    if (indexes.length === 0 || indexes[0] === 0) return items;
    const next = [...items];
    // Walk top down so a contiguous block shifts as one.
    for (const index of indexes) [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
    return next;
}

export function moveDown<T>(items: T[], selected: string[], keyOf: KeyOf<T>): T[] {
    const indexes = selectedIndexes(items, selected, keyOf);
    if (indexes.length === 0 || indexes[indexes.length - 1] === items.length - 1) return items;
    const next = [...items];
    for (const index of [...indexes].reverse()) [next[index + 1], next[index]] = [next[index]!, next[index + 1]!];
    return next;
}

export function moveTop<T>(items: T[], selected: string[], keyOf: KeyOf<T>): T[] {
    const indexes = selectedIndexes(items, selected, keyOf);
    if (indexes.length === 0) return items;
    const picked = indexes.map((index) => items[index]!);
    const rest = items.filter((_, index) => !indexes.includes(index));
    return [...picked, ...rest];
}

export function moveBottom<T>(items: T[], selected: string[], keyOf: KeyOf<T>): T[] {
    const indexes = selectedIndexes(items, selected, keyOf);
    if (indexes.length === 0) return items;
    const picked = indexes.map((index) => items[index]!);
    const rest = items.filter((_, index) => !indexes.includes(index));
    return [...rest, ...picked];
}

export function transfer<T>(from: T[], to: T[], selected: string[], keyOf: KeyOf<T>): { from: T[]; to: T[] } {
    const keys = new Set(selected);
    const moved = from.filter((item) => keys.has(keyOf(item)));
    if (moved.length === 0) return { from, to };
    return { from: from.filter((item) => !keys.has(keyOf(item))), to: [...to, ...moved] };
}

export function transferAll<T>(from: T[], to: T[]): { from: T[]; to: T[] } {
    return { from: [], to: [...to, ...from] };
}
