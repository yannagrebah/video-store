import { HydrateClient } from "~/trpc/server";
import Cart from "./_components/cart";
import Link from "next/link";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="bg-background min-h-screen">
        <nav className="border-b-2 p-2">
          <Link href="/">
            <h1 className="font-display text-center text-2xl font-bold tracking-tight uppercase md:text-left">
              VideoStore
            </h1>
          </Link>
        </nav>
        <section className="space-y-4 px-4 py-6">
          <Cart />
        </section>
      </main>
    </HydrateClient>
  );
}
