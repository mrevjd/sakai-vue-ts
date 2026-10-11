<script setup lang="ts">
    import { TooltipProvider } from 'reka-ui';
    import 'vue-sonner/style.css';
    import ConfirmDialogHost from '@/components/ConfirmDialogHost.vue';
    import { Toaster } from '@/components/ui/sonner';
</script>

<template>
    <!-- One provider for the whole app: a bare Tooltip has no ancestor provider and throws. -->
    <TooltipProvider :delay-duration="200">
        <router-view />
    </TooltipProvider>
    <Toaster position="top-right" close-button :offset="{ top: '5rem', right: '1.5rem' }" />
    <ConfirmDialogHost />
</template>
