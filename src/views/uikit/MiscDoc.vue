<script setup lang="ts">
    import { onBeforeUnmount, onMounted, ref } from 'vue';
    import Chip from '@/components/Chip.vue';
    import OverlayBadge from '@/components/OverlayBadge.vue';
    import ScrollTop from '@/components/ScrollTop.vue';
    import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@/components/ui/avatar';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { Progress } from '@/components/ui/progress';
    import { Skeleton } from '@/components/ui/skeleton';
    import { IconApple, IconArrowUp, IconBell, IconCalendar, IconCheck, IconEnvelope, IconExclamationTriangle, IconFacebook, IconGoogle, IconInfoCircle, IconMicrosoft, IconTimes, IconUser, IconUsers } from '@/components/icons';

    const value = ref<number>(0);
    let interval: ReturnType<typeof setInterval> | null = null;

    function startProgress(): void {
        interval = setInterval(() => {
            let newValue = value.value + Math.floor(Math.random() * 10) + 1;
            if (newValue >= 100) {
                newValue = 100;
            }
            value.value = newValue;
        }, 2000);
    }

    function endProgress(): void {
        if (interval !== null) {
            clearInterval(interval);
            interval = null;
        }
    }

    onMounted(() => {
        startProgress();
    });

    onBeforeUnmount(() => {
        endProgress();
    });
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">ProgressBar</div>
        <div class="flex flex-col md:flex-row gap-4">
            <div class="md:w-1/2">
                <div class="flex items-center gap-2">
                    <Progress :model-value="value" class="flex-1" />
                    <span class="text-sm text-muted-foreground">{{ value }}%</span>
                </div>
            </div>
            <div class="md:w-1/2">
                <Progress :model-value="50" />
            </div>
        </div>
    </div>

    <div class="flex flex-col md:flex-row gap-8">
        <div class="md:w-1/2">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Badge</div>
                <div class="flex gap-2">
                    <Badge>2</Badge>
                    <Badge variant="success">8</Badge>
                    <Badge variant="info">4</Badge>
                    <Badge variant="warning">12</Badge>
                    <Badge variant="destructive">3</Badge>
                </div>

                <div class="font-semibold my-4">Overlay</div>
                <div class="flex gap-6">
                    <OverlayBadge value="2">
                        <IconBell class="size-8" />
                    </OverlayBadge>
                    <OverlayBadge value="4" severity="danger">
                        <IconCalendar class="size-8" />
                    </OverlayBadge>
                    <OverlayBadge severity="danger">
                        <IconEnvelope class="size-8" />
                    </OverlayBadge>
                </div>

                <div class="font-semibold my-4">Button</div>
                <div class="flex gap-2">
                    <Button>Emails <Badge variant="secondary">8</Badge></Button>
                    <Button variant="warning"><IconUsers />Messages<Badge variant="destructive">8</Badge></Button>
                </div>

                <div class="font-semibold my-4">Sizes</div>
                <div class="flex items-start gap-2">
                    <Badge>2</Badge>
                    <Badge variant="warning" class="h-6 px-2.5 text-sm">4</Badge>
                    <Badge variant="success" class="h-7 px-3 text-base">6</Badge>
                </div>
            </div>

            <div class="card">
                <div class="font-semibold text-xl mb-4">Avatar</div>
                <div class="font-semibold mb-4">Group</div>
                <AvatarGroup>
                    <Avatar size="lg">
                        <AvatarImage src="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" alt="Amy Elsner" />
                        <AvatarFallback>AE</AvatarFallback>
                    </Avatar>
                    <Avatar size="lg">
                        <AvatarImage src="https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png" alt="Asiya Javayant" />
                        <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                    <Avatar size="lg">
                        <AvatarImage src="https://primefaces.org/cdn/primevue/images/avatar/onyamalimba.png" alt="Onyama Limba" />
                        <AvatarFallback>OL</AvatarFallback>
                    </Avatar>
                    <Avatar size="lg">
                        <AvatarImage src="https://primefaces.org/cdn/primevue/images/avatar/ionibowcher.png" alt="Ioni Bowcher" />
                        <AvatarFallback>IB</AvatarFallback>
                    </Avatar>
                    <Avatar size="lg">
                        <AvatarImage src="https://primefaces.org/cdn/primevue/images/avatar/xuxuefeng.png" alt="Xuxue Feng" />
                        <AvatarFallback>XF</AvatarFallback>
                    </Avatar>
                    <Avatar size="lg">
                        <AvatarFallback class="bg-purple-600 text-white">+2</AvatarFallback>
                    </Avatar>
                </AvatarGroup>

                <div class="font-semibold my-4">Label - Circle</div>
                <div class="flex items-center gap-2">
                    <!-- No size="lg" here: data-[size=lg]:size-10 carries an attribute selector, so it outranks a plain size-12 and would cap this at 2.5rem. -->
                    <Avatar class="size-12">
                        <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                    <Avatar size="lg">
                        <AvatarFallback class="bg-sky-500 text-white">V</AvatarFallback>
                    </Avatar>
                    <Avatar>
                        <AvatarFallback class="bg-purple-600 text-white">U</AvatarFallback>
                    </Avatar>
                </div>

                <div class="font-semibold my-4">Icon - Badge</div>
                <OverlayBadge value="4" severity="danger" class="inline-flex">
                    <Avatar class="size-12">
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                </OverlayBadge>
            </div>

            <div class="card">
                <div class="font-semibold text-xl mb-4">ScrollTop</div>
                <!-- A plain scroller, not ScrollArea: ScrollTop's target="parent" watches its own parentElement, and Reka's viewport puts the slot in a non-scrolling content div. -->
                <div class="relative h-50 w-62.5 overflow-auto rounded-lg border border-border p-3">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae et leo duis ut diam. Ultricies mi quis hendrerit dolor magna eget est lorem. Amet consectetur
                        adipiscing elit ut. Nam libero justo laoreet sit amet. Pharetra massa massa ultricies mi quis hendrerit dolor magna. Est ultricies integer quis auctor elit sed vulputate. Consequat ac felis donec et. Tellus orci ac auctor
                        augue mauris. Semper feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Tincidunt arcu non sodales neque sodales. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Sodales ut etiam sit amet
                        nisl purus. Cursus sit amet dictum sit amet. Tristique senectus et netus et malesuada fames ac turpis egestas. Et tortor consequat id porta nibh venenatis cras sed. Diam maecenas ultricies mi eget mauris. Eget egestas purus
                        viverra accumsan in nisl nisi. Suscipit adipiscing bibendum est ultricies integer. Mattis aliquam faucibus purus in massa tempor nec.
                    </p>
                    <ScrollTop target="parent" :threshold="100" :icon="IconArrowUp" />
                </div>
            </div>
        </div>
        <div class="md:w-1/2">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Tag</div>
                <div class="font-semibold mb-4">Default</div>
                <div class="flex gap-2">
                    <Badge class="rounded-md">Primary</Badge>
                    <Badge variant="success" class="rounded-md">Success</Badge>
                    <Badge variant="info" class="rounded-md">Info</Badge>
                    <Badge variant="warning" class="rounded-md">Warn</Badge>
                    <Badge variant="destructive" class="rounded-md">Danger</Badge>
                </div>

                <div class="font-semibold my-4">Pills</div>
                <div class="flex gap-2">
                    <Badge>Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="info">Info</Badge>
                    <Badge variant="warning">Warn</Badge>
                    <Badge variant="destructive">Danger</Badge>
                </div>

                <div class="font-semibold my-4">Icons</div>
                <div class="flex gap-2">
                    <Badge><IconUser />Primary</Badge>
                    <Badge variant="success"><IconCheck />Success</Badge>
                    <Badge variant="info"><IconInfoCircle />Info</Badge>
                    <Badge variant="warning"><IconExclamationTriangle />Warn</Badge>
                    <Badge variant="destructive"><IconTimes />Danger</Badge>
                </div>
            </div>

            <div class="card">
                <div class="font-semibold text-xl mb-4">Chip</div>
                <div class="font-semibold mb-4">Basic</div>
                <div class="flex items-center flex-col sm:flex-row">
                    <Chip label="Action" class="mr-2 mb-2" />
                    <Chip label="Comedy" class="mr-2 mb-2" />
                    <Chip label="Mystery" class="mr-2 mb-2" />
                    <Chip label="Thriller" removable class="mb-2" />
                </div>

                <div class="font-semibold my-4">Icon</div>
                <div class="flex items-center flex-col sm:flex-row">
                    <Chip label="Apple" :icon="IconApple" class="mr-2 mb-2" />
                    <Chip label="Facebook" :icon="IconFacebook" class="mr-2 mb-2" />
                    <Chip label="Google" :icon="IconGoogle" class="mr-2 mb-2" />
                    <Chip label="Microsoft" :icon="IconMicrosoft" removable class="mb-2" />
                </div>

                <div class="font-semibold my-4">Image</div>
                <div class="flex items-center flex-col sm:flex-row">
                    <Chip label="Amy Elsner" image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" class="mr-2 mb-2" />
                    <Chip label="Asiya Javayant" image="https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png" class="mr-2 mb-2" />
                    <Chip label="Onyama Limba" image="https://primefaces.org/cdn/primevue/images/avatar/onyamalimba.png" class="mr-2 mb-2" />
                </div>
            </div>

            <div class="card">
                <div class="font-semibold text-xl mb-4">Skeleton</div>
                <div class="rounded-lg border border-border p-6">
                    <div class="flex mb-4">
                        <Skeleton class="mr-2 size-16 rounded-full" />
                        <div>
                            <Skeleton class="mb-2 h-4 w-40" />
                            <Skeleton class="mb-2 h-4 w-20" />
                            <Skeleton class="h-2" />
                        </div>
                    </div>
                    <Skeleton class="h-37.5 w-full" />
                    <div class="flex justify-between mt-4">
                        <Skeleton class="h-8 w-16" />
                        <Skeleton class="h-8 w-16" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
