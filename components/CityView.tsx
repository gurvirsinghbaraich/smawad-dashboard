"use client";

import { fetchApi } from "@/lib/fetchApi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FormFieldContainer } from "./FormFieldContainer";
import FormField from "./forms/abstracts/FormField";

export default function CityView({ cityId }: { cityId: number }) {
  const router = useRouter();
  const [city, setCity] = useState<any>();

  // Helper function to set the city
  async function getCityDetails() {
    const response = await fetchApi("/api/lookup/cities/" + cityId);

    if (response?.data) {
      setCity(response.data);
    }
  }

  useEffect(function () {
    getCityDetails();
  }, []);

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">City Type Detail</h2>

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
          name="cityId"
          defaultValue={city?.cityId}
          label="City Type Id"
        />

        <FormField
          readOnly={true}
          name="city"
          defaultValue={city?.city}
          label="City Type"
        />
      </FormFieldContainer>
    </section>
  );
}
