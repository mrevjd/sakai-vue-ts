<script setup lang="ts">
    import { ref, type StyleValue } from 'vue';
    import { IconCheck, IconCopy, IconSpinner } from '@/components/icons';

    const props = withDefaults(
        defineProps<{
            header?: string;
            code?: string;
            free?: boolean;
            containerClass?: string;
            previewStyle?: StyleValue;
        }>(),
        { header: undefined, code: '', free: false, containerClass: '', previewStyle: '' }
    );

    const BLOCK_VIEW = { PREVIEW: 0, CODE: 1 } as const;
    type BlockView = (typeof BLOCK_VIEW)[keyof typeof BLOCK_VIEW];

    const blockView = ref<BlockView>(BLOCK_VIEW.PREVIEW);
    const codeCopied = ref(false);
    const codeCopyLoading = ref(false);

    function activateView(event: Event, blockViewValue: BlockView) {
        blockView.value = blockViewValue;
        event.preventDefault();
    }

    async function copyCode(event: Event) {
        if (codeCopied.value || codeCopyLoading.value) return;

        codeCopyLoading.value = true;
        event.preventDefault();

        try {
            await navigator.clipboard.writeText(props.code);
            codeCopyLoading.value = false;
            codeCopied.value = true;
            setTimeout(() => {
                codeCopied.value = false;
            }, 2000);
        } catch (err) {
            console.error('Clipboard write failed:', err);
            codeCopyLoading.value = false;
        }
    }
</script>

<template>
    <div class="mb-16 overflow-hidden">
        <div class="flex flex-col lg:flex-row justify-between py-4 gap-4 lg:gap-2 px-0!">
            <div class="flex items-center gap-2">
                <span class="font-medium text-xl">{{ header }}</span>
                <span v-if="free" class="flex items-center justify-center px-1.5 py-1 w-fit bg-emerald-500 text-emerald-100 dark:bg-emerald-400 dark:text-emerald-800 rounded-md leading-none! text-xs md:text-sm">Free</span>
            </div>
            <div class="flex items-center gap-2">
                <!-- Preview/Code Toggle -->
                <div class="inline-flex border border-border rounded-2xl overflow-hidden min-h-10">
                    <button
                        :class="[
                            'min-w-28 flex items-center gap-1 justify-center px-4 py-2 rounded-2xl transition-all duration-200 font-medium cursor-pointer',
                            blockView === BLOCK_VIEW.CODE ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        ]"
                        @click="activateView($event, BLOCK_VIEW.CODE)"
                    >
                        <span>Code</span>
                    </button>
                    <button
                        :class="[
                            'min-w-28 flex items-center gap-1 justify-center px-4 py-2 rounded-2xl transition-all duration-200 font-medium cursor-pointer',
                            blockView === BLOCK_VIEW.PREVIEW ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        ]"
                        @click="activateView($event, BLOCK_VIEW.PREVIEW)"
                    >
                        <span>Preview</span>
                    </button>
                </div>

                <!-- Separator -->
                <div class="h-6 w-px bg-border hidden lg:block"></div>

                <!-- Animated Copy Button -->
                <div class="flex items-center gap-2 grow lg:grow-0 justify-end lg:justify-start">
                    <button
                        :disabled="codeCopyLoading"
                        aria-label="Copy code"
                        class="relative w-10 h-10 border border-border rounded-full hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer disabled:cursor-wait"
                        @click="copyCode($event)"
                    >
                        <span :class="['absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 leading-none', codeCopyLoading ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-50 -z-[2]']">
                            <IconSpinner class="size-5 animate-spin text-muted-foreground" />
                        </span>

                        <span :class="['absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 leading-none', codeCopied && !codeCopyLoading ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-50 -z-[2]']">
                            <IconCheck class="size-5 text-green-600 dark:text-green-400" />
                        </span>

                        <span :class="['absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 leading-none', !codeCopied && !codeCopyLoading ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-50 -z-[2]']">
                            <IconCopy class="size-5 text-muted-foreground" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
        <div class="p-0 border border-border rounded-xl overflow-hidden">
            <div v-if="blockView === BLOCK_VIEW.PREVIEW" :class="containerClass" :style="previewStyle">
                <slot />
            </div>
            <div v-if="blockView === BLOCK_VIEW.CODE">
                <!-- Fixed zinc rather than theme tokens: every token flips with the mode, and the code panel stays dark in both. -->
                <pre class="overflow-x-auto rounded-lg border border-border bg-zinc-900 p-4"><code class="text-sm text-zinc-50">{{ code }}</code></pre>
            </div>
        </div>
    </div>
</template>
