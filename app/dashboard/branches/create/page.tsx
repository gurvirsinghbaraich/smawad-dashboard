"use client";
import BranchForm from "@/components/forms/BranchForm";
import { fetchApi } from "@/lib/fetchApi";
import {
  AlertStatus,
  useAppendAlertToQueue,
} from "@/providers/DashboardProvider";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { IoCheckmark } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";

export default function BranchCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const appendAlertToQueue = useAppendAlertToQueue();
  const formSubmitButtonTrigger = useRef<HTMLButtonElement>(null);

  const createBranch = async (data: any) => {
    if (!data) {
      return appendAlertToQueue(
        "Please fill all the required fields.",
        AlertStatus.Error,
      );
    }

    setLoading(true);
    const createBranchRequest = await fetchApi(
      "/api/branches/create",
      {},
      data,
    );

    setLoading(false);
    if (createBranchRequest?.status == "OK") {
      appendAlertToQueue("Branch created successfully!", AlertStatus.Success);
    } else {
      appendAlertToQueue(
        "Unable to create the branch, please try again later.",
        AlertStatus.Error,
      );
    }
  };

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">Branch Details</h2>

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

      <BranchForm
        onSubmit={createBranch}
        formTrigger={formSubmitButtonTrigger}
      />
    </section>
  );
}
