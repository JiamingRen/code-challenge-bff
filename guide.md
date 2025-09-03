# Checkout System Guide

## Overview

This is a flexible checkout system for Zeller's computer store, built with TypeScript. The system supports configurable pricing rules and can handle various promotional offers.

## Quick Start

### Installation

```bash
npm install
```

### Running the Example

```bash
npx tsx src/index.ts
```

This will run the two example scenarios from the README and display their totals.

### Running Tests

```bash
npm test
```

## Basic Usage

### Creating a Checkout Instance

```typescript
import { Checkout } from './checkout';
import type { PricingRuleType } from './types';

const pricingRules: PricingRuleType[] = [
  // Define your pricing rules here
];

const checkout = new Checkout(pricingRules);
```

### Scanning Items

```typescript
checkout.scan('atv');  // Apple TV
checkout.scan('ipd');  // Super iPad
checkout.scan('mbp');  // MacBook Pro
checkout.scan('vga');  // VGA adapter
```

### Getting the Total

```typescript
const total = checkout.total();
console.log(`Total: $${total}`);
```

## Available Products

| SKU | Name        | Price    |
|-----|-------------|----------|
| ipd | Super iPad  | $549.99  |
| mbp | MacBook Pro | $1399.99 |
| atv | Apple TV    | $109.50  |
| vga | VGA adapter | $30.00   |

## Pricing Rules

The system supports three types of pricing rules:

### 1. Full Price (`fullPrice`)

Items are charged at their regular price.

```typescript
{
  name: "fullPrice",
  product: PRODUCTS.find(p => p.sku === "mbp")!
}
```

### 2. Buy X Get Y Free (`buyXGetYFree`)

Promotional rule where customers get free items after purchasing a certain quantity.

```typescript
{
  name: "buyXGetYFree",
  product: PRODUCTS.find(p => p.sku === "atv")!,
  buy: 3,    // Buy 3
  free: 1    // Get 1 free
}
```

**Example**: 3-for-2 deal on Apple TVs
- Buy 3 Apple TVs, pay for only 2
- Buy 6 Apple TVs, pay for only 4

### 3. Bulk Discount (`bulkDiscount`)

Reduced price when purchasing above a threshold quantity.

```typescript
{
  name: "bulkDiscount",
  product: PRODUCTS.find(p => p.sku === "ipd")!,
  quantity_threshold: 4,     // Threshold quantity
  discount_price: 499.99     // Discounted price per item
}
```

**Example**: Super iPad bulk discount
- 4 or fewer iPads: $549.99 each
- 5 or more iPads: $499.99 each

## Example Scenarios

### Scenario 1: Mixed Items with 3-for-2 Deal

```typescript
const checkout = new Checkout(pricingRules);
checkout.scan('atv');  // $109.50
checkout.scan('atv');  // $109.50
checkout.scan('atv');  // Free (3-for-2 deal)
checkout.scan('vga');  // $30.00

console.log(checkout.total()); // $249.00
```

### Scenario 2: Bulk Discount Trigger

```typescript
const checkout = new Checkout(pricingRules);
checkout.scan('atv');  // $109.50
checkout.scan('ipd');  // $499.99 (bulk discount)
checkout.scan('ipd');  // $499.99 (bulk discount)
checkout.scan('atv');  // $109.50
checkout.scan('ipd');  // $499.99 (bulk discount)
checkout.scan('ipd');  // $499.99 (bulk discount)
checkout.scan('ipd');  // $499.99 (bulk discount)

console.log(checkout.total()); // $2718.95
```

## Adding Custom Pricing Rules

### Step 1: Define the Rule Type

```typescript
// In types.ts
export interface MyCustomRuleType {
  name: "myCustomRule";
  product: ProductType;
  // Add your custom properties
  customProperty: number;
}

// Add to the union type
export type PricingRuleType = BuyXGetYFreeType | BulkDiscountType | FullPriceType | MyCustomRuleType;
```

### Step 2: Implement the Rule Logic

```typescript
// Create pricing_rules/myCustomRule.ts
export function myCustomRule({ product, customProperty, quantity }: MyCustomRuleProps) {
  // Implement your pricing logic
  return product.price * quantity * customProperty;
}
```

### Step 3: Update the Checkout Class

```typescript
// In checkout.ts, add to the total() method
else if (rule?.name === "myCustomRule") {
  total += myCustomRule({ 
    product: rule.product, 
    customProperty: rule.customProperty, 
    quantity: quantity 
  });
}
```