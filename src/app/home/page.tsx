import { HydrateClient } from "~/trpc/server";
import Cart from "./_components/cart";
import PurchaseSuccess from "./_components/purchase-success";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ purchaseSuccess?: string }>;
}) {
  const invoiceId = (await searchParams).purchaseSuccess;
  return (
    <HydrateClient>
      <section className="space-y-4 px-4 py-6">
        {invoiceId ? <PurchaseSuccess invoiceId={invoiceId} /> : <Cart />}
      </section>
    </HydrateClient>
  );
}
