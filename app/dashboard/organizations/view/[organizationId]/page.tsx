"use client";
import OrganizationForm from "@/components/forms/OrganizationForm";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";

export default function OrganizationUpdatePage({
  params,
}: {
  params: {
    organizationId: string;
  };
}) {
  const organizationId = Number(params.organizationId);
  if (isNaN(organizationId)) {
    redirect("/dashboard/organizations");
  }

  const router = useRouter();
  const [organization, setOrganization] = useState<any>();

  useEffect(function () {
    const fetchOrganization = async () => {
      const apiRequest = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL +
          `/api/organizations/${organizationId}`,
        { withCredentials: true },
      );

      const response = apiRequest.data;
      if (response) {
        setOrganization(response.data);
      }
    };

    fetchOrganization();
  }, []);

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">Organizaiton Details</h2>

        <div className="flex gap-4">
          <button onClick={router.back}>
            <RxCross1 />
            <span>Close</span>
          </button>
        </div>
      </div>

      <OrganizationForm readOnly organization={organization} />
    </section>
  );
}
