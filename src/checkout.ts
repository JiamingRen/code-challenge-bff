import { bulkDiscount } from "./pricing_rules/bulk_discount";
import { buyXGetYFree } from "./pricing_rules/buyXGetYFree";
import type { PricingRuleType, ValidSKU } from "./types";


export class Checkout {
    private items: Partial<Record<ValidSKU, number>> = {};

    constructor(private pricingRules: PricingRuleType[]) { }

    scan(item: ValidSKU) {
        this.items[item] = (this.items[item] || 0) + 1;
    }

    total() {
        let total = 0;
        Object.entries(this.items).forEach(([item_sku, quantity]) => {
            const rule = this.pricingRules.find((rule) => rule.product.sku === item_sku);

            if (!rule) {
                throw new Error(`Failed to scan ${item_sku}: No pricing rule found`);
            }

            if (rule?.name === "buyXGetYFree") {
                total += buyXGetYFree({ product: rule.product, buy: rule.buy, free: rule.free, quantity: quantity });
            } else if (rule?.name === "bulkDiscount") {
                total += bulkDiscount({ product: rule.product, quantity: quantity, quantity_threshold: rule.quantity_threshold, discount_price: rule.discount_price });
            } else if (rule?.name === "fullPrice") {
                total += rule.product.price * quantity;
            }

        })

        console.log(total);
    }
}