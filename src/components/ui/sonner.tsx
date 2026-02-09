"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = "light" 

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/95 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:px-5 group-[.toaster]:py-4",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs font-medium",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-bold rounded-lg",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-bold rounded-lg",
          success: "group-[.toaster]:border-green-500/20 group-[.toaster]:bg-green-50/50 dark:group-[.toaster]:bg-green-950/20",
          error: "group-[.toaster]:border-red-500/20 group-[.toaster]:bg-red-50/50 dark:group-[.toaster]:bg-red-950/20",
          info: "group-[.toaster]:border-blue-500/20 group-[.toaster]:bg-blue-50/50 dark:group-[.toaster]:bg-blue-950/20",
          warning: "group-[.toaster]:border-yellow-500/20 group-[.toaster]:bg-yellow-50/50 dark:group-[.toaster]:bg-yellow-950/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
