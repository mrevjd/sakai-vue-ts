<script setup lang="ts">
    import { Chart, registerables, type ChartData, type ChartOptions, type ChartType, type Plugin } from 'chart.js';
    import { onBeforeUnmount, onMounted, ref, watch, type HTMLAttributes } from 'vue';

    Chart.register(...registerables);

    const props = defineProps<{
        type: ChartType;
        data: ChartData;
        options?: ChartOptions;
        plugins?: Plugin[];
        class?: HTMLAttributes['class'];
    }>();

    const canvas = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;

    onMounted(() => {
        if (!canvas.value) return;
        chart = new Chart(canvas.value, { type: props.type, data: props.data, options: props.options, plugins: props.plugins });
    });

    watch(
        () => [props.data, props.options],
        () => {
            if (!chart) return;
            chart.data = props.data;
            chart.options = props.options ?? {};
            chart.update();
        },
        { deep: true }
    );

    onBeforeUnmount(() => {
        chart?.destroy();
        chart = null;
    });

    defineExpose({ getChart: () => chart });
</script>

<template>
    <div :class="props.class" data-slot="chart">
        <canvas ref="canvas" />
    </div>
</template>
