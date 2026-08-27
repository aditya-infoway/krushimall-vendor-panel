import { Fragment, useState, useEffect } from "react";
import {
  // Dialog,
  // DialogPanel,
  Transition,
  // TransitionChild,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import {
  // XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  // FunnelIcon,
  // EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  // DocumentArrowDownIcon,
  // PrinterIcon,
  // EyeIcon,
  // ClockIcon,
  // CheckCircleIcon,
  // ChatBubbleLeftIcon,
  // TruckIcon,
  DocumentTextIcon,
  // XCircleIcon,
  // CreditCardIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { LeadDetailsModal } from "./model";
import apiHelper, { getBaseUrl } from "@/utils/apiHelper";
import { useNavigate } from "react-router";
import { TestDriveModal } from "./testdrive";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { PaymentDrawer } from "./payment";

type Lead = {
  id: number;
  customerName: string;
  phone: string;
  dob: string;
  location: string;
  gstStatus: string;
  createdBy: string;
  model: string;
  variant: string;
  color: string;
  executive: string;
  purchaseDate: string;
  deliveryTime: string;
  payment: "Pending" | "Paid";
  followUp: "Scheduled" | "Done";
  finance: "Approved" | "Pending";
  feedback: "Good" | "Average" | "Excellent";
};

// ─── Mock Data ──────────────────────────────────────────────

// ─── Status Badge Component ─────────────────────────────────
const StatusBadge = ({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass: string;
}) => (
  <div className="mb-1 flex items-center justify-between text-[10px]">
    <span className="font-medium text-gray-600 dark:text-gray-400">
      {label}:
    </span>
    <span
      className={`rounded-full px-2 py-0.5 font-semibold text-white ${colorClass}`}
    >
      {value}
    </span>
  </div>
);

export default function LeadBuilder() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Changed from 5 to 10 to match Brand page
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadData, setLeadData] = useState<any[]>([]);
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | undefined>(
    undefined,
  );
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [selectedPaymentLeadId, setSelectedPaymentLeadId] = useState<
    number | undefined
  >(undefined);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmState, setConfirmState] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Filter leads based on search
  const navigate = useNavigate();
  const filteredData = leadData.filter((lead: any) => {
    const searchLower = search.trim().toLowerCase();

    return (
      // Customer Name
      String(lead.customer?.accountName ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      // Mobile
      String(lead.customer?.mobile ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      // City
      String(lead.customer?.city ?? lead.city ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      // Model
      String(lead.model?.modelName ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      // Variant
      String(
        lead.variant?.variantName ?? lead.showroomVariant?.variantName ?? "",
      )
        .toLowerCase()
        .includes(searchLower) ||
      // Colour
      String(lead.colour?.colourName ?? lead.color?.colourName ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      // Executive
      String(lead.executive?.employeeName ?? lead.executiveName ?? "")
        .toLowerCase()
        .includes(searchLower)
    );
  });

  // Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const fetchLeads = async () => {
    try {
      const res = await apiHelper.get("/leads");

      const data = Array.isArray(res.data) ? res.data : [];

      setLeadData(data);
    } catch (error) {
      console.error("Lead Error:", error);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setConfirmState("pending");
    setShowConfirmModal(true);
  };

  const performDelete = async () => {
    setConfirmLoading(true);
    try {
      if (deleteTargetId === null) return;
      await apiHelper.delete(`/leads/${deleteTargetId}`);
      toast.success("Lead deleted successfully!");
      await fetchLeads();
      setDeleteTargetId(null);
      setConfirmState("success");
      setTimeout(() => setShowConfirmModal(false), 1500);
    } catch (error: any) {
      console.error("Delete failed:", error);
      setConfirmState("error");
      toast.error(
        error.response?.data?.message ||
          "Failed to delete lead. Please try again.",
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    console.log(`Editing lead ${id}...`);
  };

  // const handleView = (id: number) => {
  //   console.log(`Viewing lead ${id}...`);
  // };

  const handleFollowUp = (id: number) => {
    navigate(`/leadmaster/Followup/${id}`);
  };
  const handlePayment = (id: number) => {
    setSelectedPaymentLeadId(id);
    setShowPaymentDrawer(true);
  };

  // const handleSendQuotation = (id: number) => {
  //   console.log(`Send quotation for lead ${id}...`);
  // };

  const handleTestDrive = (id: number) => {
    setSelectedLeadId(id);
    setShowTestDriveModal(true);
  };

  const handleCreateOrder = (id: number) => {
    navigate(`/leadmaster/order/${id}`);
  };

  const handleCreateBooking = (id: number) => {
    console.log(`Create booking for lead ${id}...`);
  };

  const handleCancel = (id: number) => {
    console.log(`Cancel for lead ${id}...`);
  };

  const handleOrderBill = (id: number) => {
    window.open(`${getBaseUrl()}/api/leads/${id}/Quotation`, "_blank");
  };
  const handleDeliveryChallan = (leadId: number) => {
    window.open(
      `${getBaseUrl()}/api/orders/lead/${leadId}/delivery-challan`,
      "_blank",
    );
  };
  const handleEditQuotation = (id: number) => {
    navigate(`/leadmaster/quotation/edit/${id}`);
  };
  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Lead Builder Report
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage and track all customer leads
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button color="primary" onClick={() => setShowLeadModal(true)}>
            <PlusIcon className="mr-1 size-4.5" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>

      {/* Table Card */}
      <div className="dark:border-dark-700 dark:bg-dark-800 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-300">
            <THead className="dark:border-dark-600 dark:bg-dark-700/60 border-b border-gray-200 bg-gray-100">
              <Tr>
                <Th className="w-12"># ID</Th>
                <Th className="w-45 min-w-45">quotation No</Th>
                <Th className="w-45 min-w-45">Customer Detail</Th>
                <Th className="w-45 min-w-45">Vehicle Detail</Th>
                <Th className="w-45 min-w-45">Purchase Detail</Th>
                <Th className="w-40 min-w-40 text-center">Update</Th>
                <Th className="w-45 min-w-45 text-center">Process / Billing</Th>
                <Th className="w-45 min-w-45 text-center">Print</Th>
                <Th className="w-40 min-w-40">Status</Th>
                {/* <Th className="w-20 text-center">Action</Th> */}
              </Tr>
            </THead>
            <TBody>
              {currentItems.map((lead, index) => (
                <Tr key={lead.id} className="dark:border-dark-700 border-b">
                  <Td className="font-bold">
                    {" "}
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </Td>
                  <Td className="font-bold">{lead.quotationNo}</Td>
                  <Td className="text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {lead.customer?.accountName}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <PhoneIcon className="size-3.5" />
                        <span>{lead.customer?.mobile}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="size-3.5" />
                        <span>
                          {" "}
                          {lead.customer?.birthday
                            ? new Date(
                                lead.customer.birthday,
                              ).toLocaleDateString("en-GB")
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="size-3.5" />
                        <span>{lead.customer?.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DocumentTextIcon className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {lead.customer?.gstNo}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <UserIcon className="size-3.5" />
                        <span>Created by: {lead.createdBy}</span>
                      </div>
                    </div>
                  </Td>

                  <Td className="w-45 text-xs">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        Model: {lead.model?.modelName}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Variant: {lead.showroomVariant?.variantName}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Colour: {lead.colour?.colourName}
                      </div>
                    </div>
                  </Td>

                  <Td className="w-45 text-xs">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        Executive: {lead.executive?.employeeName || "-"}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Purchase:{" "}
                        {lead.expectedPurchaseDate
                          ? new Date(
                              lead.expectedPurchaseDate,
                            ).toLocaleDateString("en-GB")
                          : "-"}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Delivery:{" "}
                        {lead.expectedDeliveryDate
                          ? new Date(
                              lead.expectedDeliveryDate,
                            ).toLocaleDateString("en-GB")
                          : "-"}
                      </div>
                    </div>
                  </Td>

                  {/* Update Column - Vertical buttons (one per row) */}
                  <Td>
                    <div className="flex w-full flex-col gap-1.5">
                      {/* Follow-up: Red border */}
                      <button
                        onClick={() => handleFollowUp(lead.id)}
                        className="w-full cursor-pointer rounded-full border border-red-500 py-0.5 text-[12px] text-red-600"
                      >
                        Follow-up
                      </button>
                      {/* Payment: Green border */}
                      <button
                        onClick={() => handlePayment(lead.id)}
                        className="w-full cursor-pointer rounded-full border border-green-500 py-0.5 text-[12px] text-green-600"
                      >
                        Payment
                      </button>
                      {/* Send Quotation: Yellow/Orange border */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOrderBill(lead.id)}
                          className="flex-1 cursor-pointer rounded-full border border-yellow-500 px-2 py-1 text-[12px] text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        >
                          Send Quotation
                        </button>
                        <button
                          onClick={() => handleEditQuotation(lead.id)}
                          disabled={!!lead.order}
                          className={`flex h-7 w-7 items-center justify-center rounded border ${
                            lead.order
                              ? "dark:border-dark-500 dark:bg-dark-600 dark:text-dark-300 cursor-not-allowed border-gray-300 bg-gray-300 text-gray-500"
                              : "cursor-pointer border-blue-500 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          }`}
                          title={
                            lead.order
                              ? "Quotation cannot be edited after Order is created"
                              : "Edit Quotation"
                          }
                        >
                          <PencilSquareIcon className="h-3 w-3" />
                        </button>
                      </div>
                      {/* Test Drive: Red border */}
                      <button
                        onClick={() => handleTestDrive(lead.id)}
                        className="w-full cursor-pointer rounded-full border border-red-500 py-0.5 text-[12px] text-red-600"
                      >
                        Test Drive
                      </button>
                    </div>
                  </Td>
                  {/* Process / Billing Column - Vertical buttons (one per row) */}
                  <Td>
                    <div className="flex w-full flex-col gap-1.5">
                      <button
                        onClick={() => handleCreateOrder(lead.id)}
                        className="w-full cursor-pointer rounded-md border border-emerald-500 py-0.5 text-[12px] text-emerald-600"
                      >
                        Create Order
                      </button>
                      <button
                        onClick={() => handleCreateBooking(lead.id)}
                        className="w-full cursor-pointer rounded-md border border-red-500 py-0.5 text-[12px] text-red-600"
                      >
                        Create Booking
                      </button>
                      <button
                        onClick={() => handleCancel(lead.id)}
                        className="w-full cursor-pointer rounded-md border border-blue-900 py-0.5 text-[12px] text-blue-900"
                      >
                        Cancel
                      </button>
                      {/* Solid Red Button */}
                      <button className="w-full cursor-pointer rounded-md border border-red-600 py-0.5 text-[12px] text-red-600">
                        Order Bill
                      </button>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex w-full flex-col gap-1.5">
                      <button
                        onClick={() => handleDeliveryChallan(lead.id)}
                        className="w-full cursor-pointer rounded-md border border-emerald-500 py-0.5 text-[12px] text-emerald-600"
                      >
                        Delivery Challan
                      </button>
                      <button
                        onClick={() => handleCreateBooking(lead.id)}
                        className="w-full cursor-pointer rounded-md border border-red-500 py-0.5 text-[12px] text-red-600"
                      >
                        Create Booking
                      </button>
                      <button
                        onClick={() => handleCancel(lead.id)}
                        className="w-full cursor-pointer rounded-md border border-blue-900 py-0.5 text-[12px] text-blue-900"
                      >
                        Cancel
                      </button>
                      {/* Solid Red Button */}
                      <button className="w-full cursor-pointer rounded-md border border-red-600 py-0.5 text-[12px] text-red-600">
                        Order Bill
                      </button>
                    </div>
                  </Td>
                  {/* Status Column - Vertical */}
                  <Td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-5 text-[12px]">
                        <span className="w-14 shrink-0 font-medium text-gray-600 dark:text-gray-400">
                          Lead Status:
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium text-white ${
                            lead.leadColor === "red"
                              ? "bg-red-500"
                              : lead.leadColor === "orange"
                                ? "bg-orange-500"
                                : "bg-sky-500"
                          }`}
                        >
                          {lead.leadStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[12px]">
                        <span className="w-14 shrink-0 font-medium text-gray-600 dark:text-gray-400">
                          Payment:
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-semibold text-white ${lead.payment === "Paid" ? "bg-green-500" : "bg-yellow-500"}`}
                        >
                          {lead.payment}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[12px]">
                        <span className="w-14 shrink-0 font-medium text-gray-600 dark:text-gray-400">
                          Follow-up:
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-semibold text-white ${lead.followUp === "Done" ? "bg-green-500" : "bg-red-500"}`}
                        >
                          {lead.followUp}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[12px]">
                        <span className="w-14 shrink-0 font-medium text-gray-600 dark:text-gray-400">
                          Finance:
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-semibold text-white ${lead.finance === "Approved" ? "bg-green-500" : "bg-yellow-500"}`}
                        >
                          {lead.finance}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[12px]">
                        <span className="w-14 shrink-0 font-medium text-gray-600 dark:text-gray-400">
                          Feedback:
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-semibold text-white ${
                            lead.feedback === "Excellent"
                              ? "bg-green-500"
                              : lead.feedback === "Good"
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                          }`}
                        >
                          {lead.feedback}
                        </span>
                      </div>
                    </div>
                  </Td>

                  {/* Action Column */}
                  {/* <Td>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(lead.id)}
                        className="flex size-7 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 hover:bg-blue-50"
                        title="Edit"
                      >
                        <PencilSquareIcon className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="flex size-7 items-center justify-center rounded-full border border-red-200 bg-white text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </Td> */}
                </Tr>
              ))}
              {currentItems.length === 0 && (
                <Tr>
                  <Td colSpan={8} className="py-12 text-center text-gray-400">
                    No leads found
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>

        {/* Footer Pagination */}
        {totalItems > 0 && (
          <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 rounded-b-xl border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
            {/* Column 1: Row Limits Selection Dropdown Menu */}
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
                      className="ml-2 h-4 w-4 transform transition-transform"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
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
                      {[10, 20, 30, 40, 50, 100].map((opt) => (
                        <MenuItem key={opt}>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() => {
                                setItemsPerPage(opt);
                                setCurrentPage(1);
                              }}
                              className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium ${
                                opt === itemsPerPage
                                  ? "bg-primary-500 text-white"
                                  : active
                                    ? "dark:bg-dark-600 bg-gray-100 text-gray-900 dark:text-white"
                                    : "text-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {opt}
                              {opt === itemsPerPage && (
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

            {/* Column 2: Page Navigation Bar controls */}
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

            {/* Column 3: Stats Summary Metadata Counter info */}
            <div className="order-3 flex items-center justify-center text-sm text-gray-500 select-none md:w-1/3 md:justify-end dark:text-gray-400">
              <span>
                {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} entries
              </span>
            </div>
          </div>
        )}
      </div>

      <LeadDetailsModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
      />
      <PaymentDrawer
        isOpen={showPaymentDrawer}
        onClose={() => {
          setShowPaymentDrawer(false);
          setSelectedPaymentLeadId(undefined);
        }}
        leadId={selectedPaymentLeadId}
        customerName={
          leadData.find((lead) => lead.id === selectedPaymentLeadId)?.customer
            ?.accountName
        }
      />
      {/* Add Test Drive Modal */}
      <TestDriveModal
        isOpen={showTestDriveModal}
        onClose={() => {
          setShowTestDriveModal(false);
          setSelectedLeadId(undefined);
        }}
        leadId={selectedLeadId}
        onSuccess={() => {
          // Optional: Refresh leads or show success message
          fetchLeads();
        }}
      />

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
            title: "Are you sure?",
            description:
              "Are you sure you want to delete this lead? Once deleted, it cannot be restored.",
            actionText: "Delete",
          },
          success: {
            title: "Deleted Successfully",
            description: "The lead has been deleted.",
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
}
