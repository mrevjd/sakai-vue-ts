import { readonly, shallowReactive, type Component, type DeepReadonly } from 'vue';

export interface ConfirmOptions {
    /** Element to anchor a popover to. Plan 2 adds ConfirmPopover; until then the dialog is used for every request. */
    target?: HTMLElement;
    message?: string;
    header?: string;
    icon?: Component;
    acceptLabel?: string;
    rejectLabel?: string;
    acceptVariant?: 'default' | 'destructive';
    accept?: () => void;
    reject?: () => void;
}

interface ConfirmState {
    visible: boolean;
    options: ConfirmOptions | null;
}

// Shallow so the `icon` option, a component definition, is stored as is rather than deep-proxied.
const state = shallowReactive<ConfirmState>({ visible: false, options: null });

// Annotated explicitly: the inferred DeepReadonly over Vue's Component union (icon) is too large for vue-tsc to serialise (TS7056).
export const confirmState: DeepReadonly<ConfirmState> = readonly(state);

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
