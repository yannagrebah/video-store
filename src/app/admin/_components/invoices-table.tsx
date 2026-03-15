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

type Invoice = typeof schema.invoices.$inferSelect;

interface RecentInvoicesProps {
  invoices: Invoice[];
}

export function InvoicesTable({ invoices }: RecentInvoicesProps) {
  // Show only the last 5 invoices, sorted by descending date
  const recentInvoices = [...invoices]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="col-span-full shadow-sm">
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">#{invoice.id}</TableCell>
                  <TableCell>
                    {invoice.createdAt
                      ? new Intl.DateTimeFormat("fr-FR", {
                          dateStyle: "short",
                          timeZone: "Europe/Paris",
                        }).format(new Date(invoice.createdAt))
                      : "N/A"}
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.subtotal)}</TableCell>
                  <TableCell>
                    {invoice.discountAmount > 0 ? (
                      <div className="flex items-center gap-2">
                        {invoice.discountRate > 0 && (
                          <Badge
                            variant="secondary"
                            className="bg-discount/10 text-discount"
                          >
                            {(invoice.discountRate * 100).toFixed(0)}% OFF
                          </Badge>
                        )}
                        <span className="text-discount">
                          -{formatCurrency(invoice.discountAmount)}
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(invoice.total)}
                  </TableCell>
                </TableRow>
              ))}
              {recentInvoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground py-6 text-center"
                  >
                    No invoices found.
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
