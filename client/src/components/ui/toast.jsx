import React from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.variant === "success";
        const isDestructive = t.variant === "destructive";
        const isWarning = t.variant === "warning";

        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200",
              isSuccess && "bg-emerald-50/95 border-emerald-200 text-emerald-950 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-50",
              isDestructive && "bg-red-50/95 border-red-200 text-red-950 dark:bg-red-950/90 dark:border-red-800 dark:text-red-50",
              isWarning && "bg-amber-50/95 border-amber-200 text-amber-950 dark:bg-amber-950/90 dark:border-amber-800 dark:text-amber-50",
              (!t.variant || t.variant === "default") && "bg-white/95 border-slate-200 text-slate-950 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-50"
            )}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
            {isDestructive && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
            {isWarning && <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />}
            {(!t.variant || t.variant === "default") && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              {t.title && <h4 className="text-sm font-semibold leading-tight">{t.title}</h4>}
              {t.description && <p className="text-xs mt-1 opacity-90 leading-relaxed">{t.description}</p>}
            </div>

            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
