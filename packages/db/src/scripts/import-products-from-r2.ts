import fs from "node:fs/promises";
import path from "node:path";

import { db } from "../index";
import { category, product, productCategory } from "../schemas/product.schema";

type Options = {
  file: string;
  dryRun: boolean;
  skipExisting: boolean;
  precheckR2: boolean;
  precheckOnly: boolean;
  createdBy?: string;
  createdByEmail?: string;
};

type NameInStock = {
  name: string;
  inStock: boolean;
};

type InputImage = string | { key: string; url?: string };

type ProductInput = {
  name: string;
  description?: string;
  price: number | string;
  stockQuantity?: number;
  slug?: string;
  sizes?: NameInStock[];
  colors?: NameInStock[];
  categoryNames?: string[];
  imageKeys?: string[];
  images?: InputImage[];
  createdBy?: string;
  createdByEmail?: string;
};

type Manifest = {
  products: ProductInput[];
};

const usage = `
Usage:
  bun run src/scripts/import-products-from-r2.ts --file <manifest.json> [options]

Options:
  --dry-run                  Validate and print what would be created without writing
  --skip-existing            Skip products that already exist by name (default: true)
  --no-skip-existing         Do not skip duplicates by name
  --precheck-r2              Verify every image URL/key exists in public R2 before import
  --precheck-only            Run only the R2 precheck and exit (no DB reads/writes)
  --created-by <userId>      Default creator user id for imported products
  --created-by-email <email> Default creator email (resolved to user id)

Manifest format:
{
  "products": [
    {
      "name": "Aso-Oke Tote",
      "description": "Handwoven tote",
      "price": "59.99",
      "stockQuantity": 12,
      "categoryNames": ["Bags", "Handmade"],
      "sizes": [{ "name": "One Size", "inStock": true }],
      "colors": [{ "name": "Blue", "inStock": true }],
      "imageKeys": [
        "products/1b7f8f56-7db2-4e8f-a427-ef8f9123a9d9.webp",
        "products/c339e6d3-3b85-4967-8a43-a3619f318e13.webp"
      ]
    }
  ]
}
`;

const parseArgs = (argv: string[]): Options => {
  const options: Options = {
    file: "",
    dryRun: false,
    skipExisting: true,
    precheckR2: false,
    precheckOnly: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--file") {
      options.file = argv[i + 1] ?? "";
      i++;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--skip-existing") {
      options.skipExisting = true;
      continue;
    }

    if (arg === "--no-skip-existing") {
      options.skipExisting = false;
      continue;
    }

    if (arg === "--created-by") {
      options.createdBy = argv[i + 1] ?? "";
      i++;
      continue;
    }

    if (arg === "--precheck-r2") {
      options.precheckR2 = true;
      continue;
    }

    if (arg === "--precheck-only") {
      options.precheckR2 = true;
      options.precheckOnly = true;
      continue;
    }

    if (arg === "--created-by-email") {
      options.createdByEmail = argv[i + 1] ?? "";
      i++;
      continue;
    }
  }

  if (!options.file) {
    throw new Error(`Missing --file argument.\n${usage}`);
  }

  return options;
};

const slugifyName = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const normalizeImageKey = (key: string) => {
  return key.replace(/^\/+/, "");
};

const getR2PublicBaseUrl = () => {
  const value = process.env.CLOUDFLARE_R2_PUBLIC_URL?.trim();
  if (!value) {
    throw new Error(
      "CLOUDFLARE_R2_PUBLIC_URL is required to resolve public image URLs.",
    );
  }

  return value.replace(/\/$/, "");
};

const keyToPublicUrl = (key: string) => {
  const base = getR2PublicBaseUrl();
  return `${base}/${normalizeImageKey(key)}`;
};

const resolveCreatorId = async (
  input: ProductInput,
  options: Options,
): Promise<string> => {
  const directCreator = input.createdBy ?? options.createdBy;
  if (directCreator) return directCreator;

  const creatorEmail = input.createdByEmail ?? options.createdByEmail;
  if (!creatorEmail) {
    throw new Error(
      `No creator provided for product "${input.name}". Use --created-by, --created-by-email, or item-level createdBy/createdByEmail.`,
    );
  }

  const creator = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.email, creatorEmail),
    columns: { id: true },
  });

  if (!creator) {
    throw new Error(
      `Could not find user with email "${creatorEmail}" for product "${input.name}".`,
    );
  }

  return creator.id;
};

const getUniqueSlug = async (
  baseSlug: string,
  table: "product" | "category",
): Promise<string> => {
  const sanitized = baseSlug || "item";

  if (table === "product") {
    const existing = await db.query.product.findMany({
      where: (p, { or, eq, like }) =>
        or(eq(p.slug, sanitized), like(p.slug, `${sanitized}-%`)),
      columns: { slug: true },
    });

    if (existing.length === 0) return sanitized;

    const slugSet = new Set(existing.map((x) => x.slug));
    let counter = 1;
    while (slugSet.has(`${sanitized}-${counter}`)) counter++;
    return `${sanitized}-${counter}`;
  }

  const existing = await db.query.category.findMany({
    where: (c, { or, eq, like }) =>
      or(eq(c.slug, sanitized), like(c.slug, `${sanitized}-%`)),
    columns: { slug: true },
  });

  if (existing.length === 0) return sanitized;

  const slugSet = new Set(existing.map((x) => x.slug));
  let counter = 1;
  while (slugSet.has(`${sanitized}-${counter}`)) counter++;
  return `${sanitized}-${counter}`;
};

const ensureCategories = async (categoryNames: string[], dryRun: boolean) => {
  const categoryIds = await categoryNames.reduce<Promise<string[]>>(
    async (accPromise, rawName) => {
      const acc = await accPromise;
      const name = rawName.trim();
      if (!name) return acc;

      const existing = await db.query.category.findFirst({
        where: (c, { eq }) => eq(c.name, name),
        columns: { id: true, name: true },
      });

      if (existing) {
        acc.push(existing.id);
        return acc;
      }

      const slug = await getUniqueSlug(slugifyName(name), "category");

      if (dryRun) {
        console.log(`  - would create category: ${name} (${slug})`);
        return acc;
      }

      const created = (
        await db.insert(category).values({ name, slug }).returning()
      )[0];

      if (!created) {
        throw new Error(`Failed to create category: ${name}`);
      }

      acc.push(created.id);
      return acc;
    },
    Promise.resolve([]),
  );

  return categoryIds;
};

const parseManifest = async (filePath: string): Promise<Manifest> => {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const contents = await fs.readFile(absolutePath, "utf8");
  const parsed = JSON.parse(contents) as Manifest;

  if (!parsed || !Array.isArray(parsed.products)) {
    throw new Error("Manifest must be an object with a products array.");
  }

  return parsed;
};

const toPriceString = (price: number | string, name: string) => {
  const value = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid price for product "${name}": ${String(price)}`);
  }
  return value.toFixed(2);
};

const resolveImages = (item: ProductInput) => {
  const fromImageKeys = (item.imageKeys ?? []).map((k) => ({
    key: normalizeImageKey(k),
    url: keyToPublicUrl(k),
  }));

  const fromImages = (item.images ?? []).map((entry) => {
    if (typeof entry === "string") {
      return {
        key: normalizeImageKey(entry),
        url: keyToPublicUrl(entry),
      };
    }

    return {
      key: normalizeImageKey(entry.key),
      url: entry.url ?? keyToPublicUrl(entry.key),
    };
  });

  const dedup = new Map<string, { key: string; url: string }>();
  for (const image of [...fromImageKeys, ...fromImages]) {
    if (!image.key) continue;
    dedup.set(image.key, image);
  }

  return [...dedup.values()];
};

const checkPublicImageExists = async (url: string) => {
  const headResponse = await fetch(url, { method: "HEAD" });
  if (headResponse.ok) return true;

  // Some public object stores disallow HEAD; lightweight fallback check.
  if (
    headResponse.status === 405 ||
    headResponse.status === 403 ||
    headResponse.status === 400
  ) {
    const getResponse = await fetch(url, {
      method: "GET",
      headers: {
        range: "bytes=0-0",
      },
    });

    if (getResponse.ok || getResponse.status === 206) return true;
  }

  return false;
};

const precheckR2Images = async (manifest: Manifest) => {
  const itemsToCheck: Array<{ productName: string; key: string; url: string }> =
    [];

  for (const productInput of manifest.products) {
    const name = productInput.name?.trim() || "(unnamed product)";
    const images = resolveImages(productInput);

    for (const image of images) {
      itemsToCheck.push({ productName: name, key: image.key, url: image.url });
    }
  }

  const uniqueByKey = new Map<
    string,
    { productName: string; key: string; url: string }
  >();
  for (const item of itemsToCheck) {
    if (!uniqueByKey.has(item.key)) uniqueByKey.set(item.key, item);
  }

  const checks = [...uniqueByKey.values()];
  console.log(`R2 precheck: validating ${checks.length} unique image keys...`);

  const checkResults = await Promise.all(
    checks.map(async (check) => {
      const exists = await checkPublicImageExists(check.url);
      return {
        productName: check.productName,
        key: check.key,
        url: check.url,
        exists,
      };
    }),
  );

  const missing = checkResults.filter((result) => !result.exists);

  for (const item of missing) {
    console.log(`  x missing: ${item.key} (${item.productName})`);
  }

  if (missing.length > 0) {
    const preview = missing
      .slice(0, 10)
      .map((m) => `- ${m.key} (${m.productName})`)
      .join("\n");

    throw new Error(
      `R2 precheck failed: ${missing.length} missing/unreachable image(s).\n${preview}${
        missing.length > 10 ? "\n..." : ""
      }`,
    );
  }

  console.log("R2 precheck passed: all referenced images are reachable.");
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));
  const manifest = await parseManifest(options.file);

  if (options.precheckR2) {
    await precheckR2Images(manifest);

    if (options.precheckOnly) {
      console.log("Precheck only mode enabled. Exiting without DB import.");
      return;
    }
  }

  console.log(
    `Import started: ${manifest.products.length} products (${options.dryRun ? "dry-run" : "write"} mode)`,
  );

  let inserted = 0;
  let skipped = 0;

  await manifest.products.reduce<Promise<void>>(async (prev, item) => {
    await prev;

    const name = item.name?.trim();
    if (!name) {
      console.log("- skipped unnamed product");
      skipped++;
      return;
    }

    const price = toPriceString(item.price, name);
    const stockQuantity = item.stockQuantity ?? 0;
    const sizes = item.sizes ?? [];
    const colors = item.colors ?? [];
    const images = resolveImages(item);

    if (images.length < 1 || images.length > 3) {
      throw new Error(
        `Product "${name}" must have 1-3 images. Received ${images.length}.`,
      );
    }

    const existing = await db.query.product.findFirst({
      where: (p, { eq }) => eq(p.name, name),
      columns: { id: true, name: true },
    });

    if (existing && options.skipExisting) {
      console.log(`- skipped existing product: ${name}`);
      skipped++;
      return;
    }

    const creatorId = await resolveCreatorId(item, options);
    const baseSlug = slugifyName(item.slug ?? name);
    const slug = await getUniqueSlug(baseSlug, "product");

    if (options.dryRun) {
      console.log(`- would import: ${name}`);
      console.log(`  slug: ${slug}`);
      console.log(`  images: ${images.length}`);
      await ensureCategories(item.categoryNames ?? [], true);
      inserted++;
      return;
    }

    const categoryIds = await ensureCategories(item.categoryNames ?? [], false);

    const newProduct = (
      await db
        .insert(product)
        .values({
          name,
          description: item.description?.trim(),
          slug,
          price,
          stockQuantity,
          sizes,
          colors,
          images,
          createdBy: creatorId,
        })
        .returning({ id: product.id, name: product.name })
    )[0];

    if (!newProduct) {
      throw new Error(`Failed to create product: ${name}`);
    }

    if (categoryIds.length > 0) {
      await db.insert(productCategory).values(
        categoryIds.map((categoryId) => ({
          productId: newProduct.id,
          categoryId,
        })),
      );
    }

    console.log(`- imported: ${newProduct.name}`);
    inserted++;
  }, Promise.resolve());

  console.log(`Import complete. Inserted: ${inserted}, skipped: ${skipped}`);
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Import failed");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
