<script setup lang="ts">
    import { Button } from '@/components/ui/button';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { IconArrowUp, IconDollar, IconDownload, IconEllipsisV, IconHeart, IconPlus, IconQuestion, IconTrash } from '@/components/icons';

    const items = [
        { label: 'Add New', icon: IconPlus },
        { label: 'Remove', icon: IconTrash }
    ];
</script>

<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Notifications</div>
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon-sm" class="rounded-full" aria-label="Widget actions"><IconEllipsisV class="size-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="min-w-40">
                    <DropdownMenuItem v-for="item in items" :key="item.label"><component :is="item.icon" class="size-4" />{{ item.label }}</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <span class="block text-muted-foreground font-medium mb-4">TODAY</span>
        <ul class="p-0 mx-0 mt-0 mb-6 list-none">
            <li class="flex items-center py-2 border-b border-border">
                <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
                    <IconDollar class="size-6 text-blue-500" />
                </div>
                <span class="text-foreground leading-normal"
                    >Richard Jones
                    <span class="text-foreground">has purchased a blue t-shirt for <span class="text-primary font-bold">$79.00</span></span>
                </span>
            </li>
            <li class="flex items-center py-2">
                <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0">
                    <IconDownload class="size-6 text-orange-500" />
                </div>
                <span class="text-foreground leading-normal">Your request for withdrawal of <span class="text-primary font-bold">$2500.00</span> has been initiated.</span>
            </li>
        </ul>

        <span class="block text-muted-foreground font-medium mb-4">YESTERDAY</span>
        <ul class="p-0 m-0 list-none mb-6">
            <li class="flex items-center py-2 border-b border-border">
                <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
                    <IconDollar class="size-6 text-blue-500" />
                </div>
                <span class="text-foreground leading-normal"
                    >Keyser Wick
                    <span class="text-foreground">has purchased a black jacket for <span class="text-primary font-bold">$59.00</span></span>
                </span>
            </li>
            <li class="flex items-center py-2 border-b border-border">
                <div class="w-12 h-12 flex items-center justify-center bg-pink-100 dark:bg-pink-400/10 rounded-full mr-4 shrink-0">
                    <IconQuestion class="size-6 text-pink-500" />
                </div>
                <span class="text-foreground leading-normal"
                    >Jane Davis
                    <span class="text-foreground">has posted a new questions about your product.</span>
                </span>
            </li>
        </ul>
        <span class="block text-muted-foreground font-medium mb-4">LAST WEEK</span>
        <ul class="p-0 m-0 list-none">
            <li class="flex items-center py-2 border-b border-border">
                <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
                    <IconArrowUp class="size-6 text-green-500" />
                </div>
                <span class="text-foreground leading-normal">Your revenue has increased by <span class="text-primary font-bold">%25</span>.</span>
            </li>
            <li class="flex items-center py-2 border-b border-border">
                <div class="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-full mr-4 shrink-0">
                    <IconHeart class="size-6 text-purple-500" />
                </div>
                <span class="text-foreground leading-normal"><span class="text-primary font-bold">12</span> users have added your products to their wishlist.</span>
            </li>
        </ul>
    </div>
</template>
