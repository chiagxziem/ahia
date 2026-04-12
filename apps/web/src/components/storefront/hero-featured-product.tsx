"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

import { getFeaturedProduct } from "@/features/storefront/queries";
import { queryKeys } from "@/lib/query-keys";

export const HeroFeaturedProduct = () => {
  const { data: product } = useQuery({
    queryKey: queryKeys.featuredProduct(),
    queryFn: () => getFeaturedProduct(),
  });

  const image = product?.images?.[0]?.url;

  return (
    <div className="relative mt-4 w-full lg:mt-0 lg:w-1/2">
      <Link
        href={product ? `/products/${product.id}` : "/shop"}
        className="group relative block aspect-square overflow-hidden rounded-3xl bg-muted/50 sm:aspect-video lg:aspect-4/3"
      >
        {image ? (
          <Image
            src={image}
            alt={product?.name ?? "Featured Product"}
            fill
            loading="eager"
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-tr from-muted/60 via-transparent to-background/10 transition-transform duration-1000 ease-out group-hover:scale-105" />
        )}
        {product && (
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-5 md:p-6">
            <span className="text-[11px] font-medium tracking-wider text-white/70 uppercase">
              Featured
            </span>
            <p className="mt-1 text-base font-semibold text-white md:text-lg">
              {product.name}
            </p>
            <p className="mt-0.5 text-sm font-medium text-white/80">
              ${product.price}
            </p>
          </div>
        )}
        {!product && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground/30 uppercase">
              Featured Product
            </span>
          </div>
        )}
      </Link>
    </div>
  );
};
