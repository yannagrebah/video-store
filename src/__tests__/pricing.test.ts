import {
  calculateCartPricing,
  getBestDiscount,
  type PricedCartItem,
} from "../lib/pricing";
import type { Discount } from "~/lib/types";

describe("Pricing System Scenarios", () => {
  // Movie IDs from TMDB
  const BTTF1 = 105;
  const BTTF2 = 165;
  const BTTF3 = 196;
  const LA_CHEVRE = 19123;

  const pricesMap = new Map<number, number>([
    [BTTF1, 15],
    [BTTF2, 15],
    [BTTF3, 15],
    [LA_CHEVRE, 20],
  ]);
  const discounts: Discount[] = [
    {
      id: 1,
      label: "BTTF Trilogy Discount",
      discountRate: 0.2,
      movieBundles: [[BTTF1, BTTF2, BTTF3]],
    },
    {
      id: 2,
      label: "BTTF Pair Discount",
      discountRate: 0.1,
      movieBundles: [
        [BTTF1, BTTF2],
        [BTTF1, BTTF3],
        [BTTF2, BTTF3],
      ],
    },
  ];

  test("Cart: Back to the Future 1, 2, 3 -> 20% discount on BTTF = 36", () => {
    const cart: PricedCartItem[] = [
      { id: BTTF1, quantity: 1 },
      { id: BTTF2, quantity: 1 },
      { id: BTTF3, quantity: 1 },
    ];
    const bestDiscount = getBestDiscount(
      cart.map((item) => item.id),
      discounts,
    );
    const { total } = calculateCartPricing(cart, pricesMap, bestDiscount);

    expect(total).toBe(36);
  });

  test("Cart: Back to the Future 1, 3 -> 10% discount on BTTF = 27", () => {
    const cart: PricedCartItem[] = [
      { id: BTTF1, quantity: 1 },
      { id: BTTF3, quantity: 1 },
    ];
    const bestDiscount = getBestDiscount(
      cart.map((item) => item.id),
      discounts,
    );
    const { total } = calculateCartPricing(cart, pricesMap, bestDiscount);

    expect(total).toBe(27);
  });

  test("Cart: Back to the Future 1 -> No discount = 15", () => {
    const cart: PricedCartItem[] = [{ id: BTTF1, quantity: 1 }];
    const bestDiscount = getBestDiscount(
      cart.map((item) => item.id),
      discounts,
    );
    const result = calculateCartPricing(cart, pricesMap, bestDiscount);

    expect(result.total).toBe(15);
  });

  test("Cart: Back to the Future 1, 2, 3, 2 -> 20% discount on all BTTF = 48", () => {
    const cart: PricedCartItem[] = [
      { id: BTTF1, quantity: 1 },
      { id: BTTF2, quantity: 2 },
      { id: BTTF3, quantity: 1 },
    ];
    const bestDiscount = getBestDiscount(
      cart.map((item) => item.id),
      discounts,
    );
    const { total } = calculateCartPricing(cart, pricesMap, bestDiscount);

    expect(total).toBe(48);
  });

  test("Cart: Back to the Future 1, 2, 3, La Chêvre -> 20% discount on BTTF only = 56", () => {
    const cart: PricedCartItem[] = [
      { id: BTTF1, quantity: 1 },
      { id: BTTF2, quantity: 1 },
      { id: BTTF3, quantity: 1 },
      { id: LA_CHEVRE, quantity: 1 },
    ];
    const bestDiscount = getBestDiscount(
      cart.map((item) => item.id),
      discounts,
    );
    const { total } = calculateCartPricing(cart, pricesMap, bestDiscount);

    expect(total).toBe(56);
  });
});
