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

export default function CountriesListPage(props: any) {
  // Getting the router.
  const router = useRouter();

  // Tracking the page on which the country is currenly on.
  const [currentPage, setCurrentPage] = useState<number>(
    isNaN(props.searchParams.page) ? 1 : +props.searchParams.page,
  );

  // Indicator used to know the state of the requested data.
  // Initially true, as the data would be fetched before the
  // first render.
  const [loading, setLoading] = useState<boolean>(true);

  // Countries array, that would be used to store the countries
  // returned from the backend server.
  const [countries, setCountries] = useState<any[]>([]);

  // Variable to store the total number of records
  // present in the countries table.
  const [total, setTotal] = useState<number>();

  // An array to track all the items that have been selected.
  const [selectedCountries, setSelectedCountries] = useState<any[]>([]);

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
  const [selectedCountry, setSelectedCountry] = useState<any>();

  // Boolean value to control the delete action
  const [isDeletingCountry, setIsDeletingCountry] = useState<boolean>(false);

  // Helper function to fetch the countries from the
  // backend server
  const fetchCountries = handleError(async function () {
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

    // Constructing an URL that points to countries endpoint.
    const countriesEndpoint =
      "/api/lookup/countries?" + requestQuery.toString();

    // Sending the request to the backend server
    const response = await fetchApi(countriesEndpoint, {
      credentials: "include",
    });

    // If the server has returned the valid response
    // the data property contain the countries
    // and the total count for countries.
    if (response?.data) {
      if (response.data?.countries && response.data?.total) {
        setTotal(Number(response.data.total));
        setCountries(response.data.countries);

        // Indication that the records have been loaded
        setLoading(false);
      }
    } else {
      // Unable to get the records from the server.
      appendAlertToQueue(
        "Unable to fetch the countries from the server. Please try again later.",
        AlertStatus.Error,
      );
    }
  });

  // Helper function to update the sorting based on the rules below.
  // Rule #1: If the country clicked on the same column the toggle sorting order.
  // Rule #2: Change the column, if the country clicked on a different column.
  function changeSortingColumn(column: number) {
    return () => {
      // Checking if the country clicked the same column.
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
        fieldName = "countryId";
        break;
      }

      case 1: {
        fieldName = "country";
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

      fetchCountries();
    },
    [currentPage, searchValue],
  );

  // Function responsible for exporting the countries in .csv format
  const getDataToExport = async function () {
    const searchParams = new URLSearchParams();

    // If the country has filter some data with search
    // the exported data should also comply to those
    // filters.
    if (searchValue) {
      searchParams.set("search", searchValue);
    }

    const response = await fetchApi(
      "/api/countries?" + searchParams.toString(),
      {
        credentials: "include",
      },
    );

    // If the server returned a response
    if (response?.data?.countries) {
      return flatternArray(response.data.countries);
    }

    // Otherwise notify the country some error has occured.
    else {
      appendAlertToQueue(
        "Unable to export the countries for the moment, please try again later!",
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
      a.download = `countries${searchValue ? "_" + searchValue : ""}.xlsx`;
      a.click();
    }
  };

  // Helper function that is responsible for
  // deleting a single country
  const deleteCountry = async function () {
    if (isDeletingCountry && selectedCountry) {
      setIsDeletingCountry(false);
      appendAlertToQueue(`Deleting ${selectedCountry.orgId}`);

      const request = await fetchApi(
        "/api/countries/delete",
        {},
        { countryId: selectedCountry.countryId },
      );

      if (request?.status === "OK") {
        setCountries((countries) =>
          countries.map((country) => {
            if (country.countryId === selectedCountry.countryId) {
              return {
                ...country,
                isActive: false,
              };
            }

            return country;
          }),
        );
        appendAlertToQueue(`Country has been deleted.`, AlertStatus.Success);
      } else {
        appendAlertToQueue(
          "Failed, please try again later.",
          AlertStatus.Error,
        );
      }
    }
  };

  // Helper function that is responsible for
  // deleting a multiple country
  const deleteCountries = async function () {
    if (isDeletingCountry && selectedCountries.length > 0) {
      setIsDeletingCountry(false);
      appendAlertToQueue(
        `Deleting ${selectedCountries.length} country${selectedCountries.length === 1 ? "" : "s"}`,
      );

      const request = await fetchApi(
        "/api/countries/bulk-delete",
        {},
        selectedCountries,
      );

      if (request?.status === "OK") {
        if (request?.status === "OK") {
          let countriesCopy = [...countries];

          selectedCountries.map((country) => {
            countriesCopy = countriesCopy.map((b) => {
              if (country.countryId === b.countryId) {
                return {
                  ...b,
                  isActive: false,
                };
              }

              return b;
            });
          });

          appendAlertToQueue(
            `Country${selectedCountries.length === 1 ? " has " : "s have "} been deleted.`,
            AlertStatus.Success,
          );

          setCountries(countriesCopy);
          setSelectedCountries([]);
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
    setIsDeletingCountry(false);
    setSelectedCountry(undefined);
  };

  // Function responisble for definined the
  // behaviour of bulk selection.
  const updateSelectedCountries = (countryId: number) => (status: boolean) => {
    const bulkCountriesCopy = [...selectedCountries];

    if (!status) {
      // Remove the country from the selection.
      setSelectedCountries(
        bulkCountriesCopy.filter((country) => country.countryId !== countryId),
      );
      return;
    }

    bulkCountriesCopy.push({ countryId });
    setSelectedCountries(bulkCountriesCopy);
  };

  const bulkDeletion = function () {
    setIsDeletingCountry(true);
  };

  // Displaying the table in the browser
  return (
    <section>
      <ListingHeader title="Country Details">
        {/* Button to delete countries in bulk. */}
        <div
          style={{
            display: selectedCountries.length == 0 ? "none" : "inherit",
          }}
        >
          <ActionButton
            actionButton
            icon={<Trash2Icon />}
            title="Delete Countries"
            className={cn("bg-red-500")}
            onClick={bulkDeletion}
          />
        </div>

        {/* Button to trigger export action */}
        <ExportButton toCSV={toCSV} toExcel={toExcel} />

        {/* Action button to create a new country */}
        <ActionButton
          href={"/dashboard/countries/create"}
          icon={<PlusIcon />}
          title="Create Country"
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
              title="Country Id"
              activeAt={0}
              setColumn={changeSortingColumn(0)}
              sortingOrder={sortingOrder}
              status={sortingColumn}
            />

            <TableHeading
              title="Country Name"
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
            countries.sort(sortingFn).map((country) => (
              <tr key={country.countryId}>
                <td>
                  <div className="data-cell-wrapper">
                    <Checkbox
                      data-state={
                        !!selectedCountries.find(
                          (b) => b.countryId === country.countryId,
                        )
                          ? "checked"
                          : "unchecked"
                      }
                      checked={
                        !!selectedCountries.find(
                          (b) => b.countryId === country.countryId,
                        )
                      }
                      onCheckedChange={updateSelectedCountries(
                        country.countryId,
                      )}
                    />
                  </div>
                </td>
                <td>{country.countryId}</td>
                <td>{country.country}</td>

                <td>
                  <TableActions
                    onView={() => {
                      setSelectedCountry(country);
                      setQuickPreviewOpen(true);
                    }}
                    updateLink={
                      "/dashboard/countries/update/" + country.countryId
                    }
                    onDelete={() => {
                      if (!country.isActive) {
                        return appendAlertToQueue(
                          "The country has already been deleted!",
                          AlertStatus.Warning,
                        );
                      }
                      setSelectedCountry(country);
                      setIsDeletingCountry(true);
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
        title={"Country Details"}
        onClose={() => setQuickPreviewOpen(false)}
      >
        {selectedCountry && (
          <div className="flex flex-col gap-3">
            <FormField
              disabled
              readOnly
              label="Country Id"
              defaultValue={selectedCountry.countryId}
            />
            <FormField
              disabled
              readOnly
              label="Country Name"
              defaultValue={selectedCountry.country}
            />
            <Link
              className="w-full"
              href={"/dashboard/countries/view/" + selectedCountry.countryId}
            >
              <ActionButton
                actionButton
                icon={<></>}
                className="w-full"
                title="View Detailed Country"
              />
            </Link>
          </div>
        )}
      </QuickPreview>

      {/* Delete confirmation */}
      <Dialog
        open={
          isDeletingCountry &&
          (!!selectedCountry || selectedCountries.length > 0)
        }
        onOpenChange={cancelDeleteAction}
      >
        <DialogContent>
          <DialogTitle>
            Deleting{" "}
            {selectedCountry
              ? selectedCountry.orgId
              : selectedCountries.length +
                " country" +
                (selectedCountries.length == 1 ? "" : "s")}
          </DialogTitle>

          <DialogDescription>
            Please confirm that you want to delete{" "}
            {selectedCountry
              ? selectedCountry.orgId + " country"
              : "country" + (selectedCountries.length == 1 ? "" : "s")}
            , this action is permanent and cannot be reversed
          </DialogDescription>

          <div className="mt-4 flex items-center justify-end gap-3">
            <ActionButton onClick={cancelDeleteAction} title="Cancel" />
            <ActionButton
              title={"Delete " + (selectedCountry ? "country" : "countries")}
              onClick={selectedCountry ? deleteCountry : deleteCountries}
              actionButton
              className="bg-red-500"
            />{" "}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
