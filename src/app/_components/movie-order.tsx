"use client";

import { useAtom } from "jotai";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import MovieCartList from "~/components/movie-cart-list";
import MovieSearchInput from "~/components/movie-search-input";
import { useCartTotal } from "~/hooks/use-cart-total";
import { useCartDiscount } from "~/hooks/use-cart-discount";
import { cartAtom } from "~/lib/atoms";
import type { Movie } from "~/lib/types";
import { formatCurrency } from "~/lib/utils";

const MovieOrder = () => {
  const [cartItems, setCartItems] = useAtom(cartAtom);
  const { totalPrice: subtotal, isLoading: isTotalLoading } =
    useCartTotal(cartItems);
  const {
    discountRate,
    discountAmount,
    isLoading: isDiscountLoading,
  } = useCartDiscount(cartItems);

  const isLoading = isTotalLoading || isDiscountLoading;
  const finalTotal = subtotal - discountAmount;

  const handleSelect = (movie: Movie) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === movie.id);
      if (existing) {
        return prev.map((item) =>
          item.id === movie.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...movie, quantity: 1 }];
    });
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const handleDelete = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <MovieSearchInput onSelect={handleSelect} />
      <article className="max-h-[50lvh] overflow-y-auto px-4">
        <MovieCartList
          movieCartItems={cartItems}
          onQuantityChange={handleQuantityChange}
          onDelete={handleDelete}
        />
      </article>
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Subtotal</span>
            {isLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <span className="text-foreground text-sm font-medium">
                {formatCurrency(subtotal)}
              </span>
            )}
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-discount text-sm">
                Discount ({(discountRate * 100).toFixed(0)}% on Back to the
                Future)
              </span>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <span className="text-discount text-sm font-medium">
                  -{formatCurrency(discountAmount)}
                </span>
              )}
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-foreground text-sm font-semibold">Total</span>
            {isLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <span className="text-foreground text-xl font-bold">
                {formatCurrency(finalTotal)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MovieOrder;
