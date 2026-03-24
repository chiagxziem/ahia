"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAdminMonthlyStats,
  type MonthlyStatsEntry,
} from "@/features/admin/queries";
import { queryKeys } from "@/lib/query-keys";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatMonthLabel = (month: string) => {
  const [, m] = month.split("-");
  return MONTH_NAMES[parseInt(m, 10) - 1];
};

const revenueConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const ordersConfig = {
  orders: {
    label: "Orders",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const productsConfig = {
  products: {
    label: "Products",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const usersConfig = {
  users: {
    label: "Users",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];
const EMPTY_DATA: MonthlyStatsEntry[] = [];

const MonthlyBarChart = ({
  data,
  dataKey,
  config,
  valueFormatter,
}: {
  data: MonthlyStatsEntry[];
  dataKey: keyof MonthlyStatsEntry;
  config: ChartConfig;
  valueFormatter?: (value: number) => string;
}) => {
  const yAxisWidth = (() => {
    if (!data.length) return 30;
    const maxValue = Math.max(...data.map((d) => Number(d[dataKey])));
    const formatted = valueFormatter
      ? valueFormatter(maxValue)
      : String(Math.round(maxValue));
    return Math.max(30, formatted.length * 7 + 10);
  })();

  return (
    <ChartContainer config={config} className="max-h-[50svh] min-h-75 w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={formatMonthLabel}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
          width={yAxisWidth}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={formatMonthLabel}
              formatter={
                valueFormatter
                  ? (value) => valueFormatter(value as number)
                  : undefined
              }
            />
          }
        />
        <Bar
          dataKey={dataKey as string}
          fill={`var(--color-${dataKey as string})`}
          radius={BAR_RADIUS}
        />
      </BarChart>
    </ChartContainer>
  );
};

const formatCompactCurrency = (value: number) => {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value}`;
};

export const OverviewCharts = () => {
  const { data: monthlyStats, isLoading } = useQuery({
    queryKey: queryKeys.adminMonthlyStats(),
    queryFn: () => getAdminMonthlyStats(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Spinner className="size-6" />
        </CardContent>
      </Card>
    );
  }

  const data = monthlyStats ?? EMPTY_DATA;

  return (
    <Card>
      <Tabs defaultValue="revenue">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-start gap-1">
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>
                Performance metrics over the last 12 months
              </CardDescription>
            </div>
            <TabsList className={"w-full md:w-auto"}>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value="revenue">
            <MonthlyBarChart
              data={data}
              dataKey="revenue"
              config={revenueConfig}
              valueFormatter={formatCompactCurrency}
            />
          </TabsContent>
          <TabsContent value="orders">
            <MonthlyBarChart
              data={data}
              dataKey="orders"
              config={ordersConfig}
            />
          </TabsContent>
          <TabsContent value="products">
            <MonthlyBarChart
              data={data}
              dataKey="products"
              config={productsConfig}
            />
          </TabsContent>
          <TabsContent value="users">
            <MonthlyBarChart data={data} dataKey="users" config={usersConfig} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};
