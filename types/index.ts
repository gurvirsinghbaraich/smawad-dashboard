import moment from "moment";
import z from "zod";

export const organizationSchema = z.object({
  orgId: z.number().gt(0),
  orgTypeId: z.number().gt(0).nullable(),
  industryTypeId: z.number().gt(0).nullable(),
  industrySubTypeId: z.number().gt(0).nullable(),
  createdBy: z.number().gt(0),
  updatedBy: z.number().gt(0),

  isActive: z.boolean(),

  organizationName: z.string().min(1, "Required"),
  orgPOCFirstName: z.string().nullable(),
  orgPOCMiddleName: z.string().nullable(),
  orgPOCLastName: z.string().nullable(),
  orgPrimaryEmailId: z.string().min(1, "Required").nullable(),

  createdOn: z.custom<string>().transform((value) => moment(value)),
  updatedOn: z.custom<string>().transform((value) => moment(value)),

  organizationTypes: z
    .object({
      orgType: z.string().min(1, "Required"),
      orgTypeId: z.number().gt(0),
    })
    .nullable()
    .optional(),

  industryTypes: z
    .object({
      industryTypeId: z.number().gt(0),
      industryType: z.string().min(1, "Required"),
      parentIndustryTypeId: z.number().gt(0).nullable(),
    })
    .nullable()
    .optional(),
});

export const organizationSchemaExtension = organizationSchema.merge(
  z.object({
    organizationAddress: z.array(
      z.object({
        orgAddressId: z.number(),
        createdBy: z.string(),
        updatedBy: z.string(),
        addressLine1: z.string().nullable().optional(),
        addressLine2: z.string().nullable().optional(),
        addressLine3: z.string().nullable().optional(),
        postalCode: z.string().nullable().optional(),
        isActive: z.boolean(),
        createdOn: z.string(),
        updatedOn: z.string(),
        appOrgId: z.number().nullable().optional(),
        addressTypeId: z.number().nullable().optional(),
        cityId: z.number().nullable().optional(),
        countryStateId: z.number().nullable().optional(),
        countryId: z.number().nullable().optional(),
        addressType: z
          .object({
            addressTypeId: z.number(),
            languageId: z.number(),
            addressType: z.string(),
          })
          .nullable()
          .optional(),
        city: z
          .object({
            cityId: z.number(),
            city: z.string(),
            countryStateId: z.number(),
            languageId: z.number(),
          })
          .nullable()
          .optional(),
        country: z
          .object({
            countryId: z.number(),
            country: z.string(),
            languageId: z.number(),
          })
          .nullable()
          .optional(),
        countryState: z
          .object({
            countryStateId: z.number(),
            countryState: z.string(),
            countryId: z.number(),
            languageId: z.number(),
          })
          .nullable()
          .optional(),
      }),
    ),
    organizationPhoneNumber: z.array(
      z.object({
        orgPhoneNumberId: z.number(),
        phoneNumberTypeId: z.number(),
        phoneNumber: z.string(),
        appOrgId: z.number(),
        phoneNumberType: z.object({
          phoneNumberTypeId: z.number(),
          languageId: z.number(),
          phoneNumberType: z.string(),
        }),
      }),
    ),
  }),
);

export const lookupOrganizationTypes = z.object({
  orgTypeId: z.number(),
  orgType: z.string().min(1, "Required"),
});

export const lookupIndustryTypes = z.object({
  industryTypeId: z.number(),
  parentIndustryTypeId: z.number().nullable(),
  industryType: z.string().min(1, "Required"),
});

export const lookupAddressTypes = z.object({
  addressTypeId: z.number(),
  languageId: z.number(),
  addressType: z.string().min(1, "Required"),
});

export const lookupCity = z.object({
  cityId: z.number(),
  city: z.string().min(1, "Required"),
  countryStateId: z.number(),
  languageId: z.number(),
});

export const lookupState = z.object({
  countryStateId: z.number(),
  countryState: z.string().min(1, "Required"),
  countryId: z.number(),
  languageId: z.number(),
});

export const lookupCountry = z.object({
  countryId: z.number(),
  country: z.string().min(1, "Required"),
  languageId: z.number(),
});

export const lookupPhoneNumberType = z.object({
  phoneNumberTypeId: z.number(),
  languageId: z.number(),
  phoneNumberType: z.string().min(1, "Required"),
});

export const organizationFormSchema = organizationSchema
  .omit({
    orgId: true,
    createdOn: true,
    updatedOn: true,
    createdBy: true,
    updatedBy: true,
    orgTypeId: true,
    industryTypeId: true,
    orgPOCLastName: true,
    orgPOCMiddleName: true,
    orgPOCFirstName: true,
    industrySubTypeId: true,
  })
  .merge(
    z.object({
      orgTypeId: z.coerce
        .number()
        .gt(0, "Please choose one from the available options."),
      industryTypeId: z.coerce
        .number()
        .gt(0, "Please choose one from the available options."),
      industrySubTypeId: z.coerce
        .number()
        .gt(0, "Please choose one from the available options."),

      orgPOCLastName: z.string().min(1, "Required"),
      orgPOCMiddleName: z.string().min(1, "Required"),
      orgPOCFirstName: z.string().min(1, "Required"),

      addressType: z.coerce
        .number()
        .gt(0, "Please choose one from the available options."),
      addressLine1: z.string().min(1, "Required"),
      addressLine2: z.string().optional(),
      addressLine3: z.string().optional(),
      country: z.coerce
        .number()
        .gt(0, "Please choose one from the available options."),
      state: z.coerce
        .number()
        .gt(0, "Please choose one from the available options."),
      city: z.coerce
        .number()
        .gt(0, "Please choose one from the available options."),
      phoneNumberType: z.coerce
        .number()
        .gt(0, "Please choose one from the available options."),
      phoneNumber: z.string().min(1, "Required"),
    }),
  );

export type Organization = Exclude<
  z.infer<typeof organizationSchema>,
  "orgId"
> & {
  orgId: number;
};

export type LookupOrganizationType = z.infer<typeof lookupOrganizationTypes>;
export type LookupIndustryType = z.infer<typeof lookupIndustryTypes>;
export type LookupAddressType = z.infer<typeof lookupAddressTypes>;
export type LookupCity = z.infer<typeof lookupCity>;
export type LookupState = z.infer<typeof lookupState>;
export type LookupCountry = z.infer<typeof lookupCountry>;
export type LookupPhoneNumberType = z.infer<typeof lookupPhoneNumberType>;
