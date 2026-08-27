import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiHelper from "@/utils/apiHelper";
import {
  ArrowLeftIcon,
  // PencilIcon,
  // TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";
import { Fragment } from "react";

type VehicleStockDetail = {
  id: number;
  transferNo: string;
  transferDate: string;
  branchId: number;
  branch: {
    id: number;
    branchName: string;
    mobileNo: string;
    stateCode?: string;
  };
  manager: {
    id: number;
    accountName: string;
  };
  vehicles: VehicleItem[];
  totalValue: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  branchOpeningBalance: number;
  companyId: number;
  financialYearId: number;
  companyStateCode?: string;
};

type VehicleItem = {
  id: number;
  chassisNo: string;
  serialNo: string;
  modelName: string;
  variantName: string;
  colour: string;
  itemName: string;
  itemCode: string;
  engineNo: string;
  mfgDate: string;
  keyNumber: string;
  batteryNo: string;
  batteryMake: string;
  first1TyreNo: string;
  first2TyreNo: string;
  second1TyreNo: string;
  second2TyreNo: string;
  location: string;
  grnNo: string;
  grnDate: string;
  grnRecordDate: string;
  purchasePriceNoGST: number;
  purchasePriceTaxable: number;
};

const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

const ViewVehicleStock = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VehicleStockDetail | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
const [search, setSearch] = useState("");
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "₹0";
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getTransferById = async () => {
    try {
      setLoading(true);
      const res = await apiHelper.get(`/vehicle-stock-transfer/${id}`);
      setData(res.data);
    } catch (error) {
      console.log("Error fetching transfer:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getTransferById();
    }
  }, [id]);

  const handleBack = () => {
    navigate("/stocktransfer/vehiclestock");
  };

  const handleEdit = () => {
    navigate(`/stocktransfer/vehiclestock/edit/${id}`, {
      state: { item: data },
    });
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this vehicle stock transfer?",
      )
    ) {
      try {
        await apiHelper.delete(`/vehicle-stock-transfer/${id}`);
        navigate("/stocktransfer/vehiclestock");
      } catch (error) {
        console.log("Error deleting:", error);
      }
    }
  };

  // Pagination logic
// Pagination logic
const vehicles = data?.vehicles || [];

// NEW: filter vehicles by the search box
const filteredVehicles = vehicles.filter((v) => {
  const q = search.toLowerCase();
  return (
    v.chassisNo?.toLowerCase().includes(q) ||
    v.engineNo?.toLowerCase().includes(q) ||
    v.itemName?.toLowerCase().includes(q) ||
    v.itemCode?.toLowerCase().includes(q) ||
    v.modelName?.toLowerCase().includes(q) ||
    v.variantName?.toLowerCase().includes(q) ||
    v.colour?.toLowerCase().includes(q) ||
    v.serialNo?.toLowerCase().includes(q)
  );
});

const totalItems = filteredVehicles.length;
const totalPages = Math.ceil(totalItems / itemsPerPage);
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);
useEffect(() => {
  setCurrentPage(1);
}, [search]);
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Vehicle stock transfer not found
          </p>
          <button
            onClick={handleBack}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isSameState =
    (data.branch?.stateCode || "").trim().toUpperCase() ===
    (data.companyStateCode || "").trim().toUpperCase();

  return (
    <div className="min-h-screen bg-white p-6 transition-colors duration-200 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Vehicle Stock Transfer Details
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Transfer ID: {data.transferNo}
            </p>
          </div>
        </div>

        {/* <div className="flex flex-wrap items-center gap-2">
          <Button
            color="primary"
            onClick={handleEdit}
            className="flex items-center gap-1.5"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
          <Button
            color="error"
            onClick={handleDelete}
            className="flex items-center gap-1.5"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div> */}
      </div>

      {/* Transfer Info */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-4 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
            Transfer Date
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatDate(data.transferDate)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
            Branch
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {data.branch?.branchName || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
            Branch Manager
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {data.manager?.accountName || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
            Contact No
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {data.branch?.mobileNo || "-"}
          </p>
        </div>
      </div>

      {/* Vehicles Table with Pagination */}
   {/* Vehicles Table with Pagination */}
<div className="mb-6">
  <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
    Vehicles ({totalItems})
  </h3>

  {/* Search */}
  <div className="relative mb-4 w-full max-w-md">
    <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      placeholder="Search chassis, engine, model, item..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
    />
  </div>



        <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table
              hoverable
              className="w-full min-w-[2200px] text-left [&_.table-th]:font-semibold"
            >
              <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
                <Tr>
                  <Th className="w-16 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    S.No
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Vehicle Sr No
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Item Name
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Item Code
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Model
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Variant
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Colour
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Chassis No
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Engine No
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    MFG Date
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Key No
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Battery No
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Battery Make
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    F1 Tyre
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    F2 Tyre
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    S1 Tyre
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    S2 Tyre
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Location
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    GRN No
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    GRN Date
                  </Th>
                  <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    GRN Record Date
                  </Th>
                  <Th className="py-3.5 text-right text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                    Purchase Price
                  </Th>
                  {/* <Th className="whitespace-nowrap py-3.5 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Taxable Price
                  </Th> */}
                </Tr>
              </THead>

              <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
                {currentItems.map((vehicle: VehicleItem, index: number) => (
                  <Tr
                    key={vehicle.id}
                    className="dark:hover:bg-dark-700/40 whitespace-nowrap transition-colors hover:bg-gray-50/30"
                  >
                    <Td className="py-4 font-medium text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.serialNo || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.itemName || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.itemCode || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.modelName || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.variantName || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      <span
                        className="inline-flex h-3 w-3 rounded-full border border-gray-300"
                        style={{
                          backgroundColor:
                            vehicle.colour?.toLowerCase() || "#ccc",
                        }}
                      />
                      <span className="ml-1">{vehicle.colour || "-"}</span>
                    </Td>
                    <Td className="py-4 font-mono text-sm font-medium text-gray-900 dark:text-gray-400">
                      {vehicle.chassisNo || "-"}
                    </Td>
                    <Td className="py-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                      {vehicle.engineNo || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {formatDate(vehicle.mfgDate)}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.keyNumber || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.batteryNo || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.batteryMake || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.first1TyreNo || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.first2TyreNo || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.second1TyreNo || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.second2TyreNo || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.location || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {vehicle.grnNo || "-"}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {formatDate(vehicle.grnDate)}
                    </Td>
                    <Td className="py-4 text-gray-600 dark:text-gray-300">
                      {formatDate(vehicle.grnRecordDate)}
                    </Td>
                    <Td className="py-4 text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(vehicle.purchasePriceNoGST)}
                    </Td>
                    {/* <Td className="py-4 text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(vehicle.purchasePriceTaxable)}
                    </Td> */}
                  </Tr>
                ))}

                {currentItems.length === 0 && (
                  <Tr>
                    <Td
                      colSpan={23}
                      className="py-12 text-center text-gray-400"
                    >
                      No vehicles found
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
                  {Math.min(indexOfLastItem, totalItems)} of {totalItems}{" "}
                  entries
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bill Summary */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Bill Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Value
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrency(data.totalValue)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Taxable Value
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrency(data.taxableValue)}
                </span>
              </div>

              {/* CGST */}
              {Number(data.cgst) > 0 && (
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    CGST
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {formatCurrency(data.cgst)}
                  </span>
                </div>
              )}

              {/* SGST */}
              {Number(data.sgst) > 0 && (
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    SGST
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {formatCurrency(data.sgst)}
                  </span>
                </div>
              )}

              {/* IGST */}
              {Number(data.igst) > 0 && (
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    IGST
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {formatCurrency(data.igst)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg bg-blue-600/10 p-2 dark:bg-blue-500/20">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Grand Total
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(data.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Back to List
        </button>
        {/* <button
          type="button"
          onClick={handleEdit}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
        >
          Edit Transfer
        </button> */}
      </div>
    </div>
  );
};

export default ViewVehicleStock;
