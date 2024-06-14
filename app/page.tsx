import { fetchApi } from "@/lib/fetchApi";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  // Getting the cookie from the session
  const sessionCookie = cookies().get("connect.sid");

  // Validaing the session with the server
  try {
    const {
      data: { status },
    }: any = await fetchApi(
      "/api/auth/authentication-status",
      {},
      {
        headers: {
          Cookie: sessionCookie?.value,
        },
      },
    );

    // Redirecting the user to signin page
    if (status) {
      redirect("/dashboard");
    }
  } catch (e) {}

  return redirect("/signin");
}
