import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiHelper from "@/utils/apiHelper";
import {
  ArrowLeftIcon,
  CheckIcon,
  CogIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Button, Input } from "@/components/ui";
// import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { toast } from "sonner";
import { Switch } from "@headlessui/react";
import { Combobox } from "@/components/shared/form/Combobox";
type QuotationItem = {
  id?: number;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
};

type Accessory = {
  id: number;
  name: string;
  price: number;
  selected: boolean;
  quantity: number;
};

type ShowroomVariant = {
  id: number;

  modelName: string;
  variantName: string;
  colourName: string;

  purPrice: number;
  purTaxPercent: number;

  exShowroomPrice: number;
  exShowroomTaxPercent: number;

  insurance: number;
  insuranceTaxPercent: number;

  rtoCharge: number;
  rtoTaxType: string;
  rtoTaxPercent: number;

  salesPrice: number;

  accessories: Accessory[];
};

type Customer = {
  id?: number;
  accountName: string;
  mobile: string;
};

type QuotationData = {
  id: number;
  leadId: number;

  quotationNo: string;
  quotationDate: string;
  validUntil: string;
  quotationRevision: number;
  createdAt?: string;

  customer?: Customer;

  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;

  showroomVariant: ShowroomVariant;

  items: QuotationItem[];

  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;

  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";

  notes: string;
  terms: string;
};

const QuotationEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quotation, setQuotation] = useState<QuotationData | null>(null);
  // const [items, setItems] = useState<QuotationItem[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [models, setModels] = useState<any[]>([]);

  const [allVariants, setAllVariants] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  const [allColours, setAllColours] = useState<any[]>([]);
  const [colours, setColours] = useState<any[]>([]);
  const [showroomVariant, setShowroomVariant] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColour, setSelectedColour] = useState<any>(null);
  const fetchModels = async () => {
    const res = await apiHelper.get("/model");

    setModels(res.data);
  };

const fetchVariants = async (modelId?: number) => {
  const res = await apiHelper.get("/showroom-variant");

  const data = res.data || [];

  setAllVariants(data);

  if (modelId) {
    setVariants(
      data.filter((item: any) => Number(item.modelId) === Number(modelId))
    );
  }
};
  const fetchColours = async () => {
    const res = await apiHelper.get("/colours");

    const data = res.data || res.data;

    setAllColours(data);
  };
  useEffect(() => {
    fetchModels();
    fetchVariants();
    fetchColours();
  }, []);
  // Fetch quotation data
  const fetchLead = async () => {
    try {
      // setLoading(true);

      const res = await apiHelper.get(`/leads/${id}`);

      const lead = res.data.data ?? res.data;

      console.log("Lead:", lead);

      setQuotation(lead);

      // Set selected values for Comboboxes
      setSelectedModel(lead.model || null);
      setSelectedVariant(lead.showroomVariant || null);
      setSelectedColour(lead.colour || null);

      if (lead.model?.id) {
        await fetchVariants(lead.model.id);
      }

      if (lead.showroomVariant) {
        setShowroomVariant(lead.showroomVariant);

       const selectedAccessories = lead.selectedAccessories || [];

const hasSavedAccessories = lead.hasQuotationHistory;

setAccessories(
  (lead.showroomVariant.accessories || []).map((item: any) => {
    const selected = selectedAccessories.find(
      (a: any) => Number(a.accessoryId) === Number(item.accessoryId)
    );

    return {
      ...item,
      name:
        item.accessory?.itemName ||
        item.accessory?.accessoryName ||
        "",
      quantity: item.qty || 1,

      // First quotation -> all ON
      // Edited quotation -> use saved state
      selected: hasSavedAccessories ? !!selected : true,
    };
  })
);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load lead");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);
  const handleModelChange = (model: any) => {
    setSelectedModel(model);

    const filteredVariants = allVariants.filter(
      (item: any) => Number(item.modelId) === Number(model.id),
    );

    setVariants(filteredVariants);

    setSelectedVariant(null);
    setSelectedColour(null);
    setColours([]);

    setShowroomVariant(null);
    setAccessories([]);
  };
  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);

    setShowroomVariant(variant);

    const filteredColours = allColours.filter(
      (item: any) => Number(item.showroomVariantId) === Number(variant.id),
    );

    setColours(filteredColours);

    setSelectedColour(null);

    setAccessories(
      (variant.accessories || []).map((item: any) => ({
        ...item,
        name: item.accessory?.itemName || "",
        quantity: item.qty || 1,
        selected: true,
      })),
    );
  };
  const handleColourChange = (colour: any) => {
    setSelectedColour(colour);
  };
  // Calculate totals
 

 

  // Toggle accessory selection
  const toggleAccessory = (index: number) => {
    const updatedAccessories = [...accessories];
    updatedAccessories[index].selected = !updatedAccessories[index].selected;
    setAccessories(updatedAccessories);
  };

  // Update accessory quantity


  // Save quotation
const handleSave = async () => {
  try {
    if (
      !selectedModel?.id ||
      !selectedVariant?.id ||
      !selectedColour?.id
    ) {
      toast.error(
        "Please select model, variant and colour",
      );
      return;
    }

    setSaving(true);

    // Send only toggle-ON accessories
    const selectedAccessories = accessories
      .filter(
        (item: any) =>
          item.selected === true,
      )
      .map((item: any) => ({
        // ShowroomVariantAccessory ID
        id: Number(item.id),

        // Master Accessory ID
        accessoryId: Number(
          item.accessoryId ||
            item.accessory?.id,
        ),

        // Accessory name
        name:
          item.accessory?.itemName ||
          item.accessory?.name ||
          item.name ||
          "Accessory",

        qty:
          Number(
            item.qty ||
              item.quantity,
          ) || 1,

        price:
          Number(item.price) || 0,

        taxPercent:
          Number(
            item.taxPercent,
          ) || 0,

        totalPrice:
          Number(
            item.totalPrice,
          ) || 0,
      }));

    const payload = {
      modelId:
        Number(selectedModel.id),

      showroomVariantId:
        Number(selectedVariant.id),

      colourId:
        Number(selectedColour.id),

      selectedAccessories,
    };

    console.log(
      "UPDATE QUOTATION PAYLOAD:",
      payload,
    );

    const response =
      await apiHelper.put(
        `/leads/${id}/quotation`,
        payload,
      );

    console.log(
      "UPDATE QUOTATION RESPONSE:",
      response.data,
    );

    toast.success(
      response.data.message ||
        "Quotation updated successfully",
    );

    navigate("/leadmaster/leadbuilder");
  } catch (error: any) {
    console.error(
      "UPDATE QUOTATION ERROR:",
      error,
    );

    console.error(
      "BACKEND ERROR:",
      error?.response?.data,
    );

    toast.error(
      error?.response?.data?.message ||
        "Failed to update quotation",
    );
  } finally {
    setSaving(false);
  }
};

  // Send quotation
  // const handleSend = async () => {
  //   try {
  //     setSaving(true);
  //     await apiHelper.post(`/leads/${id}/quotation/send`);
  //     toast.success("Quotation sent successfully!");
  //     navigate(`/leadmaster`);
  //   } catch (error) {
  //     console.error("Error sending quotation:", error);
  //     toast.error("Failed to send quotation");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500 dark:text-gray-400">
            Loading quotation...
          </p>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Quotation not found
          </p>
          <button
            onClick={() => navigate("/leadmaster/leadbuilder")}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  const exShowroomTotal =
    Number(showroomVariant?.exShowroomPrice || 0) +
    (Number(showroomVariant?.exShowroomPrice || 0) *
      Number(showroomVariant?.exShowroomTaxPercent || 0)) /
      100;

  const insuranceTotal =
    Number(showroomVariant?.insurance || 0) +
    (Number(showroomVariant?.insurance || 0) *
      Number(showroomVariant?.insuranceTaxPercent || 0)) /
      100;

  const rtoTotal =
    Number(showroomVariant?.rtoCharge || 0) +
    (Number(showroomVariant?.rtoCharge || 0) *
      Number(showroomVariant?.rtoTaxPercent || 0)) /
      100;
      const grandTotal =
  exShowroomTotal + insuranceTotal + rtoTotal;
  return (
    <div className="min-h-screen bg-white p-6 transition-colors duration-200 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/leadmaster/leadbuilder")}
            className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Edit Quotation
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
           Quotation #
{quotation.quotationRevision > 0
  ? `${quotation.quotationNo}/R${quotation.quotationRevision}`
  : quotation.quotationNo}


            </p>
          </div>
          <div className="ml-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                quotation.status === "Draft"
                  ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  : quotation.status === "Sent"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : quotation.status === "Accepted"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : quotation.status === "Rejected"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {quotation.status}
            </span>
          </div>
        </div>

        {/* <div className="flex flex-wrap items-center gap-2">
          <Button
            color="primary"
            onClick={handleSave}
   
            disabled={saving}
          >
            <CheckIcon className="mr-1.5 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            color="success"
            onClick={handleSend}
        
            disabled={saving || quotation.status === "Sent"}
          >
            Send Quotation
          </Button>
        </div> */}
      </div>

      {/* Customer & Vehicle Info */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-4 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
            Customer Name
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {quotation.customer?.accountName}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
            Phone
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {quotation.customer?.mobile}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
            Quotation Date
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {quotation?.createdAt
              ? new Date(quotation.createdAt).toLocaleDateString("en-IN")
              : "-"}
          </p>
        </div>
        {/* <div>
          <p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
            Valid Until
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {new Date(quotation.validUntil).toLocaleDateString("en-IN")}
          </p>
        </div> */}
      </div>

      {/* Showroom Variant Details - Replaces Model, Variant, Colour */}

      <div className="">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
          <SparklesIcon className="mr-2 mb-1 inline h-5 w-5 text-blue-600 dark:text-blue-400" />
          Showroom Variant Details
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <Combobox
              label="Model"
              data={models}
              value={selectedModel}
              displayField="modelName"
              searchFields={["modelName"]}
              placeholder="Select Model"
              onChange={handleModelChange}
            />
          </div>

          <div>
            <Combobox
              label="Variant"
              data={variants}
              value={selectedVariant}
              displayField="variantName"
              searchFields={["variantName"]}
              placeholder="Select Variant"
              onChange={handleVariantChange}
            />
          </div>

          <div>
            <Combobox
              label="Colour"
              data={colours}
              value={selectedColour}
              displayField="colourName"
              searchFields={["colourName"]}
              placeholder="Select Colour"
              onChange={handleColourChange}
            />
          </div>
        </div>
        <div className="my-6 border-t border-gray-300 dark:border-gray-700"></div>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input
            label="Ex Showroom Amount"
            value={exShowroomTotal.toFixed(2)}
            readOnly
          />

          <Input
            label="Insurance Amount"
            value={insuranceTotal.toFixed(2)}
            readOnly
          />

          <Input label="RTO Amount" value={rtoTotal.toFixed(2)} readOnly />
        </div>
      </div>

      {/* Accessories Section */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            <CogIcon className="mr-2 inline h-5 w-5" />
            Accessories
          </h3>

          <span className="text-sm text-gray-500">
            Selected : {accessories.filter((a) => a.selected).length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          {accessories.map((accessory: any, index) => (
            <div key={accessory.id} className="">
              {/* Top */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {accessory.accessory?.name || accessory.name}
                  </span>
                </div>

                <Switch
                  checked={accessory.selected}
                  onChange={() => toggleAccessory(index)}
                  className={`${
                    accessory.selected ? "bg-blue-600" : "bg-gray-400"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      accessory.selected ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>

              {/* Price */}
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Price
                </label>

                <Input value={accessory.price || ""} readOnly />
              </div>
            </div>
          ))}
        </div>
      </div>

    

      {/* Summary */}
   <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-gray-200 bg-linear-to-br from-blue-50 to-white p-4 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-blue-600/10 p-2 dark:bg-blue-500/20">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                   Total Amount
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                   ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}

        {/* Action Buttons */}
        <div className="flex w-full max-w-md gap-3 ">
          <Button
            color="primary"
            onClick={handleSave}
            
            disabled={saving}
            className="flex-1"
          >
            <CheckIcon className="mr-1.5 h-4 w-4" />
            Update{" "}
          </Button>
          <Button
            color="success"
            onClick={() => navigate("/leadmaster/leadbuilder")}
         
            disabled={saving || quotation.status === "Sent"}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuotationEdit;
