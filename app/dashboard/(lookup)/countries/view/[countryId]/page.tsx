"use client";
import CountryForm from "@/components/forms/CountryForm";
import { fetchApi } from "@/lib/fetchApi";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RxCross1 } from "react-icons/rx";

export default function CountryViewPage({
  params,
}: {
  params: {
    countryId: string;
  };
}) {
  const countryId = Number(params.countryId);
  if (isNaN(countryId)) {
    redirect("/dashboard/countries");
  }

  const router = useRouter();
  const [country, setCountry] = useState<any>();
  const formTrigger = useRef<HTMLButtonElement>(null);

  useEffect(function () {
    const fetchCountry = async () => {
      const response = await fetchApi("/api/lookup/countries/" + countryId);
      if (response?.data) {
        setCountry(response.data);
      }
    };

    fetchCountry();
  }, []);

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">Country Detail</h2>

        <div className="flex gap-4">
          <button ref={formTrigger} onClick={router.back}>
            <RxCross1 />
            <span>Close</span>
          </button>
        </div>
      </div>

      <CountryForm formTrigger={formTrigger} readOnly country={country} />
    </section>
  );
}
