<script setup lang="ts">
    import { ref } from 'vue';
    import {
        IconAngleDown,
        IconCog,
        IconCompass,
        IconCopy,
        IconDesktop,
        IconEnvelope,
        IconFile,
        IconHome,
        IconImage,
        IconList,
        IconMapMarker,
        IconPencil,
        IconPlus,
        IconRefresh,
        IconSave,
        IconSearch,
        IconShoppingCart,
        IconSignOut,
        IconStar,
        IconTable,
        IconTag,
        IconTrash,
        IconUser,
        IconUserEdit,
        IconUserPlus
    } from '@/components/icons';
    import { AppBreadcrumb, AppContextMenu, AppMegaMenu, AppMenubar, AppSteps, MenuList, PanelMenu, TieredMenu, type MegaMenuItem, type MenuModelItem } from '@/components/menu';
    import { Button } from '@/components/ui/button';
    import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
    import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

    const nestedMenuitems = ref<MenuModelItem[]>([
        {
            label: 'Customers',
            icon: IconTable,
            items: [
                {
                    label: 'New',
                    icon: IconUserPlus,
                    items: [
                        {
                            label: 'Customer',
                            icon: IconPlus
                        },
                        {
                            label: 'Duplicate',
                            icon: IconCopy
                        }
                    ]
                },
                {
                    label: 'Edit',
                    icon: IconUserEdit
                }
            ]
        },
        {
            label: 'Orders',
            icon: IconShoppingCart,
            items: [
                {
                    label: 'View',
                    icon: IconList
                },
                {
                    label: 'Search',
                    icon: IconSearch
                }
            ]
        },
        {
            label: 'Shipments',
            icon: IconEnvelope,
            items: [
                {
                    label: 'Tracker',
                    icon: IconCompass
                },
                {
                    label: 'Map',
                    icon: IconMapMarker
                },
                {
                    label: 'Manage',
                    icon: IconPencil
                }
            ]
        },
        {
            label: 'Profile',
            icon: IconUser,
            items: [
                {
                    label: 'Settings',
                    icon: IconCog
                },
                {
                    label: 'Billing',
                    icon: IconFile
                }
            ]
        },
        {
            label: 'Quit',
            icon: IconSignOut
        }
    ]);
    const breadcrumbHome = ref<MenuModelItem>({ icon: IconHome, to: '/' });
    const breadcrumbItems = ref<MenuModelItem[]>([{ label: 'Computer' }, { label: 'Notebook' }, { label: 'Accessories' }, { label: 'Backpacks' }, { label: 'Item' }]);
    const stepItems = ref<MenuModelItem[]>([{ label: 'Header I' }, { label: 'Header II' }, { label: 'Header III' }]);
    // AppSteps is 0-based; PrimeVue's `Stepper value="1"` was 1-based, so both select the first step.
    const activeStep = ref<number>(0);
    const tieredMenuItems = ref<MenuModelItem[]>([
        {
            label: 'Customers',
            icon: IconTable,
            items: [
                {
                    label: 'New',
                    icon: IconUserPlus,
                    items: [
                        {
                            label: 'Customer',
                            icon: IconPlus
                        },
                        {
                            label: 'Duplicate',
                            icon: IconCopy
                        }
                    ]
                },
                {
                    label: 'Edit',
                    icon: IconUserEdit
                }
            ]
        },
        {
            label: 'Orders',
            icon: IconShoppingCart,
            items: [
                {
                    label: 'View',
                    icon: IconList
                },
                {
                    label: 'Search',
                    icon: IconSearch
                }
            ]
        },
        {
            label: 'Shipments',
            icon: IconEnvelope,
            items: [
                {
                    label: 'Tracker',
                    icon: IconCompass
                },
                {
                    label: 'Map',
                    icon: IconMapMarker
                },
                {
                    label: 'Manage',
                    icon: IconPencil
                }
            ]
        },
        {
            label: 'Profile',
            icon: IconUser,
            items: [
                {
                    label: 'Settings',
                    icon: IconCog
                },
                {
                    label: 'Billing',
                    icon: IconFile
                }
            ]
        },
        {
            separator: true
        },
        {
            label: 'Quit',
            icon: IconSignOut
        }
    ]);
    const overlayMenuItems = ref<MenuModelItem[]>([
        {
            label: 'Save',
            icon: IconSave
        },
        {
            label: 'Update',
            icon: IconRefresh
        },
        {
            label: 'Delete',
            icon: IconTrash
        },
        {
            separator: true
        },
        {
            label: 'Home',
            icon: IconHome
        }
    ]);
    const menuitems = ref<MenuModelItem[]>([
        {
            label: 'Customers',
            items: [
                {
                    label: 'New',
                    icon: IconPlus
                },
                {
                    label: 'Edit',
                    icon: IconUserEdit
                }
            ]
        },
        {
            label: 'Orders',
            items: [
                {
                    label: 'View',
                    icon: IconList
                },
                {
                    label: 'Search',
                    icon: IconSearch
                }
            ]
        }
    ]);
    const contextMenuItems = ref<MenuModelItem[]>([
        {
            label: 'Save',
            icon: IconSave
        },
        {
            label: 'Update',
            icon: IconRefresh
        },
        {
            label: 'Delete',
            icon: IconTrash
        },
        {
            separator: true
        },
        {
            label: 'Options',
            icon: IconCog
        }
    ]);
    const megamenuItems = ref<MegaMenuItem[]>([
        {
            label: 'Fashion',
            icon: IconTag,
            items: [
                [
                    {
                        label: 'Woman',
                        items: [{ label: 'Woman Item' }, { label: 'Woman Item' }, { label: 'Woman Item' }]
                    },
                    {
                        label: 'Men',
                        items: [{ label: 'Men Item' }, { label: 'Men Item' }, { label: 'Men Item' }]
                    }
                ],
                [
                    {
                        label: 'Kids',
                        items: [{ label: 'Kids Item' }, { label: 'Kids Item' }]
                    },
                    {
                        label: 'Luggage',
                        items: [{ label: 'Luggage Item' }, { label: 'Luggage Item' }, { label: 'Luggage Item' }]
                    }
                ]
            ]
        },
        {
            label: 'Electronics',
            icon: IconDesktop,
            items: [
                [
                    {
                        label: 'Computer',
                        items: [{ label: 'Computer Item' }, { label: 'Computer Item' }]
                    },
                    {
                        label: 'Camcorder',
                        items: [{ label: 'Camcorder Item' }, { label: 'Camcorder Item' }, { label: 'Camcorder Item' }]
                    }
                ],
                [
                    {
                        label: 'TV',
                        items: [{ label: 'TV Item' }, { label: 'TV Item' }]
                    },
                    {
                        label: 'Audio',
                        items: [{ label: 'Audio Item' }, { label: 'Audio Item' }, { label: 'Audio Item' }]
                    }
                ],
                [
                    {
                        label: 'Sports.7',
                        items: [{ label: 'Sports.7.1' }, { label: 'Sports.7.2' }]
                    }
                ]
            ]
        },
        {
            label: 'Furniture',
            icon: IconImage,
            items: [
                [
                    {
                        label: 'Living Room',
                        items: [{ label: 'Living Room Item' }, { label: 'Living Room Item' }]
                    },
                    {
                        label: 'Kitchen',
                        items: [{ label: 'Kitchen Item' }, { label: 'Kitchen Item' }, { label: 'Kitchen Item' }]
                    }
                ],
                [
                    {
                        label: 'Bedroom',
                        items: [{ label: 'Bedroom Item' }, { label: 'Bedroom Item' }]
                    },
                    {
                        label: 'Outdoor',
                        items: [{ label: 'Outdoor Item' }, { label: 'Outdoor Item' }, { label: 'Outdoor Item' }]
                    }
                ]
            ]
        },
        {
            label: 'Sports',
            icon: IconStar,
            items: [
                [
                    {
                        label: 'Basketball',
                        items: [{ label: 'Basketball Item' }, { label: 'Basketball Item' }]
                    },
                    {
                        label: 'Football',
                        items: [{ label: 'Football Item' }, { label: 'Football Item' }, { label: 'Football Item' }]
                    }
                ],
                [
                    {
                        label: 'Tennis',
                        items: [{ label: 'Tennis Item' }, { label: 'Tennis Item' }]
                    }
                ]
            ]
        }
    ]);
    const panelMenuitems = ref<MenuModelItem[]>([
        {
            label: 'Customers',
            icon: IconTable,
            items: [
                {
                    label: 'New',
                    icon: IconUserPlus,
                    items: [
                        {
                            label: 'Customer',
                            icon: IconPlus
                        },
                        {
                            label: 'Duplicate',
                            icon: IconCopy
                        }
                    ]
                },
                {
                    label: 'Edit',
                    icon: IconUserEdit
                }
            ]
        },
        {
            label: 'Orders',
            icon: IconShoppingCart,
            items: [
                {
                    label: 'View',
                    icon: IconList
                },
                {
                    label: 'Search',
                    icon: IconSearch
                }
            ]
        },
        {
            label: 'Shipments',
            icon: IconEnvelope,
            items: [
                {
                    label: 'Tracker',
                    icon: IconCompass
                },
                {
                    label: 'Map',
                    icon: IconMapMarker
                },
                {
                    label: 'Manage',
                    icon: IconPencil
                }
            ]
        },
        {
            label: 'Profile',
            icon: IconUser,
            items: [
                {
                    label: 'Settings',
                    icon: IconCog
                },
                {
                    label: 'Billing',
                    icon: IconFile
                }
            ]
        }
    ]);
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Menubar</div>
        <AppMenubar :model="nestedMenuitems">
            <template #end>
                <InputGroup class="w-56">
                    <InputGroupAddon><IconSearch /></InputGroupAddon>
                    <InputGroupInput placeholder="Search" />
                </InputGroup>
            </template>
        </AppMenubar>
    </div>

    <div class="card">
        <div class="font-semibold text-xl mb-4">Breadcrumb</div>
        <AppBreadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
    </div>

    <div class="flex flex-col md:flex-row gap-8">
        <div class="md:w-1/2">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Steps</div>
                <AppSteps v-model:active-step="activeStep" :model="stepItems" :readonly="false" />
            </div>
        </div>
        <div class="md:w-1/2">
            <div class="card">
                <div class="font-semibold text-xl mb-4">TabMenu</div>
                <Tabs default-value="0">
                    <TabsList>
                        <TabsTrigger value="0">Header I</TabsTrigger>
                        <TabsTrigger value="1">Header II</TabsTrigger>
                        <TabsTrigger value="2">Header III</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    </div>

    <div class="flex flex-col md:flex-row gap-8 mt-6">
        <div class="md:w-1/3">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Tiered Menu</div>
                <TieredMenu :model="tieredMenuItems" />
            </div>
        </div>
        <div class="md:w-1/3">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Plain Menu</div>
                <MenuList :model="menuitems" />
            </div>
        </div>
        <div class="md:w-1/3">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Overlay Menu</div>
                <MenuList :model="overlayMenuItems" popup>
                    <template #trigger>
                        <Button variant="outline">Options<IconAngleDown /></Button>
                    </template>
                </MenuList>
            </div>

            <div class="card">
                <div class="font-semibold text-xl mb-4">Context Menu</div>
                <AppContextMenu :model="contextMenuItems">
                    <div class="flex h-24 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">Right click to display.</div>
                </AppContextMenu>
            </div>
        </div>
    </div>

    <div class="flex flex-col md:flex-row gap-8 mt-8">
        <div class="md:w-1/2">
            <div class="card">
                <div class="font-semibold text-xl mb-4">MegaMenu | Horizontal</div>
                <AppMegaMenu :model="megamenuItems" />

                <div class="font-semibold text-xl mb-4 mt-8">MegaMenu | Vertical</div>
                <AppMegaMenu :model="megamenuItems" orientation="vertical" />
            </div>
        </div>
        <div class="md:w-1/2">
            <div class="card">
                <div class="font-semibold text-xl mb-4">PanelMenu</div>
                <PanelMenu :model="panelMenuitems" />
            </div>
        </div>
    </div>
</template>
