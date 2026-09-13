import { toast } from 'vue-sonner';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';

export interface ToastMessage {
    severity?: ToastSeverity;
    summary?: string;
    detail?: string;
    /** Milliseconds before auto-dismiss. Omitted means the toast stays until closed, as in PrimeVue. */
    life?: number;
}

export function showToast(message: ToastMessage): void {
    const title = message.summary ?? '';
    const options = { description: message.detail, duration: message.life ?? Infinity };
    switch (message.severity) {
        case 'success':
            toast.success(title, options);
            break;
        case 'info':
            toast.info(title, options);
            break;
        case 'warn':
            toast.warning(title, options);
            break;
        case 'error':
            toast.error(title, options);
            break;
        default:
            toast(title, options);
    }
}

// Same call shape as primevue/usetoast so ported pages only change the import line.
export function useToast() {
    return { add: showToast };
}
