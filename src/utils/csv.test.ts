import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadCsv, toCsv } from './csv';

const columns = [
    { key: 'name', header: 'Name' },
    { key: 'price', header: 'Price' }
];

describe('toCsv', () => {
    it('writes a header row then one CRLF-separated line per row', () => {
        expect(toCsv([{ name: 'Bamboo Watch', price: 65 }], columns)).toBe('Name,Price\r\nBamboo Watch,65');
    });

    it('returns only the header when there are no rows', () => {
        expect(toCsv([], columns)).toBe('Name,Price');
    });

    it('quotes cells containing commas, quotes or line breaks and doubles inner quotes', () => {
        expect(toCsv([{ name: 'Black "Onyx", 2nd\nedition', price: 1 }], columns)).toBe('Name,Price\r\n"Black ""Onyx"", 2nd\nedition",1');
    });

    it('escapes headers the same way', () => {
        expect(toCsv([], [{ key: 'p', header: 'Price, USD' }])).toBe('"Price, USD"');
    });

    it('neutralises strings that a spreadsheet would evaluate as formulas', () => {
        expect(toCsv([{ name: '=SUM(A1)', price: 1 }], columns)).toBe("Name,Price\r\n'=SUM(A1),1");
        expect(toCsv([{ name: '+1', price: 1 }], columns)).toBe("Name,Price\r\n'+1,1");
        expect(toCsv([{ name: '-1', price: 1 }], columns)).toBe("Name,Price\r\n'-1,1");
        expect(toCsv([{ name: '@cmd', price: 1 }], columns)).toBe("Name,Price\r\n'@cmd,1");
        expect(toCsv([{ name: '\tcmd', price: 1 }], columns)).toBe("Name,Price\r\n'\tcmd,1");
        expect(toCsv([{ name: '\rcmd', price: 1 }], columns)).toBe('Name,Price\r\n"\'\rcmd",1');
    });

    it('leaves negative numbers untouched', () => {
        expect(toCsv([{ name: 'x', price: -5 }], columns)).toBe('Name,Price\r\nx,-5');
    });

    it('renders null and undefined as empty cells', () => {
        expect(toCsv([{ name: null, price: undefined }], columns)).toBe('Name,Price\r\n,');
    });

    it('renders dates as ISO strings and other objects as JSON', () => {
        const when = new Date(Date.UTC(2026, 8, 12, 10, 0, 0));
        expect(toCsv([{ name: when, price: { a: 1 } }], columns)).toBe('Name,Price\r\n2026-09-12T10:00:00.000Z,"{""a"":1}"');
    });
});

describe('downloadCsv', () => {
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;

    afterEach(() => {
        URL.createObjectURL = originalCreate;
        URL.revokeObjectURL = originalRevoke;
        vi.restoreAllMocks();
    });

    it('creates a text/csv object URL, clicks a download link and revokes the URL', () => {
        const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:csv');
        const revokeObjectURL = vi.fn();
        URL.createObjectURL = createObjectURL as unknown as typeof URL.createObjectURL;
        URL.revokeObjectURL = revokeObjectURL as unknown as typeof URL.revokeObjectURL;
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

        downloadCsv('products.csv', 'Name\r\nx');

        expect(createObjectURL).toHaveBeenCalledTimes(1);
        const blob = createObjectURL.mock.calls[0]![0] as Blob;
        expect(blob.type).toBe('text/csv;charset=utf-8');
        expect(click).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:csv');
        expect(document.querySelector('a[download="products.csv"]')).toBeNull();
    });
});
