<script lang="ts">
    import { Chart, registerables } from 'chart.js';

    // Module scope so registration runs once, not once per mounted instance.
    Chart.register(...registerables);
</script>

<script setup lang="ts">
    import type { ChartData, ChartOptions, ChartType, Plugin } from 'chart.js';
    import { onBeforeUnmount, onMounted, ref, toRaw, watch, type HTMLAttributes } from 'vue';

    const props = defineProps<{
        type: ChartType;
        data: ChartData;
        options?: ChartOptions;
        plugins?: Plugin[];
        class?: HTMLAttributes['class'];
    }>();

    const canvas = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;

    // chart.js writes into the objects it is given: fresh `plugins` and `scales` on options at
    // construction and on every update(), and bookkeeping on the data arrays. Handing it a reactive
    // proxy would make each update() re-fire the deep watcher below, so it gets the raw data and a
    // shallow copy of the raw options that absorbs those top-level writes.
    function rawData(): ChartData {
        return toRaw(props.data);
    }
    function rawOptions(): ChartOptions {
        return { ...toRaw(props.options ?? {}) };
    }

    onMounted(() => {
        if (!canvas.value) return;
        chart = new Chart(canvas.value, { type: props.type, data: rawData(), options: rawOptions(), plugins: props.plugins });
    });

    watch(
        () => [props.data, props.options],
        () => {
            if (!chart) return;
            chart.data = rawData();
            chart.options = rawOptions();
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
