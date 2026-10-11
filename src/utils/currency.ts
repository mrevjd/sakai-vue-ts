// One currency formatter for every page: three copies with two different null behaviours existed before.
export function formatCurrency(value: number | null | undefined, currency = 'USD'): string {
    if (value === null || value === undefined) return '';
    return value.toLocaleString('en-US', { style: 'currency', currency });
}
