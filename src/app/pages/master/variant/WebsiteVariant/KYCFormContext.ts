import { createSafeContext } from "@/utils/createSafeContext";
import {
  EnginedetailsType,
  HydraulicTyresType,
  TransmissionType,
  BasicInformationType,
  PriceLocationType,
  MediaDocumnetType,
  PreviewSubmitType
} from "./schema";
import { Dispatch } from "react";

export interface StepStatus {
  isDone: boolean;
}

export type StepKey =
  | "BasicInformation"
  | "Enginedetails"
  | "Transmission"
  | "HydraulicTyres"
  |  "PriceLocation"
  |  "MediaDocumnet"
  | "PreviewSubmit";

export interface FormState {
  readonly formData: {
    BasicInformation: BasicInformationType;
    Enginedetails: EnginedetailsType;
    Transmission: TransmissionType;
    HydraulicTyres: HydraulicTyresType;
    PriceLocation : PriceLocationType;
    MediaDocumnet  :MediaDocumnetType;
    PreviewSubmit : PreviewSubmitType;
  };
  readonly stepStatus: {
    [key in StepKey]: StepStatus;
  };
}

export type FormAction =
  | { type: "SET_FORM_DATA"; payload: Partial<FormState["formData"]> }
  | { type: "SET_STEP_STATUS"; payload: Partial<FormState["stepStatus"]> };

export interface AddProductFormContextType {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

export const [KYCFormContextProvider, useKYCFormContext] =
  createSafeContext<AddProductFormContextType>(
    "useKYCFormContext must be used within a KYCFormContextProvider",
  );
