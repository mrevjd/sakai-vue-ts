import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'vue-sonner';
import { useToast } from './useToast';

vi.mock('vue-sonner', () => {
    const base = vi.fn();
    return { toast: Object.assign(base, { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() }) };
});

const mocked = vi.mocked(toast, true);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useToast', () => {
    it('maps success, info, warn and error severities to the matching sonner calls', () => {
        const { add } = useToast();
        add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        expect(mocked.success).toHaveBeenCalledWith('Successful', { description: 'Product Updated', duration: 3000 });
        add({ severity: 'info', summary: 'Info', life: 1000 });
        expect(mocked.info).toHaveBeenCalledWith('Info', { description: undefined, duration: 1000 });
        add({ severity: 'warn', summary: 'Careful', life: 1000 });
        expect(mocked.warning).toHaveBeenCalledWith('Careful', { description: undefined, duration: 1000 });
        add({ severity: 'error', summary: 'Failed', life: 1000 });
        expect(mocked.error).toHaveBeenCalledWith('Failed', { description: undefined, duration: 1000 });
    });

    it('uses the plain toast for secondary, contrast and missing severities', () => {
        const { add } = useToast();
        add({ severity: 'secondary', summary: 'Note', life: 500 });
        add({ severity: 'contrast', summary: 'Note', life: 500 });
        add({ summary: 'Note', life: 500 });
        expect(mocked).toHaveBeenCalledTimes(3);
        expect(mocked).toHaveBeenLastCalledWith('Note', { description: undefined, duration: 500 });
    });

    it('keeps a toast without life on screen, as PrimeVue did', () => {
        useToast().add({ severity: 'success', summary: 'Sticky' });
        expect(mocked.success).toHaveBeenCalledWith('Sticky', { description: undefined, duration: Infinity });
    });
});
