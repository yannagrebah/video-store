import Image from "next/image";
import { Film } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Movie } from "~/lib/types";

const posterSizes = {
  default: { className: "h-24 w-16 rounded-md", sizes: "64px" },
  sm: { className: "h-12 w-8 rounded-sm", sizes: "32px" },
} as const;

const MovieInfo = ({
  title,
  release_date,
  poster_path,
  size = "default",
  className,
}: Pick<Movie, "title" | "release_date" | "poster_path"> & {
  size?: keyof typeof posterSizes;
  className?: string;
}) => {
  const poster = posterSizes[size];
  const year = release_date?.split("-")[0];

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div
        className={cn(
          "bg-muted relative shrink-0 overflow-hidden",
          poster.className,
        )}
      >
        {poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w92${poster_path}`}
            alt={`${title} poster`}
            fill
            className="object-cover"
            sizes={poster.sizes}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="text-muted-foreground size-4" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 items-baseline gap-2">
        <span className="text-foreground truncate text-sm font-medium">
          {title}
        </span>
        {year && (
          <span className="text-muted-foreground shrink-0 text-xs">
            {year}
          </span>
        )}
      </div>
    </div>
  );
};

export default MovieInfo;
