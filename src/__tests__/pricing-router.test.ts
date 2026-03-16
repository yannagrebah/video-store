/* eslint-disable */
import { createCaller } from "../server/api/root";

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
    TMDB_API_KEY: "test",
    GEMINI_API_KEY: "test",
  },
}));

// Mock Drizzle ORM chainable methods
const mockReturning = jest.fn();
const mockOnConflictDoUpdate = jest
  .fn()
  .mockReturnValue({ returning: mockReturning });
const mockValues = jest
  .fn()
  .mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate });
const mockWhere = jest.fn();

const mockDb = {
  query: {
    prices: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
  insert: jest.fn().mockReturnValue({ values: mockValues }),
  delete: jest.fn().mockReturnValue({ where: mockWhere }),
};

// Create a caller with the mocked context
const caller = createCaller({ db: mockDb } as any);

describe("pricingRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return a list of all prices", async () => {
      const mockPrices = [
        { movieId: 1, price: 15 },
        { movieId: 0, price: 20 }, // Default price
      ];
      mockDb.query.prices.findMany.mockResolvedValueOnce(mockPrices);

      const result = await caller.pricing.getAll();

      expect(mockDb.query.prices.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPrices);
    });

    it("should return an empty array on database error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockDb.query.prices.findMany.mockRejectedValueOnce(new Error("DB Error"));

      const result = await caller.pricing.getAll();

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("getByMovieId", () => {
    it("should return the specific movie price if it exists", async () => {
      const specificPrice = { movieId: 1, price: 15 };
      const defaultPrice = { movieId: 0, price: 20 };

      // Promise.all runs concurrently. We mock specific first, then default.
      mockDb.query.prices.findFirst
        .mockResolvedValueOnce(specificPrice)
        .mockResolvedValueOnce(defaultPrice);

      const result = await caller.pricing.getByMovieId({ movieId: 1 });

      expect(mockDb.query.prices.findFirst).toHaveBeenCalledTimes(2);
      expect(result).toEqual(specificPrice);
    });

    it("should return the default price (movieId: 0) if specific movie price does not exist", async () => {
      const defaultPrice = { movieId: 0, price: 20 };

      mockDb.query.prices.findFirst
        .mockResolvedValueOnce(undefined) // specific not found
        .mockResolvedValueOnce(defaultPrice); // default found

      const result = await caller.pricing.getByMovieId({ movieId: 999 });

      expect(result).toEqual(defaultPrice);
    });

    it("should return null if neither specific nor default price exists", async () => {
      mockDb.query.prices.findFirst
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      const result = await caller.pricing.getByMovieId({ movieId: 999 });

      expect(result).toBeNull();
    });
  });

  describe("upsert", () => {
    it("should insert or update a movie price and return it", async () => {
      const input = { movieId: 1, price: 18 };
      mockReturning.mockResolvedValueOnce([input]);

      const result = await caller.pricing.upsert(input);

      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe("delete", () => {
    it("should delete a movie price by movieId", async () => {
      mockWhere.mockResolvedValueOnce(undefined);
      const result = await caller.pricing.delete({ movieId: 1 });

      expect(mockDb.delete).toHaveBeenCalledTimes(1);
      expect(mockWhere).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true });
    });
  });
});
