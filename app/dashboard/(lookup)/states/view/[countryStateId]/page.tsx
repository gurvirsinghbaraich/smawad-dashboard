"use client";
import StateForm from "@/components/forms/StateForm";
import { fetchApi } from "@/lib/fetchApi";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RxCross1 } from "react-icons/rx";

export default function StateViewPage({
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
  const formTrigger = useRef<HTMLButtonElement>(null);

  useEffect(function () {
    const fetchState = async () => {
      const response = await fetchApi("/api/lookup/states/" + countryStateId);
      if (response?.data) {
        setState(response.data);
      }
    };

    fetchState();
  }, []);

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">State Detail</h2>

        <div className="flex gap-4">
          <button ref={formTrigger} onClick={router.back}>
            <RxCross1 />
            <span>Close</span>
          </button>
        </div>
      </div>

      <StateForm formTrigger={formTrigger} readOnly state={state} />
    </section>
  );
}
