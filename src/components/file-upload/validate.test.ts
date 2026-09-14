import { describe, expect, it } from 'vitest';
import { formatSize, validateFiles } from './validate';

function file(name: string, type: string, size: number): File {
    return new File([new Uint8Array(size)], name, { type });
}

describe('validateFiles', () => {
    it('rejects files over maxFileSize with a sized message', () => {
        const big = file('photo.png', 'image/png', 2_000_000);
        const result = validateFiles([big], { maxFileSize: 1_048_576 });
        expect(result.accepted).toEqual([]);
        expect(result.rejected[0]!.message).toBe('photo.png: Invalid file size, file size should be smaller than 1 MB.');
    });

    it('rejects files outside accept, matching wildcards, mime types and extensions', () => {
        const pdf = file('cv.pdf', 'application/pdf', 10);
        const png = file('a.png', 'image/png', 10);
        expect(validateFiles([pdf, png], { accept: 'image/*' }).rejected.map((r) => r.file.name)).toEqual(['cv.pdf']);
        expect(validateFiles([pdf, png], { accept: '.pdf' }).accepted.map((f) => f.name)).toEqual(['cv.pdf']);
        expect(validateFiles([pdf, png], { accept: 'image/png, application/pdf' }).rejected).toEqual([]);
        expect(validateFiles([pdf], { accept: 'image/*' }).rejected[0]!.message).toBe('cv.pdf: Invalid file type, allowed file types: image/*.');
    });

    it('accepts everything without limits', () => {
        const result = validateFiles([file('a', '', 5)], {});
        expect(result.accepted).toHaveLength(1);
        expect(result.rejected).toEqual([]);
    });

    it('formats sizes the way PrimeVue did: base 1024, up to three decimals, trailing zeros dropped', () => {
        expect(formatSize(0)).toBe('0 B');
        expect(formatSize(1000)).toBe('1000 B');
        expect(formatSize(1024)).toBe('1 KB');
        expect(formatSize(1_000_000)).toBe('976.563 KB');
        expect(formatSize(1_500_000)).toBe('1.431 MB');
    });
});
