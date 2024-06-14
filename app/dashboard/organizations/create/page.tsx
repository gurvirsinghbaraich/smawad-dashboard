"use client";
import OrganizationForm, {
  OrganizationFormFields,
} from "@/components/forms/OrganizationForm";
import {
  AlertStatus,
  useAppendAlertToQueue,
} from "@/providers/DashboardProvider";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { IoCheckmark } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { ZodError } from "zod";

export default function OrganizationCreatePage() {
  const router = useRouter();
  const appendAlertToQueue = useAppendAlertToQueue();
  const formSubmitButtonTrigger = useRef<HTMLButtonElement>(null);

  const createOrganization = async ({
    data,
    error,
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

    const createOrganizationRequest = await axios.post(
      process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL +
        "/api/organizations/create",
      data,
      {
        withCredentials: true,
      },
    );
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
            <IoCheckmark />
            <span>Save</span>
          </button>
        </div>
      </div>

      <OrganizationForm
        onSubmit={createOrganization}
        formTrigger={formSubmitButtonTrigger}
      />
    </section>
  );
}
