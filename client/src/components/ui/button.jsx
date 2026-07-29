import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#2563EB] text-white shadow-2xs hover:bg-[#1D4ED8]",
        primary: "bg-[#2563EB] text-white shadow-2xs hover:bg-[#1D4ED8]",
        secondary: "bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0]",
        outline: "border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]",
        ghost: "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
        destructive: "bg-[#DC2626] text-white shadow-2xs hover:bg-[#B91C1C]",
        link: "text-[#2563EB] underline-offset-4 hover:underline",
        success: "bg-[#16A34A] text-white shadow-2xs hover:bg-[#15803D]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6 text-sm font-semibold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
