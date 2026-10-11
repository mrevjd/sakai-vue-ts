export type KeyOf<T> = (item: T) => string;

function selectedIndexes<T>(items: T[], selected: string[], keyOf: KeyOf<T>): number[] {
    const keys = new Set(selected);
    return items.map((item, index) => (keys.has(keyOf(item)) ? index : -1)).filter((index) => index >= 0);
}

export function moveUp<T>(items: T[], selected: string[], keyOf: KeyOf<T>): T[] {
    const next = [...items];
    let moved = false;
    // Selected items already stacked at the top cannot move, and they block the ones directly under them; anything past the block shifts up one slot.
    let blocked = 0;
    for (const index of selectedIndexes(items, selected, keyOf)) {
        if (index > blocked) {
            [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
            moved = true;
        } else {
            blocked = index + 1;
        }
    }
    return moved ? next : items;
}

export function moveDown<T>(items: T[], selected: string[], keyOf: KeyOf<T>): T[] {
    const next = [...items];
    let moved = false;
    let blocked = items.length - 1;
    for (const index of selectedIndexes(items, selected, keyOf).reverse()) {
        if (index < blocked) {
            [next[index + 1], next[index]] = [next[index]!, next[index + 1]!];
            moved = true;
        } else {
            blocked = index - 1;
        }
    }
    return moved ? next : items;
}

// The input array comes back whenever nothing would move, as in moveUp and moveDown, so the lists emit no
// update for an unchanged model.
export function moveTop<T>(items: T[], selected: string[], keyOf: KeyOf<T>): T[] {
    const indexes = selectedIndexes(items, selected, keyOf);
    // Indexes are ascending, so a selection already stacked at the top is exactly 0, 1, 2 ...
    if (indexes.every((index, position) => index === position)) return items;
    const picked = indexes.map((index) => items[index]!);
    const rest = items.filter((_, index) => !indexes.includes(index));
    return [...picked, ...rest];
}

export function moveBottom<T>(items: T[], selected: string[], keyOf: KeyOf<T>): T[] {
    const indexes = selectedIndexes(items, selected, keyOf);
    const offset = items.length - indexes.length;
    if (indexes.every((index, position) => index === offset + position)) return items;
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
    if (from.length === 0) return { from, to };
    return { from: [], to: [...to, ...from] };
}
