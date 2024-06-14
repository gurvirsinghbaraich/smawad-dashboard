"use client";
import UserForm from "@/components/forms/UserForm";
import { fetchApi } from "@/lib/fetchApi";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RxCross1 } from "react-icons/rx";

export default function UserViewPage({
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
  const formTrigger = useRef<HTMLButtonElement>(null);

  useEffect(function () {
    const fetchUser = async () => {
      const response = await fetchApi("/api/users/" + userId);
      if (response?.data) {
        setUser(response.data);
      }
    };

    fetchUser();
  }, []);

  return (
    <section>
      <div className="mb-[39px] flex items-center justify-between">
        <h2 className="text-xl font-bold">User Detail</h2>

        <div className="flex gap-4">
          <button ref={formTrigger} onClick={router.back}>
            <RxCross1 />
            <span>Close</span>
          </button>
        </div>
      </div>

      <UserForm formTrigger={formTrigger} readOnly user={user} />
    </section>
  );
}
