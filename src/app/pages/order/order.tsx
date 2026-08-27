import { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Package,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
  CircleX,
  RefreshCcw,
  Search,
  Eye,
} from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";

import { toast } from "sonner";
import apiHelper from "../../../utils/apiHelper";

// ================================
// STATUS TABS
// ================================

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "PLACED", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PACKAGING", label: "Packaging" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "RETURNED", label: "Returned" },
  { key: "FAILED", label: "Failed" },
];

// ================================
// STATUS BADGE
// ================================

const STATUS_BADGE: Record<string, string> = {
  PLACED: "bg-yellow-500/15 text-yellow-400",
  CONFIRMED: "bg-blue-500/15 text-blue-400",
  PACKAGING: "bg-purple-500/15 text-purple-400",
  OUT_FOR_DELIVERY: "bg-indigo-500/15 text-indigo-400",
  DELIVERED: "bg-green-500/15 text-green-400",
  CANCELLED: "bg-red-500/15 text-red-400",
  RETURNED: "bg-orange-500/15 text-orange-400",
  FAILED: "bg-pink-500/15 text-pink-400",
};

// ================================
// SUMMARY CARDS
// ================================

const SUMMARY_CARDS = [
  {
    key: "all",
    label: "Total",
    icon: ShoppingBag,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    key: "PLACED",
    label: "Pending",
    icon: Clock,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    icon: CheckCircle,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    key: "PACKAGING",
    label: "Packaging",
    icon: Package,
    gradient: "from-purple-500 to-fuchsia-600",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    icon: Truck,
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    icon: PackageCheck,
    gradient: "from-emerald-500 to-green-600",
  },
  {
    key: "CANCELLED",
    label: "Cancelled",
    icon: XCircle,
    gradient: "from-red-500 to-rose-600",
  },
  {
    key: "RETURNED",
    label: "Returned",
    icon: RotateCcw,
    gradient: "from-orange-500 to-orange-600",
  },
  {
    key: "FAILED",
    label: "Failed",
    icon: CircleX,
    gradient: "from-pink-500 to-rose-600",
  },
];

// ================================
// COMPONENT
// ================================

const Order = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Same pagination options and behavior as Product page
  const entriesOptions = [
    { id: 10, name: "10" },
    { id: 20, name: "20" },
    { id: 30, name: "30" },
    { id: 40, name: "40" },
    { id: 50, name: "50" },
    { id: 100, name: "100" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ================================
  // FETCH ORDERS
  // ================================

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const data = await apiHelper.get("/vendor-panel/orders");

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.message || "Failed to load orders");
      }
    } catch (err: any) {
      console.error("fetchOrders error:", err);

      toast.error(
        err.response?.data?.message || "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // INITIAL LOAD
  // ================================

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================================
  // ORDER COUNTS
  // ================================

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: orders.length,
    };

    STATUS_TABS.slice(1).forEach((tab) => {
      c[tab.key] = orders.filter(
        (order) => order.orderStatus === tab.key
      ).length;
    });

    return c;
  }, [orders]);

  // ================================
  // FILTER ORDERS
  // ================================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (
        activeTab !== "all" &&
        order.orderStatus !== activeTab
      ) {
        return false;
      }

      // Search filter
      if (search) {
        const searchText = search.toLowerCase();

        const orderNumber =
          order.orderNumber?.toLowerCase() || "";

        const fullName =
          order.fullName?.toLowerCase() || "";

        if (
          !orderNumber.includes(searchText) &&
          !fullName.includes(searchText)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeTab, search]);

  // Same pagination calculation as Product page
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredOrders, currentPage, totalPages]);

  // ================================
  // UPDATE ORDER STATUS
  // ================================

  const handleStatusChange = async (
    orderNumber: string,
    newStatus: string
  ) => {
    try {
      setUpdatingId(orderNumber);

      const data = await apiHelper.patch(
        `/vendor-panel/orders/${orderNumber}/status`,
        {
          status: newStatus,
        }
      );

      if (data.success) {
        toast.success("Order status updated");

        setOrders((prev) =>
          prev.map((order) =>
            order.orderNumber === orderNumber
              ? {
                  ...order,
                  orderStatus: newStatus,
                }
              : order
          )
        );
      } else {
        toast.error(
          data.message || "Failed to update status"
        );
      }
    } catch (err: any) {
      console.error("handleStatusChange error:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to update status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ================================
  // FORMAT DATE
  // ================================

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ================================
  // FORMAT AMOUNT
  // ================================

  const formatAmount = (amount: any) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // ================================
  // VIEW ORDER
  // ================================

  const handleViewOrder = (order: any) => {
    // You can connect your order-details page here.
    toast.info(`Order ${order.orderNumber}`);
  };

  // ================================
  // UI
  // ================================

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Branch Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
            Manage and track all orders from your branch
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCcw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* =====================================
          SUMMARY TITLE
      ====================================== */}

      <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
        Order Summary
      </h2>

      {/* =====================================
          SUMMARY CARDS
      ====================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 mb-8">
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.key}
              onClick={() => setActiveTab(card.key)}
              className={`cursor-pointer rounded-2xl p-5 text-white bg-gradient-to-br ${card.gradient} shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all ${
                activeTab === card.key
                  ? "ring-2 ring-white/70"
                  : ""
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                <Icon className="h-4 w-4" />
              </div>

              <p className="text-2xl font-bold">
                {counts[card.key] ?? 0}
              </p>

              <p className="text-xs opacity-90 mt-1">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* =====================================
          SEARCH
      ====================================== */}

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filteredOrders.length} orders
        </p>

        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-3 pl-9 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-gray-200"
          />
        </div>
      </div>

      {/* =====================================
          STATUS TABS
      ====================================== */}

      <div className="mb-4 flex items-center gap-1 overflow-x-auto border-b border-gray-200 dark:border-dark-700">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab.label} ({counts[tab.key] ?? 0})
          </button>
        ))}
      </div>

      {/* =====================================
          TABLE - same Table component/theme as Product page
      ====================================== */}

      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table
            hoverable
            className="w-full min-w-[900px] text-left [&_.table-th]:font-semibold"
          >
            <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
              <Tr>
                <Th className="w-16 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  S.No
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Order ID
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Order Date
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Customer
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Amount (Your Items)
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Status
                </Th>
                <Th className="w-20 py-3.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </Th>
              </Tr>
            </THead>

            <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
              {currentItems.map((order, index) => (
                <Tr
                  key={order.id}
                  className="dark:hover:bg-dark-700/40 transition-colors hover:bg-gray-50/30"
                >
                  <Td className="py-4 font-medium text-gray-500">
                    {indexOfFirstItem + index + 1}
                  </Td>

                  <Td className="py-4 font-medium text-gray-900 dark:text-gray-200">
                    {order.orderNumber}
                  </Td>

                  <Td className="py-4 text-gray-600 dark:text-dark-200">
                    {formatDate(order.createdAt)}
                  </Td>

                  <Td className="py-4">
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {order.fullName || "-"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.phone || "-"}
                    </p>
                  </Td>

                  <Td className="py-4 font-semibold text-gray-900 dark:text-gray-200">
                    {formatAmount(order.totalAmount)}
                  </Td>

                  <Td className="py-4">
                    <select
                      value={order.orderStatus}
                      disabled={updatingId === order.orderNumber}
                      onChange={(e) =>
                        handleStatusChange(
                          order.orderNumber,
                          e.target.value,
                        )
                      }
                      className={`rounded-full border-0 px-2.5 py-1.5 text-xs font-semibold outline-none ${
                        STATUS_BADGE[order.orderStatus] ||
                        "bg-gray-100 text-gray-700 dark:bg-dark-600 dark:text-gray-200"
                      } ${
                        updatingId === order.orderNumber
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      }`}
                    >
                      {STATUS_TABS.slice(1).map((status) => (
                        <option
                          key={status.key}
                          value={status.key}
                          className="bg-white text-gray-800 dark:bg-dark-800 dark:text-gray-200"
                        >
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </Td>

                  <Td className="py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleViewOrder(order)}
                      className="dark:hover:bg-dark-600 dark:text-dark-200 inline-flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
                      title="View order"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </Td>
                </Tr>
              ))}

              {currentItems.length === 0 && !loading && (
                <Tr>
                  <Td
                    colSpan={7}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No orders found
                  </Td>
                </Tr>
              )}

              {loading && (
                <Tr>
                  <Td
                    colSpan={7}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                      Loading orders...
                    </div>
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>

        {/* Same pagination UI as Product page */}
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
                    <svg
                      className="ml-2 h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
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
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
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
                  <ChevronLeftIcon className="size-4" />
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

    </div>
  );
};

export default Order;