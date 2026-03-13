"use client";

import type { MovieCart } from "~/lib/types";
import MovieCartItem from "./movie-cart-item";
import { useAutoAnimate } from "@formkit/auto-animate/react";
const MovieCartList = ({
  movieCartItems,
  onQuantityChange,
  onDelete,
}: {
  movieCartItems: MovieCart[];
  onQuantityChange: (id: number, quantity: number) => void;
  onDelete: (id: number) => void;
}) => {
  const [parent] = useAutoAnimate();
  return (
    <ul className="space-y-4 py-6" ref={parent}>
      {movieCartItems.length === 0 && (
        <li className="text-muted-foreground text-center text-sm">
          Your cart is empty. Add some movies to get started!
        </li>
      )}
      {movieCartItems.map((item) => (
        <MovieCartItem
          {...item}
          key={item.id}
          onQuantityChange={onQuantityChange}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default MovieCartList;
