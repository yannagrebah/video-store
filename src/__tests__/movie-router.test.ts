/* eslint-disable */
import { createCaller } from "../server/api/root";
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

const caller = createCaller({ db: {} } as any);

describe("movieRouter", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  const mockFetchJSON = (data: any) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => data,
    });
  };

  describe("fetchTMDB", () => {
    it("should append query parameters and headers correctly", async () => {
      mockFetchJSON({ success: true });

      await fetchTMDB("/test", { query: "hello", page: 1 });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.themoviedb.org/3/test?query=hello&page=1",
        {
          headers: {
            Authorization: "Bearer test-api-key",
            Accept: "application/json",
          },
        },
      );
    });

    it("should throw an error if the response is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      await expect(fetchTMDB("/test")).rejects.toThrow(
        "TMDB API error: 401 Unauthorized",
      );
    });
  });

  describe("searchMovies", () => {
    it("should return up to 5 mapped movies", async () => {
      const mockMovies = Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        title: `Movie ${i + 1}`,
        release_date: "2023-01-01",
        poster_path: `/poster${i + 1}.jpg`,
        overview: "An overview", // Extraneous field to ensure it gets mapped out
      }));

      mockFetchJSON({
        page: 1,
        results: mockMovies,
      });

      const result = await caller.movie.searchMovies({ query: "Test" });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/search/movie?query=Test"),
        expect.any(Object),
      );
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({
        id: 1,
        title: "Movie 1",
        release_date: "2023-01-01",
        poster_path: "/poster1.jpg",
      });
    });
  });

  describe("searchMoviePerson", () => {
    it("should return up to 5 mapped people", async () => {
      const mockPeople = Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        profile_path: `/profile${i + 1}.jpg`,
        gender: 1,
        known_for_department: "Acting",
        known_for: [],
      }));

      mockFetchJSON({
        page: 1,
        results: mockPeople,
      });

      const result = await caller.movie.searchMoviePerson({ query: "John" });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/search/person?query=John"),
        expect.any(Object),
      );
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({
        name: "Person 1",
        gender: "Female",
        known_for_department: "Acting",
        known_for: [],
      });
    });
  });

  describe("getMovieDetails", () => {
    it("should return parsed movie details and append credits by default", async () => {
      const mockDetails = {
        id: 1,
        title: "Test Movie",
        overview: "Test overview",
        release_date: "2023-01-01",
        poster_path: "/poster.jpg",
        backdrop_path: "/backdrop.jpg",
        runtime: 120,
        genres: [{ id: 1, name: "Action" }],
        credits: {
          cast: [
            {
              id: 1,
              name: "Actor 1",
              character: "Role 1",
              gender: 1,
              known_for_department: "Acting",
            },
          ],
          crew: [
            {
              id: 2,
              name: "Director 1",
              job: "Director",
              gender: 2,
              known_for_department: "Directing",
            },
          ],
        },
      };

      mockFetchJSON(mockDetails);

      const result = await caller.movie.getMovieDetails({ id: 1 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/movie/1?append_to_response=credits"),
        expect.any(Object),
      );
      // We expect the schema to safely parse and retain the valid structure
      expect(result.id).toBe(1);
      expect(result.title).toBe("Test Movie");
    });

    it("should omit credits if specified", async () => {
      const mockDetails = {
        id: 1,
        title: "Test Movie",
        overview: "Test overview",
        release_date: "2023-01-01",
        poster_path: null,
        runtime: 120,
        genres: [],
      };

      mockFetchJSON(mockDetails);

      await caller.movie.getMovieDetails({ id: 1, credits: false });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.themoviedb.org/3/movie/1", // No query parameters appended
        expect.any(Object),
      );
    });
  });

  describe("getTrendingMovies", () => {
    it("should return up to 5 mapped trending movies", async () => {
      const mockTrending = Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        title: `Trending ${i + 1}`,
        release_date: "2023-10-01",
        poster_path: `/poster.jpg`,
      }));

      mockFetchJSON({
        page: 1,
        results: mockTrending,
      });

      const result = await caller.movie.getTrendingMovies();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/trending/movie/week"),
        expect.any(Object),
      );
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({
        title: "Trending 1",
        release_date: "2023-10-01",
      });
      // getTrendingMovies specifically maps ONLY title and release_date
      expect(result[0]).not.toHaveProperty("id");
    });
  });
});
