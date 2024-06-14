import { fetchApi } from "@/lib/fetchApi";
import getAuthCookie from "@/lib/getAuthCookie";

export async function serverSignOut() {
  // Destroying the session from the server;
  await fetchApi("/api/auth/logout", {
    method: "PURGE",
    headers: {
      Cookie: getAuthCookie(),
    },
  });
}
