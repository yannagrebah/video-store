import { useAtom } from "jotai";
import { useMemo } from "react";
import { cartAtom } from "~/lib/atoms";
import { api } from "~/trpc/react";
import { calculateCartPricing } from "~/lib/pricing";

export function useCart() {
  const [cartItems] = useAtom(cartAtom);

  const priceQueries = api.useQueries((t) =>
    cartItems.map(({ id: movieId }) => t.pricing.getByMovieId({ movieId })),
  );
  const isPriceLoading = priceQueries.some((q) => q.isLoading);

  const pricesMap = useMemo(() => {
    const map = new Map<number, number>();
    cartItems.forEach(({ id }, index) => {
      const data = priceQueries[index]?.data;
      if (data) {
        map.set(id, data.price);
      } else {
        map.set(id, 20);
      }
    });
    return map;
  }, [cartItems, priceQueries]);

  const { data: applicableDiscounts, isLoading: isApplicableLoading } =
    api.discount.getApplicable.useQuery(
      { movieIds: cartItems.map((item) => item.id) },
      { enabled: cartItems.length > 0 },
    );

  const bestDiscount = applicableDiscounts;

  const { subtotal, discountAmount, discountRate, total } = useMemo(() => {
    return calculateCartPricing(cartItems, pricesMap, bestDiscount);
  }, [cartItems, pricesMap, bestDiscount]);
  const isLoading = isPriceLoading || isApplicableLoading;

  return {
    subTotal: subtotal,
    discount: {
      rate: discountRate,
      amount: discountAmount,
      label: bestDiscount?.label ?? "",
    },
    total,
    isLoading,
  };
}
