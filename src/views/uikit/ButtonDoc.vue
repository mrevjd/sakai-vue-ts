<script setup lang="ts">
    import { ref } from 'vue';
    import SplitButton from '@/components/SplitButton.vue';
    import { Button } from '@/components/ui/button';
    import { ButtonGroup } from '@/components/ui/button-group';
    import { Spinner } from '@/components/ui/spinner';
    import { IconBell, IconBookmark, IconCheck, IconHeart, IconHome, IconRefresh, IconSearch, IconStar, IconTimes, IconTrash, IconUser } from '@/components/icons';
    import type { MenuModelItem } from '@/components/menu';

    const items = ref<MenuModelItem[]>([
        {
            label: 'Update',
            icon: IconRefresh
        },
        {
            label: 'Delete',
            icon: IconTimes
        },
        {
            separator: true
        },
        {
            label: 'Home',
            icon: IconHome
        }
    ]);

    const loading = ref<boolean[]>([false, false, false, false]);

    function load(index: number): void {
        loading.value[index] = true;
        setTimeout(() => (loading.value[index] = false), 1000);
    }
</script>

<template>
    <div class="flex flex-col md:flex-row gap-8">
        <div class="md:w-1/2">
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Default</div>
                <div class="flex flex-wrap gap-2">
                    <Button>Submit</Button>
                    <Button disabled>Disabled</Button>
                    <Button variant="link">Link</Button>
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Severities</div>
                <div class="flex flex-wrap gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="info">Info</Button>
                    <Button variant="warning">Warn</Button>
                    <Button variant="help">Help</Button>
                    <Button variant="destructive">Danger</Button>
                    <Button variant="contrast">Contrast</Button>
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Text</div>
                <div class="flex flex-wrap gap-2">
                    <Button variant="ghost" class="text-primary">Primary</Button>
                    <Button variant="ghost" class="text-secondary-foreground">Secondary</Button>
                    <Button variant="ghost" class="text-green-600">Success</Button>
                    <Button variant="ghost" class="text-sky-500">Info</Button>
                    <Button variant="ghost" class="text-amber-500">Warn</Button>
                    <Button variant="ghost" class="text-purple-500">Help</Button>
                    <Button variant="ghost" class="text-destructive">Danger</Button>
                    <Button variant="ghost" class="text-foreground">Plain</Button>
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Outlined</div>
                <div class="flex flex-wrap gap-2">
                    <Button variant="outline" class="border-primary text-primary">Primary</Button>
                    <Button variant="outline" class="border-border text-secondary-foreground">Secondary</Button>
                    <Button variant="outline" class="border-green-600 text-green-600">Success</Button>
                    <Button variant="outline" class="border-sky-500 text-sky-500">Info</Button>
                    <Button variant="outline" class="border-amber-500 text-amber-500">Warn</Button>
                    <Button variant="outline" class="border-purple-500 text-purple-500">Help</Button>
                    <Button variant="outline" class="border-destructive text-destructive">Danger</Button>
                    <Button variant="outline" class="border-foreground text-foreground">Contrast</Button>
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Group</div>
                <div class="flex flex-wrap gap-2">
                    <ButtonGroup>
                        <Button><IconCheck />Save</Button>
                        <Button><IconTrash />Delete</Button>
                        <Button><IconTimes />Cancel</Button>
                    </ButtonGroup>
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">SplitButton</div>
                <div class="flex flex-wrap gap-2">
                    <SplitButton label="Save" :model="items" />
                    <SplitButton label="Save" :model="items" severity="secondary" />
                    <SplitButton label="Save" :model="items" severity="success" />
                    <SplitButton label="Save" :model="items" severity="info" />
                    <SplitButton label="Save" :model="items" severity="warn" />
                    <SplitButton label="Save" :model="items" severity="help" />
                    <SplitButton label="Save" :model="items" severity="danger" />
                    <SplitButton label="Save" :model="items" severity="contrast" />
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Templating</div>
                <div class="flex flex-wrap gap-2">
                    <Button type="button">
                        <img alt="logo" src="/demo/images/logo-white.svg" class="w-6" />
                    </Button>
                    <Button variant="outline" class="border-green-600 text-green-600" type="button">
                        <img alt="logo" src="/demo/images/logo.svg" class="w-6" />
                        <span>shadcn-vue</span>
                    </Button>
                </div>
            </div>
        </div>
        <div class="md:w-1/2">
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Icons</div>
                <div class="flex flex-wrap gap-2">
                    <Button size="icon" aria-label="Star"><IconStar class="fill-current" /></Button>
                    <Button><IconBookmark />Bookmark</Button>
                    <Button>Bookmark<IconBookmark /></Button>
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Raised</div>
                <div class="flex flex-wrap gap-2">
                    <Button class="shadow-md">Primary</Button>
                    <Button variant="secondary" class="shadow-md">Secondary</Button>
                    <Button variant="success" class="shadow-md">Success</Button>
                    <Button variant="info" class="shadow-md">Info</Button>
                    <Button variant="warning" class="shadow-md">Warn</Button>
                    <Button variant="help" class="shadow-md">Help</Button>
                    <Button variant="destructive" class="shadow-md">Danger</Button>
                    <Button variant="contrast" class="shadow-md">Contrast</Button>
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Rounded</div>
                <div class="flex flex-wrap gap-2">
                    <Button class="rounded-full">Primary</Button>
                    <Button variant="secondary" class="rounded-full">Secondary</Button>
                    <Button variant="success" class="rounded-full">Success</Button>
                    <Button variant="info" class="rounded-full">Info</Button>
                    <Button variant="warning" class="rounded-full">Warn</Button>
                    <Button variant="help" class="rounded-full">Help</Button>
                    <Button variant="destructive" class="rounded-full">Danger</Button>
                    <Button variant="contrast" class="rounded-full">Contrast</Button>
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Rounded Icons</div>
                <div class="flex flex-wrap gap-2">
                    <Button size="icon" class="rounded-full" aria-label="Check"><IconCheck /></Button>
                    <Button variant="secondary" size="icon" class="rounded-full" aria-label="Bookmark"><IconBookmark /></Button>
                    <Button variant="success" size="icon" class="rounded-full" aria-label="Search"><IconSearch /></Button>
                    <Button variant="info" size="icon" class="rounded-full" aria-label="User"><IconUser /></Button>
                    <Button variant="warning" size="icon" class="rounded-full" aria-label="Bell"><IconBell /></Button>
                    <Button variant="help" size="icon" class="rounded-full" aria-label="Heart"><IconHeart /></Button>
                    <Button variant="destructive" size="icon" class="rounded-full" aria-label="Close"><IconTimes /></Button>
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Rounded Text</div>
                <div class="flex flex-wrap gap-2">
                    <Button variant="ghost" size="icon" class="rounded-full shadow-md text-primary" aria-label="Check"><IconCheck /></Button>
                    <Button variant="ghost" size="icon" class="rounded-full shadow-md text-secondary-foreground" aria-label="Bookmark"><IconBookmark /></Button>
                    <Button variant="ghost" size="icon" class="rounded-full shadow-md text-green-600" aria-label="Search"><IconSearch /></Button>
                    <Button variant="ghost" size="icon" class="rounded-full shadow-md text-sky-500" aria-label="User"><IconUser /></Button>
                    <Button variant="ghost" size="icon" class="rounded-full shadow-md text-amber-500" aria-label="Bell"><IconBell /></Button>
                    <Button variant="ghost" size="icon" class="rounded-full shadow-md text-purple-500" aria-label="Heart"><IconHeart /></Button>
                    <Button variant="ghost" size="icon" class="rounded-full shadow-md text-destructive" aria-label="Close"><IconTimes /></Button>
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Rounded Outlined</div>
                <div class="flex flex-wrap gap-2">
                    <Button variant="outline" size="icon" class="rounded-full border-primary text-primary" aria-label="Check"><IconCheck /></Button>
                    <Button variant="outline" size="icon" class="rounded-full border-border text-secondary-foreground" aria-label="Bookmark"><IconBookmark /></Button>
                    <Button variant="outline" size="icon" class="rounded-full border-green-600 text-green-600" aria-label="Search"><IconSearch /></Button>
                    <Button variant="outline" size="icon" class="rounded-full border-sky-500 text-sky-500" aria-label="User"><IconUser /></Button>
                    <Button variant="outline" size="icon" class="rounded-full border-amber-500 text-amber-500" aria-label="Bell"><IconBell /></Button>
                    <Button variant="outline" size="icon" class="rounded-full border-purple-500 text-purple-500" aria-label="Heart"><IconHeart /></Button>
                    <Button variant="outline" size="icon" class="rounded-full border-destructive text-destructive" aria-label="Close"><IconTimes /></Button>
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Loading</div>
                <div class="flex flex-wrap gap-2">
                    <Button type="button" :disabled="loading[0]" @click="load(0)"><Spinner v-if="loading[0]" /><IconSearch v-else />Search</Button>
                    <Button type="button" :disabled="loading[1]" @click="load(1)">Search<Spinner v-if="loading[1]" /><IconSearch v-else /></Button>
                    <Button size="icon" type="button" aria-label="Search" :disabled="loading[2]" @click="load(2)"><Spinner v-if="loading[2]" /><IconSearch v-else /></Button>
                    <Button type="button" :disabled="loading[3]" @click="load(3)"><Spinner v-if="loading[3]" />Search</Button>
                </div>
            </div>
        </div>
    </div>
</template>
