// src/app/pages/purchase/tractor/add.tsx
import React, { useState, useMemo, useEffect } from "react";
import type { PurchaseRegisterRow } from "./register";
import { useNavigate, useParams } from "react-router-dom";
import {
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { DatePicker } from "@/components/shared/form/Datepicker";
// import { Combobox } from "@/components/shared/form/StyledCombobox";
import emptyStateImage from "@/assets/notfound.png";
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import { Radio } from "@/components/ui";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";
// ---------- Types ----------
import { PlusIcon } from "@heroicons/react/24/outline";
// import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Combobox } from "@/components/shared/form/Combobox";
interface TractorPurchaseBillProps {
  onBack?: () => void;
  onSaved?: (row: PurchaseRegisterRow) => void;
}

interface VehicleOption {
  id: number;
  itemName: string;
  model: string;
  itemCode: string;
  variant: string;
  colour: string;

  shortName: string;
  hsnCode: string;
  taxSlab: string;
  typeOfFuel: string;
  fuelCapacity: string;
  purchasePriceNoGST: number;
  purchasePriceTaxable: number;
  status: string;
}

interface ItemRow {
  id: string;

  item: string;
  itemCode: string;

  shortName: string;
  hsnCode: string;
  taxSlab: string;

  modelName: string;
  variantName: string;

  typeOfFuel: string;
  fuelCapacity: string;

  color: string;

  chassisNo: string;
  engineNo: string;

  qty: number;
  ratePer: string;
  gstPercent: string;
  amount: string;
  saved: boolean;
  inwardStatus: "Pending" | "Inward";
}

interface PartyOption {
  id: string;
  name: string;
  mobile: number;
  stateCode: string;
  openingBalance: number;
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

type TermsType = "Credit" | "Cash" | "Bank";

type PaymentMode = "UPI" | "NEFT" | "RTGS" | "IMPS" | "CHEQUE" | "CARD";

interface BankDetailsData {
  paymentMode: PaymentMode | "UPI";
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

const termsOptions = [
  { label: "Credit", value: "Credit" },
  { label: "Cash", value: "Cash" },
  { label: "Bank", value: "Bank" },
];

let rowIdSeq = 1;
const nextRowId = () => `row-${rowIdSeq++}`;

// ---------- Main component ----------
const DEFAULT_QTY = 1;

const emptyDraft = (): ItemRow => ({
  id: nextRowId(),

  item: "",
  itemCode: "",

  shortName: "",
  hsnCode: "",
  taxSlab: "",

  modelName: "",
  variantName: "",

  typeOfFuel: "",
  fuelCapacity: "",

  color: "",

  chassisNo: "",
  engineNo: "",

  qty: DEFAULT_QTY,
  ratePer: "",
  gstPercent: "",
  amount: "",

  saved: false,
  inwardStatus: "Pending",
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

// ─── react-select custom styles ──────────────────────────────────────────
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
    color: "var(--color-gray-100)",
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

const TractorPurchaseBill: React.FC<TractorPurchaseBillProps> = ({
  onBack,
  // onSaved,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = !!id;
  const [date, setDate] = useState(() => {
    const today = new Date();

    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [billNo, setBillNo] = useState("");
  const [terms, setTerms] = useState<TermsType>("Credit");
  const [cashAccount, setCashAccount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [partyId, setPartyId] = useState("");
  const [parties, setParties] = useState<PartyOption[]>([]);
  // const [billNo] = useState("p/V/25-26/001");
  const [purchaseBillNo, setPurchaseBillNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseLocation, setPurchaseLocation] = useState("Main Branch");
  const [dueDate, setDueDate] = useState("");
  const [narration, setNarration] = useState("");
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [draft, setDraft] = useState<ItemRow>(emptyDraft());
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [freightCharge, setFreightCharge] = useState("");
  const [insurance, setInsurance] = useState("");
  const [otherCharge, setOtherCharge] = useState("");
  const [roundAmount, setRoundAmount] = useState("");
  const [billVerify, setBillVerify] = useState<"not_verify" | "verify">(
    "not_verify",
  );
  const [vehicleSearch, setVehicleSearch] = useState("");
  // const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});
  // Account form state
  const [accountForm, setAccountForm] = useState<NewAccountData>(emptyAccount);
  const [accountTouched, setAccountTouched] = useState(false);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [bankDetailsModalOpen, setBankDetailsModalOpen] = useState(false);
  const [bankDetails, setBankDetails] =
    useState<BankDetailsData>(emptyBankDetails);
  const [bankDetailsTouched, setBankDetailsTouched] = useState(false);
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
  const companyId = Number(sessionStorage.getItem("companyId"));

  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const updateBankDetails = (key: keyof BankDetailsData, value: string) =>
    setBankDetails((b) => ({ ...b, [key]: value }));
  const [accountErrors, setAccountErrors] = useState<
    Partial<Record<keyof NewAccountData, string>>
  >({});
  const selectedGroup = accountForm.group;
  const isCreditorGroup =
    accountForm.group === "Sundry Creditors" ||
    accountForm.group === "Sundry Creditor (internal)";
  const groupOptions = [
    { label: "Supplier", value: "Supplier" },
    { label: "Sundry Creditors", value: "Sundry Creditors" },
    {
      label: "Sundry Creditor (internal)",
      value: "Sundry Creditor (internal)",
    },
  ];

  const drCrOptions = [
    { label: "Dr", value: "Dr" },
    { label: "Cr", value: "Cr" },
  ];
  const [company, setCompany] = useState<any>(null);

  const getCompany = async () => {
    try {
      const res = await apiHelper.get("/company");

      const companies = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      const selectedCompany = companies.find(
        (item: any) => Number(item.id) === Number(companyId),
      );

      if (!selectedCompany) {
        toast.error("Selected company was not found");
        return;
      }

      setCompany(selectedCompany);
    } catch (error) {
      console.error(error);
    }
  };
  const getTractors = async () => {
    try {
      const res = await apiHelper.get("/tractors");

      const tractors = res.data || [];

      setVehicleOptions(
        tractors.map((item: any) => ({
          id: item.id,
          itemName: item.itemName,
          model: item.model?.modelName || "",
          itemCode: item.codeNo,
          variant: item.showroomVariant?.variantName || "",
          colour: item.colour?.colourName || "",

          shortName: item.shortName,
          hsnCode: item.hsnCode,
          taxSlab: item.taxSlab,
          typeOfFuel: item.typeOfFuel,
          fuelCapacity: item.fuelCapacity,
          purchasePriceNoGST: item.purchasePriceNoGST,
          purchasePriceTaxable: item.purchasePriceTaxable,
          status: item.status,

          ratePer: item.purchasePriceNoGST,
          gstPercent: item.taxSlab,
          amount: item.purchasePriceTaxable,
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };
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

  // ─── Dynamic Location Data ──────────────────────────────────────────────────
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
  const selectedParty = parties.find((p) => p.id === partyId);

  const isSameState = company?.stateCode === selectedParty?.stateCode;
  // Use cityOptions for district as well

  const isPartySelected = !!partyId;
  const districtOptions = cityOptions;
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
  // ----- derived totals -----
  // const totalQuantity = rows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0);
  // const totalAmount = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  // const freightNum = Number(freightCharge) || 0;
  // const insuranceNum = Number(insurance) || 0;
  // const otherNum = Number(otherCharge) || 0;
  // const roundNum = Number(roundAmount) || 0;
  // const freightInsuranceOther = freightNum + insuranceNum + otherNum;
  // const newTaxableValue = totalAmount + freightInsuranceOther;
  // const grandTotal = newTaxableValue + roundNum;
  const totalQuantity = rows.reduce((sum, r) => sum + Number(r.qty || 0), 0);

  const totalAmount = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalPurchasePrice = rows.reduce(
    (sum, r) => sum + Number(r.ratePer) * Number(r.qty || 1),
    0,
  );
  const freightNum = Number(freightCharge) || 0;
  const insuranceNum = Number(insurance) || 0;
  const otherNum = Number(otherCharge) || 0;
  const roundNum = Number(roundAmount) || 0;

  const freightInsuranceOther = freightNum + insuranceNum + otherNum;

  // Purchase value (Without GST)
  const totalValue = rows.reduce(
    (sum, r) => sum + Number(r.ratePer) * Number(r.qty || 1),
    0,
  );

  let totalGST = 0;
  let totalOtherCharges = 0;
  let totalNetAmount = 0;

  rows.forEach((r) => {
    const purchasePrice = Number(r.ratePer) * Number(r.qty || 1);

    let otherChargesAmount = 0;

    if (freightInsuranceOther > 0 && totalValue > 0) {
      otherChargesAmount = (purchasePrice / totalValue) * freightInsuranceOther;
    }

    const taxableAmount = purchasePrice + otherChargesAmount;

    const gstAmount = isPartySelected
      ? (taxableAmount * Number(r.gstPercent || 0)) / 100
      : 0;

    totalGST += gstAmount;
    totalOtherCharges += otherChargesAmount;
    totalNetAmount += taxableAmount + gstAmount;
  });

  // Taxable value after adding charges
  const newTaxableValue = totalValue + totalOtherCharges;

  // State-wise GST
  const totalCgst =
    isPartySelected && isSameState ? Number((totalGST / 2).toFixed(2)) : 0;

  const totalSgst =
    isPartySelected && isSameState ? Number((totalGST / 2).toFixed(2)) : 0;

  const totalIgst =
    isPartySelected && !isSameState ? Number(totalGST.toFixed(2)) : 0;

  // Grand Total
  const grandTotal = Number(
    (totalValue + totalOtherCharges + totalGST + roundNum).toFixed(2),
  );
  const getAccounts = async () => {
    try {
      const res = await apiHelper.get("/accounts");

      const accounts = res.data || [];

      setCashAccounts(
        accounts.filter(
          (acc: any) =>
            acc.group === "Cash-in-Hand" || acc.group === "Cash Account",
        ),
      );

      setBankAccounts(
        accounts.filter(
          (acc: any) =>
            acc.group === "Bank Accounts" || acc.group === "Bank Account",
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAccounts();
    getCompany();
  }, []);
  const partyOptions = parties.map((p) => ({
    label: p.name,
    mobile: p.mobile,
    openingBalance: p.openingBalance,
    displayName: `${p.name} (${p.mobile})`,
    value: p.id,
  }));
  const fmt = (n: number) =>
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const updateDraft = (key: keyof ItemRow, value: string | number) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) return vehicleOptions;

    const q = vehicleSearch.toLowerCase();

    return vehicleOptions.filter((v) =>
      `${v.itemName} ${v.model} ${v.itemCode} ${v.variant} ${v.colour}`
        .toLowerCase()
        .includes(q),
    );
  }, [vehicleSearch, vehicleOptions]);

  // const handleVehicleSelect = (v: VehicleOption) => {
  //   setDraft((d) => ({
  //     ...d,

  //     item: v.itemName,
  //     itemCode: v.itemCode,
  //     color: v.colour,

  //     qty: 1,

  //     ratePer: String(v.purchasePriceNoGST),
  //     gstPercent: String(v.taxSlab),
  //     amount: String(v.purchasePriceTaxable),
  //   }));

  //   setVehicleModalOpen(false);
  //   setVehicleSearch("");
  // };
  const handleVehicleSelect = (v: VehicleOption) => {
    const qty = 1;

    const rate = Number(v.purchasePriceNoGST);

    const gstPercent = Number(v.taxSlab);

    const taxable = rate * qty;

    const gstAmount = (taxable * gstPercent) / 100;

    const amount = taxable + gstAmount;

    setDraft({
      ...emptyDraft(),

      item: v.itemName,

      itemCode: v.itemCode,

      color: v.colour,
      shortName: v.shortName,
      hsnCode: v.hsnCode,
      taxSlab: v.taxSlab,

      modelName: v.model,
      variantName: v.variant,

      typeOfFuel: v.typeOfFuel,
      fuelCapacity: v.fuelCapacity,

      qty,

      ratePer: String(rate),

      gstPercent: String(gstPercent),

      amount: String(amount),
    });

    setVehicleModalOpen(false);

    setVehicleSearch("");
  };
  const saveDraftRow = () => {
    // Validate all required fields
    if (!draft.item.trim()) {
      toast.warning("Please select or enter an Item Name");
      return;
    }
    if (!draft.itemCode.trim()) {
      toast.warning("Please enter Item Code");
      return;
    }
    if (!draft.color.trim()) {
      toast.warning("Please enter Color");
      return;
    }
    // Duplicate Chassis No in current purchase
    const chassisExists = rows.some(
      (r) =>
        r.chassisNo.trim().toLowerCase() ===
        draft.chassisNo.trim().toLowerCase(),
    );

    if (chassisExists) {
      toast.warning("Chassis No already added.");
      return;
    }

    // Duplicate Engine No in current purchase
    const engineExists = rows.some(
      (r) =>
        r.engineNo.trim().toLowerCase() === draft.engineNo.trim().toLowerCase(),
    );
    if (engineExists) {
      toast.warning("Engine No already added.");
      return;
    }
    if (!draft.qty || draft.qty < 1) {
      toast.warning("Please enter a valid Quantity (minimum 1)");
      return;
    }
    if (!draft.ratePer.trim()) {
      toast.warning("Please enter Rate Per");
      return;
    }
    if (!draft.gstPercent.trim()) {
      toast.warning("Please enter GST %");
      return;
    }
    if (!draft.amount.trim()) {
      toast.warning("Please enter Amount");
      return;
    }

    // All validations passed, save the row
    setRows((r) => [...r, { ...draft, saved: true }]);
    setDraft(emptyDraft());
    toast.success("Item added successfully!");
  };
  const removeRow = (id: string) =>
    setRows((r) => r.filter((row) => row.id !== id));
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
        openingBalance: isCreditorGroup
          ? Number(accountForm.openingBalance)
          : 0,
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

  const getParties = async () => {
    try {
      const res = await apiHelper.get("/accounts");

      const accounts = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      const list = accounts
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
          openingBalance: Number(acc.openingBalance) || 0,
        }));

      setParties(list);

      return list;
    } catch (error) {
      console.error("Failed to fetch parties:", error);
      setParties([]);
      return [];
    }
  };

  useEffect(() => {
    const load = async () => {
      await getParties();
      await getTractors();

      if (isEdit) {
        await getPurchase(id!);
      } else {
        getBillNo();
      }
    };

    load();
  }, [id]);
  const getPurchase = async (id: string) => {
    try {
      const res = await apiHelper.get(`/purchases/${id}`);

      const purchase = res.data;

      setBillNo(purchase.billNo);
      setPartyId(String(purchase.accountId));
      setPurchaseBillNo(purchase.purchaseBillNo || "");
      setPurchaseDate(purchase.purchaseDate?.split("T")[0] || "");
      setPurchaseLocation(purchase.purchaseLocation || "Main Branch");

      setDueDate(purchase.dueDate ? purchase.dueDate.split("T")[0] : "");
      setTerms(purchase.terms);
      setTerms(purchase.terms);

      setPartyId(String(purchase.accountId || ""));
      setBankAccount(String(purchase.bankAccountId || ""));
      setCashAccount(String(purchase.cashAccountId || ""));
      setBankDetails({
        paymentMode: purchase.paymentMode || "",
        chequeNo: purchase.chequeNo || "",
        chequeDate: purchase.chequeDate
          ? purchase.chequeDate.split("T")[0]
          : "",
        clearDate: purchase.clearDate ? purchase.clearDate.split("T")[0] : "",
        narration: purchase.bankNarration || "",
      });
      setNarration(purchase.narration);

      setFreightCharge(String(purchase.freightCharge));
      setInsurance(String(purchase.insurance));
      setOtherCharge(String(purchase.otherCharge));
      setRoundAmount(String(purchase.roundAmount));

      setBillVerify(purchase.status === "VERIFY" ? "verify" : "not_verify");

      setRows(
        purchase.items.map((item: any) => ({
          id: String(item.id),

          item: item.itemName,
          itemCode: item.itemCode,

          shortName: item.shortName || "",
          hsnCode: item.hsnCode || "",
          taxSlab: item.taxSlab || "",

          modelName: item.modelName || "",
          variantName: item.variantName || "",

          typeOfFuel: item.fuelType || "",
          fuelCapacity: item.fuelCapacity || "",

          color: item.color,

          chassisNo: item.chassisNo,
          engineNo: item.engineNo,

          qty: item.qty,
          ratePer: String(item.ratePer),
          gstPercent: String(item.gstPercent),
          amount: String(item.amount),

          saved: true,
          inwardStatus: item.status || "Pending",
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };
  const updateAccountForm = (key: keyof NewAccountData, value: string) => {
    setAccountForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    if (!companyId || !financialYearId) {
      toast.error("Company or financial year is not selected");
      return;
    }
    if (!purchaseBillNo.trim()) {
      toast.error("Purchase Bill No is required");
      return;
    }
    if (!partyId) {
      toast.error("Please select Party Name");
      return;
    }

    if (rows.length === 0) {
      toast.error("Please add at least one tractor");
      return;
    }

    if (terms === "Cash" && !cashAccount) {
      toast.error("Please select Cash Account");
      return;
    }

    if (terms === "Bank" && !bankAccount) {
      toast.error("Please select Bank Account");
      return;
    }
    try {
      const payload = {
        companyId,
        financialYearId,
        accountId: partyId,
        purchaseDate: purchaseDate || date,
        purchaseBillNo,
        purchaseLocation,
        dueDate,
        terms,
        narration,
        bankAccountId: bankAccount,
        cashAccountId: cashAccount,
        paymentMode: bankDetails.paymentMode,
        chequeNo: bankDetails.chequeNo,
        chequeDate: bankDetails.chequeDate,
        clearDate: bankDetails.clearDate,
        bankNarration: bankDetails.narration,
        freightCharge,
        insurance,
        otherCharge,
        roundAmount,
        totalQty: totalQuantity,
        totalAmount,
        grandTotal,
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
        items: rows,
      };

      if (isEdit) {
        await apiHelper.put(`/purchases/${id}`, payload);
        toast.success("Purchase Updated Successfully");
      } else {
        await apiHelper.post("/purchases", payload);
        toast.success("Purchase Saved Successfully");
      }

      navigate("/purchase/tractor");
      await getBillNo();
      setRows([]);
      setPurchaseBillNo("");
      setNarration("");
      setFreightCharge("");
      setInsurance("");
      setOtherCharge("");
      setRoundAmount("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save purchase");
    }
  };
  const handleVerify = async () => {
    try {
      await apiHelper.put(`/purchases/${id}/verify`, null);
      setBillVerify("verify");
      toast.success("Purchase Verified Successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to verify purchase");
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/purchase/tractor");
    }
  };
  const getBillNo = async () => {
    try {
      const res = await apiHelper.get(
        `/purchases/generate-bill-no?companyId=${companyId}&financialYearId=${financialYearId}`,
      );
      setBillNo(res.billNo || "");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white shadow-sm dark:bg-gray-800">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4 dark:border-gray-700">
          <h1 className="text-lg font-bold text-blue-600 underline sm:text-xl dark:text-blue-400">
            Tractor Purchase Bill
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

          <div className={terms === "Credit" ? "col-span-2" : "col-span-2"}>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Supplier Name
            </label>
            <div className="flex w-full gap-2">
              <div className="min-w-0 flex-1">
                <Combobox
                  data={partyOptions}
                  value={partyOptions.find((x) => x.value === partyId) || null}
                  onChange={(val: any) => setPartyId(val.value)}
                  displayField="displayName"
                  searchFields={["displayName", "mobile"]}
                  columns={[
                    {
                      header: "Party",
                      field: "displayName",
                      width: "3fr",
                    },
                    {
                      header: "OpeningBalance",
                      field: "openingBalance",
                      width: "1fr",
                    },
                  ]}
                  placeholder="Search Party"
                />
              </div>
              <button
                onClick={() => setAccountModalOpen(true)}
                className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-xl text-blue-600 hover:bg-gray-50 dark:border-gray-600 dark:text-blue-400 dark:hover:bg-gray-700"
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
              options={{ disableMobile: true }}
              onChange={(selectedDates: Date[]) => {
                const val = selectedDates[0];
                if (val instanceof Date && !isNaN(val.getTime())) {
                  setPurchaseDate(formatLocalDate(val));
                }
              }}
              placeholder="Select date..."
              className="w-full"
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
                options={{ disableMobile: true }}
                onChange={(selectedDates: Date[]) => {
                  const val = selectedDates[0];

                  if (val instanceof Date && !isNaN(val.getTime())) {
                    setDueDate(formatLocalDate(val));
                  }
                }}
                placeholder="Select date..."
                className="w-full"
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

        {/* ========== ITEM TABLE ========== */}
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6">
          <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
            <div className="h-96 overflow-y-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:border-gray-500 dark:text-gray-300">
                      ITEM
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:border-gray-500 dark:text-gray-300">
                      ITEM NAME
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:border-gray-500 dark:text-gray-300">
                      ITEM CODE
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:border-gray-500 dark:text-gray-300">
                      COLOR
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:border-gray-500 dark:text-gray-300">
                      CHASSIS NO
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:border-gray-500 dark:text-gray-300">
                      ENGINE NO
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:border-gray-500 dark:text-gray-300">
                      QTY
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:border-gray-500 dark:text-gray-300">
                      RATE PER
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:border-gray-500 dark:text-gray-300">
                      GST %
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:border-gray-500 dark:text-gray-300">
                      AMOUNT
                    </th>
                    <th className="border border-gray-500 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap text-gray-700 dark:border-gray-500 dark:text-gray-300">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Draft row */}

                  <tr className="sticky top-9 z-10">
                    <td className="border border-gray-500 px-2 py-1.5 text-center dark:border-gray-500">
                      <button
                        onClick={() => setVehicleModalOpen(true)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-600 bg-blue-600 text-white transition hover:bg-blue-700"
                        title="Add Item"
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
                        placeholder="Color"
                        value={draft.color}
                        onChange={(e) => updateDraft("color", e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 dark:border-gray-500">
                      <input
                        placeholder="Chassis"
                        value={draft.chassisNo}
                        onChange={(e) =>
                          updateDraft("chassisNo", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 dark:border-gray-500">
                      <input
                        placeholder="Engine"
                        value={draft.engineNo}
                        onChange={(e) =>
                          updateDraft("engineNo", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 dark:border-gray-500">
                      <input
                        type="number"
                        readOnly
                        min={1}
                        value={draft.qty}
                        onChange={(e) =>
                          updateDraft("qty", Number(e.target.value))
                        }
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 dark:border-gray-500">
                      <input
                        placeholder="Rate"
                        value={draft.ratePer}
                        onChange={(e) => updateDraft("ratePer", e.target.value)}
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
                        value={draft.amount}
                        onChange={(e) => updateDraft("amount", e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center dark:border-gray-500">
                      <button
                        onClick={saveDraftRow}
                        disabled={!draft.item.trim()}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white ${
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
                      <td className="border border-gray-500 px-3 py-2.5 text-center font-medium text-gray-500 dark:border-gray-500 dark:text-gray-400">
                        {index + 1}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 font-medium text-gray-900 dark:border-gray-500 dark:text-gray-200">
                        {r.item}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-gray-700 dark:border-gray-500 dark:text-gray-300">
                        {r.itemCode}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 dark:border-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="inline-block h-3 w-3 rounded-full border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: r.color || "#cccccc" }}
                          />
                          {r.color}
                        </span>
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 font-mono text-gray-700 dark:border-gray-500 dark:text-gray-300">
                        {r.chassisNo}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 font-mono text-gray-700 dark:border-gray-500 dark:text-gray-300">
                        {r.engineNo}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-center font-semibold text-gray-900 dark:border-gray-500 dark:text-gray-200">
                        {r.qty}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-center text-gray-700 dark:border-gray-500 dark:text-gray-300">
                        {r.ratePer}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-center text-gray-700 dark:border-gray-500 dark:text-gray-300">
                        {r.gstPercent}%
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-center font-semibold text-gray-900 dark:border-gray-500 dark:text-gray-200">
                        ₹{r.ratePer}
                      </td>
                      <td className="border border-gray-500 px-3 py-2.5 text-center dark:border-gray-500">
                        <button
                          disabled={r.inwardStatus === "Inward"}
                          onClick={() => removeRow(r.id)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                            r.inwardStatus === "Inward"
                              ? "cursor-not-allowed bg-gray-400 text-white"
                              : "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Empty state */}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-12 text-center">
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
                              {" "}
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
                ₹{fmt(totalPurchasePrice)}
              </span>
            </span>
          </div>
        </div>

        {/* Charges and summary */}
        {/* Charges and summary */}
        <div className="grid grid-cols-1 gap-4 px-3 pb-4 sm:px-4 sm:pb-6 md:px-6 lg:grid-cols-5">
          {/* Charges Section - takes 3 columns */}
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

          {/* Summary Section - takes 2 columns */}
          <div className="lg:col-span-2">
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
                    ₹{fmt(totalPurchasePrice)}
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
                {/* GST */}
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

      {/* ========== RIGHT SIDE DRAWER MODALS ========== */}

      {/* Vehicle Details - Right Drawer */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setVehicleModalOpen(false);
              setVehicleSearch("");
            }}
          />
          <div className="absolute top-0 right-0 h-full w-full max-w-5xl transform bg-white shadow-2xl transition-transform sm:w-3/4 lg:w-1/2 dark:bg-gray-800">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700">
                <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {" "}
                  Vehicle Details
                </h2>
                <button
                  onClick={() => {
                    setVehicleModalOpen(false);
                    setVehicleSearch("");
                  }}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="relative mb-4">
                  <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    placeholder="Search vehicles..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className="w-full rounded-lg border border-red-500 bg-white px-4 py-2 pl-10 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
                  />
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-left whitespace-nowrap dark:bg-gray-700">
                        <th className="w-12 p-2">#</th>
                        <th className="p-2">Item Name</th>
                        <th className="p-2">Model</th>
                        <th className="p-2">Item Code</th>
                        <th className="p-2">Variant</th>
                        <th className="p-2">Colour</th>
                        <th className="p-2">Short Name</th>
                        <th className="p-2">HSN</th>
                        <th className="p-2">GST</th>
                        <th className="p-2">Fuel</th>
                        <th className="p-2">Capacity</th>
                        <th className="p-2">Purchase (No GST)</th>
                        <th className="p-2">Purchase (GST)</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVehicles.map((v) => (
                        <tr
                          key={v.id}
                          className="border-t border-gray-200 whitespace-nowrap dark:border-gray-700"
                        >
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleVehicleSelect(v)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded bg-green-600 text-white hover:bg-green-700"
                            >
                              ✓
                            </button>
                          </td>
                          <td className="p-2">{v.itemName}</td>
                          <td className="p-2">{v.model}</td>
                          <td className="p-2">{v.itemCode}</td>
                          <td className="p-2">{v.variant}</td>
                          <td className="p-2">{v.colour}</td>
                          <td className="p-2">{v.shortName}</td>
                          <td className="p-2">{v.hsnCode}</td>
                          <td className="p-2">{v.taxSlab}%</td>
                          <td className="p-2">{v.typeOfFuel}</td>
                          <td className="p-2">{v.fuelCapacity}</td>
                          <td className="p-2">{v.purchasePriceNoGST}</td>
                          <td className="p-2">{v.purchasePriceTaxable}</td>
                          <td className="p-2">{v.status}</td>
                        </tr>
                      ))}
                      {filteredVehicles.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-4 text-center text-gray-500"
                          >
                            No vehicles match your search.
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

      {/* Bank Details - Right Drawer */}
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
                  {" "}
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
                        <input
                          type="radio"
                          name="paymentMode"
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
                        className={`w-full ${bankDetailsTouched && !bankDetails.chequeNo.trim() ? "border-red-500" : ""}`}
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

      {/* Create Account - Right Drawer WITH DYNAMIC LOCATION */}
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

                  {isCreditorGroup && (
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

export default TractorPurchaseBill;
