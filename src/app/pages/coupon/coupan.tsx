import { useState, useEffect, useMemo, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  CheckCircle2,
  XCircle,
  Repeat,
  Search,
  Pencil,
  Eye,
  DollarSign,
  Trash2,
  RefreshCcw,
  Plus,
  X,
  Tag,
  Percent,
  Wallet,
  Users,
  Calendar,
  Package,
} from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItems, MenuItem, Transition, Dialog } from "@headlessui/react";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
// import { Listbox } from "@/components/shared/form/StyledListbox";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { toast } from "sonner";
import apiHelper from "../../../utils/apiHelper";
import { Combobox } from "@/components/shared/form/Combobox";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
// ================================
// TYPES
// ================================

interface CouponType {
  id: string | number;
  title: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  perUserLimit?: number;
  applyOn: string; // e.g. "ALL_PRODUCTS" | "SPECIFIC_PRODUCTS" | "CATEGORY"
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE";
}

// ================================
// STATUS BADGE
// ================================

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-green-500/15 text-green-400",
  INACTIVE: "bg-red-500/15 text-red-400",
};

const TYPE_BADGE: Record<string, string> = {
  PERCENTAGE: "bg-blue-500/15 text-blue-400",
  FIXED: "bg-purple-500/15 text-purple-400",
};

const APPLY_ON_OPTIONS = [
  { id: "all", name: "All Types" },
  { id: "ALL_PRODUCTS", name: "All Products" },
  { id: "SPECIFIC_PRODUCTS", name: "Specific Products" },
  { id: "CATEGORY", name: "Category" },
];

const STATUS_FILTER_OPTIONS = [
  { id: "all", name: "All Status" },
  { id: "ACTIVE", name: "Active" },
  { id: "INACTIVE", name: "Inactive" },
];

const TYPE_FILTER_OPTIONS = [
  { id: "all", name: "All Types" },
  { id: "PERCENTAGE", name: "Percentage" },
  { id: "FIXED", name: "Fixed" },
];

// ================================
// SUMMARY CARDS
// ================================

const SUMMARY_CARDS = [
  {
    key: "total",
    label: "Total Coupons",
    icon: Ticket,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    key: "active",
    label: "Active",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-green-600",
  },
  {
    key: "inactive",
    label: "Inactive",
    icon: XCircle,
    gradient: "from-red-500 to-rose-600",
  },
  {
    key: "totalUses",
    label: "Total Uses",
    icon: Repeat,
    gradient: "from-purple-500 to-fuchsia-600",
  },
];

// ================================
// COMPONENT
// ================================

const Coupon = () => {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState<CouponType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [togglingId, setTogglingId] = useState<string | number | null>(null);

  // ---------- Filters ----------
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [applyOnFilter, setApplyOnFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ---------- View drawer ----------
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponType | null>(null);


// ---------- Delete confirm ----------
const [deleteTarget, setDeleteTarget] = useState<CouponType | null>(null);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [confirmState, setConfirmState] = useState<"pending" | "success" | "error">("pending");
const [confirmLoading, setConfirmLoading] = useState(false);
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
  // FETCH COUPONS
  // ================================

  const fetchCoupons = async () => {
    try {
      setLoading(true);
           const data = await apiHelper.get("/vendor-panel/coupons");
      if (data.success) {
        setCoupons(data.data || []);
      } else {
        toast.error(data.message || "Failed to load coupons");
      }
    } catch (err: any) {
      console.error("fetchCoupons error:", err);
      toast.error(err.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ================================
  // SUMMARY COUNTS
  // ================================

  const counts = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.status === "ACTIVE").length;
    const inactive = coupons.filter((c) => c.status === "INACTIVE").length;
    const totalUses = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    return { total, active, inactive, totalUses };
  }, [coupons]);

  // ================================
  // FILTERED LIST
  // ================================

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (applyOnFilter !== "all" && c.applyOn !== applyOnFilter) return false;

      if (dateFrom && new Date(c.endDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(c.startDate) > new Date(dateTo)) return false;

      if (search) {
        const searchText = search.toLowerCase();
        const title = c.title?.toLowerCase() || "";
        const code = c.code?.toLowerCase() || "";
        if (!title.includes(searchText) && !code.includes(searchText)) return false;
      }
      return true;
    });
  }, [coupons, statusFilter, typeFilter, applyOnFilter, dateFrom, dateTo, search]);

  const totalItems = filteredCoupons.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCoupons.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, applyOnFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredCoupons, currentPage, totalPages]);

  // ================================
  // RESET FILTERS
  // ================================

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setApplyOnFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  // ================================
  // TOGGLE STATUS
  // ================================

  const handleToggleStatus = async (coupon: CouponType) => {
    try {
      setTogglingId(coupon.id);
      const newStatus = coupon.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const data = await apiHelper.patch(
        `/vendor-panel/coupons/${coupon.id}/status`,
        { status: newStatus },
      );
      if (data.success) {
        toast.success(`Coupon marked as ${newStatus.toLowerCase()}`);
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, status: newStatus } : c)),
        );
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err: any) {
      console.error("handleToggleStatus error:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  // ================================
  // DELETE COUPON
  // ================================
const handleDeleteClick = (coupon: CouponType) => {
  setDeleteTarget(coupon);
  setConfirmState("pending");
  setShowConfirmModal(true);
};
const performDelete = async () => {
  if (!deleteTarget) return;
  setConfirmLoading(true);
  try {
    const data = await apiHelper.delete(`/vendor-panel/coupons/${deleteTarget.id}`);
    if (data.success) {
      toast.success("Coupon deleted");
      setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setConfirmState("success");
      setTimeout(() => setShowConfirmModal(false), 1500);
    } else {
      setConfirmState("error");
      toast.error(data.message || "Failed to delete coupon");
    }
  } catch (err: any) {
    console.error("handleDeleteCoupon error:", err);
    setConfirmState("error");
    toast.error(err.response?.data?.message || "Failed to delete coupon");
  } finally {
    setConfirmLoading(false);
  }
};

  // ================================
  // HELPERS
  // ================================

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isValidNow = (coupon: CouponType) => {
    const now = new Date();
    return new Date(coupon.startDate) <= now && now <= new Date(coupon.endDate);
  };

  const formatApplyOn = (value: string) => {
    return APPLY_ON_OPTIONS.find((o) => o.id === value)?.name || value || "-";
  };

  const handleViewCoupon = (coupon: CouponType) => {
    setSelectedCoupon(coupon);
    setViewOpen(true);
  };

  const closeViewDrawer = () => {
    setViewOpen(false);
    setSelectedCoupon(null);
  };

  const handleEditCoupon = (coupon: CouponType) => {
    navigate(`/coupan/edit/${coupon.id}`);
  };

  // ================================
  // UI
  // ================================

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Coupons
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage your discount coupons and promotions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
         
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon;
          const value =
            card.key === "total"
              ? counts.total
              : card.key === "active"
                ? counts.active
                : card.key === "inactive"
                  ? counts.inactive
                  : counts.totalUses;
          return (
            <div
              key={card.key}
              className={`rounded-2xl bg-linear-to-br p-5 text-white ${card.gradient} shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl`}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="mt-1 text-xs opacity-90">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* FILTERS */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Filter Coupons
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Search
            </label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="dark:border-dark-500 dark:bg-dark-700 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-3 pl-9 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:ring-1 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Status
            </label>
            <Combobox
              data={STATUS_FILTER_OPTIONS}
              value={STATUS_FILTER_OPTIONS.find((o) => o.id === statusFilter)}
              displayField="name"
              placeholder="All Status"
              onChange={(opt: any) => setStatusFilter(opt.id)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Type
            </label>
            <Combobox
              data={TYPE_FILTER_OPTIONS}
              value={TYPE_FILTER_OPTIONS.find((o) => o.id === typeFilter)}
              displayField="name"
              placeholder="All Types"
              onChange={(opt: any) => setTypeFilter(opt.id)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Apply On
            </label>
            <Combobox
              data={APPLY_ON_OPTIONS}
              value={APPLY_ON_OPTIONS.find((o) => o.id === applyOnFilter)}
              displayField="name"
              placeholder="All Types"
              onChange={(opt: any) => setApplyOnFilter(opt.id)}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Date Range
            </label>
            <div className="flex items-center gap-2">
              <DatePicker
                value={dateFrom}
                options={{ disableMobile: true }}
                onChange={(date: any) => setDateFrom(date)}
                placeholder="From date"
              />
              <span className="text-xs text-gray-400">to</span>
              <DatePicker
                value={dateTo}
                options={{ disableMobile: true }}
                onChange={(date: any) => setDateTo(date)}
                placeholder="To date"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleResetFilters}
            className="dark:bg-dark-700 dark:hover:bg-dark-600 dark:text-dark-200 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="dark:border-dark-700 flex items-center justify-between border-b border-gray-200 px-4 py-3.5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Coupon List ({totalItems})
          </h2>
           <button
            onClick={() => navigate("/coupan/add")}
            className="bg-primary-500 hover:bg-primary-600 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Coupon
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table hoverable className="w-full min-w-250 text-left [&_.table-th]:font-semibold">
            <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
              <Tr>
                <Th className="w-24 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Coupon Details
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Code
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Type
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Discount
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Usage
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Apply On
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Validity
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Status
                </Th>
              </Tr>
            </THead>

            <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
              {currentItems.map((coupon) => {
                const remaining =
                  coupon.usageLimit != null
                    ? Math.max(coupon.usageLimit - (coupon.usedCount || 0), 0)
                    : null;
                return (
                  <Tr
                    key={coupon.id}
                    className="dark:hover:bg-dark-700/40 transition-colors hover:bg-gray-50/30"
                  >
                    {/* ACTIONS */}
                    <Td className="py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditCoupon(coupon)}
                          className="dark:hover:bg-dark-600 inline-flex size-8 items-center justify-center rounded-lg text-blue-500 transition-colors hover:bg-blue-50 cursor-pointer"
                          title="Edit coupon"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleViewCoupon(coupon)}
                          className="dark:hover:bg-dark-600 inline-flex size-8 items-center justify-center rounded-lg text-green-500 transition-colors hover:bg-green-50 cursor-pointer"
                          title="View coupon"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(coupon)}
                          disabled={togglingId === coupon.id}
                          className="dark:hover:bg-dark-600 inline-flex size-8 items-center justify-center rounded-lg text-purple-500 transition-colors hover:bg-purple-50 disabled:opacity-50 cursor-pointer"
                          title={coupon.status === "ACTIVE" ? "Deactivate coupon" : "Activate coupon"}
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(coupon)}
                          className="dark:hover:bg-dark-600 inline-flex size-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 cursor-pointer"
                          title="Delete coupon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Td>

                    {/* COUPON DETAILS */}
                    <Td className="py-4">
                      <p className="font-medium text-gray-900 dark:text-gray-200">{coupon.title}</p>
                      <button
                        onClick={() => handleViewCoupon(coupon)}
                        className="text-primary-500 hover:underline text-xs"
                      >
                        {coupon.code}
                      </button>
                    </Td>

                    {/* CODE */}
                    <Td className="py-4">
                      <span className="dark:bg-dark-700 dark:text-dark-200 inline-block rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                        {coupon.code}
                      </span>
                    </Td>

                    {/* TYPE */}
                    <Td className="py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          TYPE_BADGE[coupon.type] ||
                          "dark:bg-dark-600 bg-gray-100 text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {coupon.type === "PERCENTAGE" ? "Percentage" : "Fixed"}
                      </span>
                    </Td>

                    {/* DISCOUNT */}
                    <Td className="py-4">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {coupon.type === "PERCENTAGE"
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} OFF`}
                      </p>
                      {coupon.maxDiscount != null && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Max: ₹{Number(coupon.maxDiscount).toLocaleString("en-IN")}
                        </p>
                      )}
                    </Td>

                    {/* USAGE */}
                    <Td className="py-4">
                      <p className="text-gray-800 dark:text-gray-200">
                        Used: {coupon.usedCount || 0}/{coupon.usageLimit ?? "∞"}
                      </p>
                      {coupon.perUserLimit != null && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Per user: {coupon.perUserLimit}
                        </p>
                      )}
                      {remaining != null && (
                        <p className="text-primary-500 text-xs">{remaining} left</p>
                      )}
                    </Td>

                    {/* APPLY ON */}
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {formatApplyOn(coupon.applyOn)}
                    </Td>

                    {/* VALIDITY */}
                    <Td className="py-4 text-gray-600 dark:text-gray-400">
                      <p>{formatDate(coupon.startDate)}</p>
                      <p className="text-xs">to</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {formatDate(coupon.endDate)}
                      </p>
                    </Td>

                    {/* STATUS */}
                    <Td className="py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                          STATUS_BADGE[coupon.status] ||
                          "dark:bg-dark-600 bg-gray-100 text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {coupon.status === "ACTIVE" ? "active" : "inactive"}
                      </span>
                      {isValidNow(coupon) && coupon.status === "ACTIVE" && (
                        <p className="mt-1 text-xs text-blue-500">Valid Now</p>
                      )}
                    </Td>
                  </Tr>
                );
              })}

              {currentItems.length === 0 && !loading && (
                <Tr>
                  <Td colSpan={9} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    No coupons found
                  </Td>
                </Tr>
              )}

              {loading && (
                <Tr>
                  <Td colSpan={9} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                      Loading coupons...
                    </div>
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>

        {/* PAGINATION */}
        {totalItems > 0 && (
          <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 rounded-b-xl border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
            <div className="order-1 flex items-center justify-center gap-2 text-sm text-gray-600 md:w-1/3 md:justify-start dark:text-gray-400">
              <span>Show</span>
              <div className="w-20">
                <Menu as="div" className="relative inline-block w-full text-left">
                  <MenuButton className="dark:border-dark-600 dark:bg-dark-700 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none dark:text-gray-200">
                    <span>{itemsPerPage}</span>
                    <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
          VIEW DRAWER — Coupon Details
      ====================================== */}
      <Transition show={viewOpen} as={Fragment}>
        <Dialog onClose={closeViewDrawer} className="relative z-300">
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
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
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
                      {/* Header */}
                      <div className="dark:border-dark-700 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                        <div>
                          <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">
                            Coupon Details
                          </Dialog.Title>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {selectedCoupon?.code}
                          </p>
                        </div>
                        <button
                          onClick={closeViewDrawer}
                          className="dark:hover:bg-dark-700 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Body */}
                      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                        {selectedCoupon && (
                          <>
                            <div className="dark:bg-dark-700/40 space-y-3 rounded-xl bg-gray-50 p-4">
                              <div className="flex items-center gap-3">
                                <Ticket className="h-4 w-4 shrink-0 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Title</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                    {selectedCoupon.title}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Tag className="h-4 w-4 shrink-0 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Code</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                    {selectedCoupon.code}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Percent className="h-4 w-4 shrink-0 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Discount</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                    {selectedCoupon.type === "PERCENTAGE"
                                      ? `${selectedCoupon.discountValue}% OFF`
                                      : `₹${selectedCoupon.discountValue} OFF`}
                                    {selectedCoupon.maxDiscount != null &&
                                      ` (Max ₹${selectedCoupon.maxDiscount})`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 shrink-0 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Usage</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                    {selectedCoupon.usedCount || 0}/{selectedCoupon.usageLimit ?? "∞"}
                                    {selectedCoupon.perUserLimit != null &&
                                      ` • ${selectedCoupon.perUserLimit} per user`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Package className="h-4 w-4 shrink-0 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Apply On</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                    {formatApplyOn(selectedCoupon.applyOn)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Validity</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                    {formatDate(selectedCoupon.startDate)} to{" "}
                                    {formatDate(selectedCoupon.endDate)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Wallet className="h-4 w-4 shrink-0 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                  <span
                                    className={`mt-0.5 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      STATUS_BADGE[selectedCoupon.status]
                                    }`}
                                  >
                                    {selectedCoupon.status === "ACTIVE" ? "active" : "inactive"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="dark:border-dark-700 flex gap-3 border-t border-gray-200 px-5 py-4">
                        <button
                          onClick={closeViewDrawer}
                          className="dark:border-dark-600 dark:hover:bg-dark-700 flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => selectedCoupon && handleEditCoupon(selectedCoupon)}
                          className="bg-primary-500 hover:bg-primary-600 flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors"
                        >
                          Edit Coupon
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
          DELETE CONFIRM MODAL
      ====================================== */}
     <ConfirmModal
  show={showConfirmModal}
  onClose={() => {
    setShowConfirmModal(false);
    setDeleteTarget(null);
    setConfirmState("pending");
  }}
  onOk={performDelete}
  confirmLoading={confirmLoading}
  state={confirmState}
  messages={{
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "Are you sure?",
      description: `Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`,
      actionText: "Delete",
    },
    success: {
      title: "Deleted Successfully",
      description: "The coupon has been deleted.",
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

export default Coupon;