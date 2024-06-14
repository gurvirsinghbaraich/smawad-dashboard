"use client";
import { fetchApi } from "@/lib/fetchApi";
import { AsteriskIcon } from "lucide-react";
import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { z } from "zod";
import { FormFieldContainer } from "../FormFieldContainer";
import FormField from "./abstracts/FormField";

export default function StateForm({
  readOnly,
  onSubmit,
  state,
  formTrigger,
}: any) {
  const [countries, setCountries] = useState<any[]>([]);
  const ref = useRef<HTMLFormElement>(null);

  useLayoutEffect(function () {
    const fetchCountries = async () => {
      const response = await fetchApi("/api/lookup/countries");

      if (response?.data?.countries) {
        setCountries(
          response.data.countries.map((country: any) => ({
            key: country.countryId,
            value: country.country,
          })),
        );
      }
    };

    fetchCountries();
  }, []);

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
      state: getField("countryState"),
      countryId: getField("countryId"),
    };

    const { data } = z
      .object({
        state: z.string(),
        countryId: z.coerce.number(),
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
                State Details
                <AsteriskIcon className={"text-rose-600"} size={16} />
              </span>
            </h3>

            <FormFieldContainer>
              <FormField
                selectable
                defaultValue={state?.countryId}
                label="Country"
                name="countryId"
                dataset={countries}
              />

              <FormField
                readOnly={true}
                defaultValue={state?.countryStateId}
                name="countryStateId"
                label="State Id"
              />

              <FormField
                readOnly={readOnly}
                defaultValue={state?.countryState}
                name="countryState"
                label="State Name"
              />
            </FormFieldContainer>
          </div>
        </div>
      </div>
    </form>
  );
}
