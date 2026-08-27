// src/app/pages/allot/vehicle_verify_accessories.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  EyeIcon,
  XMarkIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Listbox } from "@/components/shared/form/StyledListbox";
import apiHelper from "@/utils/apiHelper";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ---------- Types ----------
interface AccessoryItem {
  id: number;
  itemId: number;
  itemName: string;
  itemCode: string;
  hsnCode: string;
  selectedStock: number;
  tax: number;
  salesPrice: number;
  status: string;
    verifyStatus: string;
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
  pendingAccessories?: AccessoryItem[];
allottedAccessories?: AccessoryItem[];
allVerified:"string";
}

// ---------- Options ----------
const entriesOptions = [
  { id: 10, name: "10" },
  { id: 15, name: "15" },
  { id: 25, name: "25" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

const VehicleVerifyAccessories: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<AccessoryAllotmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  // State for drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<AccessoryAllotmentDetail | null>(null);

  // Fetch accessory items for this allotment (using vehicle verify endpoint)
  const fetchAccessoryItems = async () => {
    try {
      setLoading(true);
      const res = await apiHelper.get(`/orders/vehicle-verify-accessories`);
    
      setOrders(res.data || []);
    } catch (error: any) {
      console.error(
        "Failed to fetch accessory items:",
        error.response?.data || error,
      );
      setOrders([]);
      toast.error("Failed to load vehicle verify accessories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessoryItems();
  }, []);

  // Filter rows
  const filteredRows = useMemo(() => {
    let result = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((order) =>
        [
          order.accountName,
          order.mobileNo,
          order.quotationNo,
          order.dmsEnquiryNo,
          order.model,
          order.variant,
          order.chassisNo,
          order.invoiceNo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    return result;
  }, [orders, search]);

  const totalItems = filteredRows.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  // Handle open drawer with accessories
const handleOpenDrawer = (order: AccessoryAllotmentDetail) => {
  setSelectedOrder({
    ...order,
    accessories: [...(order.allottedAccessories ?? [])],
  });

  setShowDrawer(true);
};;
const handleOpenViewModal = (order: any) => {
  setSelectedOrder({
    ...order,
    accessories: order.pendingAccessories,
  });

  setShowViewModal(true);
};
  // Handle back navigation
  const handleBack = () => {
    navigate("/allot/accessoriesAllot");
  };

  // Checkbox click -> verify this accessory item (vehicle-verify stage)
const handleCheckboxChange = async (itemId: number) => {
  if (!selectedOrder) return;

  // Check if already verified
  const target = selectedOrder.allottedAccessories?.find(
    (item) => item.id === itemId
  );

  if (!target || target.verifyStatus === "completed") return;

  try {
    setVerifyingId(itemId);

    await apiHelper.patch(
      `/orders/vehicle-verify-accessories/${selectedOrder.id}/item/${itemId}`
    );

    const updateAccessories = (order: AccessoryAllotmentDetail) => {
      if (order.id !== selectedOrder.id) return order;

      return {
        ...order,
        allottedAccessories:
          order.allottedAccessories?.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  verifyStatus: "completed",
                }
              : item
          ) ?? [],
      };
    };

    setOrders((prev) => prev.map(updateAccessories));
    setSelectedOrder((prev) =>
      prev ? updateAccessories(prev) : prev
    );

    toast.success("Item verified successfully");
  } catch (error: any) {
    console.error("Failed to verify item:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to verify accessory item"
    );
  } finally {
    setVerifyingId(null);
  }
};

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500">Loading...</div>
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
              Verify Vehicle Accessories
            </h1>
          </div>
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

      {/* Search */}
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
      </div>

      {/* Table */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table
            hoverable
            className="w-full min-w-300 text-left [&_.table-th]:font-semibold"
          >
            <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
              <Tr>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  S.No
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Account Name
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Mobile No
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Quotation No
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  DMS Date
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  DMS No
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Model
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Variant
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Color
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Chassis No
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Accessories No
                </Th>
                <Th className="py-3.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Accessories Date
                </Th>
                <Th className="py-3.5 text-center text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Allotted
                </Th>
                <Th className="py-3.5 text-center text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Pending
                </Th>
              </Tr>
            </THead>

            <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
              {currentItems.map((order, index) => {
  //          const allVerified =
  // order.allottedAccessories?.length > 0 &&
  // order.allottedAccessories.every(
  //   (item) => item.verifyStatus === "completed"
  // );

                return (
                  <Tr
                    key={order.id}
                    className="dark:hover:bg-dark-700/40 transition-colors hover:bg-gray-50/30"
                  >
                    <Td className="py-4 font-medium text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </Td>
                    <Td>{order.accountName}</Td>
                    <Td>{order.mobileNo}</Td>
                    <Td>{order.quotationNo}</Td>
                    <Td>{order.dmsEnquiryDate}</Td>
                    <Td>{order.dmsEnquiryNo}</Td>
                    <Td>{order.model}</Td>
                    <Td>{order.variant}</Td>
                    <Td>{order.color}</Td>
                    <Td>{order.chassisNo}</Td>
                    <Td>{order.invoiceNo || "-"}</Td>
                    <Td>{order.invoiceDate || "-"}</Td>
                    <Td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex flex-col items-center gap-1">
                          {/* {!allVerified && ( */}
                            <button
                              onClick={() => handleOpenDrawer(order)}
                              className="bg-primary-500 hover:bg-primary-600 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-white transition-colors"
                              title="Verify accessories"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          {/* )} */}

                          {/* {allVerified && ( */}
                        <div
  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-white ${
    order.allVerified
      ? "bg-green-500"
      : "bg-gray-400"
  }`}
>
  <CheckIcon className="h-3 w-3" />
</div>
                          {/* )} */}
                        </div>
                      </div>
                    </Td>
                    <Td className="text-center font-medium text-yellow-600">
                      <button
                        onClick={() => handleOpenViewModal(order)}
                        className="text-primary-500 hover:text-primary-600 transition-colors cursor-pointer"
                        title="View details"
                      >
                        <EyeIcon className="size-5" />
                      </button>
                    </Td>
                  </Tr>
                );
              })}

              {currentItems.length === 0 && (
                <Tr>
                  <Td
                    colSpan={14}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No verified vehicle orders found
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

      {/* Right Side Drawer - View Only (opens from Pending column eye icon) */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowViewModal(false)}
          />

          {/* Drawer */}
          <div className="absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Accessories Details
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedOrder.accountName} - {selectedOrder.chassisNo}
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="size-6" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedOrder.accessories.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <Table hoverable className="w-full text-left">
                      <THead className="bg-gray-100 dark:bg-gray-700">
                        <Tr>
                          <Th className="py-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                            S.No
                          </Th>
                          <Th className="py-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                            Item Name
                          </Th>
                          <Th className="py-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                            Item Code
                          </Th>
                          <Th className="py-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                            HSN Code
                          </Th>
                          <Th className="py-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                            Status
                          </Th>
                        </Tr>
                      </THead>
                      <TBody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedOrder.accessories.map((item, index) => (
                          <Tr key={item.id}>
                            <Td className="py-3">{index + 1}</Td>
                            <Td className="font-medium">{item.itemName}</Td>
                            <Td>{item.itemCode}</Td>
                            <Td>{item.hsnCode}</Td>
                            <Td>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  item.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {item.status === "completed"
                                  ? "Verified"
                                  : "Pending"}
                              </span>
                            </Td>
                          </Tr>
                        ))}
                      </TBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center text-gray-500">
                    No accessories found
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Side Drawer - Checkbox to verify each accessory */}
      {showDrawer && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDrawer(false)}
          />

          {/* Drawer */}
          <div className="absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Accessories List
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedOrder.accountName} - {selectedOrder.chassisNo}
                  </p>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="size-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedOrder.accessories.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <Table hoverable className="w-full text-left">
                      <THead className="bg-gray-100 dark:bg-gray-700">
                        <Tr>
                          <Th className="py-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                            S.No
                          </Th>
                          <Th className="py-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                            Item Name
                          </Th>
                          <Th className="py-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                            Item Code
                          </Th>
                          <Th className="py-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                            HSN Code
                          </Th>
                          <Th className="py-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                            Status
                          </Th>
                          <Th className="py-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                            Action
                          </Th>
                        </Tr>
                      </THead>
                      <TBody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedOrder.accessories.map((item, index) => {
                         const isCompleted = item.verifyStatus === "completed";
                          const isBusy = verifyingId === item.id;

                          return (
                            <Tr key={item.id}>
                              <Td className="py-3">{index + 1}</Td>
                              <Td className="font-medium">{item.itemName}</Td>
                              <Td>{item.itemCode}</Td>
                              <Td>{item.hsnCode}</Td>
                              <Td>
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    isCompleted
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {isCompleted ? "Verified" : "Pending"}
                                </span>
                              </Td>
                              <Td className="text-center">
                                {isCompleted ? (
                                  // Verified ho gaya - checkbox hide, check icon dikhega
                                  <div
                                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white"
                                    title="Verified"
                                  >
                                    <CheckIcon className="h-3 w-3" />
                                  </div>
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={false}
                                    disabled={isBusy}
                                    onChange={() =>
                                      handleCheckboxChange(item.id)
                                    }
                                    className="h-5 w-5 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                )}
                              </Td>
                            </Tr>
                          );
                        })}
                      </TBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center text-gray-500">
                    No accessories found
                  </div>
                )}
              </div>

              {/* Footer - Close button only */}
              <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                <button
                  onClick={() => setShowDrawer(false)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleVerifyAccessories;