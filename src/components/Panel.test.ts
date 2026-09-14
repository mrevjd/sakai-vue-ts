import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Panel from './Panel.vue';

describe('Panel', () => {
    it('renders the header and content and toggles when toggleable', async () => {
        const wrapper = mount(Panel, { props: { header: 'Header', toggleable: true }, slots: { default: 'Body text' } });
        expect(wrapper.get('[data-slot=panel-header]').text()).toContain('Header');
        expect(wrapper.get('[data-slot=panel-content]').isVisible()).toBe(true);
        await wrapper.get('[aria-label="Collapse Header"]').trigger('click');
        expect(wrapper.emitted('update:collapsed')!.at(-1)).toEqual([true]);
        await wrapper.setProps({ collapsed: true });
        expect(wrapper.find('[data-slot=panel-content]').exists()).toBe(false);
    });

    it('shows no toggle when not toggleable', () => {
        expect(
            mount(Panel, { props: { header: 'Plain' } })
                .find('button')
                .exists()
        ).toBe(false);
    });
});
