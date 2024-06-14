import { cookies } from "next/headers";

export default function getAuthCookie() {
  return `connect.sid=${cookies().get("connect.sid")?.value!};`;
}
