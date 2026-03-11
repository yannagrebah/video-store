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
    <section className="container space-y-2">
      <MovieOrder />
      <Button
        onClick={handleConfirm}
        disabled={cartItems.length === 0}
        className="w-full"
      >
        Confirm Purchase
      </Button>
    </section>
  );
};

export default Cart;
