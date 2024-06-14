import { cn } from "@/lib/utils";
import Link from "next/link";
import { HTMLProps, forwardRef } from "react";

const ActionButton = forwardRef<
  HTMLButtonElement,
  HTMLProps<HTMLButtonElement> & {
    icon?: JSX.Element;
    actionButton?: boolean;
  }
>(({ className, href, icon = <></>, actionButton, ...props }, ref) => {
  return href ? (
    <Link href={href}>
      {/* @ts-ignore */}
      <button
        {...props}
        className={cn(
          "default capitalize",
          actionButton && "action-button",
          className,
        )}
      >
        {icon}
        <span>{props.title}</span>
      </button>
    </Link>
  ) : (
    // @ts-ignore
    <button
      {...props}
      className={cn(
        "default capitalize",
        actionButton && "action-button",
        className,
      )}
    >
      {icon}
      <span>{props.title}</span>
    </button>
  );
});

ActionButton.displayName = "Action Button";
export default ActionButton;
