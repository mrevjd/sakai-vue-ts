import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, reactive } from 'vue';
import AppChart from './AppChart.vue';

const { MockChart } = vi.hoisted(() => {
    class MockChart {
        static register = vi.fn();
        static instances: MockChart[] = [];
        data: unknown;
        options: Record<string, unknown>;
        destroy = vi.fn();
        // Real chart.js writes fresh `scales`/`plugins` objects onto the options it is handed, at
        // construction and on every update(); the mock mirrors that so a reactive proxy would loop.
        update = vi.fn(() => {
            this.options.scales = {};
        });
        constructor(
            public canvas: HTMLCanvasElement,
            public config: { type: string; data: unknown; options?: Record<string, unknown> }
        ) {
            this.data = config.data;
            this.options = config.options ?? {};
            this.options.scales = {};
            MockChart.instances.push(this);
        }
    }
    return { MockChart };
});

vi.mock('chart.js', () => ({ Chart: MockChart, registerables: [] }));

const data = { labels: ['a', 'b'], datasets: [{ label: 'Sales', data: [1, 2] }] };

beforeEach(() => {
    MockChart.instances.length = 0;
});

describe('AppChart', () => {
    it('creates one chart on its canvas with the given type and data', () => {
        mount(AppChart, { props: { type: 'bar', data } });
        expect(MockChart.instances).toHaveLength(1);
        const instance = MockChart.instances[0]!;
        expect(instance.canvas.tagName).toBe('CANVAS');
        expect(instance.config.type).toBe('bar');
        // Vue hands components a readonly proxy of the prop, so compare by value.
        expect(instance.config.data).toEqual(data);
    });

    it('pushes new data and options into the chart and calls update', async () => {
        const wrapper = mount(AppChart, { props: { type: 'line', data } });
        const next = { labels: ['c'], datasets: [{ label: 'Sales', data: [3] }] };
        await wrapper.setProps({ data: next, options: { responsive: false } });
        const instance = MockChart.instances[0]!;
        expect(instance.update).toHaveBeenCalledTimes(1);
        expect(instance.data).toEqual(next);
        // The mock, like chart.js, adds its own `scales` key, so match on what the parent passed.
        expect(instance.options).toMatchObject({ responsive: false });
    });

    it('updates once per parent change when data and options are reactive', async () => {
        const reactiveData = reactive({ labels: ['a'], datasets: [{ label: 'Sales', data: [1] }] });
        const options = reactive({ plugins: { legend: { display: true } } });
        mount(AppChart, { props: { type: 'bar', data: reactiveData, options } });
        options.plugins.legend.display = false;
        await nextTick();
        await nextTick();
        expect(MockChart.instances[0]!.update).toHaveBeenCalledTimes(1);
    });

    it('destroys the chart when unmounted', () => {
        const wrapper = mount(AppChart, { props: { type: 'pie', data } });
        wrapper.unmount();
        expect(MockChart.instances[0]!.destroy).toHaveBeenCalledTimes(1);
    });
});
