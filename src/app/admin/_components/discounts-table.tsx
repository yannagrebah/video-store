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
import { Badge } from "~/components/ui/badge";
import type schema from "~/lib/db/schema/d1";

type Discount = typeof schema.discounts.$inferSelect;

interface DiscountsTableProps {
  discounts: Discount[];
}

export function DiscountsTable({ discounts }: DiscountsTableProps) {
  return (
    <Card className="col-span-full shadow-sm md:col-span-2">
      <CardHeader>
        <CardTitle>Active Discounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-medium">
                    {discount.label}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-discount/10 text-discount"
                    >
                      {(discount.discountRate * 100).toFixed(0)}% OFF
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {discounts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground py-6 text-center"
                  >
                    No discounts configured.
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
