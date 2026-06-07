/// <reference lib="dom" />
import type { ComputedRef } from 'vue';
import { computed, onMounted, reactive } from 'vue';

type MenuMode = 'static' | 'overlay';

interface LayoutConfig {
    preset: string;
    primary: string;
    surface: string | null;
    darkTheme: boolean;
    menuMode: MenuMode;
}

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

const loadSavedTheme = (): Partial<LayoutConfig> => {
    const savedTheme = localStorage.getItem('layoutConfig');
    return savedTheme ? JSON.parse(savedTheme) : {};
};

const savedTheme = loadSavedTheme();

const layoutConfig = reactive<LayoutConfig>({
    preset: savedTheme.preset || 'Aura',
    primary: savedTheme.primary || 'emerald',
    surface: savedTheme.surface || null,
    darkTheme: savedTheme.darkTheme || false,
    menuMode: savedTheme.menuMode || 'static'
});

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
    const saveThemeSettings = () => {
        localStorage.setItem('layoutConfig', JSON.stringify(layoutConfig));
    };

    const isDesktop = (): boolean => window.innerWidth > 991;

    const toggleDarkMode = () => {
        if (!document.startViewTransition) {
            executeDarkModeToggle();
            return;
        }

        document.startViewTransition(() => executeDarkModeToggle());
    };

    const executeDarkModeToggle = () => {
        layoutConfig.darkTheme = !layoutConfig.darkTheme;
        document.documentElement.classList.toggle('app-dark');
        saveThemeSettings();
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
        saveThemeSettings();
    };

    onMounted(() => {
        if (layoutConfig.darkTheme) {
            document.documentElement.classList.add('app-dark');
        }
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
