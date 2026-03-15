"use client";

import { Button } from "~/components/ui/button";
import MovieOrder from "./movie-order";
import { useAtom } from "jotai";
import { cartAtom } from "~/lib/atoms";
import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const Cart = () => {
  const [cartItems, setCartItems] = useAtom(cartAtom);
  const { mutateAsync, isPending } = api.invoice.create.useMutation({
    onSuccess: () => {
      setCartItems([]);
    },
  });
  const router = useRouter();

  async function handleConfirm() {
    const results = await mutateAsync({ items: cartItems });
    if (!results) {
      alert(
        "An error occurred while processing your purchase. Please try again.",
      );
      return;
    }
    router.push(`/?purchaseSuccess=${results.id}`);
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
