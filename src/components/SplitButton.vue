<script setup lang="ts">
    import { computed, type Component } from 'vue';
    import { Button, type ButtonVariants } from '@/components/ui/button';
    import { ButtonGroup } from '@/components/ui/button-group';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { IconAngleDown } from '@/components/icons';
    import MenuItemContent from '@/components/menu/MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from '@/components/menu/model';
    import { cn } from '@/lib/utils';

    const severities: Record<string, NonNullable<ButtonVariants['variant']>> = { secondary: 'secondary', success: 'success', info: 'info', warn: 'warning', help: 'help', danger: 'destructive', contrast: 'contrast' };

    const props = withDefaults(defineProps<{ label: string; model: MenuModelItem[]; severity?: string; icon?: Component; size?: ButtonVariants['size']; disabled?: boolean; class?: string }>(), {
        severity: undefined,
        icon: undefined,
        size: 'default',
        disabled: false,
        class: undefined
    });
    const emit = defineEmits<{ click: [event: MouseEvent] }>();

    const variant = computed<NonNullable<ButtonVariants['variant']>>(() => (props.severity ? (severities[props.severity] ?? 'default') : 'default'));
</script>

<template>
    <ButtonGroup :class="cn(props.class)" data-slot="split-button" :data-variant="variant">
        <Button :variant="variant" :size="props.size" :disabled="props.disabled" data-slot="split-button-main" @click="emit('click', $event)">
            <component :is="props.icon" v-if="props.icon" class="size-4" />
            {{ props.label }}
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger as-child>
                <Button :variant="variant" :size="props.size === 'default' ? 'icon' : props.size" :disabled="props.disabled" aria-label="More options"><IconAngleDown class="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="min-w-40">
                <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
                    <DropdownMenuSeparator v-if="item.separator" />
                    <DropdownMenuItem v-else :disabled="item.disabled" @select="runCommand(item, $event)"><MenuItemContent :item="item" /></DropdownMenuItem>
                </template>
            </DropdownMenuContent>
        </DropdownMenu>
    </ButtonGroup>
</template>
