import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppChart from './AppChart.vue';

const { MockChart } = vi.hoisted(() => {
    class MockChart {
        static register = vi.fn();
        static instances: MockChart[] = [];
        data: unknown;
        options: unknown;
        update = vi.fn();
        destroy = vi.fn();
        constructor(
            public canvas: HTMLCanvasElement,
            public config: { type: string; data: unknown; options?: unknown }
        ) {
            this.data = config.data;
            this.options = config.options;
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
        expect(instance.options).toEqual({ responsive: false });
    });

    it('destroys the chart when unmounted', () => {
        const wrapper = mount(AppChart, { props: { type: 'pie', data } });
        wrapper.unmount();
        expect(MockChart.instances[0]!.destroy).toHaveBeenCalledTimes(1);
    });
});
