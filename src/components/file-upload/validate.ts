export interface FileRule {
    accept?: string;
    maxFileSize?: number;
}

export interface RejectedFile {
    file: File;
    message: string;
}

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

// PrimeVue 4's formatSize verbatim (node_modules/primevue/fileupload/index.mjs, k = 1024, dm = 3,
// parseFloat drops trailing zeros), so the rejection message reads as it did before the migration.
export function formatSize(bytes: number): string {
    if (bytes <= 0) return '0 B';
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
    return `${parseFloat((bytes / 1024 ** exponent).toFixed(3))} ${UNITS[exponent]}`;
}

function matchesAccept(file: File, accept: string): boolean {
    const rules = accept
        .split(',')
        .map((rule) => rule.trim().toLowerCase())
        .filter(Boolean);
    if (rules.length === 0) return true;
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    return rules.some((rule) => {
        if (rule.startsWith('.')) return name.endsWith(rule);
        if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
        return type === rule;
    });
}

export function validateFiles(files: File[], rule: FileRule): { accepted: File[]; rejected: RejectedFile[] } {
    const accepted: File[] = [];
    const rejected: RejectedFile[] = [];
    for (const file of files) {
        if (rule.accept && !matchesAccept(file, rule.accept)) {
            rejected.push({ file, message: `${file.name}: Invalid file type, allowed file types: ${rule.accept}.` });
        } else if (rule.maxFileSize !== undefined && file.size > rule.maxFileSize) {
            rejected.push({ file, message: `${file.name}: Invalid file size, file size should be smaller than ${formatSize(rule.maxFileSize)}.` });
        } else {
            accepted.push(file);
        }
    }
    return { accepted, rejected };
}
