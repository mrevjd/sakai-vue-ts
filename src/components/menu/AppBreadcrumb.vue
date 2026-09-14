<script setup lang="ts">
    import { computed } from 'vue';
    import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from './model';

    const props = withDefaults(defineProps<{ home?: MenuModelItem; model: MenuModelItem[]; class?: string }>(), { home: undefined, class: undefined });

    // The current page is the last visible item, so hidden items must be dropped before the index compare.
    const visibleItems = computed(() => props.model.filter(isVisible));
</script>

<template>
    <Breadcrumb :class="props.class" data-slot="app-breadcrumb">
        <BreadcrumbList>
            <template v-if="props.home">
                <!-- A data-slot here would replace the vendored breadcrumb-item value, so the home marker is a testid. -->
                <BreadcrumbItem data-testid="breadcrumb-home">
                    <BreadcrumbLink as-child><MenuItemContent :item="props.home" @click="runCommand(props.home, $event)" /></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
            </template>
            <template v-for="(item, index) in visibleItems" :key="index">
                <BreadcrumbItem>
                    <BreadcrumbPage v-if="index === visibleItems.length - 1">{{ item.label }}</BreadcrumbPage>
                    <BreadcrumbLink v-else as-child><MenuItemContent :item="item" @click="runCommand(item, $event)" /></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator v-if="index < visibleItems.length - 1" />
            </template>
        </BreadcrumbList>
    </Breadcrumb>
</template>
