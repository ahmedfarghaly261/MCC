import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative flex w-full flex-col", className)}
    {...props}
  />
));
InputGroup.displayName = "InputGroup";

const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof Textarea>
>(({ className, ...props }, ref) => (
  <Textarea ref={ref} className={cn("pr-16", className)} {...props} />
));
InputGroupTextarea.displayName = "InputGroupTextarea";

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "block-start" | "block-end" }
>(({ className, align = "block-end", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute right-3 z-10",
      align === "block-end" ? "bottom-2" : "top-2",
      className,
    )}
    {...props}
  />
));
InputGroupAddon.displayName = "InputGroupAddon";

const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "text-xs text-muted-foreground bg-background/80 px-1 rounded",
      className,
    )}
    {...props}
  />
));
InputGroupText.displayName = "InputGroupText";

export { InputGroup, InputGroupTextarea, InputGroupAddon, InputGroupText };
