import { api } from "~/trpc/server";
import { TopMoviesChart } from "./top-movies-chart";

async function TopMovies() {
  const invoices = await api.invoice.getAll();
  // Compute top movies from invoices
  const movieCounts = new Map<number, number>();
  invoices.forEach((invoice) => {
    invoice.items.forEach((item) => {
      movieCounts.set(
        item.movieId,
        (movieCounts.get(item.movieId) ?? 0) + item.quantity,
      );
    });
  });

  const sortedMovies = Array.from(movieCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topMoviesData = await Promise.all(
    sortedMovies.map(async ([movieId, count]) => {
      try {
        const movie = await api.movie.getMovieDetails({
          id: movieId,
          credits: false,
        });
        return {
          title:
            movie.title +
            (movie.release_date
              ? ` (${new Date(movie.release_date).getFullYear()})`
              : ""),
          count,
        };
      } catch {
        return { title: `Movie ID: ${movieId}`, count };
      }
    }),
  );
  return <TopMoviesChart data={topMoviesData} />;
}

export default TopMovies;
