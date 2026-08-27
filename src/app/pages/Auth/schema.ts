import * as Yup from "yup";

export interface AuthFormValues {
  email: string;
  password: string;
}

export const schema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Invalid Email")
    .required("Email Required"),

  password: Yup.string()
    .trim()
    .required("Password Required"),
});