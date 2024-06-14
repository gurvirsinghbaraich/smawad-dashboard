import { deleteCookie } from "@/actions/deleteCookie";
import { serverSignOut } from "@/actions/serverSignOut";
import { redirect } from "next/navigation";

export async function GET() {
  try {
    await serverSignOut();
    await deleteCookie("connect.sid");
  } catch (err) {
  } finally {
    return redirect("/signin");
  }
}
