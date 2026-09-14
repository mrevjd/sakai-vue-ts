import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import AutoComplete from './AutoComplete.vue';

const countries = [
    { name: 'Australia', code: 'AU' },
    { name: 'Austria', code: 'AT' }
];

afterEach(() => {
    document.body.innerHTML = '';
});

describe('AutoComplete', () => {
    it('emits complete with the typed query and lists the suggestions the parent supplies', async () => {
        const wrapper = mount(AutoComplete, { props: { modelValue: [], suggestions: [], optionLabel: 'name', multiple: true, placeholder: 'Search' }, attachTo: document.body });
        await wrapper.get('input').setValue('au');
        expect(wrapper.emitted('complete')!.at(-1)).toEqual([{ query: 'au' }]);
        await wrapper.setProps({ suggestions: countries });
        await nextTick();
        const options = Array.from(document.body.querySelectorAll<HTMLElement>('[role=option]'));
        expect(options.map((o) => o.textContent?.trim())).toEqual(['Australia', 'Austria']);
        options[1]!.click();
        await nextTick();
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([[countries[1]]]);
        wrapper.unmount();
    });

    it('renders chips for a multiple value and removes one from its button', async () => {
        const wrapper = mount(AutoComplete, { props: { modelValue: countries, suggestions: [], optionLabel: 'name', multiple: true, display: 'chip' } });
        expect(wrapper.findAll('[data-slot=auto-complete-chip]').map((c) => c.text())).toEqual(['Australia', 'Austria']);
        await wrapper.findAll('[aria-label="Remove Australia"]')[0]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([[countries[1]]]);
    });

    it('shows the dropdown button only when asked', () => {
        expect(
            mount(AutoComplete, { props: { modelValue: null, suggestions: [] } })
                .find('[data-slot=auto-complete-dropdown]')
                .exists()
        ).toBe(false);
        expect(
            mount(AutoComplete, { props: { modelValue: null, suggestions: [], dropdown: true } })
                .find('[data-slot=auto-complete-dropdown]')
                .exists()
        ).toBe(true);
    });
});
