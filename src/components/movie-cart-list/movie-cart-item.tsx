"use client";

import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import MovieInfo from "~/components/movie-info";
import type { MovieCart } from "~/lib/types";
import { formatCurrency } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useMemo } from "react";

const MovieCartItem = ({
  id,
  poster_path,
  title,
  release_date,
  quantity = 1,
  onQuantityChange,
  onDelete,
}: MovieCart & {
  onQuantityChange: (id: number, quantity: number) => void;
  onDelete: (id: number) => void;
}) => {
  const { data, isLoading } = api.pricing.getByMovieId.useQuery(
    { movieId: id },
    { refetchOnWindowFocus: false },
  );
  const totalPrice = useMemo(() => {
    const unitPrice = data?.price ?? 0;
    return unitPrice * quantity;
  }, [data, quantity]);
  return (
    <li className="border-border bg-card flex items-center gap-4 rounded-lg border p-3">
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <MovieInfo
          title={title}
          release_date={release_date}
          poster_path={poster_path}
          size="default"
        />

        <div className="flex shrink-0 items-center gap-3">
          {isLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <span className="text-foreground w-16 text-right text-sm font-semibold">
              {formatCurrency(totalPrice)}
            </span>
          )}
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 1) {
                onQuantityChange(id, value);
              }
            }}
            className="w-18"
            aria-label={`Quantity for ${title}`}
          />

          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(id)}
            aria-label={`Remove ${title} from cart`}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </li>
  );
};

export default MovieCartItem;
