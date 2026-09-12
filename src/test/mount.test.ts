import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/button';

describe('test harness', () => {
    it('mounts a shadcn-vue component under jsdom', () => {
        const wrapper = mount(Button, { slots: { default: 'Go' } });
        expect(wrapper.text()).toBe('Go');
        expect(wrapper.attributes('data-slot')).toBe('button');
    });
});
