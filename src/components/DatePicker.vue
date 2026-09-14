<script setup lang="ts">
    import { CalendarDate, getLocalTimeZone, today, type DateValue } from '@internationalized/date';
    import { toDate } from 'reka-ui/date';
    import { computed, ref } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Calendar } from '@/components/ui/calendar';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { IconCalendar } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import { formatDate } from '@/utils/dateFormat';

    const props = withDefaults(
        defineProps<{
            showIcon?: boolean;
            showButtonBar?: boolean;
            dateFormat?: string;
            placeholder?: string;
            inline?: boolean;
            disabled?: boolean;
            class?: string;
        }>(),
        { showIcon: false, showButtonBar: false, dateFormat: 'mm/dd/yy', placeholder: '', inline: false, disabled: false, class: undefined }
    );

    const model = defineModel<Date | null>({ default: null });
    const open = ref(false);

    // The vendored Calendar speaks @internationalized/date; the page keeps native Dates, as with PrimeVue.
    const calendarValue = computed<DateValue | undefined>(() => (model.value ? new CalendarDate(model.value.getFullYear(), model.value.getMonth() + 1, model.value.getDate()) : undefined));

    function onCalendar(value: DateValue | undefined): void {
        model.value = value ? toDate(value, getLocalTimeZone()) : null;
        if (!props.inline) open.value = false;
    }

    function setToday(): void {
        onCalendar(today(getLocalTimeZone()));
    }

    function clear(): void {
        model.value = null;
        open.value = false;
    }

    const label = computed(() => (model.value ? formatDate(model.value, props.dateFormat) : props.placeholder));
</script>

<template>
    <div v-if="props.inline" :class="cn('inline-flex flex-col gap-2 rounded-lg border border-border bg-card p-2', props.class)" data-slot="date-picker" data-inline="true">
        <Calendar :model-value="calendarValue" @update:model-value="onCalendar" />
        <div v-if="props.showButtonBar" class="flex justify-between">
            <Button variant="ghost" size="sm" data-slot="date-picker-today" @click="setToday">Today</Button>
            <Button variant="ghost" size="sm" data-slot="date-picker-clear" @click="clear">Clear</Button>
        </div>
    </div>
    <Popover v-else v-model:open="open">
        <PopoverTrigger as-child>
            <Button variant="outline" :disabled="props.disabled" :class="cn('w-full justify-between font-normal', !model && 'text-muted-foreground', props.class)" data-slot="date-picker-trigger">
                <span>{{ label }}</span>
                <IconCalendar v-if="props.showIcon" class="size-4 opacity-60" />
            </Button>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-auto p-2" data-slot="date-picker-content">
            <Calendar :model-value="calendarValue" @update:model-value="onCalendar" />
            <div v-if="props.showButtonBar" class="mt-2 flex justify-between border-t border-border pt-2">
                <Button variant="ghost" size="sm" data-slot="date-picker-today" @click="setToday">Today</Button>
                <Button variant="ghost" size="sm" data-slot="date-picker-clear" @click="clear">Clear</Button>
            </div>
        </PopoverContent>
    </Popover>
</template>
