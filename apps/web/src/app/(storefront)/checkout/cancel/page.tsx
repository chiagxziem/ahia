import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const CheckoutCancelPage = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <HugeiconsIcon icon={Cancel01Icon} className="size-8 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Checkout cancelled</h1>
        <p className="text-sm text-muted-foreground">
          Your payment was not processed and you have not been charged. Your cart items are still
          saved — you can continue shopping whenever you&apos;re ready.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/shop" />}
          >
            Continue Shopping
          </Button>
          <Button className="rounded-full" nativeButton={false} render={<Link href="/" />}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancelPage;
