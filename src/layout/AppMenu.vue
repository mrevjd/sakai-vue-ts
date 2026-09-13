<script setup lang="ts">
    import { ref } from 'vue';
    import {
        IconAlignLeft,
        IconBars,
        IconBook,
        IconBriefcase,
        IconCalendar,
        IconChartBar,
        IconCheckSquare,
        IconCircle,
        IconCircleOff,
        IconClone,
        IconComment,
        IconExclamationCircle,
        IconEye,
        IconFile,
        IconGithub,
        IconGlobe,
        IconHome,
        IconIdCard,
        IconImage,
        IconList,
        IconLock,
        IconMobile,
        IconPencil,
        IconPrime,
        IconShareAlt,
        IconSignIn,
        IconTable,
        IconTablet,
        IconTimesCircle,
        IconUser
    } from '@/components/icons';
    import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';

    const model = ref<MenuItem[]>([
        {
            label: 'Home',
            items: [
                {
                    label: 'Dashboard',
                    icon: IconHome,
                    to: '/'
                }
            ]
        },
        {
            label: 'UI Components',
            path: '/uikit',
            items: [
                { label: 'Form Layout', icon: IconIdCard, to: '/uikit/formlayout' },
                { label: 'Input', icon: IconCheckSquare, to: '/uikit/input' },
                { label: 'Button', icon: IconMobile, to: '/uikit/button' },
                { label: 'Table', icon: IconTable, to: '/uikit/table' },
                { label: 'List', icon: IconList, to: '/uikit/list' },
                { label: 'Tree', icon: IconShareAlt, to: '/uikit/tree' },
                { label: 'Panel', icon: IconTablet, to: '/uikit/panel' },
                { label: 'Overlay', icon: IconClone, to: '/uikit/overlay' },
                { label: 'Media', icon: IconImage, to: '/uikit/media' },
                { label: 'Menu', icon: IconBars, to: '/uikit/menu' },
                { label: 'Message', icon: IconComment, to: '/uikit/message' },
                { label: 'File', icon: IconFile, to: '/uikit/file' },
                { label: 'Chart', icon: IconChartBar, to: '/uikit/charts' },
                { label: 'Timeline', icon: IconCalendar, to: '/uikit/timeline' },
                { label: 'Misc', icon: IconCircle, to: '/uikit/misc' }
            ]
        },
        {
            label: 'Prime Blocks',
            icon: IconPrime,
            path: '/blocks',
            items: [
                {
                    label: 'Free Blocks',
                    icon: IconEye,
                    to: '/blocks/free'
                },
                {
                    label: 'All Blocks',
                    icon: IconGlobe,
                    url: 'https://blocks.primevue.org/',
                    target: '_blank'
                }
            ]
        },
        {
            label: 'Pages',
            icon: IconBriefcase,
            path: '/pages',
            items: [
                {
                    label: 'Landing',
                    icon: IconGlobe,
                    to: '/landing'
                },
                {
                    label: 'Auth',
                    icon: IconUser,
                    path: '/auth',
                    items: [
                        {
                            label: 'Login',
                            icon: IconSignIn,
                            to: '/auth/login'
                        },
                        {
                            label: 'Error',
                            icon: IconTimesCircle,
                            to: '/auth/error'
                        },
                        {
                            label: 'Access Denied',
                            icon: IconLock,
                            to: '/auth/access'
                        }
                    ]
                },
                {
                    label: 'Crud',
                    icon: IconPencil,
                    to: '/pages/crud'
                },
                {
                    label: 'Not Found',
                    icon: IconExclamationCircle,
                    to: '/pages/notfound'
                },
                {
                    label: 'Empty',
                    icon: IconCircleOff,
                    to: '/pages/empty'
                }
            ]
        },
        {
            label: 'Hierarchy',
            icon: IconAlignLeft,
            path: '/hierarchy',
            items: [
                {
                    label: 'Submenu 1',
                    icon: IconAlignLeft,
                    path: '/submenu_1',
                    items: [
                        {
                            label: 'Submenu 1.1',
                            icon: IconAlignLeft,
                            path: '/submenu_1_1',
                            items: [
                                { label: 'Submenu 1.1.1', icon: IconAlignLeft },
                                { label: 'Submenu 1.1.2', icon: IconAlignLeft },
                                { label: 'Submenu 1.1.3', icon: IconAlignLeft }
                            ]
                        },
                        {
                            label: 'Submenu 1.2',
                            icon: IconAlignLeft,
                            path: '/submenu_1_2',
                            items: [{ label: 'Submenu 1.2.1', icon: IconAlignLeft }]
                        }
                    ]
                },
                {
                    label: 'Submenu 2',
                    icon: IconAlignLeft,
                    path: '/submenu_2',
                    items: [
                        {
                            label: 'Submenu 2.1',
                            icon: IconAlignLeft,
                            path: '/submenu_2_1',
                            items: [
                                { label: 'Submenu 2.1.1', icon: IconAlignLeft },
                                { label: 'Submenu 2.1.2', icon: IconAlignLeft }
                            ]
                        },
                        {
                            label: 'Submenu 2.2',
                            icon: IconAlignLeft,
                            path: '/submenu_2_2',
                            items: [{ label: 'Submenu 2.2.1', icon: IconAlignLeft }]
                        }
                    ]
                }
            ]
        },
        {
            label: 'Get Started',
            path: '/start',
            items: [
                {
                    label: 'Documentation',
                    icon: IconBook,
                    to: '/start/documentation'
                },
                {
                    label: 'Sakai Vue TS Source',
                    icon: IconGithub,
                    url: 'https://github.com/mrevjd/sakai-vue-ts',
                    target: '_blank'
                },
                {
                    label: 'Original Source',
                    icon: IconGithub,
                    url: 'https://github.com/primefaces/sakai-vue',
                    target: '_blank'
                }
            ]
        }
    ]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="item in model" :key="item.label">
            <app-menu-item :item="item" />
        </template>
    </ul>
</template>
