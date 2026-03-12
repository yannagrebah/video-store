"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { Search, Loader2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "~/components/ui/popover";
import MovieInfo from "~/components/movie-info";
import { api } from "~/trpc/react";
import type { Movie } from "~/lib/types";

const MovieSearchInput = ({
  onSelect,
}: {
  onSelect?: (movie: Movie) => void;
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [debouncedQuery] = useDebounce(query.trim(), 300);

  const { data: movies, isFetching } = api.movie.searchMovies.useQuery(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.length > 0,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (debouncedQuery.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [debouncedQuery]);

  const handleSelect = (movie: Movie) => {
    setQuery("");
    setOpen(false);
    onSelect?.(movie);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for a movie to add to the cart..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (debouncedQuery.length > 0) setOpen(true);
            }}
            className="pl-9"
            aria-label="Search movies"
          />
          {isFetching && (
            <Loader2 className="text-muted-foreground absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin" />
          )}
        </div>
      </PopoverAnchor>

      <PopoverContent
        className="max-h-80 w-(--radix-popover-trigger-width) overflow-y-auto p-1"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {isFetching ? (
          <ul className="flex flex-col gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-2 py-1.5">
                <Skeleton className="h-12 w-8 shrink-0 rounded-sm" />
                <div className="flex min-w-0 items-baseline gap-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-10 rounded" />
                </div>
              </li>
            ))}
          </ul>
        ) : movies && movies.length > 0 ? (
          <ul className="flex flex-col" role="listbox">
            {movies.map((movie) => (
              <li key={movie.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => handleSelect(movie)}
                  className="hover:bg-accent flex w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors"
                >
                  <MovieInfo
                    title={movie.title}
                    release_date={movie.release_date}
                    poster_path={movie.poster_path}
                    size="sm"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No movies found.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default MovieSearchInput;
