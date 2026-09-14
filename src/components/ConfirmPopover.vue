<script setup lang="ts">
    import { Button } from '@/components/ui/button';
    import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
    import { acceptConfirm, confirmState, rejectConfirm } from '@/composables/useConfirm';

    // Outside clicks and Escape reject, matching PrimeVue's ConfirmPopup; the buttons settle the state themselves.
    function onOpenChange(open: boolean): void {
        if (!open && confirmState.visible) rejectConfirm();
    }
</script>

<template>
    <Popover :open="confirmState.visible" @update:open="onOpenChange">
        <PopoverAnchor :reference="confirmState.options?.target" />
        <PopoverContent align="center" side="bottom" class="flex w-72 flex-col gap-4" data-slot="confirm-popover">
            <div class="flex items-center gap-3">
                <component :is="confirmState.options.icon" v-if="confirmState.options?.icon" class="size-6 shrink-0" />
                <span>{{ confirmState.options?.message }}</span>
            </div>
            <div class="flex justify-end gap-2">
                <Button :variant="confirmState.options?.rejectVariant ?? 'outline'" size="sm" data-testid="confirm-reject" @click="rejectConfirm">{{ confirmState.options?.rejectLabel ?? 'No' }}</Button>
                <Button :variant="confirmState.options?.acceptVariant ?? 'default'" size="sm" data-testid="confirm-accept" @click="acceptConfirm">{{ confirmState.options?.acceptLabel ?? 'Yes' }}</Button>
            </div>
        </PopoverContent>
    </Popover>
</template>
