"use client";
import { AsteriskIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef } from "react";
import { z } from "zod";
import { FormFieldContainer } from "../FormFieldContainer";
import FormField from "./abstracts/FormField";

export default function CountryForm({
  readOnly,
  onSubmit,
  country,
  formTrigger,
}: any) {
  const pathname = usePathname();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(
    function () {
      if (!ref.current) return;
      if (!formTrigger.current) return;

      formTrigger.current.addEventListener("click", () => {
        ref.current?.requestSubmit();
      });
    },
    [formTrigger, ref],
  );

  const handleSumbit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElement = e.currentTarget!.elements!;
    const getField = (name: string) =>
      (formElement.namedItem(name) as HTMLInputElement | null)?.value;

    let payload: any = {
      country: getField("country"),
    };

    const { data } = z
      .object({
        country: z.string(),
      })
      .safeParse(payload);

    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSumbit} action="#" ref={ref}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex w-full flex-col gap-6 rounded-[24px] border p-8">
            <h3 className="relative flex justify-between text-[18px] font-bold">
              <span className="flex">
                Country Details
                <AsteriskIcon className={"text-rose-600"} size={16} />
              </span>
            </h3>

            <FormFieldContainer>
              <FormField
                readOnly={true}
                defaultValue={country?.countryId}
                name="countryId"
                label="Country Id"
              />

              <FormField
                readOnly={readOnly}
                defaultValue={country?.country}
                name="country"
                label="Country Name"
              />
            </FormFieldContainer>
          </div>
        </div>
      </div>
    </form>
  );
}
