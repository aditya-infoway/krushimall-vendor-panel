import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  RadialBarChart,
  RadialBar,
  LineChart,
  BarChart,
  Bar,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { useState,useEffect } from "react";
import apiHelper from "@/utils/apiHelper";
// ---------- Types ----------
// interface Member {
//   id: number;
//   name: string;
//   amount: number;
// }

// interface Transaction {
//   memberId: number;
//   name: string;
//   amount: number;
//   txnId: string;
// }

// interface WeeklySalesData {
//   day: string;
//   sales: number;
// }

// interface RevenueData {
//   name: string;
//   value: number;
// }

// interface OrderData {
//   value: number;
// }

interface PieData {
  name: string;
  value: number;
}

// interface CustomerData {
//   name: string;
//   value: number;
//   fill: string;
// }

// interface SalesData {
//   week: number;
//   sales: number;
// }

// interface MiniBarData {
//   name: string;
//   value: number;
// }

// interface MiniLineData {
//   name: string;
//   value: number;
// }

interface ModelAnalysisRow {
  model: string;
  present: number;
  transit: number;
  purchase: number;
  sales: number;
}

interface MainTableRow {
  srNo: number;
  model: string;
  variant: string;
  colour: string;
  purchaseOrder: string;
  present: number;
  transit: number;
  hot: number;
  booked: number;
  lost: number;
}

export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage] = React.useState(10);
const today = new Date();

const fyStartDate = sessionStorage.getItem("fyStartDate");

const [fromDate, setFromDate] = useState<Date | string>(
  fyStartDate ? new Date(fyStartDate) : today
);
const [toDate, setToDate] = useState<Date | string>(today);
  // const members: Member[] = [
  //   { id: 101, name: "Nitin", amount: 5000 },
  //   { id: 102, name: "Rahul", amount: 3200 },
  //   { id: 103, name: "Amit", amount: 7800 },
  //   { id: 104, name: "Vikas", amount: 4500 },
  //   { id: 105, name: "Suresh", amount: 6100 },
  //   { id: 106, name: "Bhavik", amount: 8100 },
  //   { id: 107, name: "Ram", amount: 7100 },
  //   { id: 108, name: "Dipesh", amount: 9100 },
  //   { id: 109, name: "Dixit", amount: 5100 },
  // ];

  // const transactions: Transaction[] = [
  //   { memberId: 101, name: "Nitin", amount: 5000, txnId: "TXN001" },
  //   { memberId: 102, name: "Rahul", amount: 3200, txnId: "TXN002" },
  //   { memberId: 103, name: "Amit", amount: 7800, txnId: "TXN003" },
  //   { memberId: 104, name: "Vikas", amount: 4500, txnId: "TXN004" },
  //   { memberId: 105, name: "Suresh", amount: 6100, txnId: "TXN005" },
  //   { memberId: 106, name: "Kunal", amount: 2900, txnId: "TXN006" },
  //   { memberId: 107, name: "Rohit", amount: 8800, txnId: "TXN007" },
  //   { memberId: 108, name: "Pankaj", amount: 5400, txnId: "TXN008" },
  //   { memberId: 109, name: "Jay", amount: 3600, txnId: "TXN009" },
  //   { memberId: 110, name: "Manish", amount: 9200, txnId: "TXN010" },
  // ];
const [leadSummary, setLeadSummary] = useState({
  hot: 0,
  warm: 0,
  cold: 0,
  booked: 0,
  total: 0,
});

 const [modelAnalysisData, setModelAnalysisData] = useState<ModelAnalysisRow[]>([]);
const [pieChartData, setPieChartData] = useState<PieData[]>([]);

 const [mainTableData, setMainTableData] = useState<MainTableRow[]>([]);
const formatDateParam = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) return ""; // invalid date guard

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// const fetchInventoryAnalysis = async () => {
//   try {
//     const params = new URLSearchParams();
//     const from = fromDate ? formatDateParam(fromDate) : "";
//     const to = toDate ? formatDateParam(toDate) : "";

//     if (from) params.append("fromDate", from);
//     if (to) params.append("toDate", to);

//     const res = await apiHelper.get(
//       `/purchases/model-analysis?${params.toString()}`,
//     );

//     const analysis = res.data.modelAnalysis || [];

//     setModelAnalysisData(
//       analysis.map((item: any) => ({
//         model: item.model,
//         present: item.present,
//         transit: item.transit,
//         purchase: item.purchase,
//         sales: item.sales,
//       })),
//     );

//     setPieChartData(res.data.pieData || []);
//   } catch (error) {
//     console.error("Failed to fetch inventory analysis:", error);
//   }
// };

// const fetchInventoryDetails = async () => {
//   try {
//     const params = new URLSearchParams();
//     const from = fromDate ? formatDateParam(fromDate) : "";
//     const to = toDate ? formatDateParam(toDate) : "";

//     if (from) params.append("fromDate", from);
//     if (to) params.append("toDate", to);

//     const res = await apiHelper.get(
//       `/purchases/inventory-details?${params.toString()}`,
//     );
//     setMainTableData(res.data || []);
//   } catch (error) {
//     console.error("Failed to fetch inventory details:", error);
//   }
// };

// const fetchLeadSummary = async () => {
//   try {
//     const res = await apiHelper.get("/leads");

//     let leads = res.data;

//     if (fromDate) {
//       const start = new Date(fromDate); // string ho ya Date, dono se valid Date banta hai
//       start.setHours(0, 0, 0, 0);
//       leads = leads.filter((l: any) => new Date(l.createdAt) >= start);
//     }
//     if (toDate) {
//       const end = new Date(toDate);
//       end.setHours(23, 59, 59, 999);
//       leads = leads.filter((l: any) => new Date(l.createdAt) <= end);
//     }

//     setLeadSummary({
//       hot: leads.filter((l: any) => l.leadStatus === "Hot").length,
//       warm: leads.filter((l: any) => l.leadStatus === "Warm").length,
//       cold: leads.filter((l: any) => l.leadStatus === "Cold").length,
//       booked: leads.filter((l: any) => l.leadStatus === "Booked").length,
//       total: leads.length,
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };
const PIE_COLORS = ["#22c55e", "#3b82f6", "#8b5cf6"]; // Present, Transit, Booked

  // Pagination logic
  const totalItems = mainTableData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = mainTableData.slice(indexOfFirstItem, indexOfLastItem);


// useEffect(() => {
//   fetchLeadSummary();
//   fetchInventoryAnalysis();
//   fetchInventoryDetails();
// }, [fromDate, toDate]);
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 12;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 6) {
        for (let i = 1; i <= 10; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 5) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 9; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 4; i <= currentPage + 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="dark:bg-dark-800 min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to the admin inventory!
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0">
          {/* Date Picker */}
          <div className="flex items-center gap-2">
 <DatePicker
  value={fromDate}
  onChange={(dates) => {
    if (dates && dates.length > 0) {
      setFromDate(dates[0]);
    }
  }}
  placeholder="From Date"
/>
            <span className="text-gray-400">to</span>
    <DatePicker
  value={toDate}
  onChange={(dates) => {
    if (dates && dates.length > 0) {
      setToDate(dates[0]);
    }
  }}
  placeholder="To Date"
/>
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-1.5">
            {/* PDF Button */}
            <button className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:px-3 sm:py-2 dark:text-gray-300">
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Excel Button */}
            <button className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:px-3 sm:py-2 dark:text-gray-300">
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            {/* Refresh Button */}
           <button
  onClick={() => {
    fetchLeadSummary();
    fetchInventoryAnalysis();
    fetchInventoryDetails();
  }}
  className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white p-1.5 text-gray-600 hover:bg-gray-50 sm:p-2 dark:text-gray-300"
>
  <ArrowPathIcon className="h-4 w-4" />
</button>
          </div>
        </div>
      </div>
      {/* 4 Stats Cards */}
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {/* Hot Lead */}
  <div className="rounded-xl bg-linear-to-br from-red-500 to-red-600 p-5 text-white shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-90">Hot Lead</p>
        <p className="mt-1 text-3xl font-bold">{leadSummary.hot}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
    </div>
  </div>

  {/* Warm Lead */}
  <div className="rounded-xl bg-linear-to-br from-orange-400 to-orange-500 p-5 text-white shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-90">Warm Lead</p>
        <p className="mt-1 text-3xl font-bold">{leadSummary.warm}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </div>
  </div>

  {/* Cold Lead */}
  <div className="rounded-xl bg-linear-to-br from-blue-400 to-blue-600 p-5 text-white shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-90">Cold Lead</p>
        <p className="mt-1 text-3xl font-bold">{leadSummary.cold}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </div>
  </div>

  {/* Total Lead */}
 <div className="rounded-xl bg-linear-to-br from-green-500 to-green-600 p-5 text-white shadow-lg"> <div className="flex items-center justify-between"> <div> <p className="text-sm font-medium opacity-90">Booked Lead</p> <p className="mt-1 text-3xl font-bold">  {leadSummary.booked}</p>  </div> <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"> <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> </div> </div> </div> </div>
      {/* Pie Chart + Model Analysis in one row */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left - Pie Chart */}
        <div className="dark:bg-dark-700 dark:border-dark-600 flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Lead Distribution
          </h3>
          <div className="h-85 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart
                margin={{
                  top: 20,
                  right: isMobile ? 10 : 50,
                  bottom: 20,
                  left: isMobile ? 10 : 50,
                }}
              >
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={
                    isMobile
                      ? false
                      : ({ name, percent }) =>
                          `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value}`, "Count"]}
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    paddingTop: "10px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right - Model Analysis Table */}
        <div className="dark:bg-dark-700 dark:border-dark-600 rounded-2xl border border-gray-200 bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Model Analysis
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-min-w-162.5 border-collapse text-sm">
              <thead className="dark:bg-dark-600 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Model
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Present
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Transit
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Purchase
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Sales
                  </th>
                </tr>
              </thead>
              <tbody className="dark:divide-dark-600 divide-y divide-gray-200">
                {modelAnalysisData.map((item, index) => (
                  <tr
                    key={index}
                    className="dark:hover:bg-dark-600 whitespace-nowrap transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900 dark:text-white">
                      {item.model}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                      {item.present}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                      {item.transit}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                      {item.purchase}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                      {item.sales}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="dark:bg-dark-700 dark:border-dark-600 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Inventory Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="dark:bg-dark-600 bg-gray-50 whitespace-nowrap">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Sr No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Variant
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Colour
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Purchase Order
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Present
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Transit
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Hot
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Booked
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Lost
                </th>
              </tr>
            </thead>
            <tbody className="dark:divide-dark-600 divide-y divide-gray-200">
              {currentItems.map((item, index) => (
                <tr
                  key={index}
                  className="dark:hover:bg-dark-600 whitespace-nowrap transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {item.srNo}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {item.model}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {item.variant}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.colour.toLowerCase() }}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        {item.colour}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {item.purchaseOrder}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-green-600 dark:text-green-400">
                    {item.present}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-blue-600 dark:text-blue-400">
                    {item.transit}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-red-600 dark:text-red-400">
                    {item.hot}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-purple-600 dark:text-purple-400">
                    {item.booked}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
                    {item.lost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="dark:border-dark-600 dark:bg-dark-800 flex flex-col items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row">
          <div className="mb-3 text-sm text-gray-500 sm:mb-0 dark:text-gray-400">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="dark:hover:bg-dark-600 flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            {getPageNumbers().map((page, index) =>
              typeof page === "number" ? (
                <button
                  key={index}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-green-600 text-white shadow-md shadow-green-600/30"
                      : "dark:hover:bg-dark-600 text-gray-600 hover:bg-gray-200 dark:text-gray-400"
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span
                  key={index}
                  className="flex h-8 w-8 items-center justify-center text-gray-400 dark:text-gray-500"
                >
                  {page}
                </span>
              ),
            )}

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
      </div>
    </div>
  );
}
