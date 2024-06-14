"use client";
import ButtonElement from "@/components/Button";
import InputElement from "@/components/Input";
import { fetchApi } from "@/lib/fetchApi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import z from "zod";

type LoginFormFields = {
  email: string[];
  password: string[];
};

const loginFromSchema = z.object({
  email: z
    .string()
    .min(1, "Email field is required.")
    .email("Invalid email format."),

  password: z.string().min(6, "Password cannot be smaller that 6 characters."),
});

export default function SignInPage() {
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<LoginFormFields>();

  const signIn = async function (email: string, password: string) {
    const request = await fetchApi<{
      data: {
        authenticated: boolean;
        user: { userId: number; email: string; name: string };
      };
    }>(
      "/api/auth/sign-in",
      {},
      {
        email,
        password,
      },
    );

    return request?.data;
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

      const { email, password } = loginFromSchema.parse({
        email: formField("email"),
        password: formField("password"),
      });

      signIn(email, password).then((response) => {
        console.log(response);
        if (response.authenticated === true) {
          return (
            typeof window != undefined && (window.location.href = "/dashboard")
          );
        }

        setFormErrors({
          email: ["Invalid email or password!"],
          password: [],
        });
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.flatten().fieldErrors as LoginFormFields);
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
            <span className="text-sm">Login in to</span>
            <h2 className="text-xl font-bold">Smart Automotors</h2>
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
            <InputElement
              type="password"
              name="password"
              label="Password"
              error={formErrors?.password}
            />
            <div className="flex w-full justify-end text-sm text-rose-500">
              <Link href={"/forgot-password"}>Forgot Passowrd?</Link>
            </div>
            <ButtonElement role="submit">Login</ButtonElement>
          </form>
        </div>
      </div>
    </main>
  );
}
