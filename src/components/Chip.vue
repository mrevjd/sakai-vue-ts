<script setup lang="ts">
    import type { Component } from 'vue';
    import { Button } from '@/components/ui/button';
    import { IconTimes } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(defineProps<{ label?: string; icon?: Component; image?: string; removable?: boolean; class?: string }>(), { label: undefined, icon: undefined, image: undefined, removable: false, class: undefined });
    const emit = defineEmits<{ remove: [] }>();
</script>

<template>
    <span :class="cn('inline-flex items-center gap-2 rounded-full bg-secondary py-1 pr-3 pl-3 text-sm text-secondary-foreground has-[img]:pl-1', props.class)" data-slot="chip">
        <img v-if="props.image" :src="props.image" :alt="props.label ?? ''" class="size-6 rounded-full object-cover" />
        <component :is="props.icon" v-else-if="props.icon" class="size-4" />
        <slot>{{ props.label }}</slot>
        <Button v-if="props.removable" variant="ghost" size="icon-xs" class="-mr-2 size-5 rounded-full" :aria-label="`Remove ${props.label ?? 'chip'}`" data-slot="chip-remove" @click="emit('remove')"><IconTimes class="size-3" /></Button>
    </span>
</template>
