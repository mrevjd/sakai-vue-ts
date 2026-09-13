<script setup lang="ts">
    import { Button } from '@/components/ui/button';
    import { Separator } from '@/components/ui/separator';
    import { IconCheck } from '@/components/icons';
</script>

<template>
    <div id="pricing" class="py-6 px-6 lg:px-20 my-2 md:my-6">
        <div class="text-center mb-6">
            <div class="text-foreground font-normal mb-2 text-4xl">Matchless Pricing</div>
            <span class="text-muted-foreground text-xxl">Amet consectetur adipiscing elit...</span>
        </div>

        <div class="grid grid-cols-12 gap-4 justify-between mt-20 md:mt-0">
            <div class="col-span-12 lg:col-span-4 p-0 md:p-4">
                <div class="p-4 flex flex-col border-border pricing-card cursor-pointer border-2 hover:border-primary duration-300 transition-all" style="border-radius: 10px">
                    <div class="text-foreground text-center my-8 text-3xl">Free</div>
                    <img src="/demo/images/landing/free.svg" class="w-10/12 mx-auto" alt="free" />
                    <div class="my-8 flex flex-col items-center gap-4">
                        <div class="flex items-center">
                            <span class="text-5xl font-bold mr-2 text-foreground">$0</span>
                            <span class="text-muted-foreground">per month</span>
                        </div>
                        <Button class="ml-4 rounded-full bg-blue-500 font-light text-white hover:bg-blue-500/90">Get Started</Button>
                    </div>
                    <Separator class="w-full" />
                    <ul class="my-8 list-none p-0 flex text-foreground flex-col px-8">
                        <li class="py-2">
                            <IconCheck class="mr-2 inline size-5 text-cyan-500" />
                            <span class="text-xl leading-normal">Responsive Layout</span>
                        </li>
                        <li class="py-2">
                            <IconCheck class="mr-2 inline size-5 text-cyan-500" />
                            <span class="text-xl leading-normal">Unlimited Push Messages</span>
                        </li>
                        <li class="py-2">
                            <IconCheck class="mr-2 inline size-5 text-cyan-500" />
                            <span class="text-xl leading-normal">50 Support Ticket</span>
                        </li>
                        <li class="py-2">
                            <IconCheck class="mr-2 inline size-5 text-cyan-500" />
                            <span class="text-xl leading-normal">Free Shipping</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4 p-0 md:p-4 mt-6 md:mt-0">
                <div class="p-4 flex flex-col border-border pricing-card cursor-pointer border-2 hover:border-primary duration-300 transition-all" style="border-radius: 10px">
                    <div class="text-foreground text-center my-8 text-3xl">Startup</div>
                    <img src="/demo/images/landing/startup.svg" class="w-10/12 mx-auto" alt="startup" />
                    <div class="my-8 flex flex-col items-center gap-4">
                        <div class="flex items-center">
                            <span class="text-5xl font-bold mr-2 text-foreground">$1</span>
                            <span class="text-muted-foreground">per month</span>
                        </div>
                        <Button class="ml-4 rounded-full bg-blue-500 font-light text-white hover:bg-blue-500/90">Get Started</Button>
                    </div>
                    <Separator class="w-full" />
                    <ul class="my-8 list-none p-0 flex text-foreground flex-col px-8">
                        <li class="py-2">
                            <IconCheck class="mr-2 inline size-5 text-cyan-500" />
                            <span class="text-xl leading-normal">Responsive Layout</span>
                        </li>
                        <li class="py-2">
                            <IconCheck class="mr-2 inline size-5 text-cyan-500" />
                            <span class="text-xl leading-normal">Unlimited Push Messages</span>
                        </li>
                        <li class="py-2">
                            <IconCheck class="mr-2 inline size-5 text-cyan-500" />
                            <span class="text-xl leading-normal">50 Support Ticket</span>
                        </li>
                        <li class="py-2">
                            <IconCheck class="mr-2 inline size-5 text-cyan-500" />
                            <span class="text-xl leading-normal">Free Shipping</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4 p-0 md:p-4 mt-6 md:mt-0">
                <div class="p-4 flex flex-col border-border pricing-card cursor-pointer border-2 hover:border-primary duration-300 transition-all" style="border-radius: 10px">
                    <div class="text-foreground text-center my-8 text-3xl">Enterprise</div>
                    <img src="/demo/images/landing/enterprise.svg" class="w-10/12 mx-auto" alt="enterprise" />
                    <div class="my-8 flex flex-col items-center gap-4">
                        <div class="flex items-center">
                            <span class="text-5xl font-bold mr-2 text-foreground">$5</span>
                            <span class="text-muted-foreground">per month</span>
                        </div>
                        <Button class="ml-4 rounded-full bg-blue-500 font-light text-white hover:bg-blue-500/90">Get Started</Button>
                    </div>
                    <Separator class="w-full" />
                    <ul class="my-8 list-none p-0 flex text-foreground flex-col px-8">
                        <li class="py-2">
                            <IconCheck class="mr-2 inline size-5 text-cyan-500" />
                            <span class="text-xl leading-normal">Responsive Layout</span>
                        </li>
                        <li class="py-2">
                            <IconCheck class="mr-2 inline size-5 text-cyan-500" />
                            <span class="text-xl leading-normal">Unlimited Push Messages</span>
                        </li>
                        <li class="py-2">
                            <IconCheck class="mr-2 inline size-5 text-cyan-500" />
                            <span class="text-xl leading-normal">50 Support Ticket</span>
                        </li>
                        <li class="py-2">
                            <IconCheck class="mr-2 inline size-5 text-cyan-500" />
                            <span class="text-xl leading-normal">Free Shipping</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
