import { InvoicesTable } from "../_components/invoices-table";
import DownloadButton from "./_components/download-button";

export default function InvoicesPage() {
  return (
    <section className="bg-background mx-auto w-full space-y-6 p-4 md:max-w-4xl md:min-w-4xl md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        <p className="text-muted-foreground">
          View all customer invoices and download PDF receipts.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">All Invoices</h2>
        </div>

        <InvoicesTable
          title={null}
          limit={0} // Show all invoices
          renderActions={(invoice) => (
            <div className="flex justify-end gap-2">
              <DownloadButton invoiceId={invoice.id} />
            </div>
          )}
        />
      </div>
    </section>
  );
}
