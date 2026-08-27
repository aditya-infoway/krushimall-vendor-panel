import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiHelper from "@/utils/apiHelper";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { useForm, useWatch, Controller } from "react-hook-form";
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
import { toast } from "sonner";
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
// import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import { Combobox } from "@/components/shared/form/Combobox";
type Branch = {
  id: number;

  companyId: number;
  financialYearId: number;

  branchCode: string;
  branchName: string;
  branchType: string;
  logo: string | null;
  managerId: number;
  manager: {
    id: number;
    accountName: string;
  };

  mobileNo: string;
  gmailId: string;

  gstNo: string;
  panCardNo: string;

  address1: string;
  address2: string;

  country: string;
  countryCode: string;

  state: string;
  stateCode: string;

  district: string;
  city: string;
  pinCode: string;

  createdBy: string;
  createdType: string;

  createdAt: string;
  isActive: boolean;
};

type FormValues = {
  id?: number;
  branchCode: string;
  branchName: string;
  branchType: string;
  managerId: number;
  managerName: string;
  mobileNo: string;
  gmailId: string;
  password: string;
  confirmPassword: string;
  gstNo: string;
  panCardNo: string;
  address1: string;
  address2: string;
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  district: string;
  city: string;
  pinCode: string;
};

const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

const branchTypeOptions = [
  { label: "Sales", value: "Sales" },
  { label: "Workshop", value: "Workshop" },
  { label: "Both", value: "Both" },
];

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "transparent",
    borderColor: state.isFocused
      ? "var(--color-primary-600)"
      : "var(--color-gray-700)",
    boxShadow: state.isFocused ? "0 0 0 1px var(--color-primary-600)" : "none",
    minHeight: "42px",
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

const CreateBranch = () => {
  // const navigate = useNavigate();
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedBranchTypeFilter, setSelectedBranchTypeFilter] =
    useState("All");
  const [selectedCountryFilter, setSelectedCountryFilter] = useState("All");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogo, setExistingLogo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      branchCode: "",
      branchName: "",
      branchType: "",
      managerName: "",
      mobileNo: "",
      gmailId: "",
      password: "",
      confirmPassword: "",
      gstNo: "",
      panCardNo: "",
      address1: "",
      address2: "",
      country: "",
      countryCode: "",
      state: "",
      stateCode: "",
      district: "",
      city: "",
      pinCode: "",
    },
  });

  const formBranchTypeValue = useWatch({ control, name: "branchType" });
  const watchedCountryCode = watch("countryCode");
  const watchedStateCode = watch("stateCode");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [financialYearId, setFinancialYearId] = useState<number | null>(null);
  const getCompany = async () => {
    try {
      const res = await apiHelper.get("/company");

      if (!res.data || res.data.length === 0) return;

      const company = res.data[0];

      setCompanyId(company.id);

      if (company.financialYears?.length > 0) {
        setFinancialYearId(company.financialYears[0].id);
      }
    } catch (err) {
      console.log(err);
    }
  };
  // ─── Dynamic Location Data ──────────────────────────────────────────────────
  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      value: c.isoCode,
      label: c.name,
    }));
  }, []);

  const stateOptions = useMemo(() => {
    if (!watchedCountryCode) return [];
    return State.getStatesOfCountry(watchedCountryCode).map((s) => ({
      value: s.isoCode,
      label: s.name,
    }));
  }, [watchedCountryCode]);

  const cityOptions = useMemo(() => {
    if (!watchedCountryCode || !watchedStateCode) return [];
    return City.getCitiesOfState(watchedCountryCode, watchedStateCode).map(
      (c) => ({
        value: c.name,
        label: c.name,
      }),
    );
  }, [watchedCountryCode, watchedStateCode]);

  // Use cityOptions for district as well
  const districtOptions = cityOptions;

  const formValidationRules = {
    branchCode: { required: "Branch code is required" },
    branchName: { required: "Branch name is required" },
    branchType: { required: "Branch type is required" },
    managerName: { required: "Manager name is required" },
    mobileNo: {
      required: "Mobile number is required",
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Mobile number must be 10 digits",
      },
    },
    gmailId: {
      required: "Gmail ID is required",
      pattern: {
        value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
        message: "Must be a valid Gmail address",
      },
    },
    password: {
      required: !editId ? "Password is required" : false,
      minLength: {
        value: 6,
        message: "Password must be at least 6 characters",
      },
    },
    confirmPassword: {
      required: !editId ? "Confirm password is required" : false,
      validate: (value: string, formValues: any) =>
        value === formValues.password || "Passwords do not match",
    },
    gstNo: {
      required: "GST number is required",
      pattern: {
        value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        message: "Invalid GST number format",
      },
    },
    panCardNo: {
      required: "PAN card number is required",
      pattern: {
        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        message: "Invalid PAN card number format",
      },
    },
    address1: { required: "Address is required" },
    country: { required: "Country is required" },
    state: { required: "State is required" },
    district: { required: "District is required" },
    city: { required: "City is required" },
    pinCode: {
      required: "PIN code is required",
      pattern: {
        value: /^[0-9]{6}$/,
        message: "PIN code must be 6 digits",
      },
    },
  };

  const branchTypeFilterOptions = [
    { id: "All", name: "All Types" },
    { id: "Sales", name: "Sales" },
    { id: "Workshop", name: "Workshop" },
    { id: "Both", name: "Both" },
  ];

  const countryFilterOptions = [
    { id: "All", name: "All Countries" },
    ...countryOptions.map((c) => ({ id: c.label, name: c.label })),
  ];

  const getBranches = async () => {
    try {
      const response = await apiHelper.get("/branch");
   
      setBranches(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBranches();
    getCompany();
  }, []);

  const handleOpenAddDrawer = () => {
    setEditId(null);
    reset({
      branchCode: "",
      branchName: "",
      branchType: "",
      managerName: "",
      mobileNo: "",
      gmailId: "",
      password: "",
      confirmPassword: "",
      gstNo: "",
      panCardNo: "",
      address1: "",
      address2: "",
      country: "",
      countryCode: "",
      state: "",
      stateCode: "",
      district: "",
      city: "",
      pinCode: "",
    });
    setShowDrawer(true);
    setLogoFile(null);
    setExistingLogo(null);
  };

const handleOpenEditDrawer = async (item: Branch) => {
  if (!item) {
    return;
  }

  try {
    const response = await apiHelper.get(`/branch/${item.id}`);

    const branch = response.data;

    setEditId(branch.id);

    reset({
      branchCode: branch.branchCode || "",
      branchName: branch.branchName || "",
      branchType: branch.branchType || "",
      managerId: branch.managerId || branch.manager?.id,
      managerName: branch.manager?.accountName || "",
      mobileNo: branch.mobileNo || "",
      gmailId: branch.gmailId || "",
      password: "",
      confirmPassword: "",
      gstNo: branch.gstNo || "",
      panCardNo: branch.panCardNo || "",
      address1: branch.address1 || "",
      address2: branch.address2 || "",
      country: branch.country || "",
      countryCode: branch.countryCode || "",
      state: branch.state || "",
      stateCode: branch.stateCode || "",
      district: branch.district || "",
      city: branch.city || "",
      pinCode: branch.pinCode || "",
    });

    setExistingLogo(branch.logo || null);
    setLogoFile(null);
    setShowDrawer(true);
  } catch (error: any) {
    console.error("Failed to fetch branch:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to load branch details",
    );
  }
};

  const handleDelete = async (id: number) => {
    try {
      if (window.confirm("Are you sure you want to delete this branch?")) {
        await apiHelper.delete(`/branch/${id}`);
        toast.success("Branch deleted successfully");
        getBranches();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete branch");
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (
        window.confirm("Are you sure you want to delete selected branches?")
      ) {
        await Promise.all(
          selectedIds.map((id) => apiHelper.delete(`/branch/${id}`)),
        );
        setSelectedIds([]);
        toast.success(`${selectedIds.length} branches deleted successfully`);
        getBranches();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete selected branches");
    }
  };

  const onFormSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData();

      formData.append("companyId", String(companyId));
      formData.append("financialYearId", String(financialYearId));

      formData.append("branchCode", data.branchCode);
      formData.append("branchName", data.branchName);
      formData.append("branchType", data.branchType);

      formData.append("managerId", String(data.managerId));

      formData.append("mobileNo", data.mobileNo);
      formData.append("gmailId", data.gmailId);
      if (data.password) {
        formData.append("password", data.password);
      }

      formData.append("gstNo", data.gstNo);
      formData.append("panCardNo", data.panCardNo);

      formData.append("address1", data.address1);
      formData.append("address2", data.address2 || "");

      formData.append("country", data.country);
      formData.append("countryCode", data.countryCode);

      formData.append("state", data.state);
      formData.append("stateCode", data.stateCode);

      formData.append("district", data.district);
      formData.append("city", data.city);
      formData.append("pinCode", data.pinCode);

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (editId) {
        await apiHelper.put(`/branch/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Branch updated successfully");
      } else {
        await apiHelper.upload("/branch", formData);
        toast.success("Branch created successfully");
      }

      getBranches();
      setShowDrawer(false);
      setEditId(null);
      setLogoFile(null);
      setExistingLogo(null);
      reset({
        branchCode: "",
        branchName: "",
        branchType: "",
        managerName: "",
        mobileNo: "",
        gmailId: "",
        password: "",
        confirmPassword: "",
        gstNo: "",
        panCardNo: "",
        address1: "",
        address2: "",
        country: "",
        countryCode: "",
        state: "",
        stateCode: "",
        district: "",
        city: "",
        pinCode: "",
      });
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  };
const searchText = search.trim().toLowerCase();

const filteredData = branches.filter((item: any) => {
  const matchesSearch =
    String(item.branchName ?? "")
      .toLowerCase()
      .includes(searchText) ||
    String(item.branchCode ?? "")
      .toLowerCase()
      .includes(searchText) ||
    String(item.managerName ?? "")
      .toLowerCase()
      .includes(searchText) ||
    String(item.gmailId ?? "")
      .toLowerCase()
      .includes(searchText) ||
    String(item.mobileNo ?? "")
      .toLowerCase()
      .includes(searchText);

  const matchesBranchType =
    selectedBranchTypeFilter === "All" ||
    String(item.branchType ?? "") ===
      String(selectedBranchTypeFilter);

  const matchesCountry =
    selectedCountryFilter === "All" ||
    String(item.country ?? "") ===
      String(selectedCountryFilter);

  return (
    matchesSearch &&
    matchesBranchType &&
    matchesCountry
  );
});

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const [managerAccounts, setManagerAccounts] = useState<any[]>([]);

  const getManagerAccounts = async () => {
    try {
      const res = await apiHelper.get("/accounts");

      const data = (res.data || []).filter(
        (item: any) =>
          item.group === "Sundry Debitor (internal)" ||
          item.group === "Sundry Creditor (internal)",
      );

      setManagerAccounts(
        data.map((item: any) => ({
          id: item.id,
          label: item.accountName,
          value: item.id,

          mobile: item.mobile,
          email: item.email,
          gstNo: item.gstNo,
          panNo: item.panCard,

          address1: item.address1,
          address2: item.address2,

          country: item.country,
          countryCode: item.countryCode,

          state: item.state,
          stateCode: item.stateCode,

          district: item.district,
          city: item.city,
          pinCode: item.pincode,
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getManagerAccounts();
  }, []);
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
  const handleToggleTableStatus = async (id: number) => {
    try {
      await apiHelper.patch(`/branch/${id}/status`);
      getBranches();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Branch List
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all branches from here
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

          {/* Right side - Add Branch button */}
          <Button
            color="primary"
            onClick={handleOpenAddDrawer}
            className="whitespace-nowrap"
          >
            <PlusIcon className="mr-1.5 size-4.5" />
            Add Branch
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search branch name, code, manager..."
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
                Branch Type
              </span>
              <Listbox
                data={branchTypeFilterOptions}
                value={
                  branchTypeFilterOptions.find(
                    (o) => o.id === selectedBranchTypeFilter,
                  ) || branchTypeFilterOptions[0]
                }
                placeholder="All Types"
                onChange={(opt: any) => {
                  setSelectedBranchTypeFilter(opt.id);
                  setCurrentPage(1);
                }}
                displayField="name"
              />
            </div>
            {/* <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Country
              </span>
              <Listbox
                data={countryFilterOptions}
                value={
                  countryFilterOptions.find(
                    (o) => o.id === selectedCountryFilter,
                  ) || countryFilterOptions[0]
                }
                placeholder="All Countries"
                onChange={(opt: any) => {
                  setSelectedCountryFilter(opt.id);
                  setCurrentPage(1);
                }}
                displayField="name"
              />
            </div> */}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table
            hoverable
            className="w-full min-w-350 text-left [&_.table-th]:font-semibold"
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
                <Th className="w-16 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Logo
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Branch Code
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Branch Name
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Type
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Manager
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Mobile
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Gmail
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  GST
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  PAN
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Location
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
                      <div className="dark:border-dark-500 dark:bg-dark-800 flex size-20 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {item.logo ? (
                          <img
                            src={apiHelper.getImageUrl(item.logo)}
                            alt={item.branchName}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] text-gray-400">
                            No logo
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td className="py-4 font-mono text-sm font-medium text-gray-900 dark:text-gray-400">
                      {item.branchCode}
                    </Td>
                  
                    <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                      {item.branchName}
                    </Td>
                    <Td className="py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.branchType === "Sales"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : item.branchType === "Workshop"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        }`}
                      >
                        {item.branchType}
                      </span>
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.manager.accountName}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.mobileNo}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.gmailId}
                    </Td>
                    <Td className="py-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                      {item.gstNo}
                    </Td>
                    <Td className="py-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                      {item.panCardNo}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      <div className="text-sm">
                        <div>{item.address1}</div>
                        {item.address2 && <div>{item.address2}</div>}
                        <div className="mt-1 text-xs text-gray-400">
                          {item.city}, {item.district}, {item.state}
                          <br />
                          PIN: {item.pinCode}
                        </div>
                      </div>
                    </Td>
                    <Td className="py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleTableStatus(item.id)}
                        className={`relative h-6 w-12 rounded-full transition ${
                          item.isActive ? "bg-primary-500" : "bg-gray-400"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                            item.isActive ? "left-6" : "left-0.5"
                          }`}
                        />
                      </button>
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
                            className="dark:bg-dark-800 dark:ring-dark-500 dark:border-dark-500 z-[100] w-36 rounded-lg border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 [--anchor-gap:4px] focus:outline-none"
                          >
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditDrawer(item)}
                                  className={`${
                                    focus
                                      ? "dark:bg-dark-600 text-primary-600 bg-gray-50 dark:text-white"
                                      : "dark:text-dark-200 text-gray-700"
                                  } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                                >
                                  <PencilIcon className="size-4" />
                                  Edit
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
                    colSpan={13}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No branches found
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
              <span className="text-xs font-semibold">Delete Selected</span>
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
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-4xl transform-gpu flex-col bg-white shadow-2xl transition-transform duration-200">
              <form
                onSubmit={handleSubmit(onFormSubmit)}
                className="flex h-full flex-col"
              >
                {/* Header */}
                <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-6 py-4">
                  <h2 className="dark:text-dark-50 text-lg font-semibold text-gray-800">
                    {editId !== null ? "Edit Branch" : "Add Branch"}
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
                {/* Content */}
<div className="grow space-y-5 overflow-y-auto p-6">
  <div className="flex items-center gap-4">
    {/* ✅ shrink-0 added — box ab kabhi squish nahi hoga */}
    <div className="dark:border-dark-500 dark:bg-dark-800 flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      {logoFile ? (
        <img
          src={URL.createObjectURL(logoFile)}
          alt="Branch logo"
          className="size-full object-cover"
        />
      ) : existingLogo ? (
        <img
          src={apiHelper.getImageUrl(existingLogo)}
          alt="Branch logo"
          className="size-full object-cover"
          onError={(e) => {
            // fallback agar image 404 ho jaye (jaisa console me dikh raha hai)
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span className="text-xs text-gray-400">No logo</span>
      )}
    </div>
    <div className="flex min-w-0 flex-col gap-1">
      <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
        Branch Logo
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
        className="dark:text-dark-200 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  </div>
  

                  <div className="border-primary-600 dark:border-primary-500 border-b border-dashed"></div>
                  {/* Row 1: Branch Code, Name, Type - 3 columns */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Input
                        label={
                          <span>
                            Branch Code <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="Enter branch code"
                        {...register(
                          "branchCode",
                          formValidationRules.branchCode,
                        )}
                        error={errors?.branchCode && errors.branchCode.message}
                      />
                    </div>
                    <div>
                      <Input
                        label={
                          <span>
                            Branch Name <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="Enter branch name"
                        {...register(
                          "branchName",
                          formValidationRules.branchName,
                        )}
                        error={errors?.branchName && errors.branchName.message}
                      />
                    </div>
                    <div>
                      <Controller
                        name="branchType"
                        control={control}
                        rules={{
                          required: "Branch type is required",
                        }}
                        render={({ field, fieldState }) => (
                          <Combobox
                            label={
                              <span>
                                Branch Type{" "}
                                <span className="text-red-500">*</span>
                              </span>
                            }
                            placeholder="Select type"
                            data={branchTypeOptions}
                            value={
                              branchTypeOptions.find(
                                (item) => item.value === field.value,
                              ) || null
                            }
                            error={fieldState.error?.message}
                            onChange={(val: any) => {
                              field.onChange(val?.value || "");
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-primary-600 dark:border-primary-500 border-b border-dashed"></div>

                  {/* Row 2: Manager Name, Mobile, Gmail - 3 columns */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Controller
                        name="managerName"
                        control={control}
                        rules={{
                          required: "Manager name is required",
                        }}
                        render={({ field, fieldState }) => (
                          <Combobox
                            label={
                              <span>
                                Branch Manager Name{" "}
                                <span className="text-red-500">*</span>
                              </span>
                            }
                            placeholder="Search Manager"
                            data={managerAccounts}
                            displayField="label"
                            searchFields={["label", "mobile"]}
                            columns={[
                              {
                                header: "Account",
                                field: "label",
                                width: "2fr",
                              },
                              {
                                header: "Mobile",
                                field: "mobile",
                                width: "1.5fr",
                              },
                            ]}
                            value={
                              managerAccounts.find(
                                (x: any) => x.label === field.value,
                              ) || null
                            }
                            error={fieldState.error?.message}
                            onChange={(acc: any) => {
                              if (!acc) {
                                field.onChange("");
                                setValue("managerId", undefined as any);
                                return;
                              }

                              field.onChange(acc.label);

                              setValue("managerId", acc.id);
                              setValue("mobileNo", acc.mobile || "");
                              setValue("gmailId", acc.email || "");
                              setValue("gstNo", acc.gstNo || "");
                              setValue("panCardNo", acc.panNo || "");
                              setValue("address1", acc.address1 || "");
                              setValue("address2", acc.address2 || "");
                              setValue("country", acc.country || "");
                              setValue("countryCode", acc.countryCode || "");
                              setValue("state", acc.state || "");
                              setValue("stateCode", acc.stateCode || "");
                              setValue("district", acc.district || "");
                              setValue("city", acc.city || "");
                              setValue("pinCode", acc.pinCode || "");
                            }}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Input
                        label={
                          <span>
                            Mobile Number{" "}
                            <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="Enter mobile number"
                        {...register("mobileNo", formValidationRules.mobileNo)}
                        error={errors?.mobileNo && errors.mobileNo.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Input
                        label={
                          <span>
                            GST Number <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="Enter GST number"
                        {...register("gstNo", formValidationRules.gstNo)}
                        error={errors?.gstNo && errors.gstNo.message}
                      />
                    </div>
                    <div>
                      <Input
                        label={
                          <span>
                            PAN Card Number{" "}
                            <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="Enter PAN card number"
                        {...register(
                          "panCardNo",
                          formValidationRules.panCardNo,
                        )}
                        error={errors?.panCardNo && errors.panCardNo.message}
                      />
                    </div>
                    <div>
                      <Input
                        label={
                          <span>
                            Address Line 1{" "}
                            <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="Enter address line 1"
                        {...register("address1", formValidationRules.address1)}
                        error={errors?.address1 && errors.address1.message}
                      />
                    </div>
                  </div>

                  {/* Row 2: Address Line 2, Country, State - 3 columns */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Input
                        label="Address Line 2"
                        placeholder="Enter address line 2"
                        {...register("address2")}
                      />
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="countryCode"
                        control={control}
                        rules={{ required: "Country is required" }}
                        render={({ field }) => (
                          <Select
                            options={countryOptions}
                            styles={customSelectStyles}
                            classNamePrefix="react-select"
                            placeholder="Search Country"
                            value={
                              countryOptions.find(
                                (option) => option.value === field.value,
                              ) || null
                            }
                            onChange={(selected) => {
                              field.onChange(selected?.value || "");
                              setValue("country", selected?.label || "");
                              setValue("stateCode", "");
                              setValue("state", "");
                              setValue("district", "");
                              setValue("city", "");
                            }}
                          />
                        )}
                      />
                      {errors.countryCode && (
                        <span className="text-xs text-red-500">
                          {errors.countryCode.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        State <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="stateCode"
                        control={control}
                        rules={{ required: "State is required" }}
                        render={({ field }) => (
                          <Select
                            options={stateOptions}
                            styles={customSelectStyles}
                            classNamePrefix="react-select"
                            placeholder="Search State"
                            isDisabled={!watchedCountryCode}
                            value={
                              stateOptions.find(
                                (option) => option.value === field.value,
                              ) || null
                            }
                            onChange={(selected) => {
                              field.onChange(selected?.value || "");
                              setValue("state", selected?.label || "");
                              setValue("district", "");
                              setValue("city", "");
                            }}
                          />
                        )}
                      />
                      {errors.stateCode && (
                        <span className="text-xs text-red-500">
                          {errors.stateCode.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 3: District, City, PIN Code - 3 columns */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        District <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="district"
                        control={control}
                        rules={{ required: "District is required" }}
                        render={({ field }) => (
                          <Select
                            options={districtOptions}
                            styles={customSelectStyles}
                            classNamePrefix="react-select"
                            placeholder="Search District"
                            isDisabled={!watchedStateCode}
                            value={
                              districtOptions.find(
                                (option) => option.value === field.value,
                              ) || null
                            }
                            onChange={(selected) => {
                              field.onChange(selected?.value || "");
                            }}
                          />
                        )}
                      />
                      {errors.district && (
                        <span className="text-xs text-red-500">
                          {errors.district.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="city"
                        control={control}
                        rules={{ required: "City is required" }}
                        render={({ field }) => (
                          <Select
                            options={cityOptions}
                            styles={customSelectStyles}
                            classNamePrefix="react-select"
                            placeholder="Search City"
                            isDisabled={!watchedStateCode}
                            value={
                              cityOptions.find(
                                (option) => option.value === field.value,
                              ) || null
                            }
                            onChange={(selected) => {
                              field.onChange(selected?.value || "");
                            }}
                          />
                        )}
                      />
                      {errors.city && (
                        <span className="text-xs text-red-500">
                          {errors.city.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <Input
                        label={
                          <span>
                            PIN Code <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="Enter PIN code"
                        {...register("pinCode", formValidationRules.pinCode)}
                        error={errors?.pinCode && errors.pinCode.message}
                      />
                    </div>
                  </div>
                  <div className="border-primary-600 dark:border-primary-500 border-b border-dashed"></div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Input
                        label={
                          <span>
                            Gmail ID <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="Enter Gmail address"
                        {...register("gmailId", formValidationRules.gmailId)}
                        error={errors?.gmailId && errors.gmailId.message}
                      />
                    </div>
                    <div>
                      <Input
                        label={
                          <span>
                            Password <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="Enter password"
                        type={showPassword ? "text" : "password"}
                        prefix={
                          <LockClosedIcon className="size-5 text-gray-400" />
                        }
                        suffix={
                          <Button
                            type="button"
                            variant="flat"
                            className="pointer-events-auto size-6 shrink-0 rounded-full p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="size-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="size-5 text-gray-400" />
                            )}
                          </Button>
                        }
                        {...register("password", formValidationRules.password)}
                        error={errors?.password?.message}
                      />
                    </div>
                    <div>
                      <Input
                        label={
                          <span>
                            Confirm Password{" "}
                            <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="Confirm password"
                        type={showConfirmPassword ? "text" : "password"}
                        prefix={
                          <LockClosedIcon className="size-5 text-gray-400" />
                        }
                        suffix={
                          <Button
                            type="button"
                            variant="flat"
                            className="pointer-events-auto size-6 shrink-0 rounded-full p-0"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeSlashIcon className="size-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="size-5 text-gray-400" />
                            )}
                          </Button>
                        }
                        {...register(
                          "confirmPassword",
                          formValidationRules.confirmPassword,
                        )}
                        error={errors?.confirmPassword?.message}
                      />
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
                  <Button color="primary" type="submit" className="h-10 w-1/2">
                    {editId !== null ? "Update" : "Save"}
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CreateBranch;
