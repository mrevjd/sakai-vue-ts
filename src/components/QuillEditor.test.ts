import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import QuillEditor from './QuillEditor.vue';

const { MockQuill } = vi.hoisted(() => {
    class MockQuill {
        static instances: MockQuill[] = [];
        root = document.createElement('div');
        handlers = new Map<string, () => void>();
        clipboard = { convert: vi.fn((input: { html: string }) => ({ ops: [{ insert: input.html }] })) };
        setContents = vi.fn();
        getText = vi.fn(() => 'plain text');
        enable = vi.fn();
        on = vi.fn((event: string, handler: () => void) => {
            this.handlers.set(event, handler);
        });
        off = vi.fn((event: string) => {
            this.handlers.delete(event);
        });
        constructor(
            public host: HTMLElement,
            public options: Record<string, unknown>
        ) {
            MockQuill.instances.push(this);
        }
    }
    return { MockQuill };
});

vi.mock('quill', () => ({ default: MockQuill }));

beforeEach(() => {
    MockQuill.instances.length = 0;
});

describe('QuillEditor', () => {
    it('creates a snow-themed Quill on its host element', () => {
        mount(QuillEditor, { props: { placeholder: 'Write' } });
        const instance = MockQuill.instances[0]!;
        expect(instance.host.tagName).toBe('DIV');
        expect(instance.options.theme).toBe('snow');
        expect(instance.options.readOnly).toBe(false);
        expect(instance.options.placeholder).toBe('Write');
    });

    it('loads the initial value through the clipboard converter, silently', () => {
        mount(QuillEditor, { props: { modelValue: '<p>Hi</p>' } });
        const instance = MockQuill.instances[0]!;
        expect(instance.clipboard.convert).toHaveBeenCalledWith({ html: '<p>Hi</p>' });
        expect(instance.setContents).toHaveBeenCalledWith({ ops: [{ insert: '<p>Hi</p>' }] }, 'silent');
    });

    it('emits the editor HTML on every text change', () => {
        const wrapper = mount(QuillEditor);
        const instance = MockQuill.instances[0]!;
        instance.root.innerHTML = '<p>Changed</p>';
        instance.handlers.get('text-change')!();
        expect(wrapper.emitted('update:modelValue')![0]).toEqual(['<p>Changed</p>']);
        expect(wrapper.emitted('text-change')![0]).toEqual([{ htmlValue: '<p>Changed</p>', textValue: 'plain text' }]);
    });

    it('applies external model changes and readonly toggles', async () => {
        const wrapper = mount(QuillEditor, { props: { modelValue: '' } });
        const instance = MockQuill.instances[0]!;
        await wrapper.setProps({ modelValue: '<p>External</p>' });
        expect(instance.setContents).toHaveBeenLastCalledWith({ ops: [{ insert: '<p>External</p>' }] }, 'silent');
        await wrapper.setProps({ readonly: true });
        expect(instance.enable).toHaveBeenCalledWith(false);
    });

    it('removes its listener on unmount', () => {
        const wrapper = mount(QuillEditor);
        const instance = MockQuill.instances[0]!;
        wrapper.unmount();
        expect(instance.off).toHaveBeenCalledWith('text-change', expect.any(Function));
    });
});
