import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "danger";
    size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", ...props }, ref) => {
        const variants = {
            primary: "bg-black text-white hover:bg-gray-800 rounded-full font-medium shadow-sm transition-all",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-full font-medium transition-all",
            outline: "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 rounded-full font-medium shadow-sm transition-all",
            danger: "bg-brand-red text-white hover:bg-orange-600 rounded-full font-medium shadow-sm transition-all",
        };
        const sizes = {
            default: "h-10 px-5 py-2 text-sm",
            sm: "h-8 px-4 text-xs",
            lg: "h-12 px-8 text-base",
            icon: "h-10 w-10 rounded-full flex items-center justify-center",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center tracking-tight focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";
