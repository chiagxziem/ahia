"use client";

import { ComputerIcon, Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "better-themes";
import { useEffect, useState } from "react";

import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

const themeOptions = [
  { value: "light", icon: Sun02Icon, label: "Light" },
  { value: "dark", icon: Moon02Icon, label: "Dark" },
  { value: "system", icon: ComputerIcon, label: "System" },
] as const;

export const ThemeSubMenu = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <HugeiconsIcon icon={Sun02Icon} className="size-4" />
        Theme
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup
          value={mounted ? theme : undefined}
          onValueChange={mounted ? (value) => setTheme(value) : undefined}
        >
          {themeOptions.map(({ value, icon, label }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <HugeiconsIcon icon={icon} className="size-4" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
