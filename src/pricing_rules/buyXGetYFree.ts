import type { BuyXGetYFreeType } from "../types";



type BuyXGetYFreeProps = Omit<BuyXGetYFreeType, "name"> & { quantity: number };

/**
 * Get Y free when X is bought
 * For example:
 * buy 3 get 1 free
 * if the quantity is 4, the price will be the price of 3 items
 * if the quantity is 5, the price will be the price of 4 items
 * if the quantity is 6, the price will be the price of 4 items
 */
export function buyXGetYFree({ product, buy, free, quantity }: BuyXGetYFreeProps) {
    const { price, sku } = product
    validate(price, buy, free, quantity);

    if (quantity < buy) {
        console.log(`${sku} quantity ${quantity} is less than buy ${buy}, no free items`);
        return price * quantity;
    }

    const free_quantity = Math.floor(quantity / buy) * free;
    const remaining_quantity = quantity - free_quantity;

    const result = price * remaining_quantity;
    return result;
}

// extract the validates
function validate(product_price: number, buy: number, free: number, quantity: number) {
    if (free >= buy)
        throw new Error("Free must be less than buy");
    if (product_price <= 0)
        throw new Error("Product price must be greater than 0");
    if (quantity <= 0)
        throw new Error("Quantity must be greater than 0");
    if (buy <= 0)
        throw new Error("Buy must be greater than 0");
    if (free <= 0)
        throw new Error("Free must be greater than 0");
}