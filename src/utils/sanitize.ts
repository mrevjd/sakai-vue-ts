import DOMPurify from 'dompurify';

const QUILL_ALLOWED_TAGS = [
    'p', 'br', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'u', 's', 'sub', 'sup',
    'blockquote', 'pre', 'code',
    'ol', 'ul', 'li',
    'a',
    'img'
];

const QUILL_ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'class', 'style'];

export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: QUILL_ALLOWED_TAGS,
        ALLOWED_ATTR: QUILL_ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false
    });
}
