// Browser APIs jsdom lacks. Reka UI's overlays and the sidebar composable touch them on mount.
class ResizeObserverStub {
    observe(): void {
        // no layout in jsdom
    }
    unobserve(): void {
        // no layout in jsdom
    }
    disconnect(): void {
        // no layout in jsdom
    }
}

// Embla (the vendored Carousel) constructs one in its slides-in-view plugin on init.
class IntersectionObserverStub {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds: readonly number[] = [];
    observe(): void {
        // no layout in jsdom
    }
    unobserve(): void {
        // no layout in jsdom
    }
    disconnect(): void {
        // no layout in jsdom
    }
    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
}

if (typeof window !== 'undefined') {
    if (!('ResizeObserver' in window)) {
        Object.defineProperty(window, 'ResizeObserver', { value: ResizeObserverStub, writable: true });
    }
    if (!('IntersectionObserver' in window)) {
        Object.defineProperty(window, 'IntersectionObserver', { value: IntersectionObserverStub, writable: true });
    }
    if (typeof window.matchMedia !== 'function') {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query: string): MediaQueryList =>
                ({
                    matches: false,
                    media: query,
                    onchange: null,
                    addListener: () => undefined,
                    removeListener: () => undefined,
                    addEventListener: () => undefined,
                    removeEventListener: () => undefined,
                    dispatchEvent: () => false
                }) as unknown as MediaQueryList
        });
    }
    if (typeof Element.prototype.scrollIntoView !== 'function') {
        Element.prototype.scrollIntoView = () => undefined;
    }
}
