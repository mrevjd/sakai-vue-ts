export type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong';

// PrimeVue's Password defaults, kept so a derived project's meter reads the same as before the migration.
const MEDIUM = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

export function passwordStrength(value: string): PasswordStrength {
    if (value.length === 0) return 'none';
    if (STRONG.test(value)) return 'strong';
    if (MEDIUM.test(value)) return 'medium';
    return 'weak';
}
