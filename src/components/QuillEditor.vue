<script setup lang="ts">
    import Quill from 'quill';
    import 'quill/dist/quill.snow.css';
    import { onBeforeUnmount, onMounted, ref, watch, type HTMLAttributes } from 'vue';
    import { DEFAULT_QUILL_TOOLBAR } from './quill-toolbar';

    const props = withDefaults(
        defineProps<{
            modelValue?: string;
            readonly?: boolean;
            placeholder?: string;
            toolbar?: unknown[];
            editorStyle?: string;
            class?: HTMLAttributes['class'];
        }>(),
        { modelValue: '', readonly: false, placeholder: '', toolbar: () => DEFAULT_QUILL_TOOLBAR, editorStyle: 'height: 320px', class: undefined }
    );

    const emit = defineEmits<{
        /** Raw editor HTML. Consumers must pass it through `sanitizeHtml()` from `@/utils/sanitize` before any `v-html`. */
        'update:modelValue': [html: string];
        'text-change': [payload: { htmlValue: string; textValue: string }];
    }>();

    const host = ref<HTMLDivElement | null>(null);
    let quill: Quill | null = null;

    function currentHtml(): string {
        return quill?.root.innerHTML ?? '';
    }

    function setHtml(html: string): void {
        if (!quill) return;
        quill.setContents(quill.clipboard.convert({ html }), 'silent');
    }

    function onTextChange(): void {
        if (!quill) return;
        const htmlValue = currentHtml();
        emit('update:modelValue', htmlValue);
        emit('text-change', { htmlValue, textValue: quill.getText() });
    }

    onMounted(() => {
        if (!host.value) return;
        quill = new Quill(host.value, {
            theme: 'snow',
            readOnly: props.readonly,
            placeholder: props.placeholder,
            modules: { toolbar: props.toolbar }
        });
        if (props.modelValue) setHtml(props.modelValue);
        quill.on('text-change', onTextChange);
    });

    watch(
        () => props.modelValue,
        (value) => {
            if (quill && value !== currentHtml()) setHtml(value);
        }
    );

    watch(
        () => props.readonly,
        (readonly) => quill?.enable(!readonly)
    );

    onBeforeUnmount(() => {
        quill?.off('text-change', onTextChange);
        quill = null;
    });
</script>

<template>
    <div :class="props.class" data-slot="quill-editor">
        <div ref="host" :style="props.editorStyle" />
    </div>
</template>
