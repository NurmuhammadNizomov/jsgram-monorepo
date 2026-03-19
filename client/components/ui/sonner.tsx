"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Toaster as SonnerToaster, toast, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SonnerToaster
      theme={mounted ? (resolvedTheme as "light" | "dark") : "light"}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group font-sans text-sm rounded-xl border shadow-lg",
          title: "font-semibold",
          description: "opacity-70 text-xs mt-0.5",
          actionButton:
            "bg-primary text-primary-foreground font-medium text-xs rounded-lg px-3 py-1.5",
          cancelButton:
            "bg-muted text-muted-foreground font-medium text-xs rounded-lg px-3 py-1.5",
          closeButton: "rounded-lg",
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
