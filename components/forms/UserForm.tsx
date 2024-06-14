"use client";
import { fetchApi } from "@/lib/fetchApi";
import { AsteriskIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { z } from "zod";
import { FormFieldContainer } from "../FormFieldContainer";
import PlaceholderElement from "../PlaceholderElement";
import { Switch } from "../ui/switch";
import FormField from "./abstracts/FormField";

export default function UserForm({
  readOnly,
  onSubmit,
  user,
  formTrigger,
}: any) {
  const [addressTypes, setAddressTypes] = useState<any[]>([]);
  const [phoneNumberTypes, setPhoneNumberTypes] = useState<any[]>([]);
  const [cities, setCitites] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const pathname = usePathname();

  const [isActive, setIsActive] = useState(user?.isActive);
  const [selectedState, setSelectedState] = useState<number>();
  const [selectedCountry, setSelectedCountry] = useState<number>();

  const ref = useRef<HTMLFormElement>(null);

  async function getDataset() {
    const [addressTypes, cities, states, countries, phoneNumberTypes] =
      await Promise.all([
        fetchApi("/api/lookup/address-types"),
        fetchApi("/api/lookup/cities"),
        fetchApi("/api/lookup/states"),
        fetchApi("/api/lookup/countries"),
        fetchApi("/api/lookup/phone-number-types"),
      ]);

    if (addressTypes?.data?.addressTypes) {
      setAddressTypes(
        addressTypes.data.addressTypes.map((addressType: any) => ({
          key: addressType.addressTypeId,
          value: addressType.addressType,
        })),
      );
    }

    if (cities?.data?.cities) {
      setCitites(
        cities.data.cities.map((city: any) => ({
          key: city.cityId,
          value: city.city,
          dependsOn: city.countryStateId,
        })),
      );
    }

    if (states?.data?.states) {
      setStates(
        states.data.states.map((state: any) => ({
          key: state.countryStateId,
          value: state.countryState,
          dependsOn: state.countryId,
        })),
      );
    }

    if (countries?.data?.countries) {
      setCountries(
        countries.data.countries.map((country: any) => ({
          key: country.countryId,
          value: country.country,
        })),
      );
    }

    if (phoneNumberTypes?.data?.phoneNumbers) {
      setPhoneNumberTypes(
        phoneNumberTypes.data.phoneNumbers.map((number: any) => ({
          key: number.phoneNumberTypeId,
          value: number.phoneNumberType,
        })),
      );
    }
  }

  useLayoutEffect(function () {
    if (!readOnly) getDataset();
  }, []);

  useEffect(
    function () {
      setIsActive(user?.isActive || false);
    },
    [user],
  );

  useEffect(
    function () {
      if (!ref.current) return;
      if (!formTrigger.current) return;

      formTrigger.current.addEventListener("click", () => {
        ref.current?.requestSubmit();
      });
    },
    [formTrigger, ref],
  );

  const handleSumbit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElement = e.currentTarget!.elements!;
    const getField = (name: string) =>
      (formElement.namedItem(name) as HTMLInputElement | null)?.value;

    let payload: any = {
      isActive,
      firstName: getField("firstName"),
      middleName: getField("middleName"),
      lastName: getField("lastName"),
      email: getField("email"),
      addressType: getField("addressType"),
      addressLine1: getField("addressLine1"),
      addressLine2: getField("addressLine2"),
      addressLine3: getField("addressLine3"),
      phoneNumberTypeId: getField("phoneNumberTypeId"),
      phoneNumber: getField("phoneNumber"),
      country: getField("country"),
      state: getField("state"),
      city: getField("city"),
    };

    if (user) {
      payload = {
        ...payload,
        orgPhoneNumberId: user?.userPhoneNumber?.[0]?.userPhoneNumberId,
        orgAddressId: user?.userAddress?.[0]?.userAddressId,
      };
    }

    if (pathname.includes("/users/create")) {
      payload = {
        ...payload,
        password: getField("password"),
      };
    }

    const { data } = z
      .object({
        isActive: z.boolean(),
        firstName: z.string(),
        email: z.string(),
        middleName: z.string(),
        lastName: z.string(),
        addressType: z.coerce.number(),
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        addressLine3: z.string().optional(),
        phoneNumberTypeId: z.coerce.number(),
        phoneNumber: z.string(),
        country: z.coerce.number(),
        state: z.coerce.number(),
        city: z.coerce.number(),
        orgPhoneNumberId: z.number().optional(),
        orgAddressId: z.number().optional(),
        password: z.string().optional(),
      })
      .safeParse(payload);

    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSumbit} action="#" ref={ref}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex w-full flex-col gap-6 rounded-[24px] border p-8">
            <h3 className="relative flex justify-between text-[18px] font-bold">
              <span className="flex">
                User Details
                <AsteriskIcon className={"text-rose-600"} size={16} />
              </span>

              <div>
                <Switch
                  checked={isActive}
                  onClick={() => !readOnly && setIsActive((a: boolean) => !a)}
                  className="data-[state=checked]:bg-smawad-accent"
                />
              </div>
            </h3>

            <FormFieldContainer>
              <FormField
                readOnly={readOnly}
                defaultValue={user?.firstName}
                name="firstName"
                label="User Name"
              />

              <FormField
                readOnly={readOnly}
                defaultValue={user?.middleName}
                name="middleName"
                label="Middle Name"
              />

              <FormField
                name="lastName"
                defaultValue={user?.lastName}
                label="Industry Type"
                readOnly={readOnly}
              />
            </FormFieldContainer>

            <FormFieldContainer>
              <FormField
                name="email"
                defaultValue={user?.email}
                label="Email"
                readOnly={readOnly}
              />

              {pathname.includes("/users/create") && (
                <FormField
                  name="password"
                  label="Password"
                  type="password"
                  readOnly={readOnly}
                />
              )}
            </FormFieldContainer>
          </div>

          <div className="flex w-full flex-col gap-6 rounded-[24px] border p-8">
            <h3 className="relative flex justify-between text-[18px] font-bold">
              <span className="flex">
                Contact Details
                <AsteriskIcon className={"text-rose-600"} size={16} />
              </span>
            </h3>

            <FormFieldContainer>
              <FormField
                label="Address Type"
                name="addressType"
                selectable={!readOnly}
                dataset={addressTypes}
                defaultValue={
                  readOnly
                    ? user?.userAddress?.[0]?.addressType?.addressType
                    : user?.userAddress?.[0]?.addressTypeId
                }
              />
              <PlaceholderElement />
              <PlaceholderElement />
            </FormFieldContainer>

            <FormFieldContainer>
              <FormField
                label="Address Line 1"
                name="addressLine1"
                defaultValue={user?.userAddress?.[0]?.addressLine1}
              />
              <FormField
                required={false}
                label="Address Line 2"
                name="addressLine2"
                defaultValue={user?.userAddress?.[0]?.addressLine2}
              />
              <FormField
                required={false}
                label="Address Line 3"
                name="addressLine3"
                defaultValue={user?.userAddress?.[0]?.addressLine3}
              />
            </FormFieldContainer>

            <FormFieldContainer>
              <FormField
                label="Country"
                name="country"
                selectable={!readOnly}
                dataset={countries}
                defaultValue={
                  readOnly
                    ? user?.userAddress?.[0]?.country?.country
                    : user?.userAddress?.[0]?.countryId
                }
                onValueChange={(value: string) => setSelectedCountry(+value)}
              />
              <FormField
                label="State"
                name="state"
                selectable={!readOnly}
                dataset={states}
                dependsOn={selectedCountry}
                disabled={!selectedCountry}
                defaultValue={
                  readOnly
                    ? user?.userAddress?.[0]?.state?.countryState
                    : user?.userAddress?.[0]?.countryStateId
                }
                onValueChange={(value: string) => setSelectedState(+value)}
              />
              <FormField
                label="City"
                name="city"
                selectable={!readOnly}
                dataset={cities}
                dependsOn={selectedState}
                disabled={!selectedState}
                defaultValue={
                  readOnly
                    ? user?.userAddress?.[0]?.city?.city
                    : user?.userAddress?.[0]?.cityId
                }
              />
            </FormFieldContainer>

            <hr />

            <FormFieldContainer>
              <FormField
                label="Phone Number Type"
                name="phoneNumberTypeId"
                selectable={!readOnly}
                dataset={phoneNumberTypes}
                defaultValue={
                  readOnly
                    ? user?.userPhoneNumber?.[0]?.phoneNumberType
                        ?.phoneNumberType
                    : user?.userPhoneNumber?.[0]?.phoneNumberTypeId
                }
              />
              <FormField
                defaultValue={user?.userPhoneNumber?.[0]?.phoneNumber}
                label="Phone Number"
                name="phoneNumber"
              />
              <PlaceholderElement />
            </FormFieldContainer>
          </div>
        </div>
      </div>
    </form>
  );
}
