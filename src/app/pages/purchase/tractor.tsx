// src/app/pages/purchase/tractor/register.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import apiHelper from "@/utils/apiHelper";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
import { Button, Checkbox, Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// ---------- Types ----------
export interface PurchaseRegisterRow {
  id: string;
  purchaseDate: string;
  terms: string;
  supplierName: string;
  billNo: string;
  purchaseBillNo: string;
  location: string;
  purchaseLocation: string;
  totalQuantity: number;
  totalAmount: number;
  freightInsuranceOther: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  transportName: string;
  mobileNo: string;
  vehicalNo: string;
  status: string;
  verified: boolean;
  allInward: boolean;
   hasBookedItem: boolean;
    createdBy?: string;
  createdById?: number;
  createdType?: string;
}

interface TractorPurchaseRegisterProps {
  rows?: PurchaseRegisterRow[];
  onAddPurchase?: () => void;
  onEditRow?: (row: PurchaseRegisterRow) => void;
  onDeleteRow?: (row: PurchaseRegisterRow) => void;
}

// ---------- Options ----------
const entriesOptions = [
  { id: 10, name: "10" },
  { id: 15, name: "15" },
  { id: 25, name: "25" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

const statusFilterOptions = [
  { id: "All", name: "All Statuses" },
  { id: "Pending", name: "Pending" },
  { id: "Verified", name: "Verified" },
  { id: "Cancelled", name: "Cancelled" },
];

const statusColors: Record<PurchaseRegisterRow["status"], string> = {
  Pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Verified:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const fmt = (n: number) =>
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const columns = [
  "#",
  "Action",
  "Purchase Date",
  "Terms",
  "Supplier Name",
  "Bill No.",
  "Purchase Bill No.",
  "Location",
  "Total Quantity",
  "Total Amount",
  "Freight + Insurance + Other",
  "CGST Amount",
  "SGST Amount",
  "IGST Amount",
  "Grand Total",
  "Transport Name",
  "Mobile No",
  "Vehicle No",
  "Status",
   "Created By",      // Add
  "Created Type",
];

const TractorPurchaseRegister: React.FC<TractorPurchaseRegisterProps> = ({
  onAddPurchase,
  onEditRow,
  onDeleteRow,
}) => {
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<PurchaseRegisterRow[]>([]);
  const navigate = useNavigate();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmState, setConfirmState] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Filter rows
  const filteredRows = useMemo(() => {
    let result = rows;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        [
          r.supplierName,
          r.billNo,
          r.purchaseBillNo,
          r.location,
          r.transportName,
          r.mobileNo,
          r.vehicalNo,
          r.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    // Status filter
    if (selectedStatusFilter !== "All") {
      result = result.filter((r) => r.status === selectedStatusFilter);
    }

    return result;
  }, [rows, search, selectedStatusFilter]);

  const totalItems = filteredRows.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  const isAllPageSelected =
    currentItems.length > 0 &&
    currentItems.every((item) => selectedIds.includes(item.id));
  const getPurchases = async () => {
    try {
      const res = await apiHelper.get("/purchases");

      const purchases = res.data || [];

      setRows(
        purchases.map((item: any) => ({
          id: item.id,
          purchaseDate: item.purchaseDate?.split("T")[0] || "",
          terms: item.terms,
          supplierName: item.account?.accountName || "",
          billNo: item.billNo,
          purchaseBillNo: item.purchaseBillNo,
          purchaseLocation: item.purchaseLocation || "",
          totalQuantity: item.totalQty,
          totalAmount: Number(item.totalAmount),
          freightInsuranceOther:
            Number(item.freightCharge || 0) +
            Number(item.insurance || 0) +
            Number(item.otherCharge || 0),
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          grandTotal: Number(item.grandTotal),
          transportName: item.transporterName || "",
          mobileNo: item.mobileNumber || "",
          vehicalNo: item.vehicleNumber || "",
          status: item.status === "VERIFY" ? "Verified" : "Pending",
hasBookedItem: item.hasBookedItem,
          verified: item.verified,
          allInward: item.allInward,
           createdBy: item.createdBy,
    createdById: item.createdById,
    createdType: item.createdType,
        })),
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPurchases();
  }, []);
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = currentItems.map((item) => item.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = currentItems.map((item) => item.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  const handleAddPurchase = () => {
    navigate("/purchase/tractor/add");
    if (onAddPurchase) onAddPurchase();
  };

  const handleEditRow = (row: PurchaseRegisterRow) => {
    navigate(`/purchase/tractor/${row.id}`);
    if (onEditRow) onEditRow(row);
  };

  const handleDeleteRow = (row: PurchaseRegisterRow) => {
    setDeleteTargetId(row.id);
    setIsBulkDelete(false);
    setConfirmState("pending");
    setShowConfirmModal(true);
  };

  const performDelete = async () => {
    setConfirmLoading(true);
    try {
      if (isBulkDelete) {
        await Promise.all(
          selectedIds.map((id) => apiHelper.delete(`/purchases/${id}`)),
        );
        toast.success(`${selectedIds.length} purchases deleted successfully!`);
        setSelectedIds([]);
        await getPurchases();
        setCurrentPage(1);
        setConfirmState("success");
      } else {
        if (deleteTargetId === null) return;
        await apiHelper.delete(`/purchases/${deleteTargetId}`);
        toast.success("Purchase deleted successfully!");
        await getPurchases();
        setDeleteTargetId(null);
        setConfirmState("success");
      }
      setTimeout(() => setShowConfirmModal(false), 1500);
    } catch (error: any) {
      console.error("Delete failed:", error);
      setConfirmState("error");
      toast.error(
        error.response?.data?.message || "Failed to delete. Please try again.",
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setIsBulkDelete(true);
    setConfirmState("pending");
    setShowConfirmModal(true);
  };

  const handleInward = (row: PurchaseRegisterRow) => {
    navigate(`/purchase/tractor/inward/${row.id}`);
  };
  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Purchase Register
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all purchase transactions from here
          </p>
        </div>

       <div className="flex flex-wrap items-center justify-between gap-2 md:flex-nowrap">
  {/* Left side - Excel and PDF icons */}
  <div className="flex items-center gap-2">
    <button
      type="button"
      className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
    >
      <RiFileExcel2Fill className="text-lg text-green-500" />
    </button>

    <button
      type="button"
      className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
    >
      <RiFilePdfFill className="text-lg text-red-500" />
    </button>
  </div>

  {/* Right side - Add Purchase button */}
  <Button
    color="primary"
    onClick={handleAddPurchase}
    className="whitespace-nowrap"
  >
    <PlusIcon className="mr-1.5 size-4.5" />
    Add Purchase
  </Button>
</div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by supplier, bill no, location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Status:
          </span>
          <Listbox
            data={statusFilterOptions}
            value={
              statusFilterOptions.find((o) => o.id === selectedStatusFilter) ||
              statusFilterOptions[0]
            }
            placeholder="All Statuses"
            onChange={(opt: any) => {
              setSelectedStatusFilter(opt.id);
              setCurrentPage(1);
            }}
            displayField="name"
          />
        </div>
      </div>

      {/* Table */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table
            hoverable
            className="w-full min-w-[1600px] text-left [&_.table-th]:font-semibold"
          >
            <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
              <Tr>
                <Th className="w-12 py-3.5 text-center">
                  <Checkbox
                    className="size-4.5"
                    checked={isAllPageSelected}
                    onChange={(e: any) => handleSelectAll(e.target.checked)}
                  />
                </Th>
                <Th className="w-16 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  S.No
                </Th>
                <Th className="w-20 py-3.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Action
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Purchase Date
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Terms
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Supplier Name
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Bill No.
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Purchase Bill No.
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Location
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Total Qty
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Total Amount
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Freight + Ins + Other
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  CGST
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  SGST
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  IGST
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Grand Total
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Transport
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Mobile No
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Vehicle No
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Status
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
  Created By
</Th>

<Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
  Created Type
</Th>
              </Tr>
            </THead>

            <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
              {currentItems.map((item, index) => {
                const isRowSelected = selectedIds.includes(item.id);
                return (
                  <Tr
                    key={item.id}
                    className={`${
                      isRowSelected ? "dark:bg-dark-600/30 bg-gray-50/50" : ""
                    } dark:hover:bg-dark-700/40 transition-colors hover:bg-gray-50/30`}
                  >
                    <Td className="py-4 text-center">
                      <Checkbox
                        className="size-4.5"
                        checked={isRowSelected}
                        onChange={() => handleSelectRow(item.id)}
                      />
                    </Td>
                    <Td className="py-4 font-medium text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </Td>
                    <Td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                      {!item.allInward && !item.hasBookedItem && (
                          <button
                            onClick={() => handleEditRow(item)}
                            className="cursor-pointer text-blue-500 hover:text-blue-700"
                            title="Edit"
                          >
                            <PencilIcon className="size-4.5" />
                          </button>
                        )}
                        {item.verified && (
                          <button
                            onClick={() => handleInward(item)}
                            className="cursor-pointer text-green-500 hover:text-green-700"
                            title="Inward"
                          >
                            <ArrowDownCircleIcon className="size-5" />
                          </button>
                        )}
                      </div>
                    </Td>
                    <Td className="py-4 whitespace-nowrap">
                      {item.purchaseDate
                        ? item.purchaseDate.split("-").reverse().join("-")
                        : ""}
                    </Td>
                    <Td className="py-4">{item.terms}</Td>
                    <Td className="py-4 font-medium">{item.supplierName}</Td>
                    <Td className="py-4">{item.billNo}</Td>
                    <Td className="py-4">{item.purchaseBillNo}</Td>
                    <Td className="py-4">{item.purchaseLocation}</Td>
                    <Td className="py-4 text-right">{item.totalQuantity}</Td>
                    <Td className="py-4 text-right">
                      ₹{fmt(item.totalAmount)}
                    </Td>
                    <Td className="py-4 text-right">
                      ₹{fmt(item.freightInsuranceOther)}
                    </Td>
                    <Td className="py-4 text-right">₹{fmt(item.cgstAmount)}</Td>
                    <Td className="py-4 text-right">₹{fmt(item.sgstAmount)}</Td>
                    <Td className="py-4 text-right">₹{fmt(item.igstAmount)}</Td>
                    <Td className="py-4 text-right font-bold text-blue-600 dark:text-blue-400">
                      ₹{fmt(item.grandTotal)}
                    </Td>
                    <Td className="py-4">{item.transportName}</Td>
                    <Td className="py-4">{item.mobileNo}</Td>
                    <Td className="py-4">{item.vehicalNo}</Td>
                    <Td className="py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusColors[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </Td>
                      <Td className="py-4">{item.createdBy}</Td>
                    <Td className="py-4">{item.createdType }</Td>
                  </Tr>
                );
              })}

              {currentItems.length === 0 && (
                <Tr>
                  <Td
                    colSpan={columns.length + 1}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No purchase records found
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

      {/* Confirmation Modal */}
      <ConfirmModal
        show={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setDeleteTargetId(null);
          setConfirmState("pending");
        }}
        onOk={performDelete}
        confirmLoading={confirmLoading}
        state={confirmState}
        messages={{
          pending: {
            Icon: ExclamationTriangleIcon,
            title: isBulkDelete
              ? "Delete Selected Purchases?"
              : "Are you sure?",
            description: isBulkDelete
              ? `Are you sure you want to delete ${selectedIds.length} selected purchases? This action cannot be undone.`
              : "Are you sure you want to delete this purchase? Once deleted, it cannot be restored.",
            actionText: isBulkDelete ? "Delete All" : "Delete",
          },
          success: {
            title: "Deleted Successfully",
            description: isBulkDelete
              ? `${selectedIds.length} purchases have been deleted.`
              : "The purchase has been deleted.",
            actionText: "Done",
          },
          error: {
            title: "Delete Failed",
            description: "Failed to delete. Please try again.",
            actionText: "Try Again",
          },
        }}
      />
    </div>
  );
};

export default TractorPurchaseRegister;
