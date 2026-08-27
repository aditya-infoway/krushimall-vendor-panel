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
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
import { Input, Textarea, Checkbox } from "@/components/ui";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────
interface JournalRow {
  party: string;
  debit: string;
  credit: string;
  narration: string;
}

interface JournalEntry {
  id: number;
  date: string;
  voucherNo: string;
  type: string;
  account: string;
  debit: number;
  credit: number;
  narration: string;
  createdType: string;
  createdBy: string;
}

// ── Static party options ───────────────────────────────────────────────────────
const PARTY_OPTIONS = [
  {
    id: 1,
    label: "Denish patel (9081540774)",
    value: "Denish patel (9081540774)",
  },
  {
    id: 2,
    label: "Cash account (9081540777)",
    value: "Cash account (9081540777)",
  },
  {
    id: 3,
    label: "Suresh Kumar (9081540775)",
    value: "Suresh Kumar (9081540775)",
  },
  {
    id: 4,
    label: "Ramesh Singh (9081540776)",
    value: "Ramesh Singh (9081540776)",
  },
];

const EMPTY_ROW: JournalRow = {
  party: "",
  debit: "",
  credit: "",
  narration: "",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const sum = (rows: JournalRow[], key: "debit" | "credit") =>
  rows.reduce((acc, r) => acc + (parseFloat(r[key]) || 0), 0).toFixed(2);

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
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // modal form state
  const [date, setDate] = useState<any>(null);
  const [voucherNo, setVoucherNo] = useState("J/25-26/001");
  const [referenceNo, setReferenceNo] = useState("");
  const [rows, setRows] = useState<JournalRow[]>([{ ...EMPTY_ROW }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter states
  const [filterDateFrom, setFilterDateFrom] = useState<any>(null);
  const [filterDateTo, setFilterDateTo] = useState<any>(null);
  const [filterType, setFilterType] = useState("All");
  const [showFilterBar, setShowFilterBar] = useState(false);

  const openModal = () => {
    setDate(null);
    setVoucherNo("J/25-26/001");
    setReferenceNo("");
    setRows([{ ...EMPTY_ROW }]);
    setErrors({});
    setShowModal(true);
  };

  const updateRow = (i: number, field: keyof JournalRow, val: string) => {
    const next = [...rows];
    next[i] = { ...next[i], [field]: val };
    setRows(next);
  };

  const addRow = (i: number) => {
    const next = [...rows];
    next.splice(i + 1, 0, { ...EMPTY_ROW });
    setRows(next);
  };

  const removeRow = (i: number) => {
    if (rows.length <= 1) return;
    const next = rows.filter((_, idx) => idx !== i);
    setRows(next);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const validRows = rows.filter((r) => r.party && (r.debit || r.credit));
    if (validRows.length === 0) {
      newErrors.rows = "At least one valid row is required";
    }
    if (!date) {
      newErrors.date = "Date is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const validRows = rows.filter((r) => r.party && (r.debit || r.credit));
    if (!validRows.length) return;

    try {
      const newEntries: JournalEntry[] = validRows.map((r, idx) => ({
        id: entries.length + idx + 1,
        date:
          date ||
          new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
        voucherNo,
        type: "Journal",
        account: r.party,
        debit: parseFloat(r.debit) || 0,
        credit: parseFloat(r.credit) || 0,
        narration: r.narration,
        createdType: "Manual",
        createdBy: "Admin",
      }));

      setEntries([...entries, ...newEntries]);
      setShowModal(false);
      setErrors({});
      toast.success("Journal entry added successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to add journal entry. Please try again.",
      );
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
    return matchesSearch && matchesType;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const totalDebit = sum(rows, "debit");
  const totalCredit = sum(rows, "credit");

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

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Upper Actions Control Toolbar Layout */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Journal Entries
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all journal entries
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 md:flex-nowrap">
          {/* Left side - Filter and icons */}
          <div className="flex items-center gap-2">
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
              <span className="hidden sm:inline">Filter</span>
            </button>

            <button
              type="button"
              className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <RiFileExcel2Fill className="text-lg text-green-500" />
            </button>

            <button
              type="button"
              className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <RiFilePdfFill className="text-lg text-red-500" />
            </button>
          </div>

          {/* Right side - Add Journal Entry button */}
          <button
            type="button"
            onClick={openModal}
            className="bg-primary-600 hover:bg-primary-700 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-colors"
          >
            <Plus className="size-4.5" />
            Add Journal Entry
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search journal entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>

      {showFilterBar && (
        <div className="dark:bg-dark-700 dark:border-dark-500 animate-in fade-in slide-in-from-top-2 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-150">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="dark:text-dark-200 mb-1.5 block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="dark:border-dark-500 dark:bg-dark-600 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="All">All Types</option>
                <option value="Journal">Journal</option>
              </select>
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
          <table className="w-full min-w-[1000px] text-left [&_.table-th]:font-semibold">
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
                  Account
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Debit
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Credit
                </th>
                <th className="px-3 py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Narration
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
                      {item.date}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-gray-400">
                      {item.voucherNo}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {item.account}
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold whitespace-nowrap text-gray-900 dark:text-gray-400">
                      ₹{item.debit.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold whitespace-nowrap text-gray-900 dark:text-gray-400">
                      ₹{item.credit.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {item.narration}
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
                    No journal entries found
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
                                  ? "bg-red-600 text-white"
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
                          ? "bg-red-600 text-white"
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
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-4xl transform-gpu flex-col bg-white shadow-2xl transition-transform duration-200">
              <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <h2 className="dark:text-dark-50 text-lg font-semibold text-gray-800">
                  Add Journal Entry
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="size-8 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="grow space-y-5 overflow-y-auto p-5">
                {/* Top row: Date | Voucher No. | Reference No. */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      placeholder="Select date..."
                      value={date}
                      onChange={setDate}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Voucher No.
                    </label>
                    <input
                      type="text"
                      value={voucherNo}
                      onChange={(e) => setVoucherNo(e.target.value)}
                      className="dark:border-dark-500 dark:bg-dark-600 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reference No.
                    </label>
                    <input
                      type="text"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      placeholder="Reference No."
                      className="dark:border-dark-500 dark:bg-dark-600 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                {errors.rows && (
                  <p className="text-sm text-red-500">{errors.rows}</p>
                )}

                {/* Inner table */}
                <div className="dark:border-dark-500 overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead className="dark:bg-dark-600/60 bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                          Select Party
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                          Debit
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                          Credit
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                          Narration
                        </th>

                        <th className="px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="dark:divide-dark-600 divide-y divide-gray-200">
                      {rows.map((row, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2">
                            <Combobox
                              data={PARTY_OPTIONS}
                              displayField="label"
                              value={row.party}
                              onChange={(value: any) =>
                                updateRow(i, "party", value)
                              }
                              placeholder="Select Party"
                              searchFields={["label"]}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              value={row.debit}
                              onChange={(e) =>
                                updateRow(i, "debit", e.target.value)
                              }
                              placeholder="Debit"
                              className="w-full"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              value={row.credit}
                              onChange={(e) =>
                                updateRow(i, "credit", e.target.value)
                              }
                              placeholder="Credit"
                              className="w-full"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={row.narration}
                              onChange={(e) =>
                                updateRow(i, "narration", e.target.value)
                              }
                              placeholder="Enter Narration"
                              className="w-full"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => addRow(i)}
                                className="inline-flex size-8 items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700"
                                title="Add Row"
                              >
                                <Plus className="size-4" />
                              </button>
                              {rows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRow(i)}
                                  className="inline-flex size-8 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700"
                                  title="Remove Row"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {/* Total row */}
                      <tr className="dark:bg-dark-600/50 bg-gray-50">
                        <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">
                          TOTAL
                        </td>
                        <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">
                          ₹{totalDebit}
                        </td>
                        <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">
                          ₹{totalCredit}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tbody>
                  </table>
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
                  Submit
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </div>
  );
}
