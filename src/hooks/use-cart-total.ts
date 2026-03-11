import { api } from "~/trpc/react";
import type { MovieCart } from "~/lib/types";

export function useCartTotal(cartItems: MovieCart[]) {
  const priceQueries = api.useQueries((t) =>
    cartItems.map((item) =>
      t.movie.getPrice(
        { id: item.id },
        { refetchOnWindowFocus: false },
      ),
    ),
  );

  const isLoading = priceQueries.some((q) => q.isLoading);

  const totalPrice = priceQueries.reduce((sum, query, index) => {
    const unitPrice = query.data?.unitPrice ?? 0;
    const quantity = cartItems[index]?.quantity ?? 0;
    return sum + unitPrice * quantity;
  }, 0);

  return { totalPrice, isLoading };
}
