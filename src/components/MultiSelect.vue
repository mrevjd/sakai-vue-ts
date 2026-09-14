<script setup lang="ts">
    import type { AcceptableValue } from 'reka-ui';
    import { computed } from 'vue';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from '@/components/ui/combobox';
    import { IconAngleDown } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import { optionLabel as labelOf, optionValue as valueOf, sameOption } from '@/utils/optionAccess';

    const props = withDefaults(
        defineProps<{
            options: unknown[];
            optionLabel?: string;
            optionValue?: string;
            placeholder?: string;
            filter?: boolean;
            filterPlaceholder?: string;
            selectAll?: boolean;
            maxSelectedLabels?: number;
            display?: 'comma' | 'chip';
            disabled?: boolean;
            class?: string;
        }>(),
        { optionLabel: undefined, optionValue: undefined, placeholder: '', filter: false, filterPlaceholder: 'Search', selectAll: false, maxSelectedLabels: undefined, display: 'chip', disabled: false, class: undefined }
    );

    const model = defineModel<unknown[]>({ default: () => [] });

    function isSelected(option: unknown): boolean {
        return model.value.some((selected) => sameOption(selected, valueOf(option, props.optionValue), props.optionValue ? undefined : props.optionLabel));
    }

    function labelOfValue(value: unknown): string {
        const option = props.options.find((candidate) => sameOption(valueOf(candidate, props.optionValue), value, props.optionValue ? undefined : props.optionLabel));
        return labelOf(option ?? value, props.optionLabel);
    }

    const allSelected = computed(() => props.options.length > 0 && props.options.every(isSelected));
    const overLimit = computed(() => props.maxSelectedLabels !== undefined && model.value.length > props.maxSelectedLabels);

    function toggleAll(): void {
        model.value = allSelected.value ? [] : props.options.map((option) => valueOf(option, props.optionValue));
    }

    function onUpdate(value: unknown): void {
        model.value = Array.isArray(value) ? value : [];
    }

    // The public props keep PrimeVue's `unknown` shapes; Reka's generics want its AcceptableValue, so narrow at its boundary only.
    function itemValue(option: unknown): AcceptableValue {
        return valueOf(option, props.optionValue) as AcceptableValue;
    }
</script>

<template>
    <Combobox :model-value="model" multiple :disabled="props.disabled" :by="(a: unknown, b: unknown) => sameOption(a, b, props.optionValue ? undefined : props.optionLabel)" @update:model-value="onUpdate">
        <ComboboxAnchor as-child>
            <!-- ComboboxAnchor only positions the list; ComboboxTrigger is what toggles it open. -->
            <ComboboxTrigger as-child>
                <button
                    type="button"
                    :class="
                        cn('flex min-h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-2.5 py-1 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50', props.class)
                    "
                    :disabled="props.disabled"
                    data-slot="multi-select-trigger"
                >
                    <span v-if="model.length === 0" class="text-muted-foreground">{{ props.placeholder }}</span>
                    <span v-else-if="overLimit">{{ model.length }} items selected</span>
                    <slot v-else name="value" :value="model">
                        <span v-if="props.display === 'comma'" class="truncate">{{ model.map(labelOfValue).join(', ') }}</span>
                        <span v-else class="flex flex-wrap gap-1">
                            <span v-for="value in model" :key="labelOfValue(value)" class="rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground" data-slot="multi-select-chip">{{ labelOfValue(value) }}</span>
                        </span>
                    </slot>
                    <IconAngleDown class="size-4 shrink-0 opacity-50" />
                </button>
            </ComboboxTrigger>
        </ComboboxAnchor>
        <ComboboxList align="start" class="w-(--reka-combobox-trigger-width) p-1" data-slot="multi-select-content">
            <div v-if="props.filter || props.selectAll" class="flex items-center gap-2 border-b border-border p-2">
                <Checkbox v-if="props.selectAll" :model-value="allSelected" aria-label="Select all" data-slot="multi-select-select-all" @update:model-value="toggleAll" />
                <ComboboxInput v-if="props.filter" :placeholder="props.filterPlaceholder" class="flex-1" />
            </div>
            <ComboboxEmpty>No results found</ComboboxEmpty>
            <ComboboxGroup>
                <ComboboxItem v-for="option in props.options" :key="labelOf(option, props.optionLabel)" :value="itemValue(option)" class="gap-2">
                    <Checkbox :model-value="isSelected(option)" tabindex="-1" aria-hidden="true" class="pointer-events-none" />
                    <slot name="option" :option="option">{{ labelOf(option, props.optionLabel) }}</slot>
                </ComboboxItem>
            </ComboboxGroup>
        </ComboboxList>
    </Combobox>
</template>
