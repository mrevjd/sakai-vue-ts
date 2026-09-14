<script setup lang="ts">
    import { computed, ref, type Component } from 'vue';
    import { Alert, AlertDescription, type AlertVariants } from '@/components/ui/alert';
    import { Button } from '@/components/ui/button';
    import { IconCheckCircle, IconExclamationTriangle, IconInfoCircle, IconTimes, IconTimesCircle } from '@/components/icons';
    import { cn } from '@/lib/utils';

    type Severity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';

    const variants: Record<Severity, NonNullable<AlertVariants['variant']>> = { success: 'success', info: 'info', warn: 'warning', error: 'destructive', secondary: 'secondary', contrast: 'contrast' };
    const icons: Partial<Record<Severity, Component>> = { success: IconCheckCircle, info: IconInfoCircle, warn: IconExclamationTriangle, error: IconTimesCircle };

    const props = withDefaults(defineProps<{ severity?: Severity; closable?: boolean; icon?: Component; class?: string }>(), { severity: 'info', closable: false, icon: undefined, class: undefined });
    const emit = defineEmits<{ close: [] }>();

    const visible = ref(true);
    const variant = computed(() => variants[props.severity]);
    const icon = computed(() => props.icon ?? icons[props.severity]);

    function close(): void {
        visible.value = false;
        emit('close');
    }
</script>

<template>
    <!-- The close button is absolutely positioned, so the alert reserves room for it or long text runs underneath. -->
    <Alert v-if="visible" :variant="variant" :class="cn('items-center', props.closable && 'pr-9', props.class)" :data-variant="variant">
        <component :is="icon" v-if="icon" />
        <AlertDescription class="flex-1"><slot /></AlertDescription>
        <Button v-if="props.closable" variant="ghost" size="icon-xs" class="absolute top-1.5 right-1.5" aria-label="Close" @click="close"><IconTimes class="size-3.5" /></Button>
    </Alert>
</template>
