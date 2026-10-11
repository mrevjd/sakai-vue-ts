<script setup lang="ts">
    import { onMounted, ref } from 'vue';
    import AutoComplete from '@/components/AutoComplete.vue';
    import ColorPicker from '@/components/ColorPicker.vue';
    import DatePicker from '@/components/DatePicker.vue';
    import FloatLabel from '@/components/FloatLabel.vue';
    import Knob from '@/components/Knob.vue';
    import Listbox from '@/components/Listbox.vue';
    import MaskedInput from '@/components/MaskedInput.vue';
    import MultiSelect from '@/components/MultiSelect.vue';
    import SelectButton from '@/components/SelectButton.vue';
    import StarRating from '@/components/StarRating.vue';
    import ToggleButton from '@/components/ToggleButton.vue';
    import { TreeSelect, type TreeNodeLike, type TreeSelectionKeys } from '@/components/tree';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Input } from '@/components/ui/input';
    import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
    import { Label } from '@/components/ui/label';
    import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field';
    import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Slider } from '@/components/ui/slider';
    import { Switch } from '@/components/ui/switch';
    import { Textarea } from '@/components/ui/textarea';
    import { IconClock, IconSearch, IconStar, IconUser } from '@/components/icons';
    import { CountryService } from '@/service/CountryService';
    import { NodeService } from '@/service/NodeService';
    import type { Country } from '@/service/types';

    const floatValue = ref<string>('');
    const inputValue = ref<string>('');
    const autoValue = ref<Country[]>([]);
    const selectedAutoValue = ref<unknown>(undefined);
    const autoFilteredValue = ref<Country[]>([]);
    const calendarValue = ref<Date | null>(null);
    const inputNumberValue = ref<number>(0);
    const maskValue = ref<string>('');
    const sliderValue = ref<number[]>([50]);
    const rangeValue = ref<number[]>([20, 80]);
    const ratingValue = ref<number | null>(null);
    const colorValue = ref<string>('#1976D2');
    const radioValue = ref<string>('');
    const checkboxValue = ref<string[]>([]);
    const switchValue = ref<boolean>(false);
    const listboxValues = ref<{ name: string; code: string }[]>([
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ]);
    const listboxValue = ref<unknown>(undefined);
    const dropdownValues = ref<{ name: string; code: string }[]>([
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ]);
    // The vendored Select is keyed on the city code, so the model holds that string, not the option object.
    const dropdownValue = ref<string | undefined>(undefined);
    const multiselectValues = ref<Country[]>([
        { name: 'Australia', code: 'AU' },
        { name: 'Brazil', code: 'BR' },
        { name: 'China', code: 'CN' },
        { name: 'Egypt', code: 'EG' },
        { name: 'France', code: 'FR' },
        { name: 'Germany', code: 'DE' },
        { name: 'India', code: 'IN' },
        { name: 'Japan', code: 'JP' },
        { name: 'Spain', code: 'ES' },
        { name: 'United States', code: 'US' }
    ]);

    const multiselectValue = ref<unknown[]>([]);
    const toggleValue = ref<boolean>(false);
    const selectButtonValue = ref<unknown>(undefined);
    const selectButtonValues = ref<{ name: string }[]>([{ name: 'Option 1' }, { name: 'Option 2' }, { name: 'Option 3' }]);
    const knobValue = ref<number>(50);
    const inputGroupValue = ref<boolean>(false);
    const treeSelectNodes = ref<TreeNodeLike[]>([]);
    const selectedNode = ref<TreeSelectionKeys | null>(null);

    onMounted(() => {
        CountryService.getCountries().then((data) => (autoValue.value = data));
        NodeService.getTreeNodes().then((data) => (treeSelectNodes.value = data));
    });

    function searchCountry(event: { query: string }): void {
        setTimeout(() => {
            if (!event.query.trim().length) {
                autoFilteredValue.value = [...autoValue.value];
            } else {
                autoFilteredValue.value = autoValue.value.filter((country) => {
                    return country.name.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }
        }, 250);
    }

    // The vendored Checkbox is boolean-valued, so the city group keeps its array by hand.
    function toggleCity(city: string, checked: boolean | 'indeterminate'): void {
        checkboxValue.value = checked === true ? [...checkboxValue.value, city] : checkboxValue.value.filter((name) => name !== city);
    }

    // MultiSelect hands its slots unknown values, so the flag markup narrows them before reading code and name.
    function isCountry(value: unknown): value is Country {
        return typeof value === 'object' && value !== null && 'code' in value && typeof value.code === 'string' && 'name' in value && typeof value.name === 'string';
    }
</script>

<template>
    <div class="flex flex-col md:flex-row gap-8">
        <div class="md:w-1/2">
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">InputText</div>
                <div class="flex flex-col md:flex-row gap-4">
                    <Input type="text" placeholder="Default" class="w-full" />
                    <Input type="text" placeholder="Disabled" disabled class="w-full" />
                    <Input type="text" placeholder="Invalid" aria-invalid="true" class="w-full" />
                </div>

                <div class="font-semibold text-xl">Icons</div>
                <InputGroup>
                    <InputGroupAddon><IconUser /></InputGroupAddon>
                    <InputGroupInput type="text" placeholder="Username" />
                </InputGroup>
                <InputGroup>
                    <InputGroupInput type="text" placeholder="Search" />
                    <InputGroupAddon align="inline-end"><IconSearch /></InputGroupAddon>
                </InputGroup>

                <div class="font-semibold text-xl">Float Label</div>
                <FloatLabel>
                    <Input id="username" v-model="floatValue" type="text" class="w-full" />
                    <label for="username">Username</label>
                </FloatLabel>

                <div class="font-semibold text-xl">Textarea</div>
                <Textarea v-model="inputValue" placeholder="Your Message" rows="3" class="w-full" />

                <div class="font-semibold text-xl">AutoComplete</div>
                <AutoComplete v-model="selectedAutoValue" :suggestions="autoFilteredValue" option-label="name" placeholder="Search" dropdown multiple display="chip" @complete="searchCountry($event)" />

                <div class="font-semibold text-xl">DatePicker</div>
                <DatePicker v-model="calendarValue" show-icon show-button-bar class="w-full" />

                <div class="font-semibold text-xl">InputNumber</div>
                <NumberField v-model="inputNumberValue" class="w-full">
                    <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                    </NumberFieldContent>
                </NumberField>

                <div class="font-semibold text-xl">Mask</div>
                <MaskedInput v-model="maskValue" mask="(999) 999-9999" class="w-full" />
            </div>

            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Slider</div>
                <Input v-model.number="sliderValue[0]" class="w-full" />
                <Slider v-model="sliderValue" />

                <div class="font-semibold text-xl">Range</div>
                <Slider v-model="rangeValue" :min="0" :max="100" />
                <div class="text-muted-foreground text-sm">{{ rangeValue[0] }} to {{ rangeValue[1] }}</div>

                <div class="flex flex-row mt-6">
                    <div class="flex flex-col gap-4 w-1/2">
                        <div class="font-semibold text-xl">Rating</div>
                        <StarRating v-model="ratingValue" />
                    </div>
                    <div class="flex flex-col gap-4 w-1/2">
                        <div class="font-semibold text-xl">ColorPicker</div>
                        <ColorPicker v-model="colorValue" />
                    </div>
                </div>

                <div class="font-semibold text-xl">Knob</div>
                <Knob v-model="knobValue" :step="10" :min="-50" :max="50" value-template="{value}%" />
            </div>
        </div>
        <div class="md:w-1/2">
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">RadioButton</div>
                <RadioGroup v-model="radioValue" class="flex flex-col md:flex-row gap-4">
                    <div class="flex items-center gap-2">
                        <RadioGroupItem id="option1" value="Chicago" />
                        <Label for="option1">Chicago</Label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioGroupItem id="option2" value="Los Angeles" />
                        <Label for="option2">Los Angeles</Label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioGroupItem id="option3" value="New York" />
                        <Label for="option3">New York</Label>
                    </div>
                </RadioGroup>

                <div class="font-semibold text-xl">Checkbox</div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex items-center gap-2">
                        <Checkbox id="checkOption1" :model-value="checkboxValue.includes('Chicago')" @update:model-value="toggleCity('Chicago', $event)" />
                        <Label for="checkOption1">Chicago</Label>
                    </div>
                    <div class="flex items-center gap-2">
                        <Checkbox id="checkOption2" :model-value="checkboxValue.includes('Los Angeles')" @update:model-value="toggleCity('Los Angeles', $event)" />
                        <Label for="checkOption2">Los Angeles</Label>
                    </div>
                    <div class="flex items-center gap-2">
                        <Checkbox id="checkOption3" :model-value="checkboxValue.includes('New York')" @update:model-value="toggleCity('New York', $event)" />
                        <Label for="checkOption3">New York</Label>
                    </div>
                </div>

                <div class="font-semibold text-xl">ToggleSwitch</div>
                <Switch v-model="switchValue" />
            </div>

            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Listbox</div>
                <Listbox v-model="listboxValue" :options="listboxValues" option-label="name" filter />

                <div class="font-semibold text-xl">Select</div>
                <Select v-model="dropdownValue">
                    <SelectTrigger class="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="city in dropdownValues" :key="city.code" :value="city.code">{{ city.name }}</SelectItem>
                    </SelectContent>
                </Select>

                <div class="font-semibold text-xl">MultiSelect</div>
                <MultiSelect v-model="multiselectValue" :options="multiselectValues" option-label="name" placeholder="Select Countries" filter>
                    <template #value="slotProps">
                        <span class="flex flex-wrap gap-2">
                            <span v-for="option of slotProps.value.filter(isCountry)" :key="option.code" class="inline-flex items-center py-1 px-2 bg-primary text-primary-foreground rounded-lg">
                                <span :class="'mr-2 flag flag-' + option.code.toLowerCase()" style="width: 18px; height: 12px" />
                                <span>{{ option.name }}</span>
                            </span>
                        </span>
                    </template>
                    <template #option="slotProps">
                        <div v-if="isCountry(slotProps.option)" class="flex items-center">
                            <span :class="'mr-2 flag flag-' + slotProps.option.code.toLowerCase()" style="width: 18px; height: 12px" />
                            <div>{{ slotProps.option.name }}</div>
                        </div>
                    </template>
                </MultiSelect>

                <div class="font-semibold text-xl">TreeSelect</div>
                <TreeSelect v-model="selectedNode" :options="treeSelectNodes" placeholder="Select Item" />
            </div>

            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">ToggleButton</div>
                <ToggleButton v-model="toggleValue" on-label="Yes" off-label="No" class="w-40" />

                <div class="font-semibold text-xl">SelectButton</div>
                <SelectButton v-model="selectButtonValue" :options="selectButtonValues" option-label="name" />
            </div>
        </div>
    </div>

    <div class="flex mt-8">
        <div class="card flex flex-col gap-4 w-full">
            <div class="font-semibold text-xl">InputGroup</div>
            <div class="flex flex-col md:flex-row gap-4">
                <InputGroup>
                    <InputGroupAddon><IconUser /></InputGroupAddon>
                    <InputGroupInput placeholder="Username" />
                </InputGroup>
                <InputGroup>
                    <InputGroupAddon><IconClock /></InputGroupAddon>
                    <InputGroupAddon><IconStar class="fill-current" /></InputGroupAddon>
                    <InputGroupInput type="number" placeholder="Price" />
                    <InputGroupAddon align="inline-end"><InputGroupText>$</InputGroupText></InputGroupAddon>
                    <InputGroupAddon align="inline-end"><InputGroupText>.00</InputGroupText></InputGroupAddon>
                </InputGroup>
            </div>
            <div class="flex flex-col md:flex-row gap-4">
                <InputGroup>
                    <InputGroupAddon>
                        <InputGroupButton variant="default">Search</InputGroupButton>
                    </InputGroupAddon>
                    <InputGroupInput placeholder="Keyword" />
                </InputGroup>
                <InputGroup>
                    <InputGroupAddon><Checkbox v-model="inputGroupValue" /></InputGroupAddon>
                    <InputGroupInput placeholder="Confirm" />
                </InputGroup>
            </div>
        </div>
    </div>
</template>
