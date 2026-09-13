<script setup lang="ts">
    import 'vue-sonner/style.css';
    import ConfirmDialogHost from '@/components/ConfirmDialogHost.vue';
    import { Toaster } from '@/components/ui/sonner';
</script>

<template>
    <router-view />
    <Toaster position="top-right" close-button :offset="{ top: '5rem', right: '1.5rem' }" />
    <ConfirmDialogHost />
</template>
