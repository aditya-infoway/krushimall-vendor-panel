import React, { useMemo, useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Listbox } from "@/components/shared/form/StyledListbox";
import apiHelper from "@/utils/apiHelper";
import { useNavigate } from "react-router-dom";

// ---------- Types ----------
interface AccessoriesAllotRow {
  id: number;
  accountName: string;
  mobileNo: string;
  quotationNo: string;
  dmsEnquiryNo: string;
  dmsEnquiryDate: string;
  salesExecutive: string;
  model: string;
  variant: string;
  color: string;
  chassisNo: string;
  numberOfAccessories: number;
  status: string;
}

// ---------- Options ----------
const entriesOptions = [
  { id: 10, name: "10" },
  { id: 15, name: "15" },
  { id: 25, name: "25" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

const columns = [
  "#",
  "Account Name",
  "Mobile No",
  "Q. No",
  "DMS Enquiry No",
  "DMS Enquiry Date",
  "Sales Executive",
  "Model",
  "Variant",
  "Color",
  "Chassis No",
  "Number of Accessories",
  "Action",
  "Status",
];

const AccessoriesAllot: React.FC = () => {
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<AccessoriesAllotRow[]>([]);
  const navigate = useNavigate();

  // Fetch accessories allotment data
  const fetchAccessoriesAllot = async () => {
    try {
      const res = await apiHelper.get("/orders/accessories-allot");
    
      setRows(res.data || []);
    } catch (error: any) {
      console.error(
        "Failed to fetch accessories allot list:",
        error.response?.data || error,
      );
      setRows([]);
    }
  };

  useEffect(() => {
    fetchAccessoriesAllot();
  }, []);

  // Filter rows
  const filteredRows = useMemo(() => {
    let result = rows;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        [
          r.accountName,
          r.mobileNo,
          r.quotationNo,
          r.dmsEnquiryNo,
          r.model,
          r.variant,
          r.chassisNo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    return result;
  }, [rows, search]);

  const totalItems = filteredRows.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  // Handle status completion
  const handleComplete = async (id: number) => {
    try {
      await apiHelper.patch(`/orders/accessories-allot/${id}`);
      setRows((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, status: "completed" } : row,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Handle view action
const handleView = (item: AccessoriesAllotRow) => {
  navigate(`/allot/accessories-allot/${item.id}`);
};

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Accessories Allotment
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all accessories allotment from here
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="size-4.5 text-gray-400" />
            Excel
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by account name, model, chassis no..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="dark:border-dark-500 dark:bg-dark-800 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm transition-all duration-200 outline-none focus:ring-2"
          />
        </div>
      </div>

      {/* Table */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table
            hoverable
            className="w-full min-w-550 text-left [&_.table-th]:font-semibold"
          >
            <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
              <Tr>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  S.No
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Account Name
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Mobile No
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Q. No
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  DMS Enquiry No
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  DMS Enquiry Date
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Sales Executive
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Model
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Variant
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Color
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Chassis No
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Number of Accessories
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Action
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Status
                </Th>
              </Tr>
            </THead>

            <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
              {currentItems.map((item, index) => (
                <Tr
                  key={item.id}
                  className="dark:hover:bg-dark-700/40 transition-colors hover:bg-gray-50/30"
                >
                  <Td className="py-4 font-medium text-gray-500">
                    {indexOfFirstItem + index + 1}
                  </Td>
                  <Td>{item.accountName}</Td>
                  <Td>{item.mobileNo}</Td>
                  <Td>{item.quotationNo}</Td>
                  <Td>{item.dmsEnquiryNo}</Td>
                  <Td>{item.dmsEnquiryDate}</Td>
                  <Td>{item.salesExecutive}</Td>
                  <Td>{item.model}</Td>
                  <Td>{item.variant}</Td>
                  <Td>{item.color}</Td>
                  <Td>{item.chassisNo}</Td>
                  <Td>{item.numberOfAccessories}</Td>
                  <Td>
                    <button
                      onClick={() => handleView(item)}
                      className="text-primary-500 hover:text-primary-600 transition-colors cursor-pointer" 
                      title="View details"
                    >
                      <EyeIcon className="size-5" />
                    </button>
                  </Td>
                  <Td>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </Td>
                </Tr>
              ))}

              {currentItems.length === 0 && (
                <Tr>
                  <Td
                    colSpan={columns.length}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No accessories allotment records found
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 rounded-b-xl border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
            <div className="order-1 flex items-center justify-center gap-2 text-sm text-gray-600 md:w-1/3 md:justify-start dark:text-gray-400">
              <span>Show</span>
              <Listbox
                data={entriesOptions}
                value={
                  entriesOptions.find((o) => o.id === rowsPerPage) ||
                  entriesOptions[0]
                }
                onChange={(opt: any) => {
                  setRowsPerPage(opt.id);
                  setCurrentPage(1);
                }}
                displayField="name"
                className="w-20"
              />
              <span>entries</span>
            </div>

            <div className="order-2 flex justify-center md:w-1/3">
              <div className="dark:border-dark-700 dark:bg-dark-800 inline-flex items-center space-x-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                        page === currentPage
                          ? "bg-primary-500 text-white"
                          : "dark:hover:bg-dark-700 text-gray-600 hover:bg-gray-100 dark:text-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
            </div>

            <div className="order-3 flex items-center justify-center text-sm text-gray-500 select-none md:w-1/3 md:justify-end dark:text-gray-400">
              <span>
                {totalItems === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessoriesAllot;