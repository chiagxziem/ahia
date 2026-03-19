import { redirect } from "next/navigation";

import { CheckoutSuccess } from "./checkout-success";

const CheckoutSuccessPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) => {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  return <CheckoutSuccess sessionId={session_id} />;
};

export default CheckoutSuccessPage;
