"use client";

import { Button } from "~/components/ui/button";
import MovieOrder from "./movie-order";
import PurchaseSuccess from "./purchase-success";
import { useState } from "react";
import { useAtom } from "jotai";
import { cartAtom } from "~/lib/atoms";

const Cart = () => {
  const [cartItems] = useAtom(cartAtom);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <section className="container space-y-2">
        <PurchaseSuccess />
      </section>
    );
  }

  return (
    <>
      <MovieOrder />
      <Button
        onClick={handleConfirm}
        disabled={cartItems.length === 0}
        className="ml-auto block h-12 w-full text-2xl font-bold md:w-1/3"
        size={"lg"}
      >
        Confirm Purchase
      </Button>
    </>
  );
};

export default Cart;
