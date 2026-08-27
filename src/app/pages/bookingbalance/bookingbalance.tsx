import React, { useState,useEffect } from "react";
import {
  DocumentArrowDownIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { DatePicker } from "@/components/shared/form/Datepicker";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
import apiHelper from "@/utils/apiHelper";
interface BookingRow {
  sr: number;
  leadDate: string;
  leadId: string;
  dmsEnquiryNo: string;
  dmsEnquiryDate: string;
  customerName: string;
  contact: string;
  model: string;
  variant: string;
  colour: string;
  ageLead: string;
  invoiceAmount: string;
  receivedAmount: string;
  pendingAmount: string;
  suggestChassisNo: string;
  paymentHistory: string;
}

interface ModelAnalysisRow {
  model: string;
  totalLead: number;
  bookedLead: number;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const BookingBalance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(15);
  const [collapsed, setCollapsed] = useState(false);

  // Sample table data (empty for now)
const [tableData, setTableData] = useState<BookingRow[]>([]);

const [modelAnalysisData, setModelAnalysisData] = useState<ModelAnalysisRow[]>([]);

  const totalLeads = modelAnalysisData.reduce(
    (sum, row) => sum + row.totalLead,
    0,
  );
  const totalBooked = modelAnalysisData.reduce(
    (sum, row) => sum + row.bookedLead,
    0,
  );

  const pieData =
    modelAnalysisData.length > 0
      ? modelAnalysisData.map((row) => ({
          name: row.model,
          value: row.totalLead,
        }))
      : [{ name: "No Data", value: 1 }];

  // Summary data

const [summaryData, setSummaryData] = useState({
  invoiceAmount: "0.00",
  pendingAmount: "0.00",
  receivedAmount: "0.00",
});

const [loading, setLoading] = useState(false);

  // Pagination
  const totalItems = tableData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
const fetchBookingBalance = async () => {
  try {
    setLoading(true);

    const response = await apiHelper.get("/leads/booking-balance");

    // apiHelper interceptor unwraps to response.data.data,
    // so everything backend sends must live under "data".
    // Backend now returns: { summary, modelAnalysis, rows }
    const payload = response.data || {};

    setTableData(payload.rows || []);

    setSummaryData(
      payload.summary || {
        invoiceAmount: "0.00",
        pendingAmount: "0.00",
        receivedAmount: "0.00",
      },
    );

    setModelAnalysisData(payload.modelAnalysis || []);
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchBookingBalance();
}, []);
  return (
    <div className="dark:bg-dark-800 min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-5 xl:p-6">
      <div className="mx-auto w-full max-w-[1920px]">
        {/* Card wrapper */}

        {/* Header */}
        <div className="dark:border-dark-600 flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between lg:p-5">
          <h2 className="text-primary-600 dark:text-primary-400 text-lg font-bold underline decoration-2 underline-offset-4">
            Booking Balance
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="dark:border-dark-600 dark:bg-dark-700 flex items-center gap-1 rounded-lg border border-gray-300 bg-white py-1.5">
              <DatePicker
                options={{
                  mode: "range",
                  dateFormat: "d-m-Y", // Changed from "Y-m-d" to "d-m-y"
                  defaultDate: dateRange || undefined,
                }}
                placeholder="Choose date from to"
                onChange={(dates) => {
                  if (dates && dates.length === 2) {
                    const [from, to] = dates;
                    if (
                      from instanceof Date &&
                      !isNaN(from.getTime()) &&
                      to instanceof Date &&
                      !isNaN(to.getTime())
                    ) {
                      const formatDate = (date: Date) => {
                        const day = String(date.getDate()).padStart(2, "0");
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const year = String(date.getFullYear());
                        return `${day}-${month}-${year}`;
                      };
                      setDateRange([formatDate(from), formatDate(to)]);
                    }
                  } else {
                    setDateRange(null);
                  }
                }}
                className="w-64 border-none p-0 text-sm outline-none"
              />
            </div>

            {/* PDF Button - Icon only */}
            <button className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:text-gray-300">
              <RiFilePdfFill className="h-4 w-4" />
            </button>

            {/* Excel Button - Icon only */}
            <button className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:text-gray-300">
              <RiFileExcel2Fill className="h-4 w-4" />
            </button>

            {/* Refresh Button */}
            <button className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:text-gray-300">
              <ArrowPathIcon className="h-4 w-4" />
            </button>

            {/* Collapse Button */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:text-gray-300"
            >
              <ChevronUpIcon
                className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="p-4 lg:p-5">
            {/* Summary Cards */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Invoice Amount - Blue */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 shadow-lg">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="text-xs font-semibold tracking-wider text-blue-100 uppercase">
                    Invoice Amount
                  </div>
                  <div className="mt-2 text-[26px] font-bold text-white">
                    ₹{summaryData.invoiceAmount}
                  </div>
                </div>
              </div>

              {/* Pending Amount - Red */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 p-5 shadow-lg">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="text-xs font-semibold tracking-wider text-rose-100 uppercase">
                    Pending Amount
                  </div>
                  <div className="mt-2 text-[26px] font-bold text-white">
                    ₹{summaryData.pendingAmount}
                  </div>
                </div>
              </div>

              {/* Received Amount - Teal */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 shadow-lg">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="text-xs font-semibold tracking-wider text-emerald-100 uppercase">
                    Received Amount
                  </div>
                  <div className="mt-2 text-[26px] font-bold text-white">
                    ₹{summaryData.receivedAmount}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart + Model Analysis */}
            <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {/* Pie Chart */}
              <div className="dark:border-dark-600 dark:bg-dark-800 flex items-center justify-center rounded-xl border border-gray-200 bg-white p-4">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ percent }) =>
                          `${((percent ?? 0) * 100).toFixed(1)}%`
                        }
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Model Analysis Table */}
              <div className="dark:border-dark-600 overflow-hidden rounded-xl border border-gray-200">
                <div className="bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white">
                  Model Analysis
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="dark:bg-dark-600 bg-gray-50">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Model
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Total Lead
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Booked Lead
                        </th>
                      </tr>
                    </thead>
                    <tbody className="dark:divide-dark-600 dark:bg-dark-800 divide-y divide-gray-200 bg-white">
                      {modelAnalysisData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                          >
                            No data available
                          </td>
                        </tr>
                      ) : (
                        modelAnalysisData.map((row, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2.5 text-center text-gray-900 dark:text-white">
                              {row.model}
                            </td>
                            <td className="px-3 py-2.5 text-center text-gray-900 dark:text-white">
                              {row.totalLead}
                            </td>
                            <td className="px-3 py-2.5 text-center text-gray-900 dark:text-white">
                              {row.bookedLead}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="dark:bg-dark-600 dark:border-dark-600 border-t border-gray-200 bg-gray-50">
                        <td className="px-3 py-2.5 text-center text-sm font-bold text-gray-900 dark:text-white">
                          Total
                        </td>
                        <td className="px-3 py-2.5 text-center text-sm font-bold text-gray-900 dark:text-white">
                          {totalLeads}
                        </td>
                        <td className="px-3 py-2.5 text-center text-sm font-bold text-gray-900 dark:text-white">
                          {totalBooked}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Table controls: rows per page + search */}
            <div className="mb-3 flex flex-col items-end justify-end gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto sm:max-w-60">
                <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-700 h-9.5 w-full rounded-lg border border-gray-300 bg-white pr-3 pl-9 text-sm text-gray-900 transition-all outline-none focus:ring-2 dark:text-white dark:placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="dark:border-dark-600 overflow-hidden rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="dark:bg-dark-600 bg-gray-50 whitespace-nowrap">
                    <tr className=" whitespace-nowrap">
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        #
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Lead Date
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Lead Id
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        DMS Enquiry No
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        DMS Enquiry Date
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Customer Name
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Contact
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Model
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Variant
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Colour
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Age Lead
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Invoice Amount
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Received Amount
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Pending Amount
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Suggest Chassis No
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Payment History
                      </th>
                    </tr>
                  </thead>
                  <tbody className="dark:divide-dark-600 divide-y divide-gray-200">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={16}
                          className="py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          No data available in table
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((row, index) => (
                        <tr
                          key={index}
                          className="dark:hover:bg-dark-600 transition-colors hover:bg-gray-50 whitespace-nowrap"
                        >
                          <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">
                            {row.sr}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                            {row.leadDate
  ? new Date(row.leadDate).toLocaleDateString("en-IN")
  : "-"}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                            {row.leadId}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                            {row.dmsEnquiryNo}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                          
                            {row.dmsEnquiryDate
  ? new Date(row.dmsEnquiryDate).toLocaleDateString("en-IN")
  : "-"}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                            {row.customerName}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                            {row.contact}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                            {row.model}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                            {row.variant}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                            {row.colour}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                            {row.ageLead}
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-900 dark:text-white">
                            {row.invoiceAmount}
                          </td>
                          <td className="px-3 py-2.5 text-right text-green-600 dark:text-green-400">
                            {row.receivedAmount}
                          </td>
                          <td className="px-3 py-2.5 text-right text-red-600 dark:text-red-400">
                            {row.pendingAmount}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                            {row.suggestChassisNo}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                            {row.paymentHistory}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalItems > 0 && (
                <div className="dark:border-dark-600 dark:bg-dark-800 flex flex-col items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row">
                  <div className="mb-3 text-sm text-gray-500 sm:mb-0 dark:text-gray-400">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, totalItems)} of {totalItems}{" "}
                    entries
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="dark:hover:bg-dark-600 flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
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
                          onClick={() => setCurrentPage(page)}
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
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
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="dark:hover:bg-dark-600 flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingBalance;
