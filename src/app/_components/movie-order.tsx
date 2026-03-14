"use client";

import { useAtom } from "jotai";
import { Card, CardContent } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import MovieCartList from "~/components/movie-cart-list";
import MovieSearchInput from "~/components/movie-search-input";
import { cartAtom } from "~/lib/atoms";
import type { Movie } from "~/lib/types";
import { formatCurrency } from "~/lib/utils";
import { useCart } from "~/hooks/use-cart";

const MovieOrder = () => {
  const [cartItems, setCartItems] = useAtom(cartAtom);
  const { subTotal, discount, total, isLoading } = useCart();

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
      <ScrollArea className="h-[50lvh] px-4">
        <MovieCartList
          movieCartItems={cartItems}
          onQuantityChange={handleQuantityChange}
          onDelete={handleDelete}
        />
      </ScrollArea>
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Subtotal</span>
            {isLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <span className="text-foreground text-sm font-medium">
                {formatCurrency(subTotal)}
              </span>
            )}
          </div>

          {discount.amount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-discount text-sm">{discount.label}</span>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <span className="text-discount text-sm font-medium">
                  -{formatCurrency(discount.amount)}
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
                {formatCurrency(total)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MovieOrder;
