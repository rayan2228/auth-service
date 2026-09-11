import { describe, expect, it } from '@jest/globals';
import { calculateDiscount } from './utils/index.js';
describe('App', () => {
    it('should return correct discount amount', () => {
        const discount = calculateDiscount(100, 10);
        expect(discount).toBe(10);
    });
});
