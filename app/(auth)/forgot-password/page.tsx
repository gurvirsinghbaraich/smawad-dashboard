"use client";
import ButtonElement from "@/components/Button";
import InputElement from "@/components/Input";
import { fetchApi } from "@/lib/fetchApi";
import {
  AlertStatus,
  useAppendAlertToQueue,
} from "@/providers/DashboardProvider";
import Image from "next/image";
import { FormEvent, useState } from "react";
import z from "zod";

type ForgotPassowrdFormFields = {
  email: string[];
};

const forgotPassowrdFromSchema = z.object({
  email: z
    .string()
    .min(1, "Email field is required.")
    .email("Invalid email format."),
});

export default function ResetPasswordPage() {
  const appendAlertToQueue = useAppendAlertToQueue();
  const [formErrors, setFormErrors] = useState<ForgotPassowrdFormFields>();

  const resetPassword = async function (email: string) {
    const request = await fetchApi(
      "/api/auth/request-password-reset",
      {},
      {
        email,
      },
    );

    if (request?.data) {
      appendAlertToQueue(
        request.data?.message,
        request.status === "OK" ? AlertStatus.Success : AlertStatus.Error,
      );
    }
  };

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors(undefined);

    try {
      const formField = (name: string) =>
        (
          event.currentTarget.elements.namedItem(
            name,
          ) as HTMLInputElement | null
        )?.value;

      const { email } = forgotPassowrdFromSchema.parse({
        email: formField("email"),
      });

      resetPassword(email);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.flatten().fieldErrors as ForgotPassowrdFormFields);
      }
    }
  };

  return (
    <main className="grid h-screen w-screen grid-cols-1 grid-rows-2 overflow-hidden md:grid-cols-2 md:grid-rows-1">
      <div className="grid h-full w-full place-items-center bg-smawad-secondary">
        <Image
          priority
          width={244}
          height={154}
          src={"/images/logo.webp"}
          alt="Smart Automotors Logo"
        />
      </div>
      <div className="grid place-items-center">
        <div className="flex w-full flex-col gap-8 p-4">
          <div className="text-center">
            <h2 className="text-xl font-bold">Reset Password</h2>
          </div>
          <form
            className="mx-auto flex w-full max-w-xl  flex-col gap-3 rounded p-4"
            onSubmit={onFormSubmit}
          >
            <InputElement
              type="email"
              name="email"
              label="Email"
              error={formErrors?.email}
            />

            <ButtonElement role="submit">Reset Password</ButtonElement>
          </form>
        </div>
      </div>
    </main>
  );
}
