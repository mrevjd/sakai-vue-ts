import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Message from './Message.vue';

describe('Message', () => {
    it('maps severity to the alert variant and renders the text', () => {
        const wrapper = mount(Message, { props: { severity: 'warn' }, slots: { default: 'Warn Message' } });
        expect(wrapper.get('[data-slot=alert]').attributes('data-variant')).toBe('warning');
        expect(wrapper.text()).toContain('Warn Message');
        expect(
            mount(Message, { props: { severity: 'error' } })
                .get('[data-slot=alert]')
                .attributes('data-variant')
        ).toBe('destructive');
    });

    it('closes from its button and emits close', async () => {
        const wrapper = mount(Message, { props: { severity: 'info', closable: true }, slots: { default: 'Info' } });
        await wrapper.get('[aria-label="Close"]').trigger('click');
        expect(wrapper.emitted('close')).toHaveLength(1);
        expect(wrapper.find('[data-slot=alert]').exists()).toBe(false);
    });
});
