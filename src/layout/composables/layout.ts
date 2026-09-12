/// <reference lib="dom" />
import type { ComputedRef } from 'vue';
import { computed, onMounted, reactive, watch } from 'vue';
import { applyTheme } from '@/layout/composables/theme';
import { syncPrimeVueTheme } from '@/layout/composables/primevueBridge';
import { parseLayoutConfig, type LayoutConfig, type MenuMode } from '@/utils/layoutConfig';

const STORAGE_KEY = 'layoutConfig';
const DARK_CLASS = 'dark';

interface LayoutState {
    staticMenuInactive: boolean;
    overlayMenuActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    mobileMenuActive: boolean;
    sidebarExpanded: boolean;
    menuHoverActive: boolean;
    activeMenuItem: unknown;
    activePath: string | null;
    anchored: boolean;
}

function readStoredConfig(): string | null {
    // Storage can be disabled or throw in private modes; a missing value is not an error.
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

export const layoutConfig = reactive<LayoutConfig>(parseLayoutConfig(readStoredConfig()));

const layoutState = reactive<LayoutState>({
    staticMenuInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    mobileMenuActive: false,
    sidebarExpanded: false,
    menuHoverActive: false,
    activeMenuItem: null,
    activePath: null,
    anchored: false
});

watch(
    layoutConfig,
    (config) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch {
            // Persistence is best effort; the in-memory config still drives the UI.
        }
    },
    { deep: true }
);

const themeInput = () => ({ preset: layoutConfig.preset, primary: layoutConfig.primary, surface: layoutConfig.surface, darkTheme: layoutConfig.darkTheme });

// Synchronous flush so the new colours are already on <html> inside the view transition callback.
watch(themeInput, applyTheme, { immediate: true, flush: 'sync' });
// Not immediate: PrimeVue is not installed yet when this module first evaluates; main.ts runs the first sync.
watch(themeInput, syncPrimeVueTheme, { flush: 'sync' });

interface MenuModeChangeEvent {
    value: MenuMode;
}

interface UseLayout {
    layoutConfig: LayoutConfig;
    layoutState: LayoutState;
    isDarkTheme: ComputedRef<boolean>;
    hasOpenOverlay: ComputedRef<boolean>;
    isDesktop: () => boolean;
    toggleDarkMode: () => void;
    toggleMenu: () => void;
    toggleConfigSidebar: () => void;
    hideMobileMenu: () => void;
    changeMenuMode: (event: MenuModeChangeEvent) => void;
}

export function useLayout(): UseLayout {
    const isDesktop = (): boolean => window.innerWidth > 991;

    const executeDarkModeToggle = () => {
        layoutConfig.darkTheme = !layoutConfig.darkTheme;
        document.documentElement.classList.toggle(DARK_CLASS, layoutConfig.darkTheme);
    };

    const toggleDarkMode = () => {
        if (!document.startViewTransition) {
            executeDarkModeToggle();
            return;
        }
        document.startViewTransition(() => executeDarkModeToggle());
    };

    const toggleMenu = () => {
        if (isDesktop()) {
            if (layoutConfig.menuMode === 'static') {
                layoutState.staticMenuInactive = !layoutState.staticMenuInactive;
            }
            if (layoutConfig.menuMode === 'overlay') {
                layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
            }
        } else {
            layoutState.mobileMenuActive = !layoutState.mobileMenuActive;
        }
    };

    const toggleConfigSidebar = () => {
        layoutState.configSidebarVisible = !layoutState.configSidebarVisible;
    };

    const hideMobileMenu = () => {
        layoutState.mobileMenuActive = false;
    };

    const changeMenuMode = (event: MenuModeChangeEvent) => {
        layoutConfig.menuMode = event.value;
        layoutState.staticMenuInactive = false;
        layoutState.mobileMenuActive = false;
        layoutState.sidebarExpanded = false;
        layoutState.menuHoverActive = false;
        layoutState.anchored = false;
    };

    onMounted(() => {
        document.documentElement.classList.toggle(DARK_CLASS, layoutConfig.darkTheme);
    });

    const isDarkTheme = computed(() => layoutConfig.darkTheme);
    const hasOpenOverlay = computed(() => layoutState.overlayMenuActive);

    return {
        layoutConfig,
        layoutState,
        isDarkTheme,
        hasOpenOverlay,
        isDesktop,
        toggleDarkMode,
        toggleMenu,
        toggleConfigSidebar,
        hideMobileMenu,
        changeMenuMode
    };
}
