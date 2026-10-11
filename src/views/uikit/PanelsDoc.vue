<script setup lang="ts">
    import { ref } from 'vue';
    import Divider from '@/components/Divider.vue';
    import Fieldset from '@/components/Fieldset.vue';
    import Panel from '@/components/Panel.vue';
    import SplitButton from '@/components/SplitButton.vue';
    import Toolbar from '@/components/Toolbar.vue';
    import { IconCheck, IconHome, IconPlus, IconPrint, IconRefresh, IconSearch, IconTrash, IconUpload, IconUser, IconUserPlus } from '@/components/icons';
    import { MenuList, type MenuModelItem } from '@/components/menu';
    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
    import { Label } from '@/components/ui/label';
    import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

    const items = ref<MenuModelItem[]>([
        {
            label: 'Save',
            icon: IconCheck
        },
        {
            label: 'Update',
            icon: IconUpload
        },
        {
            label: 'Delete',
            icon: IconTrash
        },
        {
            label: 'Home Page',
            icon: IconHome
        }
    ]);
    const cardMenu = ref<MenuModelItem[]>([
        { label: 'Save', icon: IconCheck },
        { label: 'Update', icon: IconRefresh },
        { label: 'Delete', icon: IconTrash }
    ]);
</script>

<template>
    <div class="flex flex-col">
        <div class="card">
            <div class="font-semibold text-xl mb-4">Toolbar</div>
            <Toolbar>
                <template #start>
                    <Button variant="ghost" size="icon" class="text-secondary-foreground" aria-label="Add"><IconPlus /></Button>
                    <Button variant="ghost" size="icon" class="text-secondary-foreground" aria-label="Print"><IconPrint /></Button>
                    <Button variant="ghost" size="icon" class="text-secondary-foreground" aria-label="Upload"><IconUpload /></Button>
                </template>

                <template #center>
                    <InputGroup>
                        <InputGroupAddon><IconSearch /></InputGroupAddon>
                        <InputGroupInput placeholder="Search" />
                    </InputGroup>
                </template>

                <template #end><SplitButton label="Save" :model="items" /></template>
            </Toolbar>
        </div>

        <div class="flex flex-col md:flex-row gap-8">
            <div class="md:w-1/2">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Accordion</div>
                    <Accordion type="single" default-value="0" collapsible>
                        <AccordionItem value="0">
                            <AccordionTrigger>Header I</AccordionTrigger>
                            <AccordionContent>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                                    commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
                                    anim id est laborum.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="1">
                            <AccordionTrigger>Header II</AccordionTrigger>
                            <AccordionContent>
                                <p>
                                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt
                                    explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non
                                    numquam eius modi.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="2">
                            <AccordionTrigger>Header III</AccordionTrigger>
                            <AccordionContent>
                                <p>
                                    At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique
                                    sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
                                    impedit quo minus.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Tabs</div>
                    <Tabs default-value="0">
                        <TabsList>
                            <TabsTrigger value="0">Header I</TabsTrigger>
                            <TabsTrigger value="1">Header II</TabsTrigger>
                            <TabsTrigger value="2">Header III</TabsTrigger>
                        </TabsList>
                        <TabsContent value="0">
                            <p class="m-0">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                                commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
                                id est laborum.
                            </p>
                        </TabsContent>
                        <TabsContent value="1">
                            <p class="m-0">
                                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                            </p>
                        </TabsContent>
                        <TabsContent value="2">
                            <p class="m-0">
                                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt
                                in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo
                                minus.
                            </p>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <div class="md:w-1/2 mt-6 md:mt-0">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Panel</div>
                    <Panel header="Header" toggleable>
                        <p class="leading-normal m-0">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                            laborum.
                        </p>
                    </Panel>
                </div>
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Fieldset</div>
                    <Fieldset legend="Legend" toggleable>
                        <p class="leading-normal m-0">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                            laborum.
                        </p>
                    </Fieldset>
                </div>

                <Card>
                    <CardHeader>
                        <div class="flex items-center justify-between">
                            <CardTitle class="text-xl font-semibold">Card</CardTitle>
                            <MenuList :model="cardMenu" popup>
                                <template #trigger>
                                    <Button variant="ghost" size="icon" aria-label="Card options"><IconPlus /></Button>
                                </template>
                            </MenuList>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p class="leading-normal m-0">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                            laborum.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>

        <div class="card mt-8">
            <div class="font-semibold text-xl mb-4">Divider</div>
            <div class="flex flex-col md:flex-row">
                <div class="w-full md:w-5/12 flex flex-col items-center justify-center gap-3 py-5">
                    <div class="flex flex-col gap-2">
                        <Label for="username">Username</Label>
                        <Input id="username" type="text" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <Label for="password">Password</Label>
                        <Input id="password" type="password" class="w-full" />
                    </div>
                    <div class="flex">
                        <Button class="w-full max-w-[17.35rem] mx-auto"><IconUser />Login</Button>
                    </div>
                </div>
                <div class="w-full md:w-2/12">
                    <Divider layout="vertical" class="hidden! md:flex!"><b>OR</b></Divider>
                    <Divider layout="horizontal" class="flex! md:hidden!" align="center"><b>OR</b></Divider>
                </div>
                <div class="w-full md:w-5/12 flex items-center justify-center py-5">
                    <Button variant="success" class="w-full max-w-[17.35rem] mx-auto"><IconUserPlus />Sign Up</Button>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="font-semibold text-xl mb-4">Splitter</div>
            <ResizablePanelGroup direction="horizontal" class="mb-8 h-75 rounded-lg border border-border">
                <ResizablePanel :default-size="30" :min-size="10">
                    <div class="flex h-full items-center justify-center">Panel 1</div>
                </ResizablePanel>
                <ResizableHandle with-handle />
                <ResizablePanel :default-size="70">
                    <!-- Reka requires a group's sizes to total 100; otherwise it logs a warning on every load, production
                         included, and rescales them. 23 and 77 keep the intended 15:50 split without the warning. -->
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel :default-size="23">
                            <div class="flex h-full items-center justify-center">Panel 2</div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel :default-size="77">
                            <div class="flex h-full items-center justify-center">Panel 3</div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    </div>
</template>
