// Import Dependencies
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Fragment } from "react";

// Local Imports
import apiHelper from "@/utils/apiHelper";
import { Page } from "@/components/shared/Page";
import { Card } from "@/components/ui";

// --------------------------------------------
const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

interface HistoryRow {
  date: string;
  type: string;
  partyName: string;
  reference: string;
  qtyIn: number;
  qtyOut: number;
  balance: number;
  billAmount: number;
  createdBy?: string;
}

interface AccessoryDetails {
  itemName: string;
  codeNo?: string;
  group?: string;
}

// --------------------------------------------

const AccessoriesHistory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [accessory, setAccessory] = useState<AccessoryDetails>({
    itemName: "-",
    codeNo: "-",
    group: "-",
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ------------------------------------------
  // FETCH ACCESSORIES HISTORY
  // ------------------------------------------

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiHelper.get(`/accessories/history/${id}`);

      console.log(res);

      setRows(res.history || []);

      // Set accessory details from response
      if (res.itemName) {
        setAccessory({
          itemName: res.itemName || "-",
          codeNo: res.codeNo || "-",
          group: res.group || "-",
        });
      }
    } catch (err) {
      console.log(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchHistory();
    }
  }, [id]);

  // ------------------------------------------
  // PAGINATION
  // ------------------------------------------

  const searchLower = search.trim().toLowerCase();

  const filteredRows = rows.filter((row: HistoryRow) => {
    if (!searchLower) return true;

    return (
      String(row.date ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      String(row.type ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      String(row.partyName ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      String(row.reference ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      String(row.qtyIn ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      String(row.qtyOut ?? "")
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const totalItems = filteredRows.length;

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;

  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  // ------------------------------------------
  // CALCULATE STOCK SUMMARY
  // ------------------------------------------

  // const totalIn = rows.reduce((sum, row) => sum + (row.qtyIn || 0), 0);
  // const totalOut = rows.reduce((sum, row) => sum + (row.qtyOut || 0), 0);
  // const currentBalance = rows.length > 0 ? rows[rows.length - 1].balance : 0;

  return (
    <Page title="Accessories Stock History">
      <div className="transition-content px-(--margin-x) pb-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-5">
          <div>
            <h2 className="dark:text-dark-100 text-xl font-medium tracking-wide text-gray-800">
              Accessories Stock History
            </h2>
            <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
              Track stock movement history for accessories
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-primary-500 hover:bg-primary-600 inline-flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors sm:w-auto sm:px-5"
          >
            <ArrowLeftIcon className="mr-1.5 size-4" />
            Back
          </button>
        </div>

        {/* ACCESSORY DETAILS */}
        <Card className="mb-5 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">Item Name</p>
              <p className="dark:text-dark-100 mt-1 font-medium text-gray-800">
                {accessory.itemName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Item Code</p>
              <p className="dark:text-dark-100 mt-1 font-medium text-gray-800">
                {accessory.codeNo}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Group</p>
              <p className="dark:text-dark-100 mt-1 font-medium text-gray-800">
                {accessory.group}
              </p>
            </div>
          </div>
        </Card>

        {/* STOCK SUMMARY CARDS
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-xs text-gray-500">Total Quantity In</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{totalIn}</p>
          </Card>
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-xs text-gray-500">Total Quantity Out</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{totalOut}</p>
          </Card>
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-xs text-gray-500">Current Balance</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {currentBalance}
            </p>
          </Card>
        </div> */}
        <div className="relative mb-5 w-full max-w-md">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
          />
        </div>
        {/* HISTORY TABLE */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="dark:border-dark-500 dark:bg-dark-800 border-b border-gray-200 bg-gray-50 whitespace-nowrap">
                  <th className="px-4 py-3 font-semibold">Sr. No.</th>

                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Party Name</th>
                  <th className="px-4 py-3 font-semibold">Bill No</th>
                  <th className="px-4 py-3 text-end font-semibold">Qty</th>
                  <th className="px-4 py-3 text-end font-semibold">
                    Bill Amount
                  </th>
                  <th className="px-4 py-3 text-end font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No stock history found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((row, index) => (
                    <tr
                      key={index}
                      className="dark:border-dark-500 dark:hover:bg-dark-700 border-b border-gray-200 whitespace-nowrap transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(row.date).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-4 py-3">{row.type}</td>

                      <td className="px-4 py-3 font-medium">{row.partyName}</td>

                      <td className="px-4 py-3">{row.reference}</td>

                      <td className="px-4 py-3 text-end font-semibold text-green-600">
                        {row.qtyIn > 0 ? (
                          <span className="text-green-500">+{row.qtyIn}</span>
                        ) : (
                          <span className="text-red-500">-{row.qtyOut}</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-end">
                        {row.billAmount != null ? (
                          <>
                            ₹
                            {Number(row.billAmount).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-3 text-end font-bold">
                        {row.balance || "-"}
                      </td>

                      <td className="px-4 py-3">{row.createdBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalItems > 0 && (
            <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
              {/* SHOW ENTRIES */}
              <div className="order-1 flex items-center justify-center gap-2 text-sm text-gray-600 md:w-1/3 md:justify-start dark:text-gray-400">
                <span>Show</span>
                <Menu as="div" className="relative inline-block w-20 text-left">
                  <MenuButton className="dark:border-dark-600 dark:bg-dark-700 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm dark:text-gray-200">
                    <span>{itemsPerPage}</span>
                    <svg
                      className="ml-2 size-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </MenuButton>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuItems
                      anchor="top start"
                      className="dark:border-dark-600 dark:bg-dark-700 z-200 w-20 space-y-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-xl focus:outline-none"
                    >
                      {entriesOptions.map((option) => (
                        <MenuItem key={option.id}>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() => {
                                setItemsPerPage(option.id);
                                setCurrentPage(1);
                              }}
                              className={`flex w-full rounded-md px-3 py-1.5 text-sm font-medium ${
                                option.id === itemsPerPage
                                  ? "bg-primary-500 text-white"
                                  : active
                                    ? "dark:bg-dark-600 bg-gray-100 text-gray-900 dark:text-white"
                                    : "text-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {option.name}
                            </button>
                          )}
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Transition>
                </Menu>
                <span>entries</span>
              </div>

              {/* PAGE BUTTONS */}
              <div className="order-2 flex justify-center md:w-1/3">
                <div className="dark:border-dark-700 dark:bg-dark-800 inline-flex items-center space-x-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400"
                  >
                    <ChevronLeftIcon className="size-4" />
                  </button>
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-medium ${
                        currentPage === page
                          ? "bg-primary-500 text-white"
                          : "dark:hover:bg-dark-700 text-gray-600 hover:bg-gray-100 dark:text-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400"
                  >
                    <ChevronRightIcon className="size-4" />
                  </button>
                </div>
              </div>

              {/* ENTRY INFORMATION */}
              <div className="order-3 flex items-center justify-center text-sm text-gray-500 md:w-1/3 md:justify-end dark:text-gray-400">
                <span>
                  {indexOfFirstItem + 1} -{" "}
                  {Math.min(indexOfLastItem, totalItems)} of {totalItems}{" "}
                  entries
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
};

export default AccessoriesHistory;
