"use client";

import ActionButton from "@/components/ActionButton";
import ExportButton from "@/components/ExportButton";
import FiltersButton from "@/components/FiltersButton";
import ListingHeader from "@/components/ListingHeader";
import PaginationContainer from "@/components/PaginationContainer";
import QuickPreview from "@/components/QuickPreview";
import TableActions from "@/components/TableActions";
import TableHeading from "@/components/TableHeading";
import { csvToExcel } from "@/components/csvToExcel";
import FormField from "@/components/forms/abstracts/FormField";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { fetchApi } from "@/lib/fetchApi";
import { flatternArray } from "@/lib/flatternObject";
import { handleError } from "@/lib/handleError";
import { cn, unique } from "@/lib/utils";
import {
  AlertStatus,
  useAppendAlertToQueue,
  useSearchValue,
} from "@/providers/DashboardProvider";
import { asBlob, generateCsv, mkConfig } from "export-to-csv";
import { PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useLayoutEffect, useState } from "react";

export default function OrganizationsListPage(props: any) {
  // Getting the router.
  const router = useRouter();

  // Tracking the page on which the user is currenly on.
  const [currentPage, setCurrentPage] = useState<number>(
    isNaN(props.searchParams.page) ? 1 : +props.searchParams.page,
  );

  const [abortController, setAbortController] = useState(new AbortController());

  // Indicator used to know the state of the requested data.
  // Initially true, as the data would be fetched before the
  // first render.
  const [loading, setLoading] = useState<boolean>(true);

  // Organizations array, that would be used to store the organizations
  // returned from the backend server.
  const [organizations, setOrganizations] = useState<any[]>([]);

  // Variable to store the total number of records
  // present in the organizations table.
  const [total, setTotal] = useState<number>();

  // An array to track all the items that have been selected.
  const [selectedOrganizations, setSelectedOrganizations] = useState<any[]>([]);

  // Getting the value inside the search bar.
  const searchValue = useSearchValue();

  // Getting access to the toast queue.
  const appendAlertToQueue = useAppendAlertToQueue();

  // Getting the current URL of the page.
  const pathname = usePathname();

  // Keeping the track, around which column
  // the records are sorted
  const [sortingColumn, setSortingColumn] = useState<number>();

  // Keeping the track of the sorting direction
  const [sortingOrder, setSoringOrder] = useState<"asc" | "desc">("asc");

  // Filters
  const [filters, setFilters] = useState<Record<string, Array<any>>>({});
  const [filtersApplied, setFiltersApplied] = useState<
    Record<string, Array<any>>
  >({});
  const [filtersDataset, setFiltersDataset] = useState<
    Record<string, Array<any>>
  >({});

  // Boolean value to control the quick preview container
  const [quickPreviewOpen, setQuickPreviewOpen] = useState<boolean>(false);
  const [selectedOrganization, setSelectedOrganization] = useState<any>();

  // Boolean value to control the delete action
  const [isDeletingOrganization, setIsDeletingOrganization] =
    useState<boolean>(false);

  // Helper function to fetch the organizations from the
  // backend server
  const fetchOrganizations = handleError(async function (abortController) {
    // Indication that the records are being fetched.
    setLoading(true);

    // Query that would we sent with the response
    const requestQuery = new URLSearchParams();
    requestQuery.set("page", currentPage.toString());

    // If the value of search is not null
    // add the search to the query
    if (searchValue) {
      requestQuery.set("search", searchValue);
    }

    if (sortingOrder && sortingColumn != null) {
      let fieldName = "ordId";

      switch (sortingColumn) {
        case 0: {
          fieldName = "organizationName";
          break;
        }

        case 1: {
          fieldName = "orgPrimaryEmailId";
          break;
        }

        case 2: {
          fieldName = "organizationType";
          break;
        }

        case 3: {
          fieldName = "industryType";
          break;
        }
      }

      requestQuery.set("order", sortingOrder);
      requestQuery.set("orderBy", fieldName);
    }

    if (Object.keys(filters).length > 0) {
      requestQuery.set("filters", JSON.stringify(filters));
    }

    // Constructing an URL that points to organizations endpoint.
    const organizationsEndpoint =
      "/api/organizations?" + requestQuery.toString();

    // Sending the request to the backend server
    const response = await fetchApi(organizationsEndpoint, {
      credentials: "include",
      signal: abortController.signal,
    });

    // If the server has returned the valid response
    // the data property contain the organizations
    // and the total count for organizations.
    if (response?.data) {
      setFiltersApplied(filters);

      if (
        Array.isArray(response.data?.organizations) &&
        response.data.organizations.length == 0
      ) {
        setTotal(0);
        setOrganizations([]);
      }

      if (response.data?.organizations && response.data?.count) {
        setTotal(Number(response.data.count));
        setOrganizations(response.data.organizations);

        // Indication that the records have been loaded
        setLoading(false);
      }
    } else {
      // Unable to get the records from the server.
      appendAlertToQueue(
        "Unable to fetch the organizations from the server. Please try again later.",
        AlertStatus.Error,
      );
    }
  });

  // Helper function to update the sorting based on the rules below.
  // Rule #1: If the user clicked on the same column the toggle sorting order.
  // Rule #2: Change the column, if the user clicked on a different column.
  function changeSortingColumn(column: number) {
    return () => {
      // Checking if the user clicked the same column.
      if (column === sortingColumn) {
        setSoringOrder((order) => (order === "asc" ? "desc" : "asc"));
      } else {
        setSortingColumn(column);
        setSoringOrder("asc");
      }
    };
  }

  const fetchFilters = async function () {
    const response = await fetchApi("/api/filters/organizations");

    if (
      response?.data?.organizations &&
      response?.data?.organizationTypes &&
      response?.data?.industryTypes
    ) {
      setFiltersDataset(response.data);
    }
  };

  useLayoutEffect(function () {
    fetchFilters();
  }, []);

  useEffect(
    function () {
      setCurrentPage(1);
    },
    [sortingColumn, sortingOrder],
  );

  // Before the first render of the component
  // Send the request to the backend for data.
  useLayoutEffect(
    function () {
      // Making sure this code only runs on the client.
      if (typeof window !== "undefined") {
        // Getting the search params that have been already
        // applied
        const appliedSearchParams = new URL(window.location.href).searchParams;

        // Modifiying the value of the page, as the
        // page has changed.
        appliedSearchParams.set("page", currentPage.toString());

        // Replacing the URL in the browser.
        router.replace(
          new URL(pathname, window.location.href).toString() +
            "?" +
            appliedSearchParams.toString(),
        );
      }

      abortController.abort();

      let controller = new AbortController();
      setAbortController(controller);
      fetchOrganizations(controller);
    },
    [currentPage, searchValue, sortingOrder, sortingColumn],
  );

  // Function responsible for exporting the organizations in .csv format
  const getDataToExport = async function () {
    const searchParams = new URLSearchParams();

    // If the user has filter some data with search
    // the exported data should also comply to those
    // filters.
    if (searchValue) {
      searchParams.set("search", searchValue);
    }

    const response = await fetchApi(
      "/api/organizations?" + searchParams.toString(),
      {
        credentials: "include",
      },
    );

    // If the server returned a response
    if (response?.data?.organizations) {
      return flatternArray(response.data.organizations).map((org) => {
        delete org.createdBy;
        delete org.updatedBy;

        return org;
      });
    }

    // Otherwise notify the user some error has occured.
    else {
      appendAlertToQueue(
        "Unable to export the organizations for the moment, please try again later!",
        AlertStatus.Error,
      );
    }

    return null;
  };

  // Funciton responsible to export the data into CSV file.
  const toCSV = async function () {
    const data = await getDataToExport();

    if (data) {
      const csvConfig = mkConfig({
        useKeysAsHeaders: true,
      });

      const blob = asBlob(csvConfig)(generateCsv(csvConfig)(data));
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.setAttribute(
        "download",
        (prompt("Please enter the name for the .csv file: ") ||
          "default_filename") + ".csv",
      );
      a.click();
    }
  };

  // Function responsible to export data into excel format.
  const toExcel = async function () {
    const data = await getDataToExport();

    if (data) {
      // Creating a csv config
      const csvConfig = mkConfig({
        useKeysAsHeaders: true,
      });

      // Converting the csv to array buffer.
      const arrayBuffer = await asBlob(csvConfig)(
        generateCsv(csvConfig)(data),
      ).arrayBuffer();

      // Converting ArrayBuffer to Buffer
      const buffer = Buffer.from(arrayBuffer);

      // Getting the contents of the csv file.
      const csvFileContents = buffer.toString();

      // Creating an excel buffer and
      // converting it to a blob .
      const excelBuffer = csvToExcel(csvFileContents);
      const blob = new Blob([excelBuffer]);

      const defaultFilename = `organizations${searchValue ? "_" + searchValue : ""}`;

      // Downloading the file.
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download =
        (prompt("Please enter name for .xlsx file:") || defaultFilename) +
        ".xlsx";
      a.click();
    }
  };

  // Helper function that is responsible for
  // deleting a single organization
  const deleteOrganization = async function () {
    if (isDeletingOrganization && selectedOrganization) {
      setIsDeletingOrganization(false);
      appendAlertToQueue(`Deleting ${selectedOrganization.organizationName}`);

      const request = await fetchApi(
        "/api/organizations/delete",
        {},
        { orgId: selectedOrganization.orgId },
      );

      if (request?.status === "OK") {
        setOrganizations((organizations) =>
          organizations.map((organization) => {
            if (organization.orgId === selectedOrganization.orgId) {
              return {
                ...organization,
                isActive: false,
              };
            }

            return organization;
          }),
        );
        appendAlertToQueue(
          `Organization (${selectedOrganization.organizationName}) has been deleted.`,
          AlertStatus.Success,
        );
      } else {
        appendAlertToQueue(
          "Failed, please try again later.",
          AlertStatus.Error,
        );
      }
    }
  };

  // Helper function that is responsible for
  // deleting a multiple organization
  const deleteOrganizations = async function () {
    if (isDeletingOrganization && selectedOrganizations.length > 0) {
      setIsDeletingOrganization(false);
      appendAlertToQueue(
        `Deleting ${selectedOrganizations.length} organization${selectedOrganizations.length === 1 ? "" : "es"}`,
      );

      const request = await fetchApi(
        "/api/organizations/bulk-delete",
        {},
        {
          organizations: selectedOrganizations,
        },
      );

      if (request?.status === "OK") {
        let organizationsCopy = [...organizations];

        selectedOrganizations.map((organization) => {
          organizationsCopy = organizationsCopy.map((b) => {
            if (organization.orgId === b.orgId) {
              return {
                ...b,
                isActive: false,
              };
            }

            return b;
          });
        });

        appendAlertToQueue(
          `Organization${selectedOrganizations.length === 1 ? " has " : "es have "} been deleted.`,
          AlertStatus.Success,
        );

        setOrganizations(organizationsCopy);
        setSelectedOrganizations([]);
      } else {
        appendAlertToQueue(
          "Failed, please try again later.",
          AlertStatus.Error,
        );
      }
    }
  };

  // A funciton to cancel the delete actions
  const cancelDeleteAction = () => {
    setIsDeletingOrganization(false);
    setSelectedOrganization(undefined);
  };

  // Function responisble for definined the
  // behaviour of bulk selection.
  const updateSelectedOrganizations = (orgId: number) => (status: boolean) => {
    const bulkOrganizationsCopy = [...selectedOrganizations];

    if (!status) {
      // Remove the organization from the selection.
      setSelectedOrganizations(
        bulkOrganizationsCopy.filter(
          (organization) => organization.orgId !== orgId,
        ),
      );
      return;
    }

    bulkOrganizationsCopy.push({ orgId });
    setSelectedOrganizations(bulkOrganizationsCopy);
  };

  const bulkDeletion = function () {
    setIsDeletingOrganization(true);
  };

  const updateFilters =
    (key: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const filtersCopy = filters;
      let filtersKeyCopy = filters[key] ?? [];

      if (event.currentTarget.checked) {
        filtersKeyCopy.push(event.currentTarget.getAttribute("data-value"));
      } else {
        filtersKeyCopy = filtersKeyCopy.filter(
          (value) => value != event.currentTarget.getAttribute("data-value"),
        );
      }

      filtersCopy[key] = filtersKeyCopy;
      setFilters(filtersCopy);
    };

  const onSave = function () {
    let controller = new AbortController();
    setAbortController(controller);
    fetchOrganizations(controller);
  };

  // Displaying the table in the browser
  return (
    <section className="grid h-full max-h-[calc(100vh_-_0px)] grid-cols-1 grid-rows-[90px_1fr_48px] overflow-hidden">
      <ListingHeader title="Organization Details">
        {/* Button to delete organizations in bulk. */}
        <div
          className={cn(
            selectedOrganizations.length == 0
              ? "pointer-events-none"
              : "inherit",
          )}
        >
          <ActionButton
            disabled={selectedOrganizations.length == 0}
            actionButton
            icon={<Trash2Icon />}
            title="Delete Organizations"
            className={cn("bg-red-500 disabled:bg-red-400/80")}
            onClick={bulkDeletion}
          />
        </div>

        <hr />

        {/* Button to trigger export action */}
        <ExportButton toCSV={toCSV} toExcel={toExcel} />

        {/* Filters section */}
        <FiltersButton
          onSave={onSave}
          applied={
            Object.values(filtersApplied).filter((v) => v.length > 0).length
          }
        >
          <Accordion type="single" collapsible className="mx-2 mb-2 w-[280px]">
            <AccordionItem value="organization-name">
              <AccordionTrigger>
                Organization Names{" "}
                {filtersApplied?.organizationName?.length > 0 && (
                  <>({filtersApplied?.organizationName?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {unique(
                  filtersDataset.organizations?.map(
                    ({ organizationName }) => organizationName,
                  ),
                ).map((name, index) => (
                  <div className="flex gap-2 p-1" key={index + name}>
                    <input
                      type="checkbox"
                      data-value={name}
                      onChange={updateFilters("organizationName")}
                      defaultChecked={filters?.organizationName?.includes(name)}
                    />
                    {name}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="organization-email">
              <AccordionTrigger>
                Emails{" "}
                {filtersApplied?.orgPrimaryEmailId?.length > 0 && (
                  <>({filtersApplied?.orgPrimaryEmailId?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {unique(
                  filtersDataset.organizations?.map(
                    ({ orgPrimaryEmailId }) => orgPrimaryEmailId,
                  ),
                ).map((email, index) => (
                  <div className="flex gap-2 p-1" key={index + email}>
                    <input
                      type="checkbox"
                      data-value={email}
                      defaultChecked={filters?.orgPrimaryEmailId?.includes(
                        email,
                      )}
                      onChange={updateFilters("orgPrimaryEmailId")}
                    />
                    {email}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="organization-first-name">
              <AccordionTrigger>
                First Name{" "}
                {filtersApplied?.firstName?.length > 0 && (
                  <>({filtersApplied?.firstName?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {unique(
                  filtersDataset.organizations?.map(
                    ({ orgPOCFirstName }) => orgPOCFirstName,
                  ),
                ).map((name, index) => (
                  <div className="flex gap-2 p-1" key={index + name}>
                    <input
                      type="checkbox"
                      data-value={name}
                      defaultChecked={filters?.firstName?.includes(name)}
                      onChange={updateFilters("firstName")}
                    />
                    {name}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="organization-last-name">
              <AccordionTrigger>
                Last Name{" "}
                {filtersApplied?.lastName?.length > 0 && (
                  <>({filtersApplied?.lastName?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {unique(
                  filtersDataset.organizations?.map(
                    ({ orgPOCLastName }) => orgPOCLastName,
                  ),
                ).map((name, index) => (
                  <div className="flex gap-2 p-1" key={index + name}>
                    <input
                      type="checkbox"
                      data-value={name}
                      defaultChecked={filters?.lastName?.includes(name)}
                      onChange={updateFilters("lastName")}
                    />
                    {name}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="organization-types">
              <AccordionTrigger>
                Organization Types{" "}
                {filtersApplied?.organizationType?.length > 0 && (
                  <>({filtersApplied?.organizationType?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {filtersDataset.organizationTypes?.map(
                  (organizationType, index) => (
                    <div key={index} className="flex gap-2 p-1">
                      <input
                        type="checkbox"
                        defaultChecked={filters?.organizationType?.includes(
                          organizationType,
                        )}
                        data-value={organizationType.orgType}
                        onChange={updateFilters("organizationType")}
                      />
                      {organizationType.orgType}
                    </div>
                  ),
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="industry-types">
              <AccordionTrigger>
                Industry Types{" "}
                {filtersApplied?.industryType?.length > 0 && (
                  <>({filtersApplied?.industryType?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {filtersDataset.industryTypes?.map((industryType, index) => (
                  <div key={index} className="flex gap-2 p-1">
                    <input
                      type="checkbox"
                      defaultChecked={filters?.industryType?.includes(
                        industryType,
                      )}
                      data-value={industryType.industryType}
                      onChange={updateFilters("industryType")}
                    />
                    {industryType.industryType}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </FiltersButton>

        {/* Action button to create a new organization */}
        <ActionButton
          href={"/dashboard/organizations/create"}
          icon={<PlusIcon />}
          title="Create Organization"
          actionButton
        />
      </ListingHeader>

      {/* Rendering the actual table */}
      <div className="overflow-auto overflow-x-hidden">
        <table className="w-full">
          <thead className="bg-smawad-gray">
            <tr>
              <th>
                <div className="data-cell-wrapper">
                  <Checkbox />
                </div>
              </th>

              <TableHeading
                title="Organization Name"
                activeAt={0}
                setColumn={changeSortingColumn(0)}
                sortingOrder={sortingOrder}
                status={sortingColumn}
              />

              <TableHeading
                title="Email Id"
                activeAt={1}
                setColumn={changeSortingColumn(1)}
                sortingOrder={sortingOrder}
                status={sortingColumn}
              />

              <TableHeading
                title="Organization Type"
                activeAt={2}
                setColumn={changeSortingColumn(2)}
                sortingOrder={sortingOrder}
                status={sortingColumn}
              />

              <TableHeading
                title="Industry Type"
                activeAt={3}
                setColumn={changeSortingColumn(3)}
                sortingOrder={sortingOrder}
                status={sortingColumn}
              />

              <th>Active?</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td>
                  <div className="data-cell-wrapper">
                    <Checkbox />
                  </div>
                </td>
                <td>
                  {total == 0 ? "No Records Found..." : "Loading Records..."}
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ) : (
              organizations.map((organization) => (
                <tr key={organization.orgId}>
                  <td>
                    <div className="data-cell-wrapper">
                      <Checkbox
                        data-state={
                          !!selectedOrganizations.find(
                            (b) => b.orgId === organization.orgId,
                          )
                            ? "checked"
                            : "unchecked"
                        }
                        checked={
                          !!selectedOrganizations.find(
                            (b) => b.orgId === organization.orgId,
                          )
                        }
                        onCheckedChange={updateSelectedOrganizations(
                          organization.orgId,
                        )}
                      />
                    </div>
                  </td>
                  <td>{organization.organizationName}</td>
                  <td>{organization.orgPrimaryEmailId}</td>
                  <td>{organization.organizationTypes?.orgType}</td>
                  <td>{organization.industryTypes?.industryType}</td>
                  <td>
                    <div className="data-cell-wrapper">
                      <Switch
                        className="pointer-events-none"
                        checked={organization.isActive}
                      />
                    </div>
                  </td>
                  <td>
                    <TableActions
                      onView={() => {
                        setSelectedOrganization(organization);
                        setQuickPreviewOpen(true);
                      }}
                      updateLink={
                        "/dashboard/organizations/update/" + organization.orgId
                      }
                      onDelete={() => {
                        if (!organization.isActive) {
                          return appendAlertToQueue(
                            "The organization has already been deleted!",
                            AlertStatus.Warning,
                          );
                        }
                        setSelectedOrganization(organization);
                        setIsDeletingOrganization(true);
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rendering pagination container under the table */}
      <PaginationContainer
        total={total}
        loading={loading}
        currentPage={currentPage}
        setPage={setCurrentPage}
      />

      {/* Rendering the quick preview container */}
      <QuickPreview
        open={quickPreviewOpen}
        title={"Organization Details"}
        onClose={() => setQuickPreviewOpen(false)}
      >
        {selectedOrganization && (
          <div className="flex flex-col gap-3">
            <FormField
              disabled
              readOnly
              label="Organization Name"
              defaultValue={selectedOrganization.organizationName}
            />
            <FormField
              defaultValue={selectedOrganization.orgPrimaryEmailId}
              disabled
              readOnly
              label="Primary Email Id"
            />
            <FormField
              disabled
              readOnly
              label="Organization Type"
              defaultValue={selectedOrganization.organizationTypes?.orgType}
            />
            <FormField
              disabled
              readOnly
              label="Industry Type"
              defaultValue={selectedOrganization.industryTypes?.industryType}
            />
            <Link
              className="w-full"
              href={
                "/dashboard/organizations/view/" + selectedOrganization.orgId
              }
            >
              <ActionButton
                actionButton
                icon={<></>}
                className="w-full"
                title="View Detailed Organization"
              />
            </Link>
          </div>
        )}
      </QuickPreview>

      {/* Delete confirmation */}
      <Dialog
        open={
          isDeletingOrganization &&
          (!!selectedOrganization || selectedOrganizations.length > 0)
        }
        onOpenChange={cancelDeleteAction}
      >
        <DialogContent>
          <DialogTitle>
            Deleting{" "}
            {selectedOrganization
              ? selectedOrganization.organizationName
              : selectedOrganizations.length +
                " organization" +
                (selectedOrganizations.length == 1 ? "" : "es")}
          </DialogTitle>

          <DialogDescription>
            Please confirm that you want to delete{" "}
            {selectedOrganization
              ? selectedOrganization.organizationName + " organization"
              : "organization" +
                (selectedOrganizations.length == 1 ? "" : "es")}
            , this action is permanent and cannot be reversed
          </DialogDescription>

          <div className="mt-4 flex items-center justify-end gap-3">
            <ActionButton onClick={cancelDeleteAction} title="Cancel" />
            <ActionButton
              title={
                "Delete " +
                (selectedOrganization ? "organization" : "organizations")
              }
              onClick={
                selectedOrganization ? deleteOrganization : deleteOrganizations
              }
              actionButton
              className="bg-red-500"
            />{" "}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
