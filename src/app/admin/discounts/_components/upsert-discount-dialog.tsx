"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";

import MovieSearchInput from "~/components/movie-search-input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
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
import { discountSchema, type Movie } from "~/lib/types";
import { api } from "~/trpc/react";
import type schema from "~/lib/db/schema/d1";

type Discount = typeof schema.discounts.$inferSelect;

function UpsertDiscountDialog({
  children,
  discount,
}: {
  children?: React.ReactNode;
  discount?: Discount;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftBundle, setDraftBundle] = useState<number[]>([]);
  const [draftBundleTitles, setDraftBundleTitles] = useState<
    Record<number, string>
  >({});

  const router = useRouter();
  const util = api.useUtils();

  const handleSuccess = () => {
    void util.discount.getAll.invalidate();
    router.refresh();
    setIsOpen(false);
    form.reset();
    setDraftBundle([]);
  };

  const createMutation = api.discount.create.useMutation({
    onSuccess: handleSuccess,
  });

  const updateMutation = api.discount.update.useMutation({
    onSuccess: handleSuccess,
  });

  const isPending = useMemo(
    () => createMutation.isPending || updateMutation.isPending,
    [createMutation.isPending, updateMutation.isPending],
  );

  const form = useForm({
    defaultValues: {
      id: discount?.id ?? -1,
      label: discount?.label ?? "",
      discountRate: discount?.discountRate ?? 0,
      movieBundles: discount?.movieBundles ?? [],
    },
    validators: {
      onSubmit: discountSchema,
    },
    onSubmit: ({ value }) => {
      if (discount) {
        updateMutation.mutate({
          id: discount.id,
          label: value.label,
          discountRate: value.discountRate,
          movieBundles: value.movieBundles,
        });
      } else {
        createMutation.mutate({
          label: value.label,
          discountRate: value.discountRate,
          movieBundles: value.movieBundles,
        });
      }
    },
  });

  function handleOpenChange(open: boolean) {
    if (isPending) return;
    if (!open) {
      form.reset();
      setDraftBundle([]);
    }
    setIsOpen(open);
  }

  const addMovieToDraft = (movie: Movie) => {
    if (!draftBundle.includes(movie.id)) {
      setDraftBundle([...draftBundle, movie.id]);
      setDraftBundleTitles((prev) => ({ ...prev, [movie.id]: movie.title }));
    }
  };

  const removeMovieFromDraft = (movieId: number) => {
    setDraftBundle(draftBundle.filter((id) => id !== movieId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {discount ? "Edit Discount" : "Add New Discount"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="discounts-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-6"
        >
          <FieldGroup className="grid grid-cols-2 gap-4">
            <form.Field
              name="label"
              validators={{
                onChange: z.string().min(1, "Label is required"),
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Label</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Summer Sale"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="discountRate"
              validators={{
                onChange: z
                  .number()
                  .min(0, "Must be >= 0")
                  .max(1, "Must be <= 1"),
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Discount Rate (%)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={Math.round(field.state.value * 100)}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(parseFloat(e.target.value) / 100)
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

          <FieldGroup>
            <form.Field name="movieBundles">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Movie Bundles</FieldLabel>

                    {/* Existing Bundles List */}
                    <div className="space-y-2">
                      {field.state.value.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">
                          No bundles added yet.
                        </p>
                      ) : (
                        field.state.value.map((bundle, index) => (
                          <div
                            key={index}
                            className="bg-muted flex items-center justify-between rounded-md p-2 text-sm"
                          >
                            <div className="flex flex-wrap gap-1">
                              {bundle.map((id) => (
                                <Badge key={id} variant="outline">
                                  ID: {id}
                                </Badge>
                              ))}
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const newBundles = [...field.state.value];
                                newBundles.splice(index, 1);
                                field.handleChange(newBundles);
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bundle Builder */}
                    <div className="space-y-4 rounded-md border p-4">
                      <h4 className="text-sm font-medium">Build New Bundle</h4>
                      <MovieSearchInput onSelect={addMovieToDraft} />

                      {draftBundle.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {draftBundle.map((id) => (
                              <Badge
                                key={id}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {draftBundleTitles[id] ?? `ID: ${id}`}
                                <button
                                  type="button"
                                  onClick={() => removeMovieFromDraft(id)}
                                  className="text-muted-foreground hover:text-foreground ml-1"
                                >
                                  <X className="size-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              field.handleChange([
                                ...field.state.value,
                                [...draftBundle],
                              ]);
                              setDraftBundle([]);
                            }}
                          >
                            Add Bundle to Discount
                          </Button>
                        </div>
                      )}
                    </div>
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
          <Button type="submit" form="discounts-form" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : discount ? (
              "Update Discount"
            ) : (
              "Add Discount"
            )}
          </Button>
        </Field>
      </DialogContent>
    </Dialog>
  );
}

export default UpsertDiscountDialog;
