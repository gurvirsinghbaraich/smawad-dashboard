"use client";
import BranchForm from "@/components/forms/BranchForm";
import { fetchApi } from "@/lib/fetchApi";
import {
  AlertStatus,
  useAppendAlertToQueue,
} from "@/providers/DashboardProvider";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoCheckmark } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";

export default function BranchUpdatePage({
  params,
}: {
  params: {
    orgBranchId: string;
  };
}) {
  const orgBranchId = Number(params.orgBranchId);
  if (isNaN(orgBranchId)) {
    redirect("/dashboard/branches");
  }

  const router = useRouter();
  const [branch, setBranch] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const appendAlertToQueue = useAppendAlertToQueue();
  const formSubmitButtonTrigger = useRef<HTMLButtonElement>(null);

  useEffect(function () {
    const fetchBranch = async () => {
      const response = await fetchApi("/api/branches/" + orgBranchId);
      if (response?.data) {
        setBranch(response.data);
      }
    };

    fetchBranch();
  }, []);

  useEffect(
    function () {
      if (!branch) return;
      if (!branch.isActive) {
        alert("Cannot edit a deleted branch");
        router.push("/dashboard/branches");
      }
    },
    [branch],
  );

  const updateBranch = async (data: any) => {
    if (!data) {
      return appendAlertToQueue(
        "Please fill all the required fields.",
        AlertStatus.Error,
      );
    }

    setLoading(true);
    const updateBranchRequest = await fetchApi(
      "/api/branches/update",
      {},
      { ...data, orgBranchId },
    );

    setLoading(false);
    if (updateBranchRequest?.status == "OK") {
      appendAlertToQueue("Branch updated successfully!", AlertStatus.Success);
    } else {
      appendAlertToQueue(
        "Unable to update the branch, please try again later.",
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
        branch={branch}
        onSubmit={updateBranch}
        formTrigger={formSubmitButtonTrigger}
      />
    </section>
  );
}
