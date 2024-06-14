import { cn } from "@/lib/utils";
import { HTMLProps, forwardRef } from "react";

type InputProps = HTMLProps<HTMLInputElement> & {
  error?: string | string[];
};

const InputElement = forwardRef<HTMLInputElement, InputProps>(function (
  { label, error, className, ...props },
  ref,
) {
  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={label}>{label}</label>
      <input
        {...props}
        ref={ref}
        id={label}
        className={cn(
          "bg-smawad-gray w-full rounded-md px-[10px] py-[18px]",
          className,
        )}
      />

      {error && (
        <span className="pt-1 text-xs text-rose-600">
          {typeof error === "string" ? error : error[0]}
        </span>
      )}
    </div>
  );
});

InputElement.displayName = "InputElement";
export default InputElement;
