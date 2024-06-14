"use client";
import { fetchApi } from "@/lib/fetchApi";
import { AsteriskIcon } from "lucide-react";
import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { z } from "zod";
import { FormFieldContainer } from "../FormFieldContainer";
import PlaceholderElement from "../PlaceholderElement";
import { Switch } from "../ui/switch";
import FormField from "./abstracts/FormField";

export default function BranchForm({
  readOnly,
  onSubmit,
  branch,
  formTrigger,
}: any) {
  const [addressTypes, setAddressTypes] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [industryTypes, setIndustryTypes] = useState<any[]>([]);

  const [phoneNumberTypes, setPhoneNumberTypes] = useState<any[]>([]);

  const [cities, setCitites] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  const [isActive, setIsActive] = useState(branch?.isActive);
  const [selectedState, setSelectedState] = useState<number>();
  const [selectedCountry, setSelectedCountry] = useState<number>();

  const ref = useRef<HTMLFormElement>(null);

  async function getDataset() {
    const [
      organizations,
      industryTypes,
      addressTypes,
      cities,
      states,
      countries,
      phoneNumberTypes,
    ] = await Promise.all([
      fetchApi("/api/organizations?all=true"),
      fetchApi("/api/lookup/industry-types"),
      fetchApi("/api/lookup/address-types"),
      fetchApi("/api/lookup/cities"),
      fetchApi("/api/lookup/states"),
      fetchApi("/api/lookup/countries"),
      fetchApi("/api/lookup/phone-number-types"),
    ]);

    if (organizations?.data?.organizations) {
      setOrganizations(
        organizations.data.organizations.map((org: any) => ({
          key: org.orgId,
          value: org.organizationName,
        })),
      );
    }

    if (industryTypes?.data?.industryTypes) {
      setIndustryTypes(
        industryTypes.data.industryTypes.map((ind: any) => ({
          key: ind.industryTypeId,
          value: ind.industryType,
        })),
      );
    }

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
      setIsActive(branch?.isActive || false);
    },
    [branch],
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
      orgBranchName: getField("orgBranchName"),
      organizationName: getField("organizationName"),
      industryType: getField("industryType"),
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

    if (branch) {
      payload = {
        ...payload,
        orgPhoneNumberId:
          branch?.orgBranchPhoneNumber?.[0]?.orgBranchPhoneNumberId,
        orgAddressId: branch?.orgBranchAddress?.[0]?.orgBranchAddressId,
      };
    }

    const { data } = z
      .object({
        isActive: z.boolean(),
        orgBranchName: z.string(),
        organizationName: z.coerce.number(),
        industryType: z.coerce.number(),
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
                Branch Details
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
                defaultValue={branch?.orgBranchName}
                name="orgBranchName"
                label="Branch Name"
              />

              <FormField
                selectable={!readOnly}
                readOnly={readOnly}
                defaultValue={
                  readOnly ? branch?.org?.organizationName : branch?.org?.orgId
                }
                name="organizationName"
                label="Organization Name"
                dataset={organizations}
              />

              <FormField
                selectable={!readOnly}
                dataset={industryTypes}
                name="industryType"
                defaultValue={
                  readOnly
                    ? branch?.industryType?.industryType
                    : branch?.industryType?.industryTypeId
                }
                label="Industry Type"
                readOnly={readOnly}
              />
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
                    ? branch?.orgBranchAddress?.[0]?.addressType?.addressType
                    : branch?.orgBranchAddress?.[0]?.addressTypeId
                }
              />
              <PlaceholderElement />
              <PlaceholderElement />
            </FormFieldContainer>

            <FormFieldContainer>
              <FormField
                label="Address Line 1"
                name="addressLine1"
                defaultValue={branch?.orgBranchAddress?.[0]?.addressLine1}
              />
              <FormField
                required={false}
                label="Address Line 2"
                name="addressLine2"
                defaultValue={branch?.orgBranchAddress?.[0]?.addressLine2}
              />
              <FormField
                required={false}
                label="Address Line 3"
                name="addressLine3"
                defaultValue={branch?.orgBranchAddress?.[0]?.addressLine3}
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
                    ? branch?.orgBranchAddress?.[0]?.country?.country
                    : branch?.orgBranchAddress?.[0]?.countryId
                }
                onValueChange={(value: string) => setSelectedCountry(+value)}
              />
              <FormField
                label="State"
                name="state"
                dependsOn={selectedCountry}
                selectable={!readOnly}
                dataset={states}
                disabled={!selectedCountry}
                defaultValue={
                  readOnly
                    ? branch?.orgBranchAddress?.[0]?.state?.countryState
                    : branch?.orgBranchAddress?.[0]?.countryStateId
                }
                onValueChange={(value: string) => setSelectedState(+value)}
              />
              <FormField
                label="City"
                name="city"
                dependsOn={selectedState}
                selectable={!readOnly}
                dataset={cities}
                disabled={!selectedState}
                defaultValue={
                  readOnly
                    ? branch?.orgBranchAddress?.[0]?.city?.city
                    : branch?.orgBranchAddress?.[0]?.cityId
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
                    ? branch?.orgBranchPhoneNumber?.[0]?.phoneNumberType
                        ?.phoneNumberType
                    : branch?.orgBranchPhoneNumber?.[0]?.phoneNumberTypeId
                }
              />
              <FormField
                defaultValue={branch?.orgBranchPhoneNumber?.phoneNumber}
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
