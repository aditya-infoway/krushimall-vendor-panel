import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeftIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  BuildingLibraryIcon,
  ArrowsRightLeftIcon,
  CreditCardIcon,
  UserGroupIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Combobox } from "@/components/shared/form/Combobox";
import { Checkbox } from "@/components/ui/Form/Checkbox";
import { FiEdit2 } from "react-icons/fi";
import Select from "react-select";
// import type { OptionProps } from "react-select";
import { toast } from "sonner";
/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
import apiHelper from "@/utils/apiHelper";
interface VehicleCharges {
  exShowroomPrice: string;
  insurance: string;
  roadSideAssistance: string;
  exWarranty2_3: string;
  hypothecationCharges: string;
  exWarranty2_8: string;
  rtoRegistrationCharges: string;
  rtoOtherCharge: string;
}

interface AllotmentDetails {
  model: string;
  variant: string;
  colour: string;
  chassisNo: string;
  policyNo: string;
  nomineeName: string;
  nomineeDob: string;
  relationWithNominee: string;
}

type HypothecationType = "finance" | "bank";
type PaymentStatus = "pending" | "received";

interface HypothecationDetails {
  type: HypothecationType;
  financeDoneBy: string;
  financeAmount: string;
  emi: string;
  tenureMonths: string;
  apronCharge: string;
  loanRoi: string;
  marginMoney: string;
  paymentStatus: PaymentStatus;
  narration: string;
  // ADD
  cashAmount: string;
  bankAmount: string;
  cashAccountId: string;
  bankAccountId: string;
  paymentMode: string;
  chequeNo: string;
  chequeDate: string;
  clearDate: string;
  assignBy: string;
  bankOfFinance: string;
}

interface ExchangeDetails {
  existingCustomerModel: string;
  existingCustomerVariant: string;
  existingVehicleYear: string;
  customerExpectedPrice: string;
  marketPrice: string;
  chassisNo: string;
  companyShare: string;
  dealerShares: string;
  rcNo: string;
  insurance: string;
  vehicleNo: string;
}

interface PaymentDetails {
  discount: string;
  schemeDiscount: string;
  exchangeDiscount: string;
  invoiceAmount: string;
  total: string;
  receivedAmount: string;
  pendingAmount: string;
}

interface BrokerDetails {
  brokerName: string;
  brokerAmount: string;
}

interface DeliveryChallan {
  invoiceBill: boolean;
  accessoriesInvoice: boolean;
  serviceBook: boolean;
  insuranceCopy: boolean;
  helmetInvoice: boolean;
  warrantyBook: boolean;
  keychainPouch: boolean;
  allGuard: boolean;
  matting: boolean;
  footrest: boolean;
  helmet: boolean;
  visor: boolean;
  seatCover: boolean;
  bodyCover: boolean;
  mirrorSet: boolean;
  other: boolean;
}

/* ------------------------------------------------------------------ */
/*  Reusable UI bits                                                   */
/* ------------------------------------------------------------------ */

const CardHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  colorClass: string;
}> = ({ icon, title, colorClass }) => (
  <div
    className={`flex items-center justify-between rounded-t-lg px-4 py-2.5 text-white ${colorClass}`}
  >
    <span className="flex items-center gap-2 text-sm font-semibold">
      <span className="size-5">{icon}</span>
      {title}
    </span>
    <button
      type="button"
      className="rounded p-1 text-white/90 transition-colors hover:bg-white/20"
      aria-label={`Edit ${title}`}
    >
      <FiEdit2 size={16} />
    </button>
  </div>
);

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dark:border-dark-600 dark:bg-dark-800 rounded-lg border border-gray-200 bg-white shadow-sm">
    {children}
  </div>
);

/* Wrapper that pins the input to the bottom of its grid cell so that
   labels of different lengths (1-line vs 2-line) don't cause the
   input boxes to misalign horizontally within the same row. */
const Field: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col justify-end">{children}</div>
);

/* Consistent responsive class for every 2-column field grid:
   - default (phone): 2 columns
   - lg (outer grid becomes 3 cards/row, each card narrow): 1 column
   - xl (cards wide enough again): 2 columns */
const fieldGrid = "grid grid-cols-2 gap-3 p-4 lg:grid-cols-1 xl:grid-cols-2";

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const Order: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedAccessories, setSelectedAccessories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const OrderVehicleOption = (props: any) => {
    const { data, innerRef, innerProps, isFocused, isSelected } = props;

    const inwardDate = data.inwardDate ?? data.inWardDate ?? "";

    const motorNo = data.motorNo ?? data.engineNo ?? "";

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className={`cursor-pointer border-b px-3 py-2 text-xs ${
          isFocused || isSelected
            ? "bg-primary-600 text-white"
            : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          {/* LEFT SIDE */}
          <div className="space-y-0.5">
            {/* Chassis No always show */}
            <p>
              <span className="font-semibold">Chassis No:</span>{" "}
              {data.chassisNo}
            </p>

            {/* Show only if available */}
            {data.batteryNo && (
              <p>
                <span className="font-semibold">Battery No:</span>{" "}
                {data.batteryNo}
              </p>
            )}

            {/* Show only if available */}
            {data.keyNo && (
              <p>
                <span className="font-semibold">Key No:</span> {data.keyNo}
              </p>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-0.5 text-right">
            {/* Show only if available */}
            {inwardDate && (
              <p>
                <span className="font-semibold">Inward Date:</span>{" "}
                {new Date(inwardDate).toLocaleDateString("en-GB")}
              </p>
            )}

            {/* Directly show API calculated ageDay */}
            {data.ageDay !== null && data.ageDay !== undefined && (
              <p>
                <span className="font-semibold">Days:</span> {data.ageDay}
              </p>
            )}

            {/* Show only if available */}
            {motorNo && (
              <p>
                <span className="font-semibold">Motor No:</span> {motorNo}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };
  const [vehicleCharges, setVehicleCharges] = useState<VehicleCharges>({
    exShowroomPrice: "",
    insurance: "",
    roadSideAssistance: "",
    exWarranty2_3: "",
    hypothecationCharges: "",
    exWarranty2_8: "",
    rtoRegistrationCharges: "",
    rtoOtherCharge: "",
  });

  const [allotment, setAllotment] = useState<AllotmentDetails>({
    model: "",
    variant: "",
    colour: "",
    chassisNo: "",
    policyNo: "",
    nomineeName: "",
    nomineeDob: "",
    relationWithNominee: "",
  });

  const [hypothecation, setHypothecation] = useState<HypothecationDetails>({
    type: "finance",
    financeDoneBy: "",
    financeAmount: "0",
    emi: "0",
    tenureMonths: "0",
    apronCharge: "0",
    loanRoi: "0",
    marginMoney: "0",
    paymentStatus: "pending",
    paymentMode: "UPI",
    chequeNo: "",
    chequeDate: "",
    clearDate: "",
    cashAmount: "",
    bankAmount: "",
    cashAccountId: "",
    bankAccountId: "",
    narration: "",
    assignBy: "",
    bankOfFinance: "",
  });

  const [exchange, setExchange] = useState<ExchangeDetails>({
    existingCustomerModel: "",
    existingCustomerVariant: "",
    existingVehicleYear: "",
    customerExpectedPrice: "0",
    marketPrice: "0",
    chassisNo: "",
    companyShare: "0",
    dealerShares: "0",
    rcNo: "",
    insurance: "",
    vehicleNo: "",
  });

  const [payment, setPayment] = useState<PaymentDetails>({
    discount: "0",
    schemeDiscount: "0",
    exchangeDiscount: "0",
    invoiceAmount: "0",
    total: "0",
    receivedAmount: "0",
    pendingAmount: "0",
  });

  const [broker, setBroker] = useState<BrokerDetails>({
    brokerName: "",
    brokerAmount: "",
  });

  const [delivery, setDelivery] = useState<DeliveryChallan>({
    invoiceBill: false,
    accessoriesInvoice: false,
    serviceBook: false,
    insuranceCopy: false,
    helmetInvoice: false,
    warrantyBook: false,
    keychainPouch: false,
    allGuard: false,
    matting: false,
    footrest: false,
    helmet: false,
    visor: false,
    seatCover: false,
    bodyCover: false,
    mirrorSet: false,
    other: false,
  });
  const [financeOptions, setFinanceOptions] = useState<any[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<any[]>([]);
  const [cashAccountOptions, setCashAccountOptions] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);

  const [financialYearId, setFinancialYearId] = useState<number | null>(null);
  const [bankAccountOptions, setBankAccountOptions] = useState<any[]>([]);
  type BankerOption = {
    id: number;
    banker: string;
    status: string;
  };
  const getCompany = () => {
    const savedCompanyId =
      sessionStorage.getItem("companyId") || localStorage.getItem("companyId");

    const savedFinancialYearId =
      sessionStorage.getItem("financialYearId") ||
      localStorage.getItem("financialYearId");

 

    if (savedCompanyId) {
      setCompanyId(Number(savedCompanyId));
    }

    if (savedFinancialYearId) {
      setFinancialYearId(Number(savedFinancialYearId));
    }
  };
  const fetchPaymentAccounts = async () => {
    try {
      const response = await apiHelper.get("/accounts");

      const accounts = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data)
          ? response.data
          : [];

    

      const cashAccounts = accounts
        .filter((item: any) => {
          const groupName = String(
            item.group?.groupName ?? item.groupName ?? item.group ?? "",
          ).toLowerCase();

          return groupName.includes("cash");
        })
        .map((item: any) => ({
          id: String(item.id),

          name: item.accountName ?? item.name ?? "",
        }));

      const bankAccounts = accounts
        .filter((item: any) => {
          const groupName = String(
            item.group?.groupName ?? item.groupName ?? item.group ?? "",
          ).toLowerCase();

          return groupName.includes("bank");
        })
        .map((item: any) => ({
          id: String(item.id),

          name: item.accountName ?? item.name ?? "",
        }));

      setCashAccountOptions(cashAccounts);

      setBankAccountOptions(bankAccounts);

   
    } catch (error) {
      console.error("GET ACCOUNT ERROR:", error);
    }
  };
  const [bankOptions, setBankOptions] = useState<BankerOption[]>([]);
  const getBankers = async () => {
    try {
      const response = await apiHelper.get("/bankers");

      const activeBankers = (response.data || []).filter(
        (item: BankerOption) => item.status === "ACTIVE",
      );

      setBankOptions(activeBankers);
    } catch (error: any) {
      console.error("Banker API error response:", error.response?.data);

      setBankOptions([]);
    }
  };
  useEffect(() => {
    getCompany();
    getBankers();
    fetchPaymentAccounts();
  }, []);
 const fetchVehicleInventory = async () => {
  try {
 

    const res = await apiHelper.get("/tractor-inventory");

  

    const data = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
        ? res.data
        : [];

  

    const verifiedVehicles = data.filter(
      (item: any) =>
        String(item.status ?? "").trim().toUpperCase() === "VERIFIED",
    );

   

    const mappedVehicles = verifiedVehicles
      .filter(
        (item: any) =>
          String(item.status ?? "").trim().toLowerCase() !== "booked",
      )
      .map((item: any) => ({
        id: String(item.id ?? item.tractorId ?? item.purchaseItemId),

        chassisNo: String(item.chassisNo ?? "").trim(),

        batteryNo: item.batteryNo ?? "",

        keyNo: item.keyNo ?? item.keyNumber ?? "",

        engineNo: item.engineNo ?? item.motorNo ?? "",

        inwardDate: item.inwardDate ?? item.inWardDate ?? "",

        ageDay: item.ageDay ?? item.ageday ?? null,

        model: item.model ?? item.modelName ?? "",

        variant: item.variant ?? item.variantName ?? "",

        colour: item.colour ?? item.color ?? "",

        status: item.status ?? "",
      }));

   

    setVehicleOptions(mappedVehicles);
  } catch (error) {
    console.error("❌ GET TRACTOR INVENTORY ERROR:", error);
  }
};
  const totalValue = 0;
  const fetchFinances = async () => {
    try {
      const res = await apiHelper.get("/finances");

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      const mappedFinances = data.map((item: any) => ({
        id: String(item.id),

        // Finance Account: Kashyap
        name: item.account?.accountName ?? "",

        // Employee: tushar
        employeeName: item.employeeName ?? "",

        status: item.status ?? "",
      }));

    

      setFinanceOptions(mappedFinances);
    } catch (error) {
      console.error("GET FINANCE ERROR:", error);
    }
  };
  useEffect(() => {
    fetchFinances();
    fetchVehicleInventory();
  }, []);
  const [grandTotal, setGrandTotal] = useState("0");

  useEffect(() => {
    if (!id) return;

    const getLeadDetails = async () => {
      try {
        setLoading(true);

        const response = await apiHelper.get(`/leads/${id}`);

       

        const lead = response.data?.data || response.data;
        setGrandTotal(String(Number(lead?.quotationGrandTotal) || 0));
        // ==========================================
        // 1. VEHICLE CHARGES
        // ==========================================
        const variant = lead?.showroomVariant;

        // Base amounts
        const exShowroomPrice = Number(variant?.exShowroomPrice ?? 0);

        const insurancePrice = Number(variant?.insurance ?? 0);

        const rtoCharge = Number(variant?.rtoCharge ?? 0);

        // Tax percentages
        const exShowroomTaxPercent = Number(variant?.exShowroomTaxPercent ?? 0);

        const insuranceTaxPercent = Number(variant?.insuranceTaxPercent ?? 0);

        const rtoTaxPercent = Number(variant?.rtoTaxPercent ?? 0);

        // Final amounts including tax
        const exShowroomWithTax =
          exShowroomPrice + (exShowroomPrice * exShowroomTaxPercent) / 100;

        const insuranceWithTax =
          insurancePrice + (insurancePrice * insuranceTaxPercent) / 100;

        const rtoWithTax = rtoCharge + (rtoCharge * rtoTaxPercent) / 100;

        setVehicleCharges((prev) => ({
          ...prev,

          // Price already includes tax
          exShowroomPrice: exShowroomWithTax.toFixed(2),

          // Insurance already includes tax
          insurance: insuranceWithTax.toFixed(2),

          // RTO already includes tax
          rtoOtherCharge: rtoWithTax.toFixed(2),
        }));

        // ==========================================
        // SELECTED ACCESSORIES
        // ==========================================
     const accessories = lead?.hasQuotationHistory
  ? (lead?.selectedAccessories || [])
  : (lead?.showroomVariant?.accessories || []);
        setSelectedAccessories(
          Array.isArray(accessories)
            ? accessories.map((item: any) => {
                const price = Number(
                  item?.price ??
                    item?.salePrice ??
                    item?.amount ??
                    item?.accessory?.price ??
                    item?.accessory?.salePrice ??
                    0,
                );

                const qty = Number(item?.qty ?? 1);

                const taxPercent = Number(item?.taxPercent ?? 0);

                // Price × Quantity
                const subTotal = price * qty;

                // Accessory tax
                const taxAmount = (subTotal * taxPercent) / 100;

                // Final accessory amount with tax
                const totalPrice =
                  Number(item?.totalPrice) || subTotal + taxAmount;

                const accessoryId =
                  item?.accessoryId ?? item?.accessory?.id ?? item?.id;

                return {
                  id: accessoryId,
                  accessoryId: accessoryId,

                  name:
                    item?.accessoryName ??
                    item?.itemName ??
                    item?.name ??
                    item?.accessory?.itemName ??
                    item?.accessory?.accessoryName ??
                    "Accessory",

                  price,
                  qty,
                  taxPercent,
                  totalPrice,
                };
              })
            : [],
        );

        // ==========================================
        // 2. MODEL, VARIANT AND COLOUR
        // ==========================================
        setAllotment((prev) => ({
          ...prev,

          model:
            lead?.model?.modelName ??
            lead?.model?.name ??
            lead?.modelName ??
            lead?.model ??
            "",

          variant:
            lead?.showroomVariant?.variantName ??
            lead?.showroomVariant?.name ??
            lead?.variant?.variantName ??
            lead?.variant?.name ??
            lead?.variantName ??
            "",

          colour:
            lead?.colour?.colourName ??
            lead?.colour?.name ??
            lead?.color?.name ??
            lead?.colourName ??
            lead?.colorName ??
            "",
        }));

        // ==========================================
        // 3. FINANCE DETAILS
        // ==========================================
        const finance = lead?.financeDetails ?? lead?.finance ?? lead;

        setHypothecation((prev) => ({
          ...prev,

          type:
            finance?.financeType?.toLowerCase() === "bank" ? "bank" : "finance",

          financeDoneBy: String(finance?.financeDoneBy ?? ""),

          financeAmount: String(finance?.financeAmount ?? 0),

          emi: String(finance?.emi ?? 0),

          tenureMonths: String(finance?.tenureMonths ?? finance?.tenure ?? 0),

          apronCharge: String(
            finance?.processingCharge ?? finance?.apronCharge ?? 0,
          ),

          loanRoi: String(finance?.loanROI ?? finance?.loanRoi ?? 0),

          marginMoney: String(finance?.marginMoney ?? 0),

          bankOfFinance: finance?.bankOfFinance ?? finance?.bankName ?? "",

          assignBy: finance?.assignBy ?? "",
        }));

        // ==========================================
        // 4. EXCHANGE DETAILS
        // ==========================================
        // ==========================================
        // 4. EXCHANGE DETAILS
        // ==========================================

        const exchangeDetails =
          lead?.exchangeDetails ?? lead?.financeData ?? lead?.exchange ?? lead;

        setExchange((prev) => ({
          ...prev,

          existingCustomerModel: exchangeDetails?.existingCustomerModel ?? "",

          existingCustomerVariant:
            exchangeDetails?.existingCustomerVariant ?? "",

          existingVehicleYear: exchangeDetails?.existingVehicleYear ?? "",

          customerExpectedPrice: String(
            exchangeDetails?.customerExpectedPrice ?? 0,
          ),

          marketPrice: String(exchangeDetails?.marketPrice ?? 0),

          chassisNo: exchangeDetails?.chassisNo ?? "",

          companyShare: String(exchangeDetails?.companyShare ?? 0),

          dealerShares: String(exchangeDetails?.dealerShares ?? 0),

          rcNo: exchangeDetails?.rcNo ?? "",

          insurance:
            exchangeDetails?.insurance != null
              ? String(exchangeDetails.insurance)
              : "",

          vehicleNo: exchangeDetails?.vehicleNo ?? "",
        }));
      } catch (error) {
        console.error("GET CREATE ORDER LEAD ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    getLeadDetails();
  }, [id]);

  const brokerOptions = [
    { id: "broker1", name: "Broker A" },
    { id: "broker2", name: "Broker B" },
    { id: "broker3", name: "Broker C" },
  ];

  // const employeeOptions = [
  //   { id: "emp1", name: "Employee 1" },
  //   { id: "emp2", name: "Employee 2" },
  //   { id: "emp3", name: "Employee 3" },
  // ];

  const relationOptions = [
    { id: "father", name: "Father" },
    { id: "mother", name: "Mother" },
    { id: "spouse", name: "Spouse" },
    { id: "son", name: "Son" },
    { id: "daughter", name: "Daughter" },
    { id: "other", name: "Other" },
  ];

  // const financeDoneByOptions = [
  //   { id: "self", name: "Self" },
  //   { id: "dealer", name: "Dealer" },
  //   { id: "dsa", name: "DSA" },
  // ];
  const matchingVehicleOptions = vehicleOptions.filter((vehicle: any) => {
    const vehicleModel = String(vehicle.model ?? "")
      .trim()
      .toLowerCase();

    const vehicleVariant = String(vehicle.variant ?? "")
      .trim()
      .toLowerCase();

    const vehicleColour = String(vehicle.colour ?? "")
      .trim()
      .toLowerCase();

    const leadModel = String(allotment.model ?? "")
      .trim()
      .toLowerCase();

    const leadVariant = String(allotment.variant ?? "")
      .trim()
      .toLowerCase();

    const leadColour = String(allotment.colour ?? "")
      .trim()
      .toLowerCase();

    return (
      vehicleModel === leadModel &&
      vehicleVariant === leadVariant &&
      vehicleColour === leadColour
    );
  });
  // ─── 1) Add a new state near your other useState declarations ───────────────
  // (place this next to `const [payment, setPayment] = useState<PaymentDetails>({...})`)

  // ─── 2) Inside the `getLeadDetails` effect, REPLACE this block: ─────────────
  //
  //   setPayment((prev) => ({
  //     ...prev,
  //     invoiceAmount: String(Number(lead?.quotationGrandTotal) || 0),
  //   }));
  //
  // WITH this: ──────────────────────────────────────────────────────────────

  // ─── 3) Replace the payment-calculation useEffect with this: ────────────────

  useEffect(() => {
    // Company Share + Dealer Share
    const companyShare = Number(exchange.companyShare) || 0;

    const dealerShare = Number(exchange.dealerShares) || 0;

    // Exchange Discount
    const exchangeDiscount = companyShare + dealerShare;

    // Raw Quotation Grand Total (never changes here)
    const total = Number(grandTotal) || 0;

    // Invoice Amount = Total - Exchange Discount
    const invoiceAmount = Math.max(total - exchangeDiscount, 0);

    setPayment((prev) => ({
      ...prev,

      // Company Share + Dealer Share
      exchangeDiscount: String(exchangeDiscount),

      // Total = raw Quotation Grand Total
      total: String(total),

      // Invoice Amount = Total - Exchange Discount
      invoiceAmount: String(invoiceAmount),

      // Received Amount = Exchange Discount
      receivedAmount: String(exchangeDiscount),

      // Pending Amount = Invoice Amount
      pendingAmount: String(invoiceAmount),
    }));
  }, [exchange.companyShare, exchange.dealerShares, grandTotal]);
  const handleCreateOrder = async () => {
    try {
      // =====================================
      // BASIC VALIDATION
      // =====================================

      if (!id) {
        toast.error("Lead ID is missing");
        return;
      }

      if (!companyId) {
        toast.error("Company ID not found");
        return;
      }

      if (!financialYearId) {
        toast.error("Financial Year ID not found");
        return;
      }

      if (!allotment.chassisNo) {
        toast.error("Please select chassis number");
        return;
      }

      // =====================================
      // PAYMENT AMOUNTS
      // =====================================

      const marginAmount = Number(hypothecation.marginMoney) || 0;

      const cashAmount = Number(hypothecation.cashAmount) || 0;

      const bankAmount = Number(hypothecation.bankAmount) || 0;

      // =====================================
      // PAYMENT VALIDATION
      // =====================================

      if (hypothecation.paymentStatus === "received") {
        if (cashAmount + bankAmount !== marginAmount) {
          toast.error(
            "Cash Amount + Bank Amount must be equal to Margin Money",
          );

          return;
        }

        // Cash Account validation
        if (cashAmount > 0 && !hypothecation.cashAccountId) {
          toast.error("Please select Cash Account");

          return;
        }

        // Bank Account validation
        if (bankAmount > 0 && !hypothecation.bankAccountId) {
          toast.error("Please select Bank Account");

          return;
        }

        // Payment Mode validation
        if (bankAmount > 0 && !hypothecation.paymentMode) {
          toast.error("Please select Payment Mode");

          return;
        }

        // Cheque validation
        if (bankAmount > 0 && hypothecation.paymentMode === "CHEQUE") {
          if (!hypothecation.chequeNo) {
            toast.error("Please enter Cheque Number");

            return;
          }

          if (!hypothecation.chequeDate) {
            toast.error("Please select Cheque Date");

            return;
          }
        }
      }

      // Start loading only after
      // all validations are successful
      setLoading(true);

      // =====================================
      // CREATE PAYLOAD
      // =====================================

      const payload = {
        companyId: Number(companyId),

        financialYearId: Number(financialYearId),

        leadId: Number(id),

        vehicleCharges,

        allotment,

        hypothecation: {
          ...hypothecation,

          cashAmount: String(cashAmount),

          bankAmount: String(bankAmount),
        },

        exchange,

        payment,

        broker,

        delivery,
        selectedAccessories,
      };

    

      // =====================================
      // CREATE ORDER API
      // =====================================

      const response = await apiHelper.post("/orders", payload);

    

      // Success toaster
      toast.success(response.data?.message || "Order created successfully");

      // Give toaster some time
      // before changing the page
      setTimeout(() => {
        navigate(-1);
      }, 800);
    } catch (error: any) {
      console.error("CREATE ORDER ERROR:", error);

      // Backend error toaster
      toast.error(error.response?.data?.message || "Unable to create order");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="dark:bg-dark-900 min-h-screen bg-gray-50 p-4">
      {/* Title row */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Create Order
        </h1>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center rounded bg-red-600 px-3 py-1.5 text-white shadow-sm transition-colors hover:bg-red-700"
            title="Download PDF"
          >
            <DocumentTextIcon className="size-4" />
          </button>
          <button
            className="flex items-center justify-center rounded bg-emerald-600 px-3 py-1.5 text-white shadow-sm transition-colors hover:bg-emerald-700"
            title="Download Excel"
          >
            <DocumentArrowDownIcon className="size-4" />
          </button>
          <button
            className="flex items-center justify-center rounded bg-blue-600 px-3 py-1.5 text-white shadow-sm transition-colors hover:bg-blue-700"
            title="Refresh"
          >
            <ArrowPathIcon className="size-4" />
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-primary-600 hover:bg-primary-800 flex cursor-pointer items-center gap-1.5 rounded px-3 py-1.5 text-white transition-colors"
            title="Back"
          >
            <ArrowLeftIcon className="size-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </div>

      {/* Grid of 7 cards, 3 columns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 1. Vehicle Charges - Blue */}
        <Card>
          <CardHeader
            icon={<TruckIcon className="size-5" />}
            title="Vehicle Charges"
            colorClass="bg-blue-700"
          />
          <div className={fieldGrid}>
            <Field>
              <Input
                label="Ex-Showroom Price"
                placeholder="Enter Ex-Showroom Price"
                value={vehicleCharges.exShowroomPrice}
                onChange={(e) =>
                  setVehicleCharges((s) => ({
                    ...s,
                    exShowroomPrice: e.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <Input
                label="Insurance"
                placeholder="Enter Insurance"
                value={vehicleCharges.insurance}
                onChange={(e) =>
                  setVehicleCharges((s) => ({
                    ...s,
                    insurance: e.target.value,
                  }))
                }
              />
            </Field>

            {/* <Field>
              <Input
                label="Road Side Assistance"
                placeholder="Enter Road Side Assistance"
                value={vehicleCharges.roadSideAssistance}
                onChange={(e) =>
                  setVehicleCharges((s) => ({
                    ...s,
                    roadSideAssistance: e.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <Input
                label="Ex. Warranty (2+3)"
                placeholder="Enter Ex. Warranty"
                value={vehicleCharges.exWarranty2_3}
                onChange={(e) =>
                  setVehicleCharges((s) => ({
                    ...s,
                    exWarranty2_3: e.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <Input
                label="Hypothecation Charges"
                placeholder="Enter Hypothecation Charges"
                value={vehicleCharges.hypothecationCharges}
                onChange={(e) =>
                  setVehicleCharges((s) => ({
                    ...s,
                    hypothecationCharges: e.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <Input
                label="Ex-warranty (2+8)"
                placeholder="Enter Ex-warranty"
                value={vehicleCharges.exWarranty2_8}
                onChange={(e) =>
                  setVehicleCharges((s) => ({
                    ...s,
                    exWarranty2_8: e.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <Input
                label="RTO & Registration Charges"
                placeholder="Enter RTO Charges"
                value={vehicleCharges.rtoRegistrationCharges}
                onChange={(e) =>
                  setVehicleCharges((s) => ({
                    ...s,
                    rtoRegistrationCharges: e.target.value,
                  }))
                }
              />
            </Field> */}
            <Field>
              <Input
                label="RTO Other Charge"
                placeholder="Enter RTO Other Charge"
                value={vehicleCharges.rtoOtherCharge}
                onChange={(e) =>
                  setVehicleCharges((s) => ({
                    ...s,
                    rtoOtherCharge: e.target.value,
                  }))
                }
              />
            </Field>
            {selectedAccessories.map((item, index) => (
              <Field key={item.id ?? index}>
                <Input
                  label={item.name}
                  value={Number(item.totalPrice ?? 0).toFixed(2)}
                  readOnly
                />
              </Field>
            ))}
          </div>
        </Card>

        {/* 2. Allotment Details - Teal */}
        <Card>
          <CardHeader
            icon={<ClipboardDocumentListIcon className="size-5" />}
            title="Allotment Details"
            colorClass="bg-teal-700"
          />
          <div className="space-y-3 p-4">
            <div className={fieldGrid.replace("p-4", "")}>
              <Field>
                <Input
                  label="Model"
                  placeholder="Enter Model"
                  value={allotment.model}
                  onChange={(e) =>
                    setAllotment((s) => ({ ...s, model: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <Input
                  label="Variant"
                  placeholder="Enter Variant"
                  value={allotment.variant}
                  onChange={(e) =>
                    setAllotment((s) => ({ ...s, variant: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <Input
                  label="Colour"
                  placeholder="Enter Colour"
                  value={allotment.colour}
                  onChange={(e) =>
                    setAllotment((s) => ({ ...s, colour: e.target.value }))
                  }
                />
              </Field>
            </div>
            <Field>
              <Field>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chassis No
                </label>

                <Select
                 options={vehicleOptions}
                  value={
                    matchingVehicleOptions.find(
                      (vehicle: any) =>
                        String(vehicle.chassisNo) ===
                        String(allotment.chassisNo),
                    ) || null
                  }
                  getOptionValue={(vehicle: any) =>
                    String(vehicle.id ?? vehicle.chassisNo)
                  }
                  getOptionLabel={(vehicle: any) => vehicle.chassisNo || ""}
                  components={{
                    Option: OrderVehicleOption,
                  }}
                  onChange={(vehicle: any) => {
                    setAllotment((prev) => ({
                      ...prev,

                      chassisNo: vehicle?.chassisNo ?? "",
                    }));
                  }}
                  placeholder="Select Vehicle"
                  isSearchable
                  isClearable
                  noOptionsMessage={() => "No matching chassis found"}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base: any) => ({
                      ...base,
                      zIndex: 99999,
                    }),

                    menu: (base: any) => ({
                      ...base,
                      overflow: "hidden",
                    }),

                    menuList: (base: any) => ({
                      ...base,
                      maxHeight: "300px",
                      padding: 0,
                    }),
                  }}
                />
              </Field>
            </Field>
            <p className="pt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Insurance Details
            </p>

            <div className={fieldGrid.replace("p-4", "")}>
              <Field>
                <Input
                  label="Policy No"
                  value={allotment.policyNo}
                  placeholder="Enter Policy No."
                  onChange={(e) =>
                    setAllotment((s) => ({ ...s, policyNo: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <Input
                  label="Nominee Name"
                  value={allotment.nomineeName}
                  placeholder="Enter Nominee Name"
                  onChange={(e) =>
                    setAllotment((s) => ({
                      ...s,
                      nomineeName: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <DatePicker
                  label="Nominee DOB"
                  placeholder="DD-MM-YYYY"
                  value={allotment.nomineeDob}
                  onChange={(val: any) =>
                    setAllotment((s) => ({ ...s, nomineeDob: val }))
                  }
                  options={{ dateFormat: "d-m-Y" }}
                />
              </Field>
              <Field>
                <Combobox
                  label="Relation With Nominee"
                  data={relationOptions}
                  displayField="name"
                  value={
                    relationOptions.find(
                      (r) => r.name === allotment.relationWithNominee,
                    ) || null
                  }
                  onChange={(val: any) =>
                    setAllotment((s) => ({
                      ...s,
                      relationWithNominee: val?.name || "",
                    }))
                  }
                  placeholder="Select Relation"
                />
              </Field>
            </div>
          </div>
        </Card>

        {/* 3. Hypothecation - Indigo */}
        <Card>
          <CardHeader
            icon={<BuildingLibraryIcon className="size-5" />}
            title="Hypothecation"
            colorClass="bg-indigo-700"
          />
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="hypothecationType"
                  checked={hypothecation.type === "finance"}
                  onChange={() =>
                    setHypothecation((s) => ({ ...s, type: "finance" }))
                  }
                  className="dark:bg-dark-800 h-4 w-4 text-[#003399] focus:ring-[#003399]"
                />
                Finance
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="hypothecationType"
                  checked={hypothecation.type === "bank"}
                  onChange={() =>
                    setHypothecation((s) => ({ ...s, type: "bank" }))
                  }
                  className="dark:bg-dark-800 h-4 w-4 text-[#003399] focus:ring-[#003399]"
                />
                Bank
              </label>
            </div>

            {hypothecation.type === "bank" ? (
              <Field>
                <Field>
                  <Field>
                    <Combobox
                      label="Bank Of Finance"
                      data={bankOptions}
                      displayField="banker"
                      value={
                        bankOptions.find(
                          (item) => item.banker === hypothecation.bankOfFinance,
                        ) || null
                      }
                      onChange={(val: BankerOption | null) =>
                        setHypothecation((prev) => ({
                          ...prev,
                          bankOfFinance: val?.banker || "",
                        }))
                      }
                      placeholder="Select Bank"
                    />
                  </Field>
                </Field>
              </Field>
            ) : (
              <>
                <div className={fieldGrid.replace("p-4", "")}>
                  <Field>
                    <Combobox
                      label="Finance Done By"
                      data={financeOptions}
                      displayField="name"
                      value={
                        financeOptions.find(
                          (item: any) =>
                            String(item.id) ===
                            String(hypothecation.financeDoneBy),
                        ) || null
                      }
                      onChange={(item: any) => {
                        setHypothecation((prev) => ({
                          ...prev,

                          financeDoneBy:
                            item?.id != null ? String(item.id) : "",

                          // Selected finance employee
                          assignBy: item?.employeeName || "",
                        }));
                      }}
                      placeholder="Select Finance"
                      searchFields={["name", "employeeName"]}
                      columns={[
                        {
                          header: "Finance Name",
                          field: "name",
                          width: "2fr",
                        },
                        {
                          header: "Employee Name",
                          field: "employeeName",
                          width: "1.5fr",
                        },
                      ]}
                    />
                  </Field>
                  <Field>
                    <Input
                      label="Finance Amount"
                      placeholder="Enter Finance Amount"
                      value={hypothecation.financeAmount}
                      onChange={(e) =>
                        setHypothecation((s) => ({
                          ...s,
                          financeAmount: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <Input
                      label="EMI"
                      placeholder="Enter EMI"
                      value={hypothecation.emi}
                      onChange={(e) =>
                        setHypothecation((s) => ({
                          ...s,
                          emi: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <Input
                      label="Tenure (Months)"
                      placeholder="Enter Tenure (Months)"
                      value={hypothecation.tenureMonths}
                      onChange={(e) =>
                        setHypothecation((s) => ({
                          ...s,
                          tenureMonths: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <Input
                      label="Processing Charge"
                      placeholder="Enter Processing Charge"
                      value={hypothecation.apronCharge}
                      onChange={(e) =>
                        setHypothecation((s) => ({
                          ...s,
                          apronCharge: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <Input
                      label="Loan ROI"
                      placeholder="Enter Loan ROI"
                      value={hypothecation.loanRoi}
                      onChange={(e) =>
                        setHypothecation((s) => ({
                          ...s,
                          loanRoi: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <Input
                      label="Margin Money (Down Payment)"
                      placeholder="Enter Margin Money"
                      value={hypothecation.marginMoney}
                      onChange={(e) =>
                        setHypothecation((s) => ({
                          ...s,
                          marginMoney: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <div className="flex min-w-0 flex-col gap-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Payment Status
                      </label>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                        <label className="flex cursor-pointer items-center gap-1 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                          <input
                            type="radio"
                            name="paymentStatus"
                            checked={hypothecation.paymentStatus === "pending"}
                            onChange={() =>
                              setHypothecation((s) => ({
                                ...s,
                                paymentStatus: "pending",
                              }))
                            }
                            className="dark:bg-dark-800 h-4 w-4 text-[#003399] focus:ring-[#003399]"
                          />
                          Pending
                        </label>
                        <label className="flex cursor-pointer items-center gap-1 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                          <input
                            type="radio"
                            name="paymentStatus"
                            checked={hypothecation.paymentStatus === "received"}
                            onChange={() =>
                              setHypothecation((prev) => ({
                                ...prev,

                                paymentStatus: "received",

                                // Initially show full Margin Money in Cash Amount
                                cashAmount: String(
                                  Number(prev.marginMoney) || 0,
                                ),

                                // Initially Bank Amount is zero
                                bankAmount: "0",
                              }))
                            }
                            className="dark:bg-dark-800 h-4 w-4 text-[#003399] focus:ring-[#003399]"
                          />
                          Received
                        </label>
                      </div>
                    </div>
                  </Field>
                </div>
                {/* Show when Received is selected */}
                {hypothecation.paymentStatus === "received" && (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {/* =========================
        CASH PAYMENT SECTION
    ========================== */}
                    <div className="rounded-lg border border-gray-700 p-4">
                      <div className="space-y-3">
                        {/* Cash Amount */}
                        <Field>
                          <Input
                            label="Cash Amount"
                            type="number"
                            min="0"
                            placeholder="Enter Cash Amount"
                            value={hypothecation.cashAmount}
                            onChange={(e) => {
                              const cashValue = e.target.value;

                              setHypothecation((prev) => {
                                const marginAmount =
                                  Number(prev.marginMoney) || 0;

                                const cashAmount = Number(cashValue) || 0;

                                const calculatedBankAmount = Math.max(
                                  marginAmount - cashAmount,
                                  0,
                                );

                                return {
                                  ...prev,

                                  cashAmount: cashValue,

                                  bankAmount: String(calculatedBankAmount),

                                  // Clear selected bank
                                  // when bank amount is zero
                                  bankAccountId:
                                    calculatedBankAmount > 0
                                      ? prev.bankAccountId
                                      : "",
                                };
                              });
                            }}
                          />
                        </Field>

                        {/* Cash Account */}
                        <Field>
                          <Combobox
                            label="Cash Account"
                            data={cashAccountOptions}
                            displayField="name"
                            value={
                              cashAccountOptions.find(
                                (item: any) =>
                                  String(item.id) ===
                                  String(hypothecation.cashAccountId),
                              ) || null
                            }
                            onChange={(item: any) =>
                              setHypothecation((prev) => ({
                                ...prev,

                                cashAccountId:
                                  item?.id != null ? String(item.id) : "",
                              }))
                            }
                            placeholder="Select Cash Account"
                          />
                        </Field>

                        {/* Cash Narration */}
                        <Field>
                          <Input
                            label="Narration"
                            type="text"
                            value={hypothecation.narration}
                            onChange={(e) =>
                              setHypothecation((prev) => ({
                                ...prev,

                                narration: e.target.value,
                              }))
                            }
                            placeholder="Enter cash payment narration"
                          />
                        </Field>
                      </div>
                    </div>

                    {/* =========================
        BANK PAYMENT SECTION
    ========================== */}
                    {/* =========================
    BANK PAYMENT SECTION
========================== */}
                    <div className="rounded-lg border border-gray-700 p-4">
                      <div className="space-y-3">
                        {/* Bank Amount - Always Show */}
                        <Field>
                          <Input
                            label="Bank Amount"
                            type="number"
                            value={hypothecation.bankAmount}
                            placeholder="Auto calculated"
                            readOnly
                          />
                        </Field>

                        {/* Show bank details only when Bank Amount > 0 */}
                        {Number(hypothecation.bankAmount) > 0 && (
                          <>
                            {/* Bank Account */}
                            <Field>
                              <Combobox
                                label="Bank Account"
                                data={bankAccountOptions}
                                displayField="name"
                                value={
                                  bankAccountOptions.find(
                                    (item: any) =>
                                      String(item.id) ===
                                      String(hypothecation.bankAccountId),
                                  ) || null
                                }
                                onChange={(item: any) =>
                                  setHypothecation((prev) => ({
                                    ...prev,

                                    bankAccountId:
                                      item?.id != null ? String(item.id) : "",
                                  }))
                                }
                                placeholder="Select Bank Account"
                              />
                            </Field>

                            {/* Payment Mode */}
                            {/* Payment Mode */}
                            <Field>
                              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Payment Mode
                              </label>

                              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                {["UPI", "NEFT", "CHEQUE", "RTGS", "IMPS"].map(
                                  (mode) => (
                                    <label
                                      key={mode}
                                      className="flex cursor-pointer items-center gap-1.5"
                                    >
                                      <input
                                        type="radio"
                                        name="bankPaymentMode"
                                        value={mode}
                                        checked={
                                          hypothecation.paymentMode === mode
                                        }
                                        onChange={(e) => {
                                          const paymentMode = e.target.value;

                                          setHypothecation((prev) => ({
                                            ...prev,

                                            paymentMode,

                                            // Clear cheque details when
                                            // payment mode is not Cheque
                                            chequeNo:
                                              paymentMode === "CHEQUE"
                                                ? prev.chequeNo
                                                : "",

                                            chequeDate:
                                              paymentMode === "CHEQUE"
                                                ? prev.chequeDate
                                                : "",

                                            clearDate:
                                              paymentMode === "CHEQUE"
                                                ? prev.clearDate
                                                : "",
                                          }));
                                        }}
                                        className="accent-primary-600 h-4 w-4 cursor-pointer"
                                      />

                                      <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {mode === "CHEQUE" ? "Cheque" : mode}
                                      </span>
                                    </label>
                                  ),
                                )}
                              </div>
                            </Field>

                            {/* Show only when Cheque is selected */}
                            {hypothecation.paymentMode === "CHEQUE" && (
                              <div className="space-y-3 rounded-lg border border-gray-700 p-3">
                                {/* Cheque No */}
                                <Field>
                                  <Input
                                    label="Cheque No"
                                    type="text"
                                    value={hypothecation.chequeNo}
                                    onChange={(e) =>
                                      setHypothecation((prev) => ({
                                        ...prev,

                                        chequeNo: e.target.value,
                                      }))
                                    }
                                    placeholder="Enter Cheque No"
                                  />
                                </Field>

                                {/* Cheque Date */}
                                {/* Cheque Date */}
                                <Field>
                                  <DatePicker
                                    label="Cheque Date"
                                    placeholder="Select cheque date..."
                                    value={hypothecation.chequeDate}
                                    options={{
                                      disableMobile: true,
                                      dateFormat: "d-m-Y",
                                    }}
                                    onChange={(dates) => {
                                      const selectedDate = dates?.[0];

                                      setHypothecation((prev) => ({
                                        ...prev,

                                        chequeDate: selectedDate
                                          ? selectedDate.toISOString()
                                          : "",
                                      }));
                                    }}
                                  />
                                </Field>

                                {/* Clear Date */}
                                <Field>
                                  <DatePicker
                                    label="Clear Date"
                                    placeholder="Select clear date..."
                                    value={hypothecation.clearDate}
                                    options={{
                                      disableMobile: true,
                                      dateFormat: "d-m-Y",
                                    }}
                                    onChange={(dates) => {
                                      const selectedDate = dates?.[0];

                                      setHypothecation((prev) => ({
                                        ...prev,

                                        clearDate: selectedDate
                                          ? selectedDate.toISOString()
                                          : "",
                                      }));
                                    }}
                                  />
                                </Field>
                              </div>
                            )}

                            {/* Bank Narration */}
                            <Field>
                              <Input
                                label="Narration"
                                type="text"
                                value={hypothecation.narration}
                                onChange={(e) =>
                                  setHypothecation((prev) => ({
                                    ...prev,

                                    narration: e.target.value,
                                  }))
                                }
                                placeholder="Enter bank payment narration"
                              />
                            </Field>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <Field>
                  <Combobox
                    label="Assign By"
                    data={[
                      {
                        id: "finance-employee",
                        name:
                          financeOptions.find(
                            (item: any) =>
                              String(item.id) ===
                              String(hypothecation.financeDoneBy),
                          )?.employeeName || "",
                      },
                    ].filter((item) => item.name)}
                    displayField="name"
                    value={
                      hypothecation.assignBy
                        ? {
                            id: "finance-employee",
                            name: hypothecation.assignBy,
                          }
                        : null
                    }
                    onChange={(employee: any) =>
                      setHypothecation((prev) => ({
                        ...prev,
                        assignBy: employee?.name || "",
                      }))
                    }
                    placeholder="Select Employee"
                  />
                </Field>
              </>
            )}
          </div>
        </Card>

        {/* 4. Exchange Details - Amber */}
        <Card>
          <CardHeader
            icon={<ArrowsRightLeftIcon className="size-5" />}
            title="Exchange Details"
            colorClass="bg-amber-600"
          />

          <div className={fieldGrid}>
            <Field>
              <Input
                label="Existing Customer Model"
                value={exchange.existingCustomerModel}
                placeholder="Enter Existing Customer Model"
                onChange={(e) =>
                  setExchange((s) => ({
                    ...s,
                    existingCustomerModel: e.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <Input
                label="Existing Customer Variant"
                value={exchange.existingCustomerVariant}
                placeholder="Enter Existing Customer Variant"
                onChange={(e) =>
                  setExchange((s) => ({
                    ...s,
                    existingCustomerVariant: e.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <Input
                label="Existing Vehicle Year"
                value={exchange.existingVehicleYear}
                placeholder="Enter Vehicle Year"
                onChange={(e) =>
                  setExchange((s) => ({
                    ...s,
                    existingVehicleYear: e.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <Input
                label="Customer Expected Price"
                value={exchange.customerExpectedPrice}
                placeholder="Enter Expected Price"
                onChange={(e) =>
                  setExchange((s) => ({
                    ...s,
                    customerExpectedPrice: e.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <Input
                label="Market Price"
                value={exchange.marketPrice}
                placeholder="Enter Market Price"
                onChange={(e) =>
                  setExchange((s) => ({
                    ...s,
                    marketPrice: e.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <Input
                label="Chassis No"
                value={exchange.chassisNo}
                placeholder="Enter Chassis No"
                onChange={(e) =>
                  setExchange((s) => ({
                    ...s,
                    chassisNo: e.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <Input
                label="Company Share"
                value={exchange.companyShare}
                placeholder="Enter Company Share"
                onChange={(e) =>
                  setExchange((s) => ({
                    ...s,
                    companyShare: e.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <Input
                label="Dealer Shares"
                value={exchange.dealerShares}
                placeholder="Enter Dealer Shares"
                onChange={(e) =>
                  setExchange((s) => ({
                    ...s,
                    dealerShares: e.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <Input
                label="RC No"
                value={exchange.rcNo}
                placeholder="Enter RC No"
                onChange={(e) =>
                  setExchange((s) => ({
                    ...s,
                    rcNo: e.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <Input
                label="Insurance"
                value={exchange.insurance}
                placeholder="Enter Insurance"
                onChange={(e) =>
                  setExchange((s) => ({
                    ...s,
                    insurance: e.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <Input
                label="Vehicle No"
                value={exchange.vehicleNo}
                placeholder="Enter Vehicle No"
                onChange={(e) =>
                  setExchange((s) => ({
                    ...s,
                    vehicleNo: e.target.value,
                  }))
                }
              />
            </Field>
          </div>
        </Card>
        {/* 5. Payment Details - Rose */}
        <Card>
          <CardHeader
            icon={<CreditCardIcon className="size-5" />}
            title="Payment Details"
            colorClass="bg-rose-700"
          />
          <div className={fieldGrid}>
            <Field>
              <Input
                label="Discount"
                value={payment.discount}
                placeholder="Enter Discount"
                onChange={(e) =>
                  setPayment((s) => ({ ...s, discount: e.target.value }))
                }
              />
            </Field>
            <Field>
              <Input
                label="Scheme Discount"
                value={payment.schemeDiscount}
                placeholder="Enter Scheme Discount"
                onChange={(e) =>
                  setPayment((s) => ({
                    ...s,
                    schemeDiscount: e.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <Input
                label="Exchange Discount"
                value={payment.exchangeDiscount}
                placeholder="Enter Exchange Discount"
                readOnly
              />
            </Field>
            <Field>
              <Field>
                <Input
                  label="Invoice Amount"
                  value={payment.invoiceAmount}
                  placeholder="Quotation Grand Total"
                  readOnly
                />
              </Field>
            </Field>
            <Field>
              <Input label="Total" value={payment.total} readOnly />
            </Field>
            <Field>
              <Input
                label="Received Amount"
                value={payment.receivedAmount}
                readOnly
              />
            </Field>
            <Field>
              <Input
                label="Pending Amount"
                value={payment.pendingAmount}
                readOnly
              />
            </Field>
          </div>
        </Card>

        {/* 6. Broker Details + 7. Delivery Challan (in same column) */}
        <div className="flex flex-col gap-4">
          {/* 6. Broker Details - Fuchsia */}
          <Card>
            <CardHeader
              icon={<UserGroupIcon className="size-5" />}
              title="Broker Details"
              colorClass="bg-fuchsia-700"
            />
            <div className={fieldGrid}>
              <Field>
                <Combobox
                  label="Broker Name"
                  data={brokerOptions}
                  displayField="name"
                  value={
                    brokerOptions.find((b) => b.name === broker.brokerName) ||
                    null
                  }
                  onChange={(val: any) =>
                    setBroker((s) => ({ ...s, brokerName: val?.name || "" }))
                  }
                  placeholder="Select Broker"
                />
              </Field>
              <Field>
                <Input
                  label="Broker Amount"
                  value={broker.brokerAmount}
                  placeholder="Enter Broker Amount"
                  onChange={(e) =>
                    setBroker((s) => ({
                      ...s,
                      brokerAmount: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          </Card>

          {/* 7. Delivery Challan - Slate */}
          <Card>
            <CardHeader
              icon={<DocumentTextIcon className="size-5" />}
              title="Delivery Challan"
              colorClass="bg-slate-700"
            />
            <div className="p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Checkbox
                  label="Invoice Bill"
                  checked={delivery.invoiceBill}
                  onChange={(e) =>
                    setDelivery((s) => ({
                      ...s,
                      invoiceBill: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Accessories Invoice"
                  checked={delivery.accessoriesInvoice}
                  onChange={(e) =>
                    setDelivery((s) => ({
                      ...s,
                      accessoriesInvoice: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Service Book"
                  checked={delivery.serviceBook}
                  onChange={(e) =>
                    setDelivery((s) => ({
                      ...s,
                      serviceBook: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Insurance Copy"
                  checked={delivery.insuranceCopy}
                  onChange={(e) =>
                    setDelivery((s) => ({
                      ...s,
                      insuranceCopy: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Helmet Invoice"
                  checked={delivery.helmetInvoice}
                  onChange={(e) =>
                    setDelivery((s) => ({
                      ...s,
                      helmetInvoice: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Warranty Book"
                  checked={delivery.warrantyBook}
                  onChange={(e) =>
                    setDelivery((s) => ({
                      ...s,
                      warrantyBook: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Keychain Pouch"
                  checked={delivery.keychainPouch}
                  onChange={(e) =>
                    setDelivery((s) => ({
                      ...s,
                      keychainPouch: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="All Guard"
                  checked={delivery.allGuard}
                  onChange={(e) =>
                    setDelivery((s) => ({
                      ...s,
                      allGuard: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Matting"
                  checked={delivery.matting}
                  onChange={(e) =>
                    setDelivery((s) => ({ ...s, matting: e.target.checked }))
                  }
                />
                <Checkbox
                  label="Footrest"
                  checked={delivery.footrest}
                  onChange={(e) =>
                    setDelivery((s) => ({
                      ...s,
                      footrest: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Helmet"
                  checked={delivery.helmet}
                  onChange={(e) =>
                    setDelivery((s) => ({ ...s, helmet: e.target.checked }))
                  }
                />
                <Checkbox
                  label="Visor"
                  checked={delivery.visor}
                  onChange={(e) =>
                    setDelivery((s) => ({ ...s, visor: e.target.checked }))
                  }
                />
                <Checkbox
                  label="Seat Cover"
                  checked={delivery.seatCover}
                  onChange={(e) =>
                    setDelivery((s) => ({
                      ...s,
                      seatCover: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Body Cover"
                  checked={delivery.bodyCover}
                  onChange={(e) =>
                    setDelivery((s) => ({
                      ...s,
                      bodyCover: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Mirror Set"
                  checked={delivery.mirrorSet}
                  onChange={(e) =>
                    setDelivery((s) => ({
                      ...s,
                      mirrorSet: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Other"
                  checked={delivery.other}
                  onChange={(e) =>
                    setDelivery((s) => ({ ...s, other: e.target.checked }))
                  }
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Submit Button - Bottom Center */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={handleCreateOrder}
          disabled={loading}
          className="rounded-lg bg-[#003399] px-8 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-[#002277] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Order"}
        </button>
      </div>
    </div>
  );
};

export default Order;
