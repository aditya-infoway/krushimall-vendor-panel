import { useState, useEffect, useMemo, Fragment } from "react";
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
  Pencil,
  X,
   Eye,          
  ImageIcon,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Hash,
  Receipt,
  Tag,
} from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
  Dialog,
} from "@headlessui/react";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Listbox } from "@/components/shared/form/StyledListbox";
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
const statusOptions = STATUS_TABS.slice(1).map((status) => ({
  id: status.key,
  name: status.label,
}));
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

  // ---------- Drawer state ----------
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [drawerStatus, setDrawerStatus] = useState("");
// ---------- Cancel details modal + image drawer state ----------
const [cancelModalOpen, setCancelModalOpen] = useState(false);
const [cancelOrderData, setCancelOrderData] = useState<any | null>(null);
const [imageDrawerOpen, setImageDrawerOpen] = useState(false);
const [imageDrawerImages, setImageDrawerImages] = useState<string[]>([]);
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
const handleViewCancelDetails = (order: any) => {
  setCancelOrderData(order);
  setCancelModalOpen(true);
};

const closeCancelModal = () => {
  setCancelModalOpen(false);
  setCancelOrderData(null);
};

const openImageDrawer = (images: string[]) => {
  setImageDrawerImages(images || []);
  setImageDrawerOpen(true);
};

const closeImageDrawer = () => {
  setImageDrawerOpen(false);
  setImageDrawerImages([]);
};
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
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    STATUS_TABS.slice(1).forEach((tab) => {
      c[tab.key] = orders.filter(
        (order) => order.orderStatus === tab.key,
      ).length;
    });
    return c;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeTab !== "all" && order.orderStatus !== activeTab) return false;
      if (search) {
        const searchText = search.toLowerCase();
        const orderNumber = order.orderNumber?.toLowerCase() || "";
        const fullName = order.fullName?.toLowerCase() || "";
        if (!orderNumber.includes(searchText) && !fullName.includes(searchText))
          return false;
      }
      return true;
    });
  }, [orders, activeTab, search]);

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
  // UPDATE ORDER STATUS (called from drawer Save)
  // ================================

  const handleStatusChange = async (orderNumber: string, newStatus: string) => {
    try {
      setUpdatingId(orderNumber);
      const data = await apiHelper.patch(
        `/vendor-panel/orders/${orderNumber}/status`,
        {
          status: newStatus,
        },
      );

      if (data.success) {
        toast.success("Order status updated");
        setOrders((prev) =>
          prev.map((order) =>
            order.orderNumber === orderNumber
              ? { ...order, orderStatus: newStatus }
              : order,
          ),
        );
        setDrawerOpen(false);
        setSelectedOrder(null);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err: any) {
      console.error("handleStatusChange error:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: any) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // ================================
  // OPEN DRAWER (Edit icon click)
  // ================================

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setDrawerStatus(order.orderStatus);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedOrder(null);
  };

  // ================================
  // UI
  // ================================

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Branch Orders
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage and track all orders from your branch
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
        Order Summary
      </h2>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              onClick={() => setActiveTab(card.key)}
              className={`cursor-pointer rounded-2xl bg-linear-to-br p-5 text-white ${card.gradient} shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl ${
                activeTab === card.key ? "ring-2 ring-white/70" : ""
              }`}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">{counts[card.key] ?? 0}</p>
              <p className="mt-1 text-xs opacity-90">{card.label}</p>
            </div>
          );
        })}
      </div>

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
            className="dark:border-dark-500 dark:bg-dark-800 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-3 pl-9 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:ring-1 dark:text-gray-200"
          />
        </div>
      </div>

      <div className="dark:border-dark-700 mb-4 flex items-center gap-1 overflow-x-auto border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab.label} ({counts[tab.key] ?? 0})
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table
            hoverable
            className="w-full min-w-225 text-left [&_.table-th]:font-semibold"
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
                  <Td className="dark:text-dark-200 py-4 text-gray-600">
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

                  {/* READ-ONLY STATUS BADGE — no more inline select */}
                  <Td className="py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                        STATUS_BADGE[order.orderStatus] ||
                        "dark:bg-dark-600 bg-gray-100 text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {STATUS_TABS.find((s) => s.key === order.orderStatus)
                        ?.label || order.orderStatus}
                    </span>
                  </Td>

                  {/* EDIT ICON — opens drawer */}
               {/* EDIT / VIEW ICON — status ke hisaab se */}
<Td className="py-4 text-center">
  {order.orderStatus === "CANCELLED" ? (
    <button
      type="button"
      onClick={() => handleViewCancelDetails(order)}
      className="dark:hover:bg-dark-600 dark:text-dark-200 inline-flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
      title="View cancellation details"
    >
      <Eye className="h-4 w-4" />
    </button>
  ) : (
    <button
      type="button"
      onClick={() => handleEditOrder(order)}
      className="dark:hover:bg-dark-600 dark:text-dark-200 inline-flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
      title="Edit order"
    >
      <Pencil className="h-4 w-4" />
    </button>
  )}
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

        {/* PAGINATION (same as before) */}
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

      {/* =====================================
          RIGHT-SIDE DRAWER — Order Details
      ====================================== */}
      <Transition show={drawerOpen} as={Fragment}>
        <Dialog onClose={closeDrawer} className="relative z-300">
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
          </Transition.Child>

          {/* Drawer panel */}
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-200"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-3xl">
                    <div className="dark:bg-dark-800 flex h-full flex-col bg-white shadow-xl">
                      {/* Header */}
                      <div className="dark:border-dark-700 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                        <div>
                          <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">
                            Order Details
                          </Dialog.Title>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {selectedOrder?.orderNumber}
                          </p>
                        </div>
                        <button
                          onClick={closeDrawer}
                          className="dark:hover:bg-dark-700 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Body — scrollable */}
                      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                        {selectedOrder && (
                          <>
                            {/* Order Info */}
                            <div className="space-y-3">
                              <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                Order Information
                              </h3>
                              <div className="dark:bg-dark-700/40 space-y-3 rounded-xl bg-gray-50 p-4">
                                <div className="flex items-center gap-3">
                                  <Hash className="h-4 w-4 shrink-0 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Order ID
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                      {selectedOrder.orderNumber}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Order Date
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                      {formatDateTime(selectedOrder.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <CreditCard className="h-4 w-4 shrink-0 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Payment
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                      {selectedOrder.paymentMethod || "-"} •{" "}
                                      {selectedOrder.paymentStatus || "-"}
                                    </p>
                                  </div>
                                </div>
                                {selectedOrder.couponCode && (
                                  <div className="flex items-center gap-3">
                                    <Tag className="h-4 w-4 shrink-0 text-gray-400" />
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Coupon Applied
                                      </p>
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                        {selectedOrder.couponCode}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Customer Info — full details */}
                            <div className="space-y-3">
                              <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                Customer
                              </h3>
                              <div className="dark:bg-dark-700/40 space-y-3 rounded-xl bg-gray-50 p-4">
                                <div className="flex items-center gap-3">
                                  <User className="h-4 w-4 shrink-0 text-gray-400" />
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                    {selectedOrder.fullName || "-"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {selectedOrder.phone || "-"}
                                  </p>
                                </div>
                                {selectedOrder.email && (
                                  <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {selectedOrder.email}
                                    </p>
                                  </div>
                                )}
                                <div className="flex items-start gap-3">
                                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                  <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {[
                                        selectedOrder.address,
                                        selectedOrder.landmark,
                                        selectedOrder.city,
                                        selectedOrder.state,
                                        selectedOrder.pincode,
                                      ]
                                        .filter(Boolean)
                                        .join(", ") || "-"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Items — with image + per-item line total */}
                            {Array.isArray(selectedOrder.items) &&
                              selectedOrder.items.length > 0 && (
                                <div className="space-y-3">
                                  <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Items ({selectedOrder.items.length})
                                  </h3>
                                  <div className="dark:bg-dark-700/40 dark:divide-dark-600 divide-y divide-gray-200 overflow-hidden rounded-xl bg-gray-50">
                                    {selectedOrder.items.map(
                                      (item: any, idx: number) => {
                                        const imageSrc =
                                          item.image ||
                                          item.product?.mainImage ||
                                          item.product?.thumbnailImage;
                                        return (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-3 px-4 py-3"
                                          >
                                            <div className="dark:bg-dark-600 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-200">
                                              {imageSrc ? (
                                                <img
                                                  src={apiHelper.getImageUrl(
                                                    imageSrc,
                                                  )}
                                                  alt={item.productName}
                                                  className="h-full w-full object-cover"
                                                />
                                              ) : (
                                                <Package className="h-5 w-5 text-gray-400" />
                                              )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-200">
                                                {item.productName}
                                              </p>
                                              {item.partNumber && (
                                                <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                                                  Part #: {item.partNumber}
                                                </p>
                                              )}
                                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Qty: {item.quantity} ×{" "}
                                                {formatAmount(item.price)}
                                              </p>
                                            </div>
                                            <p className="shrink-0 text-sm font-semibold text-gray-900 dark:text-gray-200">
                                              {formatAmount(
                                                Number(item.price) *
                                                  item.quantity,
                                              )}
                                            </p>
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Price / Tax Breakup */}
                            <div className="space-y-3">
                              <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                <Receipt className="h-3.5 w-3.5" />
                                Price Breakup
                              </h3>
                              <div className="dark:bg-dark-700/40 space-y-2 rounded-xl bg-gray-50 p-4">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Subtotal
                                  </span>
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {formatAmount(selectedOrder.subtotal)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    CGST
                                  </span>
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {formatAmount(selectedOrder.cgst)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    SGST
                                  </span>
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {formatAmount(selectedOrder.sgst)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Shipping Charge
                                  </span>
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {Number(selectedOrder.shippingCharge) > 0
                                      ? formatAmount(
                                          selectedOrder.shippingCharge,
                                        )
                                      : "Free"}
                                  </span>
                                </div>
                                {Number(selectedOrder.discountAmount) > 0 && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Discount{" "}
                                      {selectedOrder.couponCode
                                        ? `(${selectedOrder.couponCode})`
                                        : ""}
                                    </span>
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                      - {formatAmount(
                                        selectedOrder.discountAmount,
                                      )}
                                    </span>
                                  </div>
                                )}
                                <div className="dark:border-dark-600 mt-2 flex items-center justify-between border-t border-gray-200 pt-3">
                                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Total Amount
                                  </span>
                                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatAmount(selectedOrder.totalAmount)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status — the only editable field */}
                            <div className="space-y-2">
                              <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                Update Status
                              </h3>
                              <Listbox
                                data={statusOptions}
                                value={
                                  statusOptions.find(
                                    (o) => o.id === drawerStatus,
                                  ) || statusOptions[0]
                                }
                                displayField="name"
                                placeholder="Select status"
                                onChange={(opt: any) => setDrawerStatus(opt.id)}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="dark:border-dark-700 flex gap-3 border-t border-gray-200 px-5 py-4">
                        <button
                          onClick={closeDrawer}
                          className="dark:border-dark-600 dark:hover:bg-dark-700 flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            selectedOrder &&
                            handleStatusChange(
                              selectedOrder.orderNumber,
                              drawerStatus,
                            )
                          }
                          disabled={
                            !selectedOrder ||
                            drawerStatus === selectedOrder.orderStatus ||
                            updatingId === selectedOrder?.orderNumber
                          }
                          className="bg-primary-500 hover:bg-primary-600 flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingId === selectedOrder?.orderNumber
                            ? "Saving..."
                            : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* =====================================
    CANCEL DETAILS MODAL (per-item)
====================================== */}
<Transition show={cancelModalOpen} as={Fragment}>
  <Dialog onClose={closeCancelModal} className="relative z-300">
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-200"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
    </Transition.Child>

    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Dialog.Panel className="dark:bg-dark-800 w-full max-w-lg rounded-2xl bg-white shadow-xl">
          <div className="dark:border-dark-700 flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">
                Cancellation Details
              </Dialog.Title>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {cancelOrderData?.orderNumber}
              </p>
            </div>
            <button
              onClick={closeCancelModal}
              className="dark:hover:bg-dark-700 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-5">
            {Array.isArray(cancelOrderData?.items) &&
            cancelOrderData.items.some(
              (i: any) => i.itemStatus === "CANCELLED",
            ) ? (
              cancelOrderData.items
                .filter((i: any) => i.itemStatus === "CANCELLED")
                .map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="dark:bg-dark-700/40 dark:border-dark-600 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                      {item.productName}
                    </p>

                    <div className="flex items-start gap-2">
                      <span className="w-24 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                        Reason
                      </span>
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {item.cancelReason || "-"}
                      </span>
                    </div>

                    {item.cancelDescription && (
                      <div className="flex items-start gap-2">
                        <span className="w-24 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                          Description
                        </span>
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          {item.cancelDescription}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <span className="w-24 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                        Requested On
                      </span>
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {formatDateTime(item.cancelRequestedAt)}
                      </span>
                    </div>

                    {Array.isArray(item.cancelImages) &&
                      item.cancelImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => openImageDrawer(item.cancelImages)}
                          className="text-primary-600 dark:text-primary-400 mt-1 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          View {item.cancelImages.length} Photo
                          {item.cancelImages.length > 1 ? "s" : ""}
                        </button>
                      )}
                  </div>
                ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">
                No cancellation details available
              </p>
            )}
          </div>

          <div className="dark:border-dark-700 border-t border-gray-200 px-5 py-4">
            <button
              onClick={closeCancelModal}
              className="dark:border-dark-600 dark:hover:bg-dark-700 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </Transition.Child>
    </div>
  </Dialog>
</Transition>

{/* =====================================
    IMAGE DRAWER — right side, cancel photos
====================================== */}
<Transition show={imageDrawerOpen} as={Fragment}>
  <Dialog onClose={closeImageDrawer} className="relative z-400">
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-200"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
    </Transition.Child>

    <div className="fixed inset-0 overflow-hidden">
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <Transition.Child
          as={Fragment}
          enter="transform transition ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
            <div className="dark:bg-dark-800 flex h-full flex-col bg-white shadow-xl">
              <div className="dark:border-dark-700 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">
                  Cancellation Photos
                </Dialog.Title>
                <button
                  onClick={closeImageDrawer}
                  className="dark:hover:bg-dark-700 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {imageDrawerImages.length > 0 ? (
                  imageDrawerImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={apiHelper.getImageUrl(img)}
                      alt={`Cancel photo ${idx + 1}`}
                      className="dark:border-dark-600 w-full rounded-xl border border-gray-200 object-cover"
                    />
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-gray-400">
                    No photos uploaded
                  </p>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </div>
  </Dialog>
</Transition>
    </div>
  );
};

export default Order;