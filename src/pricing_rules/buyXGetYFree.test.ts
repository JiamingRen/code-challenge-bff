import { buyXGetYFree } from './buyXGetYFree';
import type { ProductType } from '../types';

describe('buyXGetYFree', () => {
    const testProduct: ProductType = {
        sku: 'ipd',
        name: 'Test Product',
        price: 10
    };

    describe('buy 3 get 1 free scenario', () => {
        const buy = 3;
        const free = 1;

        it('should charge full price when quantity < buy (2 items)', () => {
            const result = buyXGetYFree({ product: testProduct, buy, free, quantity: 2 });
            expect(result).toBe(20);
        });

        it('should charge for 2 when buying exactly 3 items', () => {
            const result = buyXGetYFree({ product: testProduct, buy, free, quantity: 3 });
            expect(result).toBe(20);
        });

        it('should charge for 3 when buying 4 items (3 paid + 1 free)', () => {
            const result = buyXGetYFree({ product: testProduct, buy, free, quantity: 4 });

            expect(result).toBe(30);
        });

        it('should charge for 4 when buying 5 items', () => {
            const result = buyXGetYFree({ product: testProduct, buy, free, quantity: 5 });
            expect(result).toBe(40);
        });

        it('should charge for 4 when buying 6 items', () => {
            const result = buyXGetYFree({ product: testProduct, buy, free, quantity: 6 });
            expect(result).toBe(40);
        });

        it('should charge for 6 when buying 8 items (two complete sets)', () => {
            const result = buyXGetYFree({ product: testProduct, buy, free, quantity: 8 });
            expect(result).toBe(60);
        });

        it('should handle 7 items correctly', () => {
            const result = buyXGetYFree({ product: testProduct, buy, free, quantity: 7 });
            expect(result).toBe(50);
        });
    });

    describe('buy 2 get 1 free scenario', () => {
        const buy = 2;
        const free = 1;

        it('should handle 3 items (1 complete set)', () => {
            const result = buyXGetYFree({ product: testProduct, buy, free, quantity: 3 });
            expect(result).toBe(20);
        });

        it('should handle 5 items', () => {
            const result = buyXGetYFree({ product: testProduct, buy, free, quantity: 5 });
            expect(result).toBe(30);
        });
    });

    describe('validation tests', () => {
        it('should throw error when free >= buy', () => {
            expect(() => buyXGetYFree({ product: testProduct, buy: 2, free: 2, quantity: 5 })).toThrow('Free must be less than buy');
        });

        it('should throw error when price <= 0', () => {
            const invalidProduct = { ...testProduct, price: 0 };
            expect(() => buyXGetYFree({ product: invalidProduct, buy: 3, free: 1, quantity: 5 })).toThrow('Product price must be greater than 0');
        });

        it('should throw error when quantity <= 0', () => {
            expect(() => buyXGetYFree({ product: testProduct, buy: 3, free: 1, quantity: 0 })).toThrow('Quantity must be greater than 0');
        });

        it('should throw error when buy <= 0', () => {
            expect(() => buyXGetYFree({ product: testProduct, buy: 0, free: 1, quantity: 5 })).toThrow('Free must be less than buy');
        });

        it('should throw error when free <= 0', () => {
            expect(() => buyXGetYFree({ product: testProduct, buy: 3, free: 0, quantity: 5 })).toThrow('Free must be greater than 0');
        });
    });
});