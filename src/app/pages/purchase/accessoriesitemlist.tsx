// src/app/pages/purchase/tractor/purchaseitemlist.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  // PlusIcon,
  EyeIcon,
  ArrowDownCircleIcon,
  XMarkIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Button, Checkbox, Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { DatePicker } from "@/components/shared/form/Datepicker";
import apiHelper from "@/utils/apiHelper";

// ---------- Types ----------
export interface PurchaseItemRow {
  id: string;
  itemName: string;
  hsnCode: string;
  model: string;
  variant: string;
  colour: string;
  itemCode : number;
  group : string;
  unit: string;
  chassisNo: string;
  engineNo: string;
  vehicleSrNo: string;
  quantity: number;
  perRate: number;
  gstPercent: number;
  amount: number;
  status: "Pending" | "Inward" | "Completed";
  mfgDate?: string;
  keyNo?: string;
  batteryMake?: string;
  batteryNo?: string;
  first1TyerNo?: string;
  first2TyerNo?: string;
  second1TyerNo?: string;
  second2TyerNo?: string;

  inwardBy?: string;
  inwardType?: string;
  inwardDate?: string;
  location?: string;
  grnNumber?: string;
  grnDate?: string;
  grnRecordDate?: string;
}

export interface InwardDrawerData {
  vehicleSrNo: string;
  chassisNo: string;
  engineNo: string;
  mfgDate: string;
  keyNo: string;
  batteryMake: string;
  batteryNo: string;
  first1TyerNo: string;
  first2TyerNo: string;
  second1TyerNo: string;
  second2TyerNo: string;
  location: string;
  grnNumber: string;
  grnDate: string;
  grnRecordDate: string;
}

interface PurchaseItemListProps {
  rows?: PurchaseItemRow[];
  onAddItem?: () => void;
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
  { id: "Inward", name: "Inward" },
  { id: "Completed", name: "Completed" },
];

const statusColors: Record<PurchaseItemRow["status"], string> = {
  Pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Inward: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const fmt = (n: number) =>
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const columns = [
  "#",
  "Item Name",
  "HSN Code",
  "Model",
  "Variant",
  "Colour",
  "Chassis No.",
  "Engine No.",
  "Vehicle Sr. No.",
  "Quantity",
  "Per Rate",
  "GST%",
  "Amount",
  "Status",
  "columns",
  "Action",
];

const AccessoriesItemList: React.FC<PurchaseItemListProps> = ({ onAddItem }) => {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<PurchaseItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isView, setIsView] = useState(false);
  // Drawer states
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PurchaseItemRow | null>(
    null,
  );
  const [errors, setErrors] = useState<any>({});
  // Inward form data
  const [inwardData, setInwardData] = useState<InwardDrawerData>({
    vehicleSrNo: "",
    chassisNo: "",
    engineNo: "",
    mfgDate: "",
    keyNo: "",
    batteryMake: "",
    batteryNo: "",
    first1TyerNo: "",
    first2TyerNo: "",
    second1TyerNo: "",
    second2TyerNo: "",
    location: "",
    grnNumber: "",
    grnDate: "",
    grnRecordDate: "",
  });

  const navigate = useNavigate();
  const [showTransportModal, setShowTransportModal] = useState(false);

  const [transportData, setTransportData] = useState({
    transporterName: "",
    mobileNumber: "",
    vehicleNumber: "",
  });

  const [transportErrors, setTransportErrors] = useState<any>({});
  const [transportSaved, setTransportSaved] = useState(false);
  // Fetch purchase items
  useEffect(() => {
    if (id) {
      fetchPurchaseItems();
    }
  }, [id]);

  const fetchPurchaseItems = async () => {
    try {
      setLoading(true);

     const res = await apiHelper.get(
  `/accessories-purchase/${id}`
);

const purchase = res.data;
      setTransportSaved(purchase.transportSaved);
 setRows(
  purchase.items.map((item: any) => ({
    id: String(item.id),

    itemName: item.itemName,
    itemCode: item.itemCode,
    shortName: item.shortName || "",
    hsnCode: item.hsnCode || "",
    unit: item.unit || "",
    taxSlab: item.taxSlab || "",
    group: item.groupName || "",
    model: item.modelName || "",
    variant: item.variantName || "",
    colour: "",

    chassisNo: "",
    engineNo: "",
    vehicleSrNo: "",

    quantity: Number(item.qty),
    perRate: Number(item.purchaseRate),
    gstPercent: Number(item.gstPercent),
    amount: Number(item.netAmount),
   inwardBy: item.inwardBy || "",
    inwardType: item.inwardType || "",
    inwardDate: item.inwardDate || "",
   status: item.status || "Pending",
  }))
);
    } catch (error) {
      console.error("Failed to fetch purchase items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter rows
  const filteredRows = useMemo(() => {
    let result = rows;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        [
          r.itemName,
          r.hsnCode,
          r.model,
          r.variant,
          r.colour,
          r.chassisNo,
          r.engineNo,
          r.vehicleSrNo,
          r.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = currentItems.map((item) => item.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = currentItems.map((item) => item.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

const handleSelectRow = async (item: PurchaseItemRow) => {
  try {
    await apiHelper.put(`/accessories-purchase/item-status/${item.id}`, {
      status: "Inward",
    });

    fetchPurchaseItems();
  } catch (err) {
    console.error(err);
  }
};

  const handleAddItem = () => {
    navigate(`/purchase/tractor/${id}/add-item`);
    if (onAddItem) onAddItem();
  };

  const handleInwardClick = async (item: PurchaseItemRow) => {
    const vehicleSrNo = item.vehicleSrNo || (await getVehicleSerialNo());

    setSelectedItem(item);

    setInwardData({
      vehicleSrNo,
      chassisNo: item.chassisNo || "",
      engineNo: item.engineNo || "",
      mfgDate: "",
      keyNo: "",
      batteryMake: "",
      batteryNo: "",
      first1TyerNo: "",
      first2TyerNo: "",
      second1TyerNo: "",
      second2TyerNo: "",
      location: "",
      grnNumber: "",
      grnDate: "",
      grnRecordDate: "",
    });

    setShowDrawer(true);
  };
  const validateInward = () => {
    const newErrors: any = {};

    if (!inwardData.mfgDate) newErrors.mfgDate = "MFG Date is required";

    if (!inwardData.keyNo.trim()) newErrors.keyNo = "Key No is required";

    if (!inwardData.batteryMake.trim())
      newErrors.batteryMake = "Battery Make is required";

    if (!inwardData.batteryNo.trim())
      newErrors.batteryNo = "Battery No is required";

    if (!inwardData.first1TyerNo.trim())
      newErrors.first1TyerNo = "First 1 Tyre No is required";

    if (!inwardData.first2TyerNo.trim())
      newErrors.first2TyerNo = "First 2 Tyre No is required";

    if (!inwardData.second1TyerNo.trim())
      newErrors.second1TyerNo = "Second 1 Tyre No is required";

    if (!inwardData.second2TyerNo.trim())
      newErrors.second2TyerNo = "Second 2 Tyre No is required";

    if (!inwardData.location.trim())
      newErrors.location = "Location is required";

    if (!inwardData.grnNumber.trim())
      newErrors.grnNumber = "GRN Number is required";

    if (!inwardData.grnDate) newErrors.grnDate = "GRN Date is required";

    if (!inwardData.grnRecordDate)
      newErrors.grnRecordDate = "GRN Record Date is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const validateTransport = () => {
    const errors: any = {};

    if (!transportData.transporterName.trim())
      errors.transporterName = "Transporter Name is required";

    if (!transportData.mobileNumber.trim())
      errors.mobileNumber = "Mobile Number is required";

    if (!transportData.vehicleNumber.trim())
      errors.vehicleNumber = "Vehicle Number is required";

    setTransportErrors(errors);

    return Object.keys(errors).length === 0;
  };
  const handleTransportSave = async () => {
    if (!validateTransport()) return;

    await apiHelper.put(`/purchases/${id}/transport`, transportData);
    setTransportSaved(true);
    setShowTransportModal(false);
  };
  const handleInwardSubmit = async () => {
    if (!validateInward()) return;
    try {
      await apiHelper.put(
        `/purchases/purchase-items/${selectedItem?.id}/inward`,
        inwardData,
      );

      await fetchPurchaseItems();
      setShowDrawer(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleInwardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setInwardData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const getVehicleSerialNo = async () => {
    const res = await apiHelper.get("/purchases/vehicle-serial-no");

    console.log(res);

    return res.vehicleSrNo;
  };
  const handleViewClick = (item: PurchaseItemRow) => {
    setSelectedItem(item);

    setInwardData({
      vehicleSrNo: item.vehicleSrNo,
      chassisNo: item.chassisNo,
      engineNo: item.engineNo,
      mfgDate: item.mfgDate || "",
      keyNo: item.keyNo || "",
      batteryMake: item.batteryMake || "",
      batteryNo: item.batteryNo || "",
      first1TyerNo: item.first1TyerNo || "",
      first2TyerNo: item.first2TyerNo || "",
      second1TyerNo: item.second1TyerNo || "",
      second2TyerNo: item.second2TyerNo || "",
      location: item.location || "",
      grnNumber: item.grnNumber || "",
      grnDate: item.grnDate || "",
      grnRecordDate: item.grnRecordDate || "",
    });

    setIsView(true);
    setShowDrawer(true);
  };
  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
          Accessories Item List
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all purchase items from here
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Excel Button */}
          <button
            type="button"
            className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="size-4.5 text-gray-400" />
            Excel
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-primary-500 hover:bg-primary-600 inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
        
        </div>
      </div>
      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by item, model, chassis no..."
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
            className="w-full min-w-350 text-left [&_.table-th]:font-semibold"
          >
            <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
              <Tr>
                <Th className="w-16 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                 Action
                </Th>
                
                <Th className="w-16 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  S.No
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Item Name
                </Th>
                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Item Code
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  HSN Code
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Model
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Variant
                </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
               Group
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Unit
                </Th>
                {/* <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Chassis No.
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Engine No.
                </Th> */}
                {/* <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Vehicle Sr. No.
                </Th> */}
                <Th className="py-3.5 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Quantity
                </Th>
                <Th className="py-3.5 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Per Rate
                </Th>
                <Th className="py-3.5 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  GST%
                </Th>
                <Th className="py-3.5 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  <div className="flex items-center justify-end gap-1">
                    Amount
                    <CurrencyRupeeIcon className="size-3.5" />
                  </div>
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
                  <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
               Inward Date
                </Th>
              
                <Th className="w-20 py-3.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  View
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
                        checked={item.status === "Inward"}
  disabled={item.status !== "Pending"}
  onChange={() => handleSelectRow(item)}
                      />
                    </Td>
                    <Td className="py-4 font-medium text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </Td>
                    <Td className="py-4 font-medium">{item.itemName}</Td>
                      <Td className="py-4">{item.itemCode}</Td>
                    <Td className="py-4">{item.hsnCode}</Td>
                    <Td className="py-4">{item.model}</Td>
                    <Td className="py-4">{item.variant}</Td>
                     <Td className="py-4">{item.group}</Td>
                    <Td className="py-4">
                     
                        {item.unit}
                 
                    </Td>
                    {/* <Td className="py-4 font-mono text-sm">{item.chassisNo}</Td>
                    <Td className="py-4 font-mono text-sm">{item.engineNo}</Td> */}
                    {/* <Td className="py-4 font-mono text-sm">
                      {item.vehicleSrNo}
                    </Td> */}
                    <Td className="py-4 text-right">{item.quantity}</Td>
                    <Td className="py-4 text-right">₹{fmt(item.perRate)}</Td>
                    <Td className="py-4 text-right">{item.gstPercent}%</Td>
                    <Td className="py-4 text-right font-bold text-blue-600 dark:text-blue-400">
                      ₹{fmt(item.amount)}
                    </Td>
                    <Td className="py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusColors[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </Td>
                     <Td className="py-4">{item.inwardBy }</Td>
                    <Td className="py-4">{item.inwardType }</Td>
                     <Td className="py-4">  {item.inwardDate
    ? new Date(item.inwardDate).toLocaleString("en-GB")
    : "-"}</Td>
                    <Td className="py-4 text-center">
                     
                        <button
                          disabled
                          title="View Disabled"
                          className="cursor-not-allowed text-gray-400"
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
                    colSpan={columns.length + 1}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No purchase items found
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
      {/* Inward Drawer */}
      <Transition appear show={showTransportModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-100"
          onClose={() => setShowTransportModal(false)}
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
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur dark:bg-black/40" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out transform-gpu duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in transform-gpu duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="text-lg font-semibold">Add Transport</h2>

                <Button
                  variant="flat"
                  isIcon
                  onClick={() => setShowTransportModal(false)}
                >
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              {/* Body */}
              <div className="grow space-y-4 overflow-y-auto p-5">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Transporter Name
                  </label>
                  <Input
                    value={transportData.transporterName}
                    placeholder="Transporter Name"
                    onChange={(e) =>
                      setTransportData({
                        ...transportData,
                        transporterName: e.target.value,
                      })
                    }
                  />
                  {transportErrors.transporterName && (
                    <p className="text-sm text-red-500">
                      {transportErrors.transporterName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Mobile Number
                  </label>
                  <Input
                    value={transportData.mobileNumber}
                    placeholder="Mobile Number"
                    onChange={(e) =>
                      setTransportData({
                        ...transportData,
                        mobileNumber: e.target.value,
                      })
                    }
                  />
                  {transportErrors.mobileNumber && (
                    <p className="text-sm text-red-500">
                      {transportErrors.mobileNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Vehicle Number
                  </label>
                  <Input
                    value={transportData.vehicleNumber}
                    placeholder="Vehicle Number"
                    onChange={(e) =>
                      setTransportData({
                        ...transportData,
                        vehicleNumber: e.target.value,
                      })
                    }
                  />
                  {transportErrors.vehicleNumber && (
                    <p className="text-sm text-red-500">
                      {transportErrors.vehicleNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 border-t p-5">
                <Button
                  variant="outlined"
                  className="w-1/2"
                  onClick={() => setShowTransportModal(false)}
                >
                  Cancel
                </Button>

                <Button
                  color="primary"
                  className="w-1/2"
                  onClick={handleTransportSave}
                >
                  Save
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
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
              {/* Header */}
              <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <h2 className="dark:text-dark-50 text-lg font-semibold text-gray-800">
                  Inward Details
                </h2>
                <Button
                  onClick={() => setShowDrawer(false)}
                  variant="flat"
                  isIcon
                  className="size-8 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  type="button"
                >
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="grow overflow-y-auto p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Vehicle Sr. No.
                    </label>
                    <Input
                      type="text"
                      name="vehicleSrNo"
                      value={inwardData.vehicleSrNo}
                      readOnly
                      placeholder="Enter vehicle serial number"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Chassis No.
                    </label>
                    <Input
                      type="text"
                      name="chassisNo"
                      value={inwardData.chassisNo}
                      onChange={handleInwardChange}
                      readOnly
                      placeholder="Enter chassis number"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Engine No.
                    </label>
                    <Input
                      type="text"
                      name="engineNo"
                      value={inwardData.engineNo}
                      readOnly
                      onChange={handleInwardChange}
                      placeholder="Enter engine number"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      MFG Date
                    </label>
                    <DatePicker
                      placeholder="Select MFG Date"
                      disabled={isView}
                      value={inwardData.mfgDate}
                      onChange={(selectedDates: Date[]) => {
                        if (selectedDates && selectedDates.length > 0) {
                          const date = selectedDates[0];
                          const formattedDate =
                            date instanceof Date
                              ? date.toISOString().split("T")[0]
                              : date;
                          setInwardData({
                            ...inwardData,
                            mfgDate: formattedDate as string,
                          });
                        }
                      }}
                    />
                    {errors.mfgDate && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.mfgDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Key No.
                    </label>
                    <Input
                      type="text"
                      readOnly={isView}
                      name="keyNo"
                      value={inwardData.keyNo}
                      onChange={handleInwardChange}
                      placeholder="Enter key number"
                    />
                    {errors.keyNo && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.keyNo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Battery Make
                    </label>
                    <Input
                      type="text"
                      readOnly={isView}
                      name="batteryMake"
                      value={inwardData.batteryMake}
                      onChange={handleInwardChange}
                      placeholder="Enter battery make"
                    />
                    {errors.batteryMake && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.batteryMake}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Battery No.
                    </label>
                    <Input
                      type="text"
                      readOnly={isView}
                      name="batteryNo"
                      value={inwardData.batteryNo}
                      onChange={handleInwardChange}
                      placeholder="Enter battery number"
                    />
                    {errors.batteryNo && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.batteryNo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First 1 Tyer No.
                    </label>
                    <Input
                      type="text"
                      readOnly={isView}
                      name="first1TyerNo"
                      value={inwardData.first1TyerNo}
                      onChange={handleInwardChange}
                      placeholder="Enter first 1 tyer number"
                    />
                    {errors.first1TyerNo && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.first1TyerNo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First 2 Tyer No.
                    </label>
                    <Input
                      type="text"
                      readOnly={isView}
                      name="first2TyerNo"
                      value={inwardData.first2TyerNo}
                      onChange={handleInwardChange}
                      placeholder="Enter first 2 tyer number"
                    />
                    {errors.first2TyerNo && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.first2TyerNo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Second 1 Tyer No.
                    </label>
                    <Input
                      type="text"
                      readOnly={isView}
                      name="second1TyerNo"
                      value={inwardData.second1TyerNo}
                      onChange={handleInwardChange}
                      placeholder="Enter second 1 tyer number"
                    />
                    {errors.second1TyerNo && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.second1TyerNo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Second 2 Tyer No.
                    </label>
                    <Input
                      type="text"
                      readOnly={isView}
                      name="second2TyerNo"
                      value={inwardData.second2TyerNo}
                      onChange={handleInwardChange}
                      placeholder="Enter second 2 tyer number"
                    />
                    {errors.second2TyerNo && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.second2TyerNo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <Input
                      type="text"
                      readOnly={isView}
                      name="location"
                      value={inwardData.location}
                      onChange={handleInwardChange}
                      placeholder="Enter location"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      GRN Number
                    </label>
                    <Input
                      type="text"
                      readOnly={isView}
                      name="grnNumber"
                      value={inwardData.grnNumber}
                      onChange={handleInwardChange}
                      placeholder="Enter GRN number"
                    />
                    {errors.grnNumber && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.grnNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      GRN Date
                    </label>
                    <DatePicker
                      placeholder="Select GRN Date"
                      disabled={isView}
                      value={inwardData.grnDate}
                      onChange={(selectedDates: Date[]) => {
                        if (selectedDates && selectedDates.length > 0) {
                          const date = selectedDates[0];
                          const formattedDate =
                            date instanceof Date
                              ? date.toISOString().split("T")[0]
                              : date;
                          setInwardData({
                            ...inwardData,
                            grnDate: formattedDate as string,
                          });
                        }
                      }}
                    />
                    {errors.grnDate && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.grnDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      GRN Record Date
                    </label>
                    <DatePicker
                      placeholder="Select GRN Record Date"
                      value={inwardData.grnRecordDate}
                      disabled={isView}
                      onChange={(selectedDates: Date[]) => {
                        if (selectedDates && selectedDates.length > 0) {
                          const date = selectedDates[0];
                          const formattedDate =
                            date instanceof Date
                              ? date.toISOString().split("T")[0]
                              : date;
                          setInwardData({
                            ...inwardData,
                            grnRecordDate: formattedDate as string,
                          });
                        }
                      }}
                    />
                    {errors.grnRecordDate && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.grnRecordDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="dark:border-dark-500 flex items-center justify-end gap-3 border-t border-gray-200 p-5">
                <Button
                  variant="outlined"
                  color="neutral"
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="h-10 w-1/2"
                >
                  Cancel
                </Button>
                {!isView && (
                  <Button
                    color="primary"
                    type="button"
                    onClick={handleInwardSubmit}
                    className="h-10 w-1/2"
                  >
                    Submit Inward
                  </Button>
                )}
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AccessoriesItemList;
