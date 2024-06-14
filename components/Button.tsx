import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function ButtonElement({
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "bg-smawad-accent mt-2 rounded-lg p-3 text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
