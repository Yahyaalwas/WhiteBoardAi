import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/20 text-primary",
        secondary: "border-transparent bg-white/5 text-white/70",
        outline: "border-white/10 text-white/60",
        success: "border-transparent bg-emerald-500/15 text-emerald-400",
        warning: "border-transparent bg-amber-500/15 text-amber-400",
        danger: "border-transparent bg-red-500/15 text-red-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
