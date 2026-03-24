"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { searchProducts } from "@/features/storefront/queries";
import { queryKeys } from "@/lib/query-keys";

export const Search = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 500);

  const {
    data: results = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: queryKeys.searchProducts(debouncedQuery),
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  // Keyboard shortcut: Cmd/Ctrl + K
  useHotkeys("mod+k", () => setOpen((prev) => !prev), {
    preventDefault: true,
  });

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={Search01Icon} className="size-5" />
        <span className="sr-only">Search</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          onAnimationEnd={() => {
            if (open) {
              inputRef.current?.focus();
            }
          }}
          showCloseButton={false}
          className="top-[10%] translate-y-0 sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Search products</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pl-9"
            />
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {isFetching && (
              <div className="flex items-center justify-center py-8">
                <Spinner className="size-5" />
              </div>
            )}

            {!isFetching && isError && debouncedQuery.length > 0 && (
              <p className="py-8 text-center text-sm text-destructive">
                Something went wrong. Please try again.
              </p>
            )}

            {!isFetching &&
              !isError &&
              debouncedQuery.length > 0 &&
              results.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No products found for &ldquo;{debouncedQuery}&rdquo;
                </p>
              )}

            {!isFetching && !isError && results.length > 0 && (
              <ul className="flex flex-col gap-1">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.id}`}
                      onClick={() => handleOpenChange(false)}
                      className="m-1 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                    >
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted/30">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <div className="size-4 rounded-full bg-muted-foreground/10" />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium">
                          {product.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {product.categories?.[0]?.name ?? "Uncategorized"}
                        </span>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        ${product.price}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!isFetching && debouncedQuery.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Start typing to search products...
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
