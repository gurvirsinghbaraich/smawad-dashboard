"use client";
import CountryForm from "@/components/forms/CountryForm";
import { fetchApi } from "@/lib/fetchApi";
import {
  AlertStatus,
  useAppendAlertToQueue,
} from "@/providers/DashboardProvider";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoCheckmark } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";

export default function CountryUpdatePage({
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
  const [loading, setLoading] = useState<boolean>(false);
  const appendAlertToQueue = useAppendAlertToQueue();
  const formSubmitButtonTrigger = useRef<HTMLButtonElement>(null);

  useEffect(function () {
    const fetchCountry = async () => {
      const response = await fetchApi("/api/lookup/countries/" + countryId);
      if (response?.data) {
        setCountry(response.data);
      }
    };

    fetchCountry();
  }, []);

  const updateCountry = async (data: any) => {
    if (!data) {
      return appendAlertToQueue(
        "Please fill all the required fields.",
        AlertStatus.Error,
      );
    }

    setLoading(true);
    const updateCountryRequest = await fetchApi(
      "/api/lookup/countries/update",
      {},
      { ...data, countryId },
    );

    setLoading(false);
    if (updateCountryRequest?.status == "OK") {
      appendAlertToQueue("Country updated successfully!", AlertStatus.Success);
    } else {
      appendAlertToQueue(
        "Unable to update the country, please try again later.",
        AlertStatus.Error,
      );
    }
  };

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">Country Details</h2>

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

      <CountryForm
        country={country}
        onSubmit={updateCountry}
        formTrigger={formSubmitButtonTrigger}
      />
    </section>
  );
}
