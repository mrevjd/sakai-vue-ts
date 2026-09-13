<script setup lang="ts">
    import type { ChartData, ChartOptions } from 'chart.js';
    import { computed, onMounted, ref, watch } from 'vue';
    import AppChart from '@/components/AppChart.vue';
    import { useLayout } from '@/layout/composables/layout';
    import { resolvePrimary, resolveSurface, type ThemeMode } from '@/utils/theme';
    import type { Shade } from '@/layout/palettes';

    const { layoutConfig, isDarkTheme } = useLayout();

    // Bar shades follow the picked primary palette; noir has no palette of its own and uses the surface scale.
    function primaryShade(key: Shade): string {
        const mode: ThemeMode = isDarkTheme.value ? 'dark' : 'light';
        const primary = resolvePrimary(layoutConfig.primary).palette[key];
        return primary ?? resolveSurface(layoutConfig.surface, mode).palette[key] ?? '#000000';
    }

    function buildData(): ChartData {
        return {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [
                { type: 'bar', label: 'Subscriptions', backgroundColor: primaryShade('400'), data: [4000, 10000, 15000, 4000], barThickness: 32 },
                { type: 'bar', label: 'Advertising', backgroundColor: primaryShade('300'), data: [2100, 8400, 2400, 7500], barThickness: 32 },
                { type: 'bar', label: 'Affiliate', backgroundColor: primaryShade('200'), data: [4100, 5200, 3400, 7400], borderRadius: { topLeft: 8, topRight: 8 }, borderSkipped: true, barThickness: 32 }
            ]
        };
    }

    function buildOptions(): ChartOptions {
        const documentStyle = getComputedStyle(document.documentElement);
        const borderColor = documentStyle.getPropertyValue('--border');
        const textMutedColor = documentStyle.getPropertyValue('--muted-foreground');
        return {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            scales: {
                x: { stacked: true, ticks: { color: textMutedColor }, grid: { color: 'transparent' } },
                y: { stacked: true, ticks: { color: textMutedColor }, grid: { color: borderColor, drawTicks: false } }
            }
        };
    }

    // AppChart requires data, so the widget starts with a real object and swaps it once the DOM tokens are readable.
    const chartData = ref<ChartData>(buildData());
    const chartOptions = ref<ChartOptions>({ maintainAspectRatio: false, aspectRatio: 0.8 });
    const ready = computed(() => chartData.value.datasets.length > 0);

    function refresh(): void {
        chartData.value = buildData();
        chartOptions.value = buildOptions();
    }

    watch([() => layoutConfig.primary, () => layoutConfig.surface, () => layoutConfig.preset, isDarkTheme], refresh);
    onMounted(refresh);
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Revenue Stream</div>
        <AppChart v-if="ready" type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>
