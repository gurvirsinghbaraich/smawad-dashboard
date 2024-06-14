import FormField from "@/components/forms/abstracts/FormField";
import { fetchApi } from "@/lib/fetchApi";
import getAuthCookie from "@/lib/getAuthCookie";

export default async function ProfilePage() {
  console.log(getAuthCookie());
  // Getting the details of the user from the backend
  const profile = await fetchApi("/api/users/my-profile", {
    headers: {
      Cookie: getAuthCookie(),
    },
  });

  console.log(profile);

  return (
    <div>
      <div className="mt-8">
        <div className="flex flex-col gap-4">
          <FormField
            readOnly
            label="First Name"
            required={false}
            defaultValue={profile.data.firstName}
          />
          <FormField
            readOnly
            label="Last Name"
            required={false}
            defaultValue={profile.data.lastName}
          />
          <FormField
            readOnly
            label="Email"
            required={false}
            defaultValue={profile.data.email}
          />
        </div>
      </div>
    </div>
  );
}
