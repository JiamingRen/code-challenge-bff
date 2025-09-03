import type { ProductType } from "../types";

interface BulkDiscountProps {
    product: ProductType;
    quantity: number;
    quantity_threshold: number;
    discount_price: number;
}

export function bulkDiscount({ product, quantity, quantity_threshold, discount_price }: BulkDiscountProps) {
    const { price: original_price, sku } = product
    validate(original_price, quantity, quantity_threshold, discount_price);

    if (quantity < quantity_threshold) {
        console.log(`${sku} quantity ${quantity} is less than quantity threshold ${quantity_threshold}, no discount`);
        return original_price * quantity;
    }

    return discount_price * quantity;
}

function validate(original_price: number, quantity: number, quantity_threshold: number, discount_price: number) {
    if (quantity % 1 !== 0) {
        throw new Error("Quantity must be an integer");
    }
    if (quantity_threshold % 1 !== 0) {
        throw new Error("Quantity threshold must be an integer");
    }
    if (quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
    }
    if (quantity_threshold <= 0) {
        throw new Error("Quantity threshold must be greater than 0");
    }
    if (discount_price <= 0) {
        throw new Error("Discount price must be greater than 0");
    }
    if (discount_price >= original_price) {
        throw new Error("Discount price must be less than price");
    }
}