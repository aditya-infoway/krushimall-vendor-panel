import { useState, useEffect } from "react";
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
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
import { Fragment } from "react";
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
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type Employee = {
  id: number;
  department: string;
  branchId: string;
  branch:string;
  role: string;
  employeeName: string;
  mobileNumber: string;
  alternateNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  status: string;
  createdAt: string;
  createdBy: string;
  createdType: string;
};

type FormValues = {
  id?: number;
  teamLeadId?: number;
  department: string;
  branchId: string;
  role: string;
branch:string;
  employeeName: string;
  mobileNumber: string;
  alternateNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  status: string;
};

// Sample data

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

// Change from { id, name } to { label, value } format for Combobox



const Employee = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] =
    useState("All");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmState, setConfirmState] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState<any[]>([]);
  const [roleOptions, setRoleOptions] = useState<any[]>([]);
  // Add this after your useForm declaration
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      department: "",
      teamLeadId: undefined,
     branchId: "",
     branch:"",
      role: "",
      employeeName: "",
      mobileNumber: "",
      alternateNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      status: "ACTIVE",
    },
  });

  // Add these useWatch hooks to track form values
  const formDepartmentValue = useWatch({ control, name: "department" });
  const formBranchValue = useWatch({ control, name: "branchId" });
  const formRoleValue = useWatch({ control, name: "role" });
  const formStatusValue = useWatch({ control, name: "status" });
  const formTeamLeadValue = useWatch({
    control,
    name: "teamLeadId",
  });
 const [teamLeadOptions, setTeamLeadOptions] = useState<any[]>([]);
 
  const getTeamLeads = async (department: string) => {
    const res = await apiHelper.get(
      `/employees/team-leads?department=${department}`,
    );

    setTeamLeadOptions(
      res.data.map((item: any) => ({
        label: item.employeeName,
        value: item.id,
      })),
    );
  };
  const formValidationRules = {
    department: { required: "Department is required" },
    branchId: { required: "Branch is required" },
    role: { required: "Role is required" },
    employeeName: { required: "Employee name is required" },
    mobileNumber: {
      required: "Mobile number is required",
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Mobile number must be 10 digits",
      },
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /\S+@\S+\.\S+/,
        message: "Email is invalid",
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
      required: !editId ? "Confirm password is required " : false,
      validate: (value: string, formValues: any) =>
        value === formValues.password || "Passwords do not match",
    },
  };

  // Keep these as { id, name } format for Listbox
  const departmentFilterOptions = [
    { id: "All", name: "All Departments" },
    { id: "Sales", name: "Sales" },
    { id: "Marketing", name: "Marketing" },
    { id: "HR", name: "HR" },
    { id: "IT", name: "IT" },
    { id: "Finance", name: "Finance" },
  ];

  const roleFilterOptions = [
    { id: "All", name: "All Roles" },
    { id: "Manager", name: "Manager" },
    { id: "Executive", name: "Executive" },
    { id: "Associate", name: "Associate" },
    { id: "Intern", name: "Intern" },
    { id: "Team Lead", name: "Team Lead" },
  ];

  const statusFilterOptions = [
    { id: "All", name: "All Statuses" },
    { id: "ACTIVE", name: "Active" },
    { id: "INACTIVE", name: "Inactive" },
  ];
  const getDepartments = async () => {
    try {
      const res = await apiHelper.get("/employees/departments");

      setDepartmentOptions(
        res.data.map((item: any) => ({
          label: item.name,
          value: item.name, // ✅ Store department name
          departmentId: item.id, // Keep id separately
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };
  const getRoles = async (departmentId: number) => {
    try {
      const res = await apiHelper.get(
        `/employees/roles/department/${departmentId}`,
      );

      setRoleOptions(
        res.data.map((item: any) => ({
          label: item.roleName,
          value: item.roleName, // Store role name
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const getEmployees = async () => {
    try {
      const response = await apiHelper.get("/employees");

      setEmployees(response.data || []);
    } catch (error) {
      console.log(error);
    }
  };
const getBranches = async () => {
  try {
    const branches = await apiHelper.get("/branch");

   

    setBranchOptions(
      branches.map((item: any) => ({
        label: item.branchName,
        value: item.id,
      }))
    );
  } catch (err) {
    console.log(err);
  }
};
  useEffect(() => {
    getEmployees();
    getDepartments();
      getBranches();
  }, []);
  const handleOpenAddDrawer = () => {
    setEditId(null);
    reset({
      department: "",
    branchId: "",
    branch:"",
      role: "",
      teamLeadId: undefined,
      employeeName: "",
      mobileNumber: "",
      alternateNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      status: "ACTIVE",
    });
    setShowDrawer(true);
  };

  const handleOpenEditDrawer = async (item: Employee) => {
    try {
      const response = await apiHelper.get(`/employees/${item.id}`);

      const employee = response.data;

      setEditId(employee.id);

      // Load roles for selected department
      const department = departmentOptions.find(
        (d) => d.value === employee.department,
      );

      if (department) {
        await getRoles(department.departmentId);
      }

      // Load Team Leads if role is Sales Executive
      if (employee.role === "Sales Executive") {
        await getTeamLeads(employee.department);
      }

      reset({
        department: employee.department,
     branchId: employee.branchId,   
        role: employee.role,
        teamLeadId: employee.teamLeadId,
        employeeName: employee.employeeName,
        mobileNumber: employee.mobileNumber,
        alternateNumber: employee.alternateNumber || "",
        email: employee.email,
        password: "",
        confirmPassword: "",
        status: employee.status,
      });

      setShowDrawer(true);
    } catch (error) {
      console.log(error);
    }
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
          selectedIds.map((id) => apiHelper.delete(`/employees/${id}`)),
        );
        toast.success(`${selectedIds.length} employees deleted successfully!`);
        setSelectedIds([]);
        await getEmployees();
        setCurrentPage(1);
        setConfirmState("success");
      } else {
        if (deleteTargetId === null) return;
        await apiHelper.delete(`/employees/${deleteTargetId}`);
        toast.success("Employee deleted successfully!");
        await getEmployees();
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
    try {
      await apiHelper.patch(`/employees/toggle-status/${id}`, {});

      getEmployees();
    } catch (error) {
      console.log(error);
    }
  };
  const onFormSubmit = async (data: FormValues) => {
    try {
      const payload = {
        department: data.department,
         branchId: data.branchId,
        teamLeadId: data.teamLeadId,
        role: data.role,
        employeeName: data.employeeName,
        mobileNumber: data.mobileNumber,
        alternateNumber: data.alternateNumber,
        email: data.email,
        password: data.password,
        status: data.status,
      };

      if (editId) {
        await apiHelper.put(`/employees/${editId}`, payload);
        toast.success("Employee updated successfully!");
      } else {
        await apiHelper.post("/employees", payload);
        toast.success("Employee created successfully!");
      }

      await getEmployees();
      setShowDrawer(false);
      setEditId(null);
      reset({
        department: "",
      branchId: "",
        role: "",
        employeeName: "",
        mobileNumber: "",
        alternateNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
        status: "ACTIVE",
      });
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to save employee. Please try again.",
      );
    }
  };
  // Filter data
  const searchText = search.trim().toLowerCase();
  const filteredData = employees.filter((item) => {
    const matchesSearch =
     String(item.employeeName ?? "")
      .toLowerCase()
      .includes(searchText) ||

    String(item.department ?? "")
      .toLowerCase()
      .includes(searchText) ||

    String(item.branch ?? "")
      .toLowerCase()
      .includes(searchText) ||

    String(item.role ?? "")
      .toLowerCase()
      .includes(searchText) ||

    String(item.mobileNumber ?? "")
      .toLowerCase()
      .includes(searchText) ||

    String(item.email ?? "")
      .toLowerCase()
      .includes(searchText);

    const matchesDepartment =
      selectedDepartmentFilter === "All" ||
      item.department === selectedDepartmentFilter;
    const matchesRole =
      selectedRoleFilter === "All" || item.role === selectedRoleFilter;
    const matchesStatus =
      selectedStatusFilter === "All" || item.status === selectedStatusFilter;

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
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

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Employee List
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all employees from here
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

          {/* Right side - Add Employee button */}
          <Button
            color="primary"
            onClick={handleOpenAddDrawer}
            className="whitespace-nowrap"
          >
            <PlusIcon className="mr-1.5 size-4.5" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search employee, email or mobile..."
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Department
              </span>
              <Listbox
                data={departmentFilterOptions}
                value={
                  departmentFilterOptions.find(
                    (o) => o.id === selectedDepartmentFilter,
                  ) || departmentFilterOptions[0]
                }
                placeholder="All Departments"
                onChange={(opt: any) => {
                  setSelectedDepartmentFilter(opt.id);
                  setCurrentPage(1);
                }}
                displayField="name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Role
              </span>
              <Listbox
                data={roleFilterOptions}
                value={
                  roleFilterOptions.find((o) => o.id === selectedRoleFilter) ||
                  roleFilterOptions[0]
                }
                placeholder="All Roles"
                onChange={(opt: any) => {
                  setSelectedRoleFilter(opt.id);
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
            className="w-full min-w-[800px] text-left [&_.table-th]:font-semibold"
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
                  Employee Name
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Department
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Branch
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Role
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Mobile
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Email
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Status
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Created
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Created By
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Created Type
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
                      {item.employeeName}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.department}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                   {item.branch}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.role}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.mobileNumber}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.email}
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
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </Td>

                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.createdBy}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.createdType}
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
                              {({ active }) => (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditDrawer(item)}
                                  className={`${
                                    active
                                      ? "dark:bg-dark-600 text-primary-600 bg-gray-50 dark:text-white"
                                      : "dark:text-dark-200 text-gray-700"
                                  } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                                >
                                  <PencilIcon className="size-4" />
                                  Edit
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  className={`${
                                    active
                                      ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                      : "dark:text-dark-200 text-gray-700"
                                  } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                                >
                                  <TrashIcon className="size-4" />
                                  Delete
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
                    colSpan={12}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No employees found
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
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-2xl transform-gpu flex-col bg-white shadow-2xl transition-transform duration-200">
              <form
                onSubmit={handleSubmit(onFormSubmit)}
                className="flex h-full flex-col"
              >
                {/* Header */}
                <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                  <h2 className="dark:text-dark-50 text-lg font-semibold text-gray-800">
                    {editId !== null ? "Edit Employee" : "Add Employee"}
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
                <div className="grow space-y-5 overflow-y-auto p-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <div>
                        <Controller
                          name="department"
                          control={control}
                          rules={{
                            required: "Department is required",
                          }}
                          render={({ field, fieldState }) => (
                            <Combobox
                              label={
                                <span>
                                  Type of Department{" "}
                                  <span className="text-red-500">*</span>
                                </span>
                              }
                              placeholder="Select Department"
                              data={departmentOptions}
                              value={
                                departmentOptions.find(
                                  (item) => item.value === field.value,
                                ) || null
                              }
                              error={fieldState.error?.message}
                              onChange={(val: any) => {
                                field.onChange(val?.value || "");

                                setValue("role", "");
                                setValue("teamLeadId", undefined);

                                if (val?.departmentId) {
                                  getRoles(val.departmentId);
                                } else {
                                  setRoleOptions([]);
                                }
                              }}
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div>
                     <Controller
  name="branchId"
  control={control}
  rules={{ required: "Branch is required" }}
  render={({ field, fieldState }) => (
    <Combobox
      label={
        <span>
          Branch <span className="text-red-500">*</span>
        </span>
      }
      placeholder="Select Branch"
      data={branchOptions}
      value={
        branchOptions.find(
          (item) => item.value === field.value
        ) || null
      }
      error={fieldState.error?.message}
      onChange={(val: any) => field.onChange(val?.value ?? null)}
    />
  )}
/>
                    </div>
                  </div>

                  <div>
                    <Controller
                      name="role"
                      control={control}
                      rules={{
                        required: "Role is required",
                      }}
                      render={({ field, fieldState }) => (
                        <Combobox
                          label={
                            <span>
                              Role <span className="text-red-500">*</span>
                            </span>
                          }
                          placeholder="Select Role"
                          data={roleOptions}
                          value={
                            roleOptions.find(
                              (item) => item.value === field.value,
                            ) || null
                          }
                          error={fieldState.error?.message}
                          onChange={(val: any) => {
                            field.onChange(val?.value || "");

                            if (val?.value === "Sales Executive") {
                              getTeamLeads(formDepartmentValue);
                            } else {
                              setTeamLeadOptions([]);
                              setValue("teamLeadId", undefined);
                            }
                          }}
                        />
                      )}
                    />
                  </div>
                  {formRoleValue === "Sales Executive" && (
                    <Combobox
                      label={
                        <span>
                          Team Lead <span className="text-red-500">*</span>
                        </span>
                      }
                      placeholder="Select Team Lead"
                      data={teamLeadOptions}
                      value={
                        teamLeadOptions.find(
                          (item) => item.value === formTeamLeadValue,
                        ) || null
                      }
                      onChange={(val: any) =>
                        setValue("teamLeadId", val?.value || undefined)
                      }
                    />
                  )}
                  <div>
                    <Input
                      label={
                        <span>
                          Employee Name <span className="text-red-500">*</span>
                        </span>
                      }
                      placeholder="Enter employee name"
                      {...register(
                        "employeeName",
                        formValidationRules.employeeName,
                      )}
                      error={
                        errors?.employeeName && errors.employeeName.message
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Input
                        label={
                          <span>
                            Mobile Number{" "}
                            <span className="text-red-500">*</span>
                          </span>
                        }
                        placeholder="Enter mobile number"
                        {...register(
                          "mobileNumber",
                          formValidationRules.mobileNumber,
                        )}
                        error={
                          errors?.mobileNumber && errors.mobileNumber.message
                        }
                      />
                    </div>
                    <div>
                      <Input
                        label="Alternate Number"
                        placeholder="Enter alternate number"
                        {...register("alternateNumber")}
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      label={
                        <span>
                          Email <span className="text-red-500">*</span>
                        </span>
                      }
                      placeholder="Enter email address"
                      type="email"
                      {...register("email", formValidationRules.email)}
                      error={errors?.email && errors.email.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Status
                    </label>

                    <Listbox
                      data={statusOptions}
                      value={statusOptions.find(
                        (item) => item.value === formStatusValue,
                      )}
                      onChange={(val: any) =>
                        setValue("status", val?.value || "")
                      }
                    />
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
              ? "Delete Selected Employees?"
              : "Are you sure?",
            description: isBulkDelete
              ? `Are you sure you want to delete ${selectedIds.length} selected employees? This action cannot be undone.`
              : "Are you sure you want to delete this employee? Once deleted, it cannot be restored.",
            actionText: isBulkDelete ? "Delete All" : "Delete",
          },
          success: {
            title: "Deleted Successfully",
            description: isBulkDelete
              ? `${selectedIds.length} employees have been deleted.`
              : "The employee has been deleted.",
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

export default Employee;
