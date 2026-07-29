import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ trigger, children, align = "right" }) => {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 w-48 rounded-md border border-[#E2E8F0] bg-white p-1 text-[#0F172A] shadow-md animate-in fade-in-80 zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = React.forwardRef(({ className, inset, destructive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2.5 py-1.5 text-xs font-medium text-[#0F172A] outline-none transition-colors hover:bg-[#F8FAFC] hover:text-[#2563EB]",
      inset && "pl-8",
      destructive && "text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#B91C1C]",
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2.5 py-1 text.xs font-semibold text-[#64748B]", inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-[#E2E8F0]", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator }
