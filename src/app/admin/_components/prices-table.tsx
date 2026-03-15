"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type schema from "~/lib/db/schema/d1";

type Price = typeof schema.prices.$inferSelect;

interface PricesTableProps {
  prices: Price[];
  movieTitles: Record<number, string>;
}

export function PricesTable({ prices, movieTitles }: PricesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="col-span-full shadow-sm md:col-span-1">
      <CardHeader>
        <CardTitle>Movie Prices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Movie</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.map((price) => (
                <TableRow
                  key={price.movieId}
                  className={price.movieId === 0 ? "text-muted-foreground" : ""}
                >
                  <TableCell>
                    {price.movieId === 0 ? (
                      <span className="font-mono">DEFAULT_PRICE</span>
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
                </TableRow>
              ))}
              {prices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={2}
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
