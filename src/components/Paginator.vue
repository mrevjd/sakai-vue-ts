<script setup lang="ts">
    import { computed } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { IconAngleDoubleLeft, IconAngleDoubleRight, IconAngleLeft, IconAngleRight } from '@/components/icons';

    const props = withDefaults(
        defineProps<{
            pageCount: number;
            total: number;
            pageSizeOptions?: number[];
            reportTemplate?: string;
        }>(),
        { pageSizeOptions: () => [5, 10, 25], reportTemplate: 'Showing {first} to {last} of {totalRecords} entries' }
    );

    const page = defineModel<number>('page', { default: 0 });
    const pageSize = defineModel<number>('pageSize', { default: 10 });

    const report = computed(() => {
        const first = props.total === 0 ? 0 : page.value * pageSize.value + 1;
        const last = Math.min(props.total, (page.value + 1) * pageSize.value);
        return props.reportTemplate.replace('{first}', String(first)).replace('{last}', String(last)).replace('{totalRecords}', String(props.total));
    });

    // Five page links centred on the current page, clamped to the ends, as PrimeVue's paginator does.
    const pageLinks = computed(() => {
        const start = Math.max(0, Math.min(page.value - 2, props.pageCount - 5));
        const end = Math.min(props.pageCount, start + 5);
        return Array.from({ length: Math.max(0, end - start) }, (_, index) => start + index);
    });

    const canPrevious = computed(() => page.value > 0);
    const canNext = computed(() => page.value < props.pageCount - 1);

    function onPageSize(value: unknown): void {
        const size = Number(value);
        if (Number.isFinite(size) && size > 0) {
            pageSize.value = size;
            page.value = 0;
        }
    }
</script>

<template>
    <div class="flex flex-wrap items-center justify-between gap-2 pt-4" data-slot="paginator">
        <span class="text-sm text-muted-foreground" data-testid="data-table-report">{{ report }}</span>
        <div class="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="First page" :disabled="!canPrevious" @click="page = 0"><IconAngleDoubleLeft /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Previous page" :disabled="!canPrevious" @click="page = page - 1"><IconAngleLeft /></Button>
            <Button v-for="link in pageLinks" :key="link" :variant="link === page ? 'default' : 'ghost'" size="icon-sm" :aria-label="`Page ${link + 1}`" @click="page = link">{{ link + 1 }}</Button>
            <Button variant="ghost" size="icon-sm" aria-label="Next page" :disabled="!canNext" @click="page = page + 1"><IconAngleRight /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Last page" :disabled="!canNext" @click="page = Math.max(0, props.pageCount - 1)"><IconAngleDoubleRight /></Button>
            <Select :model-value="String(pageSize)" @update:model-value="onPageSize">
                <SelectTrigger class="w-20" aria-label="Rows per page"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="size in props.pageSizeOptions" :key="size" :value="String(size)">{{ size }}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
</template>
