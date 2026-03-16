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
const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
const mockWhereDelete = jest.fn();
const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });

const mockDb = {
  query: {
    discounts: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
  insert: jest.fn().mockReturnValue({ values: mockValues }),
  update: jest.fn().mockReturnValue({ set: mockSet }),
  delete: jest.fn().mockReturnValue({ where: mockWhereDelete }),
};

// Create a caller with the mocked context
const caller = createCaller({ db: mockDb } as any);

describe("discountRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return a list of discounts", async () => {
      const mockDiscounts = [
        { id: 1, label: "10% off", discountRate: 0.1, movieBundles: [[1, 2]] },
      ];
      mockDb.query.discounts.findMany.mockResolvedValueOnce(mockDiscounts);

      const result = await caller.discount.getAll();

      expect(mockDb.query.discounts.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDiscounts);
    });

    it("should return empty array on error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockDb.query.discounts.findMany.mockRejectedValueOnce(
        new Error("DB Error"),
      );

      const result = await caller.discount.getAll();

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("getById", () => {
    it("should return a discount by id", async () => {
      const mockDiscount = {
        id: 1,
        label: "10% off",
        discountRate: 0.1,
        movieBundles: [[1, 2]],
      };
      mockDb.query.discounts.findFirst.mockResolvedValueOnce(mockDiscount);

      const result = await caller.discount.getById({ id: 1 });

      expect(mockDb.query.discounts.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDiscount);
    });

    it("should return null if discount not found", async () => {
      mockDb.query.discounts.findFirst.mockResolvedValueOnce(undefined);

      const result = await caller.discount.getById({ id: 999 });

      expect(result).toBeNull();
    });
  });

  describe("getApplicable", () => {
    it("should return the best applicable discount for given movies", async () => {
      const mockDiscounts = [
        {
          id: 1,
          label: "10% off 2 movies",
          discountRate: 0.1,
          movieBundles: [[1, 2]],
        },
        {
          id: 2,
          label: "20% off 3 movies",
          discountRate: 0.2,
          movieBundles: [[1, 2, 3]],
        },
      ];
      mockDb.query.discounts.findMany.mockResolvedValueOnce(mockDiscounts);

      // Asking for applicable discounts for movies [1, 2, 3]
      const result = await caller.discount.getApplicable({
        movieIds: [1, 2, 3],
      });

      expect(mockDb.query.discounts.findMany).toHaveBeenCalledTimes(1);
      // It should match the 20% discount as the best one
      expect(result).toEqual(mockDiscounts[1]);
    });

    it("should return null if no applicable discount is found", async () => {
      const mockDiscounts = [
        { id: 1, label: "10% off", discountRate: 0.1, movieBundles: [[1, 2]] },
      ];
      mockDb.query.discounts.findMany.mockResolvedValueOnce(mockDiscounts);

      // Asking for applicable discounts for movies [4, 5]
      const result = await caller.discount.getApplicable({ movieIds: [4, 5] });

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should insert a new discount and return it", async () => {
      const newDiscountInput = {
        label: "New Discount",
        discountRate: 0.15,
        movieBundles: [[4, 5]],
      };
      const createdDiscount = { id: 2, ...newDiscountInput };
      mockReturning.mockResolvedValueOnce([createdDiscount]);

      const result = await caller.discount.create(newDiscountInput);

      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockValues).toHaveBeenCalledWith(newDiscountInput);
      expect(mockReturning).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdDiscount);
    });
  });

  describe("update", () => {
    it("should update an existing discount and return it", async () => {
      const updateInput = {
        id: 1,
        label: "Updated Discount",
        discountRate: 0.25,
        movieBundles: [[1, 2, 3]],
      };
      const updatedDiscount = { ...updateInput };
      mockReturning.mockResolvedValueOnce([updatedDiscount]);

      const result = await caller.discount.update(updateInput);

      expect(mockDb.update).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalledWith({
        label: updateInput.label,
        discountRate: updateInput.discountRate,
        movieBundles: updateInput.movieBundles,
      });
      expect(mockWhere).toHaveBeenCalledTimes(1);
      expect(mockReturning).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedDiscount);
    });
  });

  describe("delete", () => {
    it("should delete an existing discount by id", async () => {
      const deleteInput = { id: 1 };
      mockWhereDelete.mockResolvedValueOnce(undefined);

      const result = await caller.discount.delete(deleteInput);

      expect(mockDb.delete).toHaveBeenCalledTimes(1);
      expect(mockWhereDelete).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true });
    });
  });
});
