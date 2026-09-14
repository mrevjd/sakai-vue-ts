import { ref, type Ref } from 'vue';

// Click selects, ctrl or meta toggles, shift selects the range from the last plain click; the same rules PrimeVue's lists use.
export function useListSelection(): { selected: Ref<string[]>; onItemClick: (event: MouseEvent | KeyboardEvent, key: string, orderedKeys: string[]) => void; clear: () => void; isSelected: (key: string) => boolean } {
    const selected = ref<string[]>([]);
    let anchor: string | null = null;

    function onItemClick(event: MouseEvent | KeyboardEvent, key: string, orderedKeys: string[]): void {
        if (event.shiftKey && anchor !== null) {
            const start = orderedKeys.indexOf(anchor);
            const end = orderedKeys.indexOf(key);
            if (start >= 0 && end >= 0) {
                const [low, high] = start < end ? [start, end] : [end, start];
                selected.value = orderedKeys.slice(low, high + 1);
                return;
            }
        }
        if (event.ctrlKey || event.metaKey) {
            selected.value = selected.value.includes(key) ? selected.value.filter((k) => k !== key) : [...selected.value, key];
        } else {
            selected.value = [key];
        }
        anchor = key;
    }

    return { selected, onItemClick, clear: () => (selected.value = []), isSelected: (key) => selected.value.includes(key) };
}
