<script setup lang="ts">
    import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
    import { Button } from '@/components/ui/button';
    import { IconMinus, IconPlus } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(defineProps<{ header?: string; toggleable?: boolean; class?: string }>(), { header: undefined, toggleable: false, class: undefined });
    // PrimeVue's model is "collapsed"; Collapsible's is "open", so the two are inverted at this boundary.
    const collapsed = defineModel<boolean>('collapsed', { default: false });
</script>

<template>
    <Collapsible :open="!collapsed" :class="cn('rounded-lg border border-border bg-card', props.class)" data-slot="panel" @update:open="collapsed = !$event">
        <div class="flex items-center justify-between gap-2 px-4 py-3" data-slot="panel-header">
            <span class="font-semibold"
                ><slot name="header">{{ props.header }}</slot></span
            >
            <div class="flex items-center gap-1">
                <slot name="icons" />
                <CollapsibleTrigger v-if="props.toggleable" as-child>
                    <Button variant="ghost" size="icon-sm" class="rounded-full" :aria-label="`${collapsed ? 'Expand' : 'Collapse'} ${props.header ?? 'panel'}`">
                        <IconPlus v-if="collapsed" class="size-4" />
                        <IconMinus v-else class="size-4" />
                    </Button>
                </CollapsibleTrigger>
            </div>
        </div>
        <CollapsibleContent>
            <div class="border-t border-border px-4 py-3" data-slot="panel-content"><slot /></div>
            <div v-if="$slots.footer" class="border-t border-border px-4 py-3" data-slot="panel-footer"><slot name="footer" /></div>
        </CollapsibleContent>
    </Collapsible>
</template>
