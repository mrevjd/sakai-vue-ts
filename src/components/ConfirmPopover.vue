<script setup lang="ts">
    import { computed, shallowRef, watch } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
    import { acceptConfirm, confirmState, rejectConfirm, type ConfirmOptions } from '@/composables/useConfirm';

    // Settling nulls the shared options before the popover has animated out, so the last targeted request is kept
    // here for the anchor and the content until the next one replaces it.
    const shown = shallowRef<ConfirmOptions | null>(null);
    watch(
        () => confirmState.options,
        (options) => {
            if (options?.target) shown.value = options;
        },
        { immediate: true }
    );

    const open = computed(() => confirmState.visible && Boolean(confirmState.options?.target));

    // Outside clicks and Escape reject, matching PrimeVue's ConfirmPopup; the buttons settle the state themselves.
    function onOpenChange(next: boolean): void {
        if (!next && confirmState.visible) rejectConfirm();
    }
</script>

<template>
    <Popover :open="open" @update:open="onOpenChange">
        <PopoverAnchor :reference="shown?.target" />
        <PopoverContent align="center" side="bottom" class="flex w-72 flex-col gap-4" data-slot="confirm-popover">
            <div class="flex items-center gap-3">
                <component :is="shown.icon" v-if="shown?.icon" class="size-6 shrink-0" />
                <span>{{ shown?.message }}</span>
            </div>
            <div class="flex justify-end gap-2">
                <Button :variant="shown?.rejectVariant ?? 'outline'" size="sm" data-testid="confirm-reject" @click="rejectConfirm">{{ shown?.rejectLabel ?? 'No' }}</Button>
                <Button :variant="shown?.acceptVariant ?? 'default'" size="sm" data-testid="confirm-accept" @click="acceptConfirm">{{ shown?.acceptLabel ?? 'Yes' }}</Button>
            </div>
        </PopoverContent>
    </Popover>
</template>
