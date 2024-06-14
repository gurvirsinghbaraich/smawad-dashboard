"use client";

import { fetchApi } from "@/lib/fetchApi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FormFieldContainer } from "./FormFieldContainer";
import FormField from "./forms/abstracts/FormField";

export default function OrganizationTypeView({
  orgTypeId,
}: {
  orgTypeId: number;
}) {
  const router = useRouter();
  const [organizationType, setOrganizationType] = useState<any>();

  // Helper function to set the organization
  async function getOrganizationTypeDetails() {
    const response = await fetchApi(
      "/api/lookup/organization-types/" + orgTypeId,
    );

    if (response?.data) {
      setOrganizationType(response.data);
    }
  }

  useEffect(function () {
    getOrganizationTypeDetails();
  }, []);

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">Organization Type Detail</h2>

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
          name="orgTypeId"
          defaultValue={organizationType?.orgTypeId}
          label="Organization Type Id"
        />

        <FormField
          readOnly={true}
          name="orgType"
          defaultValue={organizationType?.orgType}
          label="Organization Type"
        />
      </FormFieldContainer>
    </section>
  );
}
