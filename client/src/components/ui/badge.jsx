import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#2563EB] text-white",
        secondary: "border-[#E2E8F0] bg-[#F1F5F9] text-[#0F172A]",
        destructive: "border-[#FCA5A5] bg-[#FEE2E2] text-[#B91C1C]",
        outline: "border-[#CBD5E1] bg-white text-[#475569]",
        success: "border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]",
        warning: "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]",
        info: "border-[#BAE6FD] bg-[#E0F2FE] text-[#0369A1]",
        purple: "border-[#F3E8FF] bg-[#FAF5FF] text-[#6B21A8]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
