import { describe, expect, it } from 'vitest';
import { angleToValue, clampStep, knobArc } from './knob-math';

describe('knob math', () => {
    it('clamps and snaps to the step from min', () => {
        expect(clampStep(37, 0, 100, 10)).toBe(40);
        expect(clampStep(-20, -50, 50, 10)).toBe(-20);
        expect(clampStep(120, 0, 100, 1)).toBe(100);
        expect(clampStep(-3, 0, 100, 1)).toBe(0);
    });

    it('maps the pointer angle to a value across the dial, ignoring the dead zone at the bottom', () => {
        expect(angleToValue((4 * Math.PI) / 3, 0, 100, 1)).toBe(0);
        expect(angleToValue(-Math.PI / 3, 0, 100, 1)).toBe(100);
        expect(angleToValue(Math.PI / 2, 0, 100, 1)).toBe(50);
        expect(angleToValue(-Math.PI / 2, 0, 100, 1)).toBeUndefined();
    });

    it('draws the range arc from min to max and the value arc from zero to the value', () => {
        const { rangePath, valuePath } = knobArc({ value: 50, min: 0, max: 100, radius: 40 });
        expect(rangePath).toBe('M 30 84.641 A 40 40 0 1 1 70 84.641');
        expect(valuePath).toBe('M 30 84.641 A 40 40 0 0 1 50 10');
        expect(knobArc({ value: 0, min: -50, max: 50, radius: 40 }).valuePath).toBe('M 50 10 A 40 40 0 0 1 50 10');
    });
});
