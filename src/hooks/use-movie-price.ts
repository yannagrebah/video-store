import { api } from "~/trpc/react";

export function useMoviePrice(id: number, quantity = 1) {
  const { data, isLoading } = api.movie.getPrice.useQuery(
    { id },
    { refetchOnWindowFocus: false },
  );

  const unitPrice = data?.unitPrice ?? 0;
  const totalPrice = unitPrice * quantity;

  return { unitPrice, totalPrice, isLoading };
}
