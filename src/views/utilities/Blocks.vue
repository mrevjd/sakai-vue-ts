<script setup lang="ts">
    import { ref } from 'vue';
    import BlockViewer from '@/components/BlockViewer.vue';
    import Chip from '@/components/Chip.vue';
    import PasswordInput from '@/components/PasswordInput.vue';
    import {
        IconAngleRight,
        IconCheck,
        IconCheckCircle,
        IconClock,
        IconDesktop,
        IconDiscord,
        IconEnvelope,
        IconFaceSmile,
        IconFile,
        IconGithub,
        IconGlobe,
        IconLock,
        IconMapMarker,
        IconPenToSquare,
        IconShield,
        IconTimes,
        IconUser,
        IconUserPlus,
        IconUsers
    } from '@/components/icons';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Input } from '@/components/ui/input';
    import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
    import { blocksCode } from './blocksCode';

    const password = ref('');
    const checked1 = ref(true);
</script>

<template>
    <div>
        <!-- Page Hero Section -->
        <div class="bg-card border border-border rounded-xl p-8 bg-[url('/demo/images/blocks/landing-blocks.jpg')] dark:bg-[url('/demo/images/blocks/landing-blocks-dark.jpg')] bg-cover bg-no-repeat h-[440px] flex mb-8">
            <div class="flex flex-col gap-4 items-center sm:items-start justify-center sm:max-w-144">
                <span class="bg-zinc-950 text-white px-2 py-1 font-bold rounded-md text-sm">TailwindCSS v4</span>
                <div class="flex items-center gap-4">
                    <span class="font-bold text-4xl text-foreground">Blocks</span>
                </div>
                <p class="text-muted-foreground text-lg text-center sm:text-start">Ready-to-use UI blocks for building beautiful applications. A comprehensive collection of components designed to speed up your development process.</p>
                <div class="flex gap-2">
                    <Button as="a" href="https://www.shadcn-vue.com/blocks" target="_blank" rel="noopener noreferrer">Explore Blocks</Button>
                </div>
            </div>
        </div>

        <!-- Blocks Showcase -->
        <BlockViewer header="Hero" :code="blocksCode.hero" free>
            <div class="relative min-h-160 lg:min-h-0 bg-card flex lg:flex-row flex-col">
                <div class="flex lg:flex lg:flex-row flex-col justify-center md:justify-normal h-full flex-1">
                    <div class="relative flex-1 z-20 flex items-center justify-center">
                        <div class="flex items-center justify-center h-full">
                            <div class="w-full max-w-2xl px-6 py-12 lg:p-12 xl:p-16 text-center lg:text-left">
                                <h1 class="text-4xl xl:text-5xl font-bold text-white lg:text-foreground mb-6 leading-tight!">
                                    <span class="block">Create the screens your</span>
                                    <span class="block text-primary">visitors deserve to see</span>
                                </h1>

                                <p class="text-white/90 lg:text-muted-foreground text-xl leading-normal mb-8 max-w-xl lg:max-w-none">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                </p>

                                <div class="flex items-center gap-4 justify-center lg:justify-start">
                                    <Button type="button">Learn More</Button>
                                    <Button variant="outline" type="button">Live Demo</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="absolute lg:relative inset-0 lg:inset-auto flex-1">
                        <div class="absolute lg:hidden inset-0 bg-zinc-900/60 dark:bg-zinc-900/80 z-10" />
                        <img src="https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/hero/hero-1.png" alt="hero-1" class="h-full w-full object-cover xl:[clip-path:polygon(12%_0,100%_0%,100%_100%,0_100%)]" />
                    </div>
                </div>
            </div>
        </BlockViewer>

        <!-- Feature Block -->
        <BlockViewer header="Feature" :code="blocksCode.feature" free>
            <div class="bg-card px-6 md:px-12 lg:px-20 py-20 text-center">
                <div class="flex flex-col gap-6">
                    <div class="flex flex-col items-center gap-4">
                        <div class="font-bold text-3xl leading-tight">
                            <span class="text-foreground">One Product, </span>
                            <span class="text-primary">Many Solutions</span>
                        </div>
                        <div class="text-muted-foreground leading-tight">Ac turpis egestas maecenas pharetra convallis posuere morbi leo urna.</div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div class="w-full rounded-md p-4">
                            <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-card shadow mx-auto">
                                <IconDesktop class="size-6 lg:size-8 text-primary" />
                            </span>
                            <div class="flex flex-col gap-1">
                                <div class="text-foreground text-xl font-medium leading-tight">Built for Developers</div>
                                <p class="text-muted-foreground leading-normal">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                            </div>
                        </div>
                        <div class="w-full rounded-md p-4">
                            <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-card shadow mx-auto">
                                <IconLock class="size-6 lg:size-8 text-primary" />
                            </span>
                            <div class="flex flex-col gap-1">
                                <div class="text-foreground text-xl font-medium leading-tight">End-to-End Encryption</div>
                                <p class="text-muted-foreground leading-normal">Risus nec feugiat in fermentum posuere urna nec. Posuere sollicitudin aliquam ultrices sagittis.</p>
                            </div>
                        </div>
                        <div class="w-full rounded-md p-4">
                            <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-card shadow mx-auto">
                                <IconFaceSmile class="size-6 lg:size-8 text-primary" />
                            </span>
                            <div class="flex flex-col gap-1">
                                <div class="text-foreground text-xl font-medium leading-tight">Easy to Use</div>
                                <p class="text-muted-foreground leading-normal">Ornare suspendisse sed nisi lacus sed viverra tellus. Neque volutpat ac tincidunt vitae semper.</p>
                            </div>
                        </div>
                        <div class="w-full rounded-md p-4">
                            <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-card shadow mx-auto">
                                <IconGlobe class="size-6 lg:size-8 text-primary" />
                            </span>
                            <div class="flex flex-col gap-1">
                                <div class="text-foreground text-xl font-medium leading-tight">Fast & Global Support</div>
                                <p class="text-muted-foreground leading-normal">Fermentum et sollicitudin ac orci phasellus egestas tellus rutrum tellus.</p>
                            </div>
                        </div>
                        <div class="w-full rounded-md p-4">
                            <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-card shadow mx-auto">
                                <IconGithub class="size-6 lg:size-8 text-primary" />
                            </span>
                            <div class="flex flex-col gap-1">
                                <div class="text-foreground text-xl font-medium leading-tight">Open Source</div>
                                <p class="text-muted-foreground leading-normal">Nec tincidunt praesent semper feugiat. Sed adipiscing diam donec adipiscing tristique risus nec feugiat.</p>
                            </div>
                        </div>
                        <div class="w-full rounded-md p-4">
                            <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-card shadow mx-auto">
                                <IconShield class="size-6 lg:size-8 text-primary" />
                            </span>
                            <div class="flex flex-col gap-1">
                                <div class="text-foreground text-xl font-medium leading-tight">Trusted Security</div>
                                <p class="text-muted-foreground leading-normal">Mattis rhoncus urna neque viverra justo nec ultrices. Id cursus metus aliquam eleifend.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BlockViewer>

        <!-- Glassmorphism Card Block -->
        <BlockViewer header="Card" :code="blocksCode.glass" free>
            <div
                class="px-6 py-20 md:px-20 lg:px-80 flex items-center justify-center backdrop-blur-3xl bg-cover! bg-center! bg-no-repeat!"
                style="background-image: url('https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/signin/signin-glass.jpg')"
            >
                <div class="px-8 md:px-12 lg:px-20 py-12 flex flex-col items-center gap-12 w-full backdrop-blur-2xl rounded-2xl bg-white/10 border border-white/10 max-w-xl">
                    <div class="flex flex-col items-center gap-4 w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14" width="33" height="32" viewBox="0 0 33 32" fill="none">
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M7.09219 2.87829C5.94766 3.67858 4.9127 4.62478 4.01426 5.68992C7.6857 5.34906 12.3501 5.90564 17.7655 8.61335C23.5484 11.5047 28.205 11.6025 31.4458 10.9773C31.1517 10.087 30.7815 9.23135 30.343 8.41791C26.6332 8.80919 21.8772 8.29127 16.3345 5.51998C12.8148 3.76014 9.71221 3.03521 7.09219 2.87829ZM28.1759 5.33332C25.2462 2.06 20.9887 0 16.25 0C14.8584 0 13.5081 0.177686 12.2209 0.511584C13.9643 0.987269 15.8163 1.68319 17.7655 2.65781C21.8236 4.68682 25.3271 5.34013 28.1759 5.33332ZM32.1387 14.1025C28.2235 14.8756 22.817 14.7168 16.3345 11.4755C10.274 8.44527 5.45035 8.48343 2.19712 9.20639C2.0292 9.24367 1.86523 9.28287 1.70522 9.32367C1.2793 10.25 0.939308 11.2241 0.695362 12.2356C0.955909 12.166 1.22514 12.0998 1.50293 12.0381C5.44966 11.161 11.0261 11.1991 17.7655 14.5689C23.8261 17.5991 28.6497 17.561 31.9029 16.838C32.0144 16.8133 32.1242 16.7877 32.2322 16.7613C32.2441 16.509 32.25 16.2552 32.25 16C32.25 15.358 32.2122 14.7248 32.1387 14.1025ZM31.7098 20.1378C27.8326 20.8157 22.5836 20.5555 16.3345 17.431C10.274 14.4008 5.45035 14.439 2.19712 15.1619C1.475 15.3223 0.825392 15.5178 0.252344 15.7241C0.250782 15.8158 0.25 15.9078 0.25 16C0.25 24.8366 7.41344 32 16.25 32C23.6557 32 29.8862 26.9687 31.7098 20.1378Z"
                                class="fill-white"
                            />
                        </svg>
                        <div class="flex flex-col gap-2 w-full">
                            <div class="text-center text-3xl font-medium text-white leading-tight">Welcome Back</div>
                            <div class="text-center">
                                <span class="text-white/80">Don't have an account? </span>
                                <a class="text-white/80 cursor-pointer hover:text-white/90 underline">Sign up</a>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-center gap-8 w-full">
                        <div class="flex flex-col gap-6 w-full">
                            <InputGroup class="w-full! border! border-white/10! bg-white/10! rounded-3xl! shadow-sm!">
                                <InputGroupAddon><IconUser class="text-white/70!" /></InputGroupAddon>
                                <InputGroupInput type="text" class="appearance-none! outline-0! text-white! placeholder:text-white/70!" placeholder="Username" />
                            </InputGroup>
                            <InputGroup class="w-full! border! border-white/10! bg-white/10! rounded-3xl! shadow-sm!">
                                <InputGroupAddon><IconLock class="text-white/70!" /></InputGroupAddon>
                                <InputGroupInput type="password" class="appearance-none! outline-0! text-white! placeholder:text-white/70!" placeholder="Password" />
                            </InputGroup>
                        </div>
                        <Button class="w-full! rounded-3xl! bg-zinc-950! border! border-zinc-950! text-white! hover:bg-zinc-950/80!">Sign In</Button>
                    </div>
                    <a class="text-white/80 cursor-pointer hover:text-white/90">Forgot Password?</a>
                </div>
            </div>
        </BlockViewer>

        <!-- Pricing Block -->
        <BlockViewer header="Pricing" :code="blocksCode.pricing" free>
            <div class="bg-card px-6 py-20 md:px-12 lg:px-20">
                <div class="flex flex-col gap-4 items-center justify-center mb-12">
                    <div class="text-foreground font-bold text-4xl lg:text-5xl text-center leading-tight">Pricing Plans</div>
                    <div class="text-muted-foreground text-lg text-center leading-normal">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Velit numquam eligendi quos.</div>
                </div>

                <div class="flex lg:flex-row flex-col gap-8 max-w-7xl mx-auto">
                    <div class="w-full flex-1 p-8 flex rounded-2xl flex-col bg-card shadow-sm gap-6">
                        <div class="flex flex-col gap-2">
                            <h4 class="text-foreground font-medium text-xl leading-tight">Basic</h4>
                            <p class="text-muted-foreground leading-normal">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Velit numquam eligendi quos.</p>
                        </div>

                        <div class="w-full h-px bg-border" />
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-3xl text-foreground leading-tight">$9</span>
                            <span class="font-medium text-muted-foreground leading-tight">per month</span>
                        </div>
                        <div class="w-full h-px bg-border" />
                        <ul class="list-none flex flex-col gap-4 flex-1">
                            <li class="flex items-center gap-2">
                                <IconCheckCircle class="size-4.5 text-green-500" />
                                <span class="text-foreground leading-tight"> Arcu vitae elementum </span>
                            </li>
                            <li class="flex items-center gap-2">
                                <IconCheckCircle class="size-4.5 text-green-500" />
                                <span class="text-foreground leading-tight"> Dui faucibus in ornare </span>
                            </li>
                            <li class="flex items-center gap-2">
                                <IconCheckCircle class="size-4.5 text-green-500" />
                                <span class="text-foreground leading-tight"> Morbi tincidunt augue </span>
                            </li>
                        </ul>
                        <Button class="w-full rounded-full">Buy Now</Button>
                    </div>
                    <div class="w-full flex-1 p-8 flex rounded-2xl flex-col bg-card shadow-sm gap-6">
                        <div class="flex flex-col gap-2">
                            <h4 class="text-foreground font-medium text-xl leading-tight">Premium</h4>
                            <p class="text-muted-foreground leading-normal">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Velit numquam eligendi quos.</p>
                        </div>

                        <div class="w-full h-px bg-border" />
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-3xl text-foreground leading-tight">$29</span>
                            <span class="font-medium text-muted-foreground leading-tight">per month</span>
                        </div>
                        <div class="w-full h-px bg-border" />
                        <ul class="list-none flex flex-col gap-4 flex-1">
                            <li class="flex items-center gap-2">
                                <IconCheckCircle class="size-4.5 text-green-500" />
                                <span class="text-foreground leading-tight"> Arcu vitae elementum </span>
                            </li>
                            <li class="flex items-center gap-2">
                                <IconCheckCircle class="size-4.5 text-green-500" />
                                <span class="text-foreground leading-tight"> Dui faucibus in ornare </span>
                            </li>
                            <li class="flex items-center gap-2">
                                <IconCheckCircle class="size-4.5 text-green-500" />
                                <span class="text-foreground leading-tight"> Morbi tincidunt augue </span>
                            </li>
                            <li class="flex items-center gap-2">
                                <IconCheckCircle class="size-4.5 text-green-500" />
                                <span class="text-foreground leading-tight"> Duis ultricies lacus sed </span>
                            </li>
                        </ul>
                        <Button class="w-full rounded-full">Buy Now</Button>
                    </div>
                    <div class="w-full flex-1 p-8 flex rounded-2xl flex-col bg-card shadow-sm gap-6">
                        <div class="flex flex-col gap-2">
                            <h4 class="text-foreground font-medium text-xl leading-tight">Enterprise</h4>
                            <p class="text-muted-foreground leading-normal">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Velit numquam eligendi quos.</p>
                        </div>

                        <div class="w-full h-px bg-border" />
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-3xl text-foreground leading-tight">$49</span>
                            <span class="font-medium text-muted-foreground leading-tight">per month</span>
                        </div>
                        <div class="w-full h-px bg-border" />
                        <ul class="list-none flex flex-col gap-4 flex-1">
                            <li class="flex items-center gap-2">
                                <IconCheckCircle class="size-4.5 text-green-500" />
                                <span class="text-foreground leading-tight"> Arcu vitae elementum </span>
                            </li>
                            <li class="flex items-center gap-2">
                                <IconCheckCircle class="size-4.5 text-green-500" />
                                <span class="text-foreground leading-tight"> Dui faucibus in ornare </span>
                            </li>
                            <li class="flex items-center gap-2">
                                <IconCheckCircle class="size-4.5 text-green-500" />
                                <span class="text-foreground leading-tight"> Morbi tincidunt augue </span>
                            </li>
                            <li class="flex items-center gap-2">
                                <IconCheckCircle class="size-4.5 text-green-500" />
                                <span class="text-foreground leading-tight"> Duis ultricies lacus sed </span>
                            </li>
                            <li class="flex items-center gap-2">
                                <IconCheckCircle class="size-4.5 text-green-500" />
                                <span class="text-foreground leading-tight"> Imperdiet proin </span>
                            </li>
                        </ul>
                        <Button class="w-full rounded-full">Buy Now</Button>
                    </div>
                </div>
            </div>
        </BlockViewer>

        <!-- Call to Action Block -->
        <BlockViewer header="Call to Action" :code="blocksCode.cta" free>
            <div class="bg-card px-6 py-20 md:px-12 lg:px-20">
                <div class="text-muted-foreground text-center flex flex-col items-center gap-4">
                    <div class="text-primary font-bold text-lg leading-tight"><IconDiscord class="inline size-4.5" />&nbsp;POWERED BY DISCORD</div>
                    <div class="text-foreground font-bold text-4xl leading-tight">Join our design community</div>
                    <div class="text-muted-foreground text-xl leading-normal">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Velit numquam eligendi quos.</div>
                    <Button class="mt-4 rounded-full"><IconDiscord />Join Now</Button>
                </div>
            </div>
        </BlockViewer>

        <!-- Banner Block -->
        <BlockViewer header="Banner" :code="blocksCode.banner" containerClass="bg-card" free>
            <div class="pb-20 bg-card">
                <div class="bg-foreground text-background py-4 px-6 lg:px-20 flex justify-between items-center flex-wrap">
                    <div class="font-bold">🔥 Hot Deals!</div>
                    <div class="inline-flex gap-1 items-center">
                        <span class="hidden lg:flex leading-normal">Libero voluptatum atque exercitationem praesentium provident odit.</span>
                        <a class="text-background underline font-bold" href="#">Learn More</a>
                    </div>
                    <Button variant="ghost" size="icon" class="rounded-full text-background! hover:bg-muted-foreground/20!" aria-label="Dismiss"><IconTimes /></Button>
                </div>
            </div>
        </BlockViewer>

        <!-- Page Heading Block -->
        <BlockViewer header="Page Heading" :code="blocksCode['page-heading']" free>
            <div class="bg-card px-6 py-8 md:px-12 lg:px-20">
                <ul class="list-none p-0 m-0 flex items-center font-medium mb-5">
                    <li>
                        <a class="text-muted-foreground no-underline leading-normal cursor-pointer">Application</a>
                    </li>
                    <li class="px-2">
                        <IconAngleRight class="size-3.5 text-muted-foreground" />
                    </li>
                    <li>
                        <span class="text-foreground leading-normal">Analytics</span>
                    </li>
                </ul>
                <div class="flex items-start flex-col md:justify-between md:flex-row">
                    <div>
                        <div class="font-bold text-3xl text-foreground mb-4">Customers</div>
                        <div class="flex items-center text-muted-foreground flex-wrap gap-8">
                            <div class="flex items-center gap-2">
                                <IconUsers class="size-4" />
                                <span>332 Active Users</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <IconGlobe class="size-4" />
                                <span>9.402 Sessions</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <IconClock class="size-4" />
                                <span>2.32m Avg. Duration</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6 md:mt-0 flex items-center">
                        <Button variant="outline" class="mr-3"><IconUserPlus />Add</Button>
                        <Button class="whitespace-nowrap"><IconCheck />Save Changes</Button>
                    </div>
                </div>
            </div>
        </BlockViewer>

        <!-- Stats Block -->
        <BlockViewer header="Stats" :code="blocksCode.stats" free>
            <div class="bg-card px-6 py-8 md:px-12 lg:px-20">
                <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div class="bg-card shadow-sm p-5 rounded-2xl">
                        <div class="flex justify-between gap-4">
                            <div class="flex flex-col gap-2">
                                <span class="text-muted-foreground font-normal leading-tight">Messages</span>
                                <div class="text-foreground font-semibold text-2xl! leading-tight!">152</div>
                            </div>
                            <div class="flex items-center justify-center bg-linear-to-b from-cyan-400 dark:from-cyan-300 to-cyan-600 dark:to-cyan-500 rounded-lg w-10 h-10">
                                <IconEnvelope class="size-5 text-background" />
                            </div>
                        </div>
                        <div class="mt-4">
                            <span class="text-muted-foreground font-medium leading-tight">24 new</span>
                            <span class="text-muted-foreground leading-tight"> since last visit</span>
                        </div>
                    </div>

                    <div class="bg-card shadow-sm p-5 rounded-2xl">
                        <div class="flex justify-between gap-4">
                            <div class="flex flex-col gap-2">
                                <span class="text-muted-foreground font-normal leading-tight">Check-ins</span>
                                <div class="text-foreground font-semibold text-2xl! leading-tight!">532</div>
                            </div>
                            <div class="flex items-center justify-center bg-linear-to-b from-orange-400 dark:from-orange-300 to-orange-600 dark:to-orange-500 rounded-lg w-10 h-10">
                                <IconMapMarker class="size-5 text-background" />
                            </div>
                        </div>
                        <div class="mt-4">
                            <span class="text-muted-foreground font-medium leading-tight">48 new</span>
                            <span class="text-muted-foreground leading-tight"> since last visit</span>
                        </div>
                    </div>

                    <div class="bg-card shadow-sm p-5 rounded-2xl">
                        <div class="flex justify-between gap-4">
                            <div class="flex flex-col gap-2">
                                <span class="text-muted-foreground font-normal leading-tight">Files Synced</span>
                                <div class="text-foreground font-semibold text-2xl! leading-tight!">28.441</div>
                            </div>
                            <div class="flex items-center justify-center bg-linear-to-b from-slate-400 dark:from-slate-300 to-slate-600 dark:to-slate-500 rounded-lg w-10 h-10">
                                <IconFile class="size-5 text-background" />
                            </div>
                        </div>
                        <div class="mt-4">
                            <span class="text-muted-foreground leading-tight">32,56 / 250 GB</span>
                        </div>
                    </div>

                    <div class="bg-card shadow-sm p-5 rounded-2xl">
                        <div class="flex justify-between gap-4">
                            <div class="flex flex-col gap-2">
                                <span class="text-muted-foreground font-normal leading-tight">Users Online</span>
                                <div class="text-foreground font-semibold text-2xl! leading-tight!">25.660</div>
                            </div>
                            <div class="flex items-center justify-center bg-linear-to-b from-violet-400 dark:from-violet-300 to-violet-600 dark:to-violet-500 rounded-lg w-10 h-10">
                                <IconUsers class="size-5 text-background" />
                            </div>
                        </div>
                        <div class="mt-4">
                            <span class="text-muted-foreground font-medium leading-tight">72 new</span>
                            <span class="text-muted-foreground leading-tight"> user this week</span>
                        </div>
                    </div>
                </div>
            </div>
        </BlockViewer>

        <!-- Sign-In Block -->
        <BlockViewer header="Sign-In" :code="blocksCode['sign-in']" containerClass="" free>
            <div class="bg-card px-6 py-20 md:px-12 lg:px-20 flex items-center justify-center">
                <div class="bg-card p-8 md:p-12 shadow-sm rounded-2xl w-full max-w-xl mx-auto flex flex-col gap-8">
                    <div class="flex flex-col items-center gap-4">
                        <div class="flex items-center gap-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14" width="33" height="32" viewBox="0 0 33 32" fill="none">
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M7.09219 2.87829C5.94766 3.67858 4.9127 4.62478 4.01426 5.68992C7.6857 5.34906 12.3501 5.90564 17.7655 8.61335C23.5484 11.5047 28.205 11.6025 31.4458 10.9773C31.1517 10.087 30.7815 9.23135 30.343 8.41791C26.6332 8.80919 21.8772 8.29127 16.3345 5.51998C12.8148 3.76014 9.71221 3.03521 7.09219 2.87829ZM28.1759 5.33332C25.2462 2.06 20.9887 0 16.25 0C14.8584 0 13.5081 0.177686 12.2209 0.511584C13.9643 0.987269 15.8163 1.68319 17.7655 2.65781C21.8236 4.68682 25.3271 5.34013 28.1759 5.33332ZM32.1387 14.1025C28.2235 14.8756 22.817 14.7168 16.3345 11.4755C10.274 8.44527 5.45035 8.48343 2.19712 9.20639C2.0292 9.24367 1.86523 9.28287 1.70522 9.32367C1.2793 10.25 0.939308 11.2241 0.695362 12.2356C0.955909 12.166 1.22514 12.0998 1.50293 12.0381C5.44966 11.161 11.0261 11.1991 17.7655 14.5689C23.8261 17.5991 28.6497 17.561 31.9029 16.838C32.0144 16.8133 32.1242 16.7877 32.2322 16.7613C32.2441 16.509 32.25 16.2552 32.25 16C32.25 15.358 32.2122 14.7248 32.1387 14.1025ZM31.7098 20.1378C27.8326 20.8157 22.5836 20.5555 16.3345 17.431C10.274 14.4008 5.45035 14.439 2.19712 15.1619C1.475 15.3223 0.825392 15.5178 0.252344 15.7241C0.250782 15.8158 0.25 15.9078 0.25 16C0.25 24.8366 7.41344 32 16.25 32C23.6557 32 29.8862 26.9687 31.7098 20.1378Z"
                                    class="fill-foreground"
                                />
                            </svg>
                        </div>
                        <div class="flex flex-col items-center gap-2 w-full">
                            <div class="text-foreground text-2xl font-semibold leading-tight text-center w-full">Welcome Back</div>
                            <div class="text-center w-full">
                                <span class="text-muted-foreground leading-normal">Don't have an account?</span>
                                <a class="text-primary font-medium ml-1 cursor-pointer hover:text-primary/80">Create today!</a>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-6 w-full">
                        <div class="flex flex-col gap-2 w-full">
                            <label for="email1" class="text-foreground font-medium leading-normal">Email Address</label>
                            <Input id="email1" type="text" placeholder="Email address" class="w-full px-3 py-2 shadow-sm rounded-lg" />
                        </div>
                        <div class="flex flex-col gap-2 w-full">
                            <label for="password1" class="text-foreground font-medium leading-normal">Password</label>
                            <PasswordInput id="password1" v-model="password" placeholder="Password" :feedback="false" class="w-full" />
                        </div>
                        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-0">
                            <div class="flex items-center gap-2">
                                <Checkbox id="rememberme1" v-model="checked1" />
                                <label for="rememberme1" class="text-foreground leading-normal">Remember me</label>
                            </div>
                            <a class="text-primary font-medium cursor-pointer hover:text-primary/80">Forgot your password?</a>
                        </div>
                    </div>
                    <Button class="w-full py-2 rounded-lg flex justify-center items-center gap-2"><IconUser />Sign In</Button>
                </div>
            </div>
        </BlockViewer>

        <!-- Description List Block -->
        <BlockViewer header="Description List" :code="blocksCode['description-list']" free>
            <div class="bg-card px-8 md:px-20 py-12 md:py-20 lg:px-80">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2 pb-4">
                        <div class="font-semibold text-xl text-foreground leading-tight">Movie Information</div>
                        <div class="text-muted-foreground text-base leading-tight">Morbi tristique blandit turpis. In viverra ligula id nulla hendrerit rutrum.</div>
                    </div>

                    <div class="border-t border-border" />

                    <div class="flex flex-col gap-4">
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex items-center gap-4 flex-1">
                                <div class="w-[140px] text-foreground font-medium text-base leading-tight">Title</div>
                                <div class="flex-1 text-foreground text-base leading-tight">Heat</div>
                            </div>
                            <div class="flex justify-end">
                                <Button variant="outline" size="icon" class="shrink-0 rounded-full" aria-label="Edit title"><IconPenToSquare /></Button>
                            </div>
                        </div>

                        <div class="border-t border-border" />

                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex items-center gap-4 flex-1">
                                <div class="w-[140px] text-foreground font-medium text-base leading-tight">Genre</div>
                                <div class="flex-1 flex flex-wrap gap-2">
                                    <Chip label="Crime" />
                                    <Chip label="Drama" />
                                    <Chip label="Thriller" />
                                </div>
                            </div>
                            <div class="flex justify-end">
                                <Button variant="outline" size="icon" class="shrink-0 rounded-full" aria-label="Edit genre"><IconPenToSquare /></Button>
                            </div>
                        </div>

                        <div class="border-t border-border" />

                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex items-center gap-4 flex-1">
                                <div class="w-[140px] text-foreground font-medium text-base leading-tight">Director</div>
                                <div class="flex-1 text-foreground text-base leading-tight">Michael Mann</div>
                            </div>
                            <div class="flex justify-end">
                                <Button variant="outline" size="icon" class="shrink-0 rounded-full" aria-label="Edit director"><IconPenToSquare /></Button>
                            </div>
                        </div>

                        <div class="border-t border-border" />

                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex items-center gap-4 flex-1">
                                <div class="w-[140px] text-foreground font-medium text-base leading-tight">Writer</div>
                                <div class="flex-1 text-foreground text-base leading-tight">Michael Mann</div>
                            </div>
                            <div class="flex justify-end">
                                <Button variant="outline" size="icon" class="shrink-0 rounded-full" aria-label="Edit writer"><IconPenToSquare /></Button>
                            </div>
                        </div>

                        <div class="border-t border-border" />

                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex items-start gap-4 flex-1">
                                <div class="w-[140px] text-foreground font-medium text-base leading-tight">Plot</div>
                                <div class="flex-1 text-foreground text-base leading-normal">A group of professional bank robbers start to feel the heat from police when they unknowingly leave a clue at their latest heist.</div>
                            </div>
                            <div class="flex justify-end">
                                <Button variant="outline" size="icon" class="shrink-0 rounded-full" aria-label="Edit plot"><IconPenToSquare /></Button>
                            </div>
                        </div>

                        <div class="border-t border-border" />
                    </div>
                </div>
            </div>
        </BlockViewer>

        <!-- Card Block -->
        <BlockViewer header="Card" :code="blocksCode.card" free>
            <div class="bg-card px-6 py-20 md:px-12 lg:px-20">
                <div class="bg-card p-6 shadow rounded-2xl flex flex-col gap-4">
                    <div class="flex gap-4">
                        <div class="flex flex-col gap-2 flex-1">
                            <div class="text-2xl leading-tight font-semibold text-foreground">Card Title</div>
                            <div class="text-base leading-tight text-muted-foreground">Vivamus id nisl interdum, blandit augue sit amet, eleifend mi.</div>
                        </div>
                    </div>
                    <div class="flex flex-1">
                        <div class="flex-1 border-2 border-dashed border-border rounded-lg h-[150px]" />
                    </div>
                </div>
            </div>
        </BlockViewer>
    </div>
</template>
