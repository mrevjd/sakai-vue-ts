<script setup lang="ts">
    import { useDropZone } from '@vueuse/core';
    import { computed, onBeforeUnmount, ref } from 'vue';
    import { Alert, AlertDescription } from '@/components/ui/alert';
    import { Button } from '@/components/ui/button';
    import { Progress } from '@/components/ui/progress';
    import { IconCloudUpload, IconFile, IconPaperclip, IconPlus, IconTimes, IconUpload } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import { formatSize, validateFiles, type RejectedFile } from './validate';

    // The upload itself is always the consumer's (PrimeVue's customUpload path): this component only
    // gathers, validates and emits, which is what every demo in the template does.
    const props = withDefaults(
        defineProps<{
            mode?: 'basic' | 'advanced';
            name?: string;
            multiple?: boolean;
            accept?: string;
            maxFileSize?: number;
            auto?: boolean;
            disabled?: boolean;
            chooseLabel?: string;
            uploadLabel?: string;
            cancelLabel?: string;
            customUpload?: boolean;
            class?: string;
        }>(),
        { mode: 'advanced', name: undefined, multiple: false, accept: undefined, maxFileSize: undefined, auto: false, disabled: false, chooseLabel: 'Choose', uploadLabel: 'Upload', cancelLabel: 'Cancel', customUpload: true, class: undefined }
    );

    const emit = defineEmits<{
        select: [payload: { files: File[] }];
        uploader: [payload: { files: File[] }];
        clear: [];
        remove: [payload: { file: File; files: File[] }];
        error: [payload: { messages: string[] }];
    }>();

    const input = ref<HTMLInputElement | null>(null);
    const content = ref<HTMLElement | null>(null);
    const files = ref<File[]>([]);
    const rejected = ref<RejectedFile[]>([]);
    const previews = new Map<File, string>();

    const canPreview = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';

    function previewOf(file: File): string | undefined {
        if (!canPreview || !file.type.startsWith('image/')) return undefined;
        let url = previews.get(file);
        if (!url) {
            url = URL.createObjectURL(file);
            previews.set(file, url);
        }
        return url;
    }

    function revoke(file: File): void {
        const url = previews.get(file);
        if (url && canPreview) URL.revokeObjectURL(url);
        previews.delete(file);
    }

    function acceptFiles(incoming: File[]): void {
        if (props.disabled) return;
        const result = validateFiles(incoming, { accept: props.accept, maxFileSize: props.maxFileSize });
        rejected.value = result.rejected;
        if (result.rejected.length > 0) emit('error', { messages: result.rejected.map((r) => r.message) });
        if (result.accepted.length === 0) return;
        // A single-file swap drops the outgoing file, so release its object URL now rather than at unmount.
        if (!props.multiple) files.value.forEach(revoke);
        files.value = props.multiple ? [...files.value, ...result.accepted] : result.accepted.slice(0, 1);
        emit('select', { files: files.value });
        if (props.auto) upload();
    }

    function onChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        acceptFiles(Array.from(target.files ?? []));
        // Reset so choosing the same file again fires change.
        target.value = '';
    }

    function choose(): void {
        input.value?.click();
    }

    function upload(): void {
        if (files.value.length === 0) return;
        emit('uploader', { files: files.value });
        files.value.forEach(revoke);
        files.value = [];
    }

    function clear(): void {
        files.value.forEach(revoke);
        files.value = [];
        rejected.value = [];
        emit('clear');
    }

    function remove(index: number): void {
        if (props.disabled) return;
        const file = files.value[index];
        if (!file) return;
        revoke(file);
        files.value = files.value.filter((_, i) => i !== index);
        emit('remove', { file, files: files.value });
    }

    const { isOverDropZone } = useDropZone(content, {
        onDrop: (dropped) => {
            if (dropped) acceptFiles(dropped);
        }
    });

    const hasFiles = computed(() => files.value.length > 0);

    onBeforeUnmount(() => {
        files.value.forEach(revoke);
    });

    defineExpose({ upload, clear, files });
</script>

<template>
    <div :class="cn('flex flex-col gap-3', props.class)" data-slot="file-upload" :data-mode="props.mode">
        <input ref="input" type="file" class="sr-only" :name="props.name" :multiple="props.multiple" :accept="props.accept" :disabled="props.disabled" tabindex="-1" @change="onChange" />
        <template v-if="props.mode === 'basic'">
            <div class="flex items-center gap-3">
                <Button type="button" variant="secondary" :disabled="props.disabled" data-slot="file-upload-choose" @click="choose"><IconPaperclip class="size-4" />{{ hasFiles ? files[0]!.name : props.chooseLabel }}</Button>
                <span v-if="hasFiles" class="sr-only" data-slot="file-upload-basic-name">{{ files[0]!.name }}</span>
            </div>
        </template>
        <template v-else>
            <div class="flex flex-wrap items-center gap-2 rounded-t-lg border border-border bg-muted/40 p-3" data-slot="file-upload-toolbar">
                <Button type="button" variant="secondary" :disabled="props.disabled" data-slot="file-upload-choose" @click="choose"><IconPlus class="size-4" />{{ props.chooseLabel }}</Button>
                <Button type="button" :disabled="props.disabled || !hasFiles" data-slot="file-upload-upload" @click="upload"><IconUpload class="size-4" />{{ props.uploadLabel }}</Button>
                <Button type="button" variant="outline" :disabled="props.disabled || !hasFiles" data-slot="file-upload-cancel" @click="clear"><IconTimes class="size-4" />{{ props.cancelLabel }}</Button>
            </div>
            <div ref="content" :class="cn('flex min-h-40 flex-col gap-3 rounded-b-lg border border-t-0 border-border p-4 transition-colors', isOverDropZone && 'bg-accent')" data-slot="file-upload-content">
                <Progress v-if="hasFiles" :model-value="0" class="h-1.5" />
                <Alert v-for="item in rejected" :key="item.message" variant="destructive" data-slot="file-upload-message">
                    <AlertDescription>{{ item.message }}</AlertDescription>
                </Alert>
                <div v-if="hasFiles" class="flex flex-col gap-2">
                    <div v-for="(file, index) in files" :key="`${file.name}-${file.size}-${index}`" class="flex items-center gap-4 rounded-lg border border-border p-3" data-slot="file-upload-file">
                        <img v-if="previewOf(file)" :src="previewOf(file)" :alt="file.name" class="size-12 rounded object-cover" />
                        <IconFile v-else class="size-8 text-muted-foreground" />
                        <div class="flex min-w-0 flex-1 flex-col">
                            <span class="truncate font-medium">{{ file.name }}</span>
                            <span class="text-sm text-muted-foreground">{{ formatSize(file.size) }}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" :disabled="props.disabled" :aria-label="`Remove ${file.name}`" @click="remove(index)"><IconTimes class="size-4" /></Button>
                    </div>
                </div>
                <div v-else class="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
                    <IconCloudUpload class="size-10" />
                    <span>Drag and drop files to here to upload.</span>
                </div>
            </div>
        </template>
    </div>
</template>
