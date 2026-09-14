<script setup lang="ts">
    import { RouterLink } from 'vue-router';
    import { cn } from '@/lib/utils';
    import { runCommand, type MenuModelItem } from './model';

    const props = defineProps<{ item: MenuModelItem; class?: string }>();
</script>

<template>
    <RouterLink v-if="props.item.to" :to="props.item.to" :class="cn('flex w-full items-center gap-2', props.class)" @click="runCommand(props.item, $event)">
        <component :is="props.item.icon" v-if="props.item.icon" class="size-4 shrink-0" />
        <span>{{ props.item.label }}</span>
    </RouterLink>
    <a
        v-else-if="props.item.url"
        :href="props.item.url"
        :target="props.item.target"
        :rel="props.item.target === '_blank' ? 'noopener noreferrer' : undefined"
        :class="cn('flex w-full items-center gap-2', props.class)"
        @click="runCommand(props.item, $event)"
    >
        <component :is="props.item.icon" v-if="props.item.icon" class="size-4 shrink-0" />
        <span>{{ props.item.label }}</span>
    </a>
    <span v-else :class="cn('flex w-full items-center gap-2', props.class)">
        <component :is="props.item.icon" v-if="props.item.icon" class="size-4 shrink-0" />
        <span>{{ props.item.label }}</span>
    </span>
</template>
