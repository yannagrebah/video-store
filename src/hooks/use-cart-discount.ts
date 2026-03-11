import { api } from "~/trpc/react";
import type { MovieCart } from "~/lib/types";

export function useCartDiscount(cartItems: MovieCart[]) {
  const items = cartItems.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  }));

  const { data, isLoading } = api.movie.getDiscount.useQuery(
    { items },
    {
      enabled: cartItems.length > 0,
      refetchOnWindowFocus: false,
    },
  );

  const discountRate = data?.discountRate ?? 0;
  const discountAmount = data?.discountAmount ?? 0;

  return { discountRate, discountAmount, isLoading };
}
