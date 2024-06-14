import { fetchApi } from "@/lib/fetchApi";
import { organizationFormSchema } from "@/types";
import { AsteriskIcon } from "lucide-react";
import {
  FormEvent,
  RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import z, { ZodError } from "zod";
import PlaceholderElement from "../PlaceholderElement";
import { Switch } from "../ui/switch";
import FormField from "./abstracts/FormField";

type OrganizationFieldsToExclude =
  | "orgId"
  | "organizationTypes"
  | "industryTypes";

export type OrganizationFormFields = z.infer<typeof organizationFormSchema>;
type OrganizationFormProps = {
  formTrigger?: RefObject<HTMLButtonElement>;
  organization?: any;
  readOnly?: boolean;
  onSubmit?: (event: {
    success: boolean;
    error?: ZodError;
    data?: OrganizationFormFields;
  }) => void;
};

type OrganizationObject = Partial<
  Omit<OrganizationFormFields, OrganizationFieldsToExclude>
>;

const FormFieldContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full items-start justify-evenly gap-8">
      {children}
    </div>
  );
};

export default function OrganizationForm({
  onSubmit,
  organization,
  readOnly = false,
  formTrigger,
}: OrganizationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [formErrors, setFormErrors] =
    useState<Partial<Record<keyof OrganizationFormFields, string>>>();

  const [organizationTypes, setOrganizationTypes] = useState<
    Array<{ key: string | number; value: string }>
  >([]);
  const [phoneNumberTypes, setPhoneNumberTypes] = useState<
    Array<{ key: string | number; value: string }>
  >([]);

  const [addressTypes, setAddressTypes] = useState<
    Array<{ key: string | number; value: string }>
  >([]);
  const [cities, setCities] = useState<
    Array<{ key: string | number; value: string; dependsOn?: number }>
  >([]);
  const [states, setStates] = useState<
    Array<{ key: string | number; value: string; dependsOn?: number }>
  >([]);
  const [countries, setCountries] = useState<
    Array<{ key: string | number; value: string }>
  >([]);

  const [industyTypes, setIndustryTypes] = useState<
    Array<{ key: string | number; value: string; dependsOn?: number }>
  >([]);

  const [subIndustryTypes, setSubIndustryTypes] = useState<
    Array<{ key: string | number; value: string; dependsOn: any }>
  >([]);

  const [isActive, setIsActive] = useState<boolean>(false);
  const [selectedIndustry, setSelectedIndustry] = useState<number>();
  const [selectedState, setSelectedState] = useState<number>();
  const [selectedCountry, setSelectedCountry] = useState<number>();

  useEffect(
    function () {
      if (!formRef.current) return;
      if (!formTrigger?.current) return;

      formTrigger.current.addEventListener("click", () => {
        if (formRef.current) {
          formRef.current.requestSubmit();
        }
      });
    },
    [formTrigger, formRef],
  );

  useEffect(
    function () {
      if (!organization) {
        return;
      }

      setSelectedIndustry(organization.industryTypeId);
      setSelectedCountry(organization.organizationAddress[0]?.countryId);
      setSelectedState(organization.organizationAddress[0]?.countryStateId);
    },
    [organization],
  );

  const fetchData = function (url: string) {
    return fetchApi(url, {
      credentials: "include",
    });
  };

  useLayoutEffect(function () {
    const fetchLookupValues = async () => {
      const urls = [
        "/api/lookup/organization-types",
        "/api/lookup/industry-types",
        "/api/lookup/address-types",
        "/api/lookup/cities",
        "/api/lookup/states",
        "/api/lookup/countries",
        "/api/lookup/phone-number-types",
      ];

      const [
        organizationTypes,
        industryTypes,
        addressTypes,
        cities,
        states,
        countries,
        phoneNumberTypes,
      ] = await Promise.all(urls.map(fetchData));

      if (organizationTypes?.data?.organizationTypes) {
        setOrganizationTypes(
          organizationTypes.data.organizationTypes.map((orgType: any) => ({
            key: orgType.orgTypeId,
            value: orgType.orgType,
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

      if (industryTypes?.data?.industryTypes) {
        setSubIndustryTypes(
          industryTypes.data.industryTypes.map((ind: any) => ({
            key: ind.industryTypeId,
            value: ind.industryType,
            dependsOn: ind.parentIndustryTypeId,
          })),
        );
      }

      if (addressTypes?.data?.addressTypes) {
        setAddressTypes(
          addressTypes.data.addressTypes.map((address: any) => ({
            key: address.addressTypeId,
            value: address.addressType,
          })),
        );
      }

      if (cities?.data?.cities) {
        setCities(
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
          phoneNumberTypes.data.phoneNumbers.map((phone: any) => ({
            key: phone.phoneNumberTypeId,
            value: phone.phoneNumberType,
          })),
        );
      }
    };

    fetchLookupValues();
  }, []);

  const formSubmitted = (event: FormEvent<HTMLFormElement>) => {
    // Prevent browser form reloading.
    event.preventDefault();
    setFormErrors(undefined);

    const formElement = event.currentTarget.elements;
    const getField = (name: string) =>
      (formElement.namedItem(name) as HTMLInputElement | null)?.value;

    const organizationPayload: OrganizationObject = {
      isActive,
    };

    const formFields: Array<
      Exclude<keyof OrganizationFormFields, OrganizationFieldsToExclude>
    > = [
      "organizationName",
      "orgPrimaryEmailId",
      "orgPOCFirstName",
      "orgPOCMiddleName",
      "orgPOCLastName",
      "orgTypeId",
      "industryTypeId",
      "industrySubTypeId",
      "addressType",
      "addressLine1",
      "addressLine2",
      "addressLine3",
      "country",
      "state",
      "city",
      "phoneNumberType",
      "phoneNumber",
    ];

    formFields.forEach((field) => {
      organizationPayload[field] = getField(field) as any;
    });

    const { success, data, error } =
      organizationFormSchema.safeParse(organizationPayload);

    if (!success) {
      const formErrors: any = {};
      error.issues.map((issue) => {
        formErrors[issue.path[0]] = issue.message.toString();
      });
      setFormErrors(formErrors);
    }

    onSubmit?.({ success, data, error });
  };

  return (
    <form ref={formRef} onSubmit={formSubmitted}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex w-full flex-col gap-6 rounded-[24px] border p-8">
            <h3 className="relative flex justify-between text-[18px] font-bold">
              <span className="flex">
                Organization Details
                <AsteriskIcon className={"text-rose-600"} size={16} />
              </span>

              <div>
                <Switch
                  defaultChecked={organization?.isActive}
                  onCheckedChange={(element) => setIsActive(element)}
                  key={organization?.isActive}
                  className="data-[state=checked]:bg-smawad-accent"
                />
              </div>
            </h3>

            <FormFieldContainer>
              <FormField
                readOnly={readOnly}
                fieldError={formErrors?.organizationName}
                defaultValue={organization?.organizationName}
                name="organizationName"
                label="Organization Name"
              />
              <FormField
                readOnly={readOnly}
                fieldError={formErrors?.orgPrimaryEmailId}
                defaultValue={organization?.orgPrimaryEmailId || undefined}
                name="orgPrimaryEmailId"
                label="Primary Email ID"
              />
              {/* Placeholder form field to occupy some space */}
              <PlaceholderElement />
            </FormFieldContainer>

            <FormFieldContainer>
              <FormField
                name="orgPOCFirstName"
                defaultValue={organization?.orgPOCFirstName || undefined}
                label="Contact First Name"
                readOnly={readOnly}
                fieldError={formErrors?.orgPOCMiddleName}
              />
              <FormField
                defaultValue={organization?.orgPOCMiddleName || undefined}
                name="orgPOCMiddleName"
                label="Contact Middle Name"
                readOnly={readOnly}
                fieldError={formErrors?.orgPOCMiddleName}
              />
              <FormField
                defaultValue={organization?.orgPOCLastName || undefined}
                name="orgPOCLastName"
                required={false}
                label="Contact Last Name"
                readOnly={readOnly}
              />
            </FormFieldContainer>

            <FormFieldContainer>
              <FormField
                selectable
                name="orgTypeId"
                defaultValue={
                  organization?.organizationTypes?.orgTypeId || undefined
                }
                label="Organization Type"
                dataset={organizationTypes}
                readOnly={readOnly}
                fieldError={formErrors?.orgTypeId}
                placeholder="Select Organization Type"
              />

              <FormField
                selectable
                dataset={industyTypes}
                defaultValue={organization?.industryTypeId || undefined}
                name="industryTypeId"
                label="Industry Type"
                placeholder="Select Organization Industry"
                readOnly={readOnly}
                fieldError={formErrors?.industryTypeId}
                onValueChange={(value: string) => setSelectedIndustry(+value)}
              />

              <FormField
                selectable
                dataset={subIndustryTypes}
                name="industrySubTypeId"
                defaultValue={organization?.industrySubTypeId || undefined}
                label="Industry Sub-Type"
                disabled={!selectedIndustry}
                dependsOn={selectedIndustry}
                readOnly={readOnly}
                fieldError={formErrors?.industrySubTypeId}
                placeholder="Select Sub-Industry"
              />
            </FormFieldContainer>
          </div>

          <div className="flex w-full flex-col gap-6 rounded-[24px] border p-8">
            <h3 className="relative flex justify-between text-[18px] font-bold">
              <span className="flex">Contact Details</span>
            </h3>

            <FormFieldContainer>
              <FormField
                selectable
                name="addressType"
                label="Address Type"
                dataset={addressTypes}
                defaultValue={
                  organization?.organizationAddress[0]?.addressTypeId ||
                  undefined
                }
                readOnly={readOnly}
                fieldError={formErrors?.addressType}
                placeholder="Select Address Type"
              />

              {/* Placeholder form field to occupy some space */}
              <PlaceholderElement />
              <PlaceholderElement />
            </FormFieldContainer>

            <FormFieldContainer>
              <FormField
                name="addressLine1"
                label="Address Line1"
                defaultValue={
                  organization?.organizationAddress[0]?.addressLine1 ||
                  undefined
                }
                readOnly={readOnly}
                fieldError={formErrors?.addressLine1}
              />
              <FormField
                name="addressLine2"
                required={false}
                defaultValue={
                  organization?.organizationAddress[0]?.addressLine2 ||
                  undefined
                }
                label="Address Line2"
                readOnly={readOnly}
                fieldError={formErrors?.addressLine2}
              />
              <FormField
                name="addressLine3"
                required={false}
                defaultValue={
                  organization?.organizationAddress[0]?.addressLine3 ||
                  undefined
                }
                label="Address Line3"
                readOnly={readOnly}
                fieldError={formErrors?.addressLine3}
              />
            </FormFieldContainer>

            <FormFieldContainer>
              <FormField
                selectable
                name="country"
                label="Country"
                dataset={countries}
                defaultValue={
                  organization?.organizationAddress[0]?.countryId || undefined
                }
                readOnly={readOnly}
                fieldError={formErrors?.country}
                placeholder="Select Country"
                onValueChange={(value: string) => setSelectedCountry(+value)}
              />
              <FormField
                selectable
                name="state"
                label="State"
                defaultValue={
                  organization?.organizationAddress[0]?.countryStateId ||
                  undefined
                }
                dataset={states}
                readOnly={readOnly}
                fieldError={formErrors?.state}
                disabled={!selectedCountry}
                dependsOn={selectedCountry}
                placeholder="Select State"
                onValueChange={(value: string) => setSelectedState(+value)}
              />
              <FormField
                selectable
                name="city"
                defaultValue={
                  organization?.organizationAddress[0]?.cityId || undefined
                }
                label="City"
                dataset={cities}
                readOnly={readOnly}
                fieldError={formErrors?.city}
                disabled={!selectedState}
                dependsOn={selectedState}
                placeholder="Select City"
              />
            </FormFieldContainer>

            <div className="mt-2">
              <hr />
            </div>

            <FormFieldContainer>
              <FormField
                selectable
                name="phoneNumberType"
                label="Phone Number Type"
                dataset={phoneNumberTypes}
                readOnly={readOnly}
                fieldError={formErrors?.phoneNumberType}
                defaultValue={
                  organization?.organizationPhoneNumber[0]?.phoneNumberTypeId ||
                  undefined
                }
                placeholder="Select Phone Number Type"
              />
              <FormField
                name="phoneNumber"
                label="Phone Number"
                readOnly={readOnly}
                fieldError={formErrors?.phoneNumber}
                defaultValue={
                  organization?.organizationPhoneNumber[0]?.phoneNumber ||
                  undefined
                }
              />

              <PlaceholderElement />
            </FormFieldContainer>
          </div>
        </div>
      </div>
    </form>
  );
}
