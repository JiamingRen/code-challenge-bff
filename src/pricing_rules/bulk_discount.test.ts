import { bulkDiscount } from "./bulk_discount";
import type { ProductType } from "../types";

describe("bulkDiscount", () => {
    const mockProduct: ProductType = {
        sku: "atv",
        name: "Test Product",
        price: 10.00
    };

    describe("when quantity is below threshold", () => {
        it("should return original price multiplied by quantity", () => {
            const result = bulkDiscount({
                product: mockProduct,
                quantity: 2,
                quantity_threshold: 3,
                discount_price: 8.00
            });

            expect(result).toBe(20.00);
        });

        it("should work with quantity exactly one below threshold", () => {
            const result = bulkDiscount({
                product: mockProduct,
                quantity: 4,
                quantity_threshold: 5,
                discount_price: 7.50
            });

            expect(result).toBe(40.00);
        });

        it("should work with quantity exactly one below threshold", () => {
            const result = bulkDiscount({
                product: mockProduct,
                quantity: 49,
                quantity_threshold: 50,
                discount_price: 8.50
            });

            expect(result).toBe(490.00);
        });
    });

    describe("when quantity meets or exceeds threshold", () => {
        it("should return discount price multiplied by quantity", () => {
            const result = bulkDiscount({
                product: mockProduct,
                quantity: 3,
                quantity_threshold: 3,
                discount_price: 8.00
            });

            expect(result).toBe(24.00);
        });

        it("should work with quantity well above threshold", () => {
            const result = bulkDiscount({
                product: mockProduct,
                quantity: 10,
                quantity_threshold: 3,
                discount_price: 7.50
            });

            expect(result).toBe(75.00);
        });

        it("should work with large quantities", () => {
            const result = bulkDiscount({
                product: mockProduct,
                quantity: 100,
                quantity_threshold: 50,
                discount_price: 8.50
            });

            expect(result).toBe(850.00);
        });
    });

    describe("validation errors", () => {
        it("should throw error when quantity is 0", () => {
            expect(() => {
                bulkDiscount({
                    product: mockProduct,
                    quantity: 0,
                    quantity_threshold: 3,
                    discount_price: 8.00
                });
            }).toThrow("Quantity must be greater than 0");
        });

        it("should throw error when quantity is negative", () => {
            expect(() => {
                bulkDiscount({
                    product: mockProduct,
                    quantity: -1,
                    quantity_threshold: 3,
                    discount_price: 8.00
                });
            }).toThrow("Quantity must be greater than 0");
        });

        it("should throw error when quantity_threshold is 0", () => {
            expect(() => {
                bulkDiscount({
                    product: mockProduct,
                    quantity: 5,
                    quantity_threshold: 0,
                    discount_price: 8.00
                });
            }).toThrow("Quantity threshold must be greater than 0");
        });

        it("should throw error when quantity_threshold is negative", () => {
            expect(() => {
                bulkDiscount({
                    product: mockProduct,
                    quantity: 5,
                    quantity_threshold: -1,
                    discount_price: 8.00
                });
            }).toThrow("Quantity threshold must be greater than 0");
        });

        it("should throw error when discount_price is 0", () => {
            expect(() => {
                bulkDiscount({
                    product: mockProduct,
                    quantity: 5,
                    quantity_threshold: 3,
                    discount_price: 0
                });
            }).toThrow("Discount price must be greater than 0");
        });

        it("should throw error when discount_price is negative", () => {
            expect(() => {
                bulkDiscount({
                    product: mockProduct,
                    quantity: 5,
                    quantity_threshold: 3,
                    discount_price: -5.00
                });
            }).toThrow("Discount price must be greater than 0");
        });

        it("should throw error when discount_price equals original price", () => {
            expect(() => {
                bulkDiscount({
                    product: mockProduct,
                    quantity: 5,
                    quantity_threshold: 3,
                    discount_price: 10.00 // same as mockProduct.price
                });
            }).toThrow("Discount price must be less than price");
        });

        it("should throw error when discount_price is greater than original price", () => {
            expect(() => {
                bulkDiscount({
                    product: mockProduct,
                    quantity: 5,
                    quantity_threshold: 3,
                    discount_price: 15.00 // greater than mockProduct.price
                });
            }).toThrow("Discount price must be less than price");
        });
    });

    describe("edge cases", () => {
        it("should throw error with decimal quantities", () => {
            expect(() => {
                bulkDiscount({
                    product: mockProduct,
                    quantity: 3.5,
                    quantity_threshold: 3,
                    discount_price: 8.00
                });
            }).toThrow("Quantity must be an integer");
        });

        it("should throw error with decimal threshold quantities", () => {
            expect(() => {
                bulkDiscount({
                    product: mockProduct,
                    quantity: 3,
                    quantity_threshold: 3.5,
                    discount_price: 8.00
                });
            }).toThrow("Quantity threshold must be an integer");
        });

        it("should work with decimal prices", () => {
            const decimalProduct: ProductType = {
                sku: "ipd",
                name: "Decimal Product",
                price: 9.99
            };

            const result = bulkDiscount({
                product: decimalProduct,
                quantity: 2,
                quantity_threshold: 5,
                discount_price: 7.50
            });

            expect(result).toBe(19.98); // 9.99 * 2
        });

        it("should work with very small discount differences", () => {
            const result = bulkDiscount({
                product: mockProduct,
                quantity: 5,
                quantity_threshold: 3,
                discount_price: 9.99 // just 0.01 less than original price
            });

            expect(result).toBe(49.95); // 9.99 * 5
        });

        it("should handle floating point precision correctly", () => {
            const product: ProductType = {
                sku: "mbp",
                name: "Float Product",
                price: 0.1
            };

            const result = bulkDiscount({
                product,
                quantity: 3,
                quantity_threshold: 2,
                discount_price: 0.09
            });

            expect(result).toBeCloseTo(0.27, 2); // 0.09 * 3
        });
    });

    describe("real-world scenarios", () => {
        it("should handle typical bulk discount scenario", () => {
            const product: ProductType = {
                sku: "vga",
                name: "Premium Widget",
                price: 49.99
            };

            // Buy 10 or more, get them for $39.99 each
            const result = bulkDiscount({
                product,
                quantity: 15,
                quantity_threshold: 10,
                discount_price: 39.99
            });

            expect(result).toBe(599.85); // 39.99 * 15
        });

        it("should calculate correctly when just below bulk threshold", () => {
            const product: ProductType = {
                sku: "mbp",
                name: "Technical Manual",
                price: 25.00
            };

            // Need 20+ for bulk discount
            const result = bulkDiscount({
                product,
                quantity: 19,
                quantity_threshold: 20,
                discount_price: 20.00
            });

            expect(result).toBe(475.00); // 25.00 * 19 (no discount)
        });
    });
});