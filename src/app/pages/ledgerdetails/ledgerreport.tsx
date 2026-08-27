import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiCalendar,
  FiX,
  FiChevronDown,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Search } from "lucide-react";
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { useEffect } from "react";
import apiHelper from "@/utils/apiHelper";
interface LedgerAccount {
  id: number;
  accountName: string;
  group: string;
  address: string;
  city: string;
  state: string;
  closingBalance: number;
  drCr: string;
}

interface FilterData {
  fromDate: string;
  toDate: string;
  displayType: string;
}

const LedgerReport: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [activeTab, setActiveTab] = useState<"all" | "ledger" | "default">(
    "ledger",
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
 
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [search, setSearch] = useState("");
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const today = new Date();

  const [filterData, setFilterData] = useState<FilterData>({
    fromDate: "01-04-2026", // or make this dynamic if needed
    toDate: formatDate(today),
    displayType: "",
  });
const [ledgerData, setLedgerData] = useState<LedgerAccount[]>([]);

// NEW: filter ledgerData by the search box before paginating
const filteredData = ledgerData.filter((item) => {
  const q = search.toLowerCase();
  return (
    item.accountName?.toLowerCase().includes(q) ||
    item.group?.toLowerCase().includes(q) ||
    item.address?.toLowerCase().includes(q) ||
    item.city?.toLowerCase().includes(q) ||
    item.state?.toLowerCase().includes(q)
  );
});

const totalPages = Math.ceil(filteredData.length / rowsPerPage);
const startIndex = (currentPage - 1) * rowsPerPage;
const endIndex = startIndex + rowsPerPage;
const currentData = filteredData.slice(startIndex, endIndex);
useEffect(() => {
  setCurrentPage(1);
}, [search]);
  const getLedgerAccounts = async () => {
    try {
      const res = await apiHelper.get("/accounts");



      setLedgerData(
        (res.data || res).map((item: any) => ({
          id: item.id,
          accountName: item.accountName,
          group: item.group,
          address: item.address1 || "",
          city: item.city || "",
          state: item.state || "",
          closingBalance: Number(item.closingBalance || 0),
          drCr: item.drCr || "",
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getLedgerAccounts();
  }, []);
  const handleViewClick = (account: any) => {
    setSelectedAccount(account);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleDrawerOk = () => {
    setIsDrawerOpen(false);
    navigate("/ledgerdetails/ledgerdetails", {
      state: {
        accountId: selectedAccount.id,
        accountName: selectedAccount.accountName,
        filterData,
      },
    });
  };

  // Get page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };
  const downloadExcel = async () => {
    const blob = await apiHelper.getBlob("/ledger/export");

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "LedgerReport.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };
  return (
    <div className="dark:bg-dark-800 min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ledger Report
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all ledger report
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 md:mt-0">
          <div className="dark:bg-dark-700 dark:border-dark-600 flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <button
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === "all"
                  ? "bg-primary-500 text-white"
                  : "dark:hover:bg-dark-600 text-gray-600 hover:bg-gray-100 dark:text-gray-300"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
            <button
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === "ledger"
                  ? "bg-primary-500 text-white"
                  : "dark:hover:bg-dark-600 text-gray-600 hover:bg-gray-100 dark:text-gray-300"
              }`}
              onClick={() => setActiveTab("ledger")}
            >
              Ledger
            </button>
            <button
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === "default"
                  ? "bg-primary-500 text-white"
                  : "dark:hover:bg-dark-600 text-gray-600 hover:bg-gray-100 dark:text-gray-300"
              }`}
              onClick={() => setActiveTab("default")}
            >
              Default
            </button>
          </div>
          <div className="flex gap-1.5">
            <button className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex h-9.5 w-9.5 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:text-gray-300">
              <RiFilePdfFill className="text-lg text-red-500" />
            </button>
            <button
              onClick={downloadExcel}
              className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:text-gray-300"
            >
              <RiFileExcel2Fill className="text-lg text-green-500" />
            </button>
            <button className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex h-9.5 w-9.5 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:text-gray-300">
              <FiRefreshCw className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative mb-5 w-full max-w-md">
        <Search className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search contra entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>

      <div className="dark:bg-dark-700 dark:border-dark-600 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="dark:bg-dark-600 bg-gray-50">
              <tr className="whitespace-nowrap">
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Sr No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Account Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Group
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  City
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  State
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Closing Balance
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="dark:divide-dark-600 divide-y divide-gray-100">
              {currentData.map((item, index) => (
                <tr
                  key={index}
                  className="dark:hover:bg-dark-600 whitespace-nowrap transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {item.accountName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {item.group}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {item.address}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {item.city}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {item.state}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    ₹{Number(item.closingBalance).toFixed(2)} {item.drCr}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      className="dark:border-dark-500 dark:bg-dark-700 hover:border-primary-500 dark:hover:bg-dark-600 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white transition-all hover:bg-gray-50"
                      onClick={() => handleViewClick(item)}
                    >
                      <FiEye className="text-primary-500" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 rounded-b-xl border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
              <div className="order-1 flex items-center justify-center gap-2 text-sm text-gray-600 md:w-1/3 md:justify-start dark:text-gray-400">
                <span>Show</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="dark:border-dark-600 dark:bg-dark-700 focus:ring-primary-500 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:ring-2 focus:outline-none dark:text-gray-200"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
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
                    <FiChevronLeft className="size-4" />
                  </button>

                  {getPageNumbers().map((page, index) =>
                    typeof page === "number" ? (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                          page === currentPage
                            ? "bg-primary-600 text-white"
                            : "dark:hover:bg-dark-700 text-gray-600 hover:bg-gray-100 dark:text-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span
                        key={index}
                        className="inline-flex size-8 items-center justify-center text-sm text-gray-400 dark:text-gray-500"
                      >
                        {page}
                      </span>
                    ),
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
                  >
                    <FiChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              <div className="order-3 flex items-center justify-center text-sm text-gray-500 select-none md:w-1/3 md:justify-end dark:text-gray-400">
                <span>
                  {totalPages === 0 ? 0 : startIndex + 1} -{" "}
                  {Math.min(endIndex, ledgerData.length)} of {ledgerData.length}{" "}
                  entries
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Drawer Modal - Matches Theme */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={handleDrawerClose}
          />

          {/* Drawer */}
          <div className="dark:bg-dark-800 animate-slideInRight absolute top-0 right-0 h-full w-full max-w-lg transform bg-white shadow-2xl transition-transform">
            <div className="flex h-full flex-col">
              {/* Header - Matches Theme */}
              <div className="dark:border-dark-600 flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-bold text-white">Ledger Report</h2>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors"
                  onClick={handleDrawerClose}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      From Date
                    </label>
                    <DatePicker
                      placeholder="From Date"
                      options={{ disableMobile: true }}
                      value={filterData.fromDate}
                      onChange={(date: any) =>
                        setFilterData({ ...filterData, fromDate: date })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      To Date
                    </label>
                    <DatePicker
                      placeholder="To Date"
                      options={{ disableMobile: true }}
                      value={filterData.toDate}
                      onChange={(date: any) =>
                        setFilterData({ ...filterData, toDate: date })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Display Type
                    </label>
                    <div className="relative">
                      <select
                        className="dark:border-dark-600 dark:bg-dark-700 focus:border-primary-500 focus:ring-primary-500/20 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 focus:ring-2 focus:outline-none dark:text-white"
                        value={filterData.displayType}
                        onChange={(e) =>
                          setFilterData({
                            ...filterData,
                            displayType: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Display Type</option>
                        <option value="summary">Summary</option>
                        <option value="detailed">Detailed</option>
                      </select>
                      <FiChevronDown
                        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Matches Theme */}
              <div className="dark:border-dark-600 border-t border-gray-200 px-6 py-4">
                <div className="flex justify-end gap-3">
                  <button
                    className="dark:border-dark-600 dark:hover:bg-dark-700 cursor-pointer rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300"
                    onClick={handleDrawerClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-primary-500 hover:bg-priamry-600 cursor-pointer rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors"
                    onClick={handleDrawerOk}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default LedgerReport;
