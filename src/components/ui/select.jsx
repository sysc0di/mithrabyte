import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Styled native select: accessible and dependency-free. If a richer menu is
 * needed later, swap for a Radix-based select.
 */
function Select({ className, ...props }) {
  return (
    <div className={cn("relative", className)}>
      <select
        data-slot="select"
        className={cn(
          "border-input bg-transparent data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] file:text-foreground placeholder:text-muted-foreground flex h-9 w-full min-w-0 appearance-none rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export { Select };