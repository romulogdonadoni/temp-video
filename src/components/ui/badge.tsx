import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-100 text-zinc-900 shadow hover:bg-zinc-200",
        secondary:
          "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
        destructive:
          "border-transparent bg-red-900/40 text-red-300 border-red-800/60",
        outline: "text-zinc-300 border-zinc-800",
        indigo: "border-indigo-800/50 bg-indigo-950/60 text-indigo-300",
        amber: "border-amber-800/50 bg-amber-950/60 text-amber-300",
        emerald: "border-emerald-800/50 bg-emerald-950/60 text-emerald-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
