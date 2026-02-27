"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

export function Search() {
  return (
    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
      <HugeiconsIcon icon={Search01Icon} className="size-5" />
      <span className="sr-only">Search</span>
    </Button>
  );
}
