'use client';
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, { ReactNode } from "react";

const customBadgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-sm font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "border-transparent bg-accent text-accent-foreground",
                outline: "border-border bg-transparent hover:bg-muted",
                success: "border-transparent bg-success text-success-foreground",
                warning: "border-transparent bg-warning text-warning-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface CustomBadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof customBadgeVariants> {
    icon?: ReactNode;
}

const CustomBadge = React.forwardRef<HTMLDivElement, CustomBadgeProps>(
    ({ className, variant, icon, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(customBadgeVariants({ variant }), className)}
                {...props}
            >
                {icon && <span className="h-4 w-4">{icon}</span>}
                {children}
            </div>
        );
    }
);

CustomBadge.displayName = "CustomBadge";

export { CustomBadge, customBadgeVariants };
