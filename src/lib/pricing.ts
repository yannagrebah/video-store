const BTTF_TRILOGY_IDS = new Set([105, 165, 196]);

type PricedCartItem = {
  id: number;
  quantity: number;
};

type DiscountSummary = {
  discountRate: number;
  discountAmount: number;
};

type CartPricingSummary = DiscountSummary & {
  subtotal: number;
  total: number;
};

function getUnitPrice(id: number): number {
  return BTTF_TRILOGY_IDS.has(id) ? 15 : 20;
}

function getDiscountRate(distinctBttfCount: number): number {
  if (distinctBttfCount >= 3) return 0.2;
  if (distinctBttfCount >= 2) return 0.1;
  return 0;
}

function getDiscountSummary(items: PricedCartItem[]): DiscountSummary {
  const distinctBttfCount = new Set(
    items
      .filter((item) => BTTF_TRILOGY_IDS.has(item.id))
      .map((item) => item.id),
  ).size;

  const discountRate = getDiscountRate(distinctBttfCount);

  const bttfSubtotal = items
    .filter((item) => BTTF_TRILOGY_IDS.has(item.id))
    .reduce((sum, item) => sum + getUnitPrice(item.id) * item.quantity, 0);

  const discountAmount = bttfSubtotal * discountRate;

  return { discountRate, discountAmount };
}

function getSubtotal(items: PricedCartItem[]): number {
  return items.reduce(
    (sum, item) => sum + getUnitPrice(item.id) * item.quantity,
    0,
  );
}

function getTotal(items: PricedCartItem[]): number {
  const subtotal = getSubtotal(items);
  const { discountAmount } = getDiscountSummary(items);

  return subtotal - discountAmount;
}

function calculateCartPricing(items: PricedCartItem[]): CartPricingSummary {
  const subtotal = getSubtotal(items);
  const { discountRate, discountAmount } = getDiscountSummary(items);
  const total = subtotal - discountAmount;

  return { subtotal, discountRate, discountAmount, total };
}

export {
  BTTF_TRILOGY_IDS,
  getUnitPrice,
  getDiscountRate,
  getDiscountSummary,
  getSubtotal,
  getTotal,
  calculateCartPricing,
};

export type { PricedCartItem, DiscountSummary, CartPricingSummary };
