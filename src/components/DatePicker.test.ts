import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import DatePicker from './DatePicker.vue';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('DatePicker', () => {
    it('shows the placeholder, then the formatted date', async () => {
        const wrapper = mount(DatePicker, { props: { modelValue: null, placeholder: 'mm/dd/yyyy' } });
        expect(wrapper.get('[data-slot=date-picker-trigger]').text()).toBe('mm/dd/yyyy');
        await wrapper.setProps({ modelValue: new Date(2020, 4, 6) });
        expect(wrapper.get('[data-slot=date-picker-trigger]').text()).toBe('05/06/2020');
        await wrapper.setProps({ dateFormat: 'dd M yy' });
        expect(wrapper.get('[data-slot=date-picker-trigger]').text()).toBe('06 May 2020');
    });

    it('emits today from the button bar and null from clear', async () => {
        const wrapper = mount(DatePicker, { props: { modelValue: new Date(2020, 4, 6), showButtonBar: true }, attachTo: document.body });
        await wrapper.get('[data-slot=date-picker-trigger]').trigger('click');
        await nextTick();
        document.body.querySelector<HTMLButtonElement>('[data-slot=date-picker-today]')!.click();
        await nextTick();
        const emitted = wrapper.emitted('update:modelValue')!.at(-1)![0] as Date;
        expect(emitted.toDateString()).toBe(new Date().toDateString());
        await wrapper.get('[data-slot=date-picker-trigger]').trigger('click');
        await nextTick();
        document.body.querySelector<HTMLButtonElement>('[data-slot=date-picker-clear]')!.click();
        await nextTick();
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([null]);
        wrapper.unmount();
    });

    it('renders the calendar inline without a trigger', () => {
        const wrapper = mount(DatePicker, { props: { modelValue: null, inline: true } });
        expect(wrapper.find('[data-slot=date-picker-trigger]').exists()).toBe(false);
        expect(wrapper.find('[data-slot=calendar]').exists()).toBe(true);
    });
});
