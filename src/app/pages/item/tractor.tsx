// src/app/pages/item/tractor.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
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
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Button, Checkbox, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Tractor {
  id: number;
  modelId: number;
   showroomVariantId: number;

  showroomVariant?: {
    variantName: string;
  };
  colourId: number;
  model?: { modelName: string };
 
  colour?: { colourName: string; colourCode: string };
  itemName: string;
  codeNo: string;
  shortName: string;
  hsnCode: string;
  taxSlab: string;
  listOfGroup: string;
  typeOfFuel: string;
  fuelCapacity: string;
  purchasePriceNoGST: number;
  purchasePriceTaxable: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

interface FormValues {
  modelId: number | string;
  showroomVariantId: number | string;
  colourId: number | string;
  itemName: string;
  codeNo: string;
  shortName: string;
  hsnCode: string;
  taxSlab: string;
  listOfGroup: string;
  typeOfFuel: string;
  fuelCapacity: string;
  purchasePriceNoGST: number | string;
  purchasePriceTaxable: number | string;
  status: "ACTIVE" | "INACTIVE";
}

interface OptionType {
  id: number;
  name: string;
  modelId?: number;
 showroomVariantId?: number;
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

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const statusFilterOptions = [
  { id: "All", name: "All Statuses" },
  { id: "ACTIVE", name: "Active" },
  { id: "INACTIVE", name: "Inactive" },
];

// ─── Main Component ──────────────────────────────────────────────────────
const Tractor = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [search, setSearch] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [filteredColours, setFilteredColours] = useState<OptionType[]>([]);
  // ─── Dynamic Data from API ─────────────────────────────────────────────
  const [models, setModels] = useState<OptionType[]>([]);
const [showroomVariants, setShowroomVariants] = useState<OptionType[]>([]);
const [filteredShowroomVariants, setFilteredShowroomVariants] =
  useState<OptionType[]>([]);
  const [colours, setColours] = useState<OptionType[]>([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [confirmState, setConfirmState] = useState<"pending" | "success" | "error">("pending");
const [confirmLoading, setConfirmLoading] = useState(false);
const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
const [isBulkDelete, setIsBulkDelete] = useState(false);
const [selectedModelFilter, setSelectedModelFilter] = useState("All");
const [selectedVariantFilter, setSelectedVariantFilter] = useState("All");
const [selectedColourFilter, setSelectedColourFilter] = useState("All");

  // ─── Form State ─────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<FormValues>({
    modelId: "",
     showroomVariantId: "",
    colourId: "",
    itemName: "",
    codeNo: "",
    shortName: "",
    hsnCode: "",
    taxSlab: "",
    listOfGroup: "",
    typeOfFuel: "",
    fuelCapacity: "",
    purchasePriceNoGST: "",
    purchasePriceTaxable: "",
    status: "ACTIVE",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Fetch Data ──────────────────────────────────────────────────────
 useEffect(() => {
  getModels();
  getShowroomVariants();
  getColours();
  getTractors();
}, []);

  const getModels = async () => {
    try {
      const response = await apiHelper.get("/model");
      let data = response?.data || response;
      if (!Array.isArray(data)) data = [];
      const mapped = data.map((item: any) => ({
        id: item.id || item._id,
        name: item.modelName || item.name || "Unknown",
      }));
      setModels(mapped);
    } catch (error) {
      console.error("Failed to fetch models:", error);
      setModels([]);
    }
  };

const getShowroomVariants = async () => {
  try {
    const response = await apiHelper.get("/showroom-variant");

    let data = response?.data || response;

    if (!Array.isArray(data)) data = [];

    const mapped = data.map((item: any) => ({
      id: item.id,
      name: item.variantName,
      modelId: item.modelId,
    }));

    setShowroomVariants(mapped);
    setFilteredShowroomVariants(mapped);
  } catch (error) {
    console.error(error);

    setShowroomVariants([]);
    setFilteredShowroomVariants([]);
  }
};
const getVariantDetails = async (id: number) => {
  try {
    const res = await apiHelper.get(`/showroom-variant/${id}`);

    console.log("Variant Response", res.data);

    // Your API returns the object directly
    const variant = res.data;

    setFormData((prev) => ({
      ...prev,
      purchasePriceNoGST: variant.purPrice,
      purchasePriceTaxable:
        variant.purPrice +
        (variant.purPrice * variant.purTaxPercent) / 100,
      taxSlab: String(variant.purTaxPercent),
    }));
  } catch (err) {
    console.log(err);
  }
};
  const getColours = async () => {
    try {
      const response = await apiHelper.get("/colours");

      let data = response?.data || response;
      if (!Array.isArray(data)) data = [];

     const mapped = data.map((item: any) => ({
  id: item.id,
  name: item.colourName,
  showroomVariantId:
    item.showroomVariantId || item.showroomVariant?.id,
}));

      setColours(mapped);
      setFilteredColours(mapped);
    } catch (error) {
      console.error("Failed to fetch colours:", error);
      setColours([]);
      setFilteredColours([]);
    }
  };

  const getTractors = async () => {
    try {
      setLoading(true);
      const response = await apiHelper.get("/tractors");
      let data = response?.data?.data || response?.data || response;
      if (!Array.isArray(data)) data = [];
      setTractors(data);
    } catch (error) {
      console.error("Failed to fetch tractors:", error);
      setTractors([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Filter Variants by Model ─────────────────────────────────────────
 useEffect(() => {
  if (formData.modelId) {
    const filtered = showroomVariants.filter(
      (v) => v.modelId === Number(formData.modelId)
    );

    setFilteredShowroomVariants(filtered);
  } else {
    setFilteredShowroomVariants(showroomVariants);
  }
}, [formData.modelId, showroomVariants]);
  useEffect(() => {
  if (formData.showroomVariantId) {
    const filtered = colours.filter(
      (c) => c.showroomVariantId === Number(formData.showroomVariantId)
    );

    setFilteredColours(filtered);
  } else {
    setFilteredColours([]);
  }
}, [formData.showroomVariantId, colours]);
  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleInputChange = (field: keyof FormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleOpenAddDrawer = () => {
    setEditId(null);
    setFormData({
      modelId: "",
       showroomVariantId: "",
      colourId: "",
      itemName: "",
      codeNo: "",
      shortName: "",
      hsnCode: "",
      taxSlab: "",
      listOfGroup: "",
      typeOfFuel: "",
      fuelCapacity: "",
      purchasePriceNoGST: "",
      purchasePriceTaxable: "",
      status: "ACTIVE",
    });
    setErrors({});
    setShowDrawer(true);
  };

  const handleOpenEditDrawer = (item: Tractor) => {
    setEditId(item.id);
    setFormData({
      modelId: item.modelId || "",
     showroomVariantId: item.showroomVariantId || "",
      colourId: item.colourId || "",
      itemName: item.itemName,
      codeNo: item.codeNo,
      shortName: item.shortName,
      hsnCode: item.hsnCode,
      taxSlab: item.taxSlab,
      listOfGroup: item.listOfGroup,
      typeOfFuel: item.typeOfFuel,
      fuelCapacity: item.fuelCapacity,
      purchasePriceNoGST: item.purchasePriceNoGST,
      purchasePriceTaxable: item.purchasePriceTaxable,
      status: item.status,
    });
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
      await Promise.all(selectedIds.map((id) => apiHelper.delete(`/tractors/${id}`)));
      toast.success(`${selectedIds.length} tractors deleted successfully!`);
      setSelectedIds([]);
      await getTractors();
      setCurrentPage(1);
      setConfirmState("success");
    } else {
      if (deleteTargetId === null) return;
      await apiHelper.delete(`/tractors/${deleteTargetId}`);
      toast.success("Tractor deleted successfully!");
      await getTractors();
      setDeleteTargetId(null);
      setConfirmState("success");
    }
    setTimeout(() => setShowConfirmModal(false), 1500);
  } catch (error: any) {
    console.error("Delete failed:", error);
    setConfirmState("error");
    toast.error(error.response?.data?.message || "Failed to delete. Please try again.");
  } finally {
    setConfirmLoading(false);
  }
};

const handleToggleStatus = async (id: number) => {
  try {
    setTractors((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "ACTIVE"
                  ? "INACTIVE"
                  : "ACTIVE",
            }
          : item,
      )
    );

    await apiHelper.patch(`/tractors/${id}/status`);
  } catch (error) {
    console.error(error);
    await getTractors();
  }
};

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.modelId) newErrors.modelId = "Model is required";
    if (!formData.showroomVariantId)
  newErrors.showroomVariantId = "Showroom Variant is required";
    if (!formData.colourId) newErrors.colourId = "Colour is required";
    if (!formData.itemName.trim()) newErrors.itemName = "Item Name is required";
    if (!formData.codeNo.trim()) newErrors.codeNo = "Code No is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
  if (!validate()) return;

  try {
    const payload = {
      modelId: Number(formData.modelId),
      showroomVariantId: Number(formData.showroomVariantId),
      colourId: Number(formData.colourId),
      itemName: formData.itemName,
      codeNo: formData.codeNo,
      shortName: formData.shortName,
      hsnCode: formData.hsnCode,
      taxSlab: formData.taxSlab,
      listOfGroup: formData.listOfGroup,
      typeOfFuel: formData.typeOfFuel,
      fuelCapacity: formData.fuelCapacity,
      purchasePriceNoGST: Number(formData.purchasePriceNoGST),
      purchasePriceTaxable: Number(formData.purchasePriceTaxable),
      status: formData.status,
    };

    if (editId) {
      await apiHelper.put(`/tractors/${editId}`, payload);
      toast.success("Tractor updated successfully!");
    } else {
      await apiHelper.post("/tractors", payload);
      toast.success("Tractor created successfully!");
    }

    await getTractors();
    setShowDrawer(false);
  } catch (error: any) {
    console.error("Save failed:", error);
    toast.error(error.response?.data?.message || "Failed to save tractor. Please try again.");
  }
};

  // ─── Filter Data ────────────────────────────────────────────────────────
 const filteredData = tractors.filter((item: any) => {
  const searchText = search.trim().toLowerCase();

  const matchesSearch =
    !searchText ||
    String(item.model?.modelName ?? "")
      .toLowerCase()
      .includes(searchText) ||
    String(item.showroomVariant?.variantName ?? "")
      .toLowerCase()
      .includes(searchText) ||
    String(item.colour?.colourName ?? "")
      .toLowerCase()
      .includes(searchText) ||
    String(item.itemName ?? "")
      .toLowerCase()
      .includes(searchText) ||
    String(item.codeNo ?? "")
      .toLowerCase()
      .includes(searchText);

  const matchesModel =
    selectedModelFilter === "All" ||
    String(item.model?.id) === String(selectedModelFilter);

  const matchesVariant =
    selectedVariantFilter === "All" ||
    String(item.showroomVariant?.id) === String(selectedVariantFilter);

  const matchesColour =
    selectedColourFilter === "All" ||
    String(item.colour?.id) === String(selectedColourFilter);

  const matchesStatus =
    selectedStatusFilter === "All" ||
    String(item.status) === String(selectedStatusFilter);

  return (
    matchesSearch &&
    matchesModel &&
    matchesVariant &&
    matchesColour &&
    matchesStatus
  );
});
  const modelOptions = [
  { id: "All", name: "All Models" },

  ...Array.from(
    new Map(
      tractors
        .filter((item: any) => item.model?.id)
        .map((item: any) => [
          String(item.model.id),
          {
            id: String(item.model.id),
            name: item.model.modelName,
          },
        ]),
    ).values(),
  ),
];
const variantOptions = [
  { id: "All", name: "All Variants" },

  ...Array.from(
    new Map(
      tractors
        .filter((item: any) => {
          return (
            selectedModelFilter === "All" ||
            String(item.model?.id) === String(selectedModelFilter)
          );
        })
        .filter((item: any) => item.showroomVariant?.id)
        .map((item: any) => [
          String(item.showroomVariant.id),
          {
            id: String(item.showroomVariant.id),
            name: item.showroomVariant.variantName,
          },
        ]),
    ).values(),
  ),
];
const colourOptions = [
  { id: "All", name: "All Colours" },

  ...Array.from(
    new Map(
      tractors
        .filter((item: any) => {
          const modelMatch =
            selectedModelFilter === "All" ||
            String(item.model?.id) === String(selectedModelFilter);

          const variantMatch =
            selectedVariantFilter === "All" ||
            String(item.variant?.id) === String(selectedVariantFilter);

          return modelMatch && variantMatch;
        })
        .filter((item: any) => item.colour?.id)
        .map((item: any) => [
          String(item.colour.id),
          {
            id: String(item.colour.id),
            name: item.colour.colourName,
          },
        ]),
    ).values(),
  ),
];
  const groupOptions = [
    { id: "TRACTOR", name: "Tractor" },
    { id: "IMPLEMENT", name: "Implement" },
    { id: "HARVESTER", name: "Harvester" },
    { id: "POWER_TILLER", name: "Power Tiller" },
  ];

  const fuelOptions = [
    { id: "DIESEL", name: "Diesel" },
    { id: "PETROL", name: "Petrol" },
    { id: "CNG", name: "CNG" },
    { id: "ELECTRIC", name: "Electric" },
  ];
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

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Tractor List
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all tractors from here
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

  {/* Right side - Add Tractor button */}
  <Button
    color="primary"
    onClick={handleOpenAddDrawer}
    className="whitespace-nowrap"
  >
    <PlusIcon className="mr-1.5 size-4.5" />
    Add Tractor
  </Button>
</div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search tractor, model or variant..."
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
             <div>
    <label className="mb-1 block text-sm font-medium">
      Model
    </label>

    <Combobox
      data={modelOptions}
      searchFields={["name"]}
      value={
        modelOptions.find(
          (item) => item.id === selectedModelFilter,
        ) || modelOptions[0]
      }
      onChange={(option: any) => {
        const value = option?.id ?? "All";

        setSelectedModelFilter(value);

        // Reset dependent filters
        setSelectedVariantFilter("All");
        setSelectedColourFilter("All");

        setCurrentPage(1);
      }}
      displayField="name"
    />
  </div>
   <div>
    <label className="mb-1 block text-sm font-medium">
      Variant
    </label>

    <Combobox
      data={variantOptions}
      searchFields={["name"]}
      value={
        variantOptions.find(
          (item) => item.id === selectedVariantFilter,
        ) || variantOptions[0]
      }
      onChange={(option: any) => {
        const value = option?.id ?? "All";

        setSelectedVariantFilter(value);

        // Reset colour
        setSelectedColourFilter("All");

        setCurrentPage(1);
      }}
      displayField="name"
    />
  </div>

   <div>
    <label className="mb-1 block text-sm font-medium">
      Colour
    </label>

    <Combobox
      data={colourOptions}
      searchFields={["name"]}
      value={
        colourOptions.find(
          (item) => item.id === selectedColourFilter,
        ) || colourOptions[0]
      }
      onChange={(option: any) => {
        setSelectedColourFilter(option?.id ?? "All");
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
            className="w-full min-w-225 text-left [&_.table-th]:font-semibold"
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
                  Model
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Variant
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Colour
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Item Name
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Code
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Status
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Created
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
                    <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                      {item.model?.modelName}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                   {item.showroomVariant?.variantName}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 rounded-full border"
                          style={{ backgroundColor: item.colour?.colourCode }}
                        />
                        {item.colour?.colourName}
                      </span>
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.itemName}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.codeNo}
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
                    <Td className="py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(item.createdAt)}
                    </Td>
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
                            className="dark:bg-dark-800 dark:ring-dark-500 dark:border-dark-500 z-100 w-36 rounded-lg border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 [--anchor-gap:4px] focus:outline-none"
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
                    colSpan={10}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No tractors found
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
                      className="dark:bg-dark-700 dark:border-dark-600 z-200 w-20 space-y-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-xl ring-1 ring-black/5 [--anchor-gap:6px] focus:outline-none"
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
                    {editId !== null ? "Edit Tractor" : "Add Tractor"}
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    {/* Select Model */}
                    {/* Select Model */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Select Model <span className="text-red-500">*</span>
                      </label>

                      <Combobox
                        data={models}
                        displayField="name"
                        value={
                          models.find(
                            (m) => m.id === Number(formData.modelId),
                          ) || null
                        }
                        onChange={(val: OptionType | null) => {
                          setFormData((prev) => ({
                            ...prev,
                            modelId: val?.id || "",
                            showroomVariantId: "", // reset variant
                            colourId: "", // reset colour
                          }));
                        }}
                        placeholder="Select Model"
                        searchFields={["name"]}
                      />

                      {errors.modelId && (
                        <span className="text-xs text-orange-500">
                          {errors.modelId}
                        </span>
                      )}
                    </div>

                    {/* Select Variant */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Select Variant <span className="text-red-500">*</span>
                      </label>

                      <Combobox
                        data={filteredShowroomVariants}
                        displayField="name"
                       value={
  filteredShowroomVariants.find(
    (v) => v.id === Number(formData.showroomVariantId)
  ) || null
}
                       onChange={async (val: OptionType | null) => {
  setFormData((prev) => ({
    ...prev,
    showroomVariantId: val?.id || "",
    colourId: "",
  }));

  if (val?.id) {
    await getVariantDetails(val.id);
  }
}}
                        placeholder="Select Variant"
                        searchFields={["name"]}
                        disabled={!formData.modelId}
                      />

                      {errors.showroomVariantId && (
                        <span className="text-xs text-orange-500">
                          {errors.showroomVariantId}
                        </span>
                      )}
                    </div>

                    {/* Select Colour */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Select Colour <span className="text-red-500">*</span>
                      </label>

                      <Combobox
                        data={filteredColours} // use filtered colours
                        displayField="name"
                        value={
                          filteredColours.find(
                            (c) => c.id === Number(formData.colourId),
                          ) || null
                        }
                        onChange={(val: OptionType | null) => {
                          handleInputChange("colourId", val?.id || "");
                        }}
                        placeholder="Select Colour"
                        searchFields={["name"]}
                        disabled={!formData.showroomVariantId} // disable until variant selected
                      />

                      {errors.colourId && (
                        <span className="text-xs text-orange-500">
                          {errors.colourId}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Input Grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Item Name"
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
                        Code No <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Code No"
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
                        placeholder="Short Name"
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
                        placeholder="HSN Code"
                        value={formData.hsnCode}
                        onChange={(e) =>
                          handleInputChange("hsnCode", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Tax Slab
                      </label>
                      <Input
                        type="text"
                        placeholder="Tax Slab"
                        value={formData.taxSlab}
                        onChange={(e) =>
                          handleInputChange("taxSlab", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        List of Group
                      </label>
                      <Listbox
                        data={groupOptions}
                        displayField="name"
                        value={
                          groupOptions.find(
                            (g) => g.id === formData.listOfGroup,
                          ) || null
                        }
                        onChange={(val: any) =>
                          handleInputChange("listOfGroup", val?.id || "")
                        }
                        placeholder="Select Group"
                      />
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Type of Fuel
                      </label>
                      <Listbox
                        data={fuelOptions}
                        displayField="name"
                        value={
                          fuelOptions.find(
                            (f) => f.id === formData.typeOfFuel,
                          ) || null
                        }
                        onChange={(val: any) =>
                          handleInputChange("typeOfFuel", val?.id || "")
                        }
                        placeholder="Select Fuel Type"
                      />
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Fuel Capacity
                      </label>
                      <Input
                        type="text"
                        placeholder="Fuel Capacity"
                        value={formData.fuelCapacity}
                        onChange={(e) =>
                          handleInputChange("fuelCapacity", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Purchase Price (Without GST)
                      </label>
                      <Input
                        type="number"
                        placeholder="Purchase Price (Without GST)"
                        value={formData.purchasePriceNoGST}
                        onChange={(e) =>
                          handleInputChange(
                            "purchasePriceNoGST",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Purchase Price (Taxable)
                      </label>
                      <Input
                        type="number"
                        placeholder="Purchase Price (Taxable)"
                        value={formData.purchasePriceTaxable}
                        onChange={(e) =>
                          handleInputChange(
                            "purchasePriceTaxable",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <Combobox
                      data={statusOptions}
                      displayField="label"
                     value={statusOptions.find(opt => opt.value === formData.status) as { label: string; value: "ACTIVE" | "INACTIVE" } | null || null}

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
      title: isBulkDelete ? "Delete Selected Tractors?" : "Are you sure?",
      description: isBulkDelete 
        ? `Are you sure you want to delete ${selectedIds.length} selected tractors? This action cannot be undone.`
        : "Are you sure you want to delete this tractor? Once deleted, it cannot be restored.",
      actionText: isBulkDelete ? "Delete All" : "Delete",
    },
    success: {
      title: "Deleted Successfully",
      description: isBulkDelete 
        ? `${selectedIds.length} tractors have been deleted.`
        : "The tractor has been deleted.",
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

export default Tractor;
