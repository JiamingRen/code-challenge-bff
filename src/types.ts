export interface ProductType {
    sku: string;
    name: string;
    price: number;
}

export interface BuyXGetYFreeType {
    name: "buyXGetYFree";
    product: ProductType;
    buy: number;
    free: number;
    quantity: number;
}
export interface BulkDiscountType {
    name: "bulkDiscount";
    product: ProductType;
    quantity: number;
    quantity_threshold: number;
    discount_price: number;
}

export type PricingRuleType = BuyXGetYFreeType | BulkDiscountType;

