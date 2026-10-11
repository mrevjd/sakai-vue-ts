<script setup lang="ts">
    import { ref } from 'vue';
    import { FileUpload } from '@/components/file-upload';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/composables/useToast';

    const toast = useToast();
    const fileupload = ref<InstanceType<typeof FileUpload> | null>(null);

    function upload(): void {
        fileupload.value?.upload();
    }

    function onUpload(): void {
        toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
    }
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-full lg:col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Advanced</div>
                <FileUpload name="demo[]" multiple accept="image/*" :max-file-size="1000000" @uploader="onUpload" />
            </div>
        </div>
        <div class="col-span-full lg:col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Basic</div>
                <div class="card flex flex-col gap-6 items-center justify-center">
                    <FileUpload ref="fileupload" mode="basic" name="demo[]" accept="image/*" :max-file-size="1000000" @uploader="onUpload" />
                    <Button variant="secondary" @click="upload">Upload</Button>
                </div>
            </div>
        </div>
    </div>
</template>
