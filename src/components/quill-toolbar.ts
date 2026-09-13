// Toolbar layout for QuillEditor. Lives outside the SFC because defineProps defaults may only
// reference imports, never locals of the same <script setup>.
export const DEFAULT_QUILL_TOOLBAR: unknown[] = [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link', 'image', 'code-block'],
    ['clean']
];
