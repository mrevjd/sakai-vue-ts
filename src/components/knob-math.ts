// Geometry lifted from PrimeVue's Knob: a 100x100 viewBox, the dial open at the bottom between
// 240 degrees (min) and -60 degrees (max), angles in radians measured counter-clockwise from 3 o'clock.
const MID = 50;
export const MIN_RADIANS = (4 * Math.PI) / 3;
export const MAX_RADIANS = -Math.PI / 3;

function mapRange(x: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function round3(n: number): number {
    return Math.round(n * 1000) / 1000;
}

function point(radians: number, radius: number): { x: number; y: number } {
    return { x: round3(MID + Math.cos(radians) * radius), y: round3(MID - Math.sin(radians) * radius) };
}

export function clampStep(value: number, min: number, max: number, step: number): number {
    const clamped = Math.min(max, Math.max(min, value));
    // A zero or non-finite step cannot snap (it would divide to NaN), so only the clamp applies.
    if (!Number.isFinite(step) || step <= 0) return clamped;
    return Math.round((clamped - min) / step) * step + min;
}

// Returns undefined when the pointer sits in the gap below the dial, where PrimeVue also ignores it.
// Both ends are inclusive so a pointer exactly on either end of the dial maps to min or max rather than the gap.
export function angleToValue(angle: number, min: number, max: number, step: number): number | undefined {
    const start = -Math.PI / 2 - Math.PI / 6;
    let mapped: number;
    if (angle >= MAX_RADIANS) mapped = mapRange(angle, MIN_RADIANS, MAX_RADIANS, min, max);
    else if (angle <= start) mapped = mapRange(angle + 2 * Math.PI, MIN_RADIANS, MAX_RADIANS, min, max);
    else return undefined;
    return clampStep(mapped, min, max, step);
}

export function knobArc(input: { value: number; min: number; max: number; radius: number }): { rangePath: string; valuePath: string } {
    const { value, min, max, radius } = input;
    const minPoint = point(MIN_RADIANS, radius);
    const maxPoint = point(MAX_RADIANS, radius);
    const zeroRadians = min > 0 && max > 0 ? mapRange(min, min, max, MIN_RADIANS, MAX_RADIANS) : mapRange(0, min, max, MIN_RADIANS, MAX_RADIANS);
    const valueRadians = mapRange(value, min, max, MIN_RADIANS, MAX_RADIANS);
    const zero = point(zeroRadians, radius);
    const end = point(valueRadians, radius);
    const largeArc = Math.abs(zeroRadians - valueRadians) < Math.PI ? 0 : 1;
    const sweep = valueRadians > zeroRadians ? 0 : 1;
    return {
        rangePath: `M ${minPoint.x} ${minPoint.y} A ${radius} ${radius} 0 1 1 ${maxPoint.x} ${maxPoint.y}`,
        valuePath: `M ${zero.x} ${zero.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`
    };
}
