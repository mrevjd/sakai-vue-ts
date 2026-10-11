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

const ALPHANUMERIC = /[A-Za-z0-9]/;

// The literals before the first placeholder, such as '+1 (' in `+1 (999) 999-9999`.
function leadingLiterals(pattern: string): string {
    const firstPlaceholder = [...pattern].findIndex(isPlaceholder);
    return pattern.slice(0, firstPlaceholder === -1 ? pattern.length : firstPlaceholder);
}

// True when the text holds the whole leading literal run and every literal position it reaches holds that
// literal: a previous display, possibly with keystrokes appended, rather than pasted or freshly typed
// characters. Requiring the full run keeps a first keystroke that equals a leading literal ('1' into an
// empty `1-999` field) as input.
function isDisplayShaped(raw: string, pattern: string): boolean {
    if (raw === '' || raw.length < leadingLiterals(pattern).length) return false;
    for (let i = 0; i < Math.min(raw.length, pattern.length); i++) {
        if (!isPlaceholder(pattern[i]!) && raw[i] !== pattern[i]) return false;
    }
    return true;
}

// Text that opens with the mask's first literal carries the mask's leading literals in some formatting
// ('+14155551234', '+1 415 555 1234', or a display shifted by a deletion). Their letters and digits are
// skipped in order so the 1 of a `+1` prefix is not read as input. Only a non-alphanumeric first literal
// is a reliable cue: a leading '1' could equally be the user's first digit.
function stripLeadingLiterals(raw: string, pattern: string): string {
    const leading = leadingLiterals(pattern);
    if (leading === '' || ALPHANUMERIC.test(leading[0]!) || raw[0] !== leading[0]) return raw;
    let r = 0;
    for (const literal of leading) {
        if (!ALPHANUMERIC.test(literal)) continue;
        while (r < raw.length && !ALPHANUMERIC.test(raw[r]!)) r += 1;
        if (raw[r] !== literal) break;
        r += 1;
    }
    return raw.slice(r);
}

// Masks a field's current text: a previous display with keystrokes added, a display edited in the middle,
// or pasted and typed characters.
export function applyMask(raw: string, mask: string, slotChar = '_'): MaskResult {
    const pattern = mask.replace(/\?/g, '');
    // Literals and slot characters are re-derived from the mask, never carried over, so feeding applyMask
    // its own output is idempotent. A literal is dropped only where it sits at its own index, and only when
    // the text is display-shaped: a mask such as `+1 (999) 999-9999` has a digit literal that a digit
    // placeholder would otherwise take as input, while pasted digits such as '4155551234' are all input.
    if (isDisplayShaped(raw, pattern)) {
        const typed = [...raw].filter((char, i) => char !== slotChar && !(i < pattern.length && !isPlaceholder(pattern[i]!) && char === pattern[i]));
        return fill(typed, mask, slotChar);
    }
    // Non-alphanumeric characters left over are rejected by every placeholder in fill.
    return fill(
        [...stripLeadingLiterals(raw, pattern)].filter((char) => char !== slotChar),
        mask,
        slotChar
    );
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
