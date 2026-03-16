"use client";

import { CircleCheck, Download, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { formatCurrency, downloadPdf } from "~/lib/utils";
import { api } from "~/trpc/react";

const PurchaseSuccess = ({ invoiceId }: { invoiceId: string }) => {
  const { data, isLoading } = api.invoice.getById.useQuery(
    { id: Number(invoiceId) },
    { enabled: !!invoiceId },
  );

  const { mutate: generatePdf, isPending } =
    api.invoice.generatePdf.useMutation({
      onSuccess: ({ pdfBase64, fileName }) => {
        downloadPdf(pdfBase64, fileName);
      },
    });

  const handleDownloadInvoice = () => {
    if (!data) return;
    generatePdf({ id: data.id });
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <CircleCheck className="text-discount size-16" />
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground text-xl font-bold">
            Thank you for your purchase!
          </h2>
          <p className="text-muted-foreground text-sm">
            Your order is being processed. You will receive a confirmation
            shortly.
          </p>
        </div>

        <div className="w-full max-w-md rounded-lg border p-4 text-left">
          <h3 className="text-foreground text-sm font-semibold">
            Invoice preview
          </h3>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <span className="text-foreground font-medium">
                  {formatCurrency(data?.subtotal ?? 0)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-discount">Discount Amount</span>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                data?.discountAmount && (
                  <span className="text-discount font-medium">
                    -{formatCurrency(data.discountAmount)}
                  </span>
                )
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-semibold">Total</span>
              {isLoading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <span className="text-foreground text-base font-bold">
                  {formatCurrency(data?.total ?? 0)}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={handleDownloadInvoice}
          disabled={isLoading || isPending}
          className="mt-2 h-12 text-2xl font-bold md:w-1/3"
          size={"lg"}
        >
          {isPending ? (
            <Loader2 className="mr-2" size={24} />
          ) : (
            <Download className="mr-2" size={24} />
          )}
          {isPending ? "Generating invoice..." : "Download invoice"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PurchaseSuccess;
