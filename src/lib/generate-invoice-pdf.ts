import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { formatCurrency } from "~/lib/utils";

type InvoiceLineItem = {
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type InvoiceData = {
  lineItems: InvoiceLineItem[];
  purchaseDate: string;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  total: number;
};

async function generateInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  const { lineItems, purchaseDate, subtotal, discountAmount, total } = data;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(
    fontkit as Parameters<PDFDocument["registerFontkit"]>[0],
  );
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 (points)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontRes = await fetch(
    "https://raw.githubusercontent.com/google/fonts/main/ofl/audiowide/Audiowide-Regular.ttf",
  );
  const audiowideBytes = await fontRes.arrayBuffer();

  const audiowideFont = await pdfDoc.embedFont(audiowideBytes);

  const { width, height } = page.getSize();
  const marginX = 48;
  const tableStartX = marginX;
  const tableWidth = width - marginX * 2;
  const rowHeight = 20;

  let y = height - 56;

  // Store title
  page.drawText("VIDEOSTORE", {
    x: marginX,
    y,
    size: 20,
    font: audiowideFont,
    color: rgb(0.25, 0.25, 0.25),
  });

  y -= 32;

  // Header
  page.drawText("Invoice", {
    x: marginX,
    y,
    size: 28,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  y -= 30;
  page.drawText(
    `Purchase date: ${new Date(purchaseDate).toLocaleString("en-GB")}`,
    {
      x: marginX,
      y,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    },
  );

  y -= 26;

  // Table header
  const colX = {
    title: tableStartX,
    qty: tableStartX + tableWidth * 0.53,
    unit: tableStartX + tableWidth * 0.67,
    line: tableStartX + tableWidth * 0.82,
  };

  page.drawRectangle({
    x: tableStartX,
    y: y - 6,
    width: tableWidth,
    height: rowHeight + 6,
    color: rgb(0.95, 0.95, 0.95),
  });

  page.drawText("Movie", {
    x: colX.title,
    y,
    size: 10,
    font: boldFont,
  });
  page.drawText("Qty", {
    x: colX.qty,
    y,
    size: 10,
    font: boldFont,
  });
  page.drawText("Unit Price", {
    x: colX.unit,
    y,
    size: 10,
    font: boldFont,
  });
  page.drawText("Line Total", {
    x: colX.line,
    y,
    size: 10,
    font: boldFont,
  });

  y -= 26;

  // Rows
  for (const item of lineItems) {
    if (y < 120) {
      // very basic overflow handling
      page = pdfDoc.addPage([595.28, 841.89]);
      y = page.getSize().height - 56;

      page.drawText("Invoice (continued)", {
        x: marginX,
        y,
        size: 18,
        font: boldFont,
      });

      y -= 30;

      page.drawText("Movie", {
        x: colX.title,
        y,
        size: 10,
        font: boldFont,
      });
      page.drawText("Qty", {
        x: colX.qty,
        y,
        size: 10,
        font: boldFont,
      });
      page.drawText("Unit Price", {
        x: colX.unit,
        y,
        size: 10,
        font: boldFont,
      });
      page.drawText("Line Total", {
        x: colX.line,
        y,
        size: 10,
        font: boldFont,
      });

      y -= 24;
    }

    page.drawText(item.title, {
      x: colX.title,
      y,
      size: 10,
      font,
      maxWidth: tableWidth * 0.5,
    });
    page.drawText(String(item.quantity), {
      x: colX.qty,
      y,
      size: 10,
      font,
    });
    page.drawText(formatCurrency(item.unitPrice), {
      x: colX.unit,
      y,
      size: 10,
      font,
    });
    page.drawText(formatCurrency(item.lineTotal), {
      x: colX.line,
      y,
      size: 10,
      font,
    });

    y -= 18;
  }

  y -= 16;

  // Totals
  const labelX = tableStartX + tableWidth * 0.62;
  const valueX = tableStartX + tableWidth * 0.82;

  page.drawLine({
    start: { x: labelX, y: y + 10 },
    end: { x: tableStartX + tableWidth, y: y + 10 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  page.drawText("Subtotal", {
    x: labelX,
    y: y - 4,
    size: 10,
    font,
  });
  page.drawText(formatCurrency(subtotal), {
    x: valueX,
    y: y - 4,
    size: 10,
    font,
  });

  y -= 18;

  page.drawText("Discount", {
    x: labelX,
    y: y - 4,
    size: 10,
    font,
  });
  page.drawText(`-${formatCurrency(discountAmount)}`, {
    x: valueX,
    y: y - 4,
    size: 10,
    font,
    color: discountAmount > 0 ? rgb(0, 0.5, 0) : rgb(0.1, 0.1, 0.1),
  });

  y -= 20;

  page.drawText("Total", {
    x: labelX,
    y: y - 4,
    size: 12,
    font: boldFont,
  });
  page.drawText(formatCurrency(total), {
    x: valueX,
    y: y - 4,
    size: 12,
    font: boldFont,
  });

  return pdfDoc.save();
}

export { generateInvoicePdf };
export type { InvoiceLineItem, InvoiceData };
