// src/app/pages/purchase/accessoriesbill.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BuildingOffice2Icon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Radio } from "@/components/ui";
import emptyStateImage from "@/assets/notfound.png";
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import { components } from "react-select";
import apiHelper from "@/utils/apiHelper";
// import { Combobox } from "@/components/shared/form/StyledCombobox";
import { toast } from "sonner";

// ---------- Types ----------
import { useParams } from "react-router-dom";
import { Combobox } from "@/components/shared/form/Combobox";
interface AccessoriesPurchaseBillProps {
  onBack?: () => void;
  onSaved?: (row: any) => void;
}

interface AccessoryOption {
  id: string;
  itemName: string;
  modalName: string;
  itemCodeNo: string;
  hsnCode: string;
}

interface ItemRow {
  id: string;

  accessoryId?: number;
  barCode?: string;
  item: string;
  itemCode: string;
  hsn: string;
  unit: string;
  modelName?: string;
  variantName?: string;
  qty: number;
  stock?: number;

  pPrice: string;
  gstPercent: string;
  gstAmount?: number;
  netAmount: string;
  status?: string;
}

interface PartyOption {
  id: string;
  name: string;
  mobile: number;
  stateCode: string;
}
interface NewAccountData {
  accountName: string;
  mobile: string;
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  district: string;
  city: string;
  address: string;
  panCard: string;
  aadharCard: string;
  group: string;
  openingBalance: string;
  drCr: string;
}

// Accessories Item Form Data (matches the main Accessories form)
interface AccessoryItemFormData {
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
  showroomVariants: any[];
}

// Tractor type
interface TractorData {
  selectModel: string;
  selectVariant: string;
  selectColour: string;
  itemName: string;
  codeNo: string;
  shortName: string;
  hsnCode: string;
  taxSlab: string;
  selectGroup: string;
  fuelType: string;
  fuelCapacity: string;
  purchasePriceWithoutGST: string;
  purchasePriceTaxable: string;
  status: "Active" | "Inactive";
}

type TermsType = "Credit" | "Cash" | "Bank";

type PaymentMode = "UPI" | "NEFT" | "RTGS" | "IMPS" | "CHEQUE" | "CARD";

interface BankDetailsData {
  paymentMode: PaymentMode | "";
  chequeNo: string;
  chequeDate: string;
  clearDate: string;
  narration: string;
}

const emptyBankDetails: BankDetailsData = {
  paymentMode: "UPI",
  chequeNo: "",
  chequeDate: "",
  clearDate: "",
  narration: "",
};

const paymentModeOptions: { label: string; value: PaymentMode }[] = [
  { label: "UPI", value: "UPI" },
  { label: "NEFT", value: "NEFT" },
  { label: "RTGS", value: "RTGS" },
  { label: "IMPS", value: "IMPS" },
  { label: "CHEQUE", value: "CHEQUE" },
  { label: "CARD", value: "CARD" },
];

// ---------- Mock data ----------

const ACCESSORY_OPTIONS: AccessoryOption[] = [
  {
    id: "a1",
    itemName: "Hydraulic Filter",
    modalName: "HF-200",
    itemCodeNo: "ACC-001",
    hsnCode: "8421",
  },
  {
    id: "a2",
    itemName: "Tractor Seat Cover",
    modalName: "TSC-Std",
    itemCodeNo: "ACC-002",
    hsnCode: "8708",
  },
  {
    id: "a3",
    itemName: "Towing Hook",
    modalName: "TH-Heavy",
    itemCodeNo: "ACC-003",
    hsnCode: "7326",
  },
];

const termsOptions = [
  { label: "Credit", value: "Credit" },
  { label: "Cash", value: "Cash" },
  { label: "Bank", value: "Bank" },
];

let rowIdSeq = 1;
const nextRowId = () => `row-${rowIdSeq++}`;

const emptyDraft = (): ItemRow => ({
  id: nextRowId(),
  item: "",
  itemCode: "",
  hsn: "",
  unit: "",
  qty: 1,
  pPrice: "",
  gstPercent: "",
  netAmount: "",
});

const emptyAccount: NewAccountData = {
  accountName: "",
  mobile: "",
  country: "",
  countryCode: "",
  state: "",
  stateCode: "",
  district: "",
  city: "",
  address: "",
  panCard: "",
  aadharCard: "",

  group: "",
  openingBalance: "",
  drCr: "",
};
// ─── Options for Accessories Form ──────────────────────────────────────
const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
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

const modelOptions = [
  { label: "Model A", value: "modelA" },
  { label: "Model B", value: "modelB" },
  { label: "Model C", value: "modelC" },
];

const variantOptions = [
  { label: "Variant 1", value: "variant1" },
  { label: "Variant 2", value: "variant2" },
  { label: "Variant 3", value: "variant3" },
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
const colourOptions = [
  { label: "Red", value: "red" },
  { label: "Blue", value: "blue" },
  { label: "Black", value: "black" },
  { label: "White", value: "white" },
  { label: "Silver", value: "silver" },
];

const fuelTypeOptions = [
  { label: "Diesel", value: "diesel" },
  { label: "Petrol", value: "petrol" },
  { label: "Electric", value: "electric" },
  { label: "CNG", value: "cng" },
];

const emptyTractor: TractorData = {
  selectModel: "",
  selectVariant: "",
  selectColour: "",
  itemName: "",
  codeNo: "",
  shortName: "",
  hsnCode: "",
  taxSlab: "",
  selectGroup: "",
  fuelType: "",
  fuelCapacity: "",
  purchasePriceWithoutGST: "",
  purchasePriceTaxable: "",
  status: "Active",
};

// ─── react-select custom styles ────────────────────────────────────────
const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "transparent",
    borderColor: state.isFocused
      ? "var(--color-primary-600)"
      : "var(--color-gray-300)",
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

// ---------- Main component ----------

const AccessoriesPurchaseBill: React.FC<AccessoriesPurchaseBillProps> = ({
  onBack,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  // ── Main Bill State ────────────────────────────────────────────────────
  const [date, setDate] = useState(() => {
    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [terms, setTerms] = useState<TermsType>("Credit");
  const [cashAccount, setCashAccount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [partyId, setPartyId] = useState("");
  const [parties, setParties] = useState<PartyOption[]>([]);
  const [billNo, setBillNo] = useState("");
  const [purchaseBillNo, setPurchaseBillNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseLocation, setPurchaseLocation] = useState("Main Branch");
  const [dueDate, setDueDate] = useState("");
  const [narration, setNarration] = useState("");

  const [rows, setRows] = useState<ItemRow[]>([]);
  const [draft, setDraft] = useState<ItemRow>(emptyDraft());

  const [accessoryDrawerOpen, setAccessoryDrawerOpen] = useState(false);
  const [accessorySearch, setAccessorySearch] = useState("");

  const [freightCharge, setFreightCharge] = useState("");
  const [insurance, setInsurance] = useState("");
  const [otherCharge, setOtherCharge] = useState("");
  const [roundAmount, setRoundAmount] = useState("");
  const [billVerify, setBillVerify] = useState<"not_verify" | "verify">(
    "not_verify",
  );

  // ── Accounts State (Dynamic from API) ────────────────────────────────
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  // ── Add Accessories Item Modal state ────────────────────────────────
  const [addAccessoryModalOpen, setAddAccessoryModalOpen] = useState(false);
  const [accessoryForm, setAccessoryForm] = useState<AccessoryItemFormData>({
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
    showroomVariants: [],
  });
  const [accessoryFormErrors, setAccessoryFormErrors] = useState<
    Record<string, string>
  >({});
  const [selectedVariants, setSelectedVariants] = useState<any[]>([]);
  const [variantOptionsState, setVariantOptionsState] = useState([]);
  const [accessoryFormTouched, setAccessoryFormTouched] = useState(false);

  // ── Add Tractor Modal state ───────────────────────────────────────────
  const [addTractorModalOpen, setAddTractorModalOpen] = useState(false);
  const [tractorForm, setTractorForm] = useState<TractorData>(emptyTractor);
  const [tractorTouched, setTractorTouched] = useState(false);
  const [accountErrors, setAccountErrors] = useState<
    Partial<Record<keyof NewAccountData, string>>
  >({});
  // ── Bank Details drawer state ────────────────────────────────────────
  const [bankDetailsModalOpen, setBankDetailsModalOpen] = useState(false);
  const [bankDetails, setBankDetails] =
    useState<BankDetailsData>(emptyBankDetails);
  const [bankDetailsTouched, setBankDetailsTouched] = useState(false);
  const formatLocalDate = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseLocalDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    return new Date(dateStr + "T00:00:00");
  };
  // ── Create Account drawer state ──────────────────────────────────────
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountForm, setAccountForm] = useState<NewAccountData>(emptyAccount);
  const [accountTouched, setAccountTouched] = useState(false);
  const [accessories, setAccessories] = useState<any[]>([]);
  const companyId = sessionStorage.getItem("companyId");

  const financialYearId = sessionStorage.getItem("financialYearId");
  const getPurchase = async () => {
    try {
      const res = await apiHelper.get(`/accessories-purchase/${id}`);

      const purchase = res.data; // ✅ not res.data.data

      setPartyId(String(purchase.accountId));
      setBillNo(purchase.billNo);
      setPurchaseBillNo(purchase.purchaseBillNo || "");
      setPurchaseLocation(purchase.purchaseLocation || "");
      setTerms(purchase.terms);

      setPurchaseDate(purchase.purchaseDate?.split("T")[0]);

      setDueDate(purchase.dueDate ? purchase.dueDate.split("T")[0] : "");

      setNarration(purchase.narration || "");

      setCashAccount(
        purchase.cashAccountId ? String(purchase.cashAccountId) : "",
      );

      setBankAccount(
        purchase.bankAccountId ? String(purchase.bankAccountId) : "",
      );

      setBankDetails({
        paymentMode: purchase.paymentMode || "UPI",
        chequeNo: purchase.chequeNo || "",
        chequeDate: purchase.chequeDate
          ? purchase.chequeDate.split("T")[0]
          : "",
        clearDate: purchase.clearDate ? purchase.clearDate.split("T")[0] : "",
        narration: purchase.bankNarration || "",
      });

      setFreightCharge(String(purchase.freightCharge || 0));

      setInsurance(String(purchase.insurance || 0));

      setOtherCharge(String(purchase.otherCharge || 0));

      setRoundAmount(String(purchase.roundAmount || 0));

      setBillVerify(
        purchase.verifyStatus === "verify" ? "verify" : "not_verify",
      );
      setRows(
        purchase.items.map((item: any) => ({
          id: String(item.id),

          accessoryId: item.accessoryId,

          item: item.itemName,

          itemCode: item.itemCode,

          hsn: item.hsnCode,

          unit: item.unit,

          modelName: item.modelName,

          variantName: item.variantName,

          qty: item.qty,

          stock: item.stock,

          pPrice: String(item.purchaseRate),

          gstPercent: String(item.gstPercent),

          gstAmount: item.gstAmount,

          netAmount: String(item.netAmount),
          status: item.status,
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };
  // ── API Functions ────────────────────────────────────────────────────
  const fetchAccessories = async () => {
    try {
      const res = await apiHelper.get("/accessories");

   
      setAccessories(
        Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [],
      );
    } catch (err) {
      console.log(err);
      setAccessories([]);
    }
  };

  // Get Bill Number
  const getBillNo = async () => {
    try {
      const res = await apiHelper.get(
        `/accessories-purchase/generate-bill-no?companyId=${companyId}&financialYearId=${financialYearId}`,
      );
      setBillNo(res.billNo);
    } catch (error) {
      console.error(error);
    }
  };
  // Get Parties (Accounts)
  const getParties = async () => {
    try {
      const res = await apiHelper.get("/accounts");

      const accounts = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      const mapped = accounts
        .filter(
          (acc: any) =>
            acc.group === "Supplier" ||
            acc.group === "Sundry Creditors" ||
            acc.group === "Sundry Creditor (internal)",
        )
        .map((acc: any) => ({
          id: String(acc.id),
          name: acc.accountName,
          mobile: acc.mobile,
          stateCode: acc.stateCode,
        }));

      setParties(mapped);

      return mapped;
    } catch (e) {
      console.log(e);
      return [];
    }
  };
  // Get Cash & Bank Accounts
  const getAccounts = async () => {
    try {
      const res = await apiHelper.get("/accounts");
      const accounts = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      setCashAccounts(
        accounts.filter(
          (acc: any) =>
            acc.group === "Cash-in-Hand" ||
            acc.group === "Cash Account" ||
            acc.group === "Cash",
        ),
      );

      setBankAccounts(
        accounts.filter(
          (acc: any) =>
            acc.group === "Bank Accounts" ||
            acc.group === "Bank Account" ||
            acc.group === "Bank",
        ),
      );
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };
  const groupOptions = [
    {
      label: "Supplier",
      value: "Supplier",
    },
    {
      label: "Sundry Creditors",
      value: "Sundry Creditors",
    },
    {
      label: "Sundry Creditor (internal)",
      value: "Sundry Creditor (internal)",
    },
  ];
  const isCreditorGroup =
    accountForm.group === "Sundry Creditors" ||
    accountForm.group === "Sundry Creditor (internal)";
  const drCrOptions = [
    { label: "Dr", value: "Dr" },
    { label: "Cr", value: "Cr" },
  ];
  const partyOptions = parties.map((p) => ({
    label: p.name,
    mobile: p.mobile,

    value: p.id,
  }));
  const [company, setCompany] = useState<any>(null);

  const getCompany = async () => {
    try {
      const res = await apiHelper.get("/company");

      const companyData = Array.isArray(res.data) ? res.data[0] : res.data;

      setCompany(companyData);
    } catch (err) {
      console.log(err);
    }
  };
  const selectedParty = parties.find((p) => p.id === partyId);

  const isPartySelected = !!partyId;

  const isSameState = company?.stateCode === selectedParty?.stateCode;
  // ── Fetch Showroom Variants ──────────────────────────────────────────
  const fetchShowroomVariants = async () => {
    try {
      const res = await apiHelper.get("/showroom-variant");
      const data = res.data?.data || res.data || [];
      setVariantOptionsState(
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

  // ── Initialize Data ──────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      await getParties();
      await getAccounts();
      await getCompany();
      await fetchShowroomVariants();
      await fetchAccessories();

      if (isEdit) {
        await getPurchase(); // Fetch existing purchase & bill no
      } else {
        await getBillNo(); // Generate new bill no
      }
    };

    loadData();
  }, [id]);

  // ── Accessories Form Handlers ────────────────────────────────────────
  const handleAccessoryFormChange = (
    field: keyof AccessoryItemFormData,
    value: any,
  ) => {
    setAccessoryForm((prev) => ({ ...prev, [field]: value }));
    if (accessoryFormErrors[field]) {
      const newErrors = { ...accessoryFormErrors };
      delete newErrors[field];
      setAccessoryFormErrors(newErrors);
    }
  };

  const handleAccessoryTypeChange = (type: "Accessories" | "Parts") => {
    setAccessoryForm((prev) => ({
      ...prev,
      type,
      itemName: "",
      codeNo: "",
    }));
    const newErrors = { ...accessoryFormErrors };
    delete newErrors.itemName;
    delete newErrors.codeNo;
    setAccessoryFormErrors(newErrors);
  };

  const validateAccessoryForm = () => {
    const newErrors: Record<string, string> = {};
    if (!accessoryForm.itemName.trim())
      newErrors.itemName = "Item Name is required";
    if (!accessoryForm.codeNo.trim()) newErrors.codeNo = "Code No is required";
    if (!accessoryForm.purchasePrice.trim())
      newErrors.purchasePrice = "Purchase Price is required";
    if (!accessoryForm.salesPrice.trim())
      newErrors.salesPrice = "Sales Price is required";
    if (!accessoryForm.mrp.trim()) newErrors.mrp = "MRP is required";
    if (!accessoryForm.opStock.trim())
      newErrors.opStock = "Opening Stock is required";
    if (selectedVariants.length === 0) {
      newErrors.variant = "Variant is required";
    }
    setAccessoryFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAccessoryItem = async () => {
    setAccessoryFormTouched(true);
    if (!validateAccessoryForm()) return;

    try {
      const payload = {
        type: accessoryForm.type,
        itemName: accessoryForm.itemName,
        codeNo: accessoryForm.codeNo,
        shortName: accessoryForm.shortName,
        hsnCode: accessoryForm.hsnCode,
        unit: accessoryForm.unit,
        taxSlab: accessoryForm.taxSlab,
        group: accessoryForm.group,
        purchasePrice: accessoryForm.purchasePrice,
        salesPrice: accessoryForm.salesPrice,
        mrp: accessoryForm.mrp,
        opStock: accessoryForm.opStock,
        barCode: accessoryForm.barCode,
        showroomVariants: selectedVariants.map((v: any) => ({
          id: v.value,
          variantName: v.variantName,
          model: v.model,
        })),
        status: accessoryForm.status,
      };

      await apiHelper.post("/accessories", payload);
      toast.success("Accessory item created successfully!");
      setAddAccessoryModalOpen(false);
      resetAccessoryForm();
    } catch (error: any) {
      console.error("Failed to save accessory:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save accessory item. Please try again.",
      );
    }
  };

  const resetAccessoryForm = () => {
    setAccessoryForm({
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
      showroomVariants: [],
    });
    setSelectedVariants([]);
    setAccessoryFormErrors({});
    setAccessoryFormTouched(false);
  };

  // ── Bank Details Handlers ────────────────────────────────────────────
  const updateBankDetails = (key: keyof BankDetailsData, value: string) =>
    setBankDetails((b) => ({ ...b, [key]: value }));

  const handleSaveBankDetails = () => {
    setBankDetailsTouched(true);
    if (!bankDetails.paymentMode) return;
    if (
      bankDetails.paymentMode === "CHEQUE" &&
      (!bankDetails.chequeNo.trim() || !bankDetails.chequeDate.trim())
    ) {
      return;
    }
    setBankDetailsModalOpen(false);
    setBankDetailsTouched(false);
  };

  const handleCancelBankDetails = () => {
    setBankDetailsModalOpen(false);

    setBankDetailsTouched(false);
  };

  // ── Create Account Handlers ─────────────────────────────────────────
  const updateAccountForm = (key: keyof NewAccountData, value: string) => {
    setAccountForm((f) => ({ ...f, [key]: value }));
  };
  const getAccountError = (field: keyof NewAccountData) => {
    if (!accountTouched) return "";

    switch (field) {
      case "accountName":
        return !accountForm.accountName.trim()
          ? "Account Name is required"
          : "";

      case "group":
        return !accountForm.group ? "Group is required" : "";

      case "openingBalance":
        return isCreditorGroup && !accountForm.openingBalance.trim()
          ? "Opening Balance is required"
          : "";

      case "drCr":
        return isCreditorGroup && !accountForm.drCr
          ? "Dr / Cr is required"
          : "";

      case "mobile":
        if (!accountForm.mobile.trim()) return "Mobile is required";
        if (!/^[0-9]{10}$/.test(accountForm.mobile))
          return "Mobile must be 10 digits";
        return "";

      case "countryCode":
        return !accountForm.countryCode ? "Country is required" : "";

      case "stateCode":
        return !accountForm.stateCode ? "State is required" : "";

      case "district":
        return !accountForm.district ? "District is required" : "";

      case "city":
        return !accountForm.city ? "City is required" : "";

      case "address":
        return !accountForm.address.trim() ? "Address is required" : "";

      case "panCard":
        return !accountForm.panCard.trim() ? "PAN Card is required" : "";

      case "aadharCard":
        return !accountForm.aadharCard.trim() ? "Aadhar Card is required" : "";

      default:
        return "";
    }
  };
  const validateField = (field: keyof NewAccountData, value: string) => {
    let error = "";

    switch (field) {
      case "panCard":
        if (!value.trim()) {
          error = "PAN Card is required";
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value)) {
          error = "Enter a valid PAN Card number";
        }
        break;

      case "aadharCard":
        if (!value.trim()) {
          error = "Aadhar Card is required";
        } else if (!/^\d{12}$/.test(value)) {
          error = "Enter a valid Aadhar Card number";
        }
        break;
    }

    setAccountErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };
  const handleCreateAccount = async () => {
    try {
      const required: (keyof NewAccountData)[] = [
        "accountName",
        "mobile",
        "countryCode",
        "stateCode",
        "district",
        "city",
        "address",
        "panCard",
        "aadharCard",
        "group",
      ];

      const missing = required.filter((k) => !String(accountForm[k]).trim());

      if (isCreditorGroup) {
        if (!accountForm.openingBalance.trim()) {
          missing.push("openingBalance");
        }

        if (!accountForm.drCr.trim()) {
          missing.push("drCr");
        }
      }

      setAccountTouched(true);

      if (missing.length > 0) return;

      const res = await apiHelper.post("/accounts", {
        accountName: accountForm.accountName,
        printName: accountForm.accountName,
        mobile: accountForm.mobile,
        country: accountForm.country,
        countryCode: accountForm.countryCode,
        state: accountForm.state,
        stateCode: accountForm.stateCode,
        district: accountForm.district,
        city: accountForm.city,
        address1: accountForm.address,
        panCard: accountForm.panCard,
        aadharNo: accountForm.aadharCard,
        group: accountForm.group,
        openingBalance: isCreditorGroup
          ? Number(accountForm.openingBalance)
          : 0,

        drCr:
          accountForm.group === "Supplier"
            ? "Cr"
            : isCreditorGroup
              ? accountForm.drCr
              : null,
      });

      const account = res.data;

      if (!account?.id) {
        toast.error("Failed to create account. Invalid response.");
        return;
      }

      const newParty = {
        id: account.id,
        name: account.accountName,
        mobile: Number(accountForm.mobile),
        stateCode: accountForm.stateCode,
      };

      setParties((prev) => [...prev, newParty]);
      setPartyId(account.id);
      toast.success("Account created successfully!");
      setAccountModalOpen(false);
      setAccountForm(emptyAccount);
      setAccountTouched(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create account");
    }
  };

  // ── Tractor handlers ──────────────────────────────────────────────────
  const updateTractorForm = (key: keyof TractorData, value: string) => {
    setTractorForm((f) => ({ ...f, [key]: value }));
  };

  const handleSaveTractor = () => {
    const required: (keyof TractorData)[] = [
      "selectModel",
      "selectVariant",
      "selectColour",
      "itemName",
      "codeNo",
      "purchasePriceWithoutGST",
      "purchasePriceTaxable",
    ];
    const missing = required.filter((k) => !tractorForm[k]?.trim());
    setTractorTouched(true);
    if (missing.length > 0) {
      toast.warning("Please fill all required fields");
      return;
    }

    setAddTractorModalOpen(false);
    setTractorForm(emptyTractor);
    setTractorTouched(false);
    toast.success("Tractor saved successfully!");
  };
  // ── Dynamic Location Data ────────────────────────────────────────────
  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      value: c.isoCode,
      label: c.name,
    }));
  }, []);

  const stateOptions = useMemo(() => {
    if (!accountForm.countryCode) return [];
    return State.getStatesOfCountry(accountForm.countryCode).map((s) => ({
      value: s.isoCode,
      label: s.name,
    }));
  }, [accountForm.countryCode]);

  const cityOptions = useMemo(() => {
    if (!accountForm.countryCode || !accountForm.stateCode) return [];
    return City.getCitiesOfState(
      accountForm.countryCode,
      accountForm.stateCode,
    ).map((c) => ({
      value: c.name,
      label: c.name,
    }));
  }, [accountForm.countryCode, accountForm.stateCode]);

  const districtOptions = cityOptions;
  const calculateNetAmount = (qty: number, price: number, gst: number) => {
    const basicAmount = qty * price;
    const gstAmount = (basicAmount * gst) / 100;
    const netAmount = basicAmount + gstAmount;

    return netAmount.toFixed(2);
  };
  // ── Draft Row Handlers ───────────────────────────────────────────────
  const updateDraft = (key: keyof ItemRow, value: string | number) => {
    setDraft((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      };

      updated.netAmount = calculateNetAmount(
        Number(updated.qty || 0),
        Number(updated.pPrice || 0),
        Number(updated.gstPercent || 0),
      );

      return updated;
    });
  };

  const filteredAccessories = useMemo(() => {
    const q = accessorySearch.toLowerCase();

    return (accessories || []).filter((a: any) =>
      `${a.itemName}
     ${a.codeNo}
     ${a.hsnCode}
     ${a.modelName || ""}
     ${a.variantName || ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [accessorySearch, accessories]);
  const handleAccessorySelect = (a: any) => {
    const qty = draft.qty || 1;
    const price = Number(a.purchasePrice || 0);
    const gst = Number(a.taxSlab || 0);

    setDraft((prev) => ({
      ...prev,
      accessoryId: a.id,
      item: a.itemName,
      itemCode: a.codeNo,
      hsn: a.hsnCode,
      barCode: a.barCode,
      modelName: a.showroomVariantDetails?.[0]?.model?.modelName || "",
      groupName: a.group,
      variantName: a.showroomVariantDetails?.[0]?.variantName || "",
      unit: a.unit,
      qty,
      pPrice: String(price),
      gstPercent: String(gst),
      netAmount: calculateNetAmount(qty, price, gst),
    }));

    setAccessoryDrawerOpen(false);
    setAccessorySearch("");
  };

  const saveDraftRow = () => {
    if (!draft.item.trim()) {
      toast.warning("Please select or enter an Item Name");
      return;
    }
    if (!draft.itemCode.trim()) {
      toast.warning("Please enter Item Code");
      return;
    }
    if (!draft.hsn.trim()) {
      toast.warning("Please enter HSN");
      return;
    }
    if (!draft.unit.trim()) {
      toast.warning("Please enter Unit");
      return;
    }
    if (!draft.qty || draft.qty < 1) {
      toast.warning("Please enter a valid Quantity (minimum 1)");
      return;
    }
    if (!draft.pPrice.trim()) {
      toast.warning("Please enter Purchase Price");
      return;
    }
    if (!draft.gstPercent.trim()) {
      toast.warning("Please enter GST %");
      return;
    }
    if (!draft.netAmount.trim()) {
      toast.warning("Please enter Net Amount");
      return;
    }

    setRows((prev) => {
      const index = prev.findIndex((row) => row.itemCode === draft.itemCode);

      if (index !== -1) {
        const updated = [...prev];
        const oldQty = Number(updated[index].qty);
        const newQty = oldQty + Number(draft.qty);
        updated[index] = {
          ...updated[index],
          qty: newQty,
          netAmount: calculateNetAmount(
            newQty,
            Number(updated[index].pPrice),
            Number(updated[index].gstPercent),
          ),
          status: "Pending",
        };
        return updated;
      }

      return [...prev, draft];
    });

    setDraft(emptyDraft());
    toast.success("Item added successfully!");
  };

  const removeRow = (id: string) =>
    setRows((r) => r.filter((row) => row.id !== id));

  // ── Derived totals ──────────────────────────────────────────────────
  // ── Derived totals ──────────────────────────────────────────────────

  // Total Quantity
  const totalQuantity = rows.reduce(
    (sum, row) => sum + Number(row.qty || 0),
    0,
  );

  // Charges
  const freightNum = Number(freightCharge) || 0;
  const insuranceNum = Number(insurance) || 0;
  const otherNum = Number(otherCharge) || 0;
  const roundNum = Number(roundAmount) || 0;

  // Freight + Insurance + Other Charge
  const freightInsuranceOther = freightNum + insuranceNum + otherNum;

  // Total purchase value without GST
  const totalValue = rows.reduce((sum, row) => {
    const qty = Number(row.qty) || 0;
    const purchasePrice = Number(row.pPrice) || 0;

    return sum + qty * purchasePrice;
  }, 0);

  // Calculation variables
  let totalGST = 0;
  let totalOtherCharges = 0;
  let totalNetAmount = 0;

  // Calculate GST after distributing charges item-wise
  rows.forEach((row) => {
    const qty = Number(row.qty) || 0;
    const purchasePrice = Number(row.pPrice) || 0;
    const gstPercent = Number(row.gstPercent) || 0;

    // Item basic amount
    const itemBasicAmount = purchasePrice * qty;

    // Distribute freight, insurance and other charge
    // according to item purchase value
    const itemOtherCharge =
      totalValue > 0
        ? (itemBasicAmount / totalValue) * freightInsuranceOther
        : 0;

    // GST taxable amount
    const taxableAmount = itemBasicAmount + itemOtherCharge;

    // GST amount
    const gstAmount = isPartySelected ? (taxableAmount * gstPercent) / 100 : 0;

    totalOtherCharges += itemOtherCharge;
    totalGST += gstAmount;

    // Item taxable amount + GST
    totalNetAmount += taxableAmount + gstAmount;
  });

  // Total basic purchase amount
  const totalAmount = Number(totalValue.toFixed(2));

  // Taxable value after adding:
  // Freight + Insurance + Other Charge
  const newTaxableValue = Number((totalValue + totalOtherCharges).toFixed(2));

  // Same state:
  // GST divided into CGST and SGST
  const totalCgst =
    isPartySelected && isSameState ? Number((totalGST / 2).toFixed(2)) : 0;

  const totalSgst =
    isPartySelected && isSameState ? Number((totalGST / 2).toFixed(2)) : 0;

  // Different state:
  // Complete GST goes into IGST
  const totalIgst =
    isPartySelected && !isSameState ? Number(totalGST.toFixed(2)) : 0;

  // Final bill amount
  const grandTotal = Number((newTaxableValue + totalGST + roundNum).toFixed(2));
  const fmt = (n: number) =>
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/purchase/accessories");
    }
  };

  const handleSave = async () => {
    try {
      // Company validation
      if (!companyId || !financialYearId) {
        toast.error("Company or financial year is not selected");
        return;
      }

      // Purchase Bill No validation
      if (!purchaseBillNo.trim()) {
        toast.error("Purchase Bill No is required");
        return;
      }

      // Supplier validation
      if (!partyId) {
        toast.error("Please select Supplier Name");
        return;
      }

      // Item validation
      if (rows.length === 0) {
        toast.error("Please add at least one accessory");
        return;
      }

      // Cash account validation
      if (terms === "Cash" && !cashAccount) {
        toast.error("Please select Cash Account");
        return;
      }

      // Bank account validation
      if (terms === "Bank" && !bankAccount) {
        toast.error("Please select Bank Account");
        return;
      }
      const payload = {
        companyId: Number(companyId),

        financialYearId: Number(financialYearId),
        accountId: partyId,
        purchaseDate: purchaseDate || date,
        purchaseBillNo,
        purchaseLocation,
        dueDate,
        terms,
        narration,
        cashAccountId: terms === "Cash" ? cashAccount : null,
        bankAccountId: terms === "Bank" ? bankAccount : null,
        paymentMode: bankDetails.paymentMode,
        chequeNo: bankDetails.chequeNo,
        chequeDate: bankDetails.chequeDate,
        clearDate: bankDetails.clearDate,
        bankNarration: bankDetails.narration,
        freightCharge: freightNum,
        insurance: insuranceNum,
        otherCharge: otherNum,
        roundAmount: roundNum,
        taxableValue: newTaxableValue,
        totalQty: totalQuantity,
        totalAmount,
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
        grandTotal,
        verifyStatus: billVerify,
        items: rows.map((row: any) => ({
          accessoryId: row.accessoryId || null,
          item: row.item,
          itemCode: row.itemCode,
          hsn: row.hsn,
          unit: row.unit,
          modelName: row.modelName,
          variantName: row.variantName,
          qty: Number(row.qty),
          groupName: row.groupName,
          stock: Number(row.qty),
          pPrice: Number(row.pPrice),
          gstPercent: Number(row.gstPercent),
          gstAmount:
            (Number(row.qty) * Number(row.pPrice) * Number(row.gstPercent)) /
            100,
          netAmount: Number(row.netAmount),
        })),
      };

      if (isEdit) {
        await apiHelper.put(`/accessories-purchase/${id}`, payload);
        toast.success("Purchase Updated Successfully");
      } else {
        await apiHelper.post("/accessories-purchase", payload);
        toast.success("Purchase Saved Successfully");
      }

      navigate("/purchase/accessories");
    } catch (error: any) {
      console.error("Failed to save purchase:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save purchase. Please try again.",
      );
    }
  };

  const handleVerify = async () => {
    if (!id) return;

    try {
      await apiHelper.put(`/accessories-purchase/verify/${id}`, {});
      setBillVerify("verify");
      toast.success("Purchase Verified Successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to verify purchase");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white shadow-sm dark:bg-gray-800">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4 dark:border-gray-700">
          <h1 className="text-lg font-bold text-blue-600 underline sm:text-xl dark:text-blue-400">
            Accessories Purchase Bill
          </h1>
          <button
            onClick={handleBack}
            className="bg-primary-500 hover:bg-primary-600 inline-flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors sm:w-auto sm:px-5"
          >
            <ArrowLeftIcon className="mr-1.5 size-4" />
            Back
          </button>
        </div>

        {/* Top fields */}
        <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 md:p-6 lg:grid-cols-4 xl:grid-cols-6">
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date
            </label>
            <DatePicker
              placeholder="Select Date"
              options={{ disableMobile: true }}
              value={date ? [new Date(date)] : []}
              onChange={(selectedDates: Date[]) => {
                if (selectedDates && selectedDates[0]) {
                  const selectedDate = selectedDates[0];

                  setDate(
                    `${selectedDate.getFullYear()}-${String(
                      selectedDate.getMonth() + 1,
                    ).padStart(2, "0")}-${String(
                      selectedDate.getDate(),
                    ).padStart(2, "0")}`,
                  );
                }
              }}
              className="w-full"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Terms
            </label>
            <Listbox
              data={termsOptions}
              value={
                termsOptions.find((t) => t.value === terms) || termsOptions[0]
              }
              onChange={(val: any) => {
                const selectedTerm = val.value as TermsType;

                setTerms(selectedTerm);

                // Clear Due Date for Cash and Bank
                if (selectedTerm !== "Credit") {
                  setDueDate("");
                }
              }}
              displayField="label"
            />
          </div>

          {terms === "Cash" && (
            <div className="col-span-1">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cash Account
              </label>

              <Combobox
                data={cashAccounts.map((acc) => ({
                  label: acc.accountName,
                  value: acc.id,
                  mobile: acc.mobile,
                  openingBalance: acc.openingBalance,
                }))}
                value={
                  cashAccounts.find((acc) => acc.id === cashAccount)
                    ? {
                        label:
                          cashAccounts.find((acc) => acc.id === cashAccount)
                            ?.accountName || "",
                        value: cashAccount,
                        mobile:
                          cashAccounts.find((acc) => acc.id === cashAccount)
                            ?.mobile || "",
                        openingBalance:
                          cashAccounts.find((acc) => acc.id === cashAccount)
                            ?.openingBalance || 0,
                      }
                    : null
                }
                onChange={(val: any) => setCashAccount(val.value)}
                displayField="label"
                placeholder="Search Cash Account"
                searchFields={["label", "mobile"]}
                columns={[
                  {
                    header: "Account",
                    field: "label",
                    width: "2fr",
                  },

                  {
                    header: "Opening",
                    field: "openingBalance",
                    width: "1fr",
                  },
                ]}
              />
            </div>
          )}
          {terms === "Bank" && (
            <div className="col-span-1">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bank Account
              </label>
              <div className="flex w-full items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Combobox
                    data={bankAccounts.map((acc) => ({
                      label: acc.accountName,
                      value: acc.id,
                      mobile: acc.mobile,
                      openingBalance: acc.openingBalance,
                    }))}
                    value={(() => {
                      const selected = bankAccounts.find(
                        (acc) => Number(acc.id) === Number(bankAccount),
                      );

                      return selected
                        ? {
                            label: selected.accountName,
                            value: selected.id,
                            mobile: selected.mobile,
                            openingBalance: selected.openingBalance,
                          }
                        : null;
                    })()}
                    onChange={(val: any) => {
                      setBankAccount(val.value);
                    }}
                    displayField="label"
                    placeholder="Search Bank Account"
                    searchFields={["label", "mobile"]}
                    columns={[
                      {
                        header: "Account",
                        field: "label",
                        width: "2fr",
                      },
                      {
                        header: "Opening",
                        field: "openingBalance",
                        width: "1fr",
                      },
                    ]}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setBankDetailsModalOpen(true)}
                  className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-blue-600 hover:bg-gray-50 dark:border-gray-600 dark:text-blue-400 dark:hover:bg-gray-700"
                  title="Add Bank Details"
                >
                  <BuildingOffice2Icon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <div className={terms === "Credit" ? "col-span-2" : "col-span-1"}>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Supplier Name
            </label>
            <div className="flex w-full gap-2">
              <div className="min-w-0 flex-1">
                <Combobox
                  data={partyOptions}
                  value={partyOptions.find((x) => x.value === partyId) || null}
                  onChange={(val: any) => setPartyId(val.value)}
                  displayField="label"
                  searchFields={["label", "mobile"]}
                  columns={[
                    {
                      header: "Party",
                      field: "label",
                      width: "2fr",
                    },
                    {
                      header: "Mobile",
                      field: "mobile",
                      width: "1fr",
                    },
                  ]}
                  placeholder="Search Party"
                />
              </div>
              <button
                onClick={() => setAccountModalOpen(true)}
                className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 text-xl text-blue-600 hover:bg-gray-50 dark:border-gray-600 dark:text-blue-400 dark:hover:bg-gray-700"
              >
                +
              </button>
            </div>
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bill No.
            </label>
            <Input
              value={billNo}
              readOnly
              className="w-full bg-gray-50 dark:bg-gray-700"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Purchase Bill No
            </label>
            <Input
              placeholder="Enter Purchase Bill No"
              value={purchaseBillNo}
              onChange={(e) => setPurchaseBillNo(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 gap-3 px-3 pb-3 sm:grid-cols-2 sm:gap-4 sm:px-4 sm:pb-4 md:px-6 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Purchase Date
            </label>
            <DatePicker
              value={purchaseDate ? parseLocalDate(purchaseDate) : undefined}
              onChange={(selectedDates: Date[]) => {
                const val = selectedDates[0];
                if (val instanceof Date && !isNaN(val.getTime())) {
                  setPurchaseDate(formatLocalDate(val));
                }
              }}
              placeholder="Select date..."
              className="w-full"
              options={{ disableMobile: true }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Purchase Location
            </label>
            <Listbox
              data={[
                { label: "Main Branch", value: "Main Branch" },
                { label: "North Branch", value: "North Branch" },
                { label: "South Branch", value: "South Branch" },
              ]}
              value={{ label: purchaseLocation, value: purchaseLocation }}
              onChange={(val: any) => setPurchaseLocation(val.value)}
              displayField="label"
            />
          </div>
          {terms === "Credit" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Due Date
              </label>

              <DatePicker
                value={dueDate ? parseLocalDate(dueDate) : undefined}
                onChange={(selectedDates: Date[]) => {
                  const val = selectedDates[0];

                  if (val instanceof Date && !isNaN(val.getTime())) {
                    setDueDate(formatLocalDate(val));
                  }
                }}
                placeholder="Select date..."
                className="w-full"
                options={{ disableMobile: true }}
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Narration
            </label>
            <Input
              placeholder="Enter Narration"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6">
          <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
            <div className="h-96 overflow-y-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                      ITEM
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                      ITEM NAME
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                      ITEM CODE
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                      HSN
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                      UNIT
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                      QTY
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                      P. PRICE
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                      GST %
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                      NET AMOUNT
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Draft row */}
                  <tr className="sticky top-9 z-10">
                    <td className="border border-gray-500 px-2 py-1.5 text-center dark:border-gray-500">
                      <button
                        onClick={() => setAccessoryDrawerOpen(true)}
                        className="rounded border border-blue-600 px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 dark:border-gray-500">
                      <input
                        placeholder="Enter Item Name"
                        value={draft.item}
                        onChange={(e) => updateDraft("item", e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 dark:border-gray-500">
                      <input
                        placeholder="Enter Code"
                        value={draft.itemCode}
                        onChange={(e) =>
                          updateDraft("itemCode", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 dark:border-gray-500">
                      <input
                        placeholder="HSN"
                        value={draft.hsn}
                        onChange={(e) => updateDraft("hsn", e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 dark:border-gray-500">
                      <input
                        placeholder="Unit"
                        value={draft.unit}
                        onChange={(e) => updateDraft("unit", e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 dark:border-gray-500">
                      <input
                        type="number"
                        min={1}
                        value={draft.qty || ""}
                        onChange={(e) =>
                          updateDraft("qty", Number(e.target.value))
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 dark:border-gray-500">
                      <input
                        placeholder="Rate"
                        value={draft.pPrice}
                        onChange={(e) => updateDraft("pPrice", e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 dark:border-gray-500">
                      <input
                        placeholder="GST"
                        value={draft.gstPercent}
                        onChange={(e) =>
                          updateDraft("gstPercent", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 dark:border-gray-500">
                      <input
                        placeholder="Amount"
                        value={draft.netAmount}
                        onChange={(e) =>
                          updateDraft("netAmount", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center">
                      <button
                        onClick={saveDraftRow}
                        disabled={!draft.item.trim()}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-white ${
                          draft.item.trim()
                            ? "bg-green-600 hover:bg-green-700"
                            : "cursor-not-allowed bg-gray-300"
                        }`}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>

                  {/* Saved rows */}
                  {rows.map((r, index) => (
                    <tr
                      key={r.id}
                      className={`border-t border-gray-200 dark:border-gray-700 ${
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-800/50"
                          : "bg-gray-50 dark:bg-gray-700/30"
                      }`}
                    >
                      <td className="border border-gray-500 px-3 py-2.5 text-center font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 font-medium text-gray-900 dark:text-gray-200">
                        {r.item}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-gray-700 dark:text-gray-300">
                        {r.itemCode}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-gray-700 dark:text-gray-300">
                        {r.hsn}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-gray-700 dark:text-gray-300">
                        {r.unit}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-center font-semibold text-gray-900 dark:text-gray-200">
                        {r.qty}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-gray-700 dark:text-gray-300">
                        {r.pPrice}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-center text-gray-700 dark:text-gray-300">
                        {r.gstPercent}%
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-right font-semibold text-gray-900 dark:text-gray-200">
                        ₹{r.netAmount}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-center">
                        {!r.status || r.status.toLowerCase() === "pending" ? (
                          <button
                            onClick={() => removeRow(r.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="font-semibold text-green-600">
                            <CheckIcon className="mx-auto h-5 w-5 text-green-600" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Empty state */}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <img
                            src={emptyStateImage}
                            alt="No items added"
                            className="max-h-32 w-auto opacity-60 sm:max-h-40"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                const emoji = document.createElement("div");
                                emoji.className = "text-5xl opacity-60";
                                emoji.textContent = "📦";
                                parent.insertBefore(emoji, parent.firstChild);
                              }
                            }}
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            No items added yet. Click{" "}
                            <span className="font-semibold text-blue-600">
                              Add
                            </span>{" "}
                            to add items.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Totals */}
          <div className="mt-4 flex flex-col justify-between gap-2 border-t border-gray-200 pt-4 text-sm font-semibold text-gray-700 sm:flex-row dark:border-gray-700 dark:text-gray-300">
            <span>
              Total Quantity:{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {totalQuantity}
              </span>
            </span>
            <span>
              Total Amount:{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                ₹{fmt(totalValue)}
              </span>
            </span>
          </div>
        </div>

        {/* Charges and summary - Keep the same as before */}
        <div className="grid grid-cols-1 gap-4 px-3 pb-4 sm:px-4 sm:pb-6 md:px-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
              <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Additional Charges
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Freight Charge
                  </label>
                  <Input
                    placeholder="Enter freight"
                    value={freightCharge}
                    onChange={(e) => setFreightCharge(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Insurance
                  </label>
                  <Input
                    placeholder="Enter insurance"
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Other Charge
                  </label>
                  <Input
                    placeholder="Enter other charge"
                    value={otherCharge}
                    onChange={(e) => setOtherCharge(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Round Amount
                  </label>
                  <Input
                    placeholder="Enter round amount"
                    value={roundAmount}
                    onChange={(e) => setRoundAmount(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Bill Verify Radio Buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bill Status:
                </span>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Radio
                    checked={billVerify === "not_verify"}
                    disabled={billVerify === "verify"}
                    onChange={() => setBillVerify("not_verify")}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    Not Verify
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Radio
                    checked={billVerify === "verify"}
                    disabled={billVerify === "verify"}
                    onChange={handleVerify}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    Verify
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
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
                    ₹{fmt(totalValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Freight + Insurance + Other
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    ₹{fmt(freightInsuranceOther)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    New Taxable Value
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    ₹{fmt(newTaxableValue)}
                  </span>
                </div>
                {isPartySelected &&
                  (isSameState ? (
                    <>
                      {/* CGST */}
                      <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          CGST
                        </span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          ₹{fmt(totalCgst)}
                        </span>
                      </div>

                      {/* SGST */}
                      <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          SGST
                        </span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          ₹{fmt(totalSgst)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* IGST */}
                      <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          IGST
                        </span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          ₹{fmt(totalIgst)}
                        </span>
                      </div>
                    </>
                  ))}
                <div className="flex items-center justify-between rounded-lg bg-blue-600/10 p-2 dark:bg-blue-500/20">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    Grand Total
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ₹{fmt(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-center px-3 pb-4 sm:px-4 sm:pb-6">
          <button
            onClick={handleSave}
            className="bg-primary-500 hover:bg-primary-500 w-full rounded-lg px-8 py-2.5 text-sm font-bold text-white transition-colors sm:w-auto sm:px-12 sm:py-3"
          >
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* ========== MODALS (Keep all the same as before) ========== */}

      {/* Accessories Details - Right Drawer */}
      {accessoryDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setAccessoryDrawerOpen(false);
              setAccessorySearch("");
            }}
          />
          <div className="absolute top-0 right-0 h-full w-full max-w-7xl transform bg-white shadow-2xl transition-transform sm:w-3/4 lg:w-1/2 dark:bg-gray-800">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700">
                <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  Accessories Details
                </h2>
                <button
                  onClick={() => {
                    setAccessoryDrawerOpen(false);
                    setAccessorySearch("");
                  }}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="mb-4 flex gap-2">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      placeholder="Search accessories..."
                      value={accessorySearch}
                      onChange={(e) => setAccessorySearch(e.target.value)}
                      className="w-full rounded-lg border border-red-500 bg-white px-4 py-2 pl-10 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                  <button
                    title="Add new accessory item"
                    onClick={() => {
                      setAccessoryDrawerOpen(false);
                      setAddAccessoryModalOpen(true);
                    }}
                    className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white hover:bg-blue-800"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-left whitespace-nowrap dark:bg-gray-700">
                        <th className="w-12 p-2">#</th>
                        <th className="p-2">Item Name</th>
                        <th className="p-2">Item Code </th>
                        <th className="p-2">HSN Code</th>
                        <th className="p-2">Modal</th>
                        <th className="p-2">Variant</th>
                        <th className="p-2">purchase price</th>
                        <th className="p-2">Tax</th>
                        <th className="p-2">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccessories.map((a: any) => (
                        <tr
                          key={a.id}
                          className="border-t border-gray-200 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-900/20"
                        >
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleAccessorySelect(a)}
                              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-green-600 text-white hover:bg-green-700"
                            >
                              ✓
                            </button>
                          </td>
                          <td className="p-2">{a.itemName}</td>

                          <td className="p-2">{a.codeNo}</td>

                          <td className="p-2">{a.hsnCode}</td>

                          <td className="p-2">
                            {a.showroomVariantDetails?.length
                              ? a.showroomVariantDetails
                                  .map((v: any) => v.model?.modelName)
                                  .join(", ")
                              : "-"}
                          </td>

                          <td className="p-2">
                            {" "}
                            {a.showroomVariantDetails?.length
                              ? a.showroomVariantDetails
                                  .map((v: any) => v.variantName)
                                  .join(", ")
                              : "-"}
                          </td>

                          <td className="p-2">
                            ₹{Number(a.purchasePrice || 0).toFixed(2)}
                          </td>

                          <td className="p-2">{a.taxSlab || "-"}</td>

                          <td className="p-2">
                            {a.currentStock ?? a.opStock ?? 0}
                          </td>
                        </tr>
                      ))}

                      {filteredAccessories.length === 0 && (
                        <tr>
                          <td
                            colSpan={9}
                            className="p-4 text-center text-gray-400 dark:text-gray-500"
                          >
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Accessories Item Modal */}
      {addAccessoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setAddAccessoryModalOpen(false);
              resetAccessoryForm();
            }}
          />
          <div className="absolute top-0 right-0 h-full w-full max-w-7xl transform bg-white shadow-2xl transition-transform sm:w-3/4 lg:w-2/3 xl:w-1/2 dark:bg-gray-800">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Add Accessories Item
                </h2>
                <button
                  onClick={() => {
                    setAddAccessoryModalOpen(false);
                    resetAccessoryForm();
                  }}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-5">
                  {/* Type - Radio buttons */}
                  <div>
                    <label className="dark:text-dark-200 mb-2 block text-sm font-medium text-gray-700">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                        <Radio
                          checked={accessoryForm.type === "Accessories"}
                          onChange={() =>
                            handleAccessoryTypeChange("Accessories")
                          }
                        />
                        Accessories
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                        <Radio
                          checked={accessoryForm.type === "Parts"}
                          onChange={() => handleAccessoryTypeChange("Parts")}
                        />
                        Parts
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    {/* Item Name */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        {accessoryForm.type === "Accessories"
                          ? "Accessories Name"
                          : "Part Name"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder={
                          accessoryForm.type === "Accessories"
                            ? "Enter Accessories Name"
                            : "Enter Part Name"
                        }
                        value={accessoryForm.itemName}
                        onChange={(e) =>
                          handleAccessoryFormChange("itemName", e.target.value)
                        }
                        className={`w-full ${
                          accessoryFormTouched && !accessoryForm.itemName.trim()
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      {accessoryFormErrors.itemName && (
                        <span className="text-xs text-red-500">
                          {accessoryFormErrors.itemName}
                        </span>
                      )}
                    </div>

                    {/* Code No */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        {accessoryForm.type === "Accessories"
                          ? "Accessories Code"
                          : "Item Code"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder={
                          accessoryForm.type === "Accessories"
                            ? "Enter Accessories Code"
                            : "Enter Item Code"
                        }
                        value={accessoryForm.codeNo}
                        onChange={(e) =>
                          handleAccessoryFormChange("codeNo", e.target.value)
                        }
                        className={`w-full ${
                          accessoryFormTouched && !accessoryForm.codeNo.trim()
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      {accessoryFormErrors.codeNo && (
                        <span className="text-xs text-red-500">
                          {accessoryFormErrors.codeNo}
                        </span>
                      )}
                    </div>

                    {/* Short Name */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Short Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter Short Name"
                        value={accessoryForm.shortName}
                        onChange={(e) =>
                          handleAccessoryFormChange("shortName", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>

                    {/* HSN Code */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        HSN Code
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter HSN Code"
                        value={accessoryForm.hsnCode}
                        onChange={(e) =>
                          handleAccessoryFormChange("hsnCode", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Unit
                      </label>
                      <Listbox
                        data={unitOptions}
                        value={
                          unitOptions.find(
                            (u) => u.value === accessoryForm.unit,
                          ) || null
                        }
                        onChange={(val: any) =>
                          handleAccessoryFormChange("unit", val.value)
                        }
                        displayField="label"
                        placeholder="Select Unit"
                      />
                    </div>
                    {/* Tax Slab */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Tax Slab
                      </label>
                      <Listbox
                        data={taxSlabOptions}
                        value={
                          taxSlabOptions.find(
                            (t) => t.value === accessoryForm.taxSlab,
                          ) || null
                        }
                        onChange={(val: any) =>
                          handleAccessoryFormChange("taxSlab", val.value)
                        }
                        displayField="label"
                        placeholder="Search Tax Slab"
                      />
                    </div>

                    {/* List of Group */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        List of Group
                      </label>
                      <Listbox
                        data={groupOptions}
                        value={
                          groupOptions.find(
                            (g) => g.value === accessoryForm.group,
                          ) || null
                        }
                        onChange={(val: any) =>
                          handleAccessoryFormChange("group", val.value)
                        }
                        displayField="label"
                        placeholder="Search Group"
                      />
                    </div>

                    {/* Purchase Price */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Purchase Price (Without GST)
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter Purchase Price"
                        value={accessoryForm.purchasePrice}
                        onChange={(e) =>
                          handleAccessoryFormChange(
                            "purchasePrice",
                            e.target.value,
                          )
                        }
                        className={`w-full ${
                          accessoryFormTouched &&
                          !accessoryForm.purchasePrice.trim()
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      {accessoryFormErrors.purchasePrice && (
                        <span className="text-xs text-red-500">
                          {accessoryFormErrors.purchasePrice}
                        </span>
                      )}
                    </div>

                    {/* Sales Price */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Sales Price (Without GST)
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter Sales Price"
                        value={accessoryForm.salesPrice}
                        onChange={(e) =>
                          handleAccessoryFormChange(
                            "salesPrice",
                            e.target.value,
                          )
                        }
                        className={`w-full ${
                          accessoryFormTouched &&
                          !accessoryForm.salesPrice.trim()
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      {accessoryFormErrors.salesPrice && (
                        <span className="text-xs text-red-500">
                          {accessoryFormErrors.salesPrice}
                        </span>
                      )}
                    </div>

                    {/* MRP */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        MRP <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter MRP"
                        value={accessoryForm.mrp}
                        onChange={(e) =>
                          handleAccessoryFormChange("mrp", e.target.value)
                        }
                        className={`w-full ${
                          accessoryFormTouched && !accessoryForm.mrp.trim()
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      {accessoryFormErrors.mrp && (
                        <span className="text-xs text-red-500">
                          {accessoryFormErrors.mrp}
                        </span>
                      )}
                    </div>

                    {/* Opening Stock */}
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Opening Stock <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter Opening Stock"
                        value={accessoryForm.opStock}
                        onChange={(e) =>
                          handleAccessoryFormChange("opStock", e.target.value)
                        }
                        className={`w-full ${
                          accessoryFormTouched && !accessoryForm.opStock.trim()
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      {accessoryFormErrors.opStock && (
                        <span className="text-xs text-red-500">
                          {accessoryFormErrors.opStock}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Barcode
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter Barcode"
                        value={accessoryForm.barCode}
                        onChange={(e) =>
                          handleAccessoryFormChange("barCode", e.target.value)
                        }
                      />
                    </div>
                    {/* Variant */}
                    <div className="lg:col-span-3">
                      <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                        Variant <span className="text-red-500">*</span>
                      </label>
                      <Select
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        styles={customSelectStyles}
                        options={variantOptionsState}
                        value={selectedVariants}
                        onChange={(selected) =>
                          setSelectedVariants(selected as any[])
                        }
                        components={{
                          Option: (props: any) => (
                            <components.Option {...props}>
                              <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={props.isSelected}
                                    readOnly
                                  />
                                  <span>{props.data.variantName}</span>
                                </div>
                                <span className="text-xs text-white">
                                  {props.data.model}
                                </span>
                              </div>
                            </components.Option>
                          ),
                        }}
                        placeholder="Select Variant"
                      />
                      {accessoryFormErrors.variant && (
                        <span className="text-xs text-red-500">
                          {accessoryFormErrors.variant}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <Listbox
                      data={statusOptions}
                      value={
                        statusOptions.find(
                          (s) => s.value === accessoryForm.status,
                        ) || null
                      }
                      onChange={(val: any) =>
                        handleAccessoryFormChange("status", val.value)
                      }
                      displayField="label"
                      placeholder="Select Status"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 sm:p-6 dark:border-gray-700">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                  <button
                    onClick={() => {
                      setAddAccessoryModalOpen(false);
                      resetAccessoryForm();
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto sm:px-6 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAccessoryItem}
                    className="bg-primary-500 hover:bg-primary-500 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white sm:w-auto sm:px-6"
                  >
                    Save Accessory
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Tractor Modal */}
      {addTractorModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setAddTractorModalOpen(false);
              setTractorForm(emptyTractor);
              setTractorTouched(false);
            }}
          />
          <div className="absolute top-0 right-0 h-full w-full max-w-7xl transform bg-white shadow-2xl transition-transform sm:w-3/4 lg:w-1/2 dark:bg-gray-800">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Add Tractor
                </h2>
                <button
                  onClick={() => {
                    setAddTractorModalOpen(false);
                    setTractorForm(emptyTractor);
                    setTractorTouched(false);
                  }}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  {/* Tractor form fields - same as before */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Model <span className="text-red-500">*</span>
                    </label>
                    <Listbox
                      data={modelOptions}
                      value={
                        modelOptions.find(
                          (o) => o.value === tractorForm.selectModel,
                        ) || null
                      }
                      onChange={(val: any) =>
                        updateTractorForm("selectModel", val.value)
                      }
                      displayField="label"
                      placeholder="Select Model"
                    />
                    {tractorTouched && !tractorForm.selectModel && (
                      <p className="mt-1 text-xs text-red-500">
                        Please select a model.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Variant <span className="text-red-500">*</span>
                    </label>
                    <Listbox
                      data={variantOptions}
                      value={
                        variantOptions.find(
                          (o) => o.value === tractorForm.selectVariant,
                        ) || null
                      }
                      onChange={(val: any) =>
                        updateTractorForm("selectVariant", val.value)
                      }
                      displayField="label"
                      placeholder="Select Variant"
                    />
                    {tractorTouched && !tractorForm.selectVariant && (
                      <p className="mt-1 text-xs text-red-500">
                        Please select a variant.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Colour <span className="text-red-500">*</span>
                    </label>
                    <Listbox
                      data={colourOptions}
                      value={
                        colourOptions.find(
                          (o) => o.value === tractorForm.selectColour,
                        ) || null
                      }
                      onChange={(val: any) =>
                        updateTractorForm("selectColour", val.value)
                      }
                      displayField="label"
                      placeholder="Select Colour"
                    />
                    {tractorTouched && !tractorForm.selectColour && (
                      <p className="mt-1 text-xs text-red-500">
                        Please select a colour.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter Item Name"
                      value={tractorForm.itemName}
                      onChange={(e) =>
                        updateTractorForm("itemName", e.target.value)
                      }
                      className={`w-full ${
                        tractorTouched && !tractorForm.itemName.trim()
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Code No <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter Code No"
                      value={tractorForm.codeNo}
                      onChange={(e) =>
                        updateTractorForm("codeNo", e.target.value)
                      }
                      className={`w-full ${
                        tractorTouched && !tractorForm.codeNo.trim()
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Short Name
                    </label>
                    <Input
                      placeholder="Enter Short Name"
                      value={tractorForm.shortName}
                      onChange={(e) =>
                        updateTractorForm("shortName", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      HSN Code
                    </label>
                    <Input
                      placeholder="Enter HSN Code"
                      value={tractorForm.hsnCode}
                      onChange={(e) =>
                        updateTractorForm("hsnCode", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tax Slab
                    </label>
                    <Listbox
                      data={taxSlabOptions}
                      value={
                        taxSlabOptions.find(
                          (o) => o.value === tractorForm.taxSlab,
                        ) || null
                      }
                      onChange={(val: any) =>
                        updateTractorForm("taxSlab", val.value)
                      }
                      displayField="label"
                      placeholder="Select Tax Slab"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      List of Group
                    </label>
                    <Listbox
                      data={groupOptions}
                      value={
                        groupOptions.find(
                          (o) => o.value === tractorForm.selectGroup,
                        ) || null
                      }
                      onChange={(val: any) =>
                        updateTractorForm("selectGroup", val.value)
                      }
                      displayField="label"
                      placeholder="Select Group"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type of Fuel
                    </label>
                    <Listbox
                      data={fuelTypeOptions}
                      value={
                        fuelTypeOptions.find(
                          (o) => o.value === tractorForm.fuelType,
                        ) || null
                      }
                      onChange={(val: any) =>
                        updateTractorForm("fuelType", val.value)
                      }
                      displayField="label"
                      placeholder="Select Fuel Type"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fuel Capacity
                    </label>
                    <Input
                      placeholder="Enter Fuel Capacity"
                      value={tractorForm.fuelCapacity}
                      onChange={(e) =>
                        updateTractorForm("fuelCapacity", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Purchase Price (Without GST){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter Purchase Price"
                      value={tractorForm.purchasePriceWithoutGST}
                      onChange={(e) =>
                        updateTractorForm(
                          "purchasePriceWithoutGST",
                          e.target.value,
                        )
                      }
                      className={`w-full ${
                        tractorTouched &&
                        !tractorForm.purchasePriceWithoutGST.trim()
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Purchase Price (Taxable){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter Taxable Price"
                      value={tractorForm.purchasePriceTaxable}
                      onChange={(e) =>
                        updateTractorForm(
                          "purchasePriceTaxable",
                          e.target.value,
                        )
                      }
                      className={`w-full ${
                        tractorTouched &&
                        !tractorForm.purchasePriceTaxable.trim()
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <Listbox
                      data={[
                        { label: "Active", value: "Active" },
                        { label: "Inactive", value: "Inactive" },
                      ]}
                      value={
                        [
                          { label: "Active", value: "Active" },
                          { label: "Inactive", value: "Inactive" },
                        ].find((o) => o.value === tractorForm.status) || {
                          label: "Active",
                          value: "Active",
                        }
                      }
                      onChange={(val: any) =>
                        updateTractorForm("status", val.value)
                      }
                      displayField="label"
                      placeholder="Select Status"
                    />
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 p-4 sm:p-6 dark:border-gray-700">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                  <button
                    onClick={() => {
                      setAddTractorModalOpen(false);
                      setTractorForm(emptyTractor);
                      setTractorTouched(false);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto sm:px-6 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTractor}
                    className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 sm:w-auto sm:px-6"
                  >
                    Save Tractor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {bankDetailsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancelBankDetails}
          />
          <div className="absolute top-0 right-0 h-full w-full max-w-lg transform bg-white shadow-2xl transition-transform sm:w-3/4 lg:w-2/5 dark:bg-gray-800">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Bank Details
                </h2>
                <button
                  onClick={handleCancelBankDetails}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                    {paymentModeOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
                      >
                        <Radio
                          checked={bankDetails.paymentMode === opt.value}
                          onChange={() =>
                            updateBankDetails("paymentMode", opt.value)
                          }
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {bankDetailsTouched && !bankDetails.paymentMode && (
                    <p className="mt-1 text-xs text-red-500">
                      Please select a payment mode.
                    </p>
                  )}
                </div>

                {bankDetails.paymentMode === "CHEQUE" && (
                  <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cheque No <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Enter Cheque No"
                        value={bankDetails.chequeNo}
                        onChange={(e) =>
                          updateBankDetails("chequeNo", e.target.value)
                        }
                        className={`w-full ${
                          bankDetailsTouched && !bankDetails.chequeNo.trim()
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cheque Date <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        value={
                          bankDetails.chequeDate
                            ? parseLocalDate(bankDetails.chequeDate)
                            : undefined
                        }
                        options={{ disableMobile: true }}
                        onChange={(selectedDates: Date[]) => {
                          updateBankDetails(
                            "chequeDate",
                            formatLocalDate(selectedDates[0] || null),
                          );
                        }}
                        placeholder="Select date..."
                        className={`w-full ${
                          bankDetailsTouched && !bankDetails.chequeDate.trim()
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Clear Date
                      </label>
                      <DatePicker
                        value={
                          bankDetails.clearDate
                            ? parseLocalDate(bankDetails.clearDate)
                            : undefined
                        }
                        options={{ disableMobile: true }}
                        onChange={(selectedDates: Date[]) => {
                          updateBankDetails(
                            "clearDate",
                            formatLocalDate(selectedDates[0] || null),
                          );
                        }}
                        placeholder="Select date..."
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Narration
                  </label>
                  <textarea
                    placeholder="Enter Narration"
                    value={bankDetails.narration}
                    onChange={(e) =>
                      updateBankDetails("narration", e.target.value)
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 p-4 sm:p-6 dark:border-gray-700">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                  <button
                    onClick={handleCancelBankDetails}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto sm:px-6 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBankDetails}
                    className="bg-primary-500 hover:bg-primary-500 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white sm:w-auto sm:px-6"
                  >
                    Add Bank Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {accountModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setAccountModalOpen(false);
              setAccountForm(emptyAccount);
              setAccountTouched(false);
            }}
          />
          <div className="absolute top-0 right-0 h-full w-full max-w-3xl transform bg-white shadow-2xl transition-transform sm:w-3/4 lg:w-1/2 dark:bg-gray-800">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Create Account
                </h2>
                <button
                  onClick={() => {
                    setAccountModalOpen(false);
                    setAccountForm(emptyAccount);
                    setAccountTouched(false);
                  }}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {/* Account Name */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                      Account Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter Account Name"
                      value={accountForm.accountName}
                      onChange={(e) =>
                        updateAccountForm("accountName", e.target.value)
                      }
                      className={`w-full ${accountTouched && !accountForm.accountName.trim() ? "border-red-500" : ""}`}
                    />
                    {getAccountError("accountName") && (
                      <p className="mt-1 text-xs text-red-500">
                        {getAccountError("accountName")}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Group
                    </label>

                    <Listbox
                      data={groupOptions}
                      value={
                        groupOptions.find(
                          (x) => x.value === accountForm.group,
                        ) || null
                      }
                      onChange={(val: any) =>
                        updateAccountForm("group", val?.value || "")
                      }
                      placeholder="Select Group"
                    />
                    {getAccountError("group") && (
                      <p className="mt-1 text-xs text-red-500">
                        {getAccountError("group")}
                      </p>
                    )}
                  </div>

                  {accountForm.group === "Sundry Creditor" && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs font-medium">
                          Opening Balance
                        </label>

                        <Input
                          placeholder="Opening Balance"
                          value={accountForm.openingBalance}
                          onChange={(e) =>
                            updateAccountForm("openingBalance", e.target.value)
                          }
                        />
                        {getAccountError("openingBalance") && (
                          <p className="mt-1 text-xs text-red-500">
                            {getAccountError("openingBalance")}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium">
                          Dr / Cr
                        </label>

                        <Listbox
                          data={drCrOptions}
                          value={
                            drCrOptions.find(
                              (x) => x.value === accountForm.drCr,
                            ) || null
                          }
                          onChange={(val: any) =>
                            updateAccountForm("drCr", val?.value || "")
                          }
                          placeholder="Select Dr / Cr"
                        />
                        {getAccountError("drCr") && (
                          <p className="mt-1 text-xs text-red-500">
                            {getAccountError("drCr")}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  {/* Mobile */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Mobile"
                      value={accountForm.mobile}
                      onChange={(e) =>
                        updateAccountForm("mobile", e.target.value)
                      }
                      className={`w-full ${accountTouched && !accountForm.mobile.trim() ? "border-red-500" : ""}`}
                    />
                    {getAccountError("mobile") && (
                      <p className="mt-1 text-xs text-red-500">
                        {getAccountError("mobile")}
                      </p>
                    )}
                  </div>

                  {/* Country - Dynamic with react-select */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={countryOptions}
                      styles={customSelectStyles}
                      classNamePrefix="react-select"
                      placeholder="Search Country"
                      value={
                        countryOptions.find(
                          (option) => option.value === accountForm.countryCode,
                        ) || null
                      }
                      onChange={(selected) => {
                        updateAccountForm("countryCode", selected?.value || "");
                        updateAccountForm("country", selected?.label || "");
                        updateAccountForm("stateCode", "");
                        updateAccountForm("state", "");
                        updateAccountForm("district", "");
                        updateAccountForm("city", "");
                      }}
                    />
                    {getAccountError("countryCode") && (
                      <p className="mt-1 text-xs text-red-500">
                        {getAccountError("countryCode")}
                      </p>
                    )}
                  </div>

                  {/* State - Dynamic with react-select */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={stateOptions}
                      styles={customSelectStyles}
                      classNamePrefix="react-select"
                      placeholder="Search State"
                      isDisabled={!accountForm.countryCode}
                      value={
                        stateOptions.find(
                          (option) => option.value === accountForm.stateCode,
                        ) || null
                      }
                      onChange={(selected) => {
                        updateAccountForm("stateCode", selected?.value || "");
                        updateAccountForm("state", selected?.label || "");
                        updateAccountForm("district", "");
                        updateAccountForm("city", "");
                      }}
                    />
                    {getAccountError("stateCode") && (
                      <p className="mt-1 text-xs text-red-500">
                        {getAccountError("stateCode")}
                      </p>
                    )}
                  </div>

                  {/* District - Dynamic with react-select */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                      District <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={districtOptions}
                      styles={customSelectStyles}
                      classNamePrefix="react-select"
                      placeholder="Search District"
                      isDisabled={!accountForm.stateCode}
                      value={
                        districtOptions.find(
                          (option) => option.value === accountForm.district,
                        ) || null
                      }
                      onChange={(selected) => {
                        updateAccountForm("district", selected?.value || "");
                      }}
                    />
                    {getAccountError("district") && (
                      <p className="mt-1 text-xs text-red-500">
                        {getAccountError("district")}
                      </p>
                    )}
                  </div>

                  {/* City - Dynamic with react-select */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={cityOptions}
                      styles={customSelectStyles}
                      classNamePrefix="react-select"
                      placeholder="Search City"
                      isDisabled={!accountForm.stateCode}
                      value={
                        cityOptions.find(
                          (option) => option.value === accountForm.city,
                        ) || null
                      }
                      onChange={(selected) => {
                        updateAccountForm("city", selected?.value || "");
                      }}
                    />
                    {getAccountError("city") && (
                      <p className="mt-1 text-xs text-red-500">
                        {getAccountError("city")}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter Address"
                      value={accountForm.address}
                      onChange={(e) =>
                        updateAccountForm("address", e.target.value)
                      }
                      className={`w-full ${accountTouched && !accountForm.address.trim() ? "border-red-500" : ""}`}
                    />
                    {getAccountError("address") && (
                      <p className="mt-1 text-xs text-red-500">
                        {getAccountError("address")}
                      </p>
                    )}
                  </div>

                  {/* PAN Card */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                      PAN Card <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="PAN Card Number"
                      value={accountForm.panCard}
                      onChange={(e) => {
                        updateAccountForm(
                          "panCard",
                          e.target.value.toUpperCase(),
                        );
                        validateField("panCard", e.target.value.toUpperCase());
                      }}
                      error={accountErrors.panCard}
                      className={`w-full ${accountTouched && !accountForm.panCard.trim() ? "border-red-500" : ""}`}
                    />
                    {/* {getAccountError("panCard") && (
  <p className="mt-1 text-xs text-red-500">
    {getAccountError("panCard")}
  </p>
)} */}
                  </div>
                  {/* Aadhar Card */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                      Aadhar Card No <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Aadhar Number"
                      value={accountForm.aadharCard}
                      onChange={(e) => {
                        updateAccountForm("aadharCard", e.target.value);
                        validateField("aadharCard", e.target.value);
                      }}
                      error={accountErrors.aadharCard}
                      className={`w-full ${accountTouched && !accountForm.aadharCard.trim() ? "border-red-500" : ""}`}
                    />
                    {/* {getAccountError("aadharCard") && (
  <p className="mt-1 text-xs text-red-500">
    {getAccountError("aadharCard")}
  </p>
)} */}
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 p-4 sm:p-6 dark:border-gray-700">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                  <button
                    onClick={() => {
                      setAccountModalOpen(false);
                      setAccountForm(emptyAccount);
                      setAccountTouched(false);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto sm:px-6 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAccount}
                    className="bg-primary-500 hover:bg-primary-500 w-full cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white sm:w-auto sm:px-6"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessoriesPurchaseBill;
