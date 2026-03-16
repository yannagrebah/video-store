"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";

function ConfirmDeleteDialog({
  movieId,
  movieTitle,
}: {
  movieId: number;
  movieTitle: string;
}) {
  const util = api.useUtils();
  const { mutate, isPending } = api.pricing.delete.useMutation({
    onSuccess: () => {
      void util.pricing.getAll.invalidate();
      router.refresh();
      setIsOpen(false);
    },
  });
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  function handleDelete() {
    mutate({ movieId });
  }
  function handleOpenChange(open: boolean) {
    if (isPending) return; // Prevent closing while mutation is in progress
    setIsOpen(open);
  }
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete the price for{" "}
          <span className="font-medium">{movieTitle}</span>?
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span className="ml-2">Deleting...</span>
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;
