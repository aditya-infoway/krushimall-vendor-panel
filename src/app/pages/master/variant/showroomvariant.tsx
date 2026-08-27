// Import Dependencies
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
import { Fragment, useState, useEffect, useRef } from "react";
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
import { useForm, useWatch ,Controller } from "react-hook-form";
import {
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  FunnelIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { Combobox } from "@/components/shared/form/Combobox";
// Local UI Imports
import { Button, Checkbox, Input } from "@/components/ui";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Listbox } from "@/components/shared/form/StyledListbox";

// ─── Types ───────────────────────────────────────────────────────────
type Accessory = {
  accessoryId?: number;
  name: string;
  qty: number;
  price: number;
  taxPercent: number;
  totalPrice: number;
};

type FormValues = {
  modelId: number | string;
  modelName: string;
  variantId: number | string;

  variantName: string;
  purPrice: string;
  purTaxPercent: string;
  exShowroomPrice: string;
  exShowroomTaxPercent: string;
  insurance: string;
  insuranceTaxPercent: string;
  rtoCharge: string;
  rtoTaxType: string;
  rtoTaxPercent: string;
  salesPrice: string;
  status: string;
};

// ─── Constants ────────────────────────────────────────────────────────
const taxOptions = [
  { id: "0", name: "0%" },
  { id: "5", name: "5%" },
  { id: "12", name: "12%" },
  { id: "18", name: "18%" },
  { id: "28", name: "28%" },
];

const rtoTaxTypes = [
  { id: "Agriculture", name: "Agriculture (1%)" },
  { id: "Commercial", name: "Commercial (10%)" },
];

const RTO_TAX_MAP: Record<string, string> = {
  Agriculture: "1",
  Commercial: "10",
};

const accessoryOptions = [
  "Alloy Wheels",
  "Sunroof",
  "Leather Seats",
  "Navigation System",
  "Premium Audio",
  "Parking Sensors",
  "Rear Camera",
  "Ambient Lighting",
  "Keyless Entry",
  "Push Start",
  "Floor Mats",
  "Roof Rails",
  "Tow Bar",
  "Running Boards",
  "Spoiler",
];

const statusOptions = [
  { id: "ACTIVE", name: "On" },
  { id: "INACTIVE", name: "Off" },
];

// ─── Helper: Calculate price with tax ──────────────────────────────────
const calcWithTax = (price: number, taxPercent: number) =>
  price + (price * taxPercent) / 100;

// ─── Custom Combobox Component ──────────────────────────────────────
const AccessoryCombobox = ({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  options: any[];
  placeholder?: string;
  error?: string;
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);

    if (val.trim()) {
      const filtered = options.filter((opt) =>
        opt.itemName.toLowerCase().includes(val.toLowerCase()),
      );
      setFilteredOptions(filtered);
      setShowDropdown(true);
    } else {
      setFilteredOptions(options);
      setShowDropdown(true);
    }
  };

  const handleOptionSelect = (option: string) => {
    setInputValue(option);
    onChange(option);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setFilteredOptions(options);
    setShowDropdown(true);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder || "Type or select accessory..."}
        className={`dark:border-dark-500 dark:bg-dark-800 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-gray-300"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {showDropdown && filteredOptions.length > 0 && (
        <div className="dark:border-dark-500 dark:bg-dark-700 absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filteredOptions.map((option) => (
            <div
              key={option.id}
              className="dark:hover:bg-dark-600 cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-gray-100"
              onClick={() => handleOptionSelect(option.itemName)}
            >
              {option.itemName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ShowroomVariantPage() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [models, setModels] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [selectedModelFilter, setSelectedModelFilter] = useState("All");
  const [selectedVariantFilter, setSelectedVariantFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [accessoryOptions, setAccessoryOptions] = useState<any[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([
    { name: "", qty: 0, price: 0, taxPercent: 0, totalPrice: 0 },
  ]);
  const [accessoryErrors, setAccessoryErrors] = useState<{
    [key: number]: string;
  }>({});

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmState, setConfirmState] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const modelOptions = models.map((m) => ({ id: String(m.id), name: m.name }));
  const [variantOptions, setVariantOptions] = useState<
    {
      id: number;
      name: string;
      modelId: number;
    }[]
  >([]);
  
  const getCreateVariants = async () => {
    try {
      const response = await apiHelper.get("/variant");

      const data = response?.data || response;

      const activeVariants = (Array.isArray(data) ? data : [])
        .filter((item: any) => item.status === "ACTIVE")
        .map((item: any) => ({
          id: Number(item.id),
          name: item.variantName,
          modelId: Number(item.modelId),
        }));

      setVariantOptions(activeVariants);
    } catch (error) {
      setVariantOptions([]);
    }
  };
  const getVariants = async () => {
    try {
      setLoading(true);
      const response = await apiHelper.get("/showroom-variant");
      let data = response?.data || response;
      if (!Array.isArray(data)) data = [];
      setVariants(data);
      console.log("", data);
      console.log("Accessories:", accessories);
    } catch (error) {
      console.error(error);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const getModels = async () => {
    try {
      const response = await apiHelper.get("/model");
      const data = response?.data || response;
      setModels(
        (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id || item._id,
          name: item.modelName || item.name,
        })),
      );
    } catch (error) {
      setModels([]);
    }
  };
  const getAccessories = async () => {
    try {
      const res = await apiHelper.get("/accessories");

      const data = res.data || [];

      console.log("Accessories API:", data);

      setAccessoryOptions(data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getVariants();
    getCreateVariants();
    getModels();
    getAccessories();
  }, []);
  // ─── Validation Rules ──────────────────────────────────────────────
  const validationRules = {
    modelId: {
      required: "Model is required",
    },
    variantName: {
      required: "Variant name is required",
      minLength: {
        value: 2,
        message: "Variant name must be at least 2 characters",
      },
    },
    purPrice: {
      required: "Purchase price is required",
      min: {
        value: 0,
        message: "Price must be greater than 0",
      },
    },
    exShowroomPrice: {
      required: "Ex-showroom price is required",
      min: {
        value: 0,
        message: "Price must be greater than 0",
      },
    },
    insurance: {
      required: "Insurance amount is required",
      min: {
        value: 0,
        message: "Insurance must be greater than 0",
      },
    },
    rtoCharge: {
      required: "RTO charge is required",
      min: {
        value: 0,
        message: "RTO charge must be greater than 0",
      },
    },
    purTaxPercent: {
      required: "Tax percentage is required",
    },
    exShowroomTaxPercent: {
      required: "Tax percentage is required",
    },
    insuranceTaxPercent: {
      required: "Tax percentage is required",
    },
  };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
    trigger,
  } = useForm<FormValues>({
    defaultValues: {
      modelId: "",
      modelName: "",
      variantId: "",
      variantName: "",
      purPrice: "",
      purTaxPercent: "18",
      exShowroomPrice: "",
      exShowroomTaxPercent: "18",
      insurance: "",
      insuranceTaxPercent: "18",
      rtoCharge: "",
      rtoTaxType: "Agriculture",
      rtoTaxPercent: "1",
      salesPrice: "",
      status: "ACTIVE",
    },
    mode: "onChange",
  });
  const formVariantValue = useWatch({
    control,
    name: "variantName",
  });
  const selectedVariantId = useWatch({
    control,
    name: "variantId",
  });
  // All useWatch hooks at the top level
  const formModelValue = useWatch({ control, name: "modelName" });
  const selectedModelId = useWatch({
    control,
    name: "modelId",
  });
  const formRtoTaxType = useWatch({ control, name: "rtoTaxType" });
  const formStatus = useWatch({ control, name: "status" });
  const purPrice = useWatch({ control, name: "purPrice" });
  const purTaxPercent = useWatch({ control, name: "purTaxPercent" });
  const exShowroomPrice = useWatch({ control, name: "exShowroomPrice" });
  const exShowroomTaxPercent = useWatch({
    control,
    name: "exShowroomTaxPercent",
  });
  const insurance = useWatch({ control, name: "insurance" });
  const insuranceTaxPercent = useWatch({
    control,
    name: "insuranceTaxPercent",
  });
  const rtoCharge = useWatch({ control, name: "rtoCharge" });
  const rtoTaxPercent = useWatch({ control, name: "rtoTaxPercent" });

  // Find current tax values for Listbox
  const currentPurTax =
    taxOptions.find((o) => o.id === purTaxPercent) || taxOptions[3];
  const currentExTax =
    taxOptions.find((o) => o.id === exShowroomTaxPercent) || taxOptions[3];
  const currentInsTax =
    taxOptions.find((o) => o.id === insuranceTaxPercent) || taxOptions[3];
  const displayRtoTotal = (
    Number(rtoCharge || 0) +
    (Number(rtoCharge || 0) * Number(rtoTaxPercent || 0)) / 100
  ).toFixed(2);
  // Auto-calculate Sales Price
  useEffect(() => {
    const pur = Number(purPrice || 0);
    const purTax = Number(purTaxPercent || 0);
    const ex = Number(exShowroomPrice || 0);
    const exTax = Number(exShowroomTaxPercent || 0);
    const ins = Number(insurance || 0);
    const insTax = Number(insuranceTaxPercent || 0);
    const rto = Number(rtoCharge || 0);
    const rtoTax = Number(rtoTaxPercent || 0);

    const purTotal = calcWithTax(pur, purTax);
    const exTotal = calcWithTax(ex, exTax);
    const insTotal = calcWithTax(ins, insTax);
    const rtoTotal = calcWithTax(rto, rtoTax);
    const accTotal = accessories.reduce(
      (sum, a) => sum + (a.totalPrice || 0),
      0,
    );

    const total = purTotal + exTotal + insTotal + rtoTotal + accTotal;
    setValue("salesPrice", total > 0 ? total.toFixed(2) : "");
  }, [
    purPrice,
    purTaxPercent,
    exShowroomPrice,
    exShowroomTaxPercent,
    insurance,
    insuranceTaxPercent,
    rtoCharge,
    rtoTaxPercent,
    accessories,
    setValue,
  ]);
  const filteredVariantOptions = variantOptions
    .filter((variant) => Number(variant.modelId) === Number(selectedModelId))
    .map((variant) => ({
      id: String(variant.id),
      name: variant.name,
    }));
  const handleRtoTaxTypeChange = (type: string) => {
    setValue("rtoTaxType", type);
    setValue("rtoTaxPercent", RTO_TAX_MAP[type] ?? "1");
  };

  const handleOpenAddDrawer = () => {
    setEditId(null);

    const firstModel = models[0] || {
      id: "",
      name: "",
    };

    setAccessories([
      {
        name: "",
        qty: 0,
        price: 0,
        taxPercent: 0,
        totalPrice: 0,
      },
    ]);

    setAccessoryErrors({});

    reset({
      modelId: "",
      modelName: "",
      variantId: "",
      variantName: "",
      purPrice: "",
      purTaxPercent: "18",
      exShowroomPrice: "",
      exShowroomTaxPercent: "18",
      insurance: "",
      insuranceTaxPercent: "18",
      rtoCharge: "",
      rtoTaxType: "Agriculture",
      rtoTaxPercent: "1",
      salesPrice: "",
      status: "ACTIVE",
    });

    setShowDrawer(true);
  };

  const handleOpenEditDrawer = (item: any) => {
    setEditId(item.id);

    setAccessories(
      item.accessories?.length
        ? item.accessories.map((acc: any) => ({
            accessoryId: acc.accessoryId,
            name: acc.accessory?.itemName || "",
            qty: Number(acc.qty) || 0,

            price: Number(acc.price) || 0,
            taxPercent: Number(acc.taxPercent) || 0,
            totalPrice: Number(acc.totalPrice) || 0,
          }))
        : [{ name: "", price: 0, taxPercent: 0, totalPrice: 0 }],
    );

    setAccessoryErrors({});

    reset({
      modelId: item.modelId,
      modelName: item.model || "",
      variantId: item.variantId || "",

      variantName: item.variantName || "",
      purPrice: String(item.purPrice || ""),
      purTaxPercent: String(item.purTaxPercent || "18"),
      exShowroomPrice: String(item.exShowroomPrice || ""),
      exShowroomTaxPercent: String(item.exShowroomTaxPercent || "18"),
      insurance: String(item.insurance || ""),
      insuranceTaxPercent: String(item.insuranceTaxPercent || "18"),
      rtoCharge: String(item.rtoCharge || ""),
      rtoTaxType: item.rtoTaxType || "Agriculture",
      rtoTaxPercent: String(item.rtoTaxPercent || "1"),
      salesPrice: String(item.salesPrice || ""),
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

  const addAccessory = () => {
    setAccessories([
      ...accessories,
      { name: "", qty: 0, price: 0, taxPercent: 0, totalPrice: 0 },
    ]);
    // Clear error for new accessory
    setAccessoryErrors({});
  };

  const performDelete = async () => {
    setConfirmLoading(true);
    try {
      if (isBulkDelete) {
        await Promise.all(
          selectedIds.map((id) => apiHelper.delete(`/showroom-variant/${id}`)),
        );
        toast.success(
          `${selectedIds.length} showroom variants deleted successfully!`,
        );
        await getVariants();
        setSelectedIds([]);
        setCurrentPage(1);
        setConfirmState("success");
      } else {
        if (deleteTargetId === null) return;
        await apiHelper.delete(`/showroom-variant/${deleteTargetId}`);
        toast.success("Showroom variant deleted successfully!");
        await getVariants();
        setSelectedIds((prev) => prev.filter((id) => id !== deleteTargetId));
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

  const removeAccessory = (index: number) => {
    if (accessories.length === 1) {
      setAccessories([
        { name: "", qty: 0, price: 0, taxPercent: 0, totalPrice: 0 },
      ]);
    } else {
      setAccessories(accessories.filter((_, i) => i !== index));
    }
    // Clear error for removed accessory
    const newErrors = { ...accessoryErrors };
    delete newErrors[index];
    setAccessoryErrors(newErrors);
  };
  const calculateAccessoryTotal = (
    price: number,
    qty: number,
    taxPercent: number,
  ) => {
    const subTotal = price * qty;
    const taxAmount = (subTotal * taxPercent) / 100;

    return subTotal + taxAmount;
  };
  const updateAccessory = (
    index: number,
    field: keyof Accessory,
    value: any,
  ) => {
    const updated = [...accessories];

    updated[index] = {
      ...updated[index],
      [field]:
        field === "price" || field === "taxPercent" || field === "qty"
          ? Number(value)
          : value,
    };

    updated[index].totalPrice = calculateAccessoryTotal(
      Number(updated[index].price || 0),
      Number(updated[index].qty || 0),
      Number(updated[index].taxPercent || 0),
    );

    setAccessories(updated);
  };

  // ─── Form Submit with Validation ───────────────────────────────────

  const onFormSubmit = async (data: FormValues) => {
    // Validate accessories - make name required if row has any data
    const accessoryErrors: { [key: number]: string } = {};
    let hasAccessoryError = false;

    accessories.forEach((acc, index) => {
      const hasName = acc.name.trim() !== "";
      const hasPrice = acc.price > 0;
      const hasTax = acc.taxPercent > 0;

      if (!hasName && (hasPrice || hasTax)) {
        accessoryErrors[index] = "Accessory name is required";
        hasAccessoryError = true;
      }
    });

    if (hasAccessoryError) {
      setAccessoryErrors(accessoryErrors);
    } else {
      setAccessoryErrors({});
    }

    const isValid = await trigger();

    if (!isValid || hasAccessoryError) {
      if (hasAccessoryError) {
        const firstErrorIndex = Object.keys(accessoryErrors)[0];
        if (firstErrorIndex) {
          const element = document.getElementById(
            `accessory-${firstErrorIndex}`,
          );
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
      return;
    }

    try {
      const payload = {
        modelId: Number(data.modelId),
        variantId: Number(data.variantId),

        variantName: data.variantName,
        purPrice: Number(data.purPrice),
        purTaxPercent: Number(data.purTaxPercent),
        exShowroomPrice: Number(data.exShowroomPrice),
        exShowroomTaxPercent: Number(data.exShowroomTaxPercent),
        insurance: Number(data.insurance),
        insuranceTaxPercent: Number(data.insuranceTaxPercent),
        rtoCharge: Number(data.rtoCharge),
        rtoTaxType: data.rtoTaxType,
        rtoTaxPercent: Number(data.rtoTaxPercent),
        accessories: accessories.filter((a) => a.name.trim() !== ""),
        salesPrice: Number(data.salesPrice),
        status: data.status,
      };

      if (editId !== null) {
        await apiHelper.put(`/showroom-variant/${editId}`, payload);
        toast.success("Showroom variant updated successfully!");
      } else {
        await apiHelper.post("/showroom-variant", payload);
        toast.success("Showroom variant created successfully!");
      }

      await getVariants();
      setShowDrawer(false);
      reset();
      setAccessoryErrors({});
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save variant. Please try again.",
      );
    }
  };

  useEffect(() => {
    console.log(errors);
  }, [errors]);

 const filteredData = variants.filter((item) => {
  const matchesSearch =
    item.variantName?.toLowerCase().includes(search.toLowerCase()) ||
    item.model?.toLowerCase().includes(search.toLowerCase());
  const matchesModel =
    selectedModelFilter === "All" || item.model === selectedModelFilter;
  const matchesVariant =
    selectedVariantFilter === "All" ||
    item.variantName === selectedVariantFilter; // NEW
  return matchesSearch && matchesModel && matchesVariant;
});

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const modelFilterOptions = [
    { id: "All", name: "All Models" },
    ...models.map((m) => ({ id: m.name, name: m.name })),
  ];
const variantFilterOptions = [
  { id: "All", name: "All Variants" },
  ...Array.from(
    new Set(
      variants
        .filter(
          (v) =>
            selectedModelFilter === "All" || v.model === selectedModelFilter,
        )
        .map((v) => v.variantName)
        .filter(Boolean),
    ),
  ).map((name) => ({ id: name, name })),
];
  const isAllPageSelected =
    currentItems.length > 0 &&
    currentItems.every((item) => selectedIds.includes(item.id));

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Showroom Variant List
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage showroom pricing and variants
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilterBar(!showFilterBar)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${showFilterBar ? "bg-primary-50 border-primary-200 text-primary-600 dark:bg-dark-600 dark:border-dark-500 dark:text-white" : "dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            <FunnelIcon className="size-4.5" /> Filter
          </button>
          <Button color="primary" onClick={handleOpenAddDrawer}>
            <PlusIcon className="mr-1 size-4.5" /> Add Showroom Variant
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search variant..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>

      {/* Filters - Only Model filter */}
      {/* Filters - Only Model filter */}
      {showFilterBar && (
  <div className="dark:bg-dark-700 dark:border-dark-500 rounded-xl border border-gray-200 bg-white p-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
          Filter by Model
        </span>
        <Listbox
          data={modelFilterOptions}
          value={
            modelFilterOptions.find((o) => o.id === selectedModelFilter) ||
            modelFilterOptions[0]
          }
          onChange={(opt: any) => {
            setSelectedModelFilter(opt.id);
            setSelectedVariantFilter("All"); // reset variant when model changes
            setCurrentPage(1);
          }}
          displayField="name"
        />
      </div>

      {/* NEW: Variant filter, dependent on selected model */}
      <div className="flex flex-col gap-1">
        <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
          Filter by Variant
        </span>
        <Listbox
          data={variantFilterOptions}
          value={
            variantFilterOptions.find(
              (o) => o.id === selectedVariantFilter,
            ) || variantFilterOptions[0]
          }
          onChange={(opt: any) => {
            setSelectedVariantFilter(opt.id);
            setCurrentPage(1);
          }}
          displayField="name"
        />
      </div>
    </div>
  </div>
)}

      {/* Table - Removed Status column */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table
            hoverable
            className="w-full min-w-[900px] text-left [&_.table-th]:font-semibold"
          >
            <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
              <Tr>
                <Th className="w-12 py-3.5 text-center">
                  <Checkbox
                    className="size-4.5"
                    checked={isAllPageSelected}
                    onChange={(e: any) => {
                      if (e.target.checked)
                        setSelectedIds(currentItems.map((i) => i.id));
                      else setSelectedIds([]);
                    }}
                  />
                </Th>
                <Th className="w-16 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  S.No
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Variant
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Model
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Pur Price
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Ex-Showroom
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Insurance
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  RTO
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Sales Price
                </Th>
                <Th className="w-20 py-3.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </Th>
              </Tr>
            </THead>
            <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
              {currentItems.map((item, index) => (
                <Tr
                  key={item.id}
                  className={`${selectedIds.includes(item.id) ? "dark:bg-dark-600/30 bg-gray-50/50" : ""} dark:hover:bg-dark-700/40 transition-colors hover:bg-gray-50/30`}
                >
                  <Td className="py-4 text-center">
                    <Checkbox
                      className="size-4.5"
                      checked={selectedIds.includes(item.id)}
                      onChange={() =>
                        setSelectedIds((prev) =>
                          prev.includes(item.id)
                            ? prev.filter((id) => id !== item.id)
                            : [...prev, item.id],
                        )
                      }
                    />
                  </Td>
                  <Td className="py-4 font-medium text-gray-500">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </Td>
                  <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                    {item.variantName}
                  </Td>
                  <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                    {item.model}
                  </Td>
                  <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                    ₹{item.purPrice} ({item.purTaxPercent}%)
                  </Td>
                  <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                    ₹{item.exShowroomPrice} ({item.exShowroomTaxPercent}%)
                  </Td>
                  <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                    ₹{item.insurance} ({item.insuranceTaxPercent}%)
                  </Td>
                  <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                    ₹{item.rtoCharge} ({item.rtoTaxType} {item.rtoTaxPercent}%)
                  </Td>
                  <Td className="text-primary-600 py-4 font-semibold">
                    ₹{item.salesPrice}
                  </Td>
                  <Td className="py-4 text-center">
                    <Menu as="div" className="relative inline-block text-left">
                      <MenuButton className="dark:hover:bg-dark-600 inline-flex size-8 items-center justify-center rounded-lg hover:bg-gray-100">
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
                          className="dark:bg-dark-800 dark:ring-dark-500 dark:border-dark-500 z-[100] w-36 rounded-lg border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 [--anchor-gap:4px]"
                        >
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => handleOpenEditDrawer(item)}
                                className={`${active ? "dark:bg-dark-600 text-primary-600 bg-gray-50 dark:text-white" : "dark:text-dark-200 text-gray-700"} flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                              >
                                <PencilSquareIcon className="size-4" /> Edit
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className={`${active ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "dark:text-dark-200 text-gray-700"} flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
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
              ))}
              {currentItems.length === 0 && (
                <Tr>
                  <Td colSpan={10} className="py-12 text-center text-gray-400">
                    No variants found
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>
        {totalItems > 0 && (
          <div className="dark:border-dark-700 dark:bg-dark-800 flex items-center justify-center rounded-b-xl border-t border-gray-200 bg-white px-4 py-3">
            <div className="flex space-x-2">
              <Button
                variant="outlined"
                className="px-3 py-1 text-sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "filled" : "outlined"}
                    color={page === currentPage ? "primary" : "neutral"}
                    className="px-3 py-1 text-sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ),
              )}
              <Button
                variant="outlined"
                className="px-3 py-1 text-sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 fixed right-6 bottom-6 z-50 duration-200">
          <div className="dark:border-dark-500 dark:bg-dark-700/95 flex items-center gap-4 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur">
            <span className="text-sm font-medium">
              Selected {selectedIds.length} items
            </span>
            <Button variant="filled" color="error" onClick={handleBulkDelete}>
              <TrashIcon className="mr-1 size-4" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Drawer */}
      <Transition appear show={showDrawer} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[100]"
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
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
              <form
                onSubmit={handleSubmit(onFormSubmit)}
                className="flex h-full flex-col"
              >
                <div className="dark:border-dark-600 flex items-center justify-between border-b px-5 py-4">
                  <h2 className="text-lg font-semibold">
                    {editId ? "Edit Variant" : "Add Variant"}
                  </h2>
                  <Button
                    onClick={() => setShowDrawer(false)}
                    variant="flat"
                    isIcon
                    className="size-8 rounded-full"
                    type="button"
                  >
                    <XMarkIcon className="size-5" />
                  </Button>
                </div>
                <div className="grow space-y-5 overflow-y-auto p-5">
                  {/* Model */}
                  <div className="w-full">
                    <span className="mb-2 block text-sm font-medium">
                      Model
                    </span>
                    <div className="w-full">
                     <Controller
  name="modelId"
  control={control}
  rules={{
    validate: (value) =>
      value && Number(value) > 0 || "Model is required",
  }}
  render={({ field, fieldState }) => (
    <Combobox
      data={modelOptions}
      value={
        modelOptions.find(
          (option) => String(option.id) === String(field.value)
        ) || null
      }
      error={fieldState.error?.message}
      displayField="name"
      placeholder="Search or select model"
      onChange={(option: any) => {
        if (!option) return;

        field.onChange(option.id);

        setValue("modelName", option.name);

        setValue("variantId", "");
        setValue("variantName", "");
      }}
    />
  )}
/>
                    
                    </div>
                  </div>

                  {/* Variant Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Variant Name
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <Controller
  name="variantId"
  control={control}
  rules={{
    validate: (value) =>
      value && Number(value) > 0 || "Variant is required",
  }}
  render={({ field, fieldState }) => (
    <Combobox
      data={filteredVariantOptions}
      value={
        filteredVariantOptions.find(
          (option) => String(option.id) === String(field.value)
        ) || null
      }
      error={fieldState.error?.message}
      displayField="name"
      placeholder={
        selectedModelId
          ? "Search or select variant"
          : "Select model first"
      }
      onChange={(option: any) => {
        if (!option) return;

        field.onChange(option.id);

        setValue("variantName", option.name);
      }}
    />
  )}
/>
                 
                  </div>
                  {/* Pur Price + Tax */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Pur Price (₹)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...register("purPrice", validationRules.purPrice)}
                        error={errors?.purPrice?.message}
                      />
                    </div>
                    <div>
                      <span className="mb-2 block text-sm font-medium">
                        Tax %
                      </span>
                      <Listbox
                        data={taxOptions}
                        value={currentPurTax}
                        onChange={(opt: any) => {
                          setValue("purTaxPercent", opt.id);
                          trigger("purTaxPercent");
                        }}
                        displayField="name"
                      />
                      {errors.purTaxPercent && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.purTaxPercent.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ex-Showroom + Tax */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Ex-Showroom (₹)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...register(
                          "exShowroomPrice",
                          validationRules.exShowroomPrice,
                        )}
                        error={errors?.exShowroomPrice?.message}
                      />
                    </div>
                    <div>
                      <span className="mb-2 block text-sm font-medium">
                        Tax %
                      </span>
                      <Listbox
                        data={taxOptions}
                        value={currentExTax}
                        onChange={(opt: any) => {
                          setValue("exShowroomTaxPercent", opt.id);
                          trigger("exShowroomTaxPercent");
                        }}
                        displayField="name"
                      />
                      {errors.exShowroomTaxPercent && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.exShowroomTaxPercent.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Insurance + Tax */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Insurance (₹)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...register("insurance", validationRules.insurance)}
                        error={errors?.insurance?.message}
                      />
                    </div>
                    <div>
                      <span className="mb-2 block text-sm font-medium">
                        Tax %
                      </span>
                      <Listbox
                        data={taxOptions}
                        value={currentInsTax}
                        onChange={(opt: any) => {
                          setValue("insuranceTaxPercent", opt.id);
                          trigger("insuranceTaxPercent");
                        }}
                        displayField="name"
                      />
                      {errors.insuranceTaxPercent && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.insuranceTaxPercent.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RTO Section */}
                  <div className="dark:border-dark-600 space-y-4 rounded-lg border border-gray-200 p-4">
                    {/* RTO Tax Type */}
                    <div>
                      <span className="mb-2 block text-sm font-medium">
                        RTO Tax Type
                      </span>
                      <div className="flex gap-6">
                        {rtoTaxTypes.map((t) => (
                          <label
                            key={t.id}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="radio"
                              name="rtoTaxType"
                              value={t.id}
                              checked={formRtoTaxType === t.id}
                              onChange={() => handleRtoTaxTypeChange(t.id)}
                              className="accent-primary-600 size-4"
                            />{" "}
                            {t.name}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* RTO Charge and Tax % in same row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          RTO Charge (₹)
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...register("rtoCharge", validationRules.rtoCharge)}
                          error={errors?.rtoCharge?.message}
                        />
                      </div>
                      <div>
                        <span className="mb-2 block text-sm font-medium">
                          Tax %
                        </span>
                        <div className="dark:border-dark-600 dark:bg-dark-800 dark:text-dark-200 flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700">
                          {formRtoTaxType === "Commercial" ? "10%" : "1%"}
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          RTO Total (Charge + Tax)
                        </label>
                        <Input
                          type="text"
                          readOnly
                          value={`₹ ${displayRtoTotal}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Accessories with Error Messages */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Accessories</span>
                    </div>
                    {accessories.map((acc, i) => (
                      <div key={i} id={`accessory-${i}`}>
                        <div className="mb-2 flex items-center gap-2">
                          <div className="min-w-[200px] flex-1">
                            <AccessoryCombobox
                              options={accessoryOptions}
                              value={acc.name}
                              onChange={(val) => {
                                const selectedAccessory = accessoryOptions.find(
                                  (item: any) => item.itemName === val,
                                );

                                const updatedAccessories = [...accessories];
                                updatedAccessories[i] = {
                                  ...updatedAccessories[i],

                                  accessoryId: selectedAccessory?.id,

                                  name: val,

                                  price: Number(
                                    selectedAccessory?.salesPrice || 0,
                                  ),
                                  taxPercent: Number(
                                    selectedAccessory?.taxSlab || 0,
                                  ),
                                };

                                setAccessories(updatedAccessories);

                                console.log(updatedAccessories[i]);
                              }}
                              placeholder="Type or select accessory..."
                              error={accessoryErrors[i]}
                            />
                          </div>
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={acc.qty || 0}
                            onChange={(e) =>
                              updateAccessory(i, "qty", e.target.value)
                            }
                            className="w-20"
                          />
                          <Input
                            type="number"
                            placeholder="Price"
                            value={acc.price || ""}
                            onChange={(e) =>
                              updateAccessory(i, "price", e.target.value)
                            }
                            className="w-32"
                          />
                          <Input
                            type="number"
                            placeholder="Tax %"
                            value={acc.taxPercent || ""}
                            onChange={(e) =>
                              updateAccessory(i, "taxPercent", e.target.value)
                            }
                            className="w-24"
                          />
                          <Input
                            type="number"
                            readOnly
                            value={
                              acc.totalPrice ? acc.totalPrice.toFixed(2) : ""
                            }
                            placeholder="Total"
                            className="dark:bg-dark-800 w-28 bg-gray-50 font-medium"
                          />
                          <div className="flex gap-1">
                            {i === 0 && (
                              <Button
                                variant="filled"
                                color="primary"
                                isIcon
                                className="size-8 rounded-full"
                                onClick={addAccessory}
                                type="button"
                              >
                                <PlusIcon className="size-4" />
                              </Button>
                            )}
                            {i > 0 && (
                              <Button
                                variant="filled"
                                color="error"
                                isIcon
                                className="size-8 rounded-full"
                                onClick={() => {
                                  removeAccessory(i);
                                  // Clear error for removed accessory
                                  const newErrors = { ...accessoryErrors };
                                  delete newErrors[i];
                                  setAccessoryErrors(newErrors);
                                }}
                                type="button"
                              >
                                <MinusIcon className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {accessoryErrors[i] && (
                          <p className="mt-1 text-xs text-red-500">
                            {accessoryErrors[i]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Sales Price */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Sales Price (₹)
                    </label>
                    <Input
                      type="number"
                      readOnly
                      {...register("salesPrice")}
                      className="text-lg font-bold"
                    />
                  </div>
                </div>
                <div className="dark:border-dark-600 flex justify-end gap-3 border-t p-5">
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => setShowDrawer(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button color="primary" type="submit">
                    {editId ? "Update Variant" : "Add Variant Price"}
                  </Button>
                </div>
              </form>
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
            title: isBulkDelete
              ? "Delete Selected Showroom Variants?"
              : "Are you sure?",
            description: isBulkDelete
              ? `Are you sure you want to delete ${selectedIds.length} selected showroom variants? This action cannot be undone.`
              : "Are you sure you want to delete this showroom variant? Once deleted, it cannot be restored.",
            actionText: isBulkDelete ? "Delete All" : "Delete",
          },
          success: {
            title: "Deleted Successfully",
            description: isBulkDelete
              ? `${selectedIds.length} showroom variants have been deleted.`
              : "The showroom variant has been deleted.",
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
