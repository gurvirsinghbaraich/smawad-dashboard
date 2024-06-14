"use client";
import OrganizationForm, {
  OrganizationFormFields,
} from "@/components/forms/OrganizationForm";
import {
  AlertStatus,
  useAppendAlertToQueue,
} from "@/providers/DashboardProvider";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoCheckmark } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { ZodError } from "zod";

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
  const [loading, setLoading] = useState<boolean>(false);
  const appendAlertToQueue = useAppendAlertToQueue();
  const formSubmitButtonTrigger = useRef<HTMLButtonElement>(null);

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

  useEffect(
    function () {
      if (!organization) return;
      if (!organization.isActive) {
        alert("Cannot edit deleted record!");
        router.push("/dashbaord/organizations");
      }
    },
    [organization],
  );

  const updateOrganization = async ({
    data,
    success,
  }: {
    success: boolean;
    error?: ZodError;
    data?: OrganizationFormFields;
  }) => {
    if (!success) {
      // Means there is validation error in the form
      return appendAlertToQueue(
        "Please fill all required form fields.",
        AlertStatus.Error,
      );
    }

    setLoading(true);
    const updateOrganizationRequest = await axios.post(
      process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL +
        "/api/organizations/update",
      {
        organizationId,
        data,
      },
      {
        withCredentials: true,
      },
    );

    setLoading(false);
    if (updateOrganizationRequest.data?.status == "OK") {
      appendAlertToQueue(
        "Organization updated successfully!",
        AlertStatus.Success,
      );
    } else {
      appendAlertToQueue(
        "Unable to update the organization, please try again later.",
        AlertStatus.Error,
      );
    }
  };

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">Organizaiton Details</h2>

        <div className="flex gap-4">
          <button onClick={router.back}>
            <RxCross1 />
            <span>Cancel</span>
          </button>

          <button ref={formSubmitButtonTrigger} className="action-button">
            {loading ? (
              <div className="h-2 min-w-14 rounded-full bg-white/60">
                <div
                  className="animate-loading h-2 w-0 rounded-full bg-white"
                  style={{ animationDuration: "4000ms" }}
                ></div>
              </div>
            ) : (
              <>
                <IoCheckmark />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>

      <OrganizationForm
        organization={organization}
        onSubmit={updateOrganization}
        formTrigger={formSubmitButtonTrigger}
      />
    </section>
  );
}
