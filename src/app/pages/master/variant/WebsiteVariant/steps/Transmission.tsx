// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm, Resolver } from "react-hook-form";
import { useEffect } from "react";
// Local Imports
import { Button, Input } from "@/components/ui";
import { useKYCFormContext } from "../KYCFormContext";
import { TransmissionSchema, TransmissionType } from "../schema";
import { Listbox } from "@/components/shared/form/StyledListbox";

// ----------------------------------------------------------------------
import apiHelper from "@/utils/apiHelper";
import { Disc3, Settings, Cog, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Options for various select fields
const gearTypeOptions = [
  { label: "Side Shift", value: "side_shift" },
  { label: "Constant Mesh", value: "constant_mesh" },
  { label: "Synchromesh", value: "synchromesh" },
  { label: "Sliding Mesh", value: "sliding_mesh" },
];

const ptoTypeOptions = [
  { label: "Independent", value: "independent" },
  { label: "Dependent", value: "dependent" },
  { label: "Live", value: "live" },
  { label: "Continuous", value: "continuous" },
];

const ptoPositionOptions = [
  { label: "Rear", value: "rear" },
  { label: "Front", value: "front" },
  { label: "Both", value: "both" },
];
const ptoRpmOptions = [
  { label: "540 RPM", value: 540 },
  { label: "750 RPM", value: 750 },
  { label: "1000 RPM", value: 1000 },
  { label: "540/540 RPM", value: 540540 },
  { label: "540/1000 RPM", value: 5401000 },
  { label: "540/750 RPM", value: 540750 },
];
const reverseGearOptions = [
  { label: "1 Reverse Gear", value: 1 },
  { label: "2 Reverse Gears", value: 2 },
  { label: "3 Reverse Gears", value: 3 },
  { label: "4 Reverse Gears", value: 4 },
  { label: "5 Reverse Gears", value: 5 },
  { label: "6 Reverse Gears", value: 6 },
  { label: "8 Reverse Gears", value: 8 },
  { label: "10 Reverse Gears", value: 10 },
];
const clutchOptions = [
  {
    label: "Single Clutch",
    value: "single_clutch",
    description: "Standard single clutch system",
    icon: Disc3,
  },
  {
    label: "Dual Clutch",
    value: "dual_clutch",
    description: "Dual clutch for smooth operation",
    icon: Settings,
  },
  {
    label: "Double Clutch",
    value: "double_clutch",
    description: "Provides better control & power",
    icon: Cog,
  },
];
const transmissionTypeOptions = [
  {
    label: "Sliding Mesh",
    value: "sliding_mesh",
    description: "Simple and cost effective",
    icon: Cog,
  },
  {
    label: "Constant Mesh",
    value: "constant_mesh",
    description: "Better performance and durability",
    icon: Settings,
  },
  {
    label: "Synchromesh",
    value: "synchromesh",
    description: "Smooth gear shifting and easy to operate",
    icon: Cog,
  },
];
const forwardGearOptions = [
  { label: "4 Forward Gears", value: 4 },
  { label: "6 Forward Gears", value: 6 },
  { label: "8 Forward Gears", value: 8 },
  { label: "10 Forward Gears", value: 10 },
  { label: "12 Forward Gears", value: 12 },
  { label: "16 Forward Gears", value: 16 },
  { label: "20 Forward Gears", value: 20 },
  { label: "24 Forward Gears", value: 24 },
];
export function Transmission({
  setCurrentStep,
   websiteVariantId,   // ✅
  editData,
    isEditMode,
}: {
  setCurrentStep: (step: number) => void;
   websiteVariantId?: string | null;
  editData?: any;
   isEditMode?: boolean;
}) {
  const kycFormCtx = useKYCFormContext();

    const {
    register,
    handleSubmit,
    control,
    watch,
    reset,             // ✅
    formState: { errors },
  } = useForm<TransmissionType>({
    resolver: yupResolver(TransmissionSchema) as Resolver<TransmissionType>,
    defaultValues: kycFormCtx.state.formData.Transmission,
  });
 useEffect(() => {
    if (!editData) return;

    reset({
      clutchType: editData.clutchType ?? "",
      forwardGears: editData.forwardGears ?? "",
      reverseGears: editData.reverseGears ?? "",
      gearType: editData.gearType ?? "",
      transmissionType: editData.transmissionType ?? "",
      ptoHp: editData.ptoHp ?? "",
      ptoRpm: editData.ptoRpm ?? "",
      ptoType: editData.ptoType ?? "",
      ptoPosition: editData.ptoPosition ?? "",
      features: {
        creeperGears: editData.creeperGears ?? false,
        shuttleShift: editData.shuttleShift ?? false,
        sideShiftGear: editData.sideShiftGear ?? false,
        powerShuttle: editData.powerShuttle ?? false,
        hiLoGears: editData.hiLoGears ?? false,
        multiSpeedPto: editData.multiSpeedPto ?? false,
        reversePto: editData.reversePto ?? false,
        superReducer: editData.superReducer ?? false,
      },
    });
  }, [editData, reset]);
  const onSubmit = async (data: TransmissionType) => {
    try {
     

      if (!websiteVariantId) {
        toast.warning(
          "No website variant found. Please save basic information first.",
        );
        return;
      }

      const payload = {
        clutchType: data.clutchType,
        forwardGears: data.forwardGears ? Number(data.forwardGears) : null,
        reverseGears: data.reverseGears ? Number(data.reverseGears) : null,
        gearType: data.gearType,
        transmissionType: data.transmissionType,
        ptoHp: data.ptoHp ? Number(data.ptoHp) : null,
        ptoRpm: data.ptoRpm ? Number(data.ptoRpm) : null,
        ptoType: data.ptoType,
        ptoPosition: data.ptoPosition,
        creeperGears: data.features?.creeperGears ?? false,
        shuttleShift: data.features?.shuttleShift ?? false,
        sideShiftGear: data.features?.sideShiftGear ?? false,
        powerShuttle: data.features?.powerShuttle ?? false,
        hiLoGears: data.features?.hiLoGears ?? false,
        multiSpeedPto: data.features?.multiSpeedPto ?? false,
        reversePto: data.features?.reversePto ?? false,
        superReducer: data.features?.superReducer ?? false,
        currentStep: 3,
      };

      await apiHelper.put(
        `/website-variants/${websiteVariantId}/save-step`,
        payload,
      );

      kycFormCtx.dispatch({
        type: "SET_FORM_DATA",
        payload: {
          Transmission: data,
        },
      });

      kycFormCtx.dispatch({
        type: "SET_STEP_STATUS",
        payload: {
          Transmission: {
            isDone: true,
          },
        },
      });

      toast.success("Transmission details saved successfully!");
      setCurrentStep(3);
    } catch (error: any) {
      console.error("Transmission Save Error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save transmission details. Please try again.",
      );
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-8">
        {/* Transmission Details Section */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-2 text-lg font-semibold">Transmission Details</h3>
          <p className="mb-4 text-sm text-gray-500">
            Add transmission specifications of this tractor
          </p>

          {/* Clutch Section */}
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-gray-700">Clutch</h4>
            <div className="flex flex-wrap gap-4">
              {clutchOptions.map((option) => {
                const selected = watch("clutchType") === option.value;

                return (
                  <label
                    key={option.value}
                    className={`relative flex min-w-[280px] cursor-pointer items-center gap-4 rounded-lg border p-4 ${
                      selected
                        ? "border-primary-500 bg-primary/10"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register("clutchType")}
                      className="hidden"
                    />

                    {selected && (
                      <CheckCircle className="text-primary-500 absolute top-3 right-3 h-5 w-5" />
                    )}

                    <option.icon className="text-primary-500 h-10 w-10" />

                    <div>
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors?.clutchType && (
              <p className="mt-2 text-sm text-red-500">
                {errors.clutchType.message}
              </p>
            )}
          </div>

          {/* Gear Box Section */}
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-gray-700">Gear Box</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Controller
                  name="forwardGears"
                  control={control}
                  render={({ field }) => (
                    <Listbox
                      data={forwardGearOptions}
                      value={
                        forwardGearOptions.find(
                          (item) => item.value === Number(field.value),
                        ) || null
                      }
                      onChange={(option: any) => field.onChange(option?.value)}
                      displayField="label"
                      label="Forword Gears"
                      placeholder="Select Forword Gears"
                    />
                  )}
                />
                {errors?.forwardGears && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.forwardGears.message}
                  </p>
                )}
              </div>

              <div>
                <Controller
                  name="reverseGears"
                  control={control}
                  render={({ field }) => (
                    <Listbox
                      data={reverseGearOptions}
                      value={
                        reverseGearOptions.find(
                          (item) => item.value === Number(field.value),
                        ) || null
                      }
                      onChange={(option: any) => field.onChange(option?.value)}
                      displayField="label"
                      label="Reverse Gears"
                      placeholder="Select Reverse Gears"
                    />
                  )}
                />

                {errors?.reverseGears && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.reverseGears.message}
                  </p>
                )}
              </div>

              <div>
                <Controller
                  name="gearType"
                  control={control}
                  render={({ field }) => (
                    <Listbox
                      data={gearTypeOptions}
                      value={
                        gearTypeOptions.find(
                          (item) => item.value === field.value,
                        ) || null
                      }
                      onChange={(option: any) => field.onChange(option?.value)}
                      displayField="label"
                      label=" Gear Type"
                      placeholder="Select  Gear Type"
                    />
                  )}
                />
                {errors?.gearType && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.gearType.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Transmission Type Section */}
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-gray-700">
              Transmission Type
            </h4>
            <div className="flex flex-wrap gap-4">
              {transmissionTypeOptions.map((option) => {
                const selected = watch("transmissionType") === option.value;

                return (
                  <label
                    key={option.value}
                    className={`relative flex min-w-[280px] cursor-pointer items-center gap-4 rounded-lg border p-4 ${
                      selected
                        ? "border-primary-500 bg-primary/10"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register("transmissionType")}
                      className="hidden"
                    />

                    {selected && (
                      <CheckCircle className="text-primary-500 absolute top-3 right-3 h-5 w-5" />
                    )}

                    <option.icon className="text-primary-500 h-10 w-10" />

                    <div>
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors?.transmissionType && (
              <p className="mt-2 text-sm text-red-500">
                {errors.transmissionType.message}
              </p>
            )}
          </div>

          {/* PTO (Power Take Off) Section */}
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-gray-700">
              PTO (Power Take Off)
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  PTO HP <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("ptoHp")}
                  type="number"
                  placeholder="Enter PTO HP"
                  error={errors?.ptoHp?.message}
                />
              </div>

              <div>
                <Controller
                  name="ptoRpm"
                  control={control}
                  render={({ field }) => (
                    <Listbox
                      data={ptoRpmOptions}
                      value={
                        ptoRpmOptions.find(
                          (item) => item.value === Number(field.value),
                        ) || null
                      }
                      onChange={(option: any) => field.onChange(option?.value)}
                      displayField="label"
                      label="PTO RPM"
                      placeholder="Select PTO RPM"
                    />
                  )}
                />

                {errors?.ptoRpm && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.ptoRpm.message}
                  </p>
                )}
              </div>

              <div>
                <Controller
                  name="ptoType"
                  control={control}
                  render={({ field }) => (
                    <Listbox
                      data={ptoTypeOptions}
                      value={
                        ptoTypeOptions.find(
                          (item) => item.value === field.value,
                        ) || null
                      }
                      onChange={(option: any) => field.onChange(option?.value)}
                      displayField="label"
                      label="PTO Type"
                      placeholder="Select PTO Type"
                    />
                  )}
                />

                {errors?.ptoType && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.ptoType.message}
                  </p>
                )}
              </div>

              <div>
                <Controller
                  name="ptoPosition"
                  control={control}
                  render={({ field }) => (
                    <Listbox
                      data={ptoPositionOptions}
                      value={
                        ptoPositionOptions.find(
                          (item) => item.value === field.value,
                        ) || null
                      }
                      onChange={(option: any) => field.onChange(option?.value)}
                      displayField="label"
                      label="PTO Position"
                      placeholder="Select PTO Position"
                    />
                  )}
                />

                {errors?.ptoPosition && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.ptoPosition.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Transmission Features */}
          <div className="mt-4">
            <h4 className="mb-3 font-medium text-gray-700">
              Additional Transmission Features
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  {...register("features.creeperGears")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>Creeper Gears</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  {...register("features.shuttleShift")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>Shuttle Shift</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  {...register("features.sideShiftGear")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>Side Shift Gear</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  {...register("features.powerShuttle")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>Power Shuttle</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  {...register("features.hiLoGears")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>Hi-Lo Gears</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  {...register("features.multiSpeedPto")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>Multi Speed PTO</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  {...register("features.reversePto")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>Reverse PTO</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  {...register("features.superReducer")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>Super Reducer (Optional)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="outlined"
          className="min-w-28"
          onClick={() => setCurrentStep(1)}
        >
          Previous
        </Button>
        <Button type="submit" className="min-w-28" color="primary">
          {isEditMode ? "Update & Next" : "Save & Next"}
        </Button>
      </div>
    </form>
  );
}
