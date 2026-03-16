"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import MovieInfo from "~/components/movie-info";
import MovieSearchInput from "~/components/movie-search-input";
import { Button } from "~/components/ui/button";
import {
  DialogClose,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { type MoviePrice, type Movie, moviePriceSchema } from "~/lib/types";
import { api } from "~/trpc/react";

function UpsertMoviePriceDialog({
  children,
  moviePrice,
  initialMovieTitle,
}: {
  children?: React.ReactNode;
  moviePrice?: MoviePrice;
  initialMovieTitle?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const router = useRouter();
  const util = api.useUtils();
  const { mutate, isPending } = api.pricing.upsert.useMutation({
    onSuccess: () => {
      void util.pricing.getAll.invalidate();
      router.refresh();
      toast.success(`Price ${moviePrice ? "updated" : "added"} successfully!`);
      setIsOpen(false);
      form.reset();
      setSelectedMovie(null);
    },
    onError: () => {
      toast.error(
        `Failed to ${moviePrice ? "update" : "add"} price. Please try again.`,
      );
    },
  });

  const form = useForm({
    defaultValues: {
      movieId: moviePrice?.movieId,
      price: moviePrice?.price ?? 0,
    },
    validators: {
      onSubmit: moviePriceSchema,
    },
    onSubmit: ({ value }) => {
      mutate({
        movieId: value.movieId ?? -1,
        price: value.price,
      });
    },
  });
  function handleOpenChange(isOpen: boolean) {
    if (isPending) return; // Prevent closing while mutation is in progress
    if (!isOpen) {
      form.reset();
      setSelectedMovie(null);
    }
    setIsOpen(isOpen);
  }
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {moviePrice ? "Edit Price" : "Add New Price"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="prices-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <form.Field
              name="movieId"
              validators={{
                onChange: moviePriceSchema.shape.movieId,
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Movie</FieldLabel>
                    {moviePrice ? (
                      <Input
                        disabled
                        value={
                          moviePrice.movieId === 0
                            ? "DEFAULT_PRICE"
                            : (initialMovieTitle ??
                              `Movie ID: ${moviePrice.movieId}`)
                        }
                      />
                    ) : (
                      <>
                        <MovieSearchInput
                          onSelect={(movie) => {
                            field.handleChange(movie.id);
                            setSelectedMovie(movie);
                          }}
                        />
                        {field.state.value !== -1 && selectedMovie && (
                          <div className="rounded-md border p-3">
                            <MovieInfo
                              title={selectedMovie.title}
                              release_date={selectedMovie.release_date}
                              poster_path={selectedMovie.poster_path}
                              size="sm"
                            />
                          </div>
                        )}
                      </>
                    )}
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="price"
              validators={{
                onChange: moviePriceSchema.shape.price,
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Price (€)</FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      step="0.1"
                      min="0"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(parseFloat(e.target.value))
                      }
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>
        <Field orientation="horizontal">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="prices-form" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : moviePrice ? (
              "Update Price"
            ) : (
              "Add Price"
            )}
          </Button>
        </Field>
      </DialogContent>
    </Dialog>
  );
}

export default UpsertMoviePriceDialog;
