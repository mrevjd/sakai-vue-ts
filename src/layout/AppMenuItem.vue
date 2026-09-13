<script setup lang="ts">
    import { useLayout } from '@/layout/composables/layout';
    import { computed, type Component, type PropType } from 'vue';
    import { IconAngleDown } from '@/components/icons';

    export interface MenuItem {
        label?: string;
        icon?: Component;
        to?: string;
        url?: string;
        target?: string;
        class?: string;
        path?: string;
        visible?: boolean;
        disabled?: boolean;
        items?: MenuItem[];
        command?: (event: { originalEvent: Event; item: MenuItem }) => void;
    }

    const { layoutState, isDesktop } = useLayout();

    const props = defineProps({
        item: {
            type: Object as PropType<MenuItem>,
            default: () => ({})
        },
        root: {
            type: Boolean,
            default: true
        },
        parentPath: {
            type: String,
            default: null
        }
    });

    const fullPath = computed(() => (props.item.path ? (props.parentPath ? props.parentPath + props.item.path : props.item.path) : null));

    const isActive = computed(() => {
        return props.item.path ? layoutState.activePath?.startsWith(fullPath.value ?? '') : layoutState.activePath === props.item.to;
    });

    const itemClick = (event: Event, item: MenuItem) => {
        if (item.disabled) {
            event.preventDefault();
            return;
        }

        if (item.command) {
            item.command({ originalEvent: event, item: item });
        }

        if (item.items) {
            if (isActive.value) {
                layoutState.activePath = (layoutState.activePath ?? '').replace(item.path ?? '', '');
            } else {
                layoutState.activePath = fullPath.value;
                layoutState.menuHoverActive = true;
            }
        } else {
            layoutState.overlayMenuActive = false;
            layoutState.mobileMenuActive = false;
            layoutState.menuHoverActive = false;
        }
    };

    const onMouseEnter = () => {
        if (isDesktop() && props.root && props.item.items && layoutState.menuHoverActive) {
            layoutState.activePath = fullPath.value;
        }
    };
</script>

<template>
    <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActive }">
        <div v-if="root && item.visible !== false" class="layout-menuitem-root-text">{{ item.label }}</div>
        <a v-if="(!item.to || item.items) && item.visible !== false" :href="item.url" @click="itemClick($event, item)" :class="item.class" :target="item.target" tabindex="0" @mouseenter="onMouseEnter">
            <component :is="item.icon" v-if="item.icon" class="layout-menuitem-icon size-4 shrink-0" />
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <IconAngleDown v-if="item.items" class="layout-submenu-toggler size-4" />
        </a>
        <router-link v-if="item.to && !item.items && item.visible !== false" @click="itemClick($event, item)" exactActiveClass="active-route" :class="item.class" tabindex="0" :to="item.to" @mouseenter="onMouseEnter">
            <component :is="item.icon" v-if="item.icon" class="layout-menuitem-icon size-4 shrink-0" />
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <IconAngleDown v-if="item.items" class="layout-submenu-toggler size-4" />
        </router-link>
        <Transition v-if="item.items && item.visible !== false" name="layout-submenu">
            <ul v-show="root ? true : isActive" class="layout-submenu">
                <app-menu-item v-for="child in item.items" :key="child.label + '_' + (child.to || child.path)" :item="child" :root="false" :parentPath="fullPath ?? undefined" />
            </ul>
        </Transition>
    </li>
</template>
