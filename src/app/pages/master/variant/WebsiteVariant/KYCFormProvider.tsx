// Import Dependencies
import { useReducer } from "react";

// Local Imports
import {
  FormAction,
  FormState,
  KYCFormContextProvider,
} from "./KYCFormContext";

// ----------------------------------------------------------------------

const initialState: FormState = {
  formData: {
  BasicInformation: {
  // Basic Information
   categoryId: "",
  brandId: "",
  modelId: "",
  modelYearId: "",
  variantId: "",
  variantCode: "",
  brandName: "",
  modelName: "",
  variantName: "",
tractorCategory: "",
productName:"",
  productCode: "",
  skuCode: "",
  launchYear :"",
  modelYear :"",
  country: "",
  tractorStatus: "",
  
  driveType: "",
  // Short Description
  shortDescription: "",
  
  // Key Highlights
  highlights: {
    highlight1: "",
    highlight2: "",
    highlight3: "",
    highlight4: "",
    highlight5: "",
  },
  
  // Available Colors
  colors: {
    red: false,
    blue: false,
    green: false,
    orange: false,
    black: false,
    white: false,
    custom: false,
  },
customColorName: "",
customColorCode: "#ff0000",
showCustomColor: false,
  // Dealer Availability
  availableStates: [],
availableDistricts: [],
availableDealers: [],
  stockStatus: "",
  
  // SEO Details
  seoTitle: "",
  seoUrl: "",
  metaDescription: "",
  keywords: "",
},
   Enginedetails: {
  // Engine Details
  engineType: "",
  fuelType: "",
  horsePower: 0,
  numberOfCylinders: "",
  cubicCapacity: 0,
  ratedRpm: 0,
  aspiratedType: "",
  emissionNorms: "",
  
  // Cooling System
  coolingSystem: "",
  
  // Air Filter Type
  airFilterType: "",
  
  // Torque Details
  maximumTorque: null,
  torqueRpm: null,
  torqueBackup: null,
  
  // Engine Condition
  engineCondition: "",
},
  Transmission: {
  // Clutch
  clutchType: "",
  
  // Gear Box
  forwardGears: 0,
  reverseGears: 0,
  gearType: "",
  
  // Transmission Type
  transmissionType: "",
  
  // PTO Details
  ptoHp: 0,
  ptoRpm: 0,
  ptoType: "",
  ptoPosition: "",
  
  // Additional Features
  features: {
    creeperGears: false,
    shuttleShift: false,
    sideShiftGear: false,
    powerShuttle: false,
    hiLoGears: false,
    multiSpeedPto: false,
    reversePto: false,
    superReducer: false,
  },
},
HydraulicTyres: {
  // Hydraulic System
  liftingCapacity: 0,
  liftingCapacityAt610mm: "",

  hydraulicType: "",
  addc: false,
  positionControl: false,
  draftControl: false,

  // Control Type
  controlType: "",

  // Remote Valve
  remoteValveType: "",
  numberOfRemoteValves: "",

  // Linkage Section
  threePointLinkage: "",
  linkageCategory: "",
  topLink: "",
  draftSensitivity: "",

  // Additional Features
  features: {
    externalHydraulicCylinder: false,
    selfLevelling: false,
    quickHitch: false,
    downPositionControl: false,
    loadSensing: false,
    flowControl: false,
    returnToDepth: false,
    transportLock: false,
  },
},
    PriceLocation: {
  // Pricing Details
  exShowroomPrice: null,
  onRoadPrice: null,
  currency: "INR",
  gst: 18,
  tcsApplicable: "no",
  tcsPercentage: null,
  financeAvailable:"yes",
  emiAvailable: "yes",
  downPayment: null,
  offerPrice: null,
  negotiable: "no",
    exchangeOffer: "no",
  // Location Details
  country:"",
  state: "",
  district: "",
  taluka: "",
  city: "",
  pincode: "",
  landmark: "",
  fullAddress: "",
  searchLocation: "",
  latitude: null,
  longitude: null,
},
   MediaDocumnet: {
  // Images
  frontView: null,
  leftView: null,
  rightView: null,
  rearView: null,
  engineView: null,
  dashboardView: null,
  tyreView: null,
  hydraulicView: null,
  ptoView: null,
  chassisNumber: null,
  rcBook: null,
  additionalImage1: null,
  additionalImage2: null,
  additionalImage3: null,
  additionalImage4: null,
  additionalImage5: null,
  
  // Videos
  walkaroundVideo: null,
  walkaroundVideoLink: "",
  engineStartVideo: null,
  engineStartVideoLink: "",
  ptoDemoVideo: null,
  ptoDemoVideoLink: "",
  hydraulicDemoVideo: null,
  hydraulicDemoVideoLink: "",
  
  // Documents
  brochure: null,
  warrantyCard: null,
  insuranceCertificate: null,
  invoice: null,
  others: null,
},
     PreviewSubmit: {
  agreed: false,
},
  },
  stepStatus: {
    BasicInformation: {
      isDone: false,
    },
    Enginedetails: {
      isDone: false,
    },
    Transmission: {
      isDone: false,
    },
     HydraulicTyres: {
      isDone: false,
    },
     PriceLocation: {
      isDone: false,
    },
    MediaDocumnet: {
      isDone: false,
    },
     PreviewSubmit: {
      isDone: false,
    },
  },
};

const reducer = (state: FormState, action: FormAction) => {
  switch (action.type) {
    case "SET_FORM_DATA":
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };
    case "SET_STEP_STATUS":
      return {
        ...state,
        stepStatus: {
          ...state.stepStatus,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

export function KYCFormProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return (
    <KYCFormContextProvider value={value}>{children}</KYCFormContextProvider>
  );
}
