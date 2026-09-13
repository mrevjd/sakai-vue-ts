import { describe, expect, it } from 'vitest';
import { badgeVariants } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';

describe('severity variants added for PrimeVue parity', () => {
    it('gives every added button variant a distinct background', () => {
        const classes = (['success', 'warning', 'info', 'help', 'contrast'] as const).map((variant) => buttonVariants({ variant }));
        expect(classes[0]).toContain('bg-green-600');
        expect(classes[1]).toContain('bg-amber-500');
        expect(classes[2]).toContain('bg-sky-500');
        expect(classes[3]).toContain('bg-purple-500');
        expect(classes[4]).toContain('bg-foreground');
        expect(new Set(classes).size).toBe(5);
    });

    it('gives every added badge variant a distinct background', () => {
        const classes = (['success', 'warning', 'info', 'contrast'] as const).map((variant) => badgeVariants({ variant }));
        expect(classes[0]).toContain('bg-green-600');
        expect(classes[1]).toContain('bg-amber-500');
        expect(classes[2]).toContain('bg-sky-500');
        expect(classes[3]).toContain('bg-foreground');
        expect(new Set(classes).size).toBe(4);
    });
});
