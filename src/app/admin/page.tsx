import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const GrossRevenue = dynamic(
  () => import("./_components/gross-revenue/index").then((mod) => mod.default),
  {
    loading: () => (
      <Card className="col-span-full shadow-sm lg:col-span-3">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="min-h-75 w-full" />
        </CardContent>
      </Card>
    ),
  },
);

const TopMovies = dynamic(
  () => import("./_components/top-movies/index").then((mod) => mod.default),
  {
    loading: () => (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="aspect-square min-h-75 rounded-full" />
        </CardContent>
      </Card>
    ),
  },
);

const PricesTable = dynamic(
  () => import("./_components/prices-table").then((mod) => mod.PricesTable),
  {
    loading: () => (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    ),
  },
);

const DiscountsTable = dynamic(
  () =>
    import("./_components/discounts-table").then((mod) => mod.DiscountsTable),
  {
    loading: () => (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    ),
  },
);

const InvoicesTable = dynamic(
  () => import("./_components/invoices-table").then((mod) => mod.InvoicesTable),
  {
    loading: () => (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    ),
  },
);

export default function Admin() {
  return (
    <section className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <GrossRevenue />
        <TopMovies />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link href="/admin/prices" className="group">
          <PricesTable
            title={
              <span className="flex items-center gap-1">
                Movie Prices
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            }
          />
        </Link>
        <Link href="/admin/discounts" className="group md:col-span-2">
          <DiscountsTable
            title={
              <span className="flex items-center gap-1">
                Active Discounts
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            }
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Link href="/admin/invoices" className="group">
          <InvoicesTable
            title={
              <span className="flex items-center gap-1">
                Recent Invoices
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            }
          />
        </Link>
      </div>
    </section>
  );
}
