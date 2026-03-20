import { Resend } from "resend";

import { buildOrderReceiptHtml } from "@/emails/order-receipt";
import env from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);
const from = `Ahia <ahia@${env.RESEND_DOMAIN}>`;

interface OrderItem {
  product: {
    name: string;
    images: { url: string; key: string }[];
  };
  quantity: number;
  unitPrice: string;
  subTotal: string;
}

interface OrderForReceipt {
  orderNumber: string;
  email: string;
  totalAmount: string;
  paymentMethod: string | null;
  createdAt: Date | string | null;
  orderItems: OrderItem[];
}

export const sendOrderReceiptEmail = async (
  order: OrderForReceipt,
  customerName?: string,
) => {
  const orderDate =
    order.createdAt instanceof Date
      ? order.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

  const items = order.orderItems.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subTotal: item.subTotal,
    imageUrl: item.product.images[0]?.url,
  }));

  const html = buildOrderReceiptHtml({
    customerName: customerName ?? "Customer",
    orderNumber: order.orderNumber,
    orderDate,
    paymentMethod: order.paymentMethod ?? "card",
    items,
    totalAmount: order.totalAmount,
  });

  const { error } = await resend.emails.send({
    from,
    to: order.email,
    subject: `Order Confirmation — ${order.orderNumber}`,
    html,
  });

  if (error) {
    console.error(
      `[Email] Failed to send receipt for ${order.orderNumber}:`,
      error,
    );
    throw error;
  }

  console.log(
    `[Email] Receipt sent for ${order.orderNumber} to ${order.email}`,
  );
};
