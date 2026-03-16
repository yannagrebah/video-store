/* eslint-disable */
import { createCaller } from "../server/api/root";
import { TRPCError } from "@trpc/server";
import { generateInvoicePdf } from "../lib/generate-invoice-pdf";
import { fetchTMDB } from "../server/api/routers/movie";

// Mock dependencies to bypass ESM and environment issues in Jest
jest.mock("superjson", () => ({
  __esModule: true,
  default: {
    serialize: jest.fn(),
    deserialize: jest.fn(),
  },
}));

jest.mock("@opennextjs/cloudflare", () => ({
  __esModule: true,
  getCloudflareContext: jest.fn(() => ({ env: { DB: {} } })),
}));

jest.mock("../env.js", () => ({
  env: {
    NODE_ENV: "test",
    TMDB_API_KEY: "test-api-key",
    GEMINI_API_KEY: "test",
  },
}));

jest.mock("../lib/generate-invoice-pdf", () => ({
  generateInvoicePdf: jest.fn(),
}));

jest.mock("../server/api/routers/movie", () => {
  const originalModule = jest.requireActual("../server/api/routers/movie");
  return {
    __esModule: true,
    ...originalModule,
    fetchTMDB: jest.fn(),
  };
});

// Mock Drizzle ORM chainable methods
const mockReturning = jest.fn();
const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });

const mockDb = {
  query: {
    invoices: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    prices: {
      findMany: jest.fn(),
    },
    discounts: {
      findMany: jest.fn(),
    },
  },
  insert: jest.fn().mockReturnValue({ values: mockValues }),
};

const caller = createCaller({ db: mockDb } as any);

describe("invoiceRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return a list of invoices", async () => {
      const mockInvoices = [{ id: 1, total: 100 }];
      mockDb.query.invoices.findMany.mockResolvedValueOnce(mockInvoices);

      const result = await caller.invoice.getAll();

      expect(mockDb.query.invoices.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockInvoices);
    });

    it("should return empty array on database error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockDb.query.invoices.findMany.mockRejectedValueOnce(
        new Error("DB Error"),
      );

      const result = await caller.invoice.getAll();

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("getById", () => {
    it("should return an invoice by id", async () => {
      const mockInvoice = { id: 1, total: 100 };
      mockDb.query.invoices.findFirst.mockResolvedValueOnce(mockInvoice);

      const result = await caller.invoice.getById({ id: 1 });

      expect(mockDb.query.invoices.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockInvoice);
    });

    it("should return null if invoice not found", async () => {
      mockDb.query.invoices.findFirst.mockResolvedValueOnce(undefined);

      const result = await caller.invoice.getById({ id: 999 });

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should calculate pricing and create an invoice", async () => {
      // Setup mock data for prices and discounts
      mockDb.query.prices.findMany.mockResolvedValueOnce([
        { movieId: 1, price: 15 },
        { movieId: 0, price: 20 }, // Default price fallback
      ]);
      mockDb.query.discounts.findMany.mockResolvedValueOnce([]); // No discounts

      const mockInput = {
        items: [{ id: 1, title: "Movie 1", quantity: 2 }],
      };

      const expectedCreatedInvoice = {
        id: 1,
        items: [{ movieId: 1, quantity: 2, unitPrice: 15 }],
        subtotal: 30,
        discountAmount: 0,
        discountRate: 0,
        total: 30,
      };

      mockReturning.mockResolvedValueOnce([expectedCreatedInvoice]);

      const result = await caller.invoice.create(mockInput);

      expect(mockDb.query.prices.findMany).toHaveBeenCalledTimes(1);
      expect(mockDb.query.discounts.findMany).toHaveBeenCalledTimes(1);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          subtotal: 30,
          total: 30,
        }),
      );
      expect(result).toEqual(expectedCreatedInvoice);
    });
  });

  describe("generatePdf", () => {
    it("should throw a TRPCError if the invoice is not found", async () => {
      mockDb.query.invoices.findFirst.mockResolvedValueOnce(undefined);

      await expect(caller.invoice.generatePdf({ id: 999 })).rejects.toThrow(
        TRPCError,
      );
    });

    it("should generate a PDF and return base64 data along with metadata", async () => {
      const mockInvoice = {
        id: 1,
        items: [{ movieId: 1, quantity: 2, unitPrice: 15 }],
        subtotal: 30,
        discountRate: 0,
        discountAmount: 0,
        total: 30,
        createdAt: new Date("2023-10-27T10:00:00Z"),
      };
      mockDb.query.invoices.findFirst.mockResolvedValueOnce(mockInvoice);

      // Mock TMDB response to resolve the movie title
      (fetchTMDB as jest.Mock).mockResolvedValueOnce({
        id: 1,
        title: "Test Movie Title",
        release_date: "2023-01-01",
        poster_path: null,
      });

      // Mock PDF generation result (Uint8Array representation of a string "test")
      const mockPdfBytes = new Uint8Array([116, 101, 115, 116]);
      (generateInvoicePdf as jest.Mock).mockResolvedValueOnce(mockPdfBytes);

      const result = await caller.invoice.generatePdf({ id: 1 });

      expect(mockDb.query.invoices.findFirst).toHaveBeenCalledWith({
        where: expect.any(Object),
      });
      expect(fetchTMDB).toHaveBeenCalledWith("/movie/1");

      // Ensure the adapter received the correctly mapped properties to format the doc
      expect(generateInvoicePdf).toHaveBeenCalledWith({
        lineItems: [
          {
            title: "Test Movie Title",
            quantity: 2,
            unitPrice: 15,
            lineTotal: 30,
          },
        ],
        purchaseDate: mockInvoice.createdAt.toISOString(),
        subtotal: 30,
        discountRate: 0,
        discountAmount: 0,
        total: 30,
      });

      expect(result).toEqual({
        fileName: "invoice-2023-10-27.pdf",
        mimeType: "application/pdf",
        pdfBase64: btoa("test"),
      });
    });
  });
});
