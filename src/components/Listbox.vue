<script setup lang="ts">
    import { ListboxContent, ListboxFilter, ListboxItem, ListboxItemIndicator, ListboxRoot, type AcceptableValue } from 'reka-ui';
    import { computed, ref } from 'vue';
    import { IconCheck } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import { optionLabel as labelOf, optionValue as valueOf, sameOption } from '@/utils/optionAccess';

    const props = withDefaults(
        defineProps<{
            options: unknown[];
            optionLabel?: string;
            optionValue?: string;
            multiple?: boolean;
            filter?: boolean;
            filterPlaceholder?: string;
            disabled?: boolean;
            listStyle?: string;
            class?: string;
        }>(),
        { optionLabel: undefined, optionValue: undefined, multiple: false, filter: false, filterPlaceholder: 'Search', disabled: false, listStyle: undefined, class: undefined }
    );

    // No `default: null`: Vue only accepts a factory default for an `unknown` model, and unknown already covers undefined.
    const model = defineModel<unknown>();
    const query = ref('');
    const visible = computed(() => (query.value ? props.options.filter((option) => labelOf(option, props.optionLabel).toLowerCase().includes(query.value.toLowerCase())) : props.options));

    // Reka compares values by reference unless told how; option objects from a service are compared by fields.
    function by(a: unknown, b: unknown): boolean {
        return sameOption(a, b, props.optionValue ? undefined : props.optionLabel);
    }

    // The public props keep PrimeVue's `unknown` shapes; Reka's generics want its AcceptableValue, so narrow at its boundary only.
    const rekaModel = computed(() => model.value as AcceptableValue | AcceptableValue[] | undefined);
    function itemValue(option: unknown): AcceptableValue {
        return valueOf(option, props.optionValue) as AcceptableValue;
    }
</script>

<template>
    <ListboxRoot
        :model-value="rekaModel"
        :multiple="props.multiple"
        :disabled="props.disabled"
        :by="by"
        :class="cn('flex flex-col gap-1 rounded-lg border border-border bg-card p-1', props.class)"
        data-slot="listbox"
        @update:model-value="model = $event"
    >
        <ListboxFilter
            v-if="props.filter"
            v-model="query"
            :placeholder="props.filterPlaceholder"
            class="mb-1 h-8 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-slot="listbox-filter"
        />
        <ListboxContent :style="props.listStyle" class="flex max-h-64 flex-col gap-0.5 overflow-auto outline-none">
            <ListboxItem
                v-for="option in visible"
                :key="labelOf(option, props.optionLabel)"
                :value="itemValue(option)"
                class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none select-none hover:bg-muted data-[highlighted]:bg-muted data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[disabled]:opacity-50"
            >
                <ListboxItemIndicator><IconCheck class="size-4" /></ListboxItemIndicator>
                <slot name="option" :option="option">{{ labelOf(option, props.optionLabel) }}</slot>
            </ListboxItem>
            <div v-if="visible.length === 0" class="px-3 py-2 text-sm text-muted-foreground">No results found</div>
        </ListboxContent>
    </ListboxRoot>
</template>
