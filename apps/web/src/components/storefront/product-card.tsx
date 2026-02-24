import Link from "next/link";

import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  name: string;
  price: string;
  category: string;
  slug: string;
  tag?: string;
}

export function ProductCard({ name, price, category, slug, tag }: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-3/4 bg-muted/30 rounded-xl md:rounded-2xl overflow-hidden mb-3">
        {tag && (
          <Badge className="absolute top-3 left-3 z-10 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/80 pointer-events-none rounded-full px-2.5 py-0.5 shadow-xs font-medium border border-border/20 text-[11px]">
            {tag}
          </Badge>
        )}
        <div className="w-full h-full flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:bg-muted/20">
          <div className="size-10 md:size-14 rounded-full bg-muted-foreground/4" />
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium text-[13px] md:text-sm leading-snug text-foreground group-hover:text-primary transition-colors truncate">
            {name}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
            {category}
          </span>
        </div>
        <span className="font-semibold text-[13px] md:text-sm tabular-nums shrink-0 pt-0.5">
          {price}
        </span>
      </div>
    </Link>
  );
}
