// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import apiHelper from "@/utils/apiHelper";
// Local Imports
import { Button, Input } from "@/components/ui";
import { useKYCFormContext } from "../KYCFormContext";
import { HydraulicTyresSchema, HydraulicTyresType } from "../schema";
import {
  Tractor,
  Settings,
  GitBranch,
  CheckCircle,
  Joystick,
} from "lucide-react";
// ----------------------------------------------------------------------
import { Listbox } from "@/components/shared/form/StyledListbox";
import { toast } from "sonner";
import { useEffect } from "react";

// Options for select fields
const hydraulicTypeOptions = [
  { label: "Standard Hydraulics", value: "standard" },
  { label: "Advanced Hydraulics", value: "advanced" },
  { label: "Premium Hydraulics", value: "premium" },
];
const hydraulicTypes = [
  {
    label: "ADDC",
    value: "addc",
    description: "Automatic Depth & Draft Control",
    icon: GitBranch,
  },
  {
    label: "Position Control",
    value: "positionControl",
    description: "Maintain implement position",
    icon: Tractor,
  },
  {
    label: "Draft Control",
    value: "draftControl",
    description: "Automatic draft sensing control",
    icon: Settings,
  },
];
const controlTypeOptions = [
  {
    label: "Automatic Control",
    value: "automatic",
    description: "Automatic response and easy operation",
    icon: Settings,
  },
  {
    label: "Manual Control",
    value: "manual",
    description: "Manual operation and full control",
    icon: Joystick,
  },
];

const remoteValveOptions = [
  {
    label: "Single Acting",
    value: "single_acting",
    description: "For single direction operation",
  },
  {
    label: "Double Acting",
    value: "double_acting",
    description: "For both direction operation",
  },
];

const remoteValveCountOptions = [
  { label: "1 Remote Valve", value: "1" },
  { label: "2 Remote Valves", value: "2" },
  { label: "3 Remote Valves", value: "3" },
  { label: "4 Remote Valves", value: "4" },
  { label: "5+ Remote Valves", value: "5_plus" },
];
const linkageOptions = [
  { label: "Category I", value: "cat1" },
  { label: "Category II", value: "cat2" },
  { label: "Category III", value: "cat3" },
];

const linkageCategoryOptions = [
  { label: "Category 1", value: "category1" },
  { label: "Category 2", value: "category2" },
];

const topLinkOptions = [
  { label: "Adjustable", value: "adjustable" },
  { label: "Fixed", value: "fixed" },
];

const draftSensitivityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];
export function HydraulicTyres({
  setCurrentStep,
  websiteVariantId,   
  editData, 
   isEditMode,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  websiteVariantId?: string | null;
  editData?: any;
   isEditMode?: boolean;
}) {
  const kycFormCtx = useKYCFormContext();
  const [loading, setLoading] = useState(false);

   const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,             // ✅
  } = useForm<HydraulicTyresType>({
    resolver: yupResolver(HydraulicTyresSchema) as Resolver<HydraulicTyresType>,
    defaultValues: kycFormCtx.state.formData.HydraulicTyres,
  });
 useEffect(() => {
    if (!editData) return;

    reset({
      liftingCapacity: editData.liftingCapacity ?? "",
      liftingCapacityAt610mm: editData.liftingCapacityAt610mm ?? "",
      hydraulicType: editData.hydraulicType ?? "",
      controlType: editData.controlType ?? "",
      remoteValveType: editData.remoteValveType ?? "",
      numberOfRemoteValves: editData.numberOfRemoteValves ?? "",
      threePointLinkage: editData.threePointLinkage ?? "",
      linkageCategory: editData.linkageCategory ?? "",
      topLink: editData.topLink ?? "",
      draftSensitivity: editData.draftSensitivity ?? "",
      features: {
        externalHydraulicCylinder: editData.externalHydraulicCylinder ?? false,
        selfLevelling: editData.selfLevelling ?? false,
        quickHitch: editData.quickHitch ?? false,
        downPositionControl: editData.downPositionControl ?? false,
        loadSensing: editData.loadSensing ?? false,
        flowControl: editData.flowControl ?? false,
        returnToDepth: editData.returnToDepth ?? false,
        transportLock: editData.transportLock ?? false,
      },
    });
  }, [editData, reset]);
 const onSubmit = async (data: HydraulicTyresType) => {
  try {
    setLoading(true);

    

    if (!websiteVariantId) {
      toast.warning("No website variant found. Please save basic information first.");
      return;
    }

    const payload = {
      liftingCapacity: data.liftingCapacity ? Number(data.liftingCapacity) : null,
      liftingCapacityAt610mm: data.liftingCapacityAt610mm ? Number(data.liftingCapacityAt610mm) : null,
      hydraulicType: data.hydraulicType,
      controlType: data.controlType,
      remoteValveType: data.remoteValveType,
      numberOfRemoteValves: data.numberOfRemoteValves,
      threePointLinkage: data.threePointLinkage,
      linkageCategory: data.linkageCategory,
      topLink: data.topLink,
      draftSensitivity: data.draftSensitivity,
      externalHydraulicCylinder: data.features?.externalHydraulicCylinder ?? false,
      selfLevelling: data.features?.selfLevelling ?? false,
      quickHitch: data.features?.quickHitch ?? false,
      downPositionControl: data.features?.downPositionControl ?? false,
      loadSensing: data.features?.loadSensing ?? false,
      flowControl: data.features?.flowControl ?? false,
      returnToDepth: data.features?.returnToDepth ?? false,
      transportLock: data.features?.transportLock ?? false,
      currentStep: 4,
    };

    await apiHelper.put(`/website-variants/${websiteVariantId}/save-step`, payload);

    kycFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: {
        HydraulicTyres: data,
      },
    });

    kycFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: {
        HydraulicTyres: {
          isDone: true,
        },
      },
    });

    toast.success("Hydraulic details saved successfully!");
    setCurrentStep(4);
  } catch (error: any) {
    console.error("Hydraulic Save Error:", error);
    toast.error(error.response?.data?.message || "Failed to save hydraulic details. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-8">
        {/* Hydraulic System Section */}
        <div className="">
          {/* <h3 className="mb-2 text-lg font-semibold">Hydraulic System</h3>
          <p className="mb-4 text-sm text-gray-500">
            Add hydraulic system details of this tractor
          </p> */}

          {/* Lifting Capacity */}
          <div className="border-b border-gray-700 pb-6">
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              {/* Left Side */}
              <div>
                <h4 className="mb-3 text-base font-semibold">
                  Lifting Capacity
                </h4>

                <label className="mb-1 block text-sm font-medium">
                  Maximum Lifting Capacity (kg)
                  <span className="text-red-500">*</span>
                </label>

                <div className="flex items-center gap-3">
                  <Input
                    {...register("liftingCapacity")}
                    type="number"
                    placeholder="Enter lifting capacity"
                    error={errors?.liftingCapacity?.message}
                    className="flex-1"
                  />
                  <span className="text-gray-500">kg</span>
                </div>
              </div>

              {/* Right Side */}
              <div>
                <h4 className="mb-3 text-base font-semibold">
                  Lifting Capacity at Link End
                </h4>

                <label className="mb-1 block text-sm font-medium">
                  At 610 mm (kg)
                </label>

                <div className="flex items-center gap-3">
                  <Input
                    {...register("liftingCapacityAt610mm")}
                    type="number"
                    placeholder="Enter capacity at 610 mm"
                    error={errors?.liftingCapacityAt610mm?.message}
                    className="flex-1"
                  />
                  <span className="text-gray-500">kg</span>
                </div>
              </div>
            </div>
          </div>
          {/* Hydraulic Type */}
          <div className="mt-6 border-b border-gray-700 pb-6 ">
            <label className="mb-5 block text-lg font-semibold">
              Hydraulic Type
            </label>

            <Controller
              name="hydraulicType"
              control={control}
              render={({ field }) => (
                <div className="grid gap-4 md:grid-cols-3">
                  {hydraulicTypes.map((item) => {
                    const Icon = item.icon;
                    const selected = field.value === item.value;

                    return (
                      <div
                        key={item.value}
                        onClick={() => field.onChange(item.value)}
                        className={`relative cursor-pointer rounded-lg border border-gray-600 p-5 transition-all ${
                          selected ? "border-primary-500" : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <CheckCircle className="text-primary-500 absolute top-3 right-3 h-5 w-5" />
                        )}

                        <div className="flex items-start gap-4">
                          <Icon className="mt-1 h-15 w-15 text-gray-700" />

                          <div>
                            <h4 className="font-semibold">{item.label}</h4>

                            <p className="mt-1 text-sm text-gray-500">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            />
          </div>
        </div>

        {/* Control Type Section */}
      
        <Controller
          name="controlType"
          control={control}
          render={({ field }) => (
            <div className=" ">
              <h3 className="mb-1 text-lg font-semibold">Control Type</h3>

              <p className="mb-4 text-sm text-gray-500">Select control type</p>

              <div className="grid gap-4 md:grid-cols-2">
                {controlTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = field.value === option.value;

                  return (
                    <div
                      key={option.value}
                      onClick={() => field.onChange(option.value)}
                      className={`relative cursor-pointer rounded-lg border border-gray-600 p-5 transition-all ${
                        selected ? "border-primary-500" : "border-gray-300"
                      }`}
                    >
                      {selected && (
                        <CheckCircle className="text-primary-500 absolute top-3 right-3 h-5 w-5" />
                      )}

                      <div className="flex items-center gap-4">
                        <Icon className="h-12 w-12 text-gray-600" />

                        <div>
                          <h4 className="font-semibold">{option.label}</h4>

                          <p className="mt-1 text-sm text-gray-500">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors?.controlType && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.controlType.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Remote Valve (Spool) Section */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-600 p-4">
            <h3 className="mb-4 text-lg font-semibold">Remote Valve (Spool)</h3>
            <div className="flex flex-wrap gap-6">
              {remoteValveOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register("remoteValveType")}
                    className="mt-1 h-4 w-4 "
                  />
                  <div>
                    <span className="font-medium">{option.label}</span>
                    <p className="text-sm text-gray-500">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            {errors?.remoteValveType && (
              <p className="mt-2 text-sm text-red-500">
                {errors.remoteValveType.message}
              </p>
            )}
          </div>

          {/* Number of Remote Valves */}
          <div className="rounded-lg border border-gray-600 p-4">
            
            <h3 className="mb-4 text-lg font-semibold">Number of Remote Valves</h3>
              <h1 className="mb-4 text-[13px] font-semibold">How many remote valves are available ?</h1>
            <Controller
              name="numberOfRemoteValves"
              control={control}
              render={({ field }) => (
                <Listbox
                  data={remoteValveCountOptions}
                  value={
                    remoteValveCountOptions.find(
                      (item) => item.value === field.value,
                    ) || null
                  }
                  onChange={(option: any) => field.onChange(option?.value)}
                  displayField="label"
                  placeholder="Select number of remote valves"
                  // label="Number of Remote Valves"
                />
              )}
            />
            {errors?.numberOfRemoteValves && (
              <p className="mt-2 text-sm text-red-500">
                {errors.numberOfRemoteValves.message}
              </p>
            )}
          </div>
        </div>
    <div className="mb-8 border-b border-gray-600" />
          {/* <div className="border-b border-gray-700 py-4"> */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* 3 Point Linkage */}
  <Controller
    name="threePointLinkage"
    control={control}
    render={({ field }) => (
      <Listbox
        label="3 Point Linkage"
        data={linkageOptions}
        value={
          linkageOptions.find(
            (item) => item.value === field.value
          ) || null
        }
        onChange={(option: any) =>
          field.onChange(option?.value)
        }
        displayField="label"
        placeholder="Select linkage type"
      />
    )}
  />

  {/* Linkage Category */}
  <Controller
    name="linkageCategory"
    control={control}
    render={({ field }) => (
      <Listbox
        label="Linkage Category"
        data={linkageCategoryOptions}
        value={
          linkageCategoryOptions.find(
            (item) => item.value === field.value
          ) || null
        }
        onChange={(option: any) =>
          field.onChange(option?.value)
        }
        displayField="label"
        placeholder="Select category"
      />
    )}
  />

  {/* Top Link */}
  <Controller
    name="topLink"
    control={control}
    render={({ field }) => (
      <Listbox
        label="Top Link"
        data={topLinkOptions}
        value={
          topLinkOptions.find(
            (item) => item.value === field.value
          ) || null
        }
        onChange={(option: any) =>
          field.onChange(option?.value)
        }
        displayField="label"
        placeholder="Select top link"
      />
    )}
  />

  {/* Draft Sensitivity */}
  <Controller
    name="draftSensitivity"
    control={control}
    render={({ field }) => (
      <Listbox
        label="Draft Sensitivity"
        data={draftSensitivityOptions}
        value={
          draftSensitivityOptions.find(
            (item) => item.value === field.value
          ) || null
        }
        onChange={(option: any) =>
          field.onChange(option?.value)
        }
        displayField="label"
        placeholder="Select sensitivity"
      />
    )}
  />
{/* </div> */}
</div>
<div className="mb-8 border-b border-gray-600" />
        {/* Additional Hydraulic Features */}
        <div className="">
          <h3 className="mb-4 text-lg font-semibold">
            Additional Hydraulic Features
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                {...register("features.externalHydraulicCylinder")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>External Hydraulic Cylinder</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                {...register("features.selfLevelling")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>Self Levelling</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                {...register("features.quickHitch")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>Quick Hitch</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                {...register("features.downPositionControl")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>Down Position Control</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                {...register("features.loadSensing")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>Load Sensing</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                {...register("features.flowControl")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>Flow Control</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                {...register("features.returnToDepth")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>Return to Depth</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                {...register("features.transportLock")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>Transport Lock</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          // variant="outline"
          className="min-w-28"
          onClick={() => setCurrentStep(2)}
        >
          Previous
        </Button>
        <Button
          type="submit"
          className="min-w-28"
          color="primary"
          disabled={loading}
        >
              {isEditMode ? "Update & Next" : "Save & Next"}
        </Button>
      </div>
    </form>
  );
}
