import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Search,
  Check,
  Filter,
  ChevronDown,
  X,
  Plus,
  Download,
  Trash2,
  Edit,
  ChevronsUpDown,
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
import { Input, Radio, Textarea, Checkbox } from "@/components/ui";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";
import { Listbox } from "@/components/shared/form/StyledListbox";
type EntryType = "Manual" | "Lead" | "Job Card";
import { Combobox } from "@/components/shared/form/Combobox";
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";

interface CashReceipt {
  id: number;
  date: string;
  voucherNo: string;
  type: EntryType;
  cashAccount: string;
  oppAccount: string;
  amount: number;
  narration: string;
  createdType: string;
  createdBy: string;
  leadNo?: string;
  jobCardNo?: string;
}

const CASH_ACCOUNTS = [
  {
    id: 1,
    label: "Cash account (9081540777)",
    value: "Cash account (9081540777)",
    balance: "1,00,000.00 DR",
  },
  {
    id: 2,
    label: "Denish patel (9081540774)",
    value: "Denish patel (9081540774)",
    balance: "0.00 DR",
  },
];

const OPP_ACCOUNTS = [
  {
    id: 1,
    label: "Cash account (9081540777)",
    value: "Cash account (9081540777)",
    balance: "1,00,000.00 DR",
  },
  {
    id: 2,
    label: "Denish patel (9081540774)",
    value: "Denish patel (9081540774)",
    balance: "0.00 DR",
  },
  {
    id: 3,
    label: "Suresh Kumar (9081540775)",
    value: "Suresh Kumar (9081540775)",
    balance: "25,000.00 CR",
  },
  {
    id: 4,
    label: "Ramesh Singh (9081540776)",
    value: "Ramesh Singh (9081540776)",
    balance: "50,000.00 DR",
  },
];

const initialForm = {
  type: "Manual" as EntryType,
  cashAccount: null as any,
  voucherNo: "CR/25-26/001",
  date: null as any,
  oppAccount: null as any,
  amount: "",
  narration: "",
  createdType: "",
  createdBy: "",
   leadNo: null as any,
  jobCardNo: "",
};

const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

export default function CashReceipt() {
  const [rows, setRows] = useState<CashReceipt[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [form, setForm] = useState({ ...initialForm });
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [oppAccounts, setOppAccounts] = useState<any[]>([]);
  // Filter states
  const [filterType, setFilterType] = useState("All");
  const [filterDateFrom, setFilterDateFrom] = useState<any>(null);
  const [filterDateTo, setFilterDateTo] = useState<any>(null);

 const filteredRows = rows.filter((r) => {
  const matchesSearch = Object.values(r).some((v) =>
    String(v).toLowerCase().includes(search.toLowerCase()),
  );
  const matchesType = filterType === "All" || r.type === filterType;

  // NEW: date range filter — handles DatePicker returning either a Date or an array
  const rowDate = new Date(r.date);
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
  const companyId = Number(sessionStorage.getItem("companyId"));

  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const totalItems = filteredRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);
  const [leadOptions, setLeadOptions] = useState<any[]>([]);
  // Type filter options — dynamically built from actual rows data, no hardcoding
const typeFilterOptions = [
  { id: "All", name: "All Types" },
  ...Array.from(new Set(rows.map((r) => r.type).filter(Boolean))).map(
    (type) => ({ id: type, name: type }),
  ),
];
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Company validation
    if (!companyId) {
      newErrors.companyId = "Company is not selected";
    }

    if (!financialYearId) {
      newErrors.financialYearId = "Financial year is not selected";
    }

    // Voucher validation
    if (!form.voucherNo?.trim()) {
      newErrors.voucherNo = "Voucher No. is required";
    }

    // Date validation
    if (!form.date) {
      newErrors.date = "Date is required";
    }

    // Cash account validation
    if (!form.cashAccount?.value) {
      newErrors.cashAccount = "Cash Account is required";
    }

    // Opposite account validation
    if (!form.oppAccount?.value) {
      newErrors.oppAccount = "Opp. Account is required";
    }

    // Same account validation
    if (
      form.cashAccount?.value &&
      form.oppAccount?.value &&
      Number(form.cashAccount.value) === Number(form.oppAccount.value)
    ) {
      newErrors.oppAccount = "Cash Account and Opp. Account cannot be the same";
    }

    // Amount validation
    const amount = Number(form.amount);

    if (!form.amount || form.amount.trim() === "") {
      newErrors.amount = "Amount is required";
    } else if (isNaN(amount)) {
      newErrors.amount = "Enter a valid amount";
    } else if (amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    // Lead validation
    if (form.type === "Lead" && !form.leadNo?.value) {
      newErrors.leadNo = "Lead is required";
    }

    // Job Card validation
    if (form.type === "Job Card" && !form.jobCardNo) {
      newErrors.jobCardNo = "Job Card is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
 const getLeads = async () => {
  try {
    const res = await apiHelper.get("/leads/pending"); // ✅ endpoint change

    const leads = res.data || [];

    const options = leads.map((item: any) => ({
      value: item.id,
      label: `${item.quotationNo} - ${item.customer?.accountName || ""}`,
      quotationNo: item.quotationNo,
      customerName: item.customer?.accountName || "",
      mobile: item.customer?.mobile || "",
      customerId: item.customer?.id,
    }));

    setLeadOptions(options);
  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    getLeads();
  }, []);

  const getCashReceipts = async () => {
    try {
      const res = await apiHelper.get("/cash-receipt");

      const data = res.map((item: any) => ({
        ...item,
        cashAccount: item.cashAccount?.accountName || "",
        oppAccount: item.oppAccount?.accountName || "",
      }));

      setRows(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getCashReceipts();
  }, []);
 const getVoucherNo = async () => {
  try {
    if (!companyId || !financialYearId) {
      toast.error("Company or financial year is not selected");
      return;
    }

    const res = await apiHelper.get(
      `/cash-receipt/voucher?companyId=${companyId}&financialYearId=${financialYearId}`
    );

    console.log("Voucher API:", res);

    const voucherNo =
      res?.data?.voucherNo ??
      res?.voucherNo ??
      "";

    setForm((prev) => ({
      ...prev,
      voucherNo,
    }));
  } catch (err) {
    console.log(err);
  }
};
  const getAccounts = async () => {
    try {
      const res = await apiHelper.get("/accounts");

      const accounts = res.data.data || res.data || [];

      // Cash Accounts
      const cash = accounts
        .filter((a: any) => a.group === "Cash-in-Hand")
        .map((a: any) => ({
          value: a.id,
          label: a.accountName,
          mobile: a.mobile,
          openingBalance: a.openingBalance,
          balance: a.closingBalance,
          balanceType: a.drCr,
        }));

      // Opposite Accounts
       const opp = accounts
  .filter((a: any) => a.group !== "Cash-in-Hand")
  .map((a: any) => ({
    value: a.id,
    label: a.accountName,
    mobile: a.mobile,
    openingBalance: a.openingBalance,
    balance: a.closingBalance,
    balanceType: a.drCr,
    group: a.group,
  }));

      setCashAccounts(cash);
      setOppAccounts(opp);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getAccounts();
  }, []);
  const handleAdd = async () => {
    setEditId(null);
    setErrors({});
    setForm({
      ...initialForm,
      date: new Date(),
    });

    await getVoucherNo();
    setShowDrawer(true);
  };

  const handleEdit = (item: CashReceipt) => {
    setEditId(item.id);
    setForm({
      type: item.type,
      cashAccount:
        CASH_ACCOUNTS.find((a) => a.value === item.cashAccount) || null,
      voucherNo: item.voucherNo,
      date: item.date,
      oppAccount: OPP_ACCOUNTS.find((a) => a.value === item.oppAccount) || null,
      amount: String(item.amount),
      narration: item.narration,
      createdType: item.createdType,
      createdBy: item.createdBy,
      leadNo: item.leadNo || "",
      jobCardNo: item.jobCardNo || "",
    });
    setErrors({});
    setShowDrawer(true);
  };

  const handleDelete = (id: number) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleBulkDelete = () => {
    setRows(rows.filter((row) => !selectedIds.includes(row.id)));
    setSelectedIds([]);
  };

  // Add after OPP_ACCOUNTS
  const LEADS = [
    { id: 1, leadNo: "LEAD-001", name: "John Doe", phone: "9876543210" },
    { id: 2, leadNo: "LEAD-002", name: "Jane Smith", phone: "9876543211" },
    { id: 3, leadNo: "LEAD-003", name: "Bob Johnson", phone: "9876543212" },
    { id: 4, leadNo: "LEAD-004", name: "Alice Brown", phone: "9876543213" },
    { id: 5, leadNo: "LEAD-005", name: "Charlie Wilson", phone: "9876543214" },
  ];

  const JOB_CARDS = [
    {
      id: 1,
      jobCardNo: "JC-001",
      customer: "Rahul Sharma",
      vehicle: "Tractor-123",
    },
    {
      id: 2,
      jobCardNo: "JC-002",
      customer: "Priya Patel",
      vehicle: "Tractor-456",
    },
    {
      id: 3,
      jobCardNo: "JC-003",
      customer: "Amit Singh",
      vehicle: "Tractor-789",
    },
    {
      id: 4,
      jobCardNo: "JC-004",
      customer: "Sneha Reddy",
      vehicle: "Tractor-012",
    },
    {
      id: 5,
      jobCardNo: "JC-005",
      customer: "Vikram Kumar",
      vehicle: "Tractor-345",
    },
  ];

  // Add after LEADS and JOB_CARDS

  const jobCardOptions = JOB_CARDS.map((job) => ({
    value: job.jobCardNo,
    label: `${job.jobCardNo} - ${job.customer}`,
    vehicle: job.vehicle,
    id: job.id,
  }));

  // Transform OPP_ACCOUNTS to include balance on the right
  const maxLabelLength = Math.max(...OPP_ACCOUNTS.map((a) => a.label.length));
  const EXTRA_SPACING = 6;

  const OPP_ACCOUNTS_WITH_BALANCE = OPP_ACCOUNTS.map((account) => {
    const paddedLabel = account.label.padEnd(
      maxLabelLength + EXTRA_SPACING,
      " ",
    );
    return {
      ...account,
      label: `${paddedLabel}${account.balance}`,
    };
  });

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!companyId || !financialYearId) {
      toast.error("Company or financial year is not selected");
      return;
    }
    try {
      const payload = {
        companyId,
        financialYearId,
        voucherNo: form.voucherNo,
        date: form.date,
        type: form.type,
        cashAccountId: form.cashAccount.value,
        oppAccountId: form.oppAccount.value,
         leadId: form.type === "Lead" && form.leadNo ? Number(form.leadNo.value) : null,
        amount: Number(form.amount),
        narration: form.narration,
      };
    
      if (editId) {
        await apiHelper.put(`/cash-receipt/${editId}`, payload);
        toast.success("Cash receipt updated successfully!");
      } else {
        await apiHelper.post("/cash-receipt", payload);
        toast.success("Cash receipt added successfully!");
      }

      setShowDrawer(false);
      await getCashReceipts();
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save cash receipt. Please try again.",
      );
    }
  };
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

  // Apply filters automatically when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterDateFrom, filterDateTo, search]);
  const downloadExcel = async () => {
    try {
      const blob = await apiHelper.getBlob("/cash-receipt/export/excel");

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "CashReceiptRegister.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);
    }
  };



const handlePrint = async (item: CashReceipt) => {
  try {
    const blob = await apiHelper.getBlob(`/cash-receipt/${item.id}/print`);
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  } catch (err) {
    console.log(err);
    toast.error("Failed to generate receipt PDF");
  }
};

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Upper Actions Control Toolbar Layout */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Cash Receipt Register
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all cash receipt entries
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
            type="button"
            onClick={downloadExcel}
            className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <RiFileExcel2Fill className="text-lg text-green-500" />
          </button>

          <button
            type="button"
            className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <RiFilePdfFill className="text-lg text-red-500" />
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="bg-primary-600 hover:bg-primary-700 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
          >
            <Plus className="size-4.5" />
            Add Cash Receipt
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search cash receipts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>

      {/* Filter Bar - Auto Apply */}
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
          <table className="w-full min-w-250 text-left [&_.table-th]:font-semibold">
            <thead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
              <tr>
               <th className="w-10  px-3 py-3.5 text-center">
  <Checkbox
    checked={isAllPageSelected}
    onChange={(e: any) => handleSelectAll(e.target.checked)}
    className="size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
  />
</th>
                <th className="w-12 px-3 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
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
                  Cash Account
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
                   <td className="px-3 py-3 text-center">
  <Checkbox
    checked={isRowSelected}
    onChange={() => handleSelectRow(item.id)}
    className="size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
  />
</td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="py-3 px-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-gray-400">
                      {item.voucherNo}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          item.type === "Manual"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : item.type === "Lead"
                              ? "bg-primary-500 dark:bg-red-primary-500 text-white dark:text-white"
                              : "bg-primary-500 dark:bg-primary-500 text-white dark:text-white"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {item.cashAccount}
                    </td>
                    <td className="py-3 px-3 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {item.oppAccount}
                    </td>
                    <td className="py-3 px-3 text-sm font-semibold whitespace-nowrap text-gray-900 dark:text-gray-400">
                      ₹
                      {item.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {item.narration}
                    </td>
                    <td className="py-3 px-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {item.createdType}
                    </td>
                    <td className="py-3 px-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {item.createdBy}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handlePrint(item)}
                        className="dark:hover:bg-dark-600 dark:text-dark-200 text-primary-500 hover:bg-primary-600 cursor-pointer inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:text-white"
                        title="Print Receipt"
                      >
                        <Printer className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {currentItems.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No cash receipts found
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
                      className="dark:bg-dark-700 dark:border-dark-600 z-200 w-20 space-y-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-xl ring-1 ring-black/5 [--anchor-gap:6px] focus:outline-none"
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

      {/* Right Drawer */}
      <Transition appear show={showDrawer} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-100"
          onClose={() => setShowDrawer(false)}
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
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-4xl transform-gpu flex-col bg-white shadow-2xl transition-transform duration-200">
              <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <h2 className="dark:text-dark-50 text-lg font-semibold text-gray-800">
                  {editId !== null ? "Edit Cash Receipt" : "Add Cash Receipt"}
                </h2>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="size-8 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="grow space-y-5 overflow-y-auto p-5">
                {/* Radio Buttons + Lead No / Job Card No inline */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left side - Radio buttons */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <Radio
                      label="Manual"
                      name="type"
                      checked={form.type === "Manual"}
                      onChange={() => {
                        setForm({
                          ...form,
                          type: "Manual",
                      leadNo: null,
                          jobCardNo: "",
                        });
                        if (errors.leadNo) setErrors({ ...errors, leadNo: "" });
                        if (errors.jobCardNo)
                          setErrors({ ...errors, jobCardNo: "" });
                      }}
                    />
                    <Radio
                      label="Lead"
                      name="type"
                      checked={form.type === "Lead"}
                      onChange={() => {
                        setForm({ ...form, type: "Lead", jobCardNo: "" });
                        if (errors.jobCardNo)
                          setErrors({ ...errors, jobCardNo: "" });
                      }}
                    />
                    <Radio
                      label="Job Card"
                      name="type"
                      checked={form.type === "Job Card"}
                      onChange={() => {
                        setForm({ ...form, type: "Job Card", leadNo: "" });
                        if (errors.leadNo) setErrors({ ...errors, leadNo: "" });
                      }}
                    />
                  </div>

                  {/* Right side - Combobox */}
                  <div className="w-full  md:w-110 lg:w-110 ">
                    {form.type === "Lead" && (
                      <Combobox
                        data={leadOptions}
                        displayField="label"
                        value={form.leadNo}
                        onChange={(selected: any) => {
                          const customerAccount = oppAccounts.find(
                            (acc: any) =>
                              Number(acc.value) === Number(selected.customerId),
                          );

                          setForm((prev) => ({
                            ...prev,
                            leadNo: selected, // object store કરો
                            oppAccount: customerAccount || null,
                          }));
                        }}
                        placeholder="Search Quotation No / Customer"
                        searchFields={["quotationNo", "customerName", "mobile"]}
                        error={errors.leadNo}
                        columns={[
                          {
                            header: "Quotation No",
                            field: "quotationNo",
                            width: "1.5fr",
                          },
                          {
                            header: "Customer",
                            field: "customerName",
                            width: "2fr",
                          },
                          {
                            header: "Mobile",
                            field: "mobile",
                            width: "1.5fr",
                          },
                        ]}
                      />
                    )}

                    {form.type === "Job Card" && (
                      <Combobox
                        data={jobCardOptions}
                        displayField="label"
                        value={form.jobCardNo}
                        onChange={(value: any) => {
                          setForm({ ...form, jobCardNo: value });
                          if (errors.jobCardNo)
                            setErrors({ ...errors, jobCardNo: "" });
                        }}
                        placeholder="Search or select job card..."
                        searchFields={["label"]}
                        error={errors.jobCardNo}
                      />
                    )}
                  </div>
                </div>
                {/* Row 1: Cash Account | Voucher No | Date */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cash Account <span className="text-red-500">*</span>
                    </label>
                    <Combobox
                      data={cashAccounts}
                      displayField="label"
                      value={form.cashAccount}
                      onChange={(val: any) => {
                        setForm({ ...form, cashAccount: val });

                        if (errors.cashAccount) {
                          setErrors({ ...errors, cashAccount: "" });
                        }
                      }}
                      placeholder="Search Cash Account"
                      searchFields={["label", "mobile"]}
                      error={errors.cashAccount}
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
                        // {
                        //   header: "Opening",
                        //   field: "openingBalance",
                        //   width: "1fr",
                        // },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Voucher No.
                    </label>
                    <input
                      type="text"
                      value={form.voucherNo}
                      onChange={(e) =>
                        setForm({ ...form, voucherNo: e.target.value })
                      }
                      className="dark:border-dark-500 dark:bg-dark-600 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </label>
                    <DatePicker
                      placeholder="Select date..."
                      value={form.date}
                      onChange={(date) => setForm({ ...form, date })}
                      options={{ disableMobile: true }}
                    />
                  </div>
                </div>

                {/* Dotted Separator */}
                <div className="border-t border-dashed border-blue-300 dark:border-blue-700" />

                {/* Row 2: Opp. Account | Amount */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Opp. Account <span className="text-red-500">*</span>
                      </label>

                      {form.oppAccount && (
                        <span
                          className={`text-sm font-semibold ${
                            form.oppAccount.balanceType === "Dr"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Balance : ₹
                          {Number(form.oppAccount.balance || 0).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                            },
                          )}{" "}
                          {form.oppAccount.balanceType}
                        </span>
                      )}
                    </div>
                    <Combobox
                      data={oppAccounts}
                      displayField="label"
                      value={form.oppAccount}
                      onChange={(val: any) => {
                        setForm({ ...form, oppAccount: val });

                        if (errors.oppAccount) {
                          setErrors({ ...errors, oppAccount: "" });
                        }
                      }}
                      disabled={form.type === "Lead"}
                      placeholder="Search Opp. Account"
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
                      value={form.amount}
                      onChange={(e) => {
                        setForm({ ...form, amount: e.target.value });
                        if (errors.amount) setErrors({ ...errors, amount: "" });
                      }}
                      placeholder="Enter amount"
                      error={errors.amount}
                    />
                  </div>
                </div>
                {/* Row 3: Narration */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Narration
                  </label>
                  <Textarea
                    value={form.narration}
                    onChange={(e) =>
                      setForm({ ...form, narration: e.target.value })
                    }
                    placeholder="Enter Narration"
                    className="dark:border-dark-500 dark:bg-dark-600 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="dark:border-dark-500 flex items-center justify-end gap-3 border-t border-gray-200 p-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowDrawer(false);
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
                  {editId !== null ? "Update" : "Add"} Cash Receipt
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </div>
  );
}
