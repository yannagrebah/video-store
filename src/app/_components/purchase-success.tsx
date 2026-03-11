"use client";

import { CircleCheck, Download } from "lucide-react";
import { useAtom } from "jotai";
import { useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cartAtom } from "~/lib/atoms";
import { useCartDiscount } from "~/hooks/use-cart-discount";
import { useCartTotal } from "~/hooks/use-cart-total";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

type InvoiceSnapshot = {
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  total: number;
};

const PurchaseSuccess = () => {
  const [cartItems, setCartItems] = useAtom(cartAtom);
  const snapshotRef = useRef<InvoiceSnapshot | null>(null);

  const { totalPrice: liveSubtotal, isLoading: isTotalLoading } =
    useCartTotal(cartItems);
  const {
    discountRate: liveDiscountRate,
    discountAmount: liveDiscountAmount,
    isLoading: isDiscountLoading,
  } = useCartDiscount(cartItems);
  const isLoading = isTotalLoading || isDiscountLoading;
  const liveTotal = liveSubtotal - liveDiscountAmount;

  // Keep the snapshot up-to-date with live values while the cart still has items
  if (cartItems.length > 0 && !isLoading) {
    snapshotRef.current = {
      subtotal: liveSubtotal,
      discountRate: liveDiscountRate,
      discountAmount: liveDiscountAmount,
      total: liveTotal,
    };
  }

  const snapshot = snapshotRef.current;
  const hasSnapshot = snapshot !== null;

  // Use snapshot values if cart has been cleared, otherwise use live values
  const subtotal =
    cartItems.length > 0 ? liveSubtotal : (snapshot?.subtotal ?? 0);
  const discountRate =
    cartItems.length > 0 ? liveDiscountRate : (snapshot?.discountRate ?? 0);
  const discountAmount =
    cartItems.length > 0 ? liveDiscountAmount : (snapshot?.discountAmount ?? 0);
  const total = cartItems.length > 0 ? liveTotal : (snapshot?.total ?? 0);

  // Show loading skeletons only when cart is active and hooks are loading
  const showLoading = isLoading && cartItems.length > 0;
  // Show preview when we have live or snapshotted data
  const showPreview = showLoading || hasSnapshot || cartItems.length > 0;

  const createInvoice = api.invoice.create.useMutation({
    onSuccess: ({ pdfBase64, fileName }) => {
      const binary = window.atob(pdfBase64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();

      URL.revokeObjectURL(url);
      setCartItems([]);
    },
  });

  const handleDownloadInvoice = () => {
    if (cartItems.length === 0) return;

    createInvoice.mutate({
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
      })),
    });
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <CircleCheck className="size-16 text-emerald-600 dark:text-emerald-400" />
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground text-xl font-bold">
            Thank you for your purchase!
          </h2>
          <p className="text-muted-foreground text-sm">
            Your order is being processed. You will receive a confirmation
            shortly.
          </p>
        </div>

        {showPreview && (
          <div className="w-full max-w-md rounded-lg border p-4 text-left">
            <h3 className="text-foreground text-sm font-semibold">
              Invoice preview
            </h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                {showLoading ? (
                  <Skeleton className="h-5 w-20" />
                ) : (
                  <span className="text-foreground font-medium">
                    {subtotal.toFixed(2)} €
                  </span>
                )}
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Discount ({(discountRate * 100).toFixed(0)}% on Back to the
                    Future)
                  </span>
                  {showLoading ? (
                    <Skeleton className="h-5 w-20" />
                  ) : (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      -{discountAmount.toFixed(2)} €
                    </span>
                  )}
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-semibold">Total</span>
                {showLoading ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <span className="text-foreground text-base font-bold">
                    {total.toFixed(2)} €
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleDownloadInvoice}
          disabled={createInvoice.isPending || cartItems.length === 0}
          className="mt-2"
        >
          <Download className="mr-2 size-4" />
          {createInvoice.isPending
            ? "Generating invoice..."
            : "Download invoice"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PurchaseSuccess;
