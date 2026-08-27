// Import Dependencies
import {
  useEffect,
  useState,
} from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import {
  useNavigate,
} from "react-router-dom";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";

import {
  Fragment,
} from "react";
// Local Imports
import apiHelper from "@/utils/apiHelper";
import { Page } from "@/components/shared/Page";
import {
  Button,
  Card,
} from "@/components/ui";

// --------------------------------------------
const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];
interface TestDriveHistoryItem {
  id: number;
  customerName: string;
  mobile: string;
  testDriveCount: number;
  updatedAt: string;
}
// --------------------------------------------

export default function TestdriveHistory() {
  const navigate = useNavigate();
 const [search, setSearch] = useState("");
const [testDriveHistory, setTestDriveHistory] = useState<TestDriveHistoryItem[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);
const [
  currentPage,
  setCurrentPage,
] = useState(1);

const [
  itemsPerPage,
  setItemsPerPage,
] = useState(10);
  // ------------------------------------------
  // GET QUOTATION HISTORY
  // ------------------------------------------

const fetchTestDriveHistory = async () => {
  try {
    setLoading(true);

    const response = await apiHelper.get("/test-drives/history");

    

    setTestDriveHistory(response.data);
  } catch (error) {
    console.error("Failed to fetch Test Drive History:", error);
    setTestDriveHistory([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchTestDriveHistory();
}, []);
// ------------------------------------------
// PAGINATION
// ------------------------------------------

// ------------------------------------------
// SEARCH
// ------------------------------------------

const searchText = search.trim().toLowerCase();

const filteredTestDriveHistory = testDriveHistory.filter((item) => {
  return (
    String(item.customerName ?? "")
      .toLowerCase()
      .includes(searchText) ||
    String(item.mobile ?? "")
      .toLowerCase()
      .includes(searchText)
  );
});

// ------------------------------------------
// PAGINATION
// ------------------------------------------

const totalItems = filteredTestDriveHistory.length;

const totalPages = Math.ceil(totalItems / itemsPerPage);

const indexOfLastItem = currentPage * itemsPerPage;

const indexOfFirstItem = indexOfLastItem - itemsPerPage;

const currentItems = filteredTestDriveHistory.slice(
  indexOfFirstItem,
  indexOfLastItem,
);
  // ------------------------------------------
  // VIEW HISTORY
  // ------------------------------------------

const handleView = (
  leadId: number,
) => {
  navigate(`/leadmaster/testdrivehistory/${leadId}`);
};

  return (
    <Page title="Test Drive History">
      <div className="transition-content px-(--margin-x) pb-6">
        {/* PAGE TITLE */}

        <div className="flex items-center justify-between py-5">
          <div>
            <h2 className="text-xl font-medium tracking-wide text-gray-800 dark:text-dark-100">
              TestDrive History
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
              Customer TestDrive
              history
            </p>
          </div>
        </div>

        {/* TABLE */}
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
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-dark-500 dark:bg-dark-800 whitespace-nowrap">
                  <th className="px-4 py-3 font-semibold">
                    Sr. No.
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Customer Name
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Mobile
                  </th>

                  <th className="px-4 py-3 text-center font-semibold">
                  Test Drive Count
                  </th>

                  <th className="px-4 py-3 text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : currentItems.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                    No test drive history found
                    </td>
                  </tr>
                ) : (
                  currentItems.map(
                    (item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-dark-500 dark:hover:bg-dark-700"
                      >
                        <td className="px-4 py-3">
                        {indexOfFirstItem + index + 1}
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-dark-100">
                          {
                            item.customerName
                          }
                        </td>

                        <td className="px-4 py-3">
                          {item.mobile}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-600 dark:bg-primary-500/20">
                            {
                              item.testDriveCount
                            }
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <Button
                            isIcon
                            variant="flat"
                            color="primary"
                            title="View History"
                            onClick={() =>
                              handleView(
                                item.id,
                              )
                            }
                          >
                            <EyeIcon className="size-5" />
                          </Button>
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
          {/* PAGINATION */}

{totalItems > 0 && (
  <div className="flex flex-col gap-4 border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center dark:border-dark-700 dark:bg-dark-800">

    {/* ENTRIES SELECT */}

    <div className="order-1 flex items-center justify-center gap-2 text-sm text-gray-600 md:w-1/3 md:justify-start dark:text-gray-400">
      <span>Show</span>

      <Menu
        as="div"
        className="relative inline-block w-20 text-left"
      >
        <MenuButton className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm dark:border-dark-600 dark:bg-dark-700 dark:text-gray-200">
          <span>
            {itemsPerPage}
          </span>

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
            className="z-200 w-20 space-y-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-xl focus:outline-none dark:border-dark-600 dark:bg-dark-700"
          >
            {entriesOptions.map(
              (option) => (
                <MenuItem
                  key={option.id}
                >
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => {
                        setItemsPerPage(
                          option.id,
                        );

                        setCurrentPage(
                          1,
                        );
                      }}
                      className={`flex w-full rounded-md px-3 py-1.5 text-sm font-medium ${
                        option.id ===
                        itemsPerPage
                          ? "bg-primary-500 text-white"
                          : active
                            ? "bg-gray-100 text-gray-900 dark:bg-dark-600 dark:text-white"
                            : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {
                        option.name
                      }
                    </button>
                  )}
                </MenuItem>
              ),
            )}
          </MenuItems>
        </Transition>
      </Menu>

      <span>entries</span>
    </div>

    {/* PAGE BUTTONS */}

    <div className="order-2 flex justify-center md:w-1/3">
      <div className="inline-flex items-center space-x-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-dark-700 dark:bg-dark-800">

        {/* PREVIOUS */}

        <button
          type="button"
          disabled={
            currentPage === 1
          }
          onClick={() =>
            setCurrentPage(
              (previous) =>
                Math.max(
                  previous - 1,
                  1,
                ),
            )
          }
          className="inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-dark-700"
        >
          <ChevronLeftIcon className="size-4" />
        </button>

        {/* PAGE NUMBERS */}

        {Array.from(
          {
            length:
              totalPages,
          },

          (_, index) =>
            index + 1,
        ).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() =>
              setCurrentPage(
                page,
              )
            }
            className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-medium ${
              currentPage ===
              page
                ? "bg-primary-500 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-700"
            }`}
          >
            {page}
          </button>
        ))}

        {/* NEXT */}

        <button
          type="button"
          disabled={
            currentPage ===
            totalPages
          }
          onClick={() =>
            setCurrentPage(
              (previous) =>
                Math.min(
                  previous + 1,
                  totalPages,
                ),
            )
          }
          className="inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-dark-700"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
    </div>

    {/* RECORD INFORMATION */}

    <div className="order-3 flex items-center justify-center text-sm text-gray-500 md:w-1/3 md:justify-end dark:text-gray-400">
      <span>
        {indexOfFirstItem + 1}
        {" - "}

        {Math.min(
          indexOfLastItem,
          totalItems,
        )}

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