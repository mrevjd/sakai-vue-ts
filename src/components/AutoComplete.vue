<script setup lang="ts">
    import { ComboboxInput, type AcceptableValue } from 'reka-ui';
    import { computed, ref, watch } from 'vue';
    import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxItem, ComboboxList, ComboboxTrigger } from '@/components/ui/combobox';
    import { IconAngleDown, IconTimes } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import { optionLabel as labelOf, sameOption } from '@/utils/optionAccess';

    // Suggestions are the parent's: typing emits `complete({ query })` and the parent sets `suggestions`,
    // the same contract as PrimeVue's AutoComplete, so ported pages keep their search functions.
    const props = withDefaults(
        defineProps<{
            suggestions: unknown[];
            optionLabel?: string;
            multiple?: boolean;
            dropdown?: boolean;
            display?: 'comma' | 'chip';
            placeholder?: string;
            disabled?: boolean;
            class?: string;
        }>(),
        { optionLabel: undefined, multiple: false, dropdown: false, display: 'comma', placeholder: '', disabled: false, class: undefined }
    );

    // No `default: null`: Vue only accepts a factory default for an `unknown` model, and unknown already covers undefined.
    const model = defineModel<unknown>();
    const emit = defineEmits<{ complete: [payload: { query: string }] }>();

    const query = ref('');
    const open = ref(false);

    function onInput(event: Event): void {
        query.value = (event.target as HTMLInputElement).value;
        // Emptying the text in single mode drops the selection with it; undefined is this model's empty state.
        // Non-empty text leaves the model alone until the parent's suggestions produce a pick.
        if (!props.multiple && query.value === '' && model.value !== undefined && model.value !== null) model.value = undefined;
        open.value = true;
        emit('complete', { query: query.value });
    }

    // New suggestions open the list; an empty list keeps it open to show the empty state only while typing.
    watch(
        () => props.suggestions,
        (list) => {
            if (list.length > 0) open.value = true;
        }
    );

    function chips(): unknown[] {
        return props.multiple && Array.isArray(model.value) ? model.value : [];
    }

    function remove(item: unknown): void {
        if (!Array.isArray(model.value)) return;
        model.value = model.value.filter((selected) => !sameOption(selected, item, props.optionLabel));
    }

    function onUpdate(value: unknown): void {
        model.value = value;
        query.value = props.multiple ? '' : labelOf(value, props.optionLabel);
        if (!props.multiple) open.value = false;
    }

    // The public props keep PrimeVue's `unknown` shapes; Reka's generics want its AcceptableValue, so narrow at its boundary only.
    const rekaModel = computed(() => model.value as AcceptableValue | AcceptableValue[] | undefined);
    const rekaSuggestions = computed(() => props.suggestions as AcceptableValue[]);
</script>

<template>
    <!-- Both search-term resets are off: the query is owned here and by the parent, not by Reka's input. -->
    <Combobox
        :model-value="rekaModel"
        :multiple="props.multiple"
        :open="open"
        :disabled="props.disabled"
        ignore-filter
        :reset-search-term-on-select="false"
        :reset-search-term-on-blur="false"
        :by="(a: unknown, b: unknown) => sameOption(a, b, props.optionLabel)"
        @update:model-value="onUpdate"
        @update:open="open = $event"
    >
        <ComboboxAnchor :class="cn('flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-sm focus-within:ring-2 focus-within:ring-ring', props.class)" data-slot="auto-complete">
            <span v-for="item in chips()" :key="labelOf(item, props.optionLabel)" class="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground" data-slot="auto-complete-chip">
                {{ labelOf(item, props.optionLabel) }}
                <button type="button" class="rounded-sm hover:bg-secondary-foreground/10" :aria-label="`Remove ${labelOf(item, props.optionLabel)}`" @click.stop="remove(item)"><IconTimes class="size-3" /></button>
            </span>
            <!-- Reka's own input, not the vendored one: arrow keys, Home, End and Enter only navigate the list from it, and the vendored wrapper would nest a second bordered box in here. -->
            <ComboboxInput
                :model-value="query"
                :placeholder="props.placeholder"
                :disabled="props.disabled"
                class="min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                data-slot="auto-complete-input"
                @update:model-value="query = $event"
                @input="onInput"
                @focus="open = props.suggestions.length > 0"
            />
            <ComboboxTrigger v-if="props.dropdown" as-child>
                <button type="button" class="flex size-6 items-center justify-center rounded-sm hover:bg-muted" aria-label="Show suggestions" data-slot="auto-complete-dropdown" @click="emit('complete', { query: '' })">
                    <IconAngleDown class="size-4" />
                </button>
            </ComboboxTrigger>
        </ComboboxAnchor>
        <ComboboxList class="w-(--reka-combobox-trigger-width) p-1">
            <ComboboxEmpty>No results found</ComboboxEmpty>
            <ComboboxGroup>
                <ComboboxItem v-for="item in rekaSuggestions" :key="labelOf(item, props.optionLabel)" :value="item">
                    <slot name="option" :option="item">{{ labelOf(item, props.optionLabel) }}</slot>
                </ComboboxItem>
            </ComboboxGroup>
        </ComboboxList>
    </Combobox>
</template>
