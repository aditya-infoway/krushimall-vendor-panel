import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiHelper from "@/utils/apiHelper";
import { useForm, useWatch, Controller } from "react-hook-form";
import { Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/Combobox";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { ArrowLeftIcon,  TrashIcon, } from "@heroicons/react/24/outline";
import Select from "react-select";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
type FormValues = {
  id?: number;
  date: string;
  stockTransferId: string;
  branch: string;
  branchManagerName: string;
  contactNo: string;
  chassisNo: string;
  vehicleSrNo: string;
  model: string;
  variant: string;
  colour: string;
  itemName: string;
  itemCode: string;
  engineNo: string;
  mfgDate: string;
  keyNo: string;
  batteryNo: string;
  batteryMake: string;
  f1TyresNo: string;
  f2TyresNo: string;
  s1TyresNo: string;
  s2TyresNo: string;
  location: string;
  grnNumber: string;
  grnDate: string;
  grnRecordDate: string;
};

type SelectedVehicle = {
  id: number;

 

  itemName: string;
  itemCode: string;

  chassisNo: string;
  engineNo: string;
  serialNo: string;

  model: string;
  variant: string;
  colour: string;

  purchasePriceNoGST: number;
  purchasePriceTaxable: number;

  fuelType?: string;
  fuelCapacity?: string;

  mfgDate?: string;

  keyNumber?: string;

  batteryMake?: string;
  batteryNo?: string;

  first1Tyer?: string;
  first2Tyer?: string;
  second1Tyer?: string;
  second2Tyer?: string;
second2TyreNo?:number;
second1TyreNo?:number;
first2TyreNo?:number;
first1TyreNo?:number;
variantName?: string;
modelName?: string;
  location?: string;

  grnNo?: string;
  grnDate?: string;
  grnRecordDate?: string;

  supplierName?: string;
  billNo?: string;
  purchaseBillNo?: string;

  stock?: string;
  currentLocation?: string;

  inWardDate?: string;
  inWardTime?: string;

  ageDay?: number;

  status?: string;
};

// const branchOptions = [
//   { label: "Mumbai", value: "Mumbai" },
//   { label: "Delhi", value: "Delhi" },
//   { label: "Bangalore", value: "Bangalore" },
//   { label: "Chennai", value: "Chennai" },
//   { label: "Pune", value: "Pune" },
// ];

// const chassisOptions = [
//   { label: "CH-2024-001 - Honda City", value: "CH-2024-001" },
//   { label: "CH-2024-002 - Toyota Innova", value: "CH-2024-002" },
//   { label: "CH-2024-003 - Hyundai Creta", value: "CH-2024-003" },
//   { label: "CH-2024-004 - Maruti Suzuki", value: "CH-2024-004" },
//   { label: "CH-2024-005 - Tata Nexon", value: "CH-2024-005" },
// ];

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
      ? "var(--color-primary-600)" // <-- this causes blue background
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

const mockData: any = {
  "CH-2024-001": {
    id: 1,
    chassisNo: "CH-2024-001",
    vehicleSrNo: "VH-001",
    model: "Honda City",
    variant: "ZX CVT",
    colour: "White",
    itemName: "Honda City ZX CVT",
    itemCode: "HON-CITY-ZX",
    engineNo: "ENG-2024-001",
    mfgDate: "2024-01-15",
    keyNo: "KEY-001",
    batteryNo: "BAT-001",
    batteryMake: "Exide",
    f1TyresNo: "TYR-F1-001",
    f2TyresNo: "TYR-F2-001",
    s1TyresNo: "TYR-S1-001",
    s2TyresNo: "TYR-S2-001",
    location: "Warehouse A",
    grnNumber: "GRN-001",
    grnDate: "2024-01-10",
    grnRecordDate: "2024-01-10",
  },
  "CH-2024-002": {
    id: 2,
    chassisNo: "CH-2024-002",
    vehicleSrNo: "VH-002",
    model: "Toyota Innova",
    variant: "VX",
    colour: "Silver",
    itemName: "Toyota Innova VX",
    itemCode: "TOY-INN-VX",
    engineNo: "ENG-2024-002",
    mfgDate: "2024-02-20",
    keyNo: "KEY-002",
    batteryNo: "BAT-002",
    batteryMake: "Amron",
    f1TyresNo: "TYR-F1-002",
    f2TyresNo: "TYR-F2-002",
    s1TyresNo: "TYR-S1-002",
    s2TyresNo: "TYR-S2-002",
    location: "Warehouse B",
    grnNumber: "GRN-002",
    grnDate: "2024-02-15",
    grnRecordDate: "2024-02-15",
  },
  "CH-2024-003": {
    id: 3,
    chassisNo: "CH-2024-003",
    vehicleSrNo: "VH-003",
    model: "Hyundai Creta",
    variant: "SX",
    colour: "Red",
    itemName: "Hyundai Creta SX",
    itemCode: "HYU-CRE-SX",
    engineNo: "ENG-2024-003",
    mfgDate: "2024-03-10",
    keyNo: "KEY-003",
    batteryNo: "BAT-003",
    batteryMake: "Exide",
    f1TyresNo: "TYR-F1-003",
    f2TyresNo: "TYR-F2-003",
    s1TyresNo: "TYR-S1-003",
    s2TyresNo: "TYR-S2-003",
    location: "Warehouse C",
    grnNumber: "GRN-003",
    grnDate: "2024-03-05",
    grnRecordDate: "2024-03-05",
  },
  "CH-2024-004": {
    id: 4,
    chassisNo: "CH-2024-004",
    vehicleSrNo: "VH-004",
    model: "Maruti Suzuki",
    variant: "ZXI",
    colour: "Blue",
    itemName: "Maruti Suzuki ZXI",
    itemCode: "MAR-SUZ-ZXI",
    engineNo: "ENG-2024-004",
    mfgDate: "2024-04-05",
    keyNo: "KEY-004",
    batteryNo: "BAT-004",
    batteryMake: "Amron",
    f1TyresNo: "TYR-F1-004",
    f2TyresNo: "TYR-F2-004",
    s1TyresNo: "TYR-S1-004",
    s2TyresNo: "TYR-S2-004",
    location: "Warehouse D",
    grnNumber: "GRN-004",
    grnDate: "2024-04-01",
    grnRecordDate: "2024-04-01",
  },
  "CH-2024-005": {
    id: 5,
    chassisNo: "CH-2024-005",
    vehicleSrNo: "VH-005",
    model: "Tata Nexon",
    variant: "XZ",
    colour: "Black",
    itemName: "Tata Nexon XZ",
    itemCode: "TAT-NEX-XZ",
    engineNo: "ENG-2024-005",
    mfgDate: "2024-05-20",
    keyNo: "KEY-005",
    batteryNo: "BAT-005",
    batteryMake: "Exide",
    f1TyresNo: "TYR-F1-005",
    f2TyresNo: "TYR-F2-005",
    s1TyresNo: "TYR-S1-005",
    s2TyresNo: "TYR-S2-005",
    location: "Warehouse E",
    grnNumber: "GRN-005",
    grnDate: "2024-05-15",
    grnRecordDate: "2024-05-15",
  },
};

const vehicleOptions = Object.values(mockData);

const daysSinceInward = (dateStr: string) => {
  if (!dateStr) return 0;
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff;
};

const URGENT_DAYS_THRESHOLD = 30;

const VehicleOption = (props: any) => {
  const { data, innerRef, innerProps, isFocused } = props;
  const days = daysSinceInward(data.grnDate);
  const isUrgent = days >= URGENT_DAYS_THRESHOLD;

  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={`flex cursor-pointer items-center justify-between border-b px-4 py-2 last:border-b-0 ${
        isFocused ? "bg-primary-600 text-white" : "bg-white text-black"
      }`}
    >
      <div className="text-xs leading-5">
        <div className="font-semibold">Chassis No : {data.chassisNo}</div>
        <div className="font-semibold">Battery No : {data.batteryNo}</div>
        <div className="font-semibold">Key No : {data.keyNumber}</div>
      </div>
      <div className="text-right text-xs leading-5">
        <div>
          Inward Date :{" "}
          <span
            className={`rounded px-1 ${isUrgent ? "text-primary-600 bg-white" : "bg-gray-100 text-gray-700"}`}
          >
            {data.grnDate}
          </span>
        </div>
        <div>
          Days :{" "}
          <span
            className={`rounded px-1 ${isUrgent ? "text-primary-600 bg-white" : "bg-gray-100 text-gray-700"}`}
          >
            {days}
          </span>
        </div>
        <div>Motor No : {data.engineNo}</div>
      </div>
    </div>
  );
};

const AddVehicleStock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.item ? true : false;
  const editData = location.state?.item || null;

  const [selectedVehicles, setSelectedVehicles] = useState<SelectedVehicle[]>(
    [],
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isActionChecked, setIsActionChecked] = useState(false);
  const [pendingVehicle, setPendingVehicle] = useState<SelectedVehicle | null>(
    null,
  );
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<any[]>([]);
  const [companyStateCode, setCompanyStateCode] = useState("");
  const [branchStateCode, setBranchStateCode] = useState("");
  const [branchOpeningBalance, setBranchOpeningBalance] = useState(0);
  const [companyId, setCompanyId] = useState<number | null>(null);
const [financialYearId, setFinancialYearId] = useState<number | null>(null);
const getTransferById = async () => {
  try {
    const res = await apiHelper.get(`/vehicle-stock-transfer/${id}`);

    console.log("API Response =>", res);

    const transfer = res.data;

    console.log("Transfer =>", transfer);

    setValue("date", transfer.transferDate?.split("T")[0] || "");
    setValue("stockTransferId", transfer.transferNo || "");
    setValue("branch", String(transfer.branchId || ""));
    setValue("branchManagerName", transfer.manager?.accountName || "");
    setValue("contactNo", transfer.branch?.mobileNo || "");
const selectedBranch = branchOptions.find(
  (b: any) => Number(b.value) === Number(transfer.branchId)
);

if (selectedBranch) {
  setBranchStateCode(selectedBranch.stateCode || "");
  setBranchOpeningBalance(Number(selectedBranch.closingBalance || 0));
}
    // If backend returns a vehicles array
    if (transfer.vehicles) {
      setSelectedVehicles(transfer.vehicles);
      const vehicle = transfer.vehicles[0];

  if (vehicle) {
    // 👇 ADD THIS — merge current vehicle into dropdown options
    setVehicleOptions((prev: any[]) => {
      const exists = prev.some((v) => v.chassisNo === vehicle.chassisNo);
      return exists ? prev : [...prev, vehicle];
    });
 setValue("chassisNo", vehicle.chassisNo);
  setValue("vehicleSrNo", vehicle.serialNo || "");
 setValue("model", vehicle.modelName || "");
setValue("variant", vehicle.variantName || "");
  setValue("colour", vehicle.colour || "");
  setValue("itemName", vehicle.itemName || "");
  setValue("itemCode", vehicle.itemCode || "");
  setValue("engineNo", vehicle.engineNo || "");
  setValue("mfgDate", formatDate(vehicle.mfgDate));
  setValue("keyNo", vehicle.keyNumber || "");
  setValue("batteryNo", vehicle.batteryNo || "");
  setValue("batteryMake", vehicle.batteryMake || "");
 setValue("f1TyresNo", vehicle.first1TyreNo || "");
setValue("f2TyresNo", vehicle.first2TyreNo || "");
setValue("s1TyresNo", vehicle.second1TyreNo || "");
setValue("s2TyresNo", vehicle.second2TyreNo || "");
  setValue("location", vehicle.location || "");
  setValue("grnNumber", vehicle.grnNo || "");
  setValue("grnDate", formatDate(vehicle.grnDate));
  setValue("grnRecordDate", formatDate(vehicle.grnRecordDate));
}
    } else {
      // Your backend currently returns a single vehicle
      setSelectedVehicles([transfer]);
    }
    
  } catch (err) {
    console.log(err);
  }
};
useEffect(() => {
  if (id && branchOptions.length > 0) {
    getTransferById();
  }
}, [id, branchOptions]);
const getCompany = async () => {
  try {
    // Get selected IDs only from sessionStorage
    const savedCompanyId =
      sessionStorage.getItem("companyId");

    const savedFinancialYearId =
      sessionStorage.getItem(
        "financialYearId",
      );

    

    if (!savedCompanyId) {
      console.error(
        "Company ID not found in sessionStorage",
      );
      return;
    }

    if (!savedFinancialYearId) {
      console.error(
        "Financial Year ID not found in sessionStorage",
      );
      return;
    }

    // Set IDs
    setCompanyId(
      Number(savedCompanyId),
    );

    setFinancialYearId(
      Number(savedFinancialYearId),
    );

    // Get company data only for state code
    const res =
      await apiHelper.get("/company");

    const companies = Array.isArray(
      res.data,
    )
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

    // Find currently selected company
    const selectedCompany =
      companies.find(
        (item: any) =>
          Number(item.id) ===
          Number(savedCompanyId),
      );

   
    setCompanyStateCode(
      selectedCompany?.stateCode || "",
    );
  } catch (error) {
    console.error(
      "GET COMPANY ERROR:",
      error,
    );
  }
};

  useEffect(() => {
    getCompany();
  }, []);
 const totalValue = (selectedVehicles || []).reduce(
  (sum, item) => sum + Number(item.purchasePriceNoGST || 0),
  0
);

const taxableValue = (selectedVehicles || []).reduce(
  (sum, item) => sum + Number(item.purchasePriceTaxable || 0),
  0
);
  const totalGST = taxableValue - totalValue;
  const isSameState =
    (companyStateCode || "").trim().toUpperCase() ===
    (branchStateCode || "").trim().toUpperCase();
  const cgst = isSameState ? totalGST / 2 : 0;

  const sgst = isSameState ? totalGST / 2 : 0;

  const igst = isSameState ? 0 : totalGST;
  const grandTotal = taxableValue;
  const getInventory = async () => {
    try {
      const res = await apiHelper.get("/purchases/tractor-inventory");

      const data = res.data || res || [];

      const presentVehicles = data.filter(
        (item: any) => item.status === "Present",
      );

    

      setVehicleOptions(presentVehicles);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getInventory();
  }, []);
  const getBranches = async () => {
    try {
      const res = await apiHelper.get("/branch");
    const data = (res || []).map((item: any) => ({
  label: item.branchName,
  value: item.id,
  managerId: item.manager?.id,
  manager: item.manager?.accountName,
  contact: item.mobileNo,

  stateCode: item.stateCode,

  openingBalance: item.manager?.openingBalance || 0,
  closingBalance: item.manager?.closingBalance || 0,
  drCr: item.manager?.drCr || "",
}));
      setBranchOptions(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getBranches();
  }, []);
  const {
    register,
    // handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      stockTransferId: "",
      branch: "",
      branchManagerName: "",
      contactNo: "",
      chassisNo: "",
      vehicleSrNo: "",
      model: "",
      variant: "",
      colour: "",
      itemName: "",
      itemCode: "",
      engineNo: "",
      mfgDate: "",
      keyNo: "",
      batteryNo: "",
      batteryMake: "",
      f1TyresNo: "",
      f2TyresNo: "",
      s1TyresNo: "",
      s2TyresNo: "",
      location: "",
      grnNumber: "",
      grnDate: "",
      grnRecordDate: "",
    },
  });

  const watchedChassisNo = watch("chassisNo");
  const watchedBranch = watch("branch");

  // Auto-generate stock transfer ID
 const getTransferNo = async () => {
  try {
    const res = await apiHelper.get(
      "/vehicle-stock-transfer/generate-transfer-no"
    );

    setValue("stockTransferId", res.transferNo);
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  getTransferNo();
}, []);

  // Auto-fill manager name and contact based on branch


  // Auto-fill vehicle details based on chassis number (only when checkbox is unchecked and not saved)
  useEffect(() => {
    if (!watchedChassisNo || isActionChecked || isSaved) return;

    const vehicleData = vehicleOptions.find(
      (item: any) => item.chassisNo === watchedChassisNo,
    );

 

    if (!vehicleData) return;

    setPendingVehicle(vehicleData);
     setValue("chassisNo", vehicleData.chassisNo);
    setValue("vehicleSrNo", vehicleData.serialNo || "");
    setValue("model", vehicleData.model || "");
    setValue("variant", vehicleData.variant || "");
    setValue("colour", vehicleData.colour || "");
    setValue("itemName", vehicleData.itemName || "");
    setValue("chassisNo", vehicleData.chassisNo || "");
    setValue("itemCode", vehicleData.itemCode || "");
    setValue("engineNo", vehicleData.engineNo || "");
    setValue("mfgDate", formatDate(vehicleData.mfgDate));
    setValue("keyNo", vehicleData.keyNo || vehicleData.keyNumber || "");
    setValue("batteryNo", vehicleData.batteryNo || "");
    setValue("batteryMake", vehicleData.batteryMake || "");
    setValue("f1TyresNo", vehicleData.first1Tyer || "");
    setValue("f2TyresNo", vehicleData.first2Tyer || "");
    setValue("s1TyresNo", vehicleData.second1Tyer || "");
    setValue("s2TyresNo", vehicleData.second2Tyer || "");
    setValue("location", vehicleData.location || "");
    setValue("grnNumber", vehicleData.grnNo || "");
    setValue("grnDate", formatDate(vehicleData.grnDate));
    setValue("grnRecordDate", formatDate(vehicleData.grnRecordDate));
  }, [watchedChassisNo, vehicleOptions]);

  // Set edit data
 useEffect(() => {
  if (!isEditMode || !editData) return;

  // Header fields
  setValue("date", editData.transferDate);
  setValue("stockTransferId", editData.transferNo);
  setValue("branch", String(editData.branchId));
  setValue("branchManagerName", editData.manager?.accountName || "");
  setValue("contactNo", editData.branch?.mobileNo || "");

  // Vehicle table
  if (editData.vehicles) {
    setSelectedVehicles(editData.vehicles);
  }
}, [isEditMode, editData]);

  const formValidationRules = {
    date: { required: "Date is required" },
    branch: { required: "Branch is required" },
    branchManagerName: { required: "Branch manager name is required" },
    contactNo: {
      required: "Contact number is required",
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Contact number must be 10 digits",
      },
    },
    chassisNo: { required: "Chassis number is required" },
  };

  const handleBack = () => {
    navigate("/stocktransfer/vehiclestock");
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = selectedVehicles.map((item) => item.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };
const handleSave = async () => {
  try {
    if (!watch("branch")) {
    toast.warning("Please select branch");
      return;
    }

    if (selectedVehicles.length === 0) {
     toast.warning("Please add at least one vehicle");
      return;
    }

    const payload = {
      companyId: Number(companyId),
      financialYearId: Number(financialYearId),

      transferDate: watch("date"),
      transferNo: watch("stockTransferId"),

      branchId: Number(watch("branch")),

      managerId: Number(
        branchOptions.find(
          (x: any) => Number(x.value) === Number(watch("branch"))
        )?.managerId
      ),

      branchOpeningBalance,

      totalValue,
      taxableValue,

      freight: 0,
      insurance: 0,
      otherCharge: 0,

      cgst,
      sgst,
      igst,

      grandTotal,

      vehicles: selectedVehicles,
    };

   

    let res;

    if (id) {
      // Update
      res = await apiHelper.put(
        `/vehicle-stock-transfer/${id}`,
        payload
      );

     toast.success("Vehicle Stock Transfer updated successfully");
    } else {
      // Create
      res = await apiHelper.post(
        "/vehicle-stock-transfer",
        payload
      );

    toast.success("Vehicle Stock Transfer created successfully");
    }

    console.log(res);

    navigate("/stocktransfer/vehiclestock");
  } catch (error) {
    console.log(error);
  }
};
  const isAllSelected =
    selectedVehicles.length > 0 &&
    selectedVehicles.every((item) => selectedIds.includes(item.id));

  // Handle action checkbox click - Only works once!
  // Handle action checkbox click - Auto-uncheck after saving
  const handleActionCheckboxChange = (checked: boolean) => {
  if (checked && pendingVehicle) {
    const exists = selectedVehicles.some(
      (vehicle) => vehicle.id === pendingVehicle.id,
    );

    if (exists) {
      toast.warning("This vehicle is already added");
      setIsActionChecked(false);
      return;
    }

    // Save currently selected header values
    const selectedDate = watch("date");
    const selectedTransferId = watch("stockTransferId");

    // Keep selected branch details
    const selectedBranch = watch("branch");
    const selectedManager = watch("branchManagerName");
    const selectedContact = watch("contactNo");

    // Add selected vehicle
    setSelectedVehicles((previousVehicles) => [
      ...previousVehicles,
      pendingVehicle,
    ]);

    setSelectedIds((previousIds) => [
      ...previousIds,
      pendingVehicle.id,
    ]);

    // Reset only vehicle fields
    // Branch remains selected
    reset({
      date: selectedDate,

      stockTransferId: selectedTransferId,

      branch: selectedBranch,

      branchManagerName: selectedManager,

      contactNo: selectedContact,

      chassisNo: "",

      vehicleSrNo: "",

      model: "",

      variant: "",

      colour: "",

      itemName: "",

      itemCode: "",

      engineNo: "",

      mfgDate: "",

      keyNo: "",

      batteryNo: "",

      batteryMake: "",

      f1TyresNo: "",

      f2TyresNo: "",

      s1TyresNo: "",

      s2TyresNo: "",

      location: "",

      grnNumber: "",

      grnDate: "",

      grnRecordDate: "",
    });

    setPendingVehicle(null);

    setIsSaved(true);

    setIsActionChecked(false);

    toast.success("Vehicle added successfully");

    // Enable vehicle selection for next item
    setTimeout(() => {
      setIsSaved(false);
    }, 0);
  } else {
    setIsActionChecked(false);
  }
};
 const formatDate = (date?: string) => {
  if (!date) return "";

  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};
  const handleDeleteVehicle = (id: number) => {
  setSelectedVehicles((prev) => prev.filter((item) => item.id !== id));

  setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
};
  return (
    <div className="min-h-screen bg-white p-6 transition-colors duration-200 dark:bg-gray-900">
      {/* Header with Back Button */}
    <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
  <h2 className="text-30 md:text-xl lg:text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap">
    {id ? "Edit Vehicle Stock Transfer" : "Add Vehicle Stock Transfer"}
  </h2>
 <button
  onClick={handleBack}
   className="bg-primary-500 hover:bg-primary-600 cursor-pointer inline-flex w-30 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors sm:w-auto sm:px-5"
           >
             <ArrowLeftIcon className="mr-1.5 size-4" />
             Back
           </button>
</div>
      {/* Row 1: Date, Stock Transfer ID, Branch - 3 columns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <DatePicker
            label="Date *"
            placeholder="Select Date"
            options={{ disableMobile: true }}
            value={watch("date") ? [new Date(watch("date"))] : []}
            onChange={(val: Date[]) => {
              if (val && val[0]) {
                setValue("date", val[0].toISOString().split("T")[0]);
              }
            }}
          />
        </div>
        <div>
          <Input
            label="Stock Transfer ID"
            placeholder="Auto-generated"
            {...register("stockTransferId")}
            readOnly
            className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
          />
        </div>
         <div>
    <div className="mb-1 flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Branch *
      </label>

      <span className="text-sm font-semibold text-green-600">
        Balance : ₹{Number(branchOpeningBalance).toLocaleString("en-IN")}
      </span>
    </div>
<div className="relative">
  <Combobox
    placeholder="Select Branch"
    data={branchOptions}
    value={
      branchOptions.find(
        (item) =>
          Number(item.value) === Number(watch("branch")),
      ) || null
    }
    onChange={(val: any) => {
      setValue("branch", val?.value || "");

      setValue(
        "branchManagerName",
        val?.manager || "",
      );

      setValue(
        "contactNo",
        val?.contact || "",
      );

      setBranchStateCode(
        val?.stateCode || "",
      );

      setBranchOpeningBalance(
        Number(val?.closingBalance || 0),
      );
    }}
  />
</div>
  </div>
      </div>

      {/* Row 2: Branch Manager Name, Contact No - 2 columns */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Input
            label="Branch Manager Name *"
            placeholder="Enter manager name"
            {...register(
              "branchManagerName",
              formValidationRules.branchManagerName,
            )}
            readOnly
            className="cursor-not-allowed bg-gray-100 dark:bg-gray-800"
            error={
              errors?.branchManagerName && errors.branchManagerName.message
            }
          />
        </div>

        <div>
          <Input
            label="Contact No *"
            placeholder="Enter contact number"
            {...register("contactNo", formValidationRules.contactNo)}
            readOnly
            className="cursor-not-allowed bg-gray-100 dark:bg-gray-800"
            error={errors?.contactNo && errors.contactNo.message}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="dark:border-dark-500 my-4 border-b border-dashed border-gray-300"></div>

      {/* Row 3: Select Chassis No - Full width */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
            Select Chassis No *
          </label>
          <Controller
            name="chassisNo"
            control={control}
            rules={{ required: "Chassis number is required" }}
            render={({ field }) => (
              <Select
                options={vehicleOptions}
                components={{ Option: VehicleOption }}
                getOptionLabel={(o: any) => o.chassisNo}
                getOptionValue={(o: any) => o.chassisNo}
                styles={customSelectStyles}
                classNamePrefix="react-select"
                placeholder="Select Vehicle"
                value={
                  vehicleOptions.find(
                    (o: any) => o.chassisNo === field.value,
                  ) || null
                }
                onChange={(selected: any) => {
                  field.onChange(selected?.chassisNo || "");
                }}
                isDisabled={isSaved}
              />
            )}
          />
          {errors.chassisNo && (
            <span className="text-xs text-red-500">
              {errors.chassisNo.message}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="dark:border-dark-500 my-4 border-b border-dashed border-gray-300"></div>

      {/* Vehicle Details - 4 columns grid with Action column on right */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_90px]">
        {/* Fields - 4 columns */}
        <div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <Input
                label="Vehicle Sr. No."
                placeholder="Auto-filled"
                {...register("vehicleSrNo")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="Model"
                placeholder="Auto-filled"
                {...register("model")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="Variant"
                placeholder="Auto-filled"
                {...register("variant")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="Colour"
                placeholder="Auto-filled"
                {...register("colour")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="Item Name"
                placeholder="Auto-filled"
                {...register("itemName")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="Item Code"
                placeholder="Auto-filled"
                {...register("itemCode")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="Chassis No."
                placeholder="Auto-filled"
                {...register("chassisNo")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="Engine No."
                placeholder="Auto-filled"
                {...register("engineNo")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="MFG Date"
                placeholder="Auto-filled"
                {...register("mfgDate")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="Key No."
                placeholder="Auto-filled"
                {...register("keyNo")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="Battery No."
                placeholder="Auto-filled"
                {...register("batteryNo")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="Battery Make"
                placeholder="Auto-filled"
                {...register("batteryMake")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="F1 Tyres No."
                placeholder="Auto-filled"
                {...register("f1TyresNo")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="F2 Tyres No."
                placeholder="Auto-filled"
                {...register("f2TyresNo")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="S1 Tyres No."
                placeholder="Auto-filled"
                {...register("s1TyresNo")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="S2 Tyres No."
                placeholder="Auto-filled"
                {...register("s2TyresNo")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="Location"
                placeholder="Auto-filled"
                {...register("location")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="GRN Number"
                placeholder="Auto-filled"
                {...register("grnNumber")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="GRN Date"
                placeholder="Auto-filled"
                {...register("grnDate")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Input
                label="GRN Record Date"
                placeholder="Auto-filled"
                {...register("grnRecordDate")}
                readOnly
                className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Action Column - 1 column with vertical border */}
        <div className="relative">
          <div className="dark:bg-dark-500 absolute top-0 left-0 h-full w-px bg-gray-300"></div>
          <div className="pl-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Action
            </label>
            <div className="mt-2 flex items-center justify-center">
              <Checkbox
                checked={isActionChecked}
                onChange={(e: any) =>
                  handleActionCheckboxChange(e.target.checked)
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selected Vehicles Table - Always shows if there's data */}
      {selectedVehicles.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Selected Vehicles
          </h3>
          <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table
                hoverable
                className="w-full min-w-450 text-left [&_.table-th]:font-semibold"
              >
                <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
                  <Tr>
                    <Th className="w-12 py-3.5 text-center">
                      <input
                        type="checkbox"
                        className="size-4.5"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </Th>
                    <Th className="w-16 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      S.No
                    </Th>

                    <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Chassis No
                    </Th>
                    <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Vehicle Sr. No
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
                      Item Name
                    </Th>
                    <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Item Code
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
                      F1 Tyres
                    </Th>
                    <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      F2 Tyres
                    </Th>
                    <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      S1 Tyres
                    </Th>
                    <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      S2 Tyres
                    </Th>
                    <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Location
                    </Th>
                    <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      GRN Number
                    </Th>
                    <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      GRN Date
                    </Th>
                    <Th className="py-3.5 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      GRN Record Date
                    </Th>
                    <Th className="py-3.5 whitespace-nowrap">Purchase Price</Th>
                    <Th className="py-3.5 text-center whitespace-nowrap">
  Action
</Th>
                  </Tr>
                </THead>
                <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
                  {selectedVehicles.map((item, index) => {
                    const isRowSelected = selectedIds.includes(item.id);
                    return (
                      <Tr
                        key={item.id}
                        className={`${
                          isRowSelected
                            ? "dark:bg-dark-600/30 bg-gray-50/50"
                            : ""
                        } dark:hover:bg-dark-700/40 transition-colors hover:bg-gray-50/30`}
                      >
                        <Td className="py-4 text-center">
                          <input
                            type="checkbox"
                            className="size-4.5"
                            checked={isRowSelected}
                            onChange={() => handleSelectRow(item.id)}
                          />
                        </Td>
                        <Td className="py-4 font-medium text-gray-500">
                          {index + 1}
                        </Td>

                        <Td className="py-4 font-mono text-sm font-medium whitespace-nowrap text-gray-900 dark:text-gray-400">
                          {item.chassisNo}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {item.serialNo}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {item.modelName || item.model}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                       {item.variantName || item.variant}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          <span
                            className="inline-flex h-3 w-3 rounded-full border border-gray-300"
                            style={{
                              backgroundColor: item.colour.toLowerCase(),
                            }}
                          ></span>
                          <span className="ml-1">{item.colour}</span>
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {item.itemName}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {item.itemCode}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {item.engineNo}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {formatDate(item.mfgDate)}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {item.keyNumber}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {item.batteryNo}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {item.batteryMake}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                         {item.first1TyreNo || item.first1Tyer}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {item.first2TyreNo || item.first2Tyer}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                         {item.second1TyreNo || item.second1Tyer}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {item.second2TyreNo || item.second2Tyer}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {item.location}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {item.grnNo}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {formatDate(item.grnDate)}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {formatDate(item.grnRecordDate)}
                        </Td>
                        <Td className="py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          ₹
                          {Number(item.purchasePriceNoGST || 0).toLocaleString(
                            "en-IN",
                          )}
                        </Td>
                        <Td className="py-4 text-center">
  <button
    type="button"
    onClick={() => handleDeleteVehicle(item.id)}
    className="rounded-md p-2 text-red-500 transition hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30"
  >
    <TrashIcon className="h-5 w-5" />
  </button>
</Td>
                      </Tr>
                    );
                  })}
                </TBody>
              </Table>
            </div>
          </div>
        </div>
      )}
      <div className="mt-10 flex justify-end">
        <div className="w-full max-w-130">
          <div className="rounded-lg border border-gray-200 bg-linear-to-br from-blue-50 to-white p-4 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Bill Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Value
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  ₹{totalValue.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  New Taxable Value
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  ₹{taxableValue.toLocaleString("en-IN")}
                </span>
              </div>

              {isSameState && (
                <>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span>CGST</span>
                    <span>₹{cgst.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <span>SGST</span>
                    <span>₹{sgst.toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}

              {!isSameState && (
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    IGST
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    ₹{igst.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg bg-blue-600/10 p-2 dark:bg-blue-500/20">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Grand Total
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
  <button
    type="button"
    onClick={handleBack}
    className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-100"
  >
    Cancel
  </button>

  <button
    type="button"
    onClick={handleSave}
    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
  >
    {id ? "Update" : "Save"}
  </button>
</div>
    </div>
  );
};

export default AddVehicleStock;
