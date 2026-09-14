<script setup lang="ts" generic="TData extends Record<string, unknown>">
    import type { Column } from '@tanstack/vue-table';
    import { computed, ref, watch } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { IconFilter } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import type { DataTableFeatures } from './features';
    import { DEFAULT_MATCH_MODES, MATCH_MODE_LABELS, type DataTableColumnFilter, type MatchMode, type MatchModeFilterValue } from './filters';

    const props = defineProps<{
        column: Column<DataTableFeatures, TData>;
        filter: DataTableColumnFilter;
        label: string;
    }>();

    const modes = computed<MatchMode[]>(() => props.filter.matchModes ?? DEFAULT_MATCH_MODES[props.filter.type]);
    const showModes = computed(() => props.filter.showMatchModes !== false && modes.value.length > 1);

    // The draft lives here until Apply, matching PrimeVue's menu display where typing does not filter.
    const open = ref(false);
    const draftMode = ref<MatchMode>(modes.value[0]!);
    const draftValue = ref<unknown>(undefined);

    function current(): MatchModeFilterValue | undefined {
        return props.column.getFilterValue() as MatchModeFilterValue | undefined;
    }

    watch(open, (isOpen) => {
        if (!isOpen) return;
        const applied = current();
        draftMode.value = applied?.matchMode ?? modes.value[0]!;
        draftValue.value = applied?.value;
    });

    function setValue(value: unknown): void {
        draftValue.value = value;
    }

    function setMatchMode(mode: MatchMode): void {
        draftMode.value = mode;
    }

    function apply(): void {
        const empty = draftValue.value === undefined || draftValue.value === null || draftValue.value === '' || (Array.isArray(draftValue.value) && draftValue.value.length === 0);
        props.column.setFilterValue(empty ? undefined : { matchMode: draftMode.value, value: draftValue.value });
        open.value = false;
    }

    function clear(): void {
        draftValue.value = undefined;
        draftMode.value = modes.value[0]!;
        props.column.setFilterValue(undefined);
        open.value = false;
    }

    function onInput(event: Event): void {
        const raw = (event.target as HTMLInputElement).value;
        setValue(props.filter.type === 'numeric' ? (raw === '' ? '' : Number(raw)) : raw);
    }

    const active = computed(() => props.column.getIsFiltered());
</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Button variant="ghost" size="icon-xs" :aria-label="`Filter ${props.label}`" :data-active="active || undefined" :class="cn(active && 'text-primary')">
                <IconFilter class="size-3.5" />
            </Button>
        </PopoverTrigger>
        <PopoverContent align="start" class="flex w-56 flex-col gap-3" data-slot="data-table-filter-menu">
            <select v-if="showModes" v-model="draftMode" class="h-8 rounded-lg border border-input bg-background px-2 text-sm" data-slot="data-table-filter-mode" @change="setMatchMode(($event.target as HTMLSelectElement).value as MatchMode)">
                <option v-for="mode in modes" :key="mode" :value="mode">{{ MATCH_MODE_LABELS[mode] }}</option>
            </select>
            <slot :value="draftValue" :set-value="setValue" :match-mode="draftMode" :set-match-mode="setMatchMode" :apply="apply" :clear="clear">
                <Input
                    v-if="props.filter.type === 'text' || props.filter.type === 'numeric'"
                    :type="props.filter.type === 'numeric' ? 'number' : 'text'"
                    :model-value="(draftValue as string | number | undefined) ?? ''"
                    :placeholder="props.filter.placeholder ?? `Search by ${props.label.toLowerCase()}`"
                    data-slot="data-table-filter-value"
                    @input="onInput"
                />
            </slot>
            <div class="flex justify-between gap-2">
                <Button variant="outline" size="sm" data-slot="data-table-filter-clear" @click="clear">Clear</Button>
                <Button size="sm" data-slot="data-table-filter-apply" @click="apply">Apply</Button>
            </div>
        </PopoverContent>
    </Popover>
</template>
