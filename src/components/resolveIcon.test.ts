import { describe, expect, it } from 'vitest';
import { IconCalendarPlus, IconInbox, IconQuestion } from '@/components/icons';
import { resolveIcon } from './resolveIcon';

describe('resolveIcon', () => {
    it('maps a PrimeIcons class string to the icon component', () => {
        expect(resolveIcon('pi pi-fw pi-inbox')).toBe(IconInbox);
        expect(resolveIcon('pi-calendar-plus')).toBe(IconCalendarPlus);
    });

    it('ignores the pi and pi-fw tokens', () => {
        expect(resolveIcon('pi pi-fw')).toBeUndefined();
        expect(resolveIcon('pi')).toBeUndefined();
    });

    it('returns undefined for an unknown glyph, an empty string and undefined', () => {
        expect(resolveIcon('pi pi-fw pi-no-such-icon')).toBeUndefined();
        expect(resolveIcon('')).toBeUndefined();
        expect(resolveIcon(undefined)).toBeUndefined();
    });

    it('derives the glyph name from the export name, so a one-word and a multi-word name both resolve', () => {
        expect(resolveIcon('pi-question')).toBe(IconQuestion);
        expect(resolveIcon('pi-calendar-plus')).toBe(IconCalendarPlus);
    });
});
