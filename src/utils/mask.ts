// PrimeVue's InputMask grammar: 9 is a digit, a is a letter, * is either, ? opens the optional tail,
// everything else is a literal the component inserts for the user.
const PLACEHOLDERS: Record<string, RegExp> = { 9: /[0-9]/, a: /[A-Za-z]/, '*': /[A-Za-z0-9]/ };

function isPlaceholder(char: string): boolean {
    return char in PLACEHOLDERS;
}

export interface MaskResult {
    display: string;
    unmasked: string;
}

export function applyMask(raw: string, mask: string, slotChar = '_'): MaskResult {
    const pattern = mask.replace(/\?/g, '');
    // Index in `pattern` where the optional tail starts; past the end when the mask has no `?`.
    const optionalFrom = mask.includes('?') ? mask.indexOf('?') : pattern.length;
    // Slot characters in the incoming value are re-derived from the mask, never carried over, so that
    // feeding applyMask its own output is idempotent. Literals need no stripping: a literal cannot
    // satisfy the placeholder it sits next to, so the scan below skips past it on its own.
    const typed = [...raw].filter((char) => char !== slotChar);
    let source = 0;
    let display = '';
    const unmasked: string[] = [];
    let optionalFilled = false;
    for (let i = 0; i < pattern.length; i++) {
        const slot = pattern[i]!;
        if (!isPlaceholder(slot)) {
            display += slot;
            continue;
        }
        let accepted = '';
        while (source < typed.length) {
            const candidate = typed[source]!;
            source += 1;
            if (PLACEHOLDERS[slot]!.test(candidate)) {
                accepted = candidate;
                break;
            }
        }
        if (accepted === '') {
            display += slotChar;
        } else {
            display += accepted;
            unmasked.push(accepted);
            if (i >= optionalFrom) optionalFilled = true;
        }
    }
    // Every pattern position contributes exactly one character to `display`, so the two share indices.
    // An optional tail nobody has typed into is not shown at all, literals included.
    if (optionalFrom < pattern.length && !optionalFilled) display = display.slice(0, optionalFrom);
    return { display, unmasked: unmasked.join('') };
}

export function isMaskComplete(display: string, mask: string, slotChar = '_'): boolean {
    const required = mask.includes('?') ? mask.slice(0, mask.indexOf('?')) : mask;
    return !display.slice(0, required.length).includes(slotChar);
}
