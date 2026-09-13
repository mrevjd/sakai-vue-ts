<script setup lang="ts">
    import { computed, ref, type HTMLAttributes } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { IconEye, IconEyeSlash } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import { passwordStrength, type PasswordStrength } from '@/utils/passwordStrength';

    const props = withDefaults(
        defineProps<{
            id?: string;
            placeholder?: string;
            toggleMask?: boolean;
            feedback?: boolean;
            disabled?: boolean;
            class?: HTMLAttributes['class'];
        }>(),
        { id: undefined, placeholder: '', toggleMask: true, feedback: true, disabled: false, class: undefined }
    );

    const model = defineModel<string>({ default: '' });
    const revealed = ref(false);

    const strength = computed<PasswordStrength>(() => passwordStrength(model.value));
    const strengthLabel = computed(() => ({ none: '', weak: 'Weak', medium: 'Medium', strong: 'Strong' })[strength.value]);
    // Fill fraction and colour mirror PrimeVue's meter: a third per level.
    const strengthClass = computed(() => ({ none: 'w-0', weak: 'w-1/3 bg-destructive', medium: 'w-2/3 bg-amber-500', strong: 'w-full bg-green-600' })[strength.value]);
</script>

<template>
    <div :class="cn('flex flex-col gap-2', props.class)" data-slot="password-input">
        <div class="relative">
            <Input :id="props.id" v-model="model" :type="revealed ? 'text' : 'password'" :placeholder="props.placeholder" :disabled="props.disabled" :class="props.toggleMask ? 'pr-9' : undefined" autocomplete="current-password" />
            <Button
                v-if="props.toggleMask"
                type="button"
                variant="ghost"
                size="icon-sm"
                class="absolute top-1/2 right-1 -translate-y-1/2"
                :disabled="props.disabled"
                :aria-label="revealed ? 'Hide password' : 'Show password'"
                data-testid="password-toggle"
                @click="revealed = !revealed"
            >
                <IconEyeSlash v-if="revealed" class="size-4" />
                <IconEye v-else class="size-4" />
            </Button>
        </div>
        <div v-if="props.feedback && strength !== 'none'" class="flex items-center gap-3" data-testid="password-strength-meter">
            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div :class="cn('h-full transition-all', strengthClass)" />
            </div>
            <span class="text-xs text-muted-foreground" data-testid="password-strength">{{ strengthLabel }}</span>
        </div>
    </div>
</template>
