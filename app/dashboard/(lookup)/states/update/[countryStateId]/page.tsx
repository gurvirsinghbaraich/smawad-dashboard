"use client";
import StateForm from "@/components/forms/StateForm";
import { fetchApi } from "@/lib/fetchApi";
import {
  AlertStatus,
  useAppendAlertToQueue,
} from "@/providers/DashboardProvider";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoCheckmark } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";

export default function StateUpdatePage({
  params,
}: {
  params: {
    countryStateId: string;
  };
}) {
  const countryStateId = Number(params.countryStateId);
  if (isNaN(countryStateId)) {
    redirect("/dashboard/states");
  }

  const router = useRouter();
  const [state, setState] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const appendAlertToQueue = useAppendAlertToQueue();
  const formSubmitButtonTrigger = useRef<HTMLButtonElement>(null);

  useEffect(function () {
    const fetchState = async () => {
      const response = await fetchApi("/api/lookup/states/" + countryStateId);
      if (response?.data) {
        setState(response.data);
      }
    };

    fetchState();
  }, []);

  const updateState = async (data: any) => {
    if (!data) {
      return appendAlertToQueue(
        "Please fill all the required fields.",
        AlertStatus.Error,
      );
    }

    setLoading(true);
    const updateStateRequest = await fetchApi(
      "/api/lookup/states/update",
      {},
      { ...data, countryStateId },
    );

    setLoading(false);
    if (updateStateRequest?.status == "OK") {
      appendAlertToQueue("State updated successfully!", AlertStatus.Success);
    } else {
      appendAlertToQueue(
        "Unable to update the state, please try again later.",
        AlertStatus.Error,
      );
    }
  };

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">State Details</h2>

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

      <StateForm
        state={state}
        onSubmit={updateState}
        formTrigger={formSubmitButtonTrigger}
      />
    </section>
  );
}
