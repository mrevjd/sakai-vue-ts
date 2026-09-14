import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { IconHome } from '@/components/icons';
import AppBreadcrumb from './AppBreadcrumb.vue';

const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }] });

describe('AppBreadcrumb', () => {
    it('renders the home link, intermediate items and the current page last', () => {
        const wrapper = mount(AppBreadcrumb, { props: { home: { icon: IconHome, to: '/' }, model: [{ label: 'Computer' }, { label: 'Notebook' }, { label: 'Item' }] }, global: { plugins: [router] } });
        expect(wrapper.get('[data-testid=breadcrumb-home] a').attributes('href')).toBe('/');
        expect(wrapper.findAll('[data-slot=breadcrumb-item]').map((i) => i.text())).toEqual(['', 'Computer', 'Notebook', 'Item']);
        expect(wrapper.get('[aria-current=page]').text()).toBe('Item');
        expect(wrapper.findAll('[data-slot=breadcrumb-separator]')).toHaveLength(3);
    });
});
