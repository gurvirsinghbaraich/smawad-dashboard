import Dashboard from "@/components/layout/Dashboard";
import { fetchApi } from "@/lib/fetchApi";
import getAuthCookie from "@/lib/getAuthCookie";
import DashboardProvider from "@/providers/DashboardProvider";
import { redirect } from "next/navigation";

export default async function DashboarLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const response = await fetchApi("/api/auth/authenticated-status", {
    headers: {
      Cookie: getAuthCookie(),
    },
  });

  if (
    typeof response?.data === "undefined" ||
    response.data?.status === false
  ) {
    redirect("/api/logout");
  }

  return (
    <DashboardProvider>
      <Dashboard>{children}</Dashboard>
    </DashboardProvider>
  );
}

export const revalidate = 0;
