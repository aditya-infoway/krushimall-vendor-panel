// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm, Resolver } from "react-hook-form";
import { useEffect } from "react";
// Local Imports
import { Button, Input, } from "@/components/ui";
import { useKYCFormContext } from "../KYCFormContext";
import { EnginedetailsSchema, EnginedetailsType } from "../schema";
import { Droplets, Filter, Cog, CheckCircle, Thermometer } from "lucide-react";
// ----------------------------------------------------------------------
import { Listbox } from "@/components/shared/form/StyledListbox";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";


// Options for various select fields
const engineTypeOptions = [
  { label: "Diesel", value: "diesel" },
  { label: "Petrol", value: "petrol" },
  { label: "CNG", value: "cng" },
  { label: "Electric", value: "electric" },
  { label: "Hybrid", value: "hybrid" },
];

const fuelTypeOptions = [
  { label: "Diesel", value: "diesel" },
  { label: "Petrol", value: "petrol" },
  { label: "CNG", value: "cng" },
  { label: "Electric", value: "electric" },
];

const cylinderOptions = [
  { label: "2 Cylinders", value: "2" },
  { label: "3 Cylinders", value: "3" },
  { label: "4 Cylinders", value: "4" },
  { label: "6 Cylinders", value: "6" },
];

const aspiratedTypeOptions = [
  { label: "Naturally Aspirated", value: "naturally_aspirated" },
  { label: "Turbocharged", value: "turbocharged" },
  { label: "Turbocharged Intercooled", value: "turbocharged_intercooled" },
];

const emissionNormsOptions = [
  { label: "BS-III", value: "bs3" },
  { label: "BS-IV", value: "bs4" },
  { label: "BS-V", value: "bs5" },
  { label: "BS-VI", value: "bs6" },
  { label: "Euro 5", value: "euro5" },
  { label: "Euro 6", value: "euro6" },
];

const coolingSystemOptions = [
  {
    label: "Water Cooled",
    value: "water_cooled",
    description: "More efficient cooling • Better performance",
    icon: Droplets,
  },
  {
    label: "Oil Cooled",
    value: "oil_cooled",
    description: "Low maintenance • Suitable for heavy duty",
    icon: Thermometer,
  },
];

const airFilterTypeOptions = [
  {
    label: "Dry Type",
    value: "dry_type",
    description: "Low maintenance • Easy to replace",
    icon: Filter,
  },
  {
    label: "Oil Bath Type",
    value: "oil_bath_type",
    description: "Better dust trapping • Longer life",
    icon: Droplets,
  },
  {
    label: "Dual Element Type",
    value: "dual_element_type",
    description: "High efficiency • Better engine protection",
    icon: Cog,
  },
];

const engineConditionOptions = [
  { label: "New", value: "new", description: "Brand new engine" },
  { label: "Excellent", value: "excellent", description: "Well maintained" },
  { label: "Good", value: "good", description: "Normal condition" },
  { label: "Average", value: "average", description: "Average condition" },
];

export function Enginedetails({
  setCurrentStep,
   websiteVariantId,   // ✅ prop accept karo
  editData,
    isEditMode,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  websiteVariantId?: string | null;
  editData?: any;
    isEditMode?: boolean;
}) {
  const kycFormCtx = useKYCFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
  } = useForm<EnginedetailsType>({
    resolver: yupResolver(EnginedetailsSchema) as unknown as Resolver<EnginedetailsType>,
    defaultValues: kycFormCtx.state.formData.Enginedetails,
  });
useEffect(() => {
    if (!editData) return;

    reset({
      engineType: editData.engineType ?? "",
      fuelType: editData.fuelType ?? "",
      horsePower: editData.horsePower ?? "",
      numberOfCylinders: editData.numberOfCylinders ?? "",
      cubicCapacity: editData.cubicCapacity ?? "",
      ratedRpm: editData.ratedRpm ?? "",
      aspiratedType: editData.aspiratedType ?? "",
      emissionNorms: editData.emissionNorms ?? "",
      coolingSystem: editData.coolingSystem ?? "",
      airFilterType: editData.airFilterType ?? "",
      maximumTorque: editData.maximumTorque ?? "",
      torqueRpm: editData.torqueRpm ?? "",
      torqueBackup: editData.torqueBackup ?? "",
      engineCondition: editData.engineCondition ?? "",
    });
  }, [editData, reset]);
  const onSubmit = async (data: EnginedetailsType) => {
  try {
  

    if (!websiteVariantId) {
      toast.warning("No website variant found. Please save basic information first.");
      return;
    }

    const payload = {
      engineType: data.engineType,
      fuelType: data.fuelType,
      horsePower: data.horsePower ? Number(data.horsePower) : null,
      numberOfCylinders: data.numberOfCylinders,
      cubicCapacity: data.cubicCapacity ? Number(data.cubicCapacity) : null,
      ratedRpm: data.ratedRpm ? Number(data.ratedRpm) : null,
      aspiratedType: data.aspiratedType,
      emissionNorms: data.emissionNorms,
      coolingSystem: data.coolingSystem,
      airFilterType: data.airFilterType,
      maximumTorque: data.maximumTorque ? Number(data.maximumTorque) : null,
      torqueRpm: data.torqueRpm ? Number(data.torqueRpm) : null,
      torqueBackup: data.torqueBackup ? Number(data.torqueBackup) : null,
      engineCondition: data.engineCondition,
      currentStep: 1,
    };

    await apiHelper.put(`/website-variants/${websiteVariantId}/save-step`, payload);

    kycFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: {
        Enginedetails: data,
      },
    });

    kycFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: {
        Enginedetails: {
          isDone: true,
        },
      },
    });

    toast.success("Engine details saved successfully!");
    setCurrentStep(2);
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Failed to save engine details. Please try again.");
  }
};

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-8">
        {/* Engine Details Section */}
        <div className="">
          <h3 className="mb-4 text-lg font-semibold">Engine Details</h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Controller
                name="engineType"
                control={control}
                render={({ field }) => (
                  <Listbox
                    data={engineTypeOptions}
                    value={
                      engineTypeOptions.find(
                        (item) => item.value === field.value,
                      ) || null
                    }
                    onChange={(option: any) => field.onChange(option?.value)}
                    displayField="label"
                    placeholder="Select Engine Type"
                    label="Engine Type"
                  />
                )}
              />
              {errors?.engineType && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.engineType.message}
                </p>
              )}
            </div>

            <div>
              <Controller
                name="fuelType"
                control={control}
                render={({ field }) => (
                  <Listbox
                    data={fuelTypeOptions}
                    value={
                      fuelTypeOptions.find(
                        (item) => item.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value)}
                    displayField="label"
                    placeholder="Select Fuel Type"
                    label="Fuel Type"
                  />
                )}
              />
              {errors?.fuelType && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.fuelType.message}
                </p>
              )}
            </div>

            <Input
              {...register("horsePower")}
              type="number"
              label="Horse Power (HP)"
              placeholder="Enter HP"
              error={errors?.horsePower?.message}
              required
            />

            <div>
              <Controller
                name="numberOfCylinders"
                control={control}
                render={({ field }) => (
                  <Listbox
                    data={cylinderOptions}
                    value={
                      cylinderOptions.find(
                        (item) => item.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value)}
                    displayField="label"
                    placeholder="Select Cylinders"
                    label="Number of Cylinders"
                  />
                )}
              />
              {errors?.numberOfCylinders && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.numberOfCylinders.message}
                </p>
              )}
            </div>

            <Input
              {...register("cubicCapacity")}
              type="number"
              label="Cubic Capacity (CC)"
              placeholder="Enter CC"
              error={errors?.cubicCapacity?.message}
              required
            />

            <Input
              {...register("ratedRpm")}
              type="number"
              label="Rated RPM"
              placeholder="Enter Rated RPM"
              error={errors?.ratedRpm?.message}
              required
            />

            <div>
              <Controller
                name="aspiratedType"
                control={control}
                render={({ field }) => (
                  <Listbox
                    data={aspiratedTypeOptions}
                    value={
                      aspiratedTypeOptions.find(
                        (item) => item.value === field.value,
                      ) || null
                    }
                    onChange={(option: any) => field.onChange(option?.value)}
                    displayField="label"
                    placeholder="Select Aspirated Type"
                    label="Aspirated Type"
                  />
                )}
              />
              {errors?.aspiratedType && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.aspiratedType.message}
                </p>
              )}
            </div>

            <div>
              <Controller
                name="emissionNorms"
                control={control}
                render={({ field }) => (
                  <Listbox
                    data={emissionNormsOptions}
                    value={
                      emissionNormsOptions.find(
                        (item) => item.value === field.value,
                      ) || null
                    }
                    onChange={(option: any) => field.onChange(option?.value)}
                    displayField="label"
                    placeholder="Select Emission Norms"
                    label="Emission Norms"
                  />
                )}
              />
              {errors?.emissionNorms && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.emissionNorms.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cooling System Section */}
        <div className="mb-4 flex items-center gap-2">
          {/* <Filter className="text-primary-500 h-5 w-5" /> */}
          <h3 className="text-lg font-semibold">Cooling System</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          {coolingSystemOptions.map((option) => {
            const selected = watch("coolingSystem") === option.value;

            return (
              <label
                key={option.value}
                className={`relative flex min-w-[300px] cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                  selected
                    ? "border-primary-500"
                    : "hover:border-primary-300 border-primary"
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register("coolingSystem")}
                  className="absolute top-3 right-3 h-4 w-4"
                />

                <option.icon
                  className={`h-10 w-10 ${
                    selected ? "text-primary-500" : "text-gray-500"
                  }`}
                />

                <div>
                  <h4 className="font-medium">{option.label}</h4>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Air Filter Type Section */}
        <div className="">
          <div className="mb-4 flex items-center gap-2">
            {/* <Filter className="text-primary-500 h-5 w-5" /> */}
            <h3 className="text-lg font-semibold">Air Filter Type</h3>
          </div>
          <div className="flex flex-wrap gap-4">
           {airFilterTypeOptions.map((option) => {
  const selected = watch("airFilterType") === option.value;

  return (
    <label
      key={option.value}
      className={`relative flex min-w-[280px] cursor-pointer items-center gap-3 rounded-lg border p-4 ${
        selected
          ? "border-primary-500 bg-primary/10"
          : "hover:border-primary/50 border-primary"
      }`}
    >
                  <input
                    type="radio"
                    value={option.value}
                    {...register("airFilterType")}
                    className="hidden"
                  />

                  {selected && (
                    <CheckCircle className="text-primary absolute top-3 right-3 h-5 w-5" />
                  )}

                  <option.icon className="text-primary-500 h-10 w-10" />

                  <div>
                    <h4>{option.label}</h4>
                    <p className="text-sm text-gray-500">
                      {option.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
          {errors?.airFilterType && (
            <p className="mt-2 text-sm text-red-500">
              {errors.airFilterType.message}
            </p>
          )}
        </div>

        {/* Torque Details Section */}
        <div className="">
          <h3 className="mb-4 text-lg font-semibold">Torque Details</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              {...register("maximumTorque")}
              type="number"
              label="Maximum Torque (NM)"
              placeholder="Enter Maximum Torque"
              error={errors?.maximumTorque?.message}
            />
            <Input
              {...register("torqueRpm")}
              type="number"
              label="Torque RPM"
              placeholder="Enter Torque RPM"
              error={errors?.torqueRpm?.message}
            />
            <Input
              {...register("torqueBackup")}
              type="number"
              label="Torque Backup (%)"
              placeholder="Enter Torque Backup %"
              error={errors?.torqueBackup?.message}
              step="0.01"
            />
          </div>
        </div>

        {/* Engine Condition Section */}
        <div className="">
          <h3 className="mb-4 text-lg font-semibold">Engine Condition</h3>

          <div className="flex flex-wrap gap-6">
            {engineConditionOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3"
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register("engineCondition")}
                  className="mt-1 h-4 w-4"
                />
                <div>
                  <span className="font-medium">{option.label}</span>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
          {errors?.engineCondition && (
            <p className="mt-2 text-sm text-red-500">
              {errors.engineCondition.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="outlined"
          className="min-w-28"
          onClick={() => setCurrentStep(0)}
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
