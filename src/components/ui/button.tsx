import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lux hover:bg-[#a8606b] hover:shadow-lux-lg active:scale-[0.98]",
        gold:
          "bg-gold text-[#3d3310] shadow-lux hover:bg-[#c4a02f] hover:shadow-lux-lg active:scale-[0.98]",
        dark: "bg-ink text-ivory hover:bg-charcoal shadow-soft active:scale-[0.98]",
        outline:
          "border border-primary/40 bg-transparent text-rose hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",
        ghost: "text-foreground hover:bg-secondary hover:text-secondary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[#fbe4e1]",
        link: "text-rose underline-offset-4 hover:underline",
        white: "bg-white text-ink hover:bg-ivory shadow-soft active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
