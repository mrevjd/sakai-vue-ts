<script setup lang="ts">
    import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, type MenuModelItem } from './model';

    const props = withDefaults(defineProps<{ home?: MenuModelItem; model: MenuModelItem[]; class?: string }>(), { home: undefined, class: undefined });
</script>

<template>
    <Breadcrumb :class="props.class" data-slot="app-breadcrumb">
        <BreadcrumbList>
            <template v-if="props.home">
                <!-- A data-slot here would replace the vendored breadcrumb-item value, so the home marker is a testid. -->
                <BreadcrumbItem data-testid="breadcrumb-home">
                    <BreadcrumbLink as-child><MenuItemContent :item="props.home" /></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
            </template>
            <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
                <BreadcrumbItem>
                    <BreadcrumbPage v-if="index === props.model.length - 1">{{ item.label }}</BreadcrumbPage>
                    <BreadcrumbLink v-else as-child><MenuItemContent :item="item" /></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator v-if="index < props.model.length - 1" />
            </template>
        </BreadcrumbList>
    </Breadcrumb>
</template>
