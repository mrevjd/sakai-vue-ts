<script setup lang="ts">
    import { Button } from '@/components/ui/button';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { IconMoon, IconPalette, IconSun } from '@/components/icons';
    import AppConfigurator from '@/layout/AppConfigurator.vue';
    import { useLayout } from '@/layout/composables/layout';

    const { toggleDarkMode, isDarkTheme } = useLayout();
</script>

<template>
    <div class="fixed top-8 right-8 flex gap-4">
        <Button type="button" variant="secondary" size="icon-lg" class="rounded-full" :aria-label="isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleDarkMode">
            <IconMoon v-if="isDarkTheme" class="size-5" />
            <IconSun v-else class="size-5" />
        </Button>
        <Popover>
            <PopoverTrigger as-child>
                <Button type="button" size="icon-lg" class="rounded-full" aria-label="Theme settings">
                    <IconPalette class="size-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" class="w-64 p-4">
                <AppConfigurator />
            </PopoverContent>
        </Popover>
    </div>
</template>
