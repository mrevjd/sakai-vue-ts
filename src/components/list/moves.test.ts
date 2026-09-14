import { describe, expect, it } from 'vitest';
import { moveBottom, moveDown, moveTop, moveUp, transfer, transferAll } from './moves';

const items = ['a', 'b', 'c', 'd', 'e'];
const id = (item: string) => item;

describe('list moves', () => {
    it('moves a selection one step up and keeps it together', () => {
        expect(moveUp(items, ['c', 'd'], id)).toEqual(['a', 'c', 'd', 'b', 'e']);
        expect(moveUp(items, ['a'], id)).toEqual(items);
    });

    it('moves a selection one step down', () => {
        expect(moveDown(items, ['b', 'c'], id)).toEqual(['a', 'd', 'b', 'c', 'e']);
        expect(moveDown(items, ['e'], id)).toEqual(items);
    });

    it('moves a selection to the top and bottom in its original order', () => {
        expect(moveTop(items, ['d', 'b'], id)).toEqual(['b', 'd', 'a', 'c', 'e']);
        expect(moveBottom(items, ['a', 'c'], id)).toEqual(['b', 'd', 'e', 'a', 'c']);
    });

    it('transfers the selection to the end of the other list and all when asked', () => {
        expect(transfer(items, ['x'], ['b', 'd'], id)).toEqual({ from: ['a', 'c', 'e'], to: ['x', 'b', 'd'] });
        expect(transferAll(items, ['x'])).toEqual({ from: [], to: ['x', 'a', 'b', 'c', 'd', 'e'] });
    });

    it('returns the same array instance when nothing is selected', () => {
        expect(moveUp(items, [], id)).toBe(items);
    });
});
