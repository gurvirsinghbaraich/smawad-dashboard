import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AsteriskIcon } from "lucide-react";
import { HTMLProps } from "react";

type FormFieldProps = HTMLProps<HTMLInputElement> & {
  fieldError?: any;
  selectable?: boolean;
  onValueChange?: (value: any) => void;
  dependsOn?: number | string | boolean;
  dataset?: Array<{
    value: string;
    key: string | number;
    dependsOn?: number | string | boolean;
  }>;
};

export default function FormField({
  id,
  label,
  dataset,
  disabled,
  className,
  defaultValue,
  dependsOn,
  fieldError,
  selectable,
  placeholder,
  readOnly,
  required = true,
  onValueChange,
  ...props
}: FormFieldProps) {
  const getDefaultValueFromDataset = (
    defaultValue: string | number | readonly string[] | undefined,
    dataset: FormFieldProps["dataset"],
  ) => {
    if (!defaultValue || !dataset) {
      return defaultValue?.toString();
    }

    return dataset.find((set) => set.key.toString() === defaultValue.toString())
      ?.value;
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <label htmlFor={label} className="flex">
        <span>{label}</span>
        {required && <AsteriskIcon className={"text-rose-600"} size={14} />}
      </label>

      {!selectable || readOnly ? (
        <input
          {...props}
          readOnly={readOnly}
          id={label}
          defaultValue={
            selectable
              ? getDefaultValueFromDataset(defaultValue, dataset)
              : defaultValue
          }
          disabled={disabled}
          className={cn("w-full rounded bg-smawad-gray p-4", className)}
        />
      ) : (
        <Select
          defaultValue={defaultValue?.toString() || undefined}
          onValueChange={onValueChange}
          name={props.name || ""}
          key={defaultValue?.toString()}
        >
          <SelectTrigger
            disabled={disabled}
            className={cn("max-h-14 min-h-14 bg-smawad-gray", className)}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {dataset?.map((set, idx) => {
                if (
                  (!set.dependsOn && !dependsOn) ||
                  (set.dependsOn && dependsOn && set.dependsOn == dependsOn)
                ) {
                  return (
                    <SelectItem key={idx} value={set.key.toString()}>
                      {set.value.toString()}
                    </SelectItem>
                  );
                }
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {fieldError && (
        <div>
          <span className="text-xs text-rose-600">{fieldError}</span>
        </div>
      )}
    </div>
  );
}
