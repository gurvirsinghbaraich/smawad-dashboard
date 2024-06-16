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

export default function UsersListPage(props: any) {
  // Getting the router.
  const router = useRouter();

  // Tracking the page on which the user is currenly on.
  const [currentPage, setCurrentPage] = useState<number>(
    isNaN(props.searchParams.page) ? 1 : +props.searchParams.page,
  );

  // Indicator used to know the state of the requested data.
  // Initially true, as the data would be fetched before the
  // first render.
  const [loading, setLoading] = useState<boolean>(true);
  const [abortController, setAbortController] = useState(new AbortController());

  // Users array, that would be used to store the users
  // returned from the backend server.
  const [users, setUsers] = useState<any[]>([]);

  // Variable to store the total number of records
  // present in the users table.
  const [total, setTotal] = useState<number>();

  // An array to track all the items that have been selected.
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

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
  const [selectedUser, setSelectedUser] = useState<any>();

  // Filters
  const [filters, setFilters] = useState<Record<string, Array<any>>>({});

  const [filtersApplied, setFiltersApplied] = useState<
    Record<string, Array<any>>
  >({});
  const [filtersDataset, setFiltersDataset] = useState<
    Record<string, Array<any>>
  >({});

  // Boolean value to control the delete action
  const [isDeletingUser, setIsDeletingUser] = useState<boolean>(false);

  // Helper function to fetch the users from the
  // backend server
  const fetchUsers = handleError(async function (abortController) {
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
      let fieldName = "userId";

      switch (sortingColumn) {
        case 0: {
          fieldName = "firstName";
          break;
        }

        case 1: {
          fieldName = "lastName";
          break;
        }

        case 2: {
          fieldName = "email";
          break;
        }

        case 3: {
          fieldName = "phoneNumber";
          break;
        }
      }

      requestQuery.set("order", sortingOrder);
      requestQuery.set("orderBy", fieldName);
    }

    if (Object.keys(filters).length > 0) {
      requestQuery.set("filters", JSON.stringify(filters));
    }

    // Constructing an URL that points to users endpoint.
    const usersEndpoint = "/api/users?" + requestQuery.toString();

    // Sending the request to the backend server
    const response = await fetchApi(usersEndpoint, {
      credentials: "include",
      signal: abortController.signal,
    });

    // If the server has returned the valid response
    // the data property contain the users
    // and the total count for users.
    if (response?.data) {
      setFiltersApplied(filters);

      if (
        Array.isArray(response.data?.users) &&
        response.data.users.length <= 0
      ) {
        setTotal(0);
        setUsers([]);
      } else if (response.data?.users && response.data?.total) {
        setTotal(Number(response.data.total));
        setUsers(response.data.users);
      }

      // Indication that the records have been loaded
      setLoading(false);
    } else {
      // Unable to get the records from the server.
      appendAlertToQueue(
        "Unable to fetch the users from the server. Please try again later.",
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
    const response = await fetchApi("/api/filters/users");

    if (response?.data?.users) {
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

      // Cancel the previous request.
      abortController.abort();

      let controller = new AbortController();
      setAbortController(controller);
      fetchUsers(controller);
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
    fetchUsers(controller);
  };

  // Function responsible for exporting the users in .csv format
  const getDataToExport = async function () {
    const searchParams = new URLSearchParams();

    // If the user has filter some data with search
    // the exported data should also comply to those
    // filters.
    if (searchValue) {
      searchParams.set("search", searchValue);
    }

    const response = await fetchApi("/api/users?" + searchParams.toString(), {
      credentials: "include",
    });

    // If the server returned a response
    if (response?.data?.users) {
      return flatternArray(response.data.users).map((user) => {
        delete user.createdBy;
        delete user.updatedBy;

        return user;
      });
    }

    // Otherwise notify the user some error has occured.
    else {
      appendAlertToQueue(
        "Unable to export the users for the moment, please try again later!",
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
      const defaultFilename = `users${searchValue ? "_" + searchValue : ""}.xlsx`;
      a.download =
        (prompt("Please enter name for .xlsx file:") || defaultFilename) +
        ".xlsx";
      a.click();
    }
  };

  // Helper function that is responsible for
  // deleting a single user
  const deleteUser = async function () {
    if (isDeletingUser && selectedUser) {
      setIsDeletingUser(false);
      appendAlertToQueue(`Deleting ${selectedUser.orgId}`);

      const request = await fetchApi(
        "/api/users/delete",
        {},
        { userId: selectedUser.userId },
      );

      if (request?.status === "OK") {
        setUsers((users) =>
          users.map((user) => {
            if (user.userId === selectedUser.userId) {
              return {
                ...user,
                isActive: false,
              };
            }

            return user;
          }),
        );
        appendAlertToQueue(`User has been deleted.`, AlertStatus.Success);
      } else {
        appendAlertToQueue(
          "Failed, please try again later.",
          AlertStatus.Error,
        );
      }
    }
  };

  // Helper function that is responsible for
  // deleting a multiple user
  const deleteUsers = async function () {
    if (isDeletingUser && selectedUsers.length > 0) {
      setIsDeletingUser(false);
      appendAlertToQueue(
        `Deleting ${selectedUsers.length} user${selectedUsers.length === 1 ? "" : "s"}`,
      );

      const request = await fetchApi(
        "/api/users/bulk-delete",
        {},
        selectedUsers,
      );

      if (request?.status === "OK") {
        if (request?.status === "OK") {
          let usersCopy = [...users];

          selectedUsers.map((user) => {
            usersCopy = usersCopy.map((b) => {
              if (user.userId === b.userId) {
                return {
                  ...b,
                  isActive: false,
                };
              }

              return b;
            });
          });

          appendAlertToQueue(
            `User${selectedUsers.length === 1 ? " has " : "s have "} been deleted.`,
            AlertStatus.Success,
          );

          setUsers(usersCopy);
          setSelectedUsers([]);
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
    setIsDeletingUser(false);
    setSelectedUser(undefined);
  };

  // Function responisble for definined the
  // behaviour of bulk selection.
  const updateSelectedUsers = (userId: number) => (status: boolean) => {
    const bulkUsersCopy = [...selectedUsers];

    if (!status) {
      // Remove the user from the selection.
      setSelectedUsers(bulkUsersCopy.filter((user) => user.userId !== userId));
      return;
    }

    bulkUsersCopy.push({ userId });
    setSelectedUsers(bulkUsersCopy);
  };

  const bulkDeletion = function () {
    setIsDeletingUser(true);
  };

  // Displaying the table in the browser
  return (
    <section className="grid h-full max-h-[calc(100vh_-_0px)] grid-cols-1 grid-rows-[90px_1fr_48px] overflow-hidden">
      <ListingHeader title="User Details">
        {/* Button to delete users in bulk. */}
        <div
          className={cn(
            selectedUsers.length == 0 ? "pointer-events-none" : "inherit",
          )}
        >
          <ActionButton
            actionButton
            disabled={selectedUsers.length === 0}
            icon={<Trash2Icon />}
            title="Delete Users"
            className={cn("bg-red-500 disabled:bg-red-300")}
            onClick={bulkDeletion}
          />
        </div>

        {/* Button to trigger export action */}
        <ExportButton toCSV={toCSV} toExcel={toExcel} />

        <FiltersButton
          onSave={onSave}
          applied={
            Object.values(filtersApplied).filter((v) => v.length > 0).length
          }
        >
          <Accordion type="single" collapsible className="mx-2 mb-2 w-[290px]">
            <AccordionItem value="first-name">
              <AccordionTrigger>
                First Names{" "}
                {filtersApplied?.firstName?.length > 0 && (
                  <>({filtersApplied?.firstName?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {unique(
                  filtersDataset.users?.map(({ firstName }) => firstName),
                ).map((name, index) => (
                  <div className="flex gap-2 p-1" key={index + name}>
                    <input
                      type="checkbox"
                      data-value={name}
                      defaultChecked={filtersApplied?.firstName?.includes(name)}
                      onChange={updateFilters("firstName")}
                    />
                    {name}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="last-name">
              <AccordionTrigger>
                Last Names{" "}
                {filtersApplied?.lastName?.length > 0 && (
                  <>({filtersApplied?.lastName?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {unique(
                  filtersDataset.users?.map(({ lastName }) => lastName),
                ).map((name, index) => (
                  <div className="flex gap-2 p-1" key={index + name}>
                    <input
                      type="checkbox"
                      data-value={name}
                      defaultChecked={filtersApplied?.lastName?.includes(name)}
                      onChange={updateFilters("lastName")}
                    />
                    {name}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="email">
              <AccordionTrigger>
                Email{" "}
                {filtersApplied?.email?.length > 0 && (
                  <>({filtersApplied?.email?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {unique(filtersDataset.users?.map(({ email }) => email)).map(
                  (name, index) => (
                    <div className="flex gap-2 p-1" key={index + name}>
                      <input
                        type="checkbox"
                        data-value={name}
                        defaultChecked={filtersApplied?.email?.includes(name)}
                        onChange={updateFilters("email")}
                      />
                      {name}
                    </div>
                  ),
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="Phone Number">
              <AccordionTrigger>
                Phone Number{" "}
                {filtersApplied?.phoneNumber?.length > 0 && (
                  <>({filtersApplied?.phoneNumber?.length})</>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {unique(
                  filtersDataset.users?.map(({ phoneNumber }) => phoneNumber),
                ).map((name, index) => (
                  <div className="flex gap-2 p-1" key={index + name}>
                    <input
                      type="checkbox"
                      data-value={name}
                      defaultChecked={filtersApplied?.phoneNumber?.includes(
                        name,
                      )}
                      onChange={updateFilters("phoneNumber")}
                    />
                    {name}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </FiltersButton>

        {/* Action button to create a new user */}
        <ActionButton
          href={"/dashboard/users/create"}
          icon={<PlusIcon />}
          title="Create User"
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
                title="First Name"
                activeAt={0}
                setColumn={changeSortingColumn(0)}
                sortingOrder={sortingOrder}
                status={sortingColumn}
              />

              <TableHeading
                title="Last Name"
                activeAt={1}
                setColumn={changeSortingColumn(1)}
                sortingOrder={sortingOrder}
                status={sortingColumn}
              />

              <TableHeading
                title="Email"
                activeAt={2}
                setColumn={changeSortingColumn(2)}
                sortingOrder={sortingOrder}
                status={sortingColumn}
              />

              <TableHeading
                title="Phone Number"
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
                  {total === 0 ? "No Records Found..." : "Loading Records..."}
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <div className="data-cell-wrapper">
                      <Checkbox
                        data-state={
                          !!selectedUsers.find((b) => b.userId === user.userId)
                            ? "checked"
                            : "unchecked"
                        }
                        checked={
                          !!selectedUsers.find((b) => b.userId === user.userId)
                        }
                        onCheckedChange={updateSelectedUsers(user.userId)}
                      />
                    </div>
                  </td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>

                  <td>
                    <div className="data-cell-wrapper">
                      <Switch checked={user.isActive} />
                    </div>
                  </td>
                  <td>
                    <TableActions
                      onView={() => {
                        setSelectedUser(user);
                        setQuickPreviewOpen(true);
                      }}
                      updateLink={"/dashboard/users/update/" + user.userId}
                      onDelete={() => {
                        if (!user.isActive) {
                          return appendAlertToQueue(
                            "The user has already been deleted!",
                            AlertStatus.Warning,
                          );
                        }
                        setSelectedUser(user);
                        setIsDeletingUser(true);
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
        title={"User Details"}
        onClose={() => setQuickPreviewOpen(false)}
      >
        {selectedUser && (
          <div className="flex flex-col gap-3">
            <FormField
              disabled
              readOnly
              label="UserId"
              defaultValue={selectedUser.userId}
            />
            <FormField
              disabled
              readOnly
              label="First Name"
              defaultValue={selectedUser.firstName}
            />
            <FormField
              disabled
              readOnly
              label="Middle Name"
              defaultValue={selectedUser.middleName}
            />
            <FormField
              disabled
              readOnly
              label="Last Name"
              defaultValue={selectedUser.lastName}
            />
            <FormField
              disabled
              readOnly
              label="Email"
              defaultValue={selectedUser.email}
            />
            <FormField
              disabled
              readOnly
              label="Phone Number"
              defaultValue={selectedUser.phoneNumber}
            />
            <Link
              className="w-full"
              href={"/dashboard/users/view/" + selectedUser.userId}
            >
              <ActionButton
                actionButton
                icon={<></>}
                className="w-full"
                title="View Detailed User"
              />
            </Link>
          </div>
        )}
      </QuickPreview>

      {/* Delete confirmation */}
      <Dialog
        open={isDeletingUser && (!!selectedUser || selectedUsers.length > 0)}
        onOpenChange={cancelDeleteAction}
      >
        <DialogContent>
          <DialogTitle>
            Deleting{" "}
            {selectedUser
              ? selectedUser.orgId
              : selectedUsers.length +
                " user" +
                (selectedUsers.length == 1 ? "" : "s")}
          </DialogTitle>

          <DialogDescription>
            Please confirm that you want to delete{" "}
            {selectedUser
              ? selectedUser.orgId + " user"
              : "user" + (selectedUsers.length == 1 ? "" : "s")}
            , this action is permanent and cannot be reversed
          </DialogDescription>

          <div className="mt-4 flex items-center justify-end gap-3">
            <ActionButton onClick={cancelDeleteAction} title="Cancel" />
            <ActionButton
              title={"Delete " + (selectedUser ? "user" : "users")}
              onClick={selectedUser ? deleteUser : deleteUsers}
              actionButton
              className="bg-red-500"
            />{" "}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
