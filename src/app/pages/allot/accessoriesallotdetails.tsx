// src/app/pages/allot/AccessoriesAllotDetail.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Listbox } from "@/components/shared/form/StyledListbox";
import apiHelper from "@/utils/apiHelper";
import { useNavigate, useParams } from "react-router-dom";
import AccessoryPurchaseHistory from "./AccessoryPurchaseHistory";
import { toast } from "sonner";
import { DatePicker } from "@/components/shared/form/Datepicker";

import { useForm, Controller } from "react-hook-form";
// ---------- Types ----------
interface AccessoryItem {
  id: number; // OrderAccessory ID
  itemId: number; // Accessory ID
  itemName: string;
  itemCode: string;
  hsnCode: string;
  selectedStock: number;
  tax: number;
  salesPrice: number;
  status: string;
}

interface AccessoryAllotmentDetail {
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
  accessoriesAllotStatus: string;
  invoiceNo?: string;
  invoiceDate?: string;
  accessories: AccessoryItem[];
}

// ---------- Options ----------
const entriesOptions = [
  { id: 10, name: "10" },
  { id: 15, name: "15" },
  { id: 25, name: "25" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

const statusOptions = [
  { id: "all", name: "All Status" },
  { id: "pending", name: "Pending" },
  { id: "completed", name: "Completed" },
];

const columns = [
  "#",
  "Item Name",
  "Item Code",
  "HSN Code",
  "Selected Stock",
  "Tax Rate",
  "Sales Price",
  "Action",
  "Status",
];

const AccessoriesAllotDetail: React.FC = () => {
  const { control, register, handleSubmit,  setValue, } = useForm({
    defaultValues: {
      invoiceNo: "",
      invoiceDate: "",
    },
  });
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showInvoiceDrawer, setShowInvoiceDrawer] = useState(false);

  // const [invoiceNo, setInvoiceNo] = useState("");
  // const [invoiceDate, setInvoiceDate] = useState<Date | null>(new Date());
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [detailData, setDetailData] = useState<AccessoryAllotmentDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const isSaved =
    detailData?.accessoriesAllotStatus?.toLowerCase() === "completed";
  // State for history modal
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Fetch accessory items for this allotment
  const fetchAccessoryItems = async () => {
    try {
      setLoading(true);
      const res = await apiHelper.get(`/orders/accessories-allot/${id}`);
     
      setDetailData(res.data || null);
      // Pre-fill invoice data if exists
    if (res.data?.invoiceNo) {
  setValue("invoiceNo", res.data.invoiceNo);
}

if (res.data?.invoiceDate) {
  setValue("invoiceDate", res.data.invoiceDate);
}
    } catch (error: any) {
      console.error(
        "Failed to fetch accessory items:",
        error.response?.data || error,
      );
      setDetailData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAccessoryItems();
    }
  }, [id]);

  // Filter rows
  const filteredRows = useMemo(() => {
    if (!detailData?.accessories) return [];

    let result = detailData.accessories;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        [item.itemName, item.itemCode, item.hsnCode]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    if (selectedStatus !== "all") {
      result = result.filter((item) => item.status === selectedStatus);
    }

    return result;
  }, [detailData, search, selectedStatus]);

  const allCompleted =
    !!detailData &&
    detailData.accessories.length > 0 &&
    detailData.accessories.every(
      (item) => item.status.toLowerCase() === "completed",
    );

  const totalItems = filteredRows.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);
const submitInvoice = async (data: any) => {
  try {
    await apiHelper.post(`/orders/accessories-allot/${id}/save`, {
      invoiceNo: data.invoiceNo,
      invoiceDate: data.invoiceDate,
    });

    toast.success("Saved Successfully");
    setShowInvoiceDrawer(false);
    fetchAccessoryItems();
    navigate("/allot/accessoriesAllot");
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Failed to save");
  }
};

  // Handle status completion for individual accessory
  const handleComplete = async (itemId: number) => {
    try {
      await apiHelper.patch(`/orders/accessories-allot/${id}/item/${itemId}`);
      // Update local state
      if (detailData) {
        const updatedAccessories = detailData.accessories.map((item) =>
          item.id === itemId ? { ...item, status: "completed" } : item,
        );
        setDetailData({
          ...detailData,
          accessories: updatedAccessories,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  // Handle view action for individual accessory - opens the history modal
  const handleView = (item: AccessoryItem) => {
    setSelectedItemId(item.itemId);
    setShowHistoryModal(true);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/allot/accessoriesAllot");
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="text-gray-500">No data found</p>
        <button
          onClick={handleBack}
          className="text-primary-500 hover:text-primary-600 mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
              Accessories Allotment Details
            </h1>
          </div>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            {detailData.accountName} - {detailData.chassisNo}
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
          <button
            onClick={() => navigate(-1)}
            className="bg-primary-500 hover:bg-primary-600 inline-flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors sm:w-auto sm:px-5"
          >
            <ArrowLeftIcon className="mr-1.5 size-4" />
            Back
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="dark:bg-dark-800 dark:border-dark-700 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Accessories</p>
          <p className="text-2xl font-semibold">
            {detailData.accessories.length}
          </p>
        </div>
        <div className="dark:bg-dark-800 dark:border-dark-700 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {
              detailData.accessories.filter((item) => item.status === "pending")
                .length
            }
          </p>
        </div>
        <div className="dark:bg-dark-800 dark:border-dark-700 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-semibold text-green-600">
            {
              detailData.accessories.filter(
                (item) => item.status === "completed",
              ).length
            }
          </p>
        </div>
        <div className="dark:bg-dark-800 dark:border-dark-700 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-semibold">
            ₹
            {detailData.accessories
              .reduce(
                (sum, item) => sum + item.salesPrice * item.selectedStock,
                0,
              )
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by item name, code, HSN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="dark:border-dark-500 dark:bg-dark-800 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm transition-all duration-200 outline-none focus:ring-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="dark:border-dark-500 dark:bg-dark-800 focus:ring-primary-500/20 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
          >
            {statusOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
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
                  Item Name
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Item Code
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  HSN Code
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Selected Stock
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Tax Rate
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Sales Price
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
                  <Td className="font-medium">{item.itemName}</Td>
                  <Td>{item.itemCode}</Td>
                  <Td>{item.hsnCode}</Td>
                  <Td className="">
                    <button
                      onClick={() => handleView(item)}
                      disabled={item.status === "completed"}
                      className={`transition-colors  ${
                        item.status === "completed"
                          ? "cursor-not-allowed text-gray-400 opacity-50"
                          : "text-primary-500 hover:text-primary-600"
                      }`}
                      title={
                        item.status === "completed"
                          ? "Already Allotted"
                          : "View Purchase History"
                      }
                    >
                      <EyeIcon className="size-5" />
                    </button>
                  </Td>
                  <Td>{item.tax}%</Td>
                  <Td>₹{item.salesPrice.toLocaleString()}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={item.status === "completed"}
                          onChange={() => handleComplete(item.id)}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-green-600 peer-focus:ring-2 peer-focus:ring-green-300 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700"></div>
                      </label>
                    </div>
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
                    No accessories items found
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

      {/* {allCompleted && ( */}
        <div className="mt-6 flex items-center gap-3">
        <button
  type="button"
  onClick={() => {
    if (!isSaved) {
      setShowInvoiceDrawer(true);
    }
  }}
  disabled={isSaved}
  className={`cursor-pointer rounded-lg px-5 py-2.5 font-medium text-white transition-colors ${
    isSaved
      ? "cursor-not-allowed bg-gray-400 opacity-60"
      : "bg-primary-500 hover:bg-primary-600"
  }`}
>
  {isSaved ? "Saved" : "Save"}
</button>
          <button
            type="button"
            onClick={handleBack}
            className="cursor-pointer rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      {/* )} */}

      {/* Invoice Drawer - Right Side Slide Over */}
     {showInvoiceDrawer && (
  <div className="fixed inset-0 z-50 overflow-hidden">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/50"
      onClick={() => setShowInvoiceDrawer(false)}
    />

    {/* Drawer */}
    <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl dark:bg-gray-800">
      <form
        onSubmit={handleSubmit(submitInvoice)}
        className="flex h-full flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Accessories Invoice
          </h2>

          <button
            type="button"
            onClick={() => setShowInvoiceDrawer(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <XMarkIcon className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">

            {/* Invoice Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Invoice Number <span className="text-red-500">*</span>
              </label>

              <input
                {...register("invoiceNo", {
                  required: "Invoice Number is required",
                })}
                placeholder="Enter invoice number"
                className="focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Invoice Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Invoice Date <span className="text-red-500">*</span>
              </label>

              <Controller
                name="invoiceDate"
                control={control}
                rules={{
                  required: "Invoice Date is required",
                }}
                render={({ field, fieldState }) => (
                  <DatePicker
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    placeholder="DD-MM-YYYY"
                    options={{
                      dateFormat: "d-m-Y",
                      disableMobile: true,
                      maxDate: "today",
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Summary
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Total Accessories:
                  </span>

                  <span className="font-medium text-gray-900 dark:text-white">
                    {detailData.accessories.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Total Value:
                  </span>

                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹
                    {detailData.accessories
                      .reduce(
                        (sum, item) =>
                          sum + item.salesPrice * item.selectedStock,
                        0
                      )
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
            >
              Save Invoice
            </button>

            <button
              type="button"
              onClick={() => setShowInvoiceDrawer(false)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Render the history modal with props */}
      {showHistoryModal && selectedItemId && id && (
        <AccessoryPurchaseHistory
          allotmentId={id}
          itemId={selectedItemId}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedItemId(null);
          }}
        />
      )}
    </div>
  );
};

export default AccessoriesAllotDetail;
