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

export default function BranchesListPage(props: any) {
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

  // Branches array, that would be used to store the branches
  // returned from the backend server.
  const [branches, setBranches] = useState<any[]>([]);

  // Variable to store the total number of records
  // present in the branches table.
  const [total, setTotal] = useState<number>();

  // An array to track all the items that have been selected.
  const [selectedBranches, setSelectedBranches] = useState<any[]>([]);

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
  const [selectedBranch, setSelectedBranch] = useState<any>();

  // Boolean value to control the delete action
  const [isDeletingBranch, setIsDeletingBranch] = useState<boolean>(false);

  // Helper function to fetch the branches from the
  // backend server
  const fetchBranches = handleError(async function (abortController) {
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
      let fieldName = "orgBranchId";

      switch (sortingColumn) {
        case 0: {
          fieldName = "orgBranchName";
          break;
        }

        case 1: {
          fieldName = "organizationName";
          break;
        }

        case 2: {
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

    // Constructing an URL that points to branches endpoint.
    const branchesEndpoint = "/api/branches?" + requestQuery.toString();

    // Sending the request to the backend server
    const response = await fetchApi(branchesEndpoint, {
      credentials: "include",
      signal: abortController.signal,
    });

    // If the server has returned the valid response
    // the data property contain the branches
    // and the total count for branches.
    if (response?.data) {
      setFiltersApplied(filters);

      console.log(response.data);

      if (
        Array.isArray(response.data?.orgBranches) &&
        response.data?.orgBranches.length <= 0
      ) {
        setTotal(0);
        setBranches([]);
      } else if (response.data?.orgBranches && response.data?.count) {
        setTotal(Number(response.data.count));
        setBranches(response.data.orgBranches);

        // Indication that the records have been loaded
        setLoading(false);
      }
    } else {
      // Unable to get the records from the server.
      appendAlertToQueue(
        "Unable to fetch the branches from the server. Please try again later.",
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
    const response = await fetchApi("/api/filters/branches");

    if (response?.data?.branches) {
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
      fetchBranches(controller);
    },
    [currentPage, searchValue, sortingOrder, sortingColumn],
  );

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
    fetchBranches(controller);
  };

  // Function responsible for exporting the branches in .csv format
  const getDataToExport = async function () {
    const searchParams = new URLSearchParams();

    // If the user has filter some data with search
    // the exported data should also comply to those
    // filters.
    if (searchValue) {
      searchParams.set("search", searchValue);
    }

    const response = await fetchApi(
      "/api/branches?" + searchParams.toString(),
      {
        credentials: "include",
      },
    );

    // If the server returned a response
    if (response?.data?.orgBranches) {
      return flatternArray(response.data.orgBranches).map((branch) => {
        delete branch.createdBy;
        delete branch.updatedBy;

        return branch;
      });
    }

    // Otherwise notify the user some error has occured.
    else {
      appendAlertToQueue(
        "Unable to export the branches for the moment, please try again later!",
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

      // Downloading the file.
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const defaultFilename = `branches${searchValue ? "_" + searchValue : ""}.xlsx`;
      a.download =
        (prompt("Please enter name for .xlsx file:") || defaultFilename) +
        ".xlsx";
      a.click();
    }
  };

  // Helper function that is responsible for
  // deleting a single branch
  const deleteBranch = async function () {
    if (isDeletingBranch && selectedBranch) {
      setIsDeletingBranch(false);
      appendAlertToQueue(`Deleting ${selectedBranch.orgBranchName}`);

      const request = await fetchApi(
        "/api/branches/delete",
        {},
        { orgBranchId: selectedBranch.orgBranchId },
      );

      if (request?.status === "OK") {
        setBranches((branches) =>
          branches.map((branch) => {
            if (branch.orgBranchId === selectedBranch.orgBranchId) {
              return {
                ...branch,
                isActive: false,
              };
            }

            return branch;
          }),
        );
        appendAlertToQueue(
          `Branch (${selectedBranch.orgBranchName}) has been deleted.`,
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
  // deleting a multiple branch
  const deleteBranchs = async function () {
    if (isDeletingBranch && selectedBranches.length > 0) {
      setIsDeletingBranch(false);
      appendAlertToQueue(
        `Deleting ${selectedBranches.length} branch${selectedBranches.length === 1 ? "" : "es"}`,
      );

      const request = await fetchApi(
        "/api/branches/bulk-delete",
        {},
        {
          orgBranchs: selectedBranches,
        },
      );

      if (request?.status === "OK") {
        if (request?.status === "OK") {
          let branchesCopy = [...branches];

          selectedBranches.map((branch) => {
            branchesCopy = branchesCopy.map((b) => {
              if (branch.orgBranchId === b.orgBranchId) {
                return {
                  ...b,
                  isActive: false,
                };
              }

              return b;
            });
          });

          appendAlertToQueue(
            `Branch${selectedBranches.length === 1 ? " has " : "es have "} been deleted.`,
            AlertStatus.Success,
          );

          setBranches(branchesCopy);
          setSelectedBranches([]);
        } else {
          appendAlertToQueue(
            "Failed, please try again later.",
            AlertStatus.Error,
          );
        }
      }
    }
  };

  // A funciton to cancel the delete actions
  const cancelDeleteAction = () => {
    setIsDeletingBranch(false);
    setSelectedBranch(undefined);
  };

  // Function responisble for definined the
  // behaviour of bulk selection.
  const updateSelectedBranches = (orgBranchId: number) => (status: boolean) => {
    const bulkBranchesCopy = [...selectedBranches];

    if (!status) {
      // Remove the branch from the selection.
      setSelectedBranches(
        bulkBranchesCopy.filter((branch) => branch.orgBranchId !== orgBranchId),
      );
      return;
    }

    bulkBranchesCopy.push({ orgBranchId });
    setSelectedBranches(bulkBranchesCopy);
  };

  const bulkDeletion = function () {
    setIsDeletingBranch(true);
  };

  // Displaying the table in the browser
  return (
    <section className="grid h-full max-h-[calc(100vh_-_0px)] grid-cols-1 grid-rows-[90px_1fr_48px] overflow-hidden">
      <ListingHeader title="Branch Details">
        {/* Button to delete branches in bulk. */}
        <div
          className={cn(
            selectedBranches.length === 0 ? "pointer-events-none" : "inherit",
          )}
        >
          <ActionButton
            actionButton
            disabled={selectedBranches.length == 0}
            icon={<Trash2Icon />}
            title="Delete Branches"
            className={cn("bg-red-500 disabled:bg-red-300")}
            onClick={bulkDeletion}
          />
        </div>

        <hr />

        {/* Button to trigger export action */}
        <ExportButton toCSV={toCSV} toExcel={toExcel} />

        <FiltersButton
          applied={
            Object.values(filtersApplied).filter((v) => v.length > 0).length
          }
          onSave={onSave}
        >
          <Accordion type="single" collapsible className="mx-2 mb-2 w-[290px]">
            <AccordionItem value="branch-name">
              <AccordionTrigger>
                Branch Names{" "}
                {filtersApplied?.branchName?.length > 0 && (
                  <>({filtersApplied?.branchName?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {unique(
                  filtersDataset.branches?.map(
                    ({ orgBranchName }) => orgBranchName,
                  ),
                ).map((name, index) => (
                  <div className="flex gap-2 p-1" key={index + name}>
                    <input
                      type="checkbox"
                      data-value={name}
                      defaultChecked={filtersApplied?.branchName?.includes(
                        name,
                      )}
                      onChange={updateFilters("branchName")}
                    />
                    {name}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="organization-name">
              <AccordionTrigger>
                Organization Names{" "}
                {filtersApplied?.organizationName?.length > 0 && (
                  <>({filtersApplied?.organizationName?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {unique(
                  filtersDataset.branches?.map(
                    ({ org }) => org?.organizationName,
                  ),
                ).map((name, index) => (
                  <div className="flex gap-2 p-1" key={index + name}>
                    <input
                      type="checkbox"
                      data-value={name}
                      defaultChecked={filtersApplied?.organizationName?.includes(
                        name,
                      )}
                      onChange={updateFilters("organizationName")}
                    />
                    {name}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="branch-type">
              <AccordionTrigger>
                Branch Type{" "}
                {filtersApplied?.branchType?.length > 0 && (
                  <>({filtersApplied?.branchType?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {unique(
                  filtersDataset.branches?.map(
                    ({ industryType }) => industryType?.industryType,
                  ),
                ).map((name, index) => (
                  <div className="flex gap-2 p-1" key={index + name}>
                    <input
                      type="checkbox"
                      data-value={name}
                      defaultChecked={filtersApplied?.branchType?.includes(
                        name,
                      )}
                      onChange={updateFilters("branchType")}
                    />
                    {name}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </FiltersButton>

        {/* Action button to create a new branch */}
        <ActionButton
          href={"/dashboard/branches/create"}
          icon={<PlusIcon />}
          title="Create Branch"
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
                title="Branch Name"
                activeAt={0}
                setColumn={changeSortingColumn(0)}
                sortingOrder={sortingOrder}
                status={sortingColumn}
              />

              <TableHeading
                title="Organization Name"
                activeAt={1}
                setColumn={changeSortingColumn(1)}
                sortingOrder={sortingOrder}
                status={sortingColumn}
              />

              <TableHeading
                title="Industry Type"
                activeAt={2}
                setColumn={changeSortingColumn(2)}
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
              branches.map((branch) => (
                <tr key={branch.orgBranchId}>
                  <td>
                    <div className="data-cell-wrapper">
                      <Checkbox
                        data-state={
                          !!selectedBranches.find(
                            (b) => b.orgBranchId === branch.orgBranchId,
                          )
                            ? "checked"
                            : "unchecked"
                        }
                        checked={
                          !!selectedBranches.find(
                            (b) => b.orgBranchId === branch.orgBranchId,
                          )
                        }
                        onCheckedChange={updateSelectedBranches(
                          branch.orgBranchId,
                        )}
                      />
                    </div>
                  </td>
                  <td>{branch.orgBranchName}</td>
                  <td>{branch.org.organizationName}</td>
                  <td>{branch.industryType.industryType}</td>
                  <td>
                    <div className="data-cell-wrapper">
                      <Switch checked={branch.isActive} />
                    </div>
                  </td>
                  <td>
                    <TableActions
                      onView={() => {
                        setSelectedBranch(branch);
                        setQuickPreviewOpen(true);
                      }}
                      updateLink={
                        "/dashboard/branches/update/" + branch.orgBranchId
                      }
                      onDelete={() => {
                        if (!branch.isActive) {
                          return appendAlertToQueue(
                            "The branch has already been deleted!",
                            AlertStatus.Warning,
                          );
                        }
                        setSelectedBranch(branch);
                        setIsDeletingBranch(true);
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
        title={"Branch Details"}
        onClose={() => setQuickPreviewOpen(false)}
      >
        {selectedBranch && (
          <div className="flex flex-col gap-3">
            <FormField
              disabled
              readOnly
              label="Branch Name"
              defaultValue={selectedBranch.orgBranchName}
            />
            <FormField
              disabled
              readOnly
              label="Organization Name"
              defaultValue={selectedBranch.org.organizationName}
            />
            <FormField
              disabled
              readOnly
              label="Industry Type"
              defaultValue={selectedBranch.industryType.industryType}
            />
            <Link
              className="w-full"
              href={"/dashboard/branches/view/" + selectedBranch.orgBranchId}
            >
              <ActionButton
                actionButton
                icon={<></>}
                className="w-full"
                title="View Detailed Branch"
              />
            </Link>
          </div>
        )}
      </QuickPreview>

      {/* Delete confirmation */}
      <Dialog
        open={
          isDeletingBranch && (!!selectedBranch || selectedBranches.length > 0)
        }
        onOpenChange={cancelDeleteAction}
      >
        <DialogContent>
          <DialogTitle>
            Deleting{" "}
            {selectedBranch
              ? selectedBranch.orgBranchName
              : selectedBranches.length +
                " branch" +
                (selectedBranches.length == 1 ? "" : "es")}
          </DialogTitle>

          <DialogDescription>
            Please confirm that you want to delete{" "}
            {selectedBranch
              ? selectedBranch.orgBranchName + " branch"
              : "branch" + (selectedBranches.length == 1 ? "" : "es")}
            , this action is permanent and cannot be reversed
          </DialogDescription>

          <div className="mt-4 flex items-center justify-end gap-3">
            <ActionButton onClick={cancelDeleteAction} title="Cancel" />
            <ActionButton
              title={"Delete " + (selectedBranch ? "branch" : "branches")}
              onClick={selectedBranch ? deleteBranch : deleteBranchs}
              actionButton
              className="bg-red-500"
            />{" "}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
