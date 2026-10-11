<script setup lang="ts">
    import { ref, type Component } from 'vue';
    import Timeline from '@/components/Timeline.vue';
    import { IconCheck, IconCog, IconEnvelope, IconShoppingCart } from '@/components/icons';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

    interface TimelineEvent {
        status: string;
        date: string;
        icon: Component;
        color: string;
        image?: string;
    }

    const events = ref<TimelineEvent[]>([
        {
            status: 'Ordered',
            date: '15/10/2020 10:30',
            icon: IconShoppingCart,
            color: '#9C27B0',
            image: 'game-controller.jpg'
        },
        {
            status: 'Processing',
            date: '15/10/2020 14:00',
            icon: IconCog,
            color: '#673AB7'
        },
        {
            status: 'Shipped',
            date: '15/10/2020 16:15',
            icon: IconEnvelope,
            color: '#FF9800'
        },
        {
            status: 'Delivered',
            date: '16/10/2020 10:00',
            icon: IconCheck,
            color: '#607D8B'
        }
    ]);

    const horizontalEvents = ref<string[]>(['2020', '2021', '2022', '2023']);
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Left Align</div>
                <Timeline :value="events">
                    <template #content="slotProps">
                        {{ slotProps.item.status }}
                    </template>
                </Timeline>
            </div>
        </div>
        <div class="col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Right Align</div>
                <Timeline :value="events" align="right">
                    <template #content="slotProps">
                        {{ slotProps.item.status }}
                    </template>
                </Timeline>
            </div>
        </div>
        <div class="col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Alternate Align</div>
                <Timeline :value="events" align="alternate">
                    <template #content="slotProps">
                        {{ slotProps.item.status }}
                    </template>
                </Timeline>
            </div>
        </div>
        <div class="col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Opposite Content</div>
                <Timeline :value="events">
                    <template #opposite="slotProps">
                        <small class="text-muted-foreground">{{ slotProps.item.date }}</small>
                    </template>
                    <template #content="slotProps">
                        {{ slotProps.item.status }}
                    </template>
                </Timeline>
            </div>
        </div>
        <div class="col-span-full">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Templating</div>
                <Timeline :value="events" align="alternate" class="customized-timeline">
                    <template #marker="slotProps">
                        <span class="flex w-8 h-8 items-center justify-center text-white rounded-full z-10 shadow-sm" :style="{ backgroundColor: slotProps.item.color }">
                            <component :is="slotProps.item.icon" class="size-4" />
                        </span>
                    </template>
                    <template #content="slotProps">
                        <Card class="mt-4">
                            <CardHeader>
                                <CardTitle>{{ slotProps.item.status }}</CardTitle>
                                <CardDescription>{{ slotProps.item.date }}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <img v-if="slotProps.item.image" :src="`https://primefaces.org/cdn/primevue/images/product/${slotProps.item.image}`" :alt="slotProps.item.status" width="200" class="shadow-sm" />
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse,
                                    cupiditate neque quas!
                                </p>
                                <Button variant="ghost">Read more</Button>
                            </CardContent>
                        </Card>
                    </template>
                </Timeline>
            </div>
        </div>
        <div class="col-span-full">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Horizontal</div>
                <div class="font-semibold mb-2">Top Align</div>
                <Timeline :value="horizontalEvents" layout="horizontal" align="top">
                    <template #content="slotProps">
                        {{ slotProps.item }}
                    </template>
                </Timeline>

                <div class="font-semibold mt-4 mb-2">Bottom Align</div>
                <Timeline :value="horizontalEvents" layout="horizontal" align="bottom">
                    <template #content="slotProps">
                        {{ slotProps.item }}
                    </template>
                </Timeline>

                <div class="font-semibold mt-4 mb-2">Alternate Align</div>
                <Timeline :value="horizontalEvents" layout="horizontal" align="alternate">
                    <template #opposite> &nbsp; </template>
                    <template #content="slotProps">
                        {{ slotProps.item }}
                    </template>
                </Timeline>
            </div>
        </div>
    </div>
</template>

<style scoped>
    @media screen and (max-width: 960px) {
        /* The alternate layout needs both sides on one line once the card no longer fits beside the rail. */
        .customized-timeline :deep([data-slot='timeline-event'][data-side='right']) {
            flex-direction: row;
        }

        .customized-timeline :deep([data-slot='timeline-content']) {
            text-align: left;
        }

        .customized-timeline :deep([data-slot='timeline-opposite']) {
            flex: 0;
        }
    }
</style>
