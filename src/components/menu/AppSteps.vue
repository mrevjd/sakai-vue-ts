<script setup lang="ts">
    import { Stepper, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper';
    import { cn } from '@/lib/utils';
    import type { MenuModelItem } from './model';

    // PrimeVue Steps are read-only unless told otherwise; the Stepper's 1-based step maps onto a 0-based activeStep.
    const props = withDefaults(defineProps<{ model: MenuModelItem[]; readonly?: boolean; class?: string }>(), { readonly: true, class: undefined });
    const activeStep = defineModel<number>('activeStep', { default: 0 });

    function onStep(step: number | undefined): void {
        if (props.readonly || step === undefined) return;
        activeStep.value = step - 1;
    }
</script>

<template>
    <!-- The vendored stepper parts stamp no data-slot of their own, so the hooks are set here and fall through. -->
    <Stepper :model-value="activeStep + 1" :linear="false" :class="cn('flex w-full items-start gap-2', props.class)" data-slot="app-steps" @update:model-value="onStep">
        <StepperItem v-for="(item, index) in props.model" :key="index" :step="index + 1" class="relative flex w-full flex-col items-center justify-center" data-slot="stepper-item">
            <StepperSeparator v-if="index < props.model.length - 1" class="absolute top-4 right-[calc(-50%+1rem)] left-[calc(50%+1.5rem)] block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary" />
            <StepperTrigger as-child data-slot="stepper-trigger">
                <button type="button" :class="cn('flex flex-col items-center gap-2', props.readonly && 'cursor-default')" :aria-disabled="props.readonly || undefined">
                    <StepperIndicator class="size-8 rounded-full border border-border bg-card text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{{
                        index + 1
                    }}</StepperIndicator>
                    <StepperTitle class="text-sm font-medium" data-slot="stepper-title">{{ item.label }}</StepperTitle>
                </button>
            </StepperTrigger>
        </StepperItem>
    </Stepper>
</template>
