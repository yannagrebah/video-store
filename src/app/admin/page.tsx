import Link from "next/link";

export default async function Admin() {
  return (
    <main className="bg-background min-h-screen">
      <nav className="border-b-2 p-2 md:grid md:grid-flow-col md:items-center md:justify-between">
        <Link href="/">
          <h1 className="font-display text-center text-2xl font-bold tracking-tight uppercase md:text-left">
            VideoStore
          </h1>
        </Link>
      </nav>
    </main>
  );
}
