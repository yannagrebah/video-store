"use client";

import { useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { cartAtom } from "~/lib/atoms";
import { api } from "~/trpc/react";
import MovieOrder from "./movie-order";

const Cart = () => {
  const [cartItems, setCartItems] = useAtom(cartAtom);
  const router = useRouter();

  const { mutate, isPending } = api.invoice.create.useMutation({
    onSuccess: (results) => {
      if (!results?.id) {
        toast.error(
          "An error occurred while processing your purchase. Please try again.",
        );
        return;
      }
      router.push(`/?purchaseSuccess=${results.id}`);
      setCartItems([]);
    },
    onError: () => {
      toast.error(
        "An error occurred while processing your purchase. Please try again.",
      );
    },
  });
  async function handleConfirm() {
    if (cartItems.length === 0) return;
    mutate({ items: cartItems });
  }
  return (
    <>
      <MovieOrder />
      <div className="text-right">
        <Button
          onClick={handleConfirm}
          disabled={cartItems.length === 0 || isPending}
          className="h-12 w-full text-2xl font-bold md:w-1/3"
          size={"lg"}
        >
          {isPending && <Loader2 className="mr-2 animate-spin" size={24} />}
          {isPending ? "Processing..." : "Confirm Purchase"}
        </Button>
      </div>
    </>
  );
};

export default Cart;
