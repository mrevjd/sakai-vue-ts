<script setup lang="ts">
    import { computed, nextTick, ref, watch, type HTMLAttributes } from 'vue';
    import { Input } from '@/components/ui/input';
    import { cn } from '@/lib/utils';
    import { applyMask, isMaskComplete, maskUnmasked, type MaskResult } from '@/utils/mask';

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

    // Nothing typed means an empty field, as in PrimeVue: the bare slot string would hide the placeholder, read
    // as an incomplete (invalid) value, and reach the model of a field the user has cleared.
    function orEmpty(result: MaskResult): MaskResult {
        return result.unmasked === '' ? { display: '', unmasked: '' } : result;
    }

    function masked(value: string): MaskResult {
        return orEmpty(applyMask(value, props.mask, props.slotChar));
    }

    function toDisplay(value: string): string {
        return masked(value).display;
    }

    // With `unmask` the model holds typed characters only, which applyMask would misread as a display
    // string wherever one equals the literal at its index.
    function fromModel(value: string): string {
        return props.unmask ? orEmpty(maskUnmasked(value, props.mask, props.slotChar)).display : toDisplay(value);
    }

    // `shown` is the single source of truth for the field. Deriving it from the model instead would
    // give the value two writers, and the one driven by the model wins the tick, so a keystroke that
    // the mask rejects or reshapes never reaches the element.
    const shown = ref(fromModel(model.value));
    const complete = computed(() => isMaskComplete(shown.value, props.mask, props.slotChar));

    watch(
        shown,
        async (next) => {
            const result = masked(next);
            model.value = props.unmask ? result.unmasked : result.display;
            if (next === result.display) return;
            // The vendored Input holds its value through useVModel in passive mode, whose prop watcher
            // is guarded by a flag that only clears on nextTick. A correction written in this tick is
            // swallowed by that guard and the element keeps the raw keystroke, so it waits one tick.
            await nextTick();
            shown.value = result.display;
        },
        { flush: 'post' }
    );

    // A model change from outside (a parent clearing the field) flows in; the echo of our own write does not.
    watch(model, (next) => {
        const incoming = fromModel(next ?? '');
        if (incoming !== toDisplay(shown.value)) shown.value = incoming;
    });

    // A new mask re-shapes the current value now rather than at the next keystroke; the shown watcher then
    // writes the re-shaped value back to the model.
    watch([() => props.mask, () => props.slotChar], () => {
        shown.value = fromModel(model.value ?? '');
    });
</script>

<template>
    <Input :id="props.id" v-model="shown" :placeholder="props.placeholder ?? props.mask" :disabled="props.disabled" :aria-invalid="shown !== '' && !complete ? true : undefined" :class="cn(props.class)" data-slot="masked-input" />
</template>
