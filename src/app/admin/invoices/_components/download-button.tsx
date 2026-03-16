"use client";

import { Loader2, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { downloadPdf } from "~/lib/utils";

function DownloadButton({ invoiceId }: { invoiceId: number }) {
  const { mutate, isPending } = api.invoice.generatePdf.useMutation({
    onSuccess: (data) => {
      downloadPdf(data.pdfBase64, data.fileName, data.mimeType);
    },
  });

  function handleDownload() {
    mutate({ id: invoiceId });
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <>
          <Download className="mr-2 size-4" />
          PDF
        </>
      )}
    </Button>
  );
}
export default DownloadButton;
