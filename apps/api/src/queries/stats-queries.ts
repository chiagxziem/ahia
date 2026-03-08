import { pctChange, round, toNumber } from "@/lib/utils";
import { and, count, countDistinct, db, eq, gte, lt, sql } from "@repo/db";
import { session, user } from "@repo/db/schemas/auth.schema";
import { order } from "@repo/db/schemas/order.schema";
import { product } from "@repo/db/schemas/product.schema";

type WindowKey = "24h" | "7d" | "1m";

type Window = {
  key: WindowKey;
  ms: number;
};

type WindowBoundaries = {
  currentStart: Date;
  previousStart: Date;
};

const WINDOWS: Window[] = [
  { key: "24h", ms: 24 * 60 * 60 * 1000 },
  { key: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
  { key: "1m", ms: 30 * 24 * 60 * 60 * 1000 },
];

const getWindowBoundaries = (now: Date, durationMs: number): WindowBoundaries => ({
  currentStart: new Date(now.getTime() - durationMs),
  previousStart: new Date(now.getTime() - 2 * durationMs),
});

/**
 * Gets the total paid revenue between two dates.
 */
const getPaidRevenueBetween = async (start: Date, end: Date) => {
  const [result] = await db
    .select({
      amount: sql<string>`COALESCE(SUM(${order.totalAmount}), 0)`,
    })
    .from(order)
    .where(
      and(eq(order.paymentStatus, "paid"), gte(order.createdAt, start), lt(order.createdAt, end)),
    );

  return round(toNumber(result?.amount));
};

/**
 * Gets the count of orders created between two dates
 */
const getOrdersCountBetween = async (start: Date, end: Date) => {
  const [result] = await db
    .select({ total: count() })
    .from(order)
    .where(and(gte(order.createdAt, start), lt(order.createdAt, end)));

  return toNumber(result?.total);
};

/**
 * Gets the count of products created between two dates
 */
const getProductsCreatedBetween = async (start: Date, end: Date) => {
  const [result] = await db
    .select({ total: count() })
    .from(product)
    .where(and(gte(product.createdAt, start), lt(product.createdAt, end)));

  return toNumber(result?.total);
};

/**
 * Gets the count of active users between two dates
 */
const getActiveUsersBetween = async (start: Date, end: Date) => {
  const [result] = await db
    .select({ total: countDistinct(session.userId) })
    .from(session)
    .where(and(gte(session.createdAt, start), lt(session.createdAt, end)));

  return toNumber(result?.total);
};

/**
 * Gets the total number of products in the system
 */
const getProductsTotal = async () => {
  const [result] = await db.select({ total: count() }).from(product);
  return toNumber(result?.total);
};

/** Gets the total number of users in the system */
const getUsersTotal = async () => {
  const [result] = await db.select({ total: count() }).from(user);
  return toNumber(result?.total);
};

/**
 * Get overview stats for admin dashboard, including revenue, orders, products, and active users with percentage change compared to the previous period.
 * The periods are 24 hours, 7 days, and 1 month.
 */
export const getAdminOverviewStats = async () => {
  const now = new Date();

  const revenueValue: Record<WindowKey, number> = {
    "24h": 0,
    "7d": 0,
    "1m": 0,
  };
  const revenueChangePct: Record<WindowKey, number> = {
    "24h": 0,
    "7d": 0,
    "1m": 0,
  };

  const ordersValue: Record<WindowKey, number> = {
    "24h": 0,
    "7d": 0,
    "1m": 0,
  };
  const ordersChangePct: Record<WindowKey, number> = {
    "24h": 0,
    "7d": 0,
    "1m": 0,
  };

  const productsChangePct: Record<WindowKey, number> = {
    "24h": 0,
    "7d": 0,
    "1m": 0,
  };

  const usersChange: Record<WindowKey, number> = {
    "24h": 0,
    "7d": 0,
    "1m": 0,
  };

  const windowResults = await Promise.all(
    WINDOWS.map(async (window) => {
      const { currentStart, previousStart } = getWindowBoundaries(now, window.ms);

      const [
        currentRevenue,
        previousRevenue,
        currentOrders,
        previousOrders,
        currentProductsCreated,
        previousProductsCreated,
        currentActiveUsers,
        previousActiveUsers,
      ] = await Promise.all([
        getPaidRevenueBetween(currentStart, now),
        getPaidRevenueBetween(previousStart, currentStart),
        getOrdersCountBetween(currentStart, now),
        getOrdersCountBetween(previousStart, currentStart),
        getProductsCreatedBetween(currentStart, now),
        getProductsCreatedBetween(previousStart, currentStart),
        getActiveUsersBetween(currentStart, now),
        getActiveUsersBetween(previousStart, currentStart),
      ]);

      return {
        key: window.key,
        revenue: {
          value: currentRevenue,
          changePct: pctChange(currentRevenue, previousRevenue),
        },
        orders: {
          value: currentOrders,
          changePct: pctChange(currentOrders, previousOrders),
        },
        products: {
          changePct: pctChange(currentProductsCreated, previousProductsCreated),
        },
        users: {
          change: currentActiveUsers - previousActiveUsers,
        },
      };
    }),
  );

  for (const result of windowResults) {
    revenueValue[result.key] = result.revenue.value;
    revenueChangePct[result.key] = result.revenue.changePct;
    ordersValue[result.key] = result.orders.value;
    ordersChangePct[result.key] = result.orders.changePct;
    productsChangePct[result.key] = result.products.changePct;
    usersChange[result.key] = result.users.change;
  }

  const [productsTotal, usersTotal] = await Promise.all([getProductsTotal(), getUsersTotal()]);

  return {
    revenue: {
      value: revenueValue,
      changePct: revenueChangePct,
    },
    orders: {
      value: ordersValue,
      changePct: ordersChangePct,
    },
    products: {
      value: {
        total: productsTotal,
      },
      changePct: productsChangePct,
    },
    users: {
      value: {
        total: usersTotal,
      },
      change: usersChange,
    },
  };
};
