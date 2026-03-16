import {
  generateInvoicePdf,
  type InvoiceData,
} from "../lib/generate-invoice-pdf";
import { PDFDocument } from "pdf-lib";

jest.mock("../lib/utils", () => ({
  formatCurrency: (amount: number) => `€${amount.toFixed(2)}`,
}));

describe("generateInvoicePdf", () => {
  const defaultInvoiceData: InvoiceData = {
    purchaseDate: "2023-10-27T10:00:00Z",
    subtotal: 100,
    discountRate: 0.1,
    discountAmount: 10,
    total: 90,
    lineItems: [
      {
        title: "Test Movie 1",
        quantity: 1,
        unitPrice: 50,
        lineTotal: 50,
      },
      {
        title: "Test Movie 2",
        quantity: 2,
        unitPrice: 25,
        lineTotal: 50,
      },
    ],
  };

  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    // Mock successful font fetch by default to avoid actual network requests
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)), // Dummy buffer
      } as Response),
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("should generate a PDF document successfully", async () => {
    const pdfBytes = await generateInvoicePdf(defaultInvoiceData);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);

    // Verify the output can be loaded as a valid PDF Document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    expect(pdfDoc.getPageCount()).toBe(1);
  });

  it("should gracefully fallback to standard font if custom font fetch throws an error", async () => {
    // Mock network error
    global.fetch = jest.fn(() => Promise.reject(new Error("Network Error")));
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

    const pdfBytes = await generateInvoicePdf(defaultInvoiceData);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to load custom font, falling back to standard font",
      expect.any(Error),
    );
  });

  it("should create multiple pages if there are many line items triggering overflow", async () => {
    // Create a lot of line items to trigger the `y < 120` overflow logic in the function
    const manyItems = Array.from({ length: 40 }).map((_, i) => ({
      title: `Movie ${i}`,
      quantity: 1,
      unitPrice: 10,
      lineTotal: 10,
    }));

    const data: InvoiceData = {
      ...defaultInvoiceData,
      lineItems: manyItems,
    };

    const pdfBytes = await generateInvoicePdf(data);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // 40 items should overflow and create at least 2 pages
    expect(pdfDoc.getPageCount()).toBeGreaterThan(1);
  });
});
