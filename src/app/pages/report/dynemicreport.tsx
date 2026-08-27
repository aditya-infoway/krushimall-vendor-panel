// src/app/pages/reports/dynamicreport.tsx
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { DatePicker } from "@/components/shared/form/Datepicker";

// ---------- Types ----------
interface ChartData {
  name: string;
  value: number;
}

interface ModelAnalysisRow {
  model: string;
  enquiry: number;
  hot: number;
}

interface DynamicTableRow {
  srNo: number;
  model: string;
  variant: string;
  colour: string;
  totalEnquiry: number;
  pending: number;
  lost: number;
  alloted: number;
  sold: number;
  regiProcess: number;
  stock: number;
  transit: number;
}

// ---------- Sample Data ----------
const chartData: ChartData[] = [
  { name: "Model-1", value: 100 },
  { name: "Model-2", value: 200 },
  { name: "Model-3", value: 80 },
  { name: "Model-4", value: 200 },
];

const modelAnalysisData: ModelAnalysisRow[] = [
  { model: "Mahindra 265 DI", enquiry: 45, hot: 18 },
  { model: "Swaraj 744 FE", enquiry: 38, hot: 12 },
  { model: "Eicher 380", enquiry: 52, hot: 20 },
  { model: "John Deere 5050", enquiry: 28, hot: 10 },
  { model: "New Holland 3630", enquiry: 33, hot: 15 },
  { model: "Mahindra 575 DI", enquiry: 40, hot: 22 },
  { model: "Swaraj 855 FE", enquiry: 25, hot: 8 },
  { model: "Eicher 480", enquiry: 48, hot: 25 },
];

const dynamicTableData: DynamicTableRow[] = [
  {
    srNo: 1,
    model: "Mahindra 265 DI",
    variant: "Deluxe",
    colour: "Red",
    totalEnquiry: 45,
    pending: 5,
    lost: 3,
    alloted: 10,
    sold: 12,
    regiProcess: 8,
    stock: 15,
    transit: 7,
  },
  {
    srNo: 2,
    model: "Swaraj 744 FE",
    variant: "Standard",
    colour: "Blue",
    totalEnquiry: 38,
    pending: 4,
    lost: 2,
    alloted: 8,
    sold: 10,
    regiProcess: 6,
    stock: 12,
    transit: 5,
  },
  {
    srNo: 3,
    model: "Eicher 380",
    variant: "Premium",
    colour: "Green",
    totalEnquiry: 52,
    pending: 6,
    lost: 4,
    alloted: 12,
    sold: 15,
    regiProcess: 10,
    stock: 18,
    transit: 8,
  },
  {
    srNo: 4,
    model: "John Deere 5050",
    variant: "Base",
    colour: "Yellow",
    totalEnquiry: 28,
    pending: 3,
    lost: 1,
    alloted: 6,
    sold: 8,
    regiProcess: 4,
    stock: 10,
    transit: 3,
  },
  {
    srNo: 5,
    model: "New Holland 3630",
    variant: "Plus",
    colour: "White",
    totalEnquiry: 33,
    pending: 4,
    lost: 2,
    alloted: 8,
    sold: 9,
    regiProcess: 5,
    stock: 11,
    transit: 4,
  },
  {
    srNo: 6,
    model: "Mahindra 575 DI",
    variant: "Premium",
    colour: "Black",
    totalEnquiry: 40,
    pending: 5,
    lost: 3,
    alloted: 10,
    sold: 11,
    regiProcess: 7,
    stock: 14,
    transit: 6,
  },
  {
    srNo: 7,
    model: "Swaraj 855 FE",
    variant: "Deluxe",
    colour: "Orange",
    totalEnquiry: 25,
    pending: 2,
    lost: 1,
    alloted: 5,
    sold: 7,
    regiProcess: 3,
    stock: 8,
    transit: 2,
  },
  {
    srNo: 8,
    model: "Eicher 480",
    variant: "Standard",
    colour: "Red",
    totalEnquiry: 48,
    pending: 6,
    lost: 4,
    alloted: 12,
    sold: 14,
    regiProcess: 9,
    stock: 16,
    transit: 7,
  },
  {
    srNo: 9,
    model: "John Deere 5075",
    variant: "Premium",
    colour: "Green",
    totalEnquiry: 30,
    pending: 3,
    lost: 2,
    alloted: 7,
    sold: 8,
    regiProcess: 5,
    stock: 10,
    transit: 4,
  },
  {
    srNo: 10,
    model: "New Holland 4710",
    variant: "Base",
    colour: "Blue",
    totalEnquiry: 22,
    pending: 2,
    lost: 1,
    alloted: 5,
    sold: 6,
    regiProcess: 3,
    stock: 7,
    transit: 2,
  },
  {
    srNo: 11,
    model: "Mahindra 265 DI",
    variant: "Plus",
    colour: "White",
    totalEnquiry: 35,
    pending: 4,
    lost: 2,
    alloted: 9,
    sold: 10,
    regiProcess: 6,
    stock: 12,
    transit: 5,
  },
  {
    srNo: 12,
    model: "Swaraj 744 FE",
    variant: "Premium",
    colour: "Black",
    totalEnquiry: 42,
    pending: 5,
    lost: 3,
    alloted: 11,
    sold: 13,
    regiProcess: 8,
    stock: 15,
    transit: 6,
  },
];

// Calculate column totals (only for specific columns)
const columnTotals = dynamicTableData.reduce(
  (acc, row) => ({
    totalEnquiry: acc.totalEnquiry + row.totalEnquiry,
    pending: acc.pending + row.pending,
    lost: acc.lost + row.lost,
    alloted: acc.alloted + row.alloted,
    sold: acc.sold + row.sold,
    regiProcess: acc.regiProcess + row.regiProcess,
  }),
  {
    totalEnquiry: 0,
    pending: 0,
    lost: 0,
    alloted: 0,
    sold: 0,
    regiProcess: 0,
  },
);

// ---------- Main Component ----------
const DynamicReport: React.FC = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeToggle, setActiveToggle] = useState<string>("hot");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Toggle options
  const toggleOptions = [
    { id: "hot", label: "Hot", color: "bg-red-500" },
    { id: "warm", label: "Warm", color: "bg-orange-400" },
    { id: "cold", label: "Cold", color: "bg-blue-400" },
    { id: "booked", label: "Booked", color: "bg-purple-500" },
    { id: "alloted", label: "Alloted", color: "bg-indigo-500" },
    { id: "sold", label: "Sold", color: "bg-green-600" },
    { id: "regin", label: "Regi. Process", color: "bg-cyan-500" },
    { id: "lost", label: "Lost", color: "bg-gray-500" },
  ];

  // Get value based on active toggle
  const getValue = (row: ModelAnalysisRow, toggle: string) => {
    switch (toggle) {
      case "hot":
        return row.hot;
      case "warm":
        return Math.floor(row.hot * 0.7);
      case "cold":
        return Math.floor(row.hot * 0.4);
      case "booked":
        return Math.floor(row.hot * 0.5);
      case "alloted":
        return Math.floor(row.hot * 0.6);
      case "sold":
        return Math.floor(row.hot * 0.3);
      case "regin":
        return Math.floor(row.hot * 0.2);
      case "lost":
        return Math.floor(row.hot * 0.1);
      default:
        return row.hot;
    }
  };

  // Get percentage based on active toggle
  const getPercentage = (row: ModelAnalysisRow, toggle: string) => {
    const value = getValue(row, toggle);
    return Math.round((value / row.enquiry) * 100);
  };

  // Calculate totals
  const calculateTotal = (data: ModelAnalysisRow[], toggle: string) => {
    const totalEnquiry = data.reduce((sum, row) => sum + row.enquiry, 0);
    const totalValue = data.reduce(
      (sum, row) => sum + getValue(row, toggle),
      0,
    );
    const totalPercentage = Math.round((totalValue / totalEnquiry) * 100);
    return { totalEnquiry, totalValue, totalPercentage };
  };

  const total = calculateTotal(modelAnalysisData, activeToggle);

  // Get current toggle label
  const getToggleLabel = (id: string) => {
    return toggleOptions.find((t) => t.id === id)?.label || "Hot";
  };

  // Get toggle color for active state
  const getToggleActiveColor = (id: string) => {
    const colors: Record<string, string> = {
      hot: "bg-red-500",
      warm: "bg-orange-400",
      cold: "bg-blue-400",
      booked: "bg-purple-500",
      alloted: "bg-indigo-500",
      sold: "bg-green-600",
      regin: "bg-cyan-500",
      lost: "bg-gray-500",
    };
    return colors[id] || "bg-gray-500";
  };

  // Toggle Switch Component
  const ToggleSwitch = ({
    active,
    onClick,
    label,
    color,
  }: {
    active: boolean;
    onClick: () => void;
    label: string;
    color: string;
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`relative h-6 w-12 flex-shrink-0 rounded-full transition-all ${
          active ? color : "dark:bg-dark-600 bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            active ? "left-6.5" : "left-0.5"
          }`}
        />
        <span className="sr-only">{label}</span>
      </button>
    );
  };

  // Chart colors
  const barColors = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"];

  // Pagination logic
  const totalItems = dynamicTableData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = dynamicTableData.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

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

  return (
    <div className="dark:bg-dark-800 min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dynamic Report
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View detailed analysis and reports
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0">
          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <DatePicker
              placeholder="From Date"
              className="w-36"
              options={{ disableMobile: true }}
            />
            <span className="text-gray-400">to</span>
            <DatePicker
              placeholder="To Date"
              className="w-36"
              options={{ disableMobile: true }}
            />
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-1.5">
            {/* PDF Button */}
            <button className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex h-9.5 cursor-pointer items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:px-3 dark:text-gray-300">
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Excel Button */}
            <button className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex h-9.5 cursor-pointer items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:px-3 dark:text-gray-300">
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            {/* Refresh Button */}
            <button className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:text-gray-300">
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Chart + Model Analysis */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left - Chart */}

        <div className="dark:bg-dark-700 dark:border-dark-600 rounded-2xl border border-gray-200 bg-white p-6 shadow lg:col-span-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <div className="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-900/30">
                  <ChartBarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Model Wise Chart
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Overview of model performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="dark:hover:bg-dark-600 rounded-lg p-2 transition-colors hover:bg-gray-100">
                <svg
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <select className="dark:border-dark-600 dark:bg-dark-700 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:text-gray-300">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
              </select>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                barGap={12}
                barCategoryGap={20}
              >
                <defs>
                  {barColors.map((color, index) => (
                    <linearGradient
                      key={`gradient-${index}`}
                      id={`gradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="60%" stopColor={color} stopOpacity={0.85} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                  {/* Shadow filter for bars */}
                  <filter
                    id="barShadow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="4"
                      stdDeviation="4"
                      floodColor="rgba(0,0,0,0.1)"
                    />
                  </filter>
                </defs>

                <CartesianGrid
                  strokeDasharray="5 5"
                  stroke="#e5e7eb"
                  vertical={false}
                  className="dark:stroke-dark-600"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 13, fontWeight: 600 }}
                  axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                  tickLine={false}
                  className="dark:text-gray-400"
                />

                <YAxis
                  domain={[0, 260]}
                  ticks={[0, 50, 100, 150, 200, 250]}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                  tickLine={false}
                  className="dark:text-gray-400"
                  tickFormatter={(value) =>
                    value === 0 ? "0" : value.toString()
                  }
                />

                <Tooltip
                  cursor={{ fill: "rgba(59, 130, 246, 0.04)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="dark:bg-dark-700 dark:border-dark-600 min-w-[180px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
                          <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                            {data.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Enquiries
                            </span>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {data.value}
                            </span>
                          </div>
                          <div className="dark:border-dark-600 mt-2 border-t border-gray-100 pt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Percentage</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {Math.round((data.value / 250) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    paddingTop: "24px",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-gray-700 dark:text-gray-300">
                      {value}
                    </span>
                  )}
                />

                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  barSize={56}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  filter="url(#barShadow)"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-${index % barColors.length})`}
                      className="origin-bottom transform cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Model Performance Summary - Compact */}
          <div className="mt-4 grid grid-cols-2 gap-1 sm:grid-cols-4">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="dark:bg-dark-600/30 flex items-center gap-1 rounded-lg bg-gray-50 px-1.5 py-1 sm:px-2"
              >
                <span
                  className={`h-2 w-2 flex-shrink-0 rounded-full sm:h-2.5 sm:w-2.5`}
                  style={{
                    backgroundColor: barColors[index % barColors.length],
                  }}
                />
                <span className="text-[10px] font-medium whitespace-nowrap text-gray-700 sm:text-xs dark:text-gray-300">
                  {item.name}
                </span>
                <span className="ml-auto flex-shrink-0 text-[10px] font-bold text-gray-900 sm:text-xs dark:text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Model Wise Analysis */}
        <div className="dark:bg-dark-700 dark:border-dark-600 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow lg:col-span-1">
          <div className="dark:border-dark-600 border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Model Wise Analysis
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="dark:bg-dark-600 sticky top-0 z-10 bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Model
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Enquiry
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    {getToggleLabel(activeToggle)} (%)
                  </th>
                </tr>
              </thead>
              <tbody className="dark:divide-dark-600 divide-y divide-gray-200">
                {modelAnalysisData.map((item, index) => (
                  <tr
                    key={index}
                    className="dark:hover:bg-dark-600 transition-colors hover:bg-gray-50"
                  >
                    <td className="max-w-[120px] truncate px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white">
                      {item.model}
                    </td>
                    <td className="px-3 py-2.5 text-center text-sm text-gray-600 dark:text-gray-300">
                      {item.enquiry}
                    </td>
                    <td className="px-3 py-2.5 text-center text-sm font-medium whitespace-nowrap text-blue-600 dark:text-blue-400">
                      {getValue(item, activeToggle)} (
                      {getPercentage(item, activeToggle)}%)
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="dark:bg-dark-600 bg-gray-100 font-semibold">
                  <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                    Total
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-900 dark:text-white">
                    {total.totalEnquiry}
                  </td>
                  <td className="px-3 py-2.5 text-center whitespace-nowrap text-blue-600 dark:text-blue-400">
                    {total.totalValue} ({total.totalPercentage}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Toggle Buttons */}
          <div className="dark:border-dark-600 dark:bg-dark-800 flex-shrink-0 border-t border-gray-200 bg-gray-50 p-2">
            <div className="grid grid-cols-4 gap-1">
              {toggleOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-center gap-2"
                >
                  <ToggleSwitch
                    active={activeToggle === option.id}
                    onClick={() => setActiveToggle(option.id)}
                    label={option.label}
                    color={getToggleActiveColor(option.id)}
                  />
                  <span className="text-[8px] font-medium whitespace-nowrap text-gray-700 sm:text-[9px] dark:text-gray-300">
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Report Table */}
      <div className="dark:bg-dark-700 dark:border-dark-600 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow">
        <div className="dark:border-dark-600 border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dynamic Report
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="dark:bg-dark-600 bg-gray-50 whitespace-nowrap">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Sr. No
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
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Total Enquiry
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Pending
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Lost
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Alloted
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Sold
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Regi. Process
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Stock
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Transit
                </th>
              </tr>
            </thead>
            <tbody className="dark:divide-dark-600 divide-y divide-gray-200 whitespace-nowrap">
              {currentItems.map((item) => {
                // Calculate total enquiry for this row
                const totalEnquiry =
                  item.pending +
                  item.lost +
                  item.alloted +
                  item.sold +
                  item.regiProcess;
                return (
                  <tr
                    key={item.srNo}
                    className="dark:hover:bg-dark-600 transition-colors hover:bg-gray-50"
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
                    <td className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                      {totalEnquiry}
                    </td>
                    <td className="px-4 py-3 text-center text-yellow-600 dark:text-yellow-400">
                      {item.pending}
                    </td>
                    <td className="px-4 py-3 text-center text-red-600 dark:text-red-400">
                      {item.lost}
                    </td>
                    <td className="px-4 py-3 text-center text-indigo-600 dark:text-indigo-400">
                      {item.alloted}
                    </td>
                    <td className="px-4 py-3 text-center text-green-600 dark:text-green-400">
                      {item.sold}
                    </td>
                    <td className="px-4 py-3 text-center text-cyan-600 dark:text-cyan-400">
                      {item.regiProcess}
                    </td>
                    <td className="px-4 py-3 text-center text-blue-600 dark:text-blue-400">
                      {item.stock}
                    </td>
                    <td className="px-4 py-3 text-center text-purple-600 dark:text-purple-400">
                      {item.transit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="dark:border-dark-600 dark:bg-dark-800 flex flex-col items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row">
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
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
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
        )}
      </div>
    </div>
  );
};

export default DynamicReport;
