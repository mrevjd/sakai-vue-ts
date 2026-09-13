<script setup lang="ts">
    import { RouterLink } from 'vue-router';
    import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
    import { Button } from '@/components/ui/button';
    import { IconLock } from '@/components/icons';
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-background flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(247, 149, 48, 0.4) 10%, rgba(247, 149, 48, 0) 30%)">
                <div class="w-full bg-card py-20 px-8 sm:px-20 flex flex-col items-center" style="border-radius: 53px">
                    <div class="gap-4 flex flex-col items-center">
                        <div class="flex justify-center items-center border-2 border-orange-500 rounded-full" style="width: 3.2rem; height: 3.2rem">
                            <IconLock class="size-6 text-orange-500" />
                        </div>
                        <h1 class="text-foreground font-bold text-4xl lg:text-5xl mb-2">Access Denied</h1>
                        <span class="text-muted-foreground mb-8">You do not have the necessary permisions. Please contact admins.</span>
                        <img src="/demo/images/access/asset-access.svg" alt="Access denied" class="mb-8" width="80%" />
                        <div class="col-span-12 mt-8 text-center">
                            <Button as-child variant="warning"><RouterLink to="/">Go to Dashboard</RouterLink></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
