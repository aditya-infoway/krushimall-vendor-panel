import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  X,
  Plus,
  Download,
  Trash2,
  Edit,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import { Fragment } from "react";
import { DatePicker } from "@/components/shared/form/Datepicker";
// import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Combobox } from "@/components/shared/form/Combobox";
import { Input, Radio, Textarea, Checkbox } from "@/components/ui";
import apiHelper from "@/utils/apiHelper";
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
import { toast } from "sonner";
// ── Types ──────────────────────────────────────────────────────────────────────
type ContraType = "Cash Deposit" | "Cash Withdrawal" | "Bank Transfer";
import { Listbox } from "@/components/shared/form/StyledListbox";
interface ContraEntry {
  id: number;
  date: string;
  voucherNo: string;
  type: ContraType;
  cashBankAccount: string;
  oppAccount: string;
  amount: number;
  narration: string;
  createdType: string;
  createdBy: string;
}

// ── Static options ─────────────────────────────────────────────────────────────


const CONTRA_TYPES: ContraType[] = [
  "Cash Deposit",
  "Cash Withdrawal",
  "Bank Transfer",
];

const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Contra() {
  const [entries, setEntries] = useState<ContraEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
// Type filter options — dynamically built from actual entries data
const typeFilterOptions = [
  { id: "All", name: "All Types" },
  ...Array.from(new Set(entries.map((e) => e.type).filter(Boolean))).map(
    (t) => ({ id: t, name: t }),
  ),
];
  // form state
  const [type, setType] = useState<ContraType>("Bank Transfer");
  const [cashBankAccount, setCashBankAccount] = useState<any>(null);
 const [voucherNo, setVoucherNo] = useState("");
  const [date, setDate] = useState<any>(null);
  const [oppAccount, setOppAccount] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showFilterBar, setShowFilterBar] = useState(false);
const [loading, setLoading] = useState(false);
  // Filter states
  const [filterType, setFilterType] = useState("All");
  const [filterDateFrom, setFilterDateFrom] = useState<any>(null);
  const [filterDateTo, setFilterDateTo] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
const companyId = Number(
  sessionStorage.getItem("companyId"),
);

const financialYearId = Number(
  sessionStorage.getItem("financialYearId"),
);
  useEffect(() => {
     fetchContras();
    const fetchAccounts = async () => {
      try {
        const res = await apiHelper.get("/accounts");
       
        const accountData = (res.data || res.data).map((acc: any) => ({
          id: acc.id,
          label: acc.accountName,
          value: acc.id,
           mobile: acc.mobile,
  openingBalance: acc.openingBalance,
          group: acc.group, // "Cash-in-Hand" or "Bank Accounts"
        }));
       
        setAccounts(accountData);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  const cashBankAccountOptions = accounts.filter((acc) => {
  if (type === "Cash Deposit") {
    return acc.group === "Cash-in-Hand";
  }

  if (type === "Cash Withdrawal") {
    return acc.group === "Bank Accounts";
  }

  // Bank Transfer
  return (
    acc.group === "Bank Accounts" &&
    acc.id !== oppAccount?.id
  );
});

const oppAccountOptions = accounts.filter((acc) => {
  if (type === "Cash Deposit") {
    return acc.group === "Bank Accounts";
  }

  if (type === "Cash Withdrawal") {
    return acc.group === "Cash-in-Hand";
  }

  // Bank Transfer
  return (
    acc.group === "Bank Accounts" &&
    acc.id !== cashBankAccount?.id
  );
});
const fetchContras = async () => {
  try {
    setLoading(true);

    const res = await apiHelper.get("/contra");


    const data = res.map((item: any) => ({
      id: item.id,
      date: item.date,
      voucherNo: item.voucherNo,
      type: item.type,
      cashBankAccount: item.cashBankAccount?.accountName,
      oppAccount: item.oppAccount?.accountName,
      amount: item.amount,
      narration: item.narration,
      createdType: item.createdType,
      createdBy: item.createdBy,
    }));

    setEntries(data);
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};
const getVoucher = async () => {
  try {
    if (!companyId || !financialYearId) {
      toast.error("Company or financial year is not selected");
      return;
    }

    const res = await apiHelper.get(
      `/contra/voucher?companyId=${companyId}&financialYearId=${financialYearId}`
    );

    setVoucherNo(res.voucherNo || "");
  } catch (err) {
    console.error(err);
    toast.error("Unable to generate voucher number");
  }
};
  const openModal = () => {
    setType("Cash Deposit");
    setCashBankAccount(null);
     setVoucherNo("");
   setDate(new Date());
    setOppAccount(null);
    setAmount("");
    setNarration("");
    setErrors({});
     getVoucher();
    setShowModal(true);
  };

const validateForm = () => {
  const newErrors: Record<string, string> = {};
if (!companyId) {
  newErrors.companyId =
    "Company is not selected";
}

if (!financialYearId) {
  newErrors.financialYearId =
    "Financial year is not selected";
}
  // Cash/Bank Account
  if (!cashBankAccount?.value) {
    newErrors.cashBankAccount =
      "Cash/Bank Account is required";
  }

  // Opp. Account
  if (!oppAccount?.value) {
    newErrors.oppAccount =
      "Opp. Account is required";
  }

  // Same account validation
  if (
    cashBankAccount?.value &&
    oppAccount?.value &&
    Number(cashBankAccount.value) ===
      Number(oppAccount.value)
  ) {
    newErrors.oppAccount =
      "Both accounts cannot be the same";
  }

  // Date
  if (
    !date ||
    (Array.isArray(date) &&
      date.length === 0)
  ) {
    newErrors.date = "Date is required";
  }

  // Amount
  const numericAmount = Number(amount);

  if (
    amount === "" ||
    amount === null ||
    amount === undefined
  ) {
    newErrors.amount = "Amount is required";
  } else if (Number.isNaN(numericAmount)) {
    newErrors.amount =
      "Enter a valid amount";
  } else if (numericAmount <= 0) {
    newErrors.amount =
      "Amount must be greater than 0";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

 const handleSubmit = async () => {
  if (!validateForm()) return;
 if (!companyId || !financialYearId) {
    toast.error(
      "Company or financial year is not selected",
    );
    return;
  }
  try {
    await apiHelper.post("/contra", {
      companyId,
      financialYearId,
      date,
      type,
      cashBankAccountId: cashBankAccount.id,
      oppAccountId: oppAccount.id,
      amount: Number(amount),
      narration,
    });

    toast.success("Contra entry added successfully!");
    await fetchContras();

    setShowModal(false);
    setCashBankAccount(null);
    setOppAccount(null);
    setAmount("");
    setNarration("");
    setDate(null);
  } catch (error: any) {
    console.log(error);
    toast.error(error.response?.data?.message || "Failed to add contra entry. Please try again.");
  }
};

  const handleDelete = (id: number) => {
    setEntries(entries.filter((row) => row.id !== id));
  };

  const handleBulkDelete = () => {
    setEntries(entries.filter((row) => !selectedIds.includes(row.id)));
    setSelectedIds([]);
  };

 const filtered = entries.filter((e) => {
  const matchesSearch = Object.values(e).some((v) =>
    String(v).toLowerCase().includes(search.toLowerCase()),
  );

  const matchesType = filterType === "All" || e.type === filterType;

  // NEW: date range filter — handles DatePicker returning either a Date or an array
  const rowDate = new Date(e.date);
  rowDate.setHours(0, 0, 0, 0);

  const rawFrom = Array.isArray(filterDateFrom)
    ? filterDateFrom[0]
    : filterDateFrom;
  const fromDate = rawFrom ? new Date(rawFrom) : null;
  if (fromDate) fromDate.setHours(0, 0, 0, 0);

  const rawTo = Array.isArray(filterDateTo) ? filterDateTo[0] : filterDateTo;
  const toDate = rawTo ? new Date(rawTo) : null;
  if (toDate) toDate.setHours(23, 59, 59, 999);

  const matchesDateFrom = !fromDate || rowDate >= fromDate;
  const matchesDateTo = !toDate || rowDate <= toDate;

  return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
});

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const isAllPageSelected =
    currentItems.length > 0 &&
    currentItems.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = currentItems.map((item) => item.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = currentItems.map((item) => item.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, filterDateFrom, filterDateTo]);
const downloadExcel = async () => {
  try {
    const blob = await apiHelper.getBlob(
      "/contra/export/excel"
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "ContraRegister.xlsx";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.log(err);
  }
};
  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Upper Actions Control Toolbar Layout */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Contra Register
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all contra entries
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilterBar(!showFilterBar)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              showFilterBar
                ? "dark:bg-dark-600 dark:border-dark-500 border-red-200 bg-red-50 text-red-600 dark:text-white"
                : "dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="size-4.5" />
            Filter
          </button>
          <button
            type="button"   onClick={downloadExcel}
            className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
         <RiFileExcel2Fill className="text-lg text-green-500" />
          </button>

          <button
            type="button"
            className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
           <RiFilePdfFill className="text-lg text-red-500" />
          </button>

          <button
            type="button"
            onClick={openModal}
            className="bg-primary-600 hover:bg-primary-700 cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
          >
            <Plus className="size-4.5" />
            Add Contra
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search contra entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>

      {/* Filter Bar */}
      {showFilterBar && (
        <div className="dark:bg-dark-700 dark:border-dark-500 animate-in fade-in slide-in-from-top-2 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-150">
       <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  <div>
    <label className="dark:text-dark-200 mb-1.5 block text-sm font-medium text-gray-700">
      Type
    </label>
    <Listbox
      data={typeFilterOptions}
      value={
        typeFilterOptions.find((o) => o.id === filterType) ||
        typeFilterOptions[0]
      }
      onChange={(opt: any) => setFilterType(opt.id)}
      displayField="name"
    />
  </div>
  <div>
    <label className="dark:text-dark-200 mb-1.5 block text-sm font-medium text-gray-700">
      Date From
    </label>
    <DatePicker
      placeholder="From Date"
      value={filterDateFrom}
      onChange={setFilterDateFrom}
    />
  </div>
  <div>
    <label className="dark:text-dark-200 mb-1.5 block text-sm font-medium text-gray-700">
      Date To
    </label>
    <DatePicker
      placeholder="To Date"
      value={filterDateTo}
      onChange={setFilterDateTo}
    />
  </div>
</div>
        </div>
      )}

      {/* Main Table */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-275 text-left [&_.table-th]:font-semibold">
            <thead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
              <tr>
                <th className="w-10 px-2 py-3.5 text-center">
  <Checkbox
    checked={isAllPageSelected}
    onChange={(e: any) => handleSelectAll(e.target.checked)}
    className="size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
  />
</th>
                <th className="w-12 px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  S.No
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Date
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Voucher No.
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Type
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Cash/Bank Account
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Opp. Account
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Amount
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Narration
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Created Type
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Created By
                </th>
                <th className="w-16 px-3 py-3.5 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="dark:divide-dark-700 divide-y divide-gray-200">
              {currentItems.map((item, index) => {
                const isRowSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`${isRowSelected ? "dark:bg-dark-600/30 bg-gray-50/50" : ""} dark:hover:bg-dark-700/40 transition-colors hover:bg-gray-50/30`}
                  >
                   <td className="px-2 py-3 text-center">
  <Checkbox
    checked={isRowSelected}
    onChange={() => handleSelectRow(item.id)}
    className="size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
  />
</td>
                    <td className="px-3 py-3 text-sm font-medium whitespace-nowrap text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-400">
                    {new Date(item.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-gray-400">
                      {item.voucherNo}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          item.type === "Cash Deposit"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : item.type === "Cash Withdrawal"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {item.cashBankAccount}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {item.oppAccount}
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold whitespace-nowrap text-gray-900 dark:text-gray-400">
                      ₹
                      {item.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {item.narration}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {item.createdType || "Manual"}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {item.createdBy}
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <MenuButton className="dark:hover:bg-dark-600 dark:text-dark-200 inline-flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100">
                          <ChevronsUpDown className="size-4" />
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
                            anchor="bottom end"
                            className="dark:bg-dark-800 dark:ring-dark-500 dark:border-dark-500 z-[100] w-36 rounded-lg border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 [--anchor-gap:4px] focus:outline-none"
                          >
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  type="button"
                                  className={`${
                                    active
                                      ? "dark:bg-dark-600 bg-gray-50 text-blue-600 dark:text-white"
                                      : "dark:text-dark-200 text-gray-700"
                                  } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                                >
                                  <Edit className="size-4" />
                                  Edit
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  className={`${
                                    active
                                      ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                      : "dark:text-dark-200 text-gray-700"
                                  } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                                >
                                  <Trash2 className="size-4" />
                                  Delete
                                </button>
                              )}
                            </MenuItem>
                          </MenuItems>
                        </Transition>
                      </Menu>
                    </td>
                  </tr>
                );
              })}

              {currentItems.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No contra entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 rounded-b-xl border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
            <div className="order-1 flex items-center justify-center gap-2 text-sm text-gray-600 md:w-1/3 md:justify-start dark:text-gray-400">
              <span>Show</span>
              <div className="w-20">
                <Menu
                  as="div"
                  className="relative inline-block w-full text-left"
                >
                  <MenuButton className="dark:border-dark-600 dark:bg-dark-700 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none dark:text-gray-200">
                    <span>{itemsPerPage}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
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
                      className="dark:bg-dark-700 dark:border-dark-600 z-[200] w-20 space-y-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-xl ring-1 ring-black/5 [--anchor-gap:6px] focus:outline-none"
                    >
                      {entriesOptions.map((opt) => (
                        <MenuItem key={opt.id}>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() => {
                                setItemsPerPage(opt.id);
                                setCurrentPage(1);
                              }}
                              className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium ${
                                opt.id === itemsPerPage
                                  ? "bg-primary-500 text-white"
                                  : active
                                    ? "dark:bg-dark-600 bg-gray-100 text-gray-900 dark:text-white"
                                    : "text-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {opt.name}
                              {opt.id === itemsPerPage && (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Transition>
                </Menu>
              </div>
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
                  <ChevronLeft className="size-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
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
                  <ChevronRight className="size-4" />
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

      {/* Floating Action Bar for Selected Checks */}
      {selectedIds.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 fixed right-6 bottom-6 z-50 w-full max-w-xs px-2 duration-200">
          <div className="dark:border-dark-500 dark:bg-dark-700/95 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="dark:text-dark-200 text-sm font-medium text-gray-600">
              Selected{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {selectedIds.length}
              </span>{" "}
              items
            </div>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            >
              <Trash2 className="size-4" />
              <span className="text-xs font-semibold">Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      <Transition appear show={showModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[100]"
          onClose={() => setShowModal(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/40" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out transform-gpu transition-transform duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in transform-gpu transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-3xl transform-gpu flex-col bg-white shadow-2xl transition-transform duration-200">
              <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <h2 className="dark:text-dark-50 text-lg font-semibold text-gray-800">
                  Add Contra Entry
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="size-8 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="grow space-y-5 overflow-y-auto p-5">
                {/* Type Radio Buttons */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-6">
                    {CONTRA_TYPES.map((t) => (
                      <Radio
                        key={t}
                        label={t}
                        name="contraType"
                        checked={type === t}
                        onChange={() => {
                          setType(t);

                          // Clear selected accounts
                          setCashBankAccount(null);
                          setOppAccount(null);

                          if (errors.type) {
                            setErrors({ ...errors, type: "" });
                          }
                        }}
                      />
                    ))}
                  </div>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-500">{errors.type}</p>
                  )}
                </div>

                {/* Row 1: Cash/Bank Account | Voucher No. | Date */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cash/Bank Account <span className="text-red-500">*</span>
                    </label>
                  <Combobox
  data={cashBankAccountOptions}
  value={cashBankAccount}
  onChange={(val: any) => setCashBankAccount(val)}
  displayField="label"
  placeholder="Search Account"
  searchFields={["label", "mobile"]}
   error={errors.cashBankAccount}
  columns={[
    {
      header: "Account",
      field: "label",
      width: "2fr",
    },
    {
      header: "Mobile",
      field: "mobile",
      width: "1.5fr",
    },
    {
      header: "Opening",
      field: "openingBalance",
      width: "1fr",
    },
  ]}
/>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Voucher No.
                    </label>
                    <Input
                      type="text"
                      value={voucherNo}
                       readOnly
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      placeholder="Select date..."
                      value={date}
                      onChange={(value) => {
                        setDate(value);
                        if (errors.date) setErrors({ ...errors, date: "" });
                      }}
                      options={{ disableMobile: true }}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Opp. Account | Amount */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Opp. Account <span className="text-red-500">*</span>
                    </label>
                  <Combobox
  data={oppAccountOptions}
  value={oppAccount}
  onChange={(val: any) => setOppAccount(val)}
  displayField="label"
  placeholder="Search Account"
  searchFields={["label", "mobile"]}
   error={errors.oppAccount}
  columns={[
    {
      header: "Account",
      field: "label",
      width: "2fr",
    },
    {
      header: "Mobile",
      field: "mobile",
      width: "1.5fr",
    },
    {
      header: "Opening",
      field: "openingBalance",
      width: "1fr",
    },
  ]}
/>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (errors.amount) setErrors({ ...errors, amount: "" });
                      }}
                      placeholder="Enter amount"
                      error={errors.amount}
                    />
                  </div>
                </div>

                {/* Narration */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Narration
                  </label>
                  <Textarea
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    placeholder="Enter narration"
                    className=""
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="dark:border-dark-500 flex items-center justify-end gap-3 border-t border-gray-200 p-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrors({});
                  }}
                  className="dark:bg-dark-600 dark:hover:bg-dark-500 cursor-pointer rounded-lg bg-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-primary-600 hover:bg-primary-700 cursor-pointer rounded-lg px-6 py-2.5 text-sm font-semibold text-white"
                >
                  Add Contra
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </div>
  );
}
