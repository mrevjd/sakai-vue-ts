<script setup lang="ts">
    import type { ChartData, ChartOptions } from 'chart.js';
    import { onMounted, ref, watch } from 'vue';
    import AppChart from '@/components/AppChart.vue';
    import { useLayout } from '@/layout/composables/layout';
    import { chartShade, paletteShade } from '@/utils/chartColors';
    import type { Shade } from '@/layout/palettes';

    const { layoutConfig, isDarkTheme } = useLayout();

    function primary(key: Shade): string {
        return chartShade(layoutConfig.primary, layoutConfig.surface, isDarkTheme.value ? 'dark' : 'light', key);
    }

    function buildLineData(): ChartData {
        return {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'First Dataset',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    backgroundColor: primary('500'),
                    borderColor: primary('500'),
                    tension: 0.4
                },
                {
                    label: 'Second Dataset',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    fill: false,
                    backgroundColor: primary('200'),
                    borderColor: primary('200'),
                    tension: 0.4
                }
            ]
        };
    }

    function buildLineOptions(): ChartOptions {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--foreground');
        const textColorSecondary = documentStyle.getPropertyValue('--muted-foreground');
        const surfaceBorder = documentStyle.getPropertyValue('--border');
        // chart.js 4 ignores `drawBorder` and reads `color` rather than `fontColor`, but correcting the
        // showcase options is out of scope for a port, so both keys stay as the PrimeVue page had them.
        // The cast is what carries the two dead keys past the compiler.
        return {
            plugins: {
                legend: {
                    labels: {
                        fontColor: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        } as ChartOptions;
    }

    function buildBarData(): ChartData {
        return {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'My First dataset',
                    backgroundColor: primary('500'),
                    borderColor: primary('500'),
                    data: [65, 59, 80, 81, 56, 55, 40]
                },
                {
                    label: 'My Second dataset',
                    backgroundColor: primary('200'),
                    borderColor: primary('200'),
                    data: [28, 48, 40, 19, 86, 27, 90]
                }
            ]
        };
    }

    function buildBarOptions(): ChartOptions {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--foreground');
        const textColorSecondary = documentStyle.getPropertyValue('--muted-foreground');
        const surfaceBorder = documentStyle.getPropertyValue('--border');
        // See buildLineOptions: `fontColor` and `drawBorder` are kept as the PrimeVue page had them.
        return {
            plugins: {
                legend: {
                    labels: {
                        fontColor: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        } as ChartOptions;
    }

    function buildPieData(): ChartData {
        return {
            labels: ['A', 'B', 'C'],
            datasets: [
                {
                    data: [540, 325, 702],
                    backgroundColor: [paletteShade('indigo', '500'), paletteShade('purple', '500'), paletteShade('teal', '500')],
                    hoverBackgroundColor: [paletteShade('indigo', '400'), paletteShade('purple', '400'), paletteShade('teal', '400')]
                }
            ]
        };
    }

    function buildPieOptions(): ChartOptions {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground');
        return {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
    }

    function buildPolarData(): ChartData {
        return {
            datasets: [
                {
                    data: [11, 16, 7, 3],
                    backgroundColor: [paletteShade('indigo', '500'), paletteShade('purple', '500'), paletteShade('teal', '500'), paletteShade('orange', '500')],
                    label: 'My dataset'
                }
            ],
            labels: ['Indigo', 'Purple', 'Teal', 'Orange']
        };
    }

    function buildPolarOptions(): ChartOptions {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--foreground');
        const surfaceBorder = documentStyle.getPropertyValue('--border');
        return {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                r: {
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        };
    }

    function buildRadarData(): ChartData {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground');
        return {
            labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
            datasets: [
                {
                    label: 'My First dataset',
                    borderColor: paletteShade('indigo', '400'),
                    pointBackgroundColor: paletteShade('indigo', '400'),
                    pointBorderColor: paletteShade('indigo', '400'),
                    pointHoverBackgroundColor: textColor,
                    pointHoverBorderColor: paletteShade('indigo', '400'),
                    data: [65, 59, 90, 81, 56, 55, 40]
                },
                {
                    label: 'My Second dataset',
                    borderColor: paletteShade('purple', '400'),
                    pointBackgroundColor: paletteShade('purple', '400'),
                    pointBorderColor: paletteShade('purple', '400'),
                    pointHoverBackgroundColor: textColor,
                    pointHoverBorderColor: paletteShade('purple', '400'),
                    data: [28, 48, 40, 19, 96, 27, 100]
                }
            ]
        };
    }

    function buildRadarOptions(): ChartOptions {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--foreground');
        const textColorSecondary = documentStyle.getPropertyValue('--muted-foreground');
        // See buildLineOptions: `fontColor` is kept as the PrimeVue page had it.
        return {
            plugins: {
                legend: {
                    labels: {
                        fontColor: textColor
                    }
                }
            },
            scales: {
                r: {
                    grid: {
                        color: textColorSecondary
                    }
                }
            }
        } as ChartOptions;
    }

    // AppChart requires data, so each ref starts with a real object and is reassigned once the DOM tokens are readable.
    const lineData = ref<ChartData>(buildLineData());
    const lineOptions = ref<ChartOptions>(buildLineOptions());
    const barData = ref<ChartData>(buildBarData());
    const barOptions = ref<ChartOptions>(buildBarOptions());
    const pieData = ref<ChartData>(buildPieData());
    const pieOptions = ref<ChartOptions>(buildPieOptions());
    const polarData = ref<ChartData>(buildPolarData());
    const polarOptions = ref<ChartOptions>(buildPolarOptions());
    const radarData = ref<ChartData>(buildRadarData());
    const radarOptions = ref<ChartOptions>(buildRadarOptions());

    function refresh(): void {
        lineData.value = buildLineData();
        lineOptions.value = buildLineOptions();
        barData.value = buildBarData();
        barOptions.value = buildBarOptions();
        pieData.value = buildPieData();
        pieOptions.value = buildPieOptions();
        polarData.value = buildPolarData();
        polarOptions.value = buildPolarOptions();
        radarData.value = buildRadarData();
        radarOptions.value = buildRadarOptions();
    }

    watch([() => layoutConfig.primary, () => layoutConfig.surface, () => layoutConfig.preset, isDarkTheme], refresh);
    onMounted(refresh);
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 xl:col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Linear</div>
                <AppChart type="line" :data="lineData" :options="lineOptions" class="h-80" />
            </div>
        </div>
        <div class="col-span-12 xl:col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Bar</div>
                <AppChart type="bar" :data="barData" :options="barOptions" class="h-80" />
            </div>
        </div>
        <div class="col-span-12 xl:col-span-6">
            <div class="card flex flex-col items-center">
                <div class="font-semibold text-xl mb-4">Pie</div>
                <AppChart type="pie" :data="pieData" :options="pieOptions" class="h-80" />
            </div>
        </div>
        <div class="col-span-12 xl:col-span-6">
            <div class="card flex flex-col items-center">
                <div class="font-semibold text-xl mb-4">Doughnut</div>
                <AppChart type="doughnut" :data="pieData" :options="pieOptions" class="h-80" />
            </div>
        </div>
        <div class="col-span-12 xl:col-span-6">
            <div class="card flex flex-col items-center">
                <div class="font-semibold text-xl mb-4">Polar Area</div>
                <AppChart type="polarArea" :data="polarData" :options="polarOptions" class="h-80" />
            </div>
        </div>
        <div class="col-span-12 xl:col-span-6">
            <div class="card flex flex-col items-center">
                <div class="font-semibold text-xl mb-4">Radar</div>
                <AppChart type="radar" :data="radarData" :options="radarOptions" class="h-80" />
            </div>
        </div>
    </div>
</template>
