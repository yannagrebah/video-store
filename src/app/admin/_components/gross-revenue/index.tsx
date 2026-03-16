import { api } from "~/trpc/server";
import { GrossRevenueChart } from "./gross-revenue-chart";

async function GrossRevenue() {
  const invoices = await api.invoice.getAll();
  return <GrossRevenueChart invoices={invoices} />;
}

export default GrossRevenue;
