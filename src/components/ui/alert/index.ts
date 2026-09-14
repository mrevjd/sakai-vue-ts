import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Alert } from './Alert.vue';
export { default as AlertAction } from './AlertAction.vue';
export { default as AlertDescription } from './AlertDescription.vue';
export { default as AlertTitle } from './AlertTitle.vue';

export const alertVariants = cva(
    'grid gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*=size-])]:size-4 group/alert relative w-full',
    {
        variants: {
            variant: {
                default: 'bg-card text-card-foreground',
                destructive: 'text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current',
                success: 'border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400 *:[svg]:text-current',
                info: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 *:[svg]:text-current',
                warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 *:[svg]:text-current',
                secondary: 'bg-secondary text-secondary-foreground',
                contrast: 'border-foreground bg-foreground text-background'
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
);

export type AlertVariants = VariantProps<typeof alertVariants>;
