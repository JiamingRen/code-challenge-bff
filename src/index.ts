import type { PricingRuleType } from "./types"
import { Checkout } from "./checkout"
import { PRODUCTS } from "./constants"

const pricingRules: PricingRuleType[] = [
    // we're going to have a 3 for 2 deal on Apple TVs. 
    // For example, if you buy 3 Apple TVs, you will pay the price of 2 only
    {
        name: "buyXGetYFree",
        product: PRODUCTS.find((product) => product.sku === "atv")!,
        buy: 3,
        free: 1,
    },
    // the brand new Super iPad will have a bulk discounted applied, 
    // where the price will drop to $499.99 each, if someone buys more than 4
    {
        name: "bulkDiscount",
        product: PRODUCTS.find((product) => product.sku === "ipd")!,
        quantity_threshold: 4,
        discount_price: 499.99,
    },
    {
        name: "fullPrice",
        product: PRODUCTS.find((product) => product.sku === "mbp")!,
    },
    {
        name: "fullPrice",
        product: PRODUCTS.find((product) => product.sku === "vga")!,
    },
]


console.log("Scenario 1")
const co1 = new Checkout(pricingRules)
co1.scan("atv")
co1.scan("atv")
co1.scan("atv")
co1.scan("vga")
co1.total()

console.log("Scenario 2")
const co2 = new Checkout(pricingRules)
co2.scan("atv")
co2.scan("ipd")
co2.scan("ipd")
co2.scan("atv")
co2.scan("ipd")
co2.scan("ipd")
co2.scan("ipd")
co2.total()