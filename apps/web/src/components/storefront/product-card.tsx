import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  category: string;
  slug: string;
  imageUrl?: string;
  tag?: string;
}

export const ProductCard = ({
  id,
  name,
  price,
  category,
  slug: _slug,
  imageUrl,
  tag,
}: ProductCardProps) => {
  return (
    <Link href={`/products/${id}`} className="group block">
      {/* Image */}
      <div className="relative mb-3 aspect-3/4 overflow-hidden rounded-xl bg-muted/30 md:rounded-2xl">
        {tag && (
          <Badge className="pointer-events-none absolute top-3 left-3 z-10 rounded-full border border-border/20 bg-background/80 px-2.5 py-0.5 text-[11px] font-medium text-foreground shadow-xs backdrop-blur-sm hover:bg-background/80">
            {tag}
          </Badge>
        )}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-all duration-500 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:bg-muted/20">
            <div className="size-10 rounded-full bg-muted-foreground/4 md:size-14" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[13px] leading-snug font-medium text-foreground transition-colors group-hover:text-primary md:text-sm">
            {name}
          </span>
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase">
            {category}
          </span>
        </div>
        <span className="shrink-0 pt-0.5 text-[13px] font-semibold tabular-nums md:text-sm">
          ${price}
        </span>
      </div>
    </Link>
  );
};
