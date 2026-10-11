<script setup lang="ts">
    import { computed, type HTMLAttributes } from 'vue';
    import { Input } from '@/components/ui/input';
    import { cn } from '@/lib/utils';
    import { applyMask, isMaskComplete } from '@/utils/mask';

    const props = withDefaults(
        defineProps<{
            mask: string;
            slotChar?: string;
            unmask?: boolean;
            placeholder?: string;
            disabled?: boolean;
            id?: string;
            class?: HTMLAttributes['class'];
        }>(),
        { slotChar: '_', unmask: false, placeholder: undefined, disabled: false, id: undefined, class: undefined }
    );

    const model = defineModel<string>({ default: '' });

    // The field always shows the mask-shaped string; `unmask` only decides what the model carries.
    const display = computed(() => applyMask(model.value, props.mask, props.slotChar).display);
    const complete = computed(() => isMaskComplete(display.value, props.mask, props.slotChar));

    function onInput(event: Event): void {
        const result = applyMask((event.target as HTMLInputElement).value, props.mask, props.slotChar);
        model.value = props.unmask ? result.unmasked : result.display;
    }
</script>

<template>
    <Input
        :id="props.id"
        :model-value="display"
        :placeholder="props.placeholder ?? props.mask"
        :disabled="props.disabled"
        :aria-invalid="display !== '' && !complete ? true : undefined"
        :class="cn(props.class)"
        data-slot="masked-input"
        @input="onInput"
    />
</template>
