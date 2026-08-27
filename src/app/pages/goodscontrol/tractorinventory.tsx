import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  // FunnelIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  // PencilIcon,
  // TrashIcon,
  // PlusIcon,
  // EyeIcon,
} from "@heroicons/react/24/outline";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import apiHelper from "@/utils/apiHelper";

// ---------- Types ----------
export interface TractorInventoryRow {
  id: number;
  stock: "On" | "Off";
  status: "Present" | "Sold" | "In Transit" | "Pending" | "Reserved" | "Booked";
  location: string;
  itemCode:string;
  currentLocation: string;
  billNo: string;
  purchaseBillNo: string;
  supplierName: string;
  itemName: string;
  modelName: string;
  variantName: string;
  colour: string;
  fuelType: string;
  serialNo: string;
  mfgDate: string;
  chassisNo: string;
  engineNo: string;
  keyNumber: string;
  batteryMake: string;
  batteryNo: string;
first1TyreNo: string;
first2TyreNo: string;
second1TyreNo: string;
second2TyreNo: string;
  grnDate: string;
  grnRecordDate: string;
  grnNo: string;
  inWardDate: string;
  inWardTime: string;
  ageDay: number;
}

interface TractorInventoryProps {
  rows?: TractorInventoryRow[];
  onAddTractor?: () => void;
  onEditRow?: (row: TractorInventoryRow) => void;
  onDeleteRow?: (row: TractorInventoryRow) => void;
  onViewRow?: (row: TractorInventoryRow) => void;
}

// ---------- Options ----------
const entriesOptions = [
  { id: 10, name: "10" },
  { id: 15, name: "15" },
  { id: 25, name: "25" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

const stockFilterOptions = [
  { id: "All", name: "All Stock" },
  { id: "On", name: "Stock On" },
  { id: "Off", name: "Stock Off" },
];

const statusFilterOptions = [
  { id: "All", name: "All Statuses" },
  { id: "Present", name: "Present" },
  { id: "Booked", name: "Booked" },
  { id: "Sold", name: "Sold" },
  { id: "In Transit", name: "In Transit" },
  { id: "Pending", name: "Pending" },
  { id: "Reserved", name: "Reserved" },
];

const statusColors: Record<TractorInventoryRow["status"], string> = {
  Present:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Sold: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  "In Transit":
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Reserved:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Booked:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const stockColors = {
  On: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Off: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const fmt = (n: number) =>
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const columns = [
  "#",
  "Action",
  "Stock",
  "Status",
  "Location",
  "Current Location",
  "Bill No.",
  "Purchase Bill No.",
  "Supplier Name",
  "Item Name",
  "Model",
  "Variant",
  "Colour",
  "Fuel Type",
  "Serial No.",
  "MFG Date",
  "Chassis No.",
  "Engine No.",
  "Key Number",
  "Battery Make",
  "Battery No.",
  "1st Tyer (1)",
  "1st Tyer (2)",
  "2nd Tyer (1)",
  "2nd Tyer (2)",
  "GRN Date",
  "GRN Record Date",
  "GRN No.",
  "In Ward Date",
  "In Ward Time",
];

const TractorInventory: React.FC<TractorInventoryProps> = ({
  onAddTractor,
  onEditRow,
  onDeleteRow,
  onViewRow,
}) => {
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selectedStockFilter, setSelectedStockFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<TractorInventoryRow[]>([]);
  const navigate = useNavigate();

  // Sample data - replace with API call
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await apiHelper.get("/tractor-inventory");

      setRows(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };
  // Add this function with your other handlers
  const handleToggleStock = async (id: number) => {
    const item = rows.find((row) => row.id === id);
    if (!item) return;

    const newStock = item.stock === "On" ? "Off" : "On";

    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, stock: newStock } : row)),
    );

    try {
      // await apiHelper.put(`/tractor-inventory/${id}`, { stock: newStock });
      console.log(`Toggled stock to ${newStock} for item ${id}`);
    } catch (error) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, stock: item.stock } : row,
        ),
      );
      console.error("Failed to toggle stock:", error);
    }
  }; // Filter rows
  const filteredRows = useMemo(() => {
    let result = rows;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        [
          r.supplierName,
          r.itemName,
          r.billNo,
          r.purchaseBillNo,
          r.location,
          r.currentLocation,
          r.serialNo,
          r.chassisNo,
          r.engineNo,
          r.status,
          r.stock,
          r.modelName,
          r.variantName,
          r.colour,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    // Stock filter
    if (selectedStockFilter !== "All") {
      result = result.filter((r) => r.stock === selectedStockFilter);
    }

    // Status filter
    if (selectedStatusFilter !== "All") {
      result = result.filter((r) => r.status === selectedStatusFilter);
    }

    return result;
  }, [rows, search, selectedStockFilter, selectedStatusFilter]);

  const totalItems = filteredRows.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  const isAllPageSelected =
    currentItems.length > 0 &&
    currentItems.every((item) => selectedIds.includes(item.id));

  // Replace the entire function with:
  const handleSelectAll = (checked: boolean) => {
    const pageIds = currentItems.map((item) => item.id); // Now returns number[]
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
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
  // const handleAddTractor = () => {
  //   navigate("/goodscontrol/tractorinventory/add");
  //   if (onAddTractor) onAddTractor();
  // };

  // const handleEditRow = (row: TractorInventoryRow) => {
  //   navigate(`/goodscontrol/tractorinventory/${row.id}`);
  //   if (onEditRow) onEditRow(row);
  // };

  // const handleDeleteRow = (row: TractorInventoryRow) => {
  //   if (window.confirm(`Are you sure you want to delete this tractor?`)) {
  //     if (onDeleteRow) onDeleteRow(row);
  //   }
  // };

  // const handleViewRow = (row: TractorInventoryRow) => {
  //   navigate(`/goodscontrol/tractorinventory/view/${row.id}`);
  //   if (onViewRow) onViewRow(row);
  // };
  const formatDate = (date?: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB");
  };
  const formatDateTime = (date?: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Tractor Inventory
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all tractor inventory from here
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
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by supplier, item, bill no..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="dark:border-dark-500 dark:bg-dark-800 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm transition-all duration-200 outline-none focus:ring-2"
          />
        </div>
        {/* Status Filter Toggle Buttons - Segmented Control Style */}
        <div className="dark:bg-dark-700/80 relative flex w-full rounded-lg bg-gray-100/80 p-1 sm:inline-flex sm:w-auto">
          {/* The Sliding Background */}
          <div
            className="dark:bg-dark-600 absolute top-1 bottom-1 rounded-md bg-white shadow-md transition-all duration-500 ease-in-out"
            style={{
              // 4 filter buttons
              width: "calc(25% - 8px)",

              left:
                selectedStatusFilter === "All"
                  ? "4px"
                  : selectedStatusFilter === "Present"
                    ? "calc(25% + 4px)"
                    : selectedStatusFilter === "In Transit"
                      ? "calc(50% + 4px)"
                      : "calc(75% + 4px)",
            }}
          />

          {[
            { id: "All", label: "All" },
            { id: "Present", label: "Present" },
            { id: "In Transit", label: "Transit" },
            { id: "Booked", label: "Booked" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setSelectedStatusFilter(option.id);
                setCurrentPage(1);
              }}
              className={`relative z-10 flex-1 cursor-pointer rounded-md px-3 py-2 text-center text-xs font-medium transition-colors duration-300 sm:w-28 sm:text-sm ${
                selectedStatusFilter === option.id
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>{" "}
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
                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                   Action
                </Th>
                   <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                   Status
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Item Name
                </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Item Code 
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Model
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Variant
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Colour
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Fuel Type
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Serial No.
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  MFG Date
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Chassis No.
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Engine No.
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Key Number
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Battery Make
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Battery No.
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  First 1 Tyer
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  First 2 Tyer
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Second 1 Tyer
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Second 2 Tyer
                </Th>
                {/* <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  GRN Date
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  GRN Record Date
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  GRN No.
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Age Day
                </Th> */}
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  In Ward Date
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  In Ward Time
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
                    <Td className="py-4">
                      {item.status !== "Booked" && (
                        <button
                          type="button"
                          onClick={() => handleToggleStock(item.id)}
                          className={`relative h-6 w-12 rounded-full transition-all ${
                            item.stock === "On"
                              ? "bg-primary-500"
                              : "dark:bg-dark-600 bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                              item.stock === "On" ? "left-6.5" : "left-0.5"
                            }`}
                          />
                        </button>
                      )}
                    </Td>
                       <Td className="py-4 font-medium">{item.status}</Td>
                    <Td className="py-4 font-medium">{item.itemName}</Td>
                      <Td className="py-4 font-medium">{item.itemCode}</Td>
                    <Td className="py-4">{item.modelName}</Td>
                    <Td className="py-4">{item.variantName}</Td>
                    <Td className="py-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="inline-block size-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: item.colour.toLowerCase() }}
                        />
                        {item.colour}
                      </span>
                    </Td>
                    <Td className="py-4">{item.fuelType}</Td>
                    <Td className="py-4 font-mono text-sm">{item.serialNo}</Td>
                    <Td className="py-4">{formatDate(item.mfgDate)}</Td>
                    <Td className="py-4 font-mono text-sm">{item.chassisNo}</Td>
                    <Td className="py-4 font-mono text-sm">{item.engineNo}</Td>
                    <Td className="py-4 font-mono text-sm">{item.keyNumber}</Td>
                    <Td className="py-4">{item.batteryMake}</Td>
                    <Td className="py-4 font-mono text-sm">{item.batteryNo}</Td>
                    <Td className="py-4">{item.first1TyreNo || "-"}</Td>
<Td className="py-4">{item.first2TyreNo || "-"}</Td>
<Td className="py-4">{item.second1TyreNo || "-"}</Td>
<Td className="py-4">{item.second2TyreNo || "-"}</Td>
                    {/* <Td className="py-4">{formatDate(item.grnDate)}</Td>
                    <Td className="py-4">{formatDate(item.grnRecordDate)}</Td>
                    <Td className="py-4">{item.grnNo}</Td>
                    <Td className="py-4">{item.ageDay} Days</Td> */}
                    <Td className="py-4">{formatDate(item.inWardDate)}</Td>
                    <Td className="py-4">{formatDateTime(item.inWardTime)}</Td>
                  </Tr>
                );
              })}

              {currentItems.length === 0 && (
                <Tr>
                  <Td
                    colSpan={columns.length + 2}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No tractor inventory records found
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
    </div>
  );
};

export default TractorInventory;
