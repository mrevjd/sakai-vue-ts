import { themeVars, type ThemeInput } from '@/utils/theme';

// Inline custom properties on <html> beat the static :root and .dark blocks in tailwind.css,
// which stay only as the pre-hydration fallback.
export function applyTheme(input: ThemeInput): void {
    if (typeof document === 'undefined') return;
    const style = document.documentElement.style;
    for (const [token, value] of Object.entries(themeVars(input))) {
        style.setProperty(token, value);
    }
}
