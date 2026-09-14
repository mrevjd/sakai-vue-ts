<script setup lang="ts" generic="T extends Record<string, unknown>">
    import { computed, ref, watch } from 'vue';
    import Paginator from '@/components/Paginator.vue';
    import { cn } from '@/lib/utils';

    const props = withDefaults(
        defineProps<{
            value: T[];
            layout?: 'list' | 'grid';
            sortField?: keyof T & string;
            sortOrder?: 1 | -1;
            paginator?: boolean;
            rows?: number;
            rowsPerPageOptions?: number[];
            class?: string;
        }>(),
        { layout: 'list', sortField: undefined, sortOrder: 1, paginator: false, rows: 10, rowsPerPageOptions: () => [5, 10, 25], class: undefined }
    );

    const page = ref(0);
    const pageSize = ref(props.rows);
    watch(
        () => props.rows,
        (rows) => (pageSize.value = rows)
    );
    // A new value or sort resets to the first page, as PrimeVue does.
    watch([() => props.value, () => props.sortField, () => props.sortOrder], () => (page.value = 0));

    const sorted = computed<T[]>(() => {
        const field = props.sortField;
        if (!field) return props.value;
        return [...props.value].sort((a, b) => {
            const left = a[field];
            const right = b[field];
            const result = typeof left === 'number' && typeof right === 'number' ? left - right : String(left ?? '').localeCompare(String(right ?? ''));
            return result * props.sortOrder;
        });
    });

    const pageCount = computed(() => Math.max(1, Math.ceil(sorted.value.length / pageSize.value)));
    const visible = computed<T[]>(() => (props.paginator ? sorted.value.slice(page.value * pageSize.value, (page.value + 1) * pageSize.value) : sorted.value));
</script>

<template>
    <div :class="cn('flex flex-col', props.class)" data-slot="data-view" :data-layout="props.layout">
        <div v-if="$slots.header" class="mb-4"><slot name="header" /></div>
        <div v-if="visible.length === 0" class="py-8 text-center text-muted-foreground"><slot name="empty">No records found.</slot></div>
        <slot v-else-if="props.layout === 'grid'" name="grid" :items="visible" />
        <slot v-else name="list" :items="visible" />
        <Paginator v-if="props.paginator" v-model:page="page" v-model:page-size="pageSize" :page-count="pageCount" :total="sorted.length" :page-size-options="props.rowsPerPageOptions" />
        <div v-if="$slots.footer" class="mt-4"><slot name="footer" /></div>
    </div>
</template>
