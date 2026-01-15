import { validator } from "hono-openapi";
import { z } from "zod";

import { createRouter } from "@/app";
import env from "@/lib/env";
import HttpStatusCodes from "@/lib/http-status-codes";
import { stripe } from "@/lib/stripe";
import { errorResponse, successResponse } from "@/lib/utils";
import { authed } from "@/middleware/authed";
import { validationHook } from "@/middleware/validation-hook";
import { getUserCartWithItems } from "@/queries/cart-queries";
import {
  createOrder,
  createOrderItems,
  getOrderById,
  getUserOrders,
  reserveStock,
} from "@/queries/order-queries";
import { db, eq } from "@repo/db";
import { order } from "@repo/db/schemas/order.schema";

import { createCheckoutDoc, getUserOrderDoc, getUserOrdersDoc } from "./orders.docs";

const orders = createRouter().use(authed);

// Get user's order history
orders.get("/", getUserOrdersDoc, async (c) => {
  const user = c.get("user");

  try {
    const userOrders = await getUserOrders(user.id);

    return c.json(
      successResponse(userOrders, "User orders retrieved successfully"),
      HttpStatusCodes.OK,
    );
  } catch (error) {
    console.error("Error retrieving user orders:", error);
    return c.json(
      errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve orders"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});

// Get user's order details
orders.get(
  "/:id",
  getUserOrderDoc,
  validator("param", z.object({ id: z.uuid() }), validationHook),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");

    try {
      const orderWithItems = await getOrderById(id);

      if (!orderWithItems || orderWithItems.userId !== user.id) {
        return c.json(errorResponse("NOT_FOUND", "Order not found"), HttpStatusCodes.NOT_FOUND);
      }

      return c.json(
        successResponse(orderWithItems, "Order details retrieved successfully"),
        HttpStatusCodes.OK,
      );
    } catch (error) {
      console.error("Error retrieving order details:", error);
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve order details"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

// Create checkout
orders.post("/create-checkout", createCheckoutDoc, async (c) => {
  const user = c.get("user");

  try {
    // Get user's cart with items
    const userCart = await getUserCartWithItems(user.id);

    if (!userCart || userCart.cartItems.length === 0) {
      return c.json(
        errorResponse("INVALID_DATA", "Cart is empty. Add items to cart before creating order."),
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    // Validate cart items and stock availability
    const cartValidationErrors: { code: string; details: string }[] = [];
    let totalAmount = 0;

    for (const cartItem of userCart.cartItems) {
      // Check if product still exists
      if (!cartItem.product) {
        cartValidationErrors.push({
          code: "INVALID_CART_STATE",
          details: `Product with ID "${cartItem.productId}" no longer exists`,
        });
        continue;
      }

      // Check stock availability
      const availableStock = cartItem.product.stockQuantity || 0;
      if (cartItem.quantity > availableStock) {
        cartValidationErrors.push({
          code: "INSUFFICIENT_STOCK",
          details: `Not enough stock for "${cartItem.product.name}". Requested: ${cartItem.quantity}, Available: ${availableStock}`,
        });
        continue;
      }

      // Calculate total
      totalAmount += parseFloat(cartItem.product.price) * cartItem.quantity;
    }

    // Return validation errors if any
    if (cartValidationErrors.length > 0) {
      return c.json(
        errorResponse(cartValidationErrors[0].code, cartValidationErrors[0].details),
        HttpStatusCodes.UNPROCESSABLE_ENTITY,
      );
    }

    // Create order and checkout session in transaction
    const result = await db.transaction(async () => {
      // This will create the order with null stripeCheckoutSessionId.
      // After creating the Stripe session, it will update the order with the actual session ID.
      const newOrder = await createOrder(user.id, user.email, totalAmount.toFixed(2));

      // Create order items with frozen prices
      const orderItemsData = userCart.cartItems.map((cartItem) => ({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        unitPrice: cartItem.product.price,
      }));

      // This will create the order items from the cart items with frozen prices.
      await createOrderItems(newOrder.id, orderItemsData);

      // Reserve stock immediately
      const stockReservationData = userCart.cartItems.map((cartItem) => ({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
      }));

      // This will reserve stock for the order items.
      await reserveStock(stockReservationData);

      // This will create the Stripe Checkout session.
      // Create Stripe Checkout Session
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: userCart.cartItems.map((cartItem) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: cartItem.product.name,
              description: cartItem.product.description || undefined,
              images: cartItem.product.images
                .map((img) => img.url)
                .filter((url): url is string => Boolean(url)),
            },
            unit_amount: Math.round(parseFloat(cartItem.product.price) * 100),
          },
          quantity: cartItem.quantity,
        })),
        mode: "payment",
        // Will still configure the URLs once we have frontend up and running.
        success_url: `${env.WEB_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.WEB_URL}/checkout/cancel`,
        customer_email: user.email,
        client_reference_id: newOrder.id,
        metadata: {
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          userId: user.id,
        },
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "AU", "NG", "GH"],
        },
        billing_address_collection: "required",
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      });

      // Update order with checkout session ID since it was set as null when
      // the order was initially created
      // Update order with Stripe session ID
      await db
        .update(order)
        .set({
          stripeCheckoutSessionId: checkoutSession.id,
        })
        .where(eq(order.id, newOrder.id));

      return {
        order: newOrder,
        checkoutSession,
      };
    });

    // Fetch complete order with relations
    const orderWithItems = await getOrderById(result.order.id);

    if (!orderWithItems) {
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve created order"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    const checkoutResponse = {
      order: orderWithItems,
      checkoutUrl: result.checkoutSession.url,
      checkoutSessionId: result.checkoutSession.id,
      stripePublishableKey: env.STRIPE_PUBLISHABLE_KEY,
    };

    return c.json(
      successResponse(checkoutResponse, "Order created successfully"),
      HttpStatusCodes.OK,
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return c.json(
      errorResponse("INTERNAL_SERVER_ERROR", "Failed to create order"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});

export default orders;
