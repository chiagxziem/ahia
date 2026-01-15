import { createApp } from "@/app";
import { createSuperadmin } from "@/queries/admin-queries";
import admin from "@/routes/admin/admin.route";
import cart from "@/routes/cart/cart.route";
import categories from "@/routes/categories/categories.route";
import orders from "@/routes/orders/orders.route";
import products from "@/routes/products/products.route";
import stripeWebhook from "@/routes/stripe/stripe.route";
import superadmin from "@/routes/superadmin/superadmin.route";
import user from "@/routes/user/user.route";

import env from "./lib/env";

const app = createApp();

// Register routers
app
  .route("/categories", categories)
  .route("/products", products)
  .route("/orders", orders)
  .route("/cart", cart)
  .route("/stripe-webhook", stripeWebhook)
  .route("/admin", admin)
  .route("/superadmin", superadmin)
  .route("/user", user);

// Create superadmin if not exists
if (env.NODE_ENV !== "test") {
  createSuperadmin()
    .then(() => console.log("Superadmin check completed"))
    .catch((err) => {
      console.error("Failed to check/create superadmin:", err);
    });
}

export default {
  port: 8000,
  fetch: app.fetch,
};
