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

function fill(typed: string[], mask: string, slotChar: string): MaskResult {
    const pattern = mask.replace(/\?/g, '');
    // Index in `pattern` where the optional tail starts; past the end when the mask has no `?`.
    const optionalFrom = mask.includes('?') ? mask.indexOf('?') : pattern.length;
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

// Masks a field's current text: a previous display with keystrokes added, or plain typed characters.
export function applyMask(raw: string, mask: string, slotChar = '_'): MaskResult {
    const pattern = mask.replace(/\?/g, '');
    // Literals and slot characters are re-derived from the mask, never carried over, so feeding applyMask
    // its own output is idempotent. A literal is dropped only where it sits at its own index: a mask such
    // as `+1 (999) 999-9999` has a digit literal that a digit placeholder would otherwise take as input.
    const typed = [...raw].filter((char, i) => char !== slotChar && !(i < pattern.length && !isPlaceholder(pattern[i]!) && char === pattern[i]));
    return fill(typed, mask, slotChar);
}

// Masks a value that already holds only typed characters, such as an unmask-mode model. It must not go
// through applyMask: there a typed digit that happens to equal the literal at its index would be dropped.
export function maskUnmasked(unmasked: string, mask: string, slotChar = '_'): MaskResult {
    return fill([...unmasked], mask, slotChar);
}

export function isMaskComplete(display: string, mask: string, slotChar = '_'): boolean {
    const required = mask.includes('?') ? mask.slice(0, mask.indexOf('?')) : mask;
    return !display.slice(0, required.length).includes(slotChar);
}
