import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { closeConfirm, confirmState, requireConfirm } from '@/composables/useConfirm';
import ConfirmDialogHost from './ConfirmDialogHost.vue';

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
    closeConfirm();
    document.body.innerHTML = '';
});

describe('ConfirmDialogHost', () => {
    it('shows the header, message and labels of the pending confirmation and accepts', async () => {
        const accept = vi.fn();
        const wrapper = mount(ConfirmDialogHost, { attachTo: document.body });
        requireConfirm({ header: 'Delete product?', message: 'This cannot be undone.', acceptLabel: 'Delete', rejectLabel: 'Keep', accept });
        await settle();
        expect(document.body.textContent).toContain('Delete product?');
        expect(document.body.textContent).toContain('This cannot be undone.');
        const acceptButton = document.body.querySelector<HTMLButtonElement>('[data-testid=confirm-accept]');
        expect(acceptButton?.textContent).toContain('Delete');
        acceptButton!.click();
        await settle();
        expect(accept).toHaveBeenCalledTimes(1);
        expect(confirmState.visible).toBe(false);
        wrapper.unmount();
    });

    it('rejects from the reject button and falls back to Confirm, Yes and No', async () => {
        const reject = vi.fn();
        const wrapper = mount(ConfirmDialogHost, { attachTo: document.body });
        requireConfirm({ message: 'Proceed?', reject });
        await settle();
        expect(document.body.textContent).toContain('Confirm');
        const rejectButton = document.body.querySelector<HTMLButtonElement>('[data-testid=confirm-reject]');
        expect(rejectButton?.textContent).toContain('No');
        expect(document.body.querySelector('[data-testid=confirm-accept]')?.textContent).toContain('Yes');
        rejectButton!.click();
        await settle();
        expect(reject).toHaveBeenCalledTimes(1);
        expect(confirmState.visible).toBe(false);
        wrapper.unmount();
    });
});
