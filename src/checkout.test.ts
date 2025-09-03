import { Checkout } from "./checkout";
import type { PricingRuleType } from "./types";
import { PRODUCTS } from "./constants";

describe("Checkout", () => {
  const mockPricingRules: PricingRuleType[] = [
    {
      name: "buyXGetYFree",
      product: PRODUCTS.find((product) => product.sku === "atv")!,
      buy: 3,
      free: 1,
    },
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
  ];

  describe("constructor", () => {
    it("should create a new Checkout instance with pricing rules", () => {
      const checkout = new Checkout(mockPricingRules);
      expect(checkout).toBeInstanceOf(Checkout);
    });
  });

  describe("scan method", () => {
    it("should add items to the checkout", () => {
      const checkout = new Checkout(mockPricingRules);
      checkout.scan("atv");
      checkout.scan("ipd");

      // Test that scanning doesn't throw errors
      expect(() => checkout.scan("mbp")).not.toThrow();
    });

    it("should accumulate multiple scans of the same item", () => {
      const checkout = new Checkout(mockPricingRules);
      checkout.scan("atv");
      checkout.scan("atv");
      checkout.scan("atv");

      const total = checkout.total();
      // 3 ATVs with 3-for-2 deal = 2 * $109.50 = $219.00
      expect(total).toBe(219.0);
    });

    it("should handle items scanned in any order", () => {
      const checkout1 = new Checkout(mockPricingRules);
      checkout1.scan("atv");
      checkout1.scan("ipd");
      checkout1.scan("atv");

      const checkout2 = new Checkout(mockPricingRules);
      checkout2.scan("ipd");
      checkout2.scan("atv");
      checkout2.scan("atv");

      expect(checkout1.total()).toBe(checkout2.total());
    });
  });

  describe("total method", () => {
    it("should return 0 for empty checkout", () => {
      const checkout = new Checkout(mockPricingRules);
      expect(checkout.total()).toBe(0);
    });

    it("should calculate total for single item", () => {
      const checkout = new Checkout(mockPricingRules);
      checkout.scan("vga");
      expect(checkout.total()).toBe(30.0);
    });

    it("should throw error for item without pricing rule", () => {
      const incompletePricingRules: PricingRuleType[] = [
        {
          name: "fullPrice",
          product: PRODUCTS.find((product) => product.sku === "atv")!,
        },
      ];

      const checkout = new Checkout(incompletePricingRules);
      checkout.scan("atv");
      checkout.scan("ipd"); // No pricing rule for ipd

      expect(() => checkout.total()).toThrow(
        "Failed to scan ipd: No pricing rule found"
      );
    });

    describe("buyXGetYFree pricing rule", () => {
      it("should apply 3-for-2 Apple TV deal correctly", () => {
        const checkout = new Checkout(mockPricingRules);

        // Test various quantities
        checkout.scan("atv");
        checkout.scan("atv");
        expect(checkout.total()).toBe(219.0); // 2 * $109.50

        // Reset and test 3 items
        const checkout2 = new Checkout(mockPricingRules);
        checkout2.scan("atv");
        checkout2.scan("atv");
        checkout2.scan("atv");
        expect(checkout2.total()).toBe(219.0); // 2 * $109.50 (1 free)

        // Reset and test 4 items
        const checkout3 = new Checkout(mockPricingRules);
        checkout3.scan("atv");
        checkout3.scan("atv");
        checkout3.scan("atv");
        checkout3.scan("atv");
        expect(checkout3.total()).toBe(328.5); // 3 * $109.50
      });
    });

    describe("bulkDiscount pricing rule", () => {
      it("should apply bulk discount for iPads when quantity > 4", () => {
        const checkout = new Checkout(mockPricingRules);

        // Test 4 iPads (no discount)
        for (let i = 0; i < 4; i++) {
          checkout.scan("ipd");
        }
        expect(checkout.total()).toBe(2199.96); // 4 * $549.99

        // Test 5 iPads (with discount)
        const checkout2 = new Checkout(mockPricingRules);
        for (let i = 0; i < 5; i++) {
          checkout2.scan("ipd");
        }
        expect(checkout2.total()).toBe(2499.95); // 5 * $499.99
      });

      it("should not apply bulk discount when quantity <= threshold", () => {
        const checkout = new Checkout(mockPricingRules);
        checkout.scan("ipd");
        checkout.scan("ipd");

        expect(checkout.total()).toBe(1099.98); // 2 * $549.99 (original price)
      });
    });

    describe("fullPrice pricing rule", () => {
      it("should charge full price for MacBook Pro", () => {
        const checkout = new Checkout(mockPricingRules);
        checkout.scan("mbp");
        expect(checkout.total()).toBe(1399.99);

        checkout.scan("mbp");
        expect(checkout.total()).toBe(2799.98); // 2 * $1399.99
      });

      it("should charge full price for VGA adapter", () => {
        const checkout = new Checkout(mockPricingRules);
        checkout.scan("vga");
        expect(checkout.total()).toBe(30.0);

        checkout.scan("vga");
        checkout.scan("vga");
        expect(checkout.total()).toBe(90.0); // 3 * $30.00
      });
    });

    describe("mixed items scenarios", () => {
      it("should handle README example scenario 1: atv, atv, atv, vga", () => {
        const checkout = new Checkout(mockPricingRules);
        checkout.scan("atv");
        checkout.scan("atv");
        checkout.scan("atv");
        checkout.scan("vga");

        expect(checkout.total()).toBe(249.0);
      });

      it("should handle README example scenario 2: atv, ipd, ipd, atv, ipd, ipd, ipd", () => {
        const checkout = new Checkout(mockPricingRules);
        checkout.scan("atv");
        checkout.scan("ipd");
        checkout.scan("ipd");
        checkout.scan("atv");
        checkout.scan("ipd");
        checkout.scan("ipd");
        checkout.scan("ipd");

        expect(checkout.total()).toBe(2718.95);
      });

      it("should handle complex mixed scenario", () => {
        const checkout = new Checkout(mockPricingRules);

        // Add multiple items of each type
        checkout.scan("atv"); // 1
        checkout.scan("atv"); // 2
        checkout.scan("atv"); // 3 (3-for-2 = pay for 2)
        checkout.scan("ipd"); // 1
        checkout.scan("ipd"); // 2
        checkout.scan("ipd"); // 3
        checkout.scan("ipd"); // 4
        checkout.scan("ipd"); // 5 (bulk discount kicks in)
        checkout.scan("mbp"); // full price
        checkout.scan("vga"); // full price
        checkout.scan("vga"); // full price

        // Expected calculation:
        // ATV: 2 * $109.50 = $219.00 (3-for-2 deal)
        // IPD: 5 * $499.99 = $2499.95 (bulk discount)
        // MBP: 1 * $1399.99 = $1399.99 (full price)
        // VGA: 2 * $30.00 = $60.00 (full price)
        // Total: $4178.94

        expect(checkout.total()).toBe(4178.94);
      });
    });

    describe("edge cases", () => {
      it("should handle multiple calls to total() correctly", () => {
        const checkout = new Checkout(mockPricingRules);
        checkout.scan("atv");
        checkout.scan("vga");

        const firstTotal = checkout.total();
        const secondTotal = checkout.total();

        expect(firstTotal).toBe(secondTotal);
        expect(firstTotal).toBe(139.5); // $109.50 + $30.00
      });

      it("should allow continuing to scan after calling total()", () => {
        const checkout = new Checkout(mockPricingRules);
        checkout.scan("atv");

        const firstTotal = checkout.total();
        expect(firstTotal).toBe(109.5);

        checkout.scan("atv");
        const secondTotal = checkout.total();
        expect(secondTotal).toBe(219.0); // 2 * $109.50
      });

      it("should handle large quantities correctly", () => {
        const checkout = new Checkout(mockPricingRules);

        // Add 100 VGA adapters
        for (let i = 0; i < 100; i++) {
          checkout.scan("vga");
        }

        expect(checkout.total()).toBe(3000.0); // 100 * $30.00
      });
    });
  });
});
