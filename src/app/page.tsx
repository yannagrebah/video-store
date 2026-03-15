import { HydrateClient } from "~/trpc/server";
import Cart from "./_components/cart";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import MovieAIAgent from "~/components/movie-ai-agent";
import { Bot } from "lucide-react";
import PurchaseSuccess from "./_components/purchase-success";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ purchaseSuccess?: string }>;
}) {
  const invoiceId = (await searchParams).purchaseSuccess;
  return (
    <HydrateClient>
      <main className="bg-background min-h-screen">
        <nav className="border-b-2 p-2 md:grid md:grid-flow-col md:items-center md:justify-between">
          <Link href="/">
            <h1 className="font-display text-center text-2xl font-bold tracking-tight uppercase md:text-left">
              VideoStore
            </h1>
          </Link>
          <MovieAIAgent>
            <Button
              variant="outline"
              size={"icon"}
              className="absolute right-4 bottom-4 md:relative md:right-0 md:bottom-0"
            >
              <Bot className="size-4" />
            </Button>
          </MovieAIAgent>
        </nav>
        <section className="space-y-4 px-4 py-6">
          {invoiceId ? <PurchaseSuccess invoiceId={invoiceId} /> : <Cart />}
        </section>
      </main>
    </HydrateClient>
  );
}
