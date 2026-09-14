<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { IconAngleDown } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import Tree from './Tree.vue';
    import { findNode, selectedKeys, type TreeNodeLike, type TreeSelectionKeys, type TreeSelectionMode } from './model';

    const props = withDefaults(
        defineProps<{
            options: TreeNodeLike[];
            selectionMode?: TreeSelectionMode;
            placeholder?: string;
            filter?: boolean;
            class?: string;
        }>(),
        { selectionMode: 'single', placeholder: '', filter: false, class: undefined }
    );

    const model = defineModel<TreeSelectionKeys | null>({ default: null });
    const open = ref(false);

    const label = computed(() => {
        const labels = selectedKeys(model.value)
            .map((key) => findNode(props.options, key)?.label)
            .filter((text): text is string => Boolean(text));
        return labels.length > 0 ? labels.join(', ') : props.placeholder;
    });

    function onSelectionKeys(keys: TreeSelectionKeys | null): void {
        model.value = keys;
        if (props.selectionMode === 'single') open.value = false;
    }
</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Button variant="outline" :class="cn('w-full justify-between font-normal', !selectedKeys(model).length && 'text-muted-foreground', props.class)" data-slot="tree-select-trigger">
                <span class="truncate">{{ label }}</span>
                <IconAngleDown class="size-4 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-(--reka-popover-trigger-width) p-2" data-slot="tree-select-content">
            <Tree :value="props.options" :selection-mode="props.selectionMode" :selection-keys="model" :filter="props.filter" @update:selection-keys="onSelectionKeys" />
        </PopoverContent>
    </Popover>
</template>
