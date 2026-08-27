import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import apiHelper from "@/utils/apiHelper";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  //   EllipsisHorizontalIcon,
  XMarkIcon,
  //   CheckCircleIcon,
} from "@heroicons/react/24/outline";
// import {
//   Menu,
//   MenuButton,
//   MenuItems,
//   MenuItem,
//   Transition,
// } from "@headlessui/react";
// import { Fragment } from "react";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Button, Checkbox } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
// import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { toast } from "sonner";
type VendorStatus = "PENDING" | "ACTIVE";

type Vendor = {
  id: number;
  userId: number;
  vendorType: string;
  vehicleType?: string | null;
  name: string;
  number: string;
  email: string;
  country: string;
  state: string;
  district: string;
  city: string;
  address: string;
  pincode: string;
  isVerified: boolean;
  verifiedAt?: string | null;
  status: VendorStatus;
  createdAt: string;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

const statusStyles: Record<VendorStatus, string> = {
  PENDING:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",

  ACTIVE: "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400",
};

const statusOptions: VendorStatus[] = ["PENDING", "ACTIVE"];

const VendorList = () => {
  //   const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");

  const [showDetails, setShowDetails] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const getVendors = async () => {
    try {
      const response = await apiHelper.get("/vendor/all");
      setVendors(response.vendors ?? response.data ?? []);
    } catch (error) {
      console.log("API Error:", error);
    }
  };

  useEffect(() => {
    getVendors();
  }, []);

  // Admin approve/suspend/reject — hits the status endpoint, not isVerified
  const handleStatusChange = async (item: Vendor, status: VendorStatus) => {
    try {
      await apiHelper.patch(`/vendor/${item.id}/status`, {
        status,
      });

      toast.success(
        status === "ACTIVE"
          ? "Vendor activated successfully"
          : "Vendor moved to pending successfully",
      );

      getVendors();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update vendor status",
      );
    }
  };

  const typeFilterOptions = [
    { id: "All", name: "All Types" },
    ...Array.from(new Set(vendors.map((v) => v.vendorType))).map((t) => ({
      id: t,
      name: t,
    })),
  ];

  const statusFilterOptions = [
    { id: "All", name: "All Status" },
    ...statusOptions.map((s) => ({ id: s, name: s })),
  ];

  const searchText = search.trim().toLowerCase();

  const filteredData = vendors.filter((item) => {
    const matchesSearch =
      !searchText ||
      item.name.toLowerCase().includes(searchText) ||
      item.email.toLowerCase().includes(searchText) ||
      item.number.toLowerCase().includes(searchText) ||
      item.city.toLowerCase().includes(searchText);

    const matchesType =
      selectedTypeFilter === "All" || item.vendorType === selectedTypeFilter;

    const matchesStatus =
      selectedStatusFilter === "All" || item.status === selectedStatusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const isAllPageSelected =
    currentItems.length > 0 &&
    currentItems.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = (checked: boolean) => {
    const pageIds = currentItems.map((item) => item.id);
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Vendor List
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all registered vendors from here
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 md:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowFilterBar(!showFilterBar)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              showFilterBar
                ? "bg-primary-50 border-primary-200 text-primary-600 dark:bg-dark-600 dark:border-dark-500 dark:text-white"
                : "dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FunnelIcon className="size-4.5" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search name, email, number, city..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>

      {/* Filter Bar */}
      {showFilterBar && (
        <div className="dark:bg-dark-700 dark:border-dark-500 animate-in fade-in slide-in-from-top-2 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-150">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Vendor Type
              </span>
              <Listbox
                data={typeFilterOptions}
                value={
                  typeFilterOptions.find((o) => o.id === selectedTypeFilter) ||
                  typeFilterOptions[0]
                }
                placeholder="All Types"
                onChange={(opt: any) => {
                  setSelectedTypeFilter(opt.id);
                  setCurrentPage(1);
                }}
                displayField="name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Status
              </span>
              <Listbox
                data={statusFilterOptions}
                value={
                  statusFilterOptions.find(
                    (o) => o.id === selectedStatusFilter,
                  ) || statusFilterOptions[0]
                }
                placeholder="All Status"
                onChange={(opt: any) => {
                  setSelectedStatusFilter(opt.id);
                  setCurrentPage(1);
                }}
                displayField="name"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table
            hoverable
            className="w-full min-w-300 text-left [&_.table-th]:font-semibold"
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
                  Name
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Vendor Type
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Email
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Number
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  City / State
                </Th>
                {/* <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Verified
                </Th> */}
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Status
                </Th>
                <Th className="w-20 py-3.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Actions
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
                    <Td className="py-4 font-medium text-gray-900 dark:text-gray-200">
                      {item.name}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600 capitalize">
                      {item.vendorType}
                      {item.vehicleType ? ` (${item.vehicleType})` : ""}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.email}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.number}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.city}, {item.state}
                    </Td>
                    {/* <Td className="py-4">
                      {item.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                          <CheckCircleIcon className="size-4" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">
                          Not verified
                        </span>
                      )}
                    </Td> */}
                    <Td className="py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </Td>
                    <Td className="py-4 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.status === "ACTIVE"}
                        onClick={() =>
                          handleStatusChange(
                            item,
                            item.status === "ACTIVE" ? "PENDING" : "ACTIVE",
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          item.status === "ACTIVE"
                            ? "bg-primary-500"
                            : "dark:bg-dark-500 bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
                            item.status === "ACTIVE"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </Td>
                  </Tr>
                );
              })}

              {currentItems.length === 0 && (
                <Tr>
                  <Td
                    colSpan={10}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No vendors found
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
                <Listbox
                  data={entriesOptions}
                  value={
                    entriesOptions.find((o) => o.id === itemsPerPage) ||
                    entriesOptions[0]
                  }
                  onChange={(opt: any) => {
                    setItemsPerPage(opt.id);
                    setCurrentPage(1);
                  }}
                  displayField="name"
                />
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
                  className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400"
                >
                  ‹
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
                  className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400"
                >
                  ›
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

      {/* Details View */}
      {showDetails && selectedVendor && (
        <div className="dark:bg-dark-800 dark:border-dark-700 animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vendor Details - {selectedVendor.name}
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              className="dark:hover:bg-dark-600 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <Table hoverable className="w-full text-left">
              <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
                <Tr>
                  <Th className="py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Field
                  </Th>
                  <Th className="py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Value
                  </Th>
                </Tr>
              </THead>
              <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
                <Tr>
                  <Td className="py-3 font-medium">Vendor Type</Td>
                  <Td className="py-3 capitalize">
                    {selectedVendor.vendorType}
                  </Td>
                </Tr>
                {selectedVendor.vehicleType && (
                  <Tr>
                    <Td className="py-3 font-medium">Vehicle Type</Td>
                    <Td className="py-3 capitalize">
                      {selectedVendor.vehicleType}
                    </Td>
                  </Tr>
                )}
                <Tr>
                  <Td className="py-3 font-medium">Name</Td>
                  <Td className="py-3">{selectedVendor.name}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Email</Td>
                  <Td className="py-3">{selectedVendor.email}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Number</Td>
                  <Td className="py-3">{selectedVendor.number}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Country</Td>
                  <Td className="py-3">{selectedVendor.country}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">State</Td>
                  <Td className="py-3">{selectedVendor.state}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">District</Td>
                  <Td className="py-3">{selectedVendor.district}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">City</Td>
                  <Td className="py-3">{selectedVendor.city}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Address</Td>
                  <Td className="py-3">{selectedVendor.address}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Pincode</Td>
                  <Td className="py-3">{selectedVendor.pincode}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Verified</Td>
                  <Td className="py-3">
                    {selectedVendor.isVerified ? "Yes" : "No"}
                  </Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Status</Td>
                  <Td className="py-3">{selectedVendor.status}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Registered On</Td>
                  <Td className="py-3">
                    {new Date(selectedVendor.createdAt).toLocaleDateString(
                      "en-IN",
                    )}
                  </Td>
                </Tr>
              </TBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorList;
