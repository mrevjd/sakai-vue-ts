import { beforeEach, describe, expect, it, vi } from 'vitest';
import { acceptConfirm, closeConfirm, confirmState, rejectConfirm, useConfirm } from './useConfirm';

beforeEach(() => {
    closeConfirm();
});

describe('useConfirm', () => {
    it('opens with the given options', () => {
        useConfirm().require({ header: 'Delete?', message: 'Sure?' });
        expect(confirmState.visible).toBe(true);
        expect(confirmState.options?.header).toBe('Delete?');
    });

    it('accept runs the accept callback once and closes', () => {
        const accept = vi.fn();
        const reject = vi.fn();
        useConfirm().require({ message: 'Sure?', accept, reject });
        acceptConfirm();
        expect(accept).toHaveBeenCalledTimes(1);
        expect(reject).not.toHaveBeenCalled();
        expect(confirmState.visible).toBe(false);
        expect(confirmState.options).toBeNull();
    });

    it('reject runs the reject callback and closes', () => {
        const accept = vi.fn();
        const reject = vi.fn();
        useConfirm().require({ message: 'Sure?', accept, reject });
        rejectConfirm();
        expect(reject).toHaveBeenCalledTimes(1);
        expect(accept).not.toHaveBeenCalled();
        expect(confirmState.visible).toBe(false);
    });

    it('close runs neither callback', () => {
        const accept = vi.fn();
        const reject = vi.fn();
        useConfirm().require({ message: 'Sure?', accept, reject });
        useConfirm().close();
        expect(accept).not.toHaveBeenCalled();
        expect(reject).not.toHaveBeenCalled();
        expect(confirmState.visible).toBe(false);
    });
});
