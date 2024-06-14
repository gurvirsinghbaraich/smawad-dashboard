"use client";

import { fetchApi } from "@/lib/fetchApi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FormFieldContainer } from "./FormFieldContainer";
import FormField from "./forms/abstracts/FormField";

export default function CountryView({ countryId }: { countryId: number }) {
  const router = useRouter();
  const [country, setCountry] = useState<any>();

  // Helper function to set the organization
  async function getCountryDetails() {
    const response = await fetchApi("/api/lookup/countries/" + countryId);

    if (response?.data) {
      setCountry(response.data);
    }
  }

  useEffect(function () {
    getCountryDetails();
  }, []);

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">Country Detail</h2>

        <div className="flex gap-4">
          <button onClick={router.back}>
            <RxCross1 />
            <span>Close</span>
          </button>
        </div>
      </div>

      <FormFieldContainer>
        <FormField
          readOnly={true}
          name="countryId"
          defaultValue={country?.countryId}
          label="Country Id"
        />

        <FormField
          readOnly={true}
          name="country"
          defaultValue={country?.country}
          label="Country"
        />
      </FormFieldContainer>
    </section>
  );
}
