// Import Dependencies
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import * as Yup from "yup";

// ----------------------------------------------------------------------

dayjs.extend(isBetween);

export type DocumentType = "passport" | "driverLicense" | "nationalID";

export const BasicInformationSchema = Yup.object().shape({
  // Basic Information
  brandId: Yup.string().trim().required("Brand Name Required"),
  modelId: Yup.string().trim().required("Model Name Required"),
  variantId: Yup.string().required("Variant Name is required"),

categoryId: Yup.string().required("Tractor Category is required"),
productName : Yup.string().required("Tractor Product Name is required"),
  productCode: Yup.string().trim(),
  skuCode: Yup.string().trim(),
  launchYear: Yup.string().nullable(),
  modelYearId: Yup.string().required("Model Year is required"),
  country: Yup.string()
  .trim()
  .required("Country is required"),
  tractorStatus: Yup.string().trim().required("Tractor Status Required"),
  
  // Short Description
  shortDescription: Yup.string().trim().max(200, "Maximum 200 characters allowed"),
  
  // Key Highlights
  highlights: Yup.object().shape({
    highlight1: Yup.string().trim(),
    highlight2: Yup.string().trim(),
    highlight3: Yup.string().trim(),
    highlight4: Yup.string().trim(),
    highlight5: Yup.string().trim(),
  }),
  
  // Available Colors
 colors: Yup.object()
  .shape({
    red: Yup.boolean(),
    blue: Yup.boolean(),
    green: Yup.boolean(),
    orange: Yup.boolean(),
    black: Yup.boolean(),
    white: Yup.boolean(),
    custom: Yup.boolean(),
  })
  .test(
    "at-least-one-color",
    "Please select at least one color",
    (value) => {
      if (!value) return false;

      return Object.values(value).some((selected) => selected === true);
    }
  ),
  customColorName: Yup.string().when("colors.custom", {
  is: true,
  then: (schema) =>
    schema.trim().required("Please enter custom color name"),
  otherwise: (schema) => schema.trim().nullable(),
}),

customColorCode: Yup.string().when("colors.custom", {
  is: true,
  then: (schema) =>
    schema.required("Please select custom color"),
  otherwise: (schema) => schema.nullable(),
}),

showCustomColor: Yup.boolean(),
  
  // Dealer Availability
  availableStates: Yup.array()
  .ensure()
  .of(Yup.string())
  .min(1, "Please select at least one state"),

availableDistricts: Yup.array()
  .ensure()
  .of(Yup.string())
  .min(1, "Please select at least one district"),

availableDealers: Yup.array()
  .ensure()
  .of(Yup.string())
  .min(1, "Please select at least one dealer"),
  stockStatus: Yup.string().trim().required("Stock Status Required"),
  
  // SEO Details
  seoTitle: Yup.string().trim(),
  seoUrl: Yup.string().trim(),
  metaDescription: Yup.string().trim().max(160, "Maximum 160 characters allowed"),
  keywords: Yup.string().trim(),
});

export const EnginedetailsSchema = Yup.object().shape({
  // Engine Details
  engineType: Yup.string().trim().required("Engine Type Required"),
  fuelType: Yup.string().trim().required("Fuel Type Required"),
  horsePower: Yup.number()
    .typeError("Horse Power must be a number")
    .positive("Horse Power must be positive")
    .required("Horse Power Required"),
  numberOfCylinders: Yup.string().trim().required("Number of Cylinders Required"),
  cubicCapacity: Yup.number()
    .typeError("Cubic Capacity must be a number")
    .positive("Cubic Capacity must be positive")
    .required("Cubic Capacity Required"),
  ratedRpm: Yup.number()
    .typeError("Rated RPM must be a number")
    .positive("Rated RPM must be positive")
    .required("Rated RPM Required"),
  aspiratedType: Yup.string().trim().required("Aspirated Type Required"),
  emissionNorms: Yup.string().trim().required("Emission Norms Required"),
  
  // Cooling System
  coolingSystem: Yup.string().trim().required("Cooling System Required"),
  
  // Air Filter Type
  airFilterType: Yup.string().trim().required("Air Filter Type Required"),
  
  // Torque Details (Optional)
  maximumTorque: Yup.number()
    .typeError("Maximum Torque must be a number")
    .nullable(),
  torqueRpm: Yup.number()
    .typeError("Torque RPM must be a number")
    .nullable(),
  torqueBackup: Yup.number()
    .typeError("Torque Backup must be a number")
    .nullable(),
  
  // Engine Condition
  engineCondition: Yup.string().trim().required("Engine Condition Required"),
});


export const TransmissionSchema = Yup.object().shape({
  // Clutch
  clutchType: Yup.string().trim().required("Clutch Type Required"),
  
  // Gear Box
  forwardGears: Yup.number()
    .typeError("Forward Gears must be a number")
    .positive("Forward Gears must be positive")
    .required("Forward Gears Required"),
  reverseGears: Yup.number()
    .typeError("Reverse Gears must be a number")
    .positive("Reverse Gears must be positive")
    .required("Reverse Gears Required"),
  gearType: Yup.string().trim().required("Gear Type Required"),
  
  // Transmission Type
  transmissionType: Yup.string().trim().required("Transmission Type Required"),
  
  // PTO Details
  ptoHp: Yup.number()
    .typeError("PTO HP must be a number")
    .positive("PTO HP must be positive")
    .required("PTO HP Required"),
  ptoRpm: Yup.number()
    .typeError("PTO RPM must be a number")
    .positive("PTO RPM must be positive")
    .required("PTO RPM Required"),
  ptoType: Yup.string().trim().required("PTO Type Required"),
  ptoPosition: Yup.string().trim().required("PTO Position Required"),
  
  // Additional Features
  features: Yup.object().shape({
    creeperGears: Yup.boolean(),
    shuttleShift: Yup.boolean(),
    sideShiftGear: Yup.boolean(),
    powerShuttle: Yup.boolean(),
    hiLoGears: Yup.boolean(),
    multiSpeedPto: Yup.boolean(),
    reversePto: Yup.boolean(),
    superReducer: Yup.boolean(),
  }),
});

export const HydraulicTyresSchema = Yup.object().shape({
  // Hydraulic System
  liftingCapacity: Yup.number()
    .typeError("Lifting capacity must be a number")
    .positive("Lifting capacity must be positive")
    .required("Lifting Capacity Required"),
  hydraulicType: Yup.string().trim(),
  addc: Yup.boolean(),
  positionControl: Yup.boolean(),
  draftControl: Yup.boolean(),
  liftingCapacityAt610mm: Yup.string().nullable(),
  // Control Type
  controlType: Yup.string().trim(),
  threePointLinkage: Yup.string().required("Please select linkage type"),
linkageCategory: Yup.string().required("Please select linkage category"),
topLink: Yup.string().required("Please select top link"),
draftSensitivity: Yup.string().required("Please select draft sensitivity"),
  // Remote Valve
  remoteValveType: Yup.string().trim(),
  numberOfRemoteValves: Yup.string().trim(),
  
  // Additional Features
  features: Yup.object().shape({
    externalHydraulicCylinder: Yup.boolean(),
    selfLevelling: Yup.boolean(),
    quickHitch: Yup.boolean(),
    downPositionControl: Yup.boolean(),
    loadSensing: Yup.boolean(),
    flowControl: Yup.boolean(),
    returnToDepth: Yup.boolean(),
    transportLock: Yup.boolean(),
  }),
});
export const PriceLocationSchema = Yup.object().shape({
  // Pricing Details
exShowroomPrice: Yup.number()
  .transform((value, originalValue) =>
    originalValue === "" ? undefined : value
  )
  .typeError("Ex-Showroom Price must be a number")
  .required("Ex-Showroom Price Required")
  .moreThan(0, "Ex-Showroom Price must be greater than 0"),
  onRoadPrice: Yup.number()
    .typeError("On-Road Price must be a number")
    .positive("On-Road Price must be positive")
    .nullable(),
  currency: Yup.string().trim().required("Currency Required"),
  gst: Yup.number()
    .typeError("GST must be a number")
    .min(0, "GST cannot be negative")
    .default(18),
  tcsApplicable: Yup.string().trim().oneOf(["yes", "no"]),
  tcsPercentage: Yup.number()
    .typeError("TCS Percentage must be a number")
    .min(0, "TCS Percentage cannot be negative")
    .when("tcsApplicable", {
      is: "yes",
      then: (schema) => schema.required("TCS Percentage Required"),
      otherwise: (schema) => schema.nullable(),
    }),
    exchangeOffer: Yup.string()
  .trim()
  .oneOf(["yes", "no"])
  .required("Exchange Offer Required"),
  financeAvailable: Yup.string()
    .trim()
    .oneOf(["yes", "no"])
    .required("Finance Availability Required"),
  emiAvailable: Yup.string()
    .trim()
    .oneOf(["yes", "no"])
    .required("EMI Availability Required"),
  downPayment: Yup.number()
    .typeError("Down Payment must be a number")
    .positive("Down Payment must be positive")
    .nullable(),
  offerPrice: Yup.number()
    .typeError("Offer Price must be a number")
    .positive("Offer Price must be positive")
    .when("negotiable", {
      is: "yes",
      then: (schema) => schema.nullable(),
      otherwise: (schema) => schema.nullable(),
    }),
  negotiable: Yup.string().trim().oneOf(["yes", "no"]),
  
  // Location Details
    country: Yup.string().trim().required("Country is required "),
  state: Yup.string().trim().required("State Required"),
  district: Yup.string().trim().required("District Required"),
  taluka: Yup.string().trim(),
  city: Yup.string().trim().required("City/Village Required"),
  pincode: Yup.string()
    .trim()
    .matches(/^[1-9][0-9]{5}$/, "Enter a valid pincode")
    .required("Pincode Required"),
  landmark: Yup.string().trim(),
  fullAddress: Yup.string().trim().required("Full Address Required"),
  searchLocation: Yup.string().trim(),
  // Map coordinates
  latitude: Yup.number().nullable(),
  longitude: Yup.number().nullable(),
});
export const MediaDocumnetSchema = Yup.object().shape({
  // Images
  frontView: Yup.mixed().required("Front View image is required"),
  leftView: Yup.mixed().required("Left View image is required"),
  rightView: Yup.mixed().required("Right View image is required"),
  rearView: Yup.mixed().required("Rear View image is required"),
  engineView: Yup.mixed().required("Engine View image is required"),
  dashboardView: Yup.mixed().required("Dashboard View image is required"),
  tyreView: Yup.mixed().required("Tyre View image is required"),
  hydraulicView: Yup.mixed().required("Hydraulic View image is required"),
  ptoView: Yup.mixed().required("PTO View image is required"),
  chassisNumber: Yup.mixed().required("Chassis Number image is required"),
  rcBook: Yup.mixed().required("RC Book image is required"),
  additionalImage1: Yup.mixed().nullable(),
  additionalImage2: Yup.mixed().nullable(),
  additionalImage3: Yup.mixed().nullable(),
  additionalImage4: Yup.mixed().nullable(),
  additionalImage5: Yup.mixed().nullable(),
  
  // Videos (optional)
  walkaroundVideo: Yup.mixed().nullable(),
  walkaroundVideoLink: Yup.string().url("Invalid YouTube URL").nullable(),
  engineStartVideo: Yup.mixed().nullable(),
  engineStartVideoLink: Yup.string().url("Invalid YouTube URL").nullable(),
  ptoDemoVideo: Yup.mixed().nullable(),
  ptoDemoVideoLink: Yup.string().url("Invalid YouTube URL").nullable(),
  hydraulicDemoVideo: Yup.mixed().nullable(),
  hydraulicDemoVideoLink: Yup.string().url("Invalid YouTube URL").nullable(),
  
  // Documents
  brochure: Yup.mixed().required("Brochure / Spec Sheet is required"),
  warrantyCard: Yup.mixed().required("Warranty Card is required"),
  insuranceCertificate: Yup.mixed().required("Insurance Certificate is required"),
  invoice: Yup.mixed().required("Invoice is required"),
  others: Yup.mixed().nullable(),
});
export const PreviewSubmitSchema = Yup.object().shape({
  agreed: Yup.boolean()
    .oneOf([true], "You must agree to the terms and conditions to submit")
    .required("Agreement required"),
});
export type BasicInformationType = {
  // Basic Information
   categoryId?: number | string;
  brandId?: number | string;
  modelId?: number | string;
  modelYearId?: number | string;
  variantId?: number | string;

  variantCode?: string;
  brandName: string;
  modelName: string;
  variantName: string;
  tractorCategory: string;
  productName: string;
  productCode?: string;
  skuCode?: string;
    launchYear?: string;
    modelYear?: string;
  country?: string;
  tractorStatus: string;
  
  // Short Description
  shortDescription?: string;
  
  // Key Highlights
  highlights: {
    highlight1?: string;
    highlight2?: string;
    highlight3?: string;
    highlight4?: string;
    highlight5?: string;
  };
  
  // Available Colors
  colors: {
    red?: boolean;
    blue?: boolean;
    green?: boolean;
    orange?: boolean;
    black?: boolean;
    white?: boolean;
    custom?: boolean;
  };
  customColorName?: string | null;
customColorCode?: string | null;
showCustomColor?: boolean;
  
  // Dealer Availability
 availableStates: string[];
availableDistricts: string[];
availableDealers: string[];
  stockStatus: string;
  
  // SEO Details
  seoTitle?: string;
  seoUrl?: string;
  metaDescription?: string;
  keywords?: string;
};

export type AddressDetails = {
  country: string;
  city: string;
  state: string;
  zipCode: string;
  addressLine1: string;
  addressLine2?: string;
};

export type EnginedetailsType = {
  // Engine Details
  engineType: string;
  fuelType: string;
  horsePower: number;
  numberOfCylinders: string;
  cubicCapacity: number;
  ratedRpm: number;
  aspiratedType: string;
  emissionNorms: string;
  
  // Cooling System
  coolingSystem: string;
  
  // Air Filter Type
  airFilterType: string;
  
  // Torque Details
  maximumTorque?: number | null;
  torqueRpm?: number | null;
  torqueBackup?: number | null;
  
  // Engine Condition
  engineCondition: string;
};

export type TransmissionType = {
  // Clutch
  clutchType: string;
  
  // Gear Box
  forwardGears: number;
  reverseGears: number;
  gearType: string;
  
  // Transmission Type
  transmissionType: string;
  
  // PTO Details
  ptoHp: number;
  ptoRpm: number;
  ptoType: string;
  ptoPosition: string;
  
  // Additional Features
  features: {
    creeperGears?: boolean;
    shuttleShift?: boolean;
    sideShiftGear?: boolean;
    powerShuttle?: boolean;
    hiLoGears?: boolean;
    multiSpeedPto?: boolean;
    reversePto?: boolean;
    superReducer?: boolean;
  };
};

export type HydraulicTyresType = {
  // Hydraulic System
  liftingCapacity: number;
  hydraulicType?: string;
  addc?: boolean;
  positionControl?: boolean;
  draftControl?: boolean;
  liftingCapacityAt610mm?: string;
  // Control Type
  controlType?: string;
  threePointLinkage?: string;
linkageCategory?: string;
topLink?: string;
draftSensitivity?: string;
  // Remote Valve
  remoteValveType?: string;
  numberOfRemoteValves?: string;
  
  // Additional Features
  features: {
    externalHydraulicCylinder?: boolean;
    selfLevelling?: boolean;
    quickHitch?: boolean;
    downPositionControl?: boolean;
    loadSensing?: boolean;
    flowControl?: boolean;
    returnToDepth?: boolean;
    transportLock?: boolean;
  };
};

export type PriceLocationType = {
  // Pricing Details
  exShowroomPrice: number | null;
  onRoadPrice?: number | null;
  currency: string;
  gst?: number | null;
  tcsApplicable?: string;
  tcsPercentage?: number | null;
  financeAvailable: string;
  emiAvailable: string;
  downPayment?: number | null;
  offerPrice?: number | null;
  negotiable?: string;
    exchangeOffer: string;
  // Location Details
  country : string;
  state: string;
  district: string;
  taluka?: string;
  city: string;
  pincode: string;
  landmark?: string;
  fullAddress: string;
  searchLocation?: string;
  latitude?: number | null;
  longitude?: number | null;
};
export type MediaDocumnetType = {
  // Images
  frontView: File | null;
  leftView: File | null;
  rightView: File | null;
  rearView: File | null;
  engineView: File | null;
  dashboardView: File | null;
  tyreView: File | null;
  hydraulicView: File | null;
  ptoView: File | null;
  chassisNumber: File | null;
  rcBook: File | null;
  additionalImage1?: File | null;
  additionalImage2?: File | null;
  additionalImage3?: File | null;
  additionalImage4?: File | null;
  additionalImage5?: File | null;
  
  // Videos
  walkaroundVideo?: File | null;
  walkaroundVideoLink?: string;
  engineStartVideo?: File | null;
  engineStartVideoLink?: string;
  ptoDemoVideo?: File | null;
  ptoDemoVideoLink?: string;
  hydraulicDemoVideo?: File | null;
  hydraulicDemoVideoLink?: string;
  
  // Documents
  brochure: File | null;
  warrantyCard: File | null;
  insuranceCertificate: File | null;
  invoice: File | null;
  others?: File | null;
};
export type PreviewSubmitType = {
  agreed: boolean;
};