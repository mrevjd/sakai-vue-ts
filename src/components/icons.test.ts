import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { Component } from 'vue';
import * as icons from './icons';

describe('icon map', () => {
    it('re-exports only components, each rendering an svg', () => {
        const names = Object.keys(icons);
        expect(names.length).toBeGreaterThan(50);
        for (const name of names) {
            expect(name.startsWith('Icon'), `${name} is not prefixed`).toBe(true);
            const wrapper = mount(icons[name as keyof typeof icons] as Component, { props: { class: 'size-5' } });
            expect(wrapper.element.tagName.toLowerCase(), `${name} did not render an svg`).toBe('svg');
        }
    });
});
