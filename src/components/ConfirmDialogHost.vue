<script setup lang="ts">
    import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
    import { Button } from '@/components/ui/button';
    import { acceptConfirm, confirmState, rejectConfirm } from '@/composables/useConfirm';

    // Escape arrives here as open=false (Reka alert dialogs block overlay clicks); the footer buttons settle the state themselves.
    function onOpenChange(open: boolean): void {
        if (!open && confirmState.visible) rejectConfirm();
    }
</script>

<template>
    <AlertDialog :open="confirmState.visible" @update:open="onOpenChange">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ confirmState.options?.header ?? 'Confirm' }}</AlertDialogTitle>
                <AlertDialogDescription class="flex items-center gap-3">
                    <component :is="confirmState.options.icon" v-if="confirmState.options?.icon" class="size-6 shrink-0" />
                    <span>{{ confirmState.options?.message }}</span>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button variant="outline" data-testid="confirm-reject" @click="rejectConfirm">{{ confirmState.options?.rejectLabel ?? 'No' }}</Button>
                <Button :variant="confirmState.options?.acceptVariant ?? 'default'" data-testid="confirm-accept" @click="acceptConfirm">{{ confirmState.options?.acceptLabel ?? 'Yes' }}</Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
