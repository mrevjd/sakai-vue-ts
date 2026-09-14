<script setup lang="ts">
    import { RouterLink } from 'vue-router';
    import { cn } from '@/lib/utils';
    import type { MenuModelItem } from './model';

    // The one element a user activates: a RouterLink, an anchor or a button, never nested in another
    // control. It never runs `command` itself; the wrapper that owns the activation does, exactly once,
    // so a click and its keyboard equivalent cannot double-fire. `labelOnly` renders a plain span for
    // triggers that are already the interactive element (menubar and collapsible headers).
    const props = withDefaults(defineProps<{ item: MenuModelItem; labelOnly?: boolean; class?: string }>(), { labelOnly: false, class: undefined });
</script>

<template>
    <span v-if="props.labelOnly" :class="cn('flex w-full items-center gap-2', props.class)">
        <component :is="props.item.icon" v-if="props.item.icon" class="size-4 shrink-0" />
        <span>{{ props.item.label }}</span>
    </span>
    <RouterLink
        v-else-if="props.item.to"
        :to="props.item.to"
        :aria-disabled="props.item.disabled || undefined"
        :tabindex="props.item.disabled ? -1 : undefined"
        :class="cn('flex w-full items-center gap-2', props.item.disabled && 'pointer-events-none opacity-50', props.class)"
    >
        <component :is="props.item.icon" v-if="props.item.icon" class="size-4 shrink-0" />
        <span>{{ props.item.label }}</span>
    </RouterLink>
    <a
        v-else-if="props.item.url"
        :href="props.item.url"
        :target="props.item.target"
        :rel="props.item.target === '_blank' ? 'noopener noreferrer' : undefined"
        :aria-disabled="props.item.disabled || undefined"
        :tabindex="props.item.disabled ? -1 : undefined"
        :class="cn('flex w-full items-center gap-2', props.item.disabled && 'pointer-events-none opacity-50', props.class)"
    >
        <component :is="props.item.icon" v-if="props.item.icon" class="size-4 shrink-0" />
        <span>{{ props.item.label }}</span>
    </a>
    <button v-else type="button" :disabled="props.item.disabled" :aria-disabled="props.item.disabled || undefined" :class="cn('flex w-full items-center gap-2 text-left disabled:opacity-50', props.class)">
        <component :is="props.item.icon" v-if="props.item.icon" class="size-4 shrink-0" />
        <span>{{ props.item.label }}</span>
    </button>
</template>
