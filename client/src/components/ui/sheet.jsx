import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet = ({ open, onClose, children, side = "left", className }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet Content */}
      <div className={cn(
        "relative z-50 flex h-full flex-col bg-white text-slate-900 shadow-2xl transition-transform w-72 border-r border-slate-200",
        side === "left" ? "left-0" : "right-0 ml-auto border-l border-r-0",
        className
      )}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950"
        >
          <X className="h-5 w-5 text-slate-500 hover:text-slate-900" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
};

export { Sheet }
