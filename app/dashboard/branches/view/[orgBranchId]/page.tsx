"use client";
import BranchForm from "@/components/forms/BranchForm";
import { fetchApi } from "@/lib/fetchApi";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RxCross1 } from "react-icons/rx";

export default function BranchViewPage({
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
  const formTrigger = useRef<HTMLButtonElement>(null);

  useEffect(function () {
    const fetchBranch = async () => {
      const response = await fetchApi("/api/branches/" + orgBranchId);
      if (response?.data) {
        setBranch(response.data);
      }
    };

    fetchBranch();
  }, []);

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">Branch Detail</h2>

        <div className="flex gap-4">
          <button ref={formTrigger} onClick={router.back}>
            <RxCross1 />
            <span>Close</span>
          </button>
        </div>
      </div>

      <BranchForm formTrigger={formTrigger} readOnly branch={branch} />
    </section>
  );
}
