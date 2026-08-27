// Import Dependencies
import { useEffect, useState } from "react";

import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";

import { Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Local Imports
import apiHelper from "@/utils/apiHelper";
import { Page } from "@/components/shared/Page";

import { Button, Card } from "@/components/ui";

// --------------------------------------------
const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];
interface CustomerDetails {
  customerName: string;
  mobile: string;
  city: string;
}

interface HistoryItem {
  id: number | string;
  leadId: number;

  revisionNo: number;
  revisionName: string;

  quotationNo: string;

  modelName: string;
  variantName: string;
  colourName: string;

  totalAmount: number | null;

  createdBy: string;
  createdAt: string;

  isOriginal: boolean;
}

// --------------------------------------------

export default function QuotationHistoryDetails() {
  const navigate = useNavigate();
 const [search, setSearch] = useState("");
  const { id } = useParams();

  const [customer, setCustomer] = useState<CustomerDetails>({
    customerName: "-",
    mobile: "-",
    city: "-",
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  // ------------------------------------------
  // GET ONE LEAD QUOTATION HISTORY
  // ------------------------------------------

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const response = await apiHelper.get(`/leads/quotation-history/${id}`);

      console.log("QUOTATION DETAILS:", response);

      setCustomer(
        response.customer || {
          customerName: "-",
          mobile: "-",
          city: "-",
        },
      );

      setHistory(response.data || []);
    } catch (error) {
      console.error("Failed to fetch quotation details:", error);

      setHistory([]);
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

// ------------------------------------------
// SEARCH
// ------------------------------------------

const searchText = search.trim().toLowerCase();

const filteredHistory = history.filter((item) => {
  return (
    String(item.quotationNo ?? "")
      .toLowerCase()
      .includes(searchText) ||
    String(item.modelName ?? "")
      .toLowerCase()
      .includes(searchText) ||
    String(item.variantName ?? "")
      .toLowerCase()
      .includes(searchText) ||
    String(item.colourName ?? "")
      .toLowerCase()
      .includes(searchText)
  );
});

// ------------------------------------------
// PAGINATION
// ------------------------------------------

const totalItems = filteredHistory.length;

const totalPages = Math.ceil(totalItems / itemsPerPage);

const indexOfLastItem = currentPage * itemsPerPage;

const indexOfFirstItem = indexOfLastItem - itemsPerPage;

const currentItems = filteredHistory.slice(
  indexOfFirstItem,
  indexOfLastItem,
);
  // ------------------------------------------
  // VIEW QUOTATION
  // ------------------------------------------

//   const handleViewQuotation = (item: HistoryItem) => {
//     if (item.isOriginal) {
//       // Original quotation
//       window.open(
//         `${import.meta.env.VITE_API_URL}/leads/${item.leadId}/quotation`,
//         "_blank",
//       );

//       return;
//     }

//     // Revision quotation
//     // We will create this PDF API next
//     window.open(
//       `${import.meta.env.VITE_API_URL}/leads/${
//         item.leadId
//       }/quotation/revision/${item.revisionNo}`,
//       "_blank",
//     );
//   };

  return (
    <Page title="Quotation Revision History">
      <div className="transition-content px-(--margin-x) pb-6">
        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-3 py-5">
          <div>
            <h2 className="dark:text-dark-100 text-xl font-medium tracking-wide text-gray-800">
              Quotation Revision History
            </h2>

            <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
              Original quotation and all updated quotations
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

        {/* CUSTOMER DETAILS */}

        <Card className="mb-5 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">Customer Name</p>

              <p className="dark:text-dark-100 mt-1 font-medium text-gray-800">
                {customer.customerName}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Mobile Number</p>

              <p className="dark:text-dark-100 mt-1 font-medium text-gray-800">
                {customer.mobile}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">City</p>

              <p className="dark:text-dark-100 mt-1 font-medium text-gray-800">
                {customer.city}
              </p>
            </div>
          </div>
        </Card>

        {/* HISTORY TABLE */}
 <div className="relative w-full max-w-md mb-5">
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
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="dark:border-dark-500 dark:bg-dark-800 border-b border-gray-200 bg-gray-50 whitespace-nowrap">
                  <th className="px-4 py-3 font-semibold">Sr. No.</th>

                  <th className="px-4 py-3 font-semibold">Quotation No.</th>

                  <th className="px-4 py-3 font-semibold">Model</th>

                  <th className="px-4 py-3 font-semibold">Variant</th>

                  <th className="px-4 py-3 font-semibold">Colour</th>

                  <th className="px-4 py-3 font-semibold">Total Amount</th>

                  <th className="px-4 py-3 font-semibold">Created By</th>

                  {/* <th className="px-4 py-3 font-semibold">Created Date</th> */}

                  <th className="px-4 py-3 text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No quotation history found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="dark:border-dark-500 dark:hover:bg-dark-700 border-b border-gray-200 whitespace-nowrap transition-colors hover:bg-gray-50"
                    >
                      {/* SR NO */}

                      <td className="px-4 py-3">
                        {" "}
                        {indexOfFirstItem + index + 1}
                      </td>

                      {/* QUOTATION NUMBER */}

                      <td className="dark:text-dark-100 px-4 py-3 font-medium text-gray-800">
                        {item.quotationNo}
                      </td>

                      {/* MODEL */}

                      <td className="px-4 py-3">{item.modelName || "-"}</td>

                      {/* VARIANT */}

                      <td className="px-4 py-3">{item.variantName || "-"}</td>

                      {/* COLOUR */}

                      <td className="px-4 py-3">{item.colourName || "-"}</td>

                      {/* SAVED QUOTATION TOTAL */}

                      <td className="px-4 py-3 font-medium">
                        {item.totalAmount !== null &&
                        item.totalAmount !== undefined
                          ? Number(item.totalAmount).toLocaleString("en-IN", {
                              style: "currency",

                              currency: "INR",

                              minimumFractionDigits: 2,

                              maximumFractionDigits: 2,
                            })
                          : "-"}
                      </td>

                      {/* CREATED BY */}

                      <td className="px-4 py-3">{item.createdBy || "-"}</td>

                      {/* CREATED DATE */}

                      {/* <td className="px-4 py-3">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString("en-IN")
                          : "-"}
                      </td> */}

                      {/* ACTION */}

                      <td className="px-4 py-3 text-center">
                        <Button
                          isIcon
                          variant="flat"
                          color="primary"
                          title="Download Quotation"
                        //   onClick={() => handleViewQuotation(item)}
                        >
                          <ArrowDownTrayIcon className="size-5" />
                        </Button>
                      </td>
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
                  {/* PREVIOUS */}

                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((previous) => Math.max(previous - 1, 1))
                    }
                    className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400"
                  >
                    <ChevronLeftIcon className="size-4" />
                  </button>

                  {/* PAGE NUMBERS */}

                  {Array.from(
                    {
                      length: totalPages,
                    },
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

                  {/* NEXT */}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((previous) =>
                        Math.min(previous + 1, totalPages),
                      )
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
                  {indexOfFirstItem + 1}

                  {" - "}

                  {Math.min(indexOfLastItem, totalItems)}

                  {" of "}

                  {totalItems}

                  {" entries"}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}
