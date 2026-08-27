// src/app/pages/master-data/accessories/index.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import { Fragment } from "react";
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  // DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Button, Checkbox, Input, Radio } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import apiHelper from "@/utils/apiHelper";
import Select, { components } from "react-select";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const CheckboxOption = (props: any) => {
  return (
    <components.Option {...props}>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={props.isSelected} readOnly />
          <span>{props.data.variantName}</span>
        </div>

        <span className="text-xs text-white">{props.data.model}</span>
      </div>
    </components.Option>
  );
};
// ─── Types ──────────────────────────────────────────────────────────────────
interface AccessoryItem {
  id: number;
  type: "Accessories" | "Parts";
  itemName: string;
  codeNo: string;
  shortName: string;
  hsnCode: string;
  unit: string;
  taxSlab: string;
  group: string;
  purchasePrice: string;
  salesPrice: string;
  mrp: string;
  opStock: string;
  variant: string;
  barCode: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
   createdBy?: string;
  createdById?: number;
  createdType?: string;
}

interface FormValues {
  type: "Accessories" | "Parts";
  itemName: string;
  codeNo: string;
  shortName: string;
  hsnCode: string;
  unit: string;
  taxSlab: string;
  group: string;
  purchasePrice: string;
  salesPrice: string;
  mrp: string;
  opStock: string;
    barCode: string;
  variant: string;
  status: "ACTIVE" | "INACTIVE";
}

// ─── Helper Functions ──────────────────────────────────────────────────────
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

// ─── Options ──────────────────────────────────────────────────────────────
const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];
const unitOptions = [
  // { label: "NOS", value: "NOS" },
  { label: "PCS", value: "PCS" },
  { label: "SET", value: "SET" },
  { label: "BOX", value: "BOX" },
  // { label: "KIT", value: "KIT" },
  // { label: "LTR", value: "LTR" },
  { label: "KG", value: "KG" },
  { label: "GM", value: "GM" },
  // { label: "MTR", value: "MTR" },
];
const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const statusFilterOptions = [
  { id: "All", name: "All Statuses" },
  { id: "ACTIVE", name: "Active" },
  { id: "INACTIVE", name: "Inactive" },
];

const taxSlabOptions = [
  { label: "GST 0%", value: "0" },
  { label: "GST 5%", value: "5" },
  { label: "GST 12%", value: "12" },
  { label: "GST 18%", value: "18" },
  { label: "GST 28%", value: "28" },
];

const groupOptions = [
  { label: "Spares", value: "Spares" },
  { label: "Filters", value: "Filters" },
  { label: "Hydraulics", value: "Hydraulics" },
  { label: "General Accessories", value: "General Accessories" },
];

const typeOptions = [
  { label: "Accessories", value: "Accessories" },
  { label: "Parts", value: "Parts" },
];

// ─── Main Component ──────────────────────────────────────────────────────
const Accessories = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [items, setItems] = useState<AccessoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<any[]>([]);
  const [variantOptions, setVariantOptions] = useState([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmState, setConfirmState] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const fetchShowroomVariants = async () => {
    try {
      const res = await apiHelper.get("/showroom-variant");

      const data = res.data?.data || res.data || [];

      console.log("Showroom Variant Response:", data);

      setVariantOptions(
        data.map((item: any) => ({
          value: item.id,
          label: `${item.variantName} - ${item.model}`,
          variantName: item.variantName,
          model: item.model,
        })),
      );
    } catch (error) {
      console.error("Error fetching showroom variants", error);
    }
  };
  useEffect(() => {
    fetchShowroomVariants();
  }, []);
  // ─── Form State ─────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<FormValues>({
    type: "Accessories",
    itemName: "",
    codeNo: "",
    shortName: "",
    hsnCode: "",
    unit: "",
    taxSlab: "",
    group: "",
    purchasePrice: "",
    salesPrice: "",
    mrp: "",
    opStock: "",
    barCode:"",
    variant: "",
    status: "ACTIVE",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Fetch Data ──────────────────────────────────────────────────────
  useEffect(() => {
    getAccessories();
  }, []);

  const getAccessories = async () => {
    try {
      setLoading(true);
      const response = await apiHelper.get("/accessories");
      let data = response?.data?.data || response?.data || response;
      if (!Array.isArray(data)) data = [];
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch accessories:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleInputChange = (field: keyof FormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleTypeChange = (type: "Accessories" | "Parts") => {
    setFormData((prev) => ({
      ...prev,
      type,
      itemName: "",
      codeNo: "",
    }));
    // Clear errors for these fields if they exist
    const newErrors = { ...errors };
    delete newErrors.itemName;
    delete newErrors.codeNo;
    setErrors(newErrors);
  };

  const handleOpenAddDrawer = () => {
    setEditId(null);
    setFormData({
      type: "Accessories",
      itemName: "",
      codeNo: "",
      shortName: "",
      hsnCode: "",
      unit: "",
      taxSlab: "",
      group: "",
      purchasePrice: "",
      salesPrice: "",
      mrp: "",
      opStock: "",
        barCode: "",
      variant: "",
      status: "ACTIVE",
    });
    setErrors({});
    setShowDrawer(true);
  };

  const handleOpenEditDrawer = (item: any) => {
    setEditId(item.id);

    setFormData({
      type: item.type,
      itemName: item.itemName || "",
      codeNo: item.codeNo || "",
      shortName: item.shortName || "",
      hsnCode: item.hsnCode || "",
      unit: item.unit || "",
      taxSlab: item.taxSlab || "",
      group: item.group || "",

      purchasePrice: String(item.purchasePrice ?? ""),
      salesPrice: String(item.salesPrice ?? ""),
      mrp: String(item.mrp ?? ""),
      opStock: String(item.opStock ?? ""),
  barCode: item.barCode,
      variant: "",
      status: item.status || "ACTIVE",
    });

    setSelectedVariants(
      (item.showroomVariants || []).map((v: any) => ({
        value: v.id,
        label: `${v.variantName} - ${v.model}`,
        variantName: v.variantName,
        model: v.model,
      })),
    );

    setShowDrawer(true);
  };

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setIsBulkDelete(false);
    setConfirmState("pending");
    setShowConfirmModal(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDelete(true);
    setConfirmState("pending");
    setShowConfirmModal(true);
  };

  const performDelete = async () => {
    setConfirmLoading(true);
    try {
      if (isBulkDelete) {
        await Promise.all(
          selectedIds.map((id) => apiHelper.delete(`/accessories/${id}`)),
        );
        toast.success(`${selectedIds.length} items deleted successfully!`);
        setSelectedIds([]);
        await getAccessories();
        setCurrentPage(1);
        setConfirmState("success");
      } else {
        if (deleteTargetId === null) return;
        await apiHelper.delete(`/accessories/${deleteTargetId}`);
        toast.success("Item deleted successfully!");
        await getAccessories();
        setDeleteTargetId(null);
        setConfirmState("success");
      }
      setTimeout(() => setShowConfirmModal(false), 1500);
    } catch (error: any) {
      console.error("Delete failed:", error);
      setConfirmState("error");
      toast.error(
        error.response?.data?.message || "Failed to delete. Please try again.",
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newStatus = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)),
    );

    try {
      await apiHelper.put(`/accessories/${id}`, { status: newStatus });
    } catch (error) {
      console.error("Failed to toggle status:", error);
      await getAccessories();
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.itemName.trim()) newErrors.itemName = "Item Name is required";
    if (!formData.codeNo.trim()) newErrors.codeNo = "Code No is required";
    if (!formData.purchasePrice.trim())
      newErrors.purchasePrice = "Purchase Price is required";
    if (!formData.salesPrice.trim())
      newErrors.salesPrice = "Sales Price is required";
    if (!formData.mrp.trim()) newErrors.mrp = "MRP is required";
    if (!formData.opStock.trim())
      newErrors.opStock = "Opening Stock is required";
    if (selectedVariants.length === 0) {
      newErrors.variant = "Variant is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const payload = {
        type: formData.type,
        itemName: formData.itemName,
        codeNo: formData.codeNo,
        shortName: formData.shortName,
        hsnCode: formData.hsnCode,
        unit: formData.unit,
        taxSlab: formData.taxSlab,
        group: formData.group,
        purchasePrice: formData.purchasePrice,
        salesPrice: formData.salesPrice,
        mrp: formData.mrp,
        opStock: formData.opStock,
        barCode: formData.barCode,
        showroomVariants: selectedVariants.map((v: any) => ({
          id: v.value,
          variantName: v.variantName,
          model: v.model,
        })),
        status: formData.status,
      };

      if (editId) {
        await apiHelper.put(`/accessories/${editId}`, payload);
        toast.success("Item updated successfully!");
      } else {
        await apiHelper.post("/accessories", payload);
        toast.success("Item created successfully!");
      }

      await getAccessories();
      setShowDrawer(false);
    } catch (error: any) {
      console.error("Save failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save item. Please try again.",
      );
    }
  };

  // ─── Filter Data ────────────────────────────────────────────────────────
  const filteredData = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.codeNo.toLowerCase().includes(search.toLowerCase()) ||
      item.shortName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === "All" || item.status === selectedStatusFilter;

    const matchesType =
      selectedTypeFilter === "All" || item.type === selectedTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
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
    if (checked) {
      const pageIds = currentItems.map((item) => item.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = currentItems.map((item) => item.id);
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

  const typeFilterOptions = [
    { id: "All", name: "All Types" },
    { id: "Accessories", name: "Accessories" },
    { id: "Parts", name: "Parts" },
  ];
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "transparent",
      borderColor: state.isFocused
        ? "var(--color-primary-600)"
        : "var(--color-gray-700)",
      borderRadius: "7px",
      boxShadow: state.isFocused
        ? "0 0 0 1px var(--color-primary-600)"
        : "none",
      minHeight: "30px",

      "&:hover": {
        borderColor: "var(--color-primary-500)",
      },
    }),

    valueContainer: (provided: any) => ({
      ...provided,
      color: "var(--color-dark-100)",
    }),

    singleValue: (provided: any) => ({
      ...provided,
      color: "var(--color-dark-100)",
    }),

    input: (provided: any) => ({
      ...provided,
      color: "var(--color-dark-100)",
    }),

    placeholder: (provided: any) => ({
      ...provided,
      color: "var(--color-gray-400)",
    }),

    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "var(--color-dark-700)",
      border: "1px solid var(--color-primary-600)",
      borderRadius: "12px",
      overflow: "hidden",
    }),

    menuList: (provided: any) => ({
      ...provided,
      padding: 0,
    }),

    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "var(--color-primary-600)"
        : state.isFocused
          ? "var(--color-primary-500)"
          : "var(--color-dark-700)",
      color: "#fff",
      cursor: "pointer",
    }),

    dropdownIndicator: (provided: any, state: any) => ({
      ...provided,
      color: state.isFocused
        ? "var(--color-primary-600)"
        : "var(--color-gray-400)",
    }),

    clearIndicator: (provided: any) => ({
      ...provided,
      color: "var(--color-gray-400)",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),
  };
  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Accessories Item
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all accessories and parts from here
          </p>
        </div>

       <div className="flex flex-wrap items-center justify-between gap-2 md:flex-nowrap">
  {/* Left side - Filter and icons */}
  <div className="flex items-center gap-2">
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

    <button
      type="button"
      className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
    >
      <RiFileExcel2Fill className="text-lg text-green-500" />
    </button>

    <button
      type="button"
      className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
    >
      <RiFilePdfFill className="text-lg text-red-500" />
    </button>
  </div>

  {/* Right side - Add Accessories Item button */}
  <Button
    color="primary"
    onClick={handleOpenAddDrawer}
    className="whitespace-nowrap"
  >
    <PlusIcon className="mr-1.5 size-4.5" />
    Add Accessories Item
  </Button>
</div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, code or short name..."
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Type
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
                placeholder="All Statuses"
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
            className="w-full min-w-[1200px] text-left [&_.table-th]:font-semibold"
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
                  Type
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Item Name
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Code No
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Short Name
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  HSN Code
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Unit
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Tax Slab
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Group
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Purchase Price
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Sales Price
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  MRP
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Op. Stock
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Status
                </Th>
                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                 Created Type
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                 Created By
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
                    <Td className="py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.type === "Accessories"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {item.type}
                      </span>
                    </Td>
                    <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                      {item.itemName}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.codeNo}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.shortName}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.hsnCode}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.unit}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.taxSlab}%
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.group}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      ₹{item.purchasePrice}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      ₹{item.salesPrice}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      ₹{item.mrp}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-center text-gray-600">
                      {item.opStock}
                    </Td>
                    <Td className="py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item.id)}
                        className={`relative h-6 w-12 rounded-full transition-all ${
                          item.status === "ACTIVE"
                            ? "bg-primary-500"
                            : "dark:bg-dark-600 bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                            item.status === "ACTIVE" ? "left-6.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </Td>
                     <Td className="dark:text-dark-200 py-4 text-center text-gray-600">{item.createdType || "-"}</Td>

<Td className="dark:text-dark-200 py-4 text-center text-gray-600">{item.createdBy || "-"}</Td>
                    <Td className="py-4 text-center">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <MenuButton className="dark:hover:bg-dark-600 dark:text-dark-200 inline-flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100">
                          <EllipsisHorizontalIcon className="size-5" />
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
                            anchor="bottom end"
                            className="dark:bg-dark-800 dark:ring-dark-500 dark:border-dark-500 z-[100] w-36 rounded-lg border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 [--anchor-gap:4px] focus:outline-none"
                          >
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleOpenEditDrawer(item)}
                                  className={`${
                                    active
                                      ? "dark:bg-dark-600 text-primary-600 bg-gray-50 dark:text-white"
                                      : "dark:text-dark-200 text-gray-700"
                                  } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                                >
                                  <PencilIcon className="size-4" /> Edit
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className={`${
                                    active
                                      ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                      : "dark:text-dark-200 text-gray-700"
                                  } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                                >
                                  <TrashIcon className="size-4" /> Delete
                                </button>
                              )}
                            </MenuItem>
                          </MenuItems>
                        </Transition>
                      </Menu>
                    </Td>
                  </Tr>
                );
              })}

              {currentItems.length === 0 && (
                <Tr>
                  <Td
                    colSpan={15}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No items found
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

      {/* Floating Action Bar */}
      {selectedIds.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 fixed right-6 bottom-6 z-50 w-full max-w-xs px-2 duration-200">
          <div className="dark:border-dark-500 dark:bg-dark-700/95 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="dark:text-dark-200 text-sm font-medium text-gray-600">
              Selected{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {selectedIds.length}
              </span>{" "}
              items
            </div>
            <Button
              variant="filled"
              color="error"
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 shadow-sm"
            >
              <TrashIcon className="size-4" />
              <span className="text-xs font-semibold">Delete</span>
            </Button>
          </div>
        </div>
      )}

      {/* Right Side Drawer */}
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
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-full transform-gpu flex-col bg-white shadow-2xl transition-transform duration-200 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-5 sm:py-4">
                  <h2 className="dark:text-dark-50 text-base font-semibold text-gray-800 sm:text-lg">
                    {editId !== null
                      ? "Edit Accessories Item"
                      : "Add Accessories Item"}
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
                <div className="grow space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-5">
                  {/* Type */}
                  {/* Type - Using Radio buttons */}
                  {/* Type - Using Radio buttons */}
                  <div>
                    <label className="dark:text-dark-200 mb-2 block text-sm font-medium text-gray-700">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                        <Radio
                          checked={formData.type === "Accessories"}
                          onChange={() => handleTypeChange("Accessories")}
                        />
                        Accessories
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                        <Radio
                          checked={formData.type === "Parts"}
                          onChange={() => handleTypeChange("Parts")}
                        />
                        Parts
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        {formData.type === "Accessories"
                          ? "Accessories Name"
                          : "Part Name"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder={
                          formData.type === "Accessories"
                            ? "Enter Accessories Name"
                            : "Enter Part Name"
                        }
                        value={formData.itemName}
                        onChange={(e) =>
                          handleInputChange("itemName", e.target.value)
                        }
                      />
                      {errors.itemName && (
                        <span className="text-xs text-orange-500">
                          {errors.itemName}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        {formData.type === "Accessories"
                          ? "Accessories Code"
                          : "Item Code"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder={
                          formData.type === "Accessories"
                            ? "Enter Accessories Code"
                            : "Enter Item Code"
                        }
                        value={formData.codeNo}
                        onChange={(e) =>
                          handleInputChange("codeNo", e.target.value)
                        }
                      />
                      {errors.codeNo && (
                        <span className="text-xs text-orange-500">
                          {errors.codeNo}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Short Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter Short Name"
                        value={formData.shortName}
                        onChange={(e) =>
                          handleInputChange("shortName", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        HSN Code
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter HSN Code"
                        value={formData.hsnCode}
                        onChange={(e) =>
                          handleInputChange("hsnCode", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Unit
                      </label>
                      <Combobox
                        data={unitOptions}
                        displayField="label"
                        value={
                          unitOptions.find((u) => u.value === formData.unit) ||
                          null
                        }
                        onChange={(val: any) =>
                          handleInputChange("unit", val?.value || "")
                        }
                        placeholder="Select Unit"
                        searchFields={["label"]}
                      />
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Tax Slab
                      </label>
                      <Combobox
                        data={taxSlabOptions}
                        displayField="label"
                        value={
                          taxSlabOptions.find(
                            (t) => t.value === formData.taxSlab,
                          ) || null
                        }
                        onChange={(
                          val: { label: string; value: string } | null,
                        ) => handleInputChange("taxSlab", val?.value || "")}
                        placeholder="Search Tax Slab"
                        searchFields={["label"]}
                      />
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        List of Group
                      </label>
                      <Combobox
                        data={groupOptions}
                        displayField="label"
                        value={
                          groupOptions.find(
                            (g) => g.value === formData.group,
                          ) || null
                        }
                        onChange={(
                          val: { label: string; value: string } | null,
                        ) => handleInputChange("group", val?.value || "")}
                        placeholder="Search Group"
                        searchFields={["label"]}
                      />
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Purchase Price (Without GST)
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter Purchase Price"
                        value={formData.purchasePrice}
                        onChange={(e) =>
                          handleInputChange("purchasePrice", e.target.value)
                        }
                      />
                      {errors.purchasePrice && (
                        <span className="text-xs text-orange-500">
                          {errors.purchasePrice}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Sales Price (Without GST)
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter Sales Price"
                        value={formData.salesPrice}
                        onChange={(e) =>
                          handleInputChange("salesPrice", e.target.value)
                        }
                      />
                      {errors.salesPrice && (
                        <span className="text-xs text-orange-500">
                          {errors.salesPrice}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        MRP <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter MRP"
                        value={formData.mrp}
                        onChange={(e) =>
                          handleInputChange("mrp", e.target.value)
                        }
                      />
                      {errors.mrp && (
                        <span className="text-xs text-orange-500">
                          {errors.mrp}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Opening Stock <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter Opening Stock"
                        value={formData.opStock}
                        onChange={(e) =>
                          handleInputChange("opStock", e.target.value)
                        }
                      />
                      {errors.opStock && (
                        <span className="text-xs text-orange-500">
                          {errors.opStock}
                        </span>
                      )}
                    </div>
 <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Bar Code
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter Bar Code"
                        value={formData.barCode}
                        onChange={(e) =>
                          handleInputChange("barCode", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Variant <span className="text-red-500">*</span>
                      </label>
                      <Select
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        styles={customSelectStyles}
                        options={variantOptions}
                        value={selectedVariants}
                        onChange={(selected) =>
                          setSelectedVariants(selected as any[])
                        }
                        components={{
                          Option: CheckboxOption,
                        }}
                        placeholder="Select Variant"
                      />
                      {errors.variant && (
                        <span className="text-xs text-orange-500">
                          {errors.variant}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <Combobox
                      data={statusOptions}
                      displayField="label"
                      value={
                        (statusOptions.find(
                          (s) => s.value === formData.status,
                        ) as {
                          label: string;
                          value: "ACTIVE" | "INACTIVE";
                        } | null) || null
                      }
                      onChange={(
                        val: {
                          label: string;
                          value: "ACTIVE" | "INACTIVE";
                        } | null,
                      ) => handleInputChange("status", val?.value || "ACTIVE")}
                      placeholder="Select Status"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="dark:border-dark-500 flex flex-col-reverse items-center justify-end gap-3 border-t border-gray-200 p-4 sm:flex-row sm:p-5">
                  <Button
                    variant="outlined"
                    color="neutral"
                    type="button"
                    onClick={() => setShowDrawer(false)}
                    className="h-10 w-full sm:w-auto sm:min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="button"
                    onClick={handleSave}
                    className="h-10 w-full sm:w-auto sm:min-w-[100px]"
                  >
                    {editId !== null ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
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
            title: isBulkDelete ? "Delete Selected Items?" : "Are you sure?",
            description: isBulkDelete
              ? `Are you sure you want to delete ${selectedIds.length} selected items? This action cannot be undone.`
              : "Are you sure you want to delete this item? Once deleted, it cannot be restored.",
            actionText: isBulkDelete ? "Delete All" : "Delete",
          },
          success: {
            title: "Deleted Successfully",
            description: isBulkDelete
              ? `${selectedIds.length} items have been deleted.`
              : "The item has been deleted.",
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

export default Accessories;
