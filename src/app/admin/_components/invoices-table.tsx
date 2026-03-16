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
import { formatCurrency } from "~/lib/utils";
import { api } from "~/trpc/server";
import type { Invoice } from "~/lib/types";

export async function InvoicesTable({
  title = "Recent Invoices",
  limit = 5,
  renderActions,
}: {
  title?: React.ReactNode;
  limit?: number;
  renderActions?: (invoice: Invoice) => React.ReactNode;
}) {
  const invoices = await api.invoice.getAll();

  const sortedInvoices = [...invoices].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const displayedInvoices =
    limit > 0 ? sortedInvoices.slice(0, limit) : sortedInvoices;

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
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="text-right">Total</TableHead>
                {renderActions && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedInvoices.map((invoice) => (
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
                  {renderActions && (
                    <TableCell className="text-right">
                      {renderActions(invoice)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {displayedInvoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={renderActions ? 6 : 5}
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
