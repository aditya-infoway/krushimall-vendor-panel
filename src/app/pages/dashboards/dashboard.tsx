import React from "react";
import "react-calendar/dist/Calendar.css";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  TruckIcon,
  UsersIcon,
  PhoneIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  UserIcon,
  UserGroupIcon as UserGroupIcon2,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/20/solid";
import { DatePicker } from "@/components/shared/form/Datepicker";
import apiHelper from "@/utils/apiHelper";

// ---------- Types ----------
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

interface ServiceTodayRow {
  customerName: string;
  number: string;
  model: string;
  totalService: number;
  type: string;
  status: "Pending" | "In Progress" | "Completed" | "Rejected";
}

interface EnquiryRow {
  name: string;
  enquiry: number;
  hot: number;
}

interface DataTableRow {
  id: string;
  name: string;
  refNo: string;
  amountOrEmployee: string;
  typeOrModel?: string;
}

export default function Dashboard() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage] = React.useState(10);

  // Separate toggle states for each table
  const [modelToggle, setModelToggle] = React.useState<string>("hot");
  const [sourceToggle, setSourceToggle] = React.useState<string>("hot");


  const [followUpCounts, setFollowUpCounts] = React.useState({
    Pending: 0,
    Attend: 0,
    Delay: 0,
    Upcoming: 0,
  });

// const fetchFollowUpCounts = async () => {
//   try {
//     const res = await apiHelper.get("/followup/board");

//     console.log(res);

//     const counts = res.counts || {
//       Pending: 0,
//       Attend: 0,
//       Delay: 0,
//       Upcoming: 0,
//     };

//     setFollowUpCounts(counts);
//   } catch (error) {
//     console.error(error);
//   }
// };

//   React.useEffect(() => {
//     fetchFollowUpCounts();
//   }, []);

const totalFollowUps = followUpCounts.Pending + followUpCounts.Attend;

  // Toggle options with colors for the sliding switch
  const toggleOptions = [
    { id: "hot", label: "Hot", color: "bg-red-500" },
    { id: "warm", label: "Warm", color: "bg-orange-400" },
    { id: "cold", label: "Cold", color: "bg-blue-400" },
    { id: "booked", label: "Booked", color: "bg-purple-500" },
    { id: "alloted", label: "Alloted", color: "bg-indigo-500" },
    { id: "sold", label: "Sold", color: "bg-green-600" },
    { id: "regin", label: "Reg. Process", color: "bg-cyan-500" },
    { id: "lost", label: "Lost", color: "bg-gray-500" },
  ];

  // Main Table Data
  const mainTableData: MainTableRow[] = [
    {
      srNo: 1,
      model: "Mahindra 265 DI",
      variant: "Deluxe",
      colour: "Red",
      purchaseOrder: "PO-001",
      present: 45,
      transit: 12,
      hot: 18,
      booked: 10,
      lost: 5,
    },
    {
      srNo: 2,
      model: "Swaraj 744 FE",
      variant: "Standard",
      colour: "Blue",
      purchaseOrder: "PO-002",
      present: 38,
      transit: 15,
      hot: 12,
      booked: 8,
      lost: 3,
    },
    {
      srNo: 3,
      model: "Eicher 380",
      variant: "Premium",
      colour: "Green",
      purchaseOrder: "PO-003",
      present: 52,
      transit: 8,
      hot: 20,
      booked: 15,
      lost: 7,
    },
    {
      srNo: 4,
      model: "John Deere 5050",
      variant: "Base",
      colour: "Yellow",
      purchaseOrder: "PO-004",
      present: 28,
      transit: 20,
      hot: 10,
      booked: 5,
      lost: 2,
    },
    {
      srNo: 5,
      model: "New Holland 3630",
      variant: "Plus",
      colour: "White",
      purchaseOrder: "PO-005",
      present: 33,
      transit: 10,
      hot: 15,
      booked: 12,
      lost: 4,
    },
    {
      srNo: 6,
      model: "Mahindra 575 DI",
      variant: "Premium",
      colour: "Black",
      purchaseOrder: "PO-006",
      present: 40,
      transit: 18,
      hot: 22,
      booked: 14,
      lost: 6,
    },
    {
      srNo: 7,
      model: "Swaraj 855 FE",
      variant: "Deluxe",
      colour: "Orange",
      purchaseOrder: "PO-007",
      present: 25,
      transit: 22,
      hot: 8,
      booked: 6,
      lost: 3,
    },
    {
      srNo: 8,
      model: "Eicher 480",
      variant: "Standard",
      colour: "Red",
      purchaseOrder: "PO-008",
      present: 48,
      transit: 6,
      hot: 25,
      booked: 18,
      lost: 8,
    },
    {
      srNo: 9,
      model: "John Deere 5075",
      variant: "Premium",
      colour: "Green",
      purchaseOrder: "PO-009",
      present: 30,
      transit: 14,
      hot: 12,
      booked: 9,
      lost: 4,
    },
    {
      srNo: 10,
      model: "New Holland 4710",
      variant: "Base",
      colour: "Blue",
      purchaseOrder: "PO-010",
      present: 22,
      transit: 25,
      hot: 6,
      booked: 4,
      lost: 2,
    },
    {
      srNo: 11,
      model: "Mahindra 265 DI",
      variant: "Plus",
      colour: "White",
      purchaseOrder: "PO-011",
      present: 35,
      transit: 16,
      hot: 14,
      booked: 11,
      lost: 5,
    },
    {
      srNo: 12,
      model: "Swaraj 744 FE",
      variant: "Premium",
      colour: "Black",
      purchaseOrder: "PO-012",
      present: 42,
      transit: 9,
      hot: 20,
      booked: 16,
      lost: 6,
    },
  ];

  // Service Today Data
  const serviceData: ServiceTodayRow[] = [
    {
      customerName: "Rajesh Kumar",
      number: "+91 98765 43210",
      model: "Mahindra 265 DI",
      totalService: 3,
      type: "Regular Service",
      status: "Completed",
    },
    {
      customerName: "Priya Singh",
      number: "+91 87654 32109",
      model: "Swaraj 744 FE",
      totalService: 2,
      type: "Engine Repair",
      status: "In Progress",
    },
    {
      customerName: "Amit Patel",
      number: "+91 76543 21098",
      model: "Eicher 380",
      totalService: 4,
      type: "Oil Change",
      status: "Pending",
    },
    {
      customerName: "Sneha Reddy",
      number: "+91 65432 10987",
      model: "John Deere 5050",
      totalService: 1,
      type: "Brake Service",
      status: "Completed",
    },
    {
      customerName: "Vikram Singh",
      number: "+91 54321 09876",
      model: "New Holland 3630",
      totalService: 5,
      type: "Full Service",
      status: "Rejected",
    },
    {
      customerName: "Neha Gupta",
      number: "+91 43210 98765",
      model: "Mahindra 575 DI",
      totalService: 2,
      type: "Tyre Change",
      status: "In Progress",
    },
  ];

  // Model Wise Enquiry Data
  const modelEnquiryData: EnquiryRow[] = [
    { name: "Mahindra 265 DI", enquiry: 45, hot: 18 },
    { name: "Swaraj 744 FE", enquiry: 38, hot: 12 },
    { name: "Eicher 380", enquiry: 52, hot: 20 },
    { name: "John Deere 5050", enquiry: 28, hot: 10 },
    { name: "New Holland 3630", enquiry: 33, hot: 15 },
    { name: "Mahindra 575 DI", enquiry: 40, hot: 22 },
    { name: "Swaraj 855 FE", enquiry: 25, hot: 8 },
    { name: "Eicher 480", enquiry: 48, hot: 25 },
    { name: "John Deere 5075", enquiry: 30, hot: 12 },
    { name: "New Holland 4710", enquiry: 22, hot: 6 },
  ];

  // Source Wise Enquiry Data
  const sourceEnquiryData: EnquiryRow[] = [
    { name: "Website", enquiry: 120, hot: 45 },
    { name: "Showroom", enquiry: 85, hot: 30 },
    { name: "Phone Call", enquiry: 65, hot: 22 },
    { name: "WhatsApp", enquiry: 55, hot: 18 },
    { name: "Social Media", enquiry: 45, hot: 15 },
    { name: "Referral", enquiry: 35, hot: 12 },
    { name: "Email", enquiry: 25, hot: 8 },
    { name: "Walk-in", enquiry: 40, hot: 14 },
  ];

  // Data for the 5 new tables
  const salesData: DataTableRow[] = [
    {
      id: "1",
      name: "Rajesh Kumar",
      refNo: "QT-001",
      amountOrEmployee: "₹45,000",
      typeOrModel: "Mahindra 265 DI",
    },
    {
      id: "2",
      name: "Priya Singh",
      refNo: "QT-002",
      amountOrEmployee: "₹32,000",
      typeOrModel: "Swaraj 744 FE",
    },
    {
      id: "3",
      name: "Amit Patel",
      refNo: "QT-003",
      amountOrEmployee: "₹58,000",
      typeOrModel: "Eicher 380",
    },
    {
      id: "4",
      name: "Sneha Reddy",
      refNo: "QT-004",
      amountOrEmployee: "₹28,000",
      typeOrModel: "John Deere 5050",
    },
    {
      id: "5",
      name: "Vikram Singh",
      refNo: "QT-005",
      amountOrEmployee: "₹42,000",
      typeOrModel: "New Holland 3630",
    },
    {
      id: "6",
      name: "Neha Gupta",
      refNo: "QT-006",
      amountOrEmployee: "₹35,000",
      typeOrModel: "Mahindra 575 DI",
    },
  ];
  const workshopData: DataTableRow[] = [
    {
      id: "1",
      name: "Rajesh Kumar",
      refNo: "INV-001",
      amountOrEmployee: "₹5,000",
      typeOrModel: "Engine Repair",
    },
    {
      id: "2",
      name: "Priya Singh",
      refNo: "INV-002",
      amountOrEmployee: "₹3,200",
      typeOrModel: "Oil Change",
    },
    {
      id: "3",
      name: "Amit Patel",
      refNo: "INV-003",
      amountOrEmployee: "₹7,800",
      typeOrModel: "Brake Service",
    },
    {
      id: "4",
      name: "Sneha Reddy",
      refNo: "INV-004",
      amountOrEmployee: "₹4,500",
      typeOrModel: "Tyre Change",
    },
    {
      id: "5",
      name: "Vikram Singh",
      refNo: "INV-005",
      amountOrEmployee: "₹6,100",
      typeOrModel: "Full Service",
    },
    {
      id: "6",
      name: "Neha Gupta",
      refNo: "INV-006",
      amountOrEmployee: "₹2,900",
      typeOrModel: "AC Repair",
    },
  ];

  const spareData: DataTableRow[] = [
    {
      id: "1",
      name: "Rajesh Kumar",
      refNo: "SPR-001",
      amountOrEmployee: "₹2,500",
      typeOrModel: "Engine Oil",
    },
    {
      id: "2",
      name: "Priya Singh",
      refNo: "SPR-002",
      amountOrEmployee: "₹1,800",
      typeOrModel: "Air Filter",
    },
    {
      id: "3",
      name: "Amit Patel",
      refNo: "SPR-003",
      amountOrEmployee: "₹3,200",
      typeOrModel: "Brake Pads",
    },
    {
      id: "4",
      name: "Sneha Reddy",
      refNo: "SPR-004",
      amountOrEmployee: "₹1,200",
      typeOrModel: "Spark Plugs",
    },
    {
      id: "5",
      name: "Vikram Singh",
      refNo: "SPR-005",
      amountOrEmployee: "₹2,800",
      typeOrModel: "Battery",
    },
    {
      id: "6",
      name: "Neha Gupta",
      refNo: "SPR-006",
      amountOrEmployee: "₹3,500",
      typeOrModel: "Tyres",
    },
  ];

  const teamLeaderData: DataTableRow[] = [
    {
      id: "1",
      name: "Lead-001",
      refNo: "Customer A",
      amountOrEmployee: "Employee X",
      typeOrModel: "Mahindra 265 DI",
    },
    {
      id: "2",
      name: "Lead-002",
      refNo: "Customer B",
      amountOrEmployee: "Employee Y",
      typeOrModel: "Swaraj 744 FE",
    },
    {
      id: "3",
      name: "Lead-003",
      refNo: "Customer C",
      amountOrEmployee: "Employee Z",
      typeOrModel: "Eicher 380",
    },
    {
      id: "4",
      name: "Lead-004",
      refNo: "Customer D",
      amountOrEmployee: "Employee X",
      typeOrModel: "John Deere 5050",
    },
    {
      id: "5",
      name: "Lead-005",
      refNo: "Customer E",
      amountOrEmployee: "Employee Y",
      typeOrModel: "New Holland 3630",
    },
    {
      id: "6",
      name: "Lead-006",
      refNo: "Customer F",
      amountOrEmployee: "Employee Z",
      typeOrModel: "Mahindra 575 DI",
    },
  ];

  const salesExecutiveData: DataTableRow[] = [
    {
      id: "1",
      name: "Lead-001",
      refNo: "Customer A",
      amountOrEmployee: "Employee X",
      typeOrModel: "Mahindra 265 DI",
    },
    {
      id: "2",
      name: "Lead-002",
      refNo: "Customer B",
      amountOrEmployee: "Employee Y",
      typeOrModel: "Swaraj 744 FE",
    },
    {
      id: "3",
      name: "Lead-003",
      refNo: "Customer C",
      amountOrEmployee: "Employee Z",
      typeOrModel: "Eicher 380",
    },
    {
      id: "4",
      name: "Lead-004",
      refNo: "Customer D",
      amountOrEmployee: "Employee X",
      typeOrModel: "John Deere 5050",
    },
    {
      id: "5",
      name: "Lead-005",
      refNo: "Customer E",
      amountOrEmployee: "Employee Y",
      typeOrModel: "New Holland 3630",
    },
    {
      id: "6",
      name: "Lead-006",
      refNo: "Customer F",
      amountOrEmployee: "Employee Z",
      typeOrModel: "Mahindra 575 DI",
    },
  ];

  // Get the value based on active toggle
  const getValue = (row: EnquiryRow, toggle: string) => {
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

  // Get the percentage based on active toggle
  const getPercentage = (row: EnquiryRow, toggle: string) => {
    const value = getValue(row, toggle);
    return Math.round((value / row.enquiry) * 100);
  };

  // Calculate totals
  const calculateTotal = (data: EnquiryRow[], toggle: string) => {
    const totalEnquiry = data.reduce((sum, row) => sum + row.enquiry, 0);
    const totalValue = data.reduce(
      (sum, row) => sum + getValue(row, toggle),
      0,
    );
    const totalPercentage = Math.round((totalValue / totalEnquiry) * 100);
    return { totalEnquiry, totalValue, totalPercentage };
  };

  const modelTotal = calculateTotal(modelEnquiryData, modelToggle);
  const sourceTotal = calculateTotal(sourceEnquiryData, sourceToggle);

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      "In Progress":
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      Completed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    );
  };

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

  // Reusable DataTable Component

  const DataTable = ({
    title,
    icon: Icon,
    columns,
    data,
    showTotal = false,
    totalAmount = "",
    showToday = true,
  }: {
    title: string;
    icon: any;
    columns: string[];
    data: DataTableRow[];
    showTotal?: boolean;
    totalAmount?: string;
    showToday?: boolean;
  }) => (
    <div className="dark:bg-dark-700 dark:border-dark-600 flex h-[294px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-shrink-0 items-center justify-between px-4 py-2 font-semibold text-gray-900 dark:text-white">
        <div className="flex items-center gap-2">
          <Icon className="size-5" />
          <span>{title}</span>
        </div>
        {showTotal ? (
          <span className="flex items-center gap-1 text-xs font-normal">
            <CurrencyDollarIcon className="size-3.5" />
            Total: {totalAmount}
          </span>
        ) : showToday ? (
          <span className="flex items-center gap-1 text-xs font-normal">
            <ClockIcon className="size-3.5" />
            Today ▾
          </span>
        ) : null}
      </div>
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="dark:bg-dark-600 dark:border-dark-600 sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="p-2 text-center font-medium whitespace-nowrap text-gray-600 dark:text-gray-300"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="dark:divide-dark-600 divide-y divide-gray-200">
            {data.slice(0, 6).map((row, i) => (
              <tr
                key={i}
                className="dark:hover:bg-dark-600 transition-colors hover:bg-gray-50"
              >
                {Object.values(row)
                  .slice(1)
                  .map((val: any, idx) => (
                    <td
                      key={idx}
                      className="px-3 py-2 text-center whitespace-nowrap text-gray-700 dark:text-gray-300"
                    >
                      {val}
                    </td>
                  ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 text-center text-gray-400 dark:text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  // Calculate total amount for sales
  const totalSalesAmount = salesData.reduce((sum, row) => {
    const amount = parseFloat(row.amountOrEmployee.replace(/[₹,]/g, ""));
    return sum + amount;
  }, 0);
  const formattedTotal = `₹${totalSalesAmount.toLocaleString("en-IN")}`;

  return (
    <div className="dark:bg-dark-800 min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to the admin dashboard!
          </p>
        </div>
      </div>

      {/* 8 Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Purchase</p>
              <p className="mt-1 text-2xl font-bold">1,247</p>
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                +12.5%
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <ShoppingBagIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Sales</p>
              <p className="mt-1 text-2xl font-bold">$45,678</p>
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                +8.3%
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <CurrencyDollarIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">
                Total Present Stock
              </p>
              <p className="mt-1 text-2xl font-bold">3,842</p>
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                +5.2%
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <TruckIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Lead</p>
              <p className="mt-1 text-2xl font-bold">2,156</p>
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                +15.7%
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <UsersIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Booked Lead</p>
              <p className="mt-1 text-2xl font-bold">432</p>
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                +22.8%
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Pending</p>
              <p className="mt-1 text-2xl font-bold">156</p>
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                -3.2%
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <ClockIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Completed</p>
              <p className="mt-1 text-2xl font-bold">1,876</p>
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                +18.4%
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Rejected</p>
              <p className="mt-1 text-2xl font-bold">89</p>
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                -1.5%
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <XCircleIcon className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
      {/* Today Follow-ups + Service Today */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left - Today Follow-ups (4 cards) */}
        <div className="lg:col-span-1">
          <div className="grid h-full grid-cols-2 gap-4">
            <div className="this:primary bg-this shadow-this/50 dark:bg-this-light dark:shadow-this-light/50 flex flex-col rounded-lg p-4 transition-shadow duration-300 hover:shadow-lg">
              <div className="flex size-10 items-center justify-center rounded-lg bg-white/90">
                <PhoneIcon className="text-this dark:text-this-light size-5" />
              </div>
             <p className="mt-3 text-base font-medium text-white">
                Today Follow-ups
              </p>
              <div className="mt-auto pt-4">
                <p className="text-xl font-medium text-white">{totalFollowUps}</p>
              </div>
            </div>

            <div className="this:warning bg-this shadow-this/50 dark:bg-this-light dark:shadow-this-light/50 flex flex-col rounded-lg p-4 transition-shadow duration-300 hover:shadow-lg">
              <div className="flex size-10 items-center justify-center rounded-lg bg-white/90">
                <ClockIcon className="text-this dark:text-this-light size-5" />
              </div>
             <p className="mt-3 text-base font-medium text-white">Pending</p>
              <div className="mt-auto pt-4">
                <p className="text-xl font-medium text-white">{followUpCounts.Pending}</p>
              </div>
            </div>

            <div className="this:success bg-this shadow-this/50 dark:bg-this-light dark:shadow-this-light/50 flex flex-col rounded-lg p-4 transition-shadow duration-300 hover:shadow-lg">
              <div className="flex size-10 items-center justify-center rounded-lg bg-white/90">
                <CheckCircleIcon className="text-this dark:text-this-light size-5" />
              </div>
             <p className="mt-3 text-base font-medium text-white">Attend</p>
              <div className="mt-auto pt-4">
                <p className="text-xl font-medium text-white">{followUpCounts.Attend}</p>
              </div>
            </div>

            <div className="this:secondary bg-this shadow-this/50 dark:bg-this-light dark:shadow-this-light/50 flex flex-col rounded-lg p-4 transition-shadow duration-300 hover:shadow-lg">
              <div className="flex size-10 items-center justify-center rounded-lg bg-white/90">
                <XCircleIcon className="text-this dark:text-this-light size-5" />
              </div>
            <p className="mt-3 text-base font-medium text-white">Delay</p>
              <div className="mt-auto pt-4">
                <p className="text-xl font-medium text-white">{followUpCounts.Delay}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Service Today Table */}
        <div className="dark:bg-dark-700 dark:border-dark-600 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow lg:col-span-2">
          <div className="dark:border-dark-600 flex-shrink-0 border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Service Today
            </h3>
          </div>
          <div className="custom-scrollbar flex-1 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="dark:bg-dark-600 bg-gray-50 whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Customer Name
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Number
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Model
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Total Service
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="dark:divide-dark-600 divide-y divide-gray-200">
                {serviceData.map((item, index) => (
                  <tr
                    key={index}
                    className="dark:hover:bg-dark-600 transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">
                      {item.customerName}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {item.number}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {item.model}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                      {item.totalService}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {item.type}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Model Wise Enquiry + Source Wise Enquiry */}

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Model Wise Enquiry Table */}
        <div className="dark:bg-dark-700 dark:border-dark-600 flex h-[450px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow">
          <div className="dark:border-dark-600 flex-shrink-0 border-b border-gray-200 px-4 py-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <ChartBarIcon className="size-5" />
              Model Wise Enquiry
            </h3>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="dark:bg-dark-600 sticky top-0 z-10 bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Model
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Enquiry
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    {getToggleLabel(modelToggle)} (%)
                  </th>
                </tr>
              </thead>
              <tbody className="dark:divide-dark-600 divide-y divide-gray-200">
                {modelEnquiryData.slice(0, 6).map((item, index) => (
                  <tr
                    key={index}
                    className="dark:hover:bg-dark-600 transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-2.5 text-center font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-600 dark:text-gray-300">
                      {item.enquiry}
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium text-blue-600 dark:text-blue-400">
                      {getValue(item, modelToggle)} (
                      {getPercentage(item, modelToggle)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Total Row - Fixed at bottom */}
          <div className="dark:bg-dark-600 flex-shrink-0 border-t border-gray-200 bg-gray-100 px-4 py-2.5">
            <div className="grid grid-cols-3 text-center text-sm font-semibold">
              <div className="text-gray-900 dark:text-white">Total</div>
              <div className="text-gray-900 dark:text-white">
                {modelTotal.totalEnquiry}
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                {modelTotal.totalValue} ({modelTotal.totalPercentage}%)
              </div>
            </div>
          </div>
          {/* Toggle Buttons inside table footer */}
          {/* Toggle Buttons inside table footer */}
          <div className="dark:border-dark-600 dark:bg-dark-800 border-t border-gray-200 bg-gray-50 p-2.5">
            <div className="grid grid-cols-4 gap-1 lg:grid-cols-4">
              {toggleOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-center gap-1"
                >
                  <ToggleSwitch
                    active={modelToggle === option.id}
                    onClick={() => setModelToggle(option.id)}
                    label={option.label}
                    color={getToggleActiveColor(option.id)}
                  />
                  <span className="min-w-[20px] text-[9px] font-medium text-gray-700 lg:text-[10px] xl:text-xs dark:text-gray-300">
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Source Wise Enquiry Table */}
        <div className="dark:bg-dark-700 dark:border-dark-600 flex h-[450px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow">
          <div className="dark:border-dark-600 flex-shrink-0 border-b border-gray-200 px-4 py-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <ChartBarIcon className="size-5" />
              Source Wise Enquiry
            </h3>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="dark:bg-dark-600 sticky top-0 z-10 bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Source
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Enquiry
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    {getToggleLabel(sourceToggle)} (%)
                  </th>
                </tr>
              </thead>
              <tbody className="dark:divide-dark-600 divide-y divide-gray-200">
                {sourceEnquiryData.slice(0, 6).map((item, index) => (
                  <tr
                    key={index}
                    className="dark:hover:bg-dark-600 transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-2.5 text-center font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-600 dark:text-gray-300">
                      {item.enquiry}
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium text-blue-600 dark:text-blue-400">
                      {getValue(item, sourceToggle)} (
                      {getPercentage(item, sourceToggle)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Total Row - Fixed at bottom */}
          <div className="dark:bg-dark-600 flex-shrink-0 border-t border-gray-200 bg-gray-100 px-4 py-2.5">
            <div className="grid grid-cols-3 text-center text-sm font-semibold">
              <div className="text-gray-900 dark:text-white">Total</div>
              <div className="text-gray-900 dark:text-white">
                {sourceTotal.totalEnquiry}
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                {sourceTotal.totalValue} ({sourceTotal.totalPercentage}%)
              </div>
            </div>
          </div>
          {/* Toggle Buttons inside table footer */}
          <div className="dark:border-dark-600 dark:bg-dark-800 border-t border-gray-200 bg-gray-50 p-2.5">
            <div className="grid grid-cols-4 gap-1 lg:grid-cols-4">
              {toggleOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-center gap-1"
                >
                  <ToggleSwitch
                    active={sourceToggle === option.id}
                    onClick={() => setSourceToggle(option.id)}
                    label={option.label}
                    color={getToggleActiveColor(option.id)}
                  />
                  <span className="min-w-[20px] text-[9px] font-medium text-gray-700 lg:text-[10px] xl:text-xs dark:text-gray-300">
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* 5 New Tables Section */}
      <div className="space-y-6">
        {/* Top Row: 3 Tables */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DataTable
            title="Sales"
            icon={DocumentTextIcon}
            columns={["Name", "Quotation No", "Amount", "Type"]}
            data={salesData}
            showTotal={true}
            totalAmount={formattedTotal}
            showToday={false}
          />
          <DataTable
            title="Workshop"
            icon={WrenchScrewdriverIcon}
            columns={["Name", "Invoice No", "Amount", "Type"]}
            data={workshopData}
            showToday={true}
          />
          <DataTable
            title="Spare"
            icon={CogIcon}
            columns={["Name", "Invoice No", "Amount", "Type"]}
            data={spareData}
            showToday={true}
          />
        </div>

        {/* Bottom Row: 2 Tables */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DataTable
            title="Team Leader"
            icon={UserGroupIcon2}
            columns={["Lead No", "Customer Name", "Employee Name", "Model"]}
            data={teamLeaderData}
            showToday={false}
          />
          <DataTable
            title="Sales Executive"
            icon={UserIcon}
            columns={["Lead No", "Customer Name", "Employee Name", "Model"]}
            data={salesExecutiveData}
            showToday={false}
          />
        </div>
      </div>
    </div>
  );
}
