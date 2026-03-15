import { Pencil, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import { DiscountsTable } from "../_components/discounts-table";
import ConfirmDeleteDialog from "./_components/confirm-delete-dialog";
import UpsertDiscountDialog from "./_components/upsert-discount-dialog";

export default async function DiscountsPage() {
  const discounts = await api.discount.getAll();

  return (
    <section className="bg-background mx-auto h-[calc(100vh-4rem)] max-w-4xl space-y-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Discounts</h2>
        <p className="text-muted-foreground">
          Manage movie discounts and bundle promotions.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Manage Discounts</h2>
          <UpsertDiscountDialog>
            <Button size="sm">
              <Plus className="mr-2 size-4" />
              Add Discount
            </Button>
          </UpsertDiscountDialog>
        </div>

        <DiscountsTable
          discounts={discounts}
          title={null}
          renderActions={(discount) => (
            <div className="flex justify-end gap-2">
              <UpsertDiscountDialog discount={discount}>
                <Button variant="ghost" size="icon">
                  <Pencil className="size-4" />
                </Button>
              </UpsertDiscountDialog>
              <ConfirmDeleteDialog
                discountId={discount.id}
                discountLabel={discount.label}
              />
            </div>
          )}
        />
      </div>
    </section>
  );
}
