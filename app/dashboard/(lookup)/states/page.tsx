"use client";

import ActionButton from "@/components/ActionButton";
import ExportButton from "@/components/ExportButton";
import ListingHeader from "@/components/ListingHeader";
import PaginationContainer from "@/components/PaginationContainer";
import QuickPreview from "@/components/QuickPreview";
import TableActions from "@/components/TableActions";
import TableHeading from "@/components/TableHeading";
import { csvToExcel } from "@/components/csvToExcel";
import FormField from "@/components/forms/abstracts/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchApi } from "@/lib/fetchApi";
import { flatternArray } from "@/lib/flatternObject";
import getColumn from "@/lib/getColumn";
import { handleError } from "@/lib/handleError";
import { cn } from "@/lib/utils";
import {
  AlertStatus,
  useAppendAlertToQueue,
  useSearchValue,
} from "@/providers/DashboardProvider";
import { asBlob, download, generateCsv, mkConfig } from "export-to-csv";
import { PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";

export default function StatesListPage(props: any) {
  // Getting the router.
  const router = useRouter();

  // Tracking the page on which the state is currenly on.
  const [currentPage, setCurrentPage] = useState<number>(
    isNaN(props.searchParams.page) ? 1 : +props.searchParams.page,
  );

  // Indicator used to know the state of the requested data.
  // Initially true, as the data would be fetched before the
  // first render.
  const [loading, setLoading] = useState<boolean>(true);

  // States array, that would be used to store the states
  // returned from the backend server.
  const [states, setStates] = useState<any[]>([]);

  // Variable to store the total number of records
  // present in the states table.
  const [total, setTotal] = useState<number>();

  // An array to track all the items that have been selected.
  const [selectedStates, setSelectedStates] = useState<any[]>([]);

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

  // Boolean value to control the quick preview container
  const [quickPreviewOpen, setQuickPreviewOpen] = useState<boolean>(false);
  const [selectedState, setSelectedState] = useState<any>();

  // Boolean value to control the delete action
  const [isDeletingState, setIsDeletingState] = useState<boolean>(false);

  // Helper function to fetch the states from the
  // backend server
  const fetchStates = handleError(async function () {
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

    // Constructing an URL that points to states endpoint.
    const statesEndpoint = "/api/lookup/states?" + requestQuery.toString();

    // Sending the request to the backend server
    const response = await fetchApi(statesEndpoint, {
      credentials: "include",
    });

    // If the server has returned the valid response
    // the data property contain the states
    // and the total count for states.
    if (response?.data) {
      if (response.data?.states && response.data?.total) {
        setTotal(Number(response.data.total));
        setStates(response.data.states);

        // Indication that the records have been loaded
        setLoading(false);
      }
    } else {
      // Unable to get the records from the server.
      appendAlertToQueue(
        "Unable to fetch the states from the server. Please try again later.",
        AlertStatus.Error,
      );
    }
  });

  // Helper function to update the sorting based on the rules below.
  // Rule #1: If the state clicked on the same column the toggle sorting order.
  // Rule #2: Change the column, if the state clicked on a different column.
  function changeSortingColumn(column: number) {
    return () => {
      // Checking if the state clicked the same column.
      if (column === sortingColumn) {
        setSoringOrder((order) => (order === "asc" ? "desc" : "asc"));
      } else {
        setSortingColumn(column);
        setSoringOrder("asc");
      }
    };
  }

  // Helper function to sort the records
  const sortingFn = (a: any, b: any) => {
    let fieldName: string;

    let b1 = sortingOrder === "asc" ? a : b;
    let b2 = sortingOrder === "desc" ? a : b;

    switch (sortingColumn) {
      case 0: {
        fieldName = "countryStateId";
        break;
      }

      case 1: {
        fieldName = "countryState";
        break;
      }

      case 2: {
        fieldName = "country.country";
        break;
      }

      default: {
        return 0;
      }
    }

    return getColumn(b1, fieldName) > getColumn(b2, fieldName) ? -1 : 1;
  };

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

      fetchStates();
    },
    [currentPage, searchValue],
  );

  // Function responsible for exporting the states in .csv format
  const getDataToExport = async function () {
    const searchParams = new URLSearchParams();

    // If the state has filter some data with search
    // the exported data should also comply to those
    // filters.
    if (searchValue) {
      searchParams.set("search", searchValue);
    }

    const response = await fetchApi(
      "/api/lookup/states?" + searchParams.toString(),
      {
        credentials: "include",
      },
    );

    // If the server returned a response
    if (response?.data?.states) {
      return flatternArray(response.data.states);
    }

    // Otherwise notify the state some error has occured.
    else {
      appendAlertToQueue(
        "Unable to export the states for the moment, please try again later!",
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

      download(csvConfig)(generateCsv(csvConfig)(data));
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
      a.download = `states${searchValue ? "_" + searchValue : ""}.xlsx`;
      a.click();
    }
  };

  // Helper function that is responsible for
  // deleting a single state
  const deleteState = async function () {
    if (isDeletingState && selectedState) {
      setIsDeletingState(false);
      appendAlertToQueue(`Deleting ${selectedState.orgId}`);

      const request = await fetchApi(
        "/api/lookup/states/delete",
        {},
        { countryStateId: selectedState.countryStateId },
      );

      if (request?.status === "OK") {
        setStates((states) =>
          states.map((state) => {
            if (state.countryStateId === selectedState.countryStateId) {
              return {
                ...state,
                isActive: false,
              };
            }

            return state;
          }),
        );
        appendAlertToQueue(`State has been deleted.`, AlertStatus.Success);
      } else {
        appendAlertToQueue(
          "Failed, please try again later.",
          AlertStatus.Error,
        );
      }
    }
  };

  // Helper function that is responsible for
  // deleting a multiple state
  const deleteStates = async function () {
    if (isDeletingState && selectedStates.length > 0) {
      setIsDeletingState(false);
      appendAlertToQueue(
        `Deleting ${selectedStates.length} state${selectedStates.length === 1 ? "" : "s"}`,
      );

      const request = await fetchApi(
        "/api/lookup/states/bulk-delete",
        {},
        selectedStates,
      );

      if (request?.status === "OK") {
        if (request?.status === "OK") {
          let statesCopy = [...states];

          selectedStates.map((state) => {
            statesCopy = statesCopy.map((b) => {
              if (state.countryStateId === b.countryStateId) {
                return {
                  ...b,
                  isActive: false,
                };
              }

              return b;
            });
          });

          appendAlertToQueue(
            `State${selectedStates.length === 1 ? " has " : "s have "} been deleted.`,
            AlertStatus.Success,
          );

          setStates(statesCopy);
          setSelectedStates([]);
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
    setIsDeletingState(false);
    setSelectedState(undefined);
  };

  // Function responisble for definined the
  // behaviour of bulk selection.
  const updateSelectedStates =
    (countryStateId: number) => (status: boolean) => {
      const bulkStatesCopy = [...selectedStates];

      if (!status) {
        // Remove the state from the selection.
        setSelectedStates(
          bulkStatesCopy.filter(
            (state) => state.countryStateId !== countryStateId,
          ),
        );
        return;
      }

      bulkStatesCopy.push({ countryStateId });
      setSelectedStates(bulkStatesCopy);
    };

  const bulkDeletion = function () {
    setIsDeletingState(true);
  };

  // Displaying the table in the browser
  return (
    <section>
      <ListingHeader title="State Details">
        {/* Button to delete states in bulk. */}
        <div
          style={{
            display: selectedStates.length == 0 ? "none" : "inherit",
          }}
        >
          <ActionButton
            actionButton
            icon={<Trash2Icon />}
            title="Delete States"
            className={cn("bg-red-500")}
            onClick={bulkDeletion}
          />
        </div>

        {/* Button to trigger export action */}
        <ExportButton toCSV={toCSV} toExcel={toExcel} />

        {/* Action button to create a new state */}
        <ActionButton
          href={"/dashboard/states/create"}
          icon={<PlusIcon />}
          title="Create State"
          actionButton
        />
      </ListingHeader>

      {/* Rendering the actual table */}
      <table className="w-full">
        <thead className="bg-smawad-gray">
          <tr>
            <th>
              <div className="data-cell-wrapper">
                <Checkbox />
              </div>
            </th>

            <TableHeading
              title="Country Name"
              activeAt={2}
              setColumn={changeSortingColumn(2)}
              sortingOrder={sortingOrder}
              status={sortingColumn}
            />

            <TableHeading
              title="State Id"
              activeAt={0}
              setColumn={changeSortingColumn(0)}
              sortingOrder={sortingOrder}
              status={sortingColumn}
            />

            <TableHeading
              title="State Name"
              activeAt={1}
              setColumn={changeSortingColumn(1)}
              sortingOrder={sortingOrder}
              status={sortingColumn}
            />

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
              <td>Loading Records...</td>
              <td></td>
            </tr>
          ) : (
            states.sort(sortingFn).map((state) => (
              <tr key={state.countryStateId}>
                <td>
                  <div className="data-cell-wrapper">
                    <Checkbox
                      data-state={
                        !!selectedStates.find(
                          (b) => b.countryStateId === state.countryStateId,
                        )
                          ? "checked"
                          : "unchecked"
                      }
                      checked={
                        !!selectedStates.find(
                          (b) => b.countryStateId === state.countryStateId,
                        )
                      }
                      onCheckedChange={updateSelectedStates(
                        state.countryStateId,
                      )}
                    />
                  </div>
                </td>

                <td>{state.country?.country}</td>
                <td>{state.countryStateId}</td>
                <td>{state.countryState}</td>

                <td>
                  <TableActions
                    onView={() => {
                      setSelectedState(state);
                      setQuickPreviewOpen(true);
                    }}
                    updateLink={
                      "/dashboard/states/update/" + state.countryStateId
                    }
                    onDelete={() => {
                      if (!state.isActive) {
                        return appendAlertToQueue(
                          "The state has already been deleted!",
                          AlertStatus.Warning,
                        );
                      }
                      setSelectedState(state);
                      setIsDeletingState(true);
                    }}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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
        title={"State Details"}
        onClose={() => setQuickPreviewOpen(false)}
      >
        {selectedState && (
          <div className="flex flex-col gap-3">
            <FormField
              disabled
              readOnly
              label="State Id"
              defaultValue={selectedState.countryStateId}
            />
            <FormField
              disabled
              readOnly
              label="State Name"
              defaultValue={selectedState.countryState}
            />
            <Link
              className="w-full"
              href={"/dashboard/states/view/" + selectedState.countryStateId}
            >
              <ActionButton
                actionButton
                icon={<></>}
                className="w-full"
                title="View Detailed State"
              />
            </Link>
          </div>
        )}
      </QuickPreview>

      {/* Delete confirmation */}
      <Dialog
        open={isDeletingState && (!!selectedState || selectedStates.length > 0)}
        onOpenChange={cancelDeleteAction}
      >
        <DialogContent>
          <DialogTitle>
            Deleting{" "}
            {selectedState
              ? selectedState.orgId
              : selectedStates.length +
                " state" +
                (selectedStates.length == 1 ? "" : "s")}
          </DialogTitle>

          <DialogDescription>
            Please confirm that you want to delete{" "}
            {selectedState
              ? selectedState.orgId + " state"
              : "state" + (selectedStates.length == 1 ? "" : "s")}
            , this action is permanent and cannot be reversed
          </DialogDescription>

          <div className="mt-4 flex items-center justify-end gap-3">
            <ActionButton onClick={cancelDeleteAction} title="Cancel" />
            <ActionButton
              title={"Delete " + (selectedState ? "state" : "states")}
              onClick={selectedState ? deleteState : deleteStates}
              actionButton
              className="bg-red-500"
            />{" "}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
