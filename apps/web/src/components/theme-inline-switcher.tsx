"use client";

import { ComputerIcon, Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "better-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "dark", icon: Moon02Icon, label: "Dark" },
  { value: "light", icon: Sun02Icon, label: "Light" },
  { value: "system", icon: ComputerIcon, label: "System" },
] as const;

export const ThemeInlineSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-full border border-border bg-muted p-1">
        {themeOptions.map(({ value, icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
              theme === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            title={label}
            aria-label={label}
            aria-pressed={theme === value}
          >
            <HugeiconsIcon icon={icon} className="h-3.5 w-3.5" />
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
