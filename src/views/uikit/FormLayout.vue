<script setup lang="ts">
    import { toTypedSchema } from '@vee-validate/zod';
    import type { SubmissionContext } from 'vee-validate';
    import { computed, ref } from 'vue';
    import { z } from 'zod';
    import PasswordInput from '@/components/PasswordInput.vue';
    import QuillEditor from '@/components/QuillEditor.vue';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Textarea } from '@/components/ui/textarea';
    import { showToast } from '@/composables/useToast';
    import { sanitizeHtml } from '@/utils/sanitize';

    const dropdownItems = ref<{ name: string; code: string }[]>([
        { name: 'Option 1', code: 'Option 1' },
        { name: 'Option 2', code: 'Option 2' },
        { name: 'Option 3', code: 'Option 3' }
    ]);

    const dropdownItem = ref<string | undefined>(undefined);
    const editorValue = ref<string>('');

    // The layout sections below are showcase markup, so each field carries its own model
    // rather than rendering an input nothing can read back.
    const name1 = ref<string>('');
    const email1 = ref<string>('');
    const age1 = ref<string>('');
    const name2 = ref<string>('');
    const email2 = ref<string>('');
    const name3 = ref<string>('');
    const email3 = ref<string>('');
    const firstname1 = ref<string>('');
    const lastname1 = ref<string>('');
    const username = ref<string>('');
    const firstname2 = ref<string>('');
    const lastname2 = ref<string>('');
    const address = ref<string>('');
    const zip = ref<string>('');

    // Quill's HTML output is untrusted: never render it raw. Use the
    // shared sanitizer helper (DOMPurify with a Quill-tuned tag/attr
    // allowlist) before passing it to v-html or persisting it server-side.
    const sanitizedEditorHtml = computed(() => sanitizeHtml(editorValue.value));

    // vee-validate plus zod is the registry's own form stack; the schema is the single source of truth
    // for both the browser-side rules and the message text.
    // An untouched field is undefined, which zod reports as a type error before .email() or .min()
    // ever run, so each string carries its own required_error or a bare submit says only "Required".
    const validationFields = z.object({
        email: z.string({ required_error: 'Enter your email address' }).email('Enter a valid email address'),
        password: z.string({ required_error: 'Enter a password' }).min(8, 'Use at least 8 characters'),
        accept: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms' }) })
    });

    const schema = toTypedSchema(validationFields);

    // vee-validate types the submit payload as Record<string, any>, so the handler widens to
    // Record<string, unknown> rather than casting the inferred zod output onto it.
    function onSubmit(values: Record<string, unknown>, { resetForm }: SubmissionContext): void {
        showToast({ severity: 'success', summary: 'Submitted', detail: String(values.email), life: 3000 });
        resetForm();
    }
</script>

<template>
    <div class="flex flex-col md:flex-row gap-8">
        <div class="md:w-1/2">
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Vertical</div>
                <div class="flex flex-col gap-2">
                    <Label for="name1">Name</Label>
                    <Input id="name1" v-model="name1" type="text" />
                </div>
                <div class="flex flex-col gap-2">
                    <Label for="email1">Email</Label>
                    <Input id="email1" v-model="email1" type="text" />
                </div>
                <div class="flex flex-col gap-2">
                    <Label for="age1">Age</Label>
                    <Input id="age1" v-model="age1" type="text" />
                </div>
            </div>

            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Vertical Grid</div>
                <div class="flex flex-wrap gap-4">
                    <div class="flex flex-col grow basis-0 gap-2">
                        <Label for="name2">Name</Label>
                        <Input id="name2" v-model="name2" type="text" />
                    </div>
                    <div class="flex flex-col grow basis-0 gap-2">
                        <Label for="email2">Email</Label>
                        <Input id="email2" v-model="email2" type="text" />
                    </div>
                </div>
            </div>
        </div>
        <div class="md:w-1/2">
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Horizontal</div>
                <div class="grid grid-cols-12 gap-2">
                    <Label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Name</Label>
                    <div class="col-span-12 md:col-span-10">
                        <Input id="name3" v-model="name3" type="text" />
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-2">
                    <Label for="email3" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Email</Label>
                    <div class="col-span-12 md:col-span-10">
                        <Input id="email3" v-model="email3" type="text" />
                    </div>
                </div>
            </div>

            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Inline</div>
                <div class="flex flex-wrap items-start gap-4">
                    <div class="field">
                        <Label for="firstname1" class="sr-only">Firstname</Label>
                        <Input id="firstname1" v-model="firstname1" type="text" placeholder="Firstname" />
                    </div>
                    <div class="field">
                        <Label for="lastname1" class="sr-only">Lastname</Label>
                        <Input id="lastname1" v-model="lastname1" type="text" placeholder="Lastname" />
                    </div>
                    <Button>Submit</Button>
                </div>
            </div>
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Help Text</div>
                <div class="flex flex-wrap gap-2">
                    <Label for="username">Username</Label>
                    <Input id="username" v-model="username" type="text" />
                    <small>Enter your username to reset your password.</small>
                </div>
            </div>
        </div>
    </div>

    <div class="flex mt-8">
        <div class="card flex flex-col gap-4 w-full">
            <div class="font-semibold text-xl">Advanced</div>
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex flex-wrap gap-2 w-full">
                    <Label for="firstname2">Firstname</Label>
                    <Input id="firstname2" v-model="firstname2" type="text" />
                </div>
                <div class="flex flex-wrap gap-2 w-full">
                    <Label for="lastname2">Lastname</Label>
                    <Input id="lastname2" v-model="lastname2" type="text" />
                </div>
            </div>

            <div class="flex flex-wrap">
                <Label for="address">Address</Label>
                <Textarea id="address" v-model="address" rows="4" />
            </div>

            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex flex-wrap gap-2 w-full">
                    <Label for="state">State</Label>
                    <Select v-model="dropdownItem">
                        <SelectTrigger id="state" class="w-full"><SelectValue placeholder="Select One" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="option in dropdownItems" :key="option.code" :value="option.code">{{ option.name }}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div class="flex flex-wrap gap-2 w-full">
                    <Label for="zip">Zip</Label>
                    <Input id="zip" v-model="zip" type="text" />
                </div>
            </div>
        </div>
    </div>
    <div class="flex mt-8">
        <div class="card flex flex-col gap-4 w-full">
            <QuillEditor id="editor" v-model="editorValue" editor-style="height: 320px" />
            <div v-if="editorValue" class="border-t border-border pt-4">
                <div class="font-semibold text-base mb-2">Rendered (sanitized via DOMPurify)</div>
                <div class="prose max-w-none" v-html="sanitizedEditorHtml" />
            </div>
        </div>
    </div>
    <div class="flex mt-8">
        <div class="card flex flex-col gap-4 w-full">
            <div class="font-semibold text-xl">Validation</div>
            <Form :validation-schema="schema" class="flex flex-col gap-4" @submit="onSubmit">
                <FormField v-slot="{ componentField }" name="email">
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="you@example.com" v-bind="componentField" /></FormControl>
                        <FormDescription>We never share it.</FormDescription>
                        <FormMessage />
                    </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="password">
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><PasswordInput v-bind="componentField" autocomplete="new-password" :feedback="false" /></FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
                <FormField v-slot="{ value, handleChange }" name="accept" type="checkbox">
                    <FormItem class="flex flex-row items-center gap-2">
                        <FormControl><Checkbox :model-value="value" @update:model-value="handleChange" /></FormControl>
                        <FormLabel>I accept the terms</FormLabel>
                        <FormMessage />
                    </FormItem>
                </FormField>
                <Button type="submit" class="self-start">Submit</Button>
            </Form>
        </div>
    </div>
</template>
