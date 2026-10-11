<script setup lang="ts">
    import { ref } from 'vue';
    import Message from '@/components/Message.vue';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { IconTimesCircle } from '@/components/icons';
    import { useToast } from '@/composables/useToast';

    const toast = useToast();
    const username = ref<string>('');
    const email = ref<string>('');

    const dismissible = ref<{ severity: 'success' | 'info' | 'warn' | 'error'; content: string }[]>([
        { severity: 'success', content: 'Dynamic Success Message' },
        { severity: 'info', content: 'Dynamic Info Message' },
        { severity: 'warn', content: 'Dynamic Warn Message' },
        { severity: 'error', content: 'Dynamic Error Message' }
    ]);

    function showSuccess() {
        toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
    }

    function showInfo() {
        toast.add({ severity: 'info', summary: 'Info Message', detail: 'Message Detail', life: 3000 });
    }

    function showWarn() {
        toast.add({ severity: 'warn', summary: 'Warn Message', detail: 'Message Detail', life: 3000 });
    }

    function showError() {
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'Message Detail', life: 3000 });
    }

    function dismiss(index: number): void {
        dismissible.value.splice(index, 1);
    }
</script>

<template>
    <div class="flex flex-col md:flex-row gap-8">
        <div class="md:w-1/2">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Toast</div>
                <div class="flex flex-wrap gap-2">
                    <Button variant="success" @click="showSuccess()">Success</Button>
                    <Button variant="info" @click="showInfo()">Info</Button>
                    <Button variant="warning" @click="showWarn()">Warn</Button>
                    <Button variant="destructive" @click="showError()">Error</Button>
                </div>

                <div class="font-semibold text-xl mt-4 mb-4">Inline</div>
                <div class="flex flex-wrap mb-4 gap-2">
                    <Input v-model="username" placeholder="Username" aria-label="username" aria-invalid="true" />
                    <Message severity="error">Username is required</Message>
                </div>
                <div class="flex flex-wrap gap-2">
                    <Input v-model="email" placeholder="Email" aria-label="email" aria-invalid="true" />
                    <Message severity="error" :icon="IconTimesCircle" />
                </div>
            </div>
        </div>
        <div class="md:w-1/2">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Message</div>
                <div class="flex flex-col gap-4 mb-4">
                    <Message severity="success">Success Message</Message>
                    <Message severity="info">Info Message</Message>
                    <Message severity="warn">Warn Message</Message>
                    <Message severity="error">Error Message</Message>
                    <Message severity="secondary">Secondary Message</Message>
                    <Message severity="contrast">Contrast Message</Message>
                </div>

                <div class="flex flex-col gap-4">
                    <Message v-for="(msg, index) in dismissible" :key="msg.content" :severity="msg.severity" closable @close="dismiss(index)">{{ msg.content }}</Message>
                </div>
            </div>
        </div>
    </div>
</template>
