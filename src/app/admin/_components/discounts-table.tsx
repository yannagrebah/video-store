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
import type { Discount } from "~/lib/types";

export function DiscountsTable({
  discounts,
  title = "Active Discounts",
  renderActions,
}: {
  discounts: Discount[];
  title?: React.ReactNode;
  renderActions?: (discount: Discount) => React.ReactNode;
}) {
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
                  {renderActions && (
                    <TableCell className="text-right">
                      {renderActions(discount)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {discounts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={renderActions ? 4 : 3}
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
