"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20",
        primary: "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/25",
        ghost: "text-white/60 hover:bg-white/5 hover:text-white",
        outline: "border border-white/10 text-white hover:bg-white/5",
        danger: "bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({ className, variant, size, loading, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children}
        </span>
      ) : children}
    </button>
  );
}
