import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import FileUpload from './FileUpload.vue';

function file(name: string, type: string, size: number): File {
    return new File([new Uint8Array(size)], name, { type });
}

// jsdom has no createObjectURL; previews guard on it, and the stub keeps the code path exercised.
beforeEach(() => {
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() });
});

async function choose(wrapper: ReturnType<typeof mount>, files: File[]): Promise<void> {
    const input = wrapper.get('input[type=file]').element as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    await wrapper.get('input[type=file]').trigger('change');
    await nextTick();
}

type Exposed = { upload: () => void; clear: () => void };

describe('FileUpload', () => {
    it('lists accepted files, reports rejected ones, and uploads through the uploader event', async () => {
        const wrapper = mount(FileUpload, { props: { multiple: true, accept: 'image/*', maxFileSize: 1000 } });
        await choose(wrapper, [file('ok.png', 'image/png', 10), file('big.png', 'image/png', 5000), file('doc.pdf', 'application/pdf', 10)]);
        expect(wrapper.findAll('[data-slot=file-upload-file]').map((row) => row.text())).toEqual([expect.stringContaining('ok.png')]);
        expect(wrapper.findAll('[data-slot=file-upload-message]').map((m) => m.text())).toEqual(['big.png: Invalid file size, file size should be smaller than 1000 B.', 'doc.pdf: Invalid file type, allowed file types: image/*.']);
        expect((wrapper.emitted('select')![0]![0] as { files: File[] }).files.map((f) => f.name)).toEqual(['ok.png']);
        await wrapper.get('[data-slot=file-upload-upload]').trigger('click');
        expect((wrapper.emitted('uploader')![0]![0] as { files: File[] }).files.map((f) => f.name)).toEqual(['ok.png']);
        expect(wrapper.findAll('[data-slot=file-upload-file]')).toHaveLength(0);
    });

    it('removes a single file and clears all', async () => {
        const wrapper = mount(FileUpload, { props: { multiple: true } });
        await choose(wrapper, [file('a.txt', 'text/plain', 1), file('b.txt', 'text/plain', 1)]);
        await wrapper.findAll('[aria-label="Remove a.txt"]')[0]!.trigger('click');
        expect(wrapper.emitted('remove')![0]![0]).toMatchObject({ file: expect.objectContaining({ name: 'a.txt' }) });
        expect(wrapper.findAll('[data-slot=file-upload-file]')).toHaveLength(1);
        await wrapper.get('[data-slot=file-upload-cancel]').trigger('click');
        expect(wrapper.emitted('clear')).toHaveLength(1);
        expect(wrapper.findAll('[data-slot=file-upload-file]')).toHaveLength(0);
    });

    it('uploads on select when auto is set', async () => {
        const wrapper = mount(FileUpload, { props: { auto: true } });
        await choose(wrapper, [file('a.txt', 'text/plain', 1)]);
        expect(wrapper.emitted('uploader')).toHaveLength(1);
    });

    it('basic mode shows the chosen name and uploads from the exposed method', async () => {
        const wrapper = mount(FileUpload, { props: { mode: 'basic' } });
        expect(wrapper.find('[data-slot=file-upload-upload]').exists()).toBe(false);
        await choose(wrapper, [file('a.txt', 'text/plain', 1)]);
        expect(wrapper.get('[data-slot=file-upload-basic-name]').text()).toBe('a.txt');
        (wrapper.vm as unknown as Exposed).upload();
        expect(wrapper.emitted('uploader')).toHaveLength(1);
    });

    it('accepts files dropped on the content area', async () => {
        const wrapper = mount(FileUpload, { props: { multiple: true } });
        const zone = wrapper.get('[data-slot=file-upload-content]');
        const dropped = file('drop.txt', 'text/plain', 1);
        const transfer = { files: [dropped], types: ['Files'], items: [] } as unknown as DataTransfer;
        await zone.trigger('dragenter', { dataTransfer: transfer });
        await zone.trigger('drop', { dataTransfer: transfer });
        await nextTick();
        expect(wrapper.findAll('[data-slot=file-upload-file]').map((row) => row.text())).toEqual([expect.stringContaining('drop.txt')]);
    });
});
