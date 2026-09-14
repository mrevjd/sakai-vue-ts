const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// PrimeVue's dateFormat grammar (jQuery UI lineage): yy is the four-digit year, y two digits;
// doubled letters pad or spell out; single quotes wrap literal text.
export function formatDate(date: Date | null | undefined, format: string): string {
    if (!date) return '';
    const pad = (n: number): string => String(n).padStart(2, '0');
    let out = '';
    let i = 0;
    while (i < format.length) {
        const char = format[i]!;
        if (char === "'") {
            const end = format.indexOf("'", i + 1);
            out += end === -1 ? format.slice(i + 1) : format.slice(i + 1, end);
            i = end === -1 ? format.length : end + 1;
            continue;
        }
        const doubled = format[i + 1] === char;
        switch (char) {
            case 'd':
                out += doubled ? pad(date.getDate()) : String(date.getDate());
                break;
            case 'D':
                out += doubled ? DAY_LONG[date.getDay()] : DAY_SHORT[date.getDay()];
                break;
            case 'm':
                out += doubled ? pad(date.getMonth() + 1) : String(date.getMonth() + 1);
                break;
            case 'M':
                out += doubled ? MONTH_LONG[date.getMonth()] : MONTH_SHORT[date.getMonth()];
                break;
            case 'y':
                out += doubled ? String(date.getFullYear()) : String(date.getFullYear()).slice(-2);
                break;
            default:
                out += char;
                i += 1;
                continue;
        }
        i += doubled ? 2 : 1;
    }
    return out;
}
