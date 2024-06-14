"use client";

import { fetchApi } from "@/lib/fetchApi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FormFieldContainer } from "./FormFieldContainer";
import FormField from "./forms/abstracts/FormField";

export default function IndustryTypeView({
  industryTypeId,
}: {
  industryTypeId: number;
}) {
  const router = useRouter();
  const [industryType, setIndustryType] = useState<any>();

  // Helper function to set the organization
  async function getIndustryTypeDetails() {
    const response = await fetchApi(
      "/api/lookup/industry-types/" + industryTypeId,
    );

    if (response?.data) {
      setIndustryType(response.data);
    }
  }

  useEffect(function () {
    getIndustryTypeDetails();
  }, []);

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">Industry Type Detail</h2>

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
          name="industryTypeId"
          defaultValue={industryType?.industryTypeId}
          label="Industry Type Id"
        />

        <FormField
          readOnly={true}
          name="orgType"
          defaultValue={industryType?.orgType}
          label="Industry Type"
        />
      </FormFieldContainer>
    </section>
  );
}
