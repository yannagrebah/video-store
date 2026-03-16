import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { MoviePrice } from "~/lib/types";
import { formatCurrency } from "~/lib/utils";
import { api } from "~/trpc/server";

export async function PricesTable({
  title = "Movie Prices",
  renderAction,
}: {
  title?: React.ReactNode;
  renderAction?: (price: MoviePrice) => React.ReactNode;
}) {
  const moviePrices = await api.pricing.getAll();

  const movieTitles: Record<number, string> = {};
  await Promise.all(
    moviePrices.map(async (price) => {
      if (price.movieId > 0) {
        try {
          const movie = await api.movie.getMovieDetails({
            id: price.movieId,
            credits: false,
          });
          movieTitles[price.movieId] = movie.title;
        } catch {
          movieTitles[price.movieId] = `Movie ID: ${price.movieId}`;
        }
      }
    }),
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Movie</TableHead>
                <TableHead className="text-right">Price</TableHead>
                {renderAction && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {moviePrices.map((price) => (
                <TableRow key={price.movieId}>
                  <TableCell>
                    {price.movieId === 0 ? (
                      <Tooltip>
                        <TooltipTrigger className="cursor-help">
                          <span className="text-muted-foreground font-mono">
                            DEFAULT_PRICE
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="font-medium">
                          This price applies to all movies that don&apos;t have
                          a specific price configured.
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="font-medium">
                        {movieTitles[price.movieId] ??
                          `Movie ID: ${price.movieId}`}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(price.price)}
                  </TableCell>
                  {renderAction && (
                    <TableCell className="text-right">
                      {renderAction(price)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {moviePrices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={renderAction ? 3 : 2}
                    className="text-muted-foreground py-6 text-center"
                  >
                    No prices configured.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
