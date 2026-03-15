import type schema from "./db/schema/d1";

type PricedCartItem = {
  id: number;
  quantity: number;
  price?: number;
};

type DiscountDef = {
  discountRate: number;
  movieBundles: unknown[];
};

type DiscountSummary = {
  discountRate: number;
  discountAmount: number;
};

type CartPricingSummary = DiscountSummary & {
  subtotal: number;
  total: number;
};

function getUnitPrice(id: number, pricesMap?: Map<number, number>): number {
  return pricesMap?.get(id) ?? 20;
}

function getSubtotal(
  items: PricedCartItem[],
  pricesMap?: Map<number, number>,
): number {
  return items.reduce((acc, item) => {
    const price = item.price ?? getUnitPrice(item.id, pricesMap);
    return acc + price * item.quantity;
  }, 0);
}

function calculateCartPricing(
  items: PricedCartItem[],
  pricesMap?: Map<number, number>,
  bestDiscount?: typeof schema.discounts.$inferSelect | null,
): CartPricingSummary {
  const subtotal = getSubtotal(items, pricesMap);

  if (!bestDiscount || items.length === 0) {
    return { subtotal, discountAmount: 0, discountRate: 0, total: subtotal };
  }

  // Identify which movies the discount applies to based on the bundles in the discount
  const discountableIds = new Set(
    bestDiscount.movieBundles.flat(Infinity) as number[],
  );

  const discountableSubTotal = items.reduce((acc, item) => {
    if (discountableIds.has(item.id)) {
      const price = item.price ?? getUnitPrice(item.id, pricesMap);
      return acc + price * item.quantity;
    }
    return acc;
  }, 0);

  const discountAmount = discountableSubTotal * bestDiscount.discountRate;
  const total = subtotal - discountAmount;

  return {
    subtotal,
    discountRate: bestDiscount.discountRate,
    discountAmount,
    total,
  };
}

export { getUnitPrice, getSubtotal, calculateCartPricing };

export type {
  PricedCartItem,
  DiscountDef,
  DiscountSummary,
  CartPricingSummary,
};
