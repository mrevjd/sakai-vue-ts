export interface CsvColumn {
    key: string;
    header: string;
}

const NEEDS_QUOTES = /[",\r\n]/;
// A leading = + - @ or control character makes spreadsheets evaluate the cell (CSV injection).
const FORMULA_LEAD = /^[=+\-@\t\r]/;

function serialise(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

function escapeCell(text: string): string {
    return NEEDS_QUOTES.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function cell(value: unknown): string {
    const text = serialise(value);
    const guarded = typeof value === 'string' && FORMULA_LEAD.test(text) ? `'${text}` : text;
    return escapeCell(guarded);
}

export function toCsv(rows: ReadonlyArray<Record<string, unknown>>, columns: ReadonlyArray<CsvColumn>): string {
    const header = columns.map((column) => escapeCell(column.header)).join(',');
    const lines = rows.map((row) => columns.map((column) => cell(row[column.key])).join(','));
    return [header, ...lines].join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
    // The BOM makes Excel read the file as UTF-8, which is what PrimeVue's exportCSV did.
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}
