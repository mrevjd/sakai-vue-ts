<script setup lang="ts">
    import { h, onMounted, ref } from 'vue';
    import { createColumns, DataTable } from '@/components/data-table';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
    import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
    import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconCheck, IconExclamationTriangle, IconExternalLink, IconTimes, IconTrash } from '@/components/icons';
    import { useConfirm } from '@/composables/useConfirm';
    import { useToast } from '@/composables/useToast';
    import { ProductService } from '@/service/ProductService';
    import type { Product } from '@/service/types';
    import { formatCurrency } from '@/utils/currency';

    type Row = Product & Record<string, unknown>;

    const display = ref<boolean>(false);
    const displayConfirmation = ref<boolean>(false);
    const visibleLeft = ref<boolean>(false);
    const visibleRight = ref<boolean>(false);
    const visibleTop = ref<boolean>(false);
    const visibleBottom = ref<boolean>(false);
    const visibleFull = ref<boolean>(false);
    const products = ref<Row[]>([]);
    const popoverOpen = ref(false);

    const toast = useToast();
    const confirmPopup = useConfirm();

    const helper = createColumns<Row>();
    const columns = helper.columns([
        helper.accessor('name', { header: 'Name' }),
        helper.display({
            id: 'image',
            header: 'Image',
            cell: ({ row }) => h('img', { src: `https://primefaces.org/cdn/primevue/images/product/${row.original.image}`, alt: row.original.image, class: 'shadow-sm', style: 'width: 64px' })
        }),
        helper.accessor('price', { header: 'Price', cell: (ctx) => formatCurrency(ctx.getValue()) })
    ]);

    onMounted(() => {
        ProductService.getProductsSmall().then((data) => (products.value = data as Row[]));
    });

    function close(): void {
        display.value = false;
    }

    function openConfirmation(): void {
        displayConfirmation.value = true;
    }

    function closeConfirmation(): void {
        displayConfirmation.value = false;
    }

    // Reka focuses the first tabbable element and ignores the autofocus attribute, so the PrimeVue
    // original's focus on Yes is restored by hand.
    function focusAccept(event: Event): void {
        const accept = (event.target as HTMLElement).querySelector<HTMLElement>('[data-autofocus]');
        if (!accept) return;
        event.preventDefault();
        accept.focus();
    }

    function onProductSelect(row: Row): void {
        popoverOpen.value = false;
        toast.add({ severity: 'info', summary: 'Product Selected', detail: row.name, life: 3000 });
    }

    function confirm(event: MouseEvent): void {
        // currentTarget is captured now: it is null by the time the popover renders.
        const target = event.currentTarget as HTMLElement;
        confirmPopup.require({
            target,
            message: 'Are you sure you want to proceed?',
            icon: IconExclamationTriangle,
            acceptLabel: 'Save',
            rejectLabel: 'Cancel',
            rejectVariant: 'outline',
            accept: () => toast.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 }),
            reject: () => toast.add({ severity: 'info', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
        });
    }
</script>

<template>
    <div class="flex flex-col md:flex-row gap-8">
        <div class="md:w-1/2">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Dialog</div>
                <Dialog v-model:open="display">
                    <DialogTrigger as-child>
                        <Button>Show</Button>
                    </DialogTrigger>
                    <DialogContent class="sm:max-w-[30rem]">
                        <DialogHeader>
                            <DialogTitle>Dialog</DialogTitle>
                            <DialogDescription class="sr-only">An example dialog holding a paragraph of placeholder text.</DialogDescription>
                        </DialogHeader>
                        <p class="leading-normal m-0">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                            laborum.
                        </p>
                        <DialogFooter>
                            <Button @click="close">Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div class="card">
                <div class="font-semibold text-xl mb-4">Popover</div>
                <div class="flex flex-wrap gap-2">
                    <Popover v-model:open="popoverOpen">
                        <PopoverTrigger as-child>
                            <Button type="button">Show</Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-[28rem] p-0">
                            <DataTable :columns="columns" :data="products" row-key="id" paginator :page-size="5" @row-click="onProductSelect" />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div class="card">
                <div class="font-semibold text-xl mb-4">Tooltip</div>
                <div class="inline-flex gap-4">
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <Input type="text" placeholder="Username" />
                        </TooltipTrigger>
                        <TooltipContent>Your username</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <Button type="button">Save</Button>
                        </TooltipTrigger>
                        <TooltipContent>Click to proceed</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
        <div class="md:w-1/2">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Drawer</div>
                <Sheet v-model:open="visibleLeft">
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>Drawer</SheetTitle>
                            <SheetDescription class="text-foreground">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                                commodo consequat.
                            </SheetDescription>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>

                <Sheet v-model:open="visibleRight">
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle>Drawer</SheetTitle>
                            <SheetDescription class="text-foreground">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                                commodo consequat.
                            </SheetDescription>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>

                <Sheet v-model:open="visibleTop">
                    <SheetContent side="top">
                        <SheetHeader>
                            <SheetTitle>Drawer</SheetTitle>
                            <SheetDescription class="text-foreground">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                                commodo consequat.
                            </SheetDescription>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>

                <Sheet v-model:open="visibleBottom">
                    <SheetContent side="bottom">
                        <SheetHeader>
                            <SheetTitle>Drawer</SheetTitle>
                            <SheetDescription class="text-foreground">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                                commodo consequat.
                            </SheetDescription>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>

                <!-- Prefixed to match SheetContent's own side-scoped width classes: bare w-screen loses to their attribute selector,
                     while matching modifiers let tailwind-merge drop the vendored widths instead. -->
                <Sheet v-model:open="visibleFull">
                    <SheetContent side="right" class="data-[side=right]:w-screen data-[side=right]:sm:max-w-none">
                        <SheetHeader>
                            <SheetTitle>Drawer</SheetTitle>
                            <SheetDescription class="text-foreground">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                                commodo consequat.
                            </SheetDescription>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>

                <div class="flex gap-2">
                    <Button size="icon" aria-label="Open drawer on the left" @click="visibleLeft = true"><IconArrowRight /></Button>
                    <Button size="icon" aria-label="Open drawer on the right" @click="visibleRight = true"><IconArrowLeft /></Button>
                    <Button size="icon" aria-label="Open drawer at the top" @click="visibleTop = true"><IconArrowDown /></Button>
                    <Button size="icon" aria-label="Open drawer at the bottom" @click="visibleBottom = true"><IconArrowUp /></Button>
                    <Button size="icon" aria-label="Open full screen drawer" @click="visibleFull = true"><IconExternalLink /></Button>
                </div>
            </div>

            <div class="card">
                <div class="font-semibold text-xl mb-4">ConfirmPopup</div>
                <Button class="mr-2" @click="confirm($event)"><IconCheck />Confirm</Button>
            </div>

            <div class="card">
                <div class="font-semibold text-xl mb-4">ConfirmDialog</div>
                <Button variant="destructive" @click="openConfirmation"><IconTrash />Delete</Button>
                <Dialog v-model:open="displayConfirmation">
                    <DialogContent class="sm:max-w-[22rem]" @open-auto-focus="focusAccept">
                        <DialogHeader>
                            <DialogTitle>Confirmation</DialogTitle>
                        </DialogHeader>
                        <div class="flex items-center justify-center gap-4">
                            <IconExclamationTriangle class="size-8 shrink-0" />
                            <DialogDescription class="text-foreground">Are you sure you want to proceed?</DialogDescription>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" class="text-secondary-foreground" @click="closeConfirmation"><IconTimes />No</Button>
                            <Button variant="outline" class="border-destructive text-destructive" data-autofocus @click="closeConfirmation"><IconCheck />Yes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    </div>
</template>
