"use client";
import UserForm from "@/components/forms/UserForm";
import { fetchApi } from "@/lib/fetchApi";
import {
  AlertStatus,
  useAppendAlertToQueue,
} from "@/providers/DashboardProvider";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoCheckmark } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";

export default function UserUpdatePage({
  params,
}: {
  params: {
    userId: string;
  };
}) {
  const userId = Number(params.userId);
  if (isNaN(userId)) {
    redirect("/dashboard/users");
  }

  const router = useRouter();
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const appendAlertToQueue = useAppendAlertToQueue();
  const formSubmitButtonTrigger = useRef<HTMLButtonElement>(null);

  useEffect(function () {
    const fetchUser = async () => {
      const response = await fetchApi("/api/users/" + userId);
      if (response?.data) {
        setUser(response.data);
      }
    };

    fetchUser();
  }, []);

  const updateUser = async (data: any) => {
    console.log(data);
    if (!data) {
      return appendAlertToQueue(
        "Please fill all the required fields.",
        AlertStatus.Error,
      );
    }

    setLoading(true);
    const updateUserRequest = await fetchApi(
      "/api/users/update",
      {},
      { ...data, userId },
    );

    setLoading(false);
    if (updateUserRequest?.status == "OK") {
      appendAlertToQueue("User updated successfully!", AlertStatus.Success);
    } else {
      appendAlertToQueue(
        "Unable to update the user, please try again later.",
        AlertStatus.Error,
      );
    }
  };

  useEffect(
    function () {
      if (!user) return;
      if (!user.isActive) {
        alert("Cannot edit a deleted user.");
        router.push("/dashboard/users");
      }
    },
    [user],
  );

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">User Details</h2>

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

      <UserForm
        user={user}
        onSubmit={updateUser}
        formTrigger={formSubmitButtonTrigger}
      />
    </section>
  );
}
