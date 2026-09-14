<script setup lang="ts">
    import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
    import { IconMinus, IconPlus } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(defineProps<{ legend?: string; toggleable?: boolean; class?: string }>(), { legend: undefined, toggleable: false, class: undefined });
    // PrimeVue's model is "collapsed"; Collapsible's is "open", so the two are inverted at this boundary.
    const collapsed = defineModel<boolean>('collapsed', { default: false });
</script>

<template>
    <Collapsible :open="!collapsed" as="fieldset" :class="cn('rounded-lg border border-border bg-card px-4 pb-4', props.class)" data-slot="fieldset" @update:open="collapsed = !$event">
        <legend class="px-2 font-semibold">
            <CollapsibleTrigger v-if="props.toggleable" class="inline-flex items-center gap-2 rounded-md px-1 hover:bg-muted" :aria-label="`${collapsed ? 'Expand' : 'Collapse'} ${props.legend ?? 'fieldset'}`">
                <IconPlus v-if="collapsed" class="size-4" />
                <IconMinus v-else class="size-4" />
                <slot name="legend">{{ props.legend }}</slot>
            </CollapsibleTrigger>
            <slot v-else name="legend">{{ props.legend }}</slot>
        </legend>
        <CollapsibleContent
            ><div class="pt-2" data-slot="fieldset-content"><slot /></div
        ></CollapsibleContent>
    </Collapsible>
</template>
