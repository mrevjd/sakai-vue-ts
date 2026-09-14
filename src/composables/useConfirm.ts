import { shallowReactive, shallowReadonly, type Component } from 'vue';

export interface ConfirmOptions {
    /** Element to anchor a popover to; without it the alert dialog is used. */
    target?: HTMLElement;
    message?: string;
    header?: string;
    icon?: Component;
    acceptLabel?: string;
    rejectLabel?: string;
    acceptVariant?: 'default' | 'destructive';
    rejectVariant?: 'outline' | 'ghost' | 'secondary';
    accept?: () => void;
    reject?: () => void;
}

interface ConfirmState {
    visible: boolean;
    options: ConfirmOptions | null;
}

// Shallow so the `icon` option, a component definition, is stored as is rather than deep-proxied.
const state = shallowReactive<ConfirmState>({ visible: false, options: null });

// Shallow on both sides: readonly() would deep-proxy the icon component again and trip Vue's reactive-component warning.
export const confirmState: Readonly<ConfirmState> = shallowReadonly(state);

export function requireConfirm(options: ConfirmOptions): void {
    state.options = options;
    state.visible = true;
}

function settle(callback: (() => void) | undefined): void {
    // Clear first so a callback that opens another confirmation is not wiped by this one closing.
    state.visible = false;
    state.options = null;
    callback?.();
}

export function acceptConfirm(): void {
    settle(state.options?.accept);
}

export function rejectConfirm(): void {
    settle(state.options?.reject);
}

export function closeConfirm(): void {
    settle(undefined);
}

// Same call shape as primevue/useconfirm so ported pages only change the import line.
export function useConfirm() {
    return { require: requireConfirm, close: closeConfirm };
}
