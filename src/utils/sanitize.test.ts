import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
    it('preserves allowed formatting tags and attributes', () => {
        const input = '<p>Hello <strong>world</strong> <em>now</em></p>';
        expect(sanitizeHtml(input)).toBe(input);
    });

    it('keeps allowed links with their href/target/rel', () => {
        const input = '<a href="https://example.com" target="_blank" rel="noopener">link</a>';
        const out = sanitizeHtml(input);
        expect(out).toContain('href="https://example.com"');
        expect(out).toContain('target="_blank"');
        expect(out).toContain('rel="noopener"');
    });

    it('strips <script> tags entirely', () => {
        const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>');
        expect(out).toContain('<p>ok</p>');
        expect(out).not.toContain('<script');
        expect(out).not.toContain('alert(1)');
    });

    it('removes inline event-handler attributes (XSS vector)', () => {
        const out = sanitizeHtml('<img src="x" onerror="alert(1)" />');
        expect(out).not.toContain('onerror');
        expect(out).not.toContain('alert(1)');
    });

    it('drops javascript: URIs from hrefs', () => {
        const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
        expect(out).not.toContain('javascript:');
        expect(out).not.toContain('alert(1)');
    });

    it('strips disallowed tags such as <iframe>', () => {
        const out = sanitizeHtml('<iframe src="https://evil.example"></iframe><p>safe</p>');
        expect(out).not.toContain('<iframe');
        expect(out).toContain('<p>safe</p>');
    });

    it('removes data-* attributes (ALLOW_DATA_ATTR is false)', () => {
        const out = sanitizeHtml('<span data-payload="evil">x</span>');
        expect(out).not.toContain('data-payload');
        expect(out).toContain('x');
    });
});
